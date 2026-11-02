param([string]$Root)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
. (Join-Path $PSScriptRoot 'supervision.ps1')
$Root=[IO.Path]::GetFullPath($Root)
if(-not $Root.StartsWith($PSScriptRoot+'\fixtures-run-',[StringComparison]::OrdinalIgnoreCase)){throw 'PROBE_OWNERSHIP'}
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
Assert-G2Chain $Root
# Use this running host's real executable, not the .NET global-tool shim which
# may exit before its final interpreter descendant has terminated.
$pwsh=Join-Path $PSHOME 'pwsh.exe'
Assert-G2Chain $pwsh
$hostSha=(Get-FileHash -LiteralPath $pwsh).Hash.ToLowerInvariant()
function Probe-Start([string]$Script) {
  $info=[Diagnostics.ProcessStartInfo]::new()
  $info.FileName=$pwsh;$info.UseShellExecute=$false;$info.CreateNoWindow=$true
  $info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
  foreach($arg in @('-NoProfile','-NonInteractive','-Command',$Script)){$info.ArgumentList.Add($arg)}
  return $info
}
function Probe-EntryStateRefusal([bool]$AfterLaunch=$false) {
  $label=if($AfterLaunch){'started'}else{'entry'}
  $statePath=Join-Path $Root ($label+'-refused.json')
  $marker=Join-Path $Root ($label+'-child-started')
  $owned=@('runtime','cache','fixture')|ForEach-Object {Join-Path $Root ($label+'-owned-'+$_)}
  foreach($path in $owned){[void][IO.Directory]::CreateDirectory($path)}
  $originalWriter=${function:Write-G2State}
  $observed=$null;$failure=''
  # Controlled persistent IOException, limited to this owned state destination.
  # No disk pressure, permission change or injected child/fixture code.
  function Write-G2State([string]$Path,$Value) {
    if($Path -eq $statePath -and (-not $AfterLaunch -or $Value.started)){throw [IO.IOException]::new('CONTROLLED_STATE_WRITE_REFUSAL')}
    & $originalWriter $Path $Value
  }
  $start=Probe-Start ("[IO.File]::WriteAllText('"+$marker.Replace("'","''")+"','CHILD_STARTED')")
  try { $observed=Invoke-G2Supervised $start 1000 $statePath $owned $Root (Join-Path $Root 'entry.stdout.log') (Join-Path $Root 'entry.stderr.log') '' ([ref]$observed) }
  catch {$failure=$_.Exception.Message}
  $removed=@($owned|ForEach-Object {@{path=$_;removed=(-not(Test-Path -LiteralPath $_))}})
  # Exercise the actual caller catch body with its observed lifecycle object.
  # Compiled from this admitted launcher source, never from fixture content.
  $tokens=$null;$parseErrors=$null
  $launcher=[Management.Automation.Language.Parser]::ParseFile((Join-Path $PSScriptRoot 'run.ps1'),[ref]$tokens,[ref]$parseErrors)
  if($parseErrors.Count){throw $parseErrors[0]}
  $mainTry=@($launcher.EndBlock.Statements|Where-Object {$_ -is [Management.Automation.Language.TryStatementAst]})[0]
  $body=$mainTry.CatchClauses[0].Body.Extent.Text
  $fallback=[scriptblock]::Create('param([string]$PSScriptRoot)'+[Environment]::NewLine+$body.Substring(1,$body.Length-2))
  $g2State=$observed;$g2Supervised=$false
  $g2StatePath=Join-Path $Root ($label+'-caller.json')
  $g2Cleanup=@($owned|ForEach-Object {$_+'-caller'})
  foreach($path in $g2Cleanup){[void][IO.Directory]::CreateDirectory($path)}
  $reraised=''
  try {throw [IO.IOException]::new('CONTROLLED_CALLER_ENTRY_THROW')}
  catch {try {. $fallback $PSScriptRoot}catch {$reraised=$_.Exception.Message}}
  $caller=if(Test-Path -LiteralPath $g2StatePath){Get-Content -Raw -LiteralPath $g2StatePath|ConvertFrom-Json}else{$null}
  $callerRemoved=-not @($g2Cleanup|Where-Object {Test-Path -LiteralPath $_}).Count
  $passed=$failure -match 'CONTROLLED_STATE_WRITE_REFUSAL' -and $null -ne $observed -and $observed.started -eq $AfterLaunch -and ($AfterLaunch -or -not(Test-Path -LiteralPath $marker)) -and -not $removed.Where({-not $_.removed}).Count -and $null -ne $caller -and $caller.started -eq $AfterLaunch -and $callerRemoved -and $reraised.Length -gt 0 -and (-not $AfterLaunch -or $observed.job_active_after_stop -eq 0)
  return @{passed=$passed;error=$failure;started=if($null -eq $observed){$null}else{$observed.started};child_marker_absent=(-not(Test-Path -LiteralPath $marker));cleanup=$removed;caller_started=$caller.started;caller_cleanup_removed=$callerRemoved;caller_reraised=$reraised;job_active_after_stop=$observed.job_active_after_stop}
}
$entryStateRefusal=Probe-EntryStateRefusal
$startedStateRefusal=Probe-EntryStateRefusal $true
if(-not $startedStateRefusal.passed){throw 'STARTED_STATE_REFUSAL_REGRESSION'}
if(-not $entryStateRefusal.passed){throw 'ENTRY_STATE_REFUSAL_REGRESSION'}
$owned=Join-Path $Root 'forced-owned'
[void][IO.Directory]::CreateDirectory($owned)
$escaped=$owned.Replace("'","''")
$start=Probe-Start ("[IO.File]::WriteAllText('"+$escaped+"\created','owned'); Start-Sleep -Seconds 30")
# Same supervisor observes the child-created marker before its actual Kill(true).
$state=Invoke-G2Supervised $start 4000 (Join-Path $Root 'forced.json') @($owned) $Root (Join-Path $Root 'forced.stdout.log') (Join-Path $Root 'forced.stderr.log') (Join-Path $owned 'created')
$retryOwned=Join-Path $Root 'next-owned';[void][IO.Directory]::CreateDirectory($retryOwned)
$next=Invoke-G2Supervised (Probe-Start "Write-Output 'NEXT_RUN_OK'") 10000 (Join-Path $Root 'next.json') @($retryOwned) $Root (Join-Path $Root 'next.stdout.log') (Join-Path $Root 'next.stderr.log')
$badOwned=Join-Path $Root 'failed-start-owned';[void][IO.Directory]::CreateDirectory($badOwned)
$bad=Probe-Start ''; $bad.FileName=Join-Path $Root 'nonexistent.exe'
$failed=Invoke-G2Supervised $bad 1000 (Join-Path $Root 'failed-start.json') @($badOwned) $Root (Join-Path $Root 'failed.stdout.log') (Join-Path $Root 'failed.stderr.log')
$overflowOwned=Join-Path $Root 'overflow-owned';[void][IO.Directory]::CreateDirectory($overflowOwned)
$overflow=Invoke-G2Supervised (Probe-Start "[Console]::Out.Write(('X'*5000000))") 10000 (Join-Path $Root 'overflow.json') @($overflowOwned) $Root (Join-Path $Root 'overflow.stdout.log') (Join-Path $Root 'overflow.stderr.log')
# The parent exits successfully while a genuine child retains inherited pipes.
# The job was assigned before either process could execute.
$orphanOwned=Join-Path $Root 'orphan-owned';[void][IO.Directory]::CreateDirectory($orphanOwned)
$childPid=Join-Path $orphanOwned 'child.pid'
$childScript="[IO.File]::WriteAllText('"+$childPid.Replace("'","''")+"',[string]`$PID); [Console]::Out.WriteLine('DESCENDANT_ALIVE'); Start-Sleep -Seconds 30"
$encoded=[Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($childScript))
$parentScript="`$s=[Diagnostics.ProcessStartInfo]::new();`$s.FileName='"+$pwsh.Replace("'","''")+"';`$s.UseShellExecute=`$false;foreach(`$a in @('-NoProfile','-NonInteractive','-EncodedCommand','"+$encoded+"')){`$s.ArgumentList.Add(`$a)};`$c=[Diagnostics.Process]::Start(`$s);`$t=[Diagnostics.Stopwatch]::StartNew();while(-not(Test-Path -LiteralPath '"+$childPid.Replace("'","''")+"') -and `$t.ElapsedMilliseconds -lt 10000){Start-Sleep -Milliseconds 20};if(-not(Test-Path -LiteralPath '"+$childPid.Replace("'","''")+"')){exit 2};Write-Output ('CHILD_PID='+`$c.Id);exit 0"
$orphan=Invoke-G2Supervised (Probe-Start $parentScript) 15000 (Join-Path $Root 'orphan.json') @($orphanOwned) $Root (Join-Path $Root 'orphan.stdout.log') (Join-Path $Root 'orphan.stderr.log')
$orphanLog=Get-Content -Raw -LiteralPath (Join-Path $Root 'orphan.stdout.log')
$childStopped=$false
if($orphanLog -match 'CHILD_PID=(\d+)'){$childStopped=$null -eq (Get-Process -Id ([int]$Matches[1]) -ErrorAction SilentlyContinue)}
$scopeRefused=$false
try {Remove-G2OwnedTree $Root (Join-Path $Root 'unrelated-owner')} catch {$scopeRefused=$_.Exception.Message -eq 'CLEANUP_SCOPE'}
@{entry_state_refusal=$entryStateRefusal;started_state_refusal=$startedStateRefusal;orphan=$orphan;child_stopped=$childStopped;orphan_log=$orphanLog;forced=$state;next=$next;failed_start=$failed;overflow=$overflow;scope_refused=$scopeRefused;next_log=(Get-Content -Raw -LiteralPath (Join-Path $Root 'next.stdout.log'));forced_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'forced.stderr.log'));next_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'next.stderr.log'));overflow_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'overflow.stderr.log'));host=$pwsh;host_sha256=$hostSha;host_version=$PSVersionTable.PSVersion.ToString()} | ConvertTo-Json -Depth 20 -Compress
