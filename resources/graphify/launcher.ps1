$ErrorActionPreference='Stop'
$states=@();$state=$null;$artifact=$null;$artifactReady=$false;$mirror=$null
try {
  foreach($name in $Pins.Keys){$path=Join-Path $Resources $name;$item=Get-Item -LiteralPath $path -Force;if($item.Attributes -band [IO.FileAttributes]::ReparsePoint -or $item.LinkType -eq 'HardLink' -or (Get-FileHash -LiteralPath $path).Hash.ToLowerInvariant() -cne $Pins[$name]){throw 'GRAPH_RESOURCE_CHANGED'}}
  . (Join-Path $Resources 'preflight.ps1')
  . (Join-Path $Resources 'supervision.ps1')
  Assert-BmadChain $TaskFolder
  $assembly=Get-Content -LiteralPath (Join-Path $Resources 'assembly.json') -Raw|ConvertFrom-Json
  try {
    Assert-GraphClosedRuntime (Join-Path $Resources 'assembly/runtime') $assembly.runtime
    Assert-GraphClosedRuntime (Join-Path $Resources 'assembly/packages') $assembly.packages
  } catch { throw ('GRAPH_RESOURCE_CHANGED: '+$_.Exception.Message) }
  $requestPath=Join-Path $TaskFolder 'request.json'
  if($AnalysisRequestSha){
    Assert-BmadChain $requestPath
    $stream=[IO.File]::Open($requestPath,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
    try {
      if($stream.Length -gt 65536){throw 'GRAPH_MIRROR_OWNER'}
      $requestBytes=[byte[]]::new([int]$stream.Length)
      $stream.ReadExactly($requestBytes)
      if($stream.ReadByte() -ne -1 -or [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($requestBytes)).ToLowerInvariant() -cne $AnalysisRequestSha){throw 'GRAPH_MIRROR_OWNER'}
      $request=[Text.UTF8Encoding]::new($false,$true).GetString($requestBytes)|ConvertFrom-Json -AsHashtable
    } finally {$stream.Dispose()}
  } else {
    $request=Get-Content -LiteralPath $requestPath -Raw|ConvertFrom-Json -AsHashtable
  }
  if($request.op -isnot [string] -or $request.op -cnotin @('analyze','capture','revalidate','files-read','files-verify') -or (($request.op -ceq 'analyze') -ne [bool]$AnalysisRequestSha)){throw 'GRAPH_MIRROR_OWNER'}
  function Run-GraphChild($Script,$Arguments,$Label,[int]$BudgetMs=120000,[ref]$BinaryOutput){
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
      $binary=@{}
      if($null -ne $BinaryOutput){$binary.BinaryOutput=$BinaryOutput}
      $current=Invoke-BmadSupervised $start $BudgetMs (Join-Path $TaskFolder ($Label+'-execution.json')) @() $TaskFolder (Join-Path $TaskFolder ($Label+'-stdout.json')) (Join-Path $TaskFolder ($Label+'-stderr.log')) '' ([ref]$script:state) (Join-Path $TaskFolder 'cancel') @binary
    } finally {
      # One observation per attempted child, including a throw before supervision can return.
      # A null observation remains an unknown attempt; it never proves never-started.
      $script:states+=,$script:state
    }
    if($current.outcome -ceq 'completed' -and $current.exit -eq 2 -and $request.op -cin @('capture','revalidate') -and $Label -ceq 'capture'){
      $refusal=$null
      try {
        $receipt=Join-Path $TaskFolder 'capture-stdout.json'
        $stream=[IO.File]::Open($receipt,[IO.FileMode]::Open,[IO.FileAccess]::Read,[IO.FileShare]::Read)
        try {
          if($stream.Length -le 512){
            $bytes=[byte[]]::new([int]$stream.Length)
            $stream.ReadExactly($bytes)
            $value=[Text.UTF8Encoding]::new($false,$true).GetString($bytes)|ConvertFrom-Json -AsHashtable
            if($value -is [System.Collections.IDictionary] -and $value.Count -eq 1 -and $value.error -is [string]){
              $refusal=$value.error
            }
          }
        } finally { $stream.Dispose() }
      } catch {}
      if($refusal -cin @('DEPTH_LIMIT','INVENTORY_LIMIT','SOURCE_COUNT_LIMIT','SOURCE_TOTAL_LIMIT','FILE_LIMIT','NO_CODE_SOURCES')){throw $refusal}
    }
    if($current.outcome -ne 'completed' -or $current.exit -ne 0){throw ('GRAPH_CHILD_'+$current.outcome)}
  }
  $captureScript='import sys;sys.path.insert(0,sys.argv[1]);import graph_capture;graph_capture.main()'
  if($AnalysisRequestSha){
    # The supervisor inherits handles to install the child's own streams.
    [GraphClosedRuntime]::ProtectArtifactOutput()
    $mirror=[GraphClosedRuntime]::CreateMirror($TaskFolder,[uint32]$request.taskVolume,[uint64]$request.taskIndex,[uint64]$request.taskCreationTicks)
    $sourceRequest=@{op='mirror-input';prepared=$request.prepared;receiptSha=$request.receiptSha;rootIdentity=$request.rootIdentity;revision=$request.revision}
    $payload=$null
    Run-GraphChild $captureScript ($sourceRequest|ConvertTo-Json -Compress) 'mirror-input' -BinaryOutput ([ref]$payload)
    if($payload -isnot [byte[]]){throw 'GRAPH_MIRROR_INPUT'}
    if(Test-Path -LiteralPath (Join-Path $TaskFolder 'cancel')){throw 'CANCELLED_BEFORE_CHILD'}
    $mirror.Materialize($payload)
    $payload=$null
    $analysis=Join-Path $TaskFolder 'analysis';[void][IO.Directory]::CreateDirectory($analysis)
    $workerRequest=@{assembly=(Join-Path $Resources 'assembly.json');resources=$Resources;analysis=$analysis;project=$mirror.Path;harness=@()}
    [IO.File]::WriteAllText((Join-Path $TaskFolder 'worker-request.json'),($workerRequest|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false))
    Run-GraphChild 'import sys,runpy;p=sys.argv[1]+"/worker.py";sys.argv=[p,sys.argv[2]];runpy.run_path(p,run_name="__main__")' (Join-Path $TaskFolder 'worker-request.json') 'analysis' 360000
    $worker=Get-Content -LiteralPath (Join-Path $analysis 'worker.json') -Raw|ConvertFrom-Json
    if($worker.outcome -ne 'completed'){throw 'GRAPHIFY_FAILED'}
    $graph=Join-Path $analysis 'out/graphify-out/graph.json'
    if(-not (Test-Path -LiteralPath $graph -PathType Leaf)){throw 'GRAPH_OUTPUT_MISSING'}
    $artifact=[GraphClosedRuntime]::ReadArtifact($graph)
    Run-GraphChild $captureScript (@{op='terminal';prepared=$request.prepared}|ConvertTo-Json -Compress) 'terminal-capture'
    [IO.File]::Copy((Join-Path $TaskFolder 'terminal-capture-stdout.json'),(Join-Path $TaskFolder 'result.json'),$false)
    $artifactReady=$true
  }else{
    Run-GraphChild $captureScript ($request|ConvertTo-Json -Depth 20 -Compress) 'capture'
    [IO.File]::Copy((Join-Path $TaskFolder 'capture-stdout.json'),(Join-Path $TaskFolder 'result.json'),$false)
  }
}catch{[IO.File]::WriteAllText((Join-Path $TaskFolder 'launcher-error.txt'),$_.Exception.Message)}finally{
  $publish=$false
  try {
    $known=$true;$assigned=$false;$started=$false;$unknownStart=$false
    foreach($s in $states){
      if($null -eq $s -or -not $s.Contains('started') -or $s.started -isnot [bool]){$known=$false;$unknownStart=$true;continue}
      if($s.started){$started=$true;if($s.job_assigned_before_resume -eq $true -and $s.Contains('job_active_after_stop') -and $s.job_active_after_stop -is [int] -and $s.job_active_after_stop -eq 0){$assigned=$true}else{$known=$false}}
    }
    $terminal=@{schemaVersion=1;generation=$Generation;purpose='graph-code-only';terminal=$true;jobAssigned=$assigned;jobActive=$(if($known){0}else{$null});neverStarted=(-not $started -and -not $unknownStart)}
    $terminalPath=Join-Path $TaskFolder 'terminal.json'
    $publish=$artifactReady -and $known -and $assigned
    $path=if($publish){Join-Path $TaskFolder 'job-terminal.json'}else{$terminalPath}
    [IO.File]::WriteAllText(($path+'.next'),($terminal|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false));[IO.File]::Move(($path+'.next'),$path,$true)
    if($publish){
      try { $artifact.Publish($Generation) }
      catch { [IO.File]::WriteAllText((Join-Path $TaskFolder 'launcher-error.txt'),$_.Exception.Message) }
    }
  } finally {
    try {
      if($null -ne $artifact){$artifact.Dispose()}
      if($null -ne $mirror){
        $retention=@{schemaVersion=1;generation=$Generation;status='retained-unknown';removedBytes=0;removedFiles=0}
        if($known){
          try {
            $removed=$mirror.RemoveOwned()
            $retention.removedBytes=$removed.RemovedBytes;$retention.removedFiles=$removed.RemovedFiles
            $retention.status=if($removed.Complete){'removed'}else{'partial'}
          } catch {$retention.status='refused'}
        }
        try {
          $retentionPath=Join-Path $TaskFolder 'mirror-retention.json'
          $stream=[IO.File]::Open($retentionPath,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
          try {$receiptBytes=[Text.UTF8Encoding]::new($false).GetBytes(($retention|ConvertTo-Json -Compress));$stream.Write($receiptBytes,0,$receiptBytes.Length)} finally {$stream.Dispose()}
        } catch {}
      }
    } finally {
      try {if($null -ne $mirror){$mirror.Dispose()}} catch {}
      if($publish -and [IO.File]::Exists($path)){[IO.File]::Move($path,$terminalPath,$false)}
    }
  }
}
