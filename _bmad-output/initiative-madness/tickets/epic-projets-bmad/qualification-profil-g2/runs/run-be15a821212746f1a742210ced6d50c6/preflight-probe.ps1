param([string]$Root,[string]$Pins)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
$g2Full=[IO.Path]::GetFullPath($Root)
$g2Relative=[IO.Path]::GetRelativePath($PSScriptRoot,$g2Full)
if ($g2Relative -notmatch '^fixtures-run-[a-f0-9]+[\\/]') { throw 'PROBE_OWNERSHIP' }
try {
  $g2Expected=Get-Content -Raw -LiteralPath $Pins | ConvertFrom-Json
  Assert-G2ClosedRuntime $g2Full $g2Expected.runtime.files
  @{passed=$true;launched=$false} | ConvertTo-Json -Compress
} catch {
  @{passed=$false;launched=$false;error=$_.Exception.Message} | ConvertTo-Json -Compress
}
