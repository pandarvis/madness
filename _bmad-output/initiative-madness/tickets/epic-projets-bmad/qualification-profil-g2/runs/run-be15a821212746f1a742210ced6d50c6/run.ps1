param([ValidateSet('run','verify','seal','promote')][string]$Action='verify',[string]$RunId)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
$g2Lock = Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'sources-lock.json') | ConvertFrom-Json
if ($g2Lock.schema -ne 2 -or $g2Lock.runtime.policy -ne 'closed-copy-v2' -or $g2Lock.runtime.sha256 -cne '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92') { throw 'RUNTIME_POLICY' }
$g2Owned = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'fixtures-runtime-owned'))
$g2Root = Join-Path $g2Owned 'python'
if ($g2Lock.runtime.root -cne $g2Root -or [IO.Path]::GetDirectoryName($g2Owned) -cne [IO.Path]::GetFullPath($PSScriptRoot)) { throw 'RUNTIME_OWNERSHIP' }
if (Test-Path -LiteralPath $g2Owned) { throw 'RUNTIME_OWNED_ALREADY_EXISTS' }
$g2Cache = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'fixtures-uv-cache'))
if (Test-Path -LiteralPath $g2Cache) { throw 'CACHE_OWNED_ALREADY_EXISTS' }
Assert-G2Chain $g2Lock.runtime.source_root
Assert-G2Chain $g2Lock.uv.path
if ((Get-FileHash -LiteralPath $g2Lock.uv.path).Hash.ToLowerInvariant() -cne '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162') { throw 'UV_CHANGED' }
$g2Process=$null
try {
  [IO.Directory]::CreateDirectory((Join-Path $g2Root 'Lib/site-packages')) | Out-Null
  [IO.Directory]::CreateDirectory((Join-Path $g2Cache 'tmp')) | Out-Null
  $g2Fingerprint=[Text.StringBuilder]::new()
  foreach($g2File in $g2Lock.runtime.files) {
    if ([IO.Path]::IsPathRooted($g2File.name) -or $g2File.name -match '(^|/)\.\.(/|$)|[\\:]') { throw 'RUNTIME_RECORD' }
    $g2Source=Join-Path $g2Lock.runtime.source_root $g2File.name
    Assert-G2Chain $g2Source
    if ((Get-FileHash -LiteralPath $g2Source).Hash.ToLowerInvariant() -cne $g2File.sha256) { throw 'RUNTIME_SOURCE_CHANGED' }
    [void]$g2Fingerprint.Append($g2File.name+':'+$g2File.sha256+"`n")
    $g2Target=Join-Path $g2Root $g2File.name
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($g2Target)) | Out-Null
    [IO.File]::Copy($g2Source,$g2Target,$false)
  }
  $g2Hash=[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($g2Fingerprint.ToString()))).ToLowerInvariant()
  if ($g2Hash -cne $g2Lock.runtime.sha256) { throw 'RUNTIME_RECORDS_CHANGED' }
  # Runs before FIRST UV/Python, including UV's site-enabled interpreter query.
  # Exhaustive allowed set excludes pyw/pyc/__pycache__/pth/sitecustomize in all
  # locations; base and parent venv are checked separately by the same guard.
  Assert-G2ClosedRuntime $g2Root $g2Lock.runtime.files
  switch ($Action) {
    'run' { $g2Script='scenarios.py'; $g2Args=@() }
    'verify' { $g2Script='verify.py'; $g2Args=@(); if ($RunId) { $g2Args+=@('--run',$RunId) } }
    'seal' { $g2Script='verify.py'; $g2Args=@('--seal','--run',$RunId) }
    'promote' { $g2Script='verify.py'; $g2Args=@('--promote','--run',$RunId) }
  }
  $g2Python=Join-Path $g2Root 'python.exe'
  $g2Bootstrap='import runpy,sys;sys.path.insert(0,sys.argv[1]);sys.argv=sys.argv[2:];runpy.run_path(sys.argv[0],run_name="__main__")'
  $g2Start=[Diagnostics.ProcessStartInfo]::new()
  $g2Start.FileName=$g2Lock.uv.path
  $g2Start.WorkingDirectory=$PSScriptRoot
  $g2Start.UseShellExecute=$false
  $g2Start.CreateNoWindow=$true
  $g2Start.RedirectStandardOutput=$true
  $g2Start.RedirectStandardError=$true
  $g2Start.Environment.Clear()
  foreach($g2Key in @('SYSTEMROOT','WINDIR','PATH')) {
    $g2Value=[Environment]::GetEnvironmentVariable($g2Key)
    if ($g2Value) { $g2Start.Environment[$g2Key]=$g2Value }
  }
  $g2Start.Environment['UV_CACHE_DIR']=$g2Cache
  $g2Start.Environment['TEMP']=Join-Path $g2Cache 'tmp'
  $g2Start.Environment['TMP']=Join-Path $g2Cache 'tmp'
  foreach($g2Arg in @('run','--offline','--no-project','--no-config','--no-cache','--python',$g2Python,'--',$g2Python,'-I','-S','-B','-c',$g2Bootstrap,$PSScriptRoot,(Join-Path $PSScriptRoot $g2Script))+$g2Args) { $g2Start.ArgumentList.Add($g2Arg) }
  $g2Process=[Diagnostics.Process]::Start($g2Start)
  $g2Out=$g2Process.StandardOutput.ReadToEndAsync()
  $g2Err=$g2Process.StandardError.ReadToEndAsync()
  if (-not $g2Process.WaitForExit(600000)) { $g2Process.Kill($true); throw 'LAUNCH_TIME_LIMIT' }
  [Console]::Out.Write($g2Out.GetAwaiter().GetResult())
  [Console]::Error.Write($g2Err.GetAwaiter().GetResult())
  $g2Exit=$g2Process.ExitCode
} finally {
  foreach($g2Cleanup in @($g2Owned,$g2Cache)) {
    if ([IO.Path]::GetDirectoryName($g2Cleanup) -cne [IO.Path]::GetFullPath($PSScriptRoot)) { throw 'CLEANUP_SCOPE' }
    if (Test-Path -LiteralPath $g2Cleanup) { Assert-G2Chain $g2Cleanup; Remove-Item -LiteralPath $g2Cleanup -Recurse -Force }
  }
}
exit $g2Exit
