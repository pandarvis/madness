$ErrorActionPreference='Stop'
$state=$null
$phaseClock=[Diagnostics.Stopwatch]::StartNew();$phases=[ordered]@{}
try {
  $resource=Join-Path $TaskFolder 'resources'
  $pins=Get-Content -LiteralPath (Join-Path $TaskFolder 'pins.json') -Raw|ConvertFrom-Json -AsHashtable
  foreach($name in $pins.Keys){
    $path=Join-Path $resource $name
    $item=Get-Item -LiteralPath $path -Force
    if($item.Attributes -band [IO.FileAttributes]::ReparsePoint -or $item.LinkType -eq 'HardLink'){throw 'SOURCE_LINK'}
    if((Get-FileHash -LiteralPath $path).Hash.ToLowerInvariant() -cne $pins[$name]){throw 'SOURCE_CHANGED'}
  }
  . (Join-Path $resource 'preflight.ps1')
  . (Join-Path $resource 'supervision.ps1')
  $phases.resources_ms=$phaseClock.ElapsedMilliseconds
  $phaseClock.Restart()
  Assert-BmadChain $TaskFolder
  $manifest=Get-Content -LiteralPath (Join-Path $resource 'runtime.json') -Raw|ConvertFrom-Json
  $runtime=$RuntimeFolder
  $copyRuntime=-not (Test-Path -LiteralPath $runtime)
  $cache=Join-Path $TaskFolder 'cache'
  if($copyRuntime){
  [void][IO.Directory]::CreateDirectory($runtime)
  [void][IO.Directory]::CreateDirectory((Join-Path $runtime 'Lib/site-packages'))
  [void][IO.Directory]::CreateDirectory((Join-Path $cache 'tmp'))
  $origin=Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python'
  Assert-BmadChain $origin
  $checkedParents=[Collections.Generic.HashSet[string]]::new()
  foreach($entry in $manifest.files){
    $source=Join-Path $origin $entry.name
    $parent=[IO.Path]::GetDirectoryName($source)
    if($checkedParents.Add($parent)){Assert-BmadChain $parent}
    $item=Get-Item -LiteralPath $source -Force
    if($item.Attributes -band [IO.FileAttributes]::ReparsePoint -or $item.LinkType -eq 'HardLink'){throw 'RUNTIME_SOURCE_LINK'}
    
    $target=Join-Path $runtime $entry.name
    [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($target))
    [IO.File]::WriteAllBytes($target,[IO.File]::ReadAllBytes($source))
  }
  }
  $phases.runtime_copy_ms=$phaseClock.ElapsedMilliseconds;$phaseClock.Restart()
  # This entire closed inventory is checked BEFORE THE FIRST UV instruction.
  Assert-BmadClosedRuntime $runtime $manifest.files
  $phases.runtime_guard_ms=$phaseClock.ElapsedMilliseconds;$phaseClock.Restart()
  $uv=Join-Path $env:USERPROFILE 'scoop/apps/uv/0.13.0/uv.exe'
  Assert-BmadChain $uv
  if((Get-FileHash -LiteralPath $uv).Hash.ToLowerInvariant() -cne $manifest.uvSha256){throw 'UV_CHANGED'}
  if(Test-Path -LiteralPath (Join-Path $TaskFolder 'cancel')){throw 'CANCELLED_BEFORE_UV'}
  $start=[Diagnostics.ProcessStartInfo]::new($uv)
  $python=Join-Path $runtime 'python.exe'
  $modules=@{}
  foreach($name in @('capture','runtime_guard','worker','knowledge','resolve_config','config_utils','progress')){$modules[$name]=$pins[$name+'.py']}
  $bootstrap=[IO.File]::ReadAllText((Join-Path $resource 'bootstrap.py'),[Text.UTF8Encoding]::new($false,$true))
  foreach($arg in @('run','--offline','--no-project','--no-config','--no-cache','--python',$python,'--',$python,'-I','-S','-B','-c',$bootstrap,$resource,$resource,($modules|ConvertTo-Json -Compress),'worker',(Join-Path $TaskFolder 'request.json'))){[void]$start.ArgumentList.Add($arg)}
  $start.WorkingDirectory=$TaskFolder
  $start.UseShellExecute=$false;$start.CreateNoWindow=$true
  $start.Environment.Clear()
  foreach($name in @('SYSTEMROOT','WINDIR','PATH')){if([Environment]::GetEnvironmentVariable($name)){$start.Environment[$name]=[Environment]::GetEnvironmentVariable($name)}}
  [void][IO.Directory]::CreateDirectory((Join-Path $cache 'tmp'))
  $start.Environment['UV_CACHE_DIR']=$cache;$start.Environment['TEMP']=Join-Path $cache 'tmp';$start.Environment['TMP']=Join-Path $cache 'tmp'
  $state=Invoke-BmadSupervised $start 120000 (Join-Path $TaskFolder 'execution.json') @() $TaskFolder (Join-Path $TaskFolder 'stdout.json') (Join-Path $TaskFolder 'stderr.log') '' ([ref]$state) (Join-Path $TaskFolder 'cancel')
  $phases.native_group_ms=$phaseClock.ElapsedMilliseconds
} catch {
  [IO.File]::WriteAllText((Join-Path $TaskFolder 'launcher-error.txt'),$_.Exception.Message)
} finally {
  [IO.File]::WriteAllText((Join-Path $TaskFolder 'phases.json'),($phases|ConvertTo-Json -Compress))
  $terminal=[ordered]@{schemaVersion=1;generation=$Generation;purpose='bmad-readonly';terminal=$true;jobAssigned=$false;jobActive=$null;neverStarted=$false}
  if($null -eq $state -or -not $state.started){$terminal.neverStarted=$true;$terminal.jobActive=0}
  elseif($state.job_assigned_before_resume -and $state.Contains('job_active_after_stop')){$terminal.jobAssigned=$true;$terminal.jobActive=$state.job_active_after_stop}
  $path=Join-Path $TaskFolder 'terminal.json'
  [IO.File]::WriteAllText(($path+'.next'),($terminal|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false))
  [IO.File]::Move(($path+'.next'),$path,$true)
}
