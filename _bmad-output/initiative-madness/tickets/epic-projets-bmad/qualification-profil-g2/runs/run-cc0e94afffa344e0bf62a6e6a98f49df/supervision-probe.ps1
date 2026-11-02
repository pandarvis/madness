param([string]$Root)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
. (Join-Path $PSScriptRoot 'supervision.ps1')
$Root=[IO.Path]::GetFullPath($Root)
if(-not $Root.StartsWith($PSScriptRoot+'\fixtures-run-',[StringComparison]::OrdinalIgnoreCase)){throw 'PROBE_OWNERSHIP'}
Assert-G2Chain $Root
$pwsh=(Get-Process -Id $PID).Path
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
$scopeRefused=$false
try {Remove-G2OwnedTree $Root (Join-Path $Root 'unrelated-owner')} catch {$scopeRefused=$_.Exception.Message -eq 'CLEANUP_SCOPE'}
@{forced=$state;next=$next;failed_start=$failed;overflow=$overflow;scope_refused=$scopeRefused;next_log=(Get-Content -Raw -LiteralPath (Join-Path $Root 'next.stdout.log'))} | ConvertTo-Json -Depth 20 -Compress
