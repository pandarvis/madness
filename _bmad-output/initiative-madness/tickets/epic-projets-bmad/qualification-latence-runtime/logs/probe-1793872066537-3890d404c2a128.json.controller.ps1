$ErrorActionPreference='Stop'
$processClock=[Diagnostics.Stopwatch]::StartNew();$load=[Diagnostics.Stopwatch]::StartNew()
$trace='C:\Users\UP60066553\.codex\worktrees\bmad-help-2-2\madness\_bmad-output\initiative-madness\tickets\epic-projets-bmad\qualification-latence-runtime\logs\probe-1793872066537-3890d404c2a128.json.phases.jsonl'
function Trace-Probe($phase,$name,$detail){[IO.File]::AppendAllText($trace,((@{phase=$phase;name=$name;elapsedMs=$processClock.ElapsedMilliseconds;utc=[DateTime]::UtcNow.ToString('O');detail=$detail}|ConvertTo-Json -Depth 8 -Compress)+[Environment]::NewLine))}
Trace-Probe 'load-entry' '' $null
. 'C:\Users\UP60066553\.codex\worktrees\bmad-help-2-2\madness\resources\bmad-help\preflight.ps1'
$loadMs=$load.ElapsedMilliseconds
Trace-Probe 'load-exit' '' $loadMs
$original=Get-Content -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-GhR9lp\manifest.json' -Raw|ConvertFrom-Json
$runtime='C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-GhR9lp\junction'
$results=@()
Trace-Probe 'case-entry' 'junction' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-GhR9lp\uv-junction');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {

$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'junction' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-GhR9lp\uv-junction',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='junction';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-GhR9lp\uv-junction')};$results+=$record
Trace-Probe 'guard-exit' 'junction' $record
} finally {
try {

} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'junction' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'junction' @{durationMs=$caseClock.ElapsedMilliseconds}
@{loadMs=$loadMs;processInnerMs=$processClock.ElapsedMilliseconds;results=$results}|ConvertTo-Json -Depth 8 -Compress