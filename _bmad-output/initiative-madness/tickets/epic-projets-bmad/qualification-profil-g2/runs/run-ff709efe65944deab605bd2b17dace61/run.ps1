param(
  [ValidateSet('record-pins','run','verify','seal','promote')][string]$Action = 'verify',
  [string]$RunId
)
$ErrorActionPreference = 'Stop'
$g2Base = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python'
$g2Uv = Join-Path $env:USERPROFILE 'scoop\apps\uv\0.13.0\uv.exe'
$g2ExpectedTree = '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92'
$g2ExpectedUv = '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162'
function Assert-G2Chain([string]$g2Path) {
  $g2Item = Get-Item -LiteralPath $g2Path -Force
  while ($null -ne $g2Item) {
    if ($g2Item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'RUNTIME_REPARSE' }
    $g2Item = $g2Item.Parent
  }
}
Assert-G2Chain $g2Base
Assert-G2Chain $g2Uv
if (Test-Path -LiteralPath (Join-Path $g2Base 'pyvenv.cfg')) { throw 'RUNTIME_VENV' }
if (Get-ChildItem -LiteralPath $g2Base -Filter 'python*._pth') { throw 'RUNTIME_PATH_OVERRIDE' }
if ((Get-FileHash -LiteralPath $g2Uv -Algorithm SHA256).Hash.ToLowerInvariant() -ne $g2ExpectedUv) { throw 'UV_CHANGED' }
$g2Lines = [Collections.Generic.List[string]]::new()
function Add-G2Runtime([string]$g2Path, [string]$g2Relative) {
  $g2Item = Get-Item -LiteralPath $g2Path -Force
  if ($g2Item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'RUNTIME_REPARSE' }
  if ($g2Item.PSIsContainer) {
    [string[]]$g2Children = @(Get-ChildItem -LiteralPath $g2Path -Force | ForEach-Object Name)
    [Array]::Sort($g2Children, [StringComparer]::Ordinal)
    foreach($g2Child in $g2Children) {
      if ($g2Child -cnotin @('site-packages','__pycache__','test','tests')) {
        Add-G2Runtime (Join-Path $g2Path $g2Child) ($g2Relative + '/' + $g2Child)
      }
    }
  } elseif ($g2Item.Extension -match '^\.(py|exe|dll|pyd|zip|pth)$') {
    $g2Hash = (Get-FileHash -LiteralPath $g2Path -Algorithm SHA256).Hash.ToLowerInvariant()
    $g2Lines.Add($g2Relative + ':' + $g2Hash + "`n")
  }
}
foreach($g2Name in @('python.exe','python3.dll','python312.dll','vcruntime140.dll','vcruntime140_1.dll','DLLs','Lib')) {
  Add-G2Runtime (Join-Path $g2Base $g2Name) $g2Name
}
$g2Sha = [Security.Cryptography.SHA256]::Create()
$g2Tree = [BitConverter]::ToString($g2Sha.ComputeHash([Text.Encoding]::UTF8.GetBytes(($g2Lines -join '')))).Replace('-','').ToLowerInvariant()
$g2Sha.Dispose()
if ($g2Tree -ne $g2ExpectedTree) { throw "RUNTIME_CHANGED $g2Tree" }
$g2Python = Join-Path $g2Base 'python.exe'
$g2Bootstrap = 'import runpy,sys;sys.path.insert(0,sys.argv[1]);sys.argv=sys.argv[2:];runpy.run_path(sys.argv[0],run_name="__main__")'
switch ($Action) {
  'record-pins' { $g2Script = 'fixtures.py'; $g2Args = @('--record-pins') }
  'run' { $g2Script = 'scenarios.py'; $g2Args = @() }
  'verify' { $g2Script = 'verify.py'; $g2Args = @(); if ($RunId) { $g2Args += @('--run', $RunId) } }
  'seal' { $g2Script = 'verify.py'; $g2Args = @('--seal','--run',$RunId) }
  'promote' { $g2Script = 'verify.py'; $g2Args = @('--promote','--run',$RunId) }
}
$g2Start = [Diagnostics.ProcessStartInfo]::new()
$g2Start.FileName = $g2Uv
$g2Start.WorkingDirectory = $PSScriptRoot
$g2Start.UseShellExecute = $false
$g2Start.CreateNoWindow = $true
$g2Start.RedirectStandardOutput = $true
$g2Start.RedirectStandardError = $true
$g2Start.Environment.Clear()
foreach($g2Key in @('SYSTEMROOT','WINDIR','TEMP','TMP','PATH')) {
  $g2Value = [Environment]::GetEnvironmentVariable($g2Key)
  if ($g2Value) { $g2Start.Environment[$g2Key] = $g2Value }
}
$g2Start.Environment['UV_CACHE_DIR'] = Join-Path $PSScriptRoot 'fixtures-uv-cache'
$g2Temp = Join-Path $PSScriptRoot 'fixtures-uv-cache\tmp'
[IO.Directory]::CreateDirectory($g2Temp) | Out-Null
$g2Start.Environment['TEMP'] = $g2Temp
$g2Start.Environment['TMP'] = $g2Temp
# Bootstrap records the already-verified uv path; never passed to workers as an
# executable override. Subsequent invocations use sources-lock.json.
if ($Action -eq 'record-pins') { $g2Start.Environment['G2_UV'] = $g2Uv }
foreach($g2Arg in @('run','--offline','--no-project','--no-config','--no-cache','--python',$g2Python,'--',$g2Python,'-I','-S','-B','-c',$g2Bootstrap,$PSScriptRoot,(Join-Path $PSScriptRoot $g2Script)) + $g2Args) {
  $g2Start.ArgumentList.Add($g2Arg)
}
try {
  $g2Process = [Diagnostics.Process]::Start($g2Start)
  $g2Out = $g2Process.StandardOutput.ReadToEndAsync()
  $g2Err = $g2Process.StandardError.ReadToEndAsync()
  $g2Process.WaitForExit()
  [Console]::Out.Write($g2Out.GetAwaiter().GetResult())
  [Console]::Error.Write($g2Err.GetAwaiter().GetResult())
  $g2Exit = $g2Process.ExitCode
} finally {
  $g2Cache = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'fixtures-uv-cache'))
  if ([IO.Path]::GetDirectoryName($g2Cache) -ne [IO.Path]::GetFullPath($PSScriptRoot)) { throw 'CLEANUP_SCOPE' }
  Assert-G2Chain $g2Cache
  Remove-Item -LiteralPath $g2Cache -Recurse -Force
}
exit $g2Exit
