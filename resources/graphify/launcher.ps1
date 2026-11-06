$ErrorActionPreference='Stop'
$states=@();$state=$null
try {
  foreach($name in $Pins.Keys){$path=Join-Path $Resources $name;$item=Get-Item -LiteralPath $path -Force;if($item.Attributes -band [IO.FileAttributes]::ReparsePoint -or $item.LinkType -eq 'HardLink' -or (Get-FileHash -LiteralPath $path).Hash.ToLowerInvariant() -cne $Pins[$name]){throw 'GRAPH_RESOURCE_CHANGED'}}
  . (Join-Path $Resources 'preflight.ps1')
  . (Join-Path $Resources 'supervision.ps1')
  Assert-BmadChain $TaskFolder
  $assembly=Get-Content -LiteralPath (Join-Path $Resources 'assembly.json') -Raw|ConvertFrom-Json
  Assert-GraphClosedRuntime (Join-Path $Resources 'assembly/runtime') $assembly.runtime
  Assert-GraphClosedRuntime (Join-Path $Resources 'assembly/packages') $assembly.packages
  $request=Get-Content -LiteralPath (Join-Path $TaskFolder 'request.json') -Raw|ConvertFrom-Json -AsHashtable
  function Run-GraphChild($Script,$Arguments,$Label){
    if(Test-Path -LiteralPath (Join-Path $TaskFolder 'cancel')){throw 'CANCELLED_BEFORE_CHILD'}
    $python=Join-Path $Resources 'assembly/runtime/python.exe'
    $start=[Diagnostics.ProcessStartInfo]::new($python)
    foreach($arg in @('-I','-S','-B','-X','utf8','-c',$Script,$Resources,$Arguments)){[void]$start.ArgumentList.Add($arg)}
    $start.WorkingDirectory=$TaskFolder;$start.UseShellExecute=$false;$start.CreateNoWindow=$true;$start.Environment.Clear()
    foreach($name in @('SYSTEMROOT','WINDIR')){if([Environment]::GetEnvironmentVariable($name)){$start.Environment[$name]=[Environment]::GetEnvironmentVariable($name)}}
    $graphHome=Join-Path $TaskFolder 'home';$tmp=Join-Path $TaskFolder 'tmp';[void][IO.Directory]::CreateDirectory($graphHome);[void][IO.Directory]::CreateDirectory($tmp)
    foreach($name in @('HOME','USERPROFILE','APPDATA','LOCALAPPDATA','XDG_CACHE_HOME','XDG_CONFIG_HOME','TIKTOKEN_CACHE_DIR','HF_HOME')){$start.Environment[$name]=$graphHome}
    foreach($name in @('TEMP','TMP')){$start.Environment[$name]=$tmp}
    $start.Environment['PYTHONHASHSEED']='0';$start.Environment['GRAPHIFY_BACKEND']='none';$start.Environment['GRAPHIFY_NO_AUTO_REFRESH']='1';$start.Environment['GRAPHIFY_OUT']='graphify-out'
    $script:state=$null
    try {
      $current=Invoke-BmadSupervised $start 120000 (Join-Path $TaskFolder ($Label+'-execution.json')) @() $TaskFolder (Join-Path $TaskFolder ($Label+'-stdout.json')) (Join-Path $TaskFolder ($Label+'-stderr.log')) '' ([ref]$script:state) (Join-Path $TaskFolder 'cancel')
    } finally {
      # One observation per attempted child, including a throw before supervision can return.
      # A null observation remains an unknown attempt; it never proves never-started.
      $script:states+=,$script:state
    }
    if($current.outcome -ne 'completed' -or $current.exit -ne 0){throw ('GRAPH_CHILD_'+$current.outcome)}
  }
  $captureScript='import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()'
  if($request.op -eq 'analyze'){
    $analysis=Join-Path $TaskFolder 'analysis';[void][IO.Directory]::CreateDirectory($analysis)
    $workerRequest=@{assembly=(Join-Path $Resources 'assembly.json');resources=$Resources;analysis=$analysis;project=(Join-Path $request.prepared 'mirror');harness=@()}
    [IO.File]::WriteAllText((Join-Path $TaskFolder 'worker-request.json'),($workerRequest|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false))
    Run-GraphChild 'import sys,runpy;p=sys.argv[1]+"/worker.py";sys.argv=[p,sys.argv[2]];runpy.run_path(p,run_name="__main__")' (Join-Path $TaskFolder 'worker-request.json') 'analysis'
    $worker=Get-Content -LiteralPath (Join-Path $analysis 'worker.json') -Raw|ConvertFrom-Json
    if($worker.outcome -ne 'completed'){throw 'GRAPHIFY_FAILED'}
    $graph=Join-Path $analysis 'out/graphify-out/graph.json'
    if(-not (Test-Path -LiteralPath $graph -PathType Leaf)){throw 'GRAPH_OUTPUT_MISSING'}
    [GraphClosedRuntime]::CopyArtifact($graph,(Join-Path $TaskFolder 'native-graph.json'))
    Run-GraphChild $captureScript (@{op='terminal';prepared=$request.prepared}|ConvertTo-Json -Compress) 'terminal-capture'
    [IO.File]::Copy((Join-Path $TaskFolder 'terminal-capture-stdout.json'),(Join-Path $TaskFolder 'result.json'),$false)
  }else{
    Run-GraphChild $captureScript ($request|ConvertTo-Json -Depth 20 -Compress) 'capture'
    [IO.File]::Copy((Join-Path $TaskFolder 'capture-stdout.json'),(Join-Path $TaskFolder 'result.json'),$false)
  }
}catch{[IO.File]::WriteAllText((Join-Path $TaskFolder 'launcher-error.txt'),$_.Exception.Message)}finally{
  $known=$true;$assigned=$false;$started=$false;$unknownStart=$false
  foreach($s in $states){
    if($null -eq $s -or -not $s.Contains('started') -or $s.started -isnot [bool]){$known=$false;$unknownStart=$true;continue}
    if($s.started){$started=$true;if($s.job_assigned_before_resume -eq $true -and $s.Contains('job_active_after_stop') -and $s.job_active_after_stop -is [int] -and $s.job_active_after_stop -eq 0){$assigned=$true}else{$known=$false}}
  }
  $terminal=@{schemaVersion=1;generation=$Generation;purpose='graph-code-only';terminal=$true;jobAssigned=$assigned;jobActive=$(if($known){0}else{$null});neverStarted=(-not $started -and -not $unknownStart)}
  $path=Join-Path $TaskFolder 'terminal.json';[IO.File]::WriteAllText(($path+'.next'),($terminal|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false));[IO.File]::Move(($path+'.next'),$path,$true)
}
