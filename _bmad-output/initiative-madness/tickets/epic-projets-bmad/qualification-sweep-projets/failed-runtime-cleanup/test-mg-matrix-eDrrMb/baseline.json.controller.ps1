$ErrorActionPreference='Stop'
$processClock=[Diagnostics.Stopwatch]::StartNew();$load=[Diagnostics.Stopwatch]::StartNew()
$trace='C:\Users\UP60066553\.codex\worktrees\bmad-help-2-2\madness\_bmad-output\initiative-madness\tickets\epic-projets-bmad\qualification-latence-runtime\logs\test-mg-matrix-eDrrMb\baseline.json.phases.jsonl'
function Trace-Probe($phase,$name,$detail){[IO.File]::AppendAllText($trace,((@{phase=$phase;name=$name;elapsedMs=$processClock.ElapsedMilliseconds;utc=[DateTime]::UtcNow.ToString('O');detail=$detail}|ConvertTo-Json -Depth 8 -Compress)+[Environment]::NewLine))}
Trace-Probe 'load-entry' '' $null
. 'C:\Users\UP60066553\.codex\worktrees\bmad-help-2-2\madness\_bmad-output\initiative-madness\tickets\epic-projets-bmad\qualification-latence-runtime\preflight-baseline.ps1'
$loadMs=$load.ElapsedMilliseconds
Trace-Probe 'load-exit' '' $loadMs
$original=Get-Content -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\manifest.json' -Raw|ConvertFrom-Json
$runtime='C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python'
$results=@()
Trace-Probe 'case-entry' 'nominal' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {

$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'nominal' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='nominal';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal')};$results+=$record
Trace-Probe 'guard-exit' 'nominal' $record
} finally {
try {

} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'nominal' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'nominal' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'changed' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-changed');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
$saved=[IO.File]::ReadAllBytes('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem');[IO.File]::AppendAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem',"CHANGED")
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'changed' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-changed',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='changed';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-changed')};$results+=$record
Trace-Probe 'guard-exit' 'changed' $record
} finally {
try {
[IO.File]::WriteAllBytes('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem',$saved)
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'changed' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'changed' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'missing' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-missing');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
$saved=[IO.File]::ReadAllBytes('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem');[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem')
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'missing' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-missing',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='missing';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-missing')};$results+=$record
Trace-Probe 'guard-exit' 'missing' $record
} finally {
try {
[IO.File]::WriteAllBytes('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem',$saved)
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'missing' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'missing' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'sitecustomize' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-sitecustomize');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\site-packages\sitecustomize.py',"NEVER")
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'sitecustomize' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-sitecustomize',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='sitecustomize';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-sitecustomize')};$results+=$record
Trace-Probe 'guard-exit' 'sitecustomize' $record
} finally {
try {
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\site-packages\sitecustomize.py')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'sitecustomize' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'sitecustomize' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'usercustomize' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-usercustomize');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\site-packages\usercustomize.py',"NEVER")
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'usercustomize' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-usercustomize',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='usercustomize';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-usercustomize')};$results+=$record
Trace-Probe 'guard-exit' 'usercustomize' $record
} finally {
try {
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\site-packages\usercustomize.py')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'usercustomize' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'usercustomize' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'cache' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-cache');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[void][IO.Directory]::CreateDirectory('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\__pycache__')
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'cache' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-cache',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='cache';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-cache')};$results+=$record
Trace-Probe 'guard-exit' 'cache' $record
} finally {
try {
[IO.Directory]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\__pycache__')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'cache' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'cache' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'extra-dir' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-extra-dir');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[void][IO.Directory]::CreateDirectory('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\unexpected')
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'extra-dir' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-extra-dir',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='extra-dir';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-extra-dir')};$results+=$record
Trace-Probe 'guard-exit' 'extra-dir' $record
} finally {
try {
[IO.Directory]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\unexpected')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'extra-dir' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'extra-dir' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'root-venv' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-root-venv');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\pyvenv.cfg',"NEVER")
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'root-venv' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-root-venv',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='root-venv';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-root-venv')};$results+=$record
Trace-Probe 'guard-exit' 'root-venv' $record
} finally {
try {
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\pyvenv.cfg')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'root-venv' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'root-venv' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'parent-venv' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-parent-venv');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\pyvenv.cfg',"NEVER")
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'parent-venv' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-parent-venv',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='parent-venv';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-parent-venv')};$results+=$record
Trace-Probe 'guard-exit' 'parent-venv' $record
} finally {
try {
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\pyvenv.cfg')
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'parent-venv' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'parent-venv' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'invalid-record' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-record');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
$m=@{files=@(@{name='../outside';sha256='0000000000000000000000000000000000000000000000000000000000000000'})}
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'invalid-record' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-record',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='invalid-record';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-record')};$results+=$record
Trace-Probe 'guard-exit' 'invalid-record' $record
} finally {
try {

} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'invalid-record' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'invalid-record' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'invalid-hash' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-hash');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
$m=@{files=@(@{name='python.exe';sha256='bad'})}
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'invalid-hash' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-hash',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='invalid-hash';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-invalid-hash')};$results+=$record
Trace-Probe 'guard-exit' 'invalid-hash' $record
} finally {
try {

} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'invalid-hash' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'invalid-hash' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'read-fault' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-read-fault');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {
$handle=[IO.File]::Open('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\python\Lib\codex-rejected-cas.pem',[IO.FileMode]::Open,[IO.FileAccess]::ReadWrite,[IO.FileShare]::None)
$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'read-fault' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-read-fault',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='read-fault';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-read-fault')};$results+=$record
Trace-Probe 'guard-exit' 'read-fault' $record
} finally {
try {
$handle.Dispose();$handle=$null
} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'read-fault' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'read-fault' @{durationMs=$caseClock.ElapsedMilliseconds}
Trace-Probe 'case-entry' 'nominal-after-corruption' $null
[IO.File]::Delete('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal-after-corruption');$m=$original;$handle=$null;$caseClock=[Diagnostics.Stopwatch]::StartNew()
try {

$watch=[Diagnostics.Stopwatch]::StartNew();$errorCode=$null;$admitted=$false
Trace-Probe 'guard-entry' 'nominal-after-corruption' $null
try { Assert-BmadClosedRuntime $runtime $m.files;$admitted=$true;[IO.File]::WriteAllText('C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal-after-corruption',"UV_SUBSTITUTE") } catch {$errorCode=$_.Exception.Message}
$record=@{name='nominal-after-corruption';admitted=$admitted;error=$errorCode;guardMs=$watch.ElapsedMilliseconds;launchMarker=(Test-Path -LiteralPath 'C:\Users\UP60066553\AppData\Local\Temp\mg-matrix-eDrrMb\uv-nominal-after-corruption')};$results+=$record
Trace-Probe 'guard-exit' 'nominal-after-corruption' $record
} finally {
try {

} finally {if($null -ne $handle){$handle.Dispose()}}
Trace-Probe 'restored' 'nominal-after-corruption' @{durationMs=$caseClock.ElapsedMilliseconds}
}
Trace-Probe 'case-exit' 'nominal-after-corruption' @{durationMs=$caseClock.ElapsedMilliseconds}
@{loadMs=$loadMs;processInnerMs=$processClock.ElapsedMilliseconds;results=$results}|ConvertTo-Json -Depth 8 -Compress