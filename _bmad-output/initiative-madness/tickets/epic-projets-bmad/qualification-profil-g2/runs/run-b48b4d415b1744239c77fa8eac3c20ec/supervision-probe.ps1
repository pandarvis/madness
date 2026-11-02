param([string]$Root)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
. (Join-Path $PSScriptRoot 'supervision.ps1')
$Root=[IO.Path]::GetFullPath($Root)
if(-not $Root.StartsWith($PSScriptRoot+'\fixtures-run-',[StringComparison]::OrdinalIgnoreCase)){throw 'PROBE_OWNERSHIP'}
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
Assert-G2Chain $Root
$pwsh=(Get-Command pwsh.exe -CommandType Application | Select-Object -First 1).Source
function Probe-Start([string]$Script) {
  $info=[Diagnostics.ProcessStartInfo]::new()
  $info.FileName=$pwsh;$info.UseShellExecute=$false;$info.CreateNoWindow=$true
  $info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
  foreach($arg in @('-NoProfile','-NonInteractive','-Command',$Script)){$info.ArgumentList.Add($arg)}
  return $info
}
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
@{orphan=$orphan;child_stopped=$childStopped;orphan_log=$orphanLog;forced=$state;next=$next;failed_start=$failed;overflow=$overflow;scope_refused=$scopeRefused;next_log=(Get-Content -Raw -LiteralPath (Join-Path $Root 'next.stdout.log'));forced_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'forced.stderr.log'));next_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'next.stderr.log'));overflow_stderr=(Get-Content -Raw -LiteralPath (Join-Path $Root 'overflow.stderr.log'));host=$pwsh} | ConvertTo-Json -Depth 20 -Compress
