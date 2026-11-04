param([Parameter(Mandatory=$true)][string]$Request)
$ErrorActionPreference='Stop'
$req=Get-Content -LiteralPath $Request -Raw|ConvertFrom-Json
$owner=$req.analysis
$state=$null
try {
  . (Join-Path $PSScriptRoot 'preflight.ps1')
  . (Join-Path $PSScriptRoot 'supervision.ps1')
  Assert-BmadChain $owner
  $m=Get-Content -LiteralPath $req.assembly -Raw|ConvertFrom-Json
  Assert-BmadClosedRuntime (Join-Path $m.owner 'runtime') $m.runtime
  # Independent inventory includes every third-party byte. Higher bound belongs
  # only to this profile; the product's guard remains unchanged.
  Assert-BmadClosedRuntime (Join-Path $m.owner 'packages') $m.packages
  Assert-BmadChain $m.uv.path
  if((Get-FileHash -LiteralPath $m.uv.path).Hash.ToLowerInvariant() -cne $m.uv.sha256){throw 'UV_CHANGED'}
  Assert-BmadChain $m.git.path
  if((Get-FileHash -LiteralPath $m.git.path).Hash.ToLowerInvariant() -cne $m.git.sha256){throw 'GIT_CHANGED'}
  foreach($file in $req.harness){Assert-BmadChain $file.path;if((Get-FileHash -LiteralPath $file.path).Hash.ToLowerInvariant() -cne $file.sha256){throw 'HARNESS_CHANGED'}}
  if((Get-ChildItem -LiteralPath (Join-Path $owner 'out') -Force).Count){throw 'OUTPUT_REUSED'}
  Assert-BmadChain $req.project
  foreach($entry in Get-ChildItem -LiteralPath $req.project -Recurse -Force){
    if($entry.Attributes -band [IO.FileAttributes]::ReparsePoint -or (-not $entry.PSIsContainer -and $entry.LinkType -eq 'HardLink')){throw 'PROJECT_LINK'}
  }
  $gitConfig=Join-Path $req.project '.git/config'
  if(Test-Path -LiteralPath $gitConfig){
    foreach($line in Get-Content -LiteralPath $gitConfig){
      if($line.Trim() -and $line.Trim() -notmatch '^(\[core\]|(repositoryformatversion|filemode|bare|logallrefupdates|symlinks|ignorecase)\s*=\s*(0|true|false))$'){throw 'GIT_CONFIG_UNADMITTED'}
    }
  }
  $start=[Diagnostics.ProcessStartInfo]::new($m.uv.path)
  $python=Join-Path $m.owner 'runtime/python.exe'
  foreach($a in @('run','--offline','--no-project','--no-config','--no-cache','--python',$python,'--',$python,'-I','-S','-B','-X','utf8',(Join-Path $PSScriptRoot 'worker.py'),$Request)){[void]$start.ArgumentList.Add($a)}
  $start.WorkingDirectory=$owner;$start.UseShellExecute=$false;$start.CreateNoWindow=$true
  $start.Environment.Clear()
  foreach($k in @('SYSTEMROOT','WINDIR')){$start.Environment[$k]=[Environment]::GetEnvironmentVariable($k)}
  $start.Environment['PATH']=[IO.Path]::GetDirectoryName($m.git.path)
  foreach($k in @('HOME','USERPROFILE','APPDATA','LOCALAPPDATA','XDG_CACHE_HOME','XDG_CONFIG_HOME','TIKTOKEN_CACHE_DIR')){$start.Environment[$k]=Join-Path $owner 'home'}
  foreach($k in @('TEMP','TMP','UV_CACHE_DIR')){$start.Environment[$k]=Join-Path $owner 'tmp'}
  $start.Environment['GRAPHIFY_BACKEND']='none';$start.Environment['GRAPHIFY_NO_AUTO_REFRESH']='1';$start.Environment['GRAPHIFY_OUT']='graphify-out';$start.Environment['PYTHONHASHSEED']='42'
  $start.Environment['GIT_CONFIG_NOSYSTEM']='1';$start.Environment['GIT_CONFIG_GLOBAL']='NUL';$start.Environment['GIT_OPTIONAL_LOCKS']='0';$start.Environment['GIT_TERMINAL_PROMPT']='0'
  $start.Environment['GIT_CONFIG_COUNT']='3';$start.Environment['GIT_CONFIG_KEY_0']='core.hooksPath';$start.Environment['GIT_CONFIG_VALUE_0']='NUL';$start.Environment['GIT_CONFIG_KEY_1']='core.fsmonitor';$start.Environment['GIT_CONFIG_VALUE_1']='false';$start.Environment['GIT_CONFIG_KEY_2']='core.untrackedCache';$start.Environment['GIT_CONFIG_VALUE_2']='false'
  $state=Invoke-BmadSupervised $start $req.timeout_ms (Join-Path $owner 'execution.json') @() $owner (Join-Path $owner 'stdout.log') (Join-Path $owner 'stderr.log') '' ([ref]$state) (Join-Path $owner 'cancel')
}catch{[IO.File]::WriteAllText((Join-Path $owner 'runner-error.txt'),$_.Exception.Message)}
finally{
 $known=$null -ne $state -and $state.started -and $state.job_assigned_before_resume -and $state.Contains('job_active_after_stop') -and $state.job_active_after_stop -eq 0
 $never=$null -eq $state -or -not $state.started
 [IO.File]::WriteAllText((Join-Path $owner 'terminal.json'),(@{knownStopped=($known -or $never);neverStarted=$never;jobAssigned=($null -ne $state -and $state.job_assigned_before_resume);jobActive=if($known -or $never){0}else{$null}}|ConvertTo-Json -Compress))
}
