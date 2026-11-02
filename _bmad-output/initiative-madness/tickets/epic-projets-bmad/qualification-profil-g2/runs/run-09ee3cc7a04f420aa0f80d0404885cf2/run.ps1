param([ValidateSet('run','probe','windows-proof','verify','seal','promote')][string]$Action='verify',[string]$RunId)
$ErrorActionPreference='Stop'
$g2Lock=Get-Content -Raw -LiteralPath (Join-Path $PSScriptRoot 'sources-lock.json') | ConvertFrom-Json
if ($g2Lock.schema -ne 3 -or $g2Lock.bench_policy -ne 'captured-source-only-v3' -or $g2Lock.runtime.policy -ne 'closed-copy-v2') { throw 'CURRENT_POLICY' }
# Before dot-sourcing helpers OR first UV, bind every executable harness byte.
$g2Captured=@{}
foreach($g2Item in $g2Lock.bench.PSObject.Properties) {
  if ($g2Item.Name -notmatch '^[a-z_-]+\.(py|ps1)$') { throw 'BENCH_NAME' }
  $g2Path=Join-Path $PSScriptRoot $g2Item.Name
  $g2Raw=[IO.File]::ReadAllBytes($g2Path)
  if ([Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($g2Raw)).ToLowerInvariant() -cne $g2Item.Value) { throw ('BENCH_CHANGED: '+$g2Item.Name) }
  $g2Captured[$g2Item.Name]=$g2Raw
}
. (Join-Path $PSScriptRoot 'runtime-preflight.ps1')
. (Join-Path $PSScriptRoot 'supervision.ps1')
foreach($g2Name in $g2Captured.Keys) { Assert-G2Chain (Join-Path $PSScriptRoot $g2Name) }
$g2Owned=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'fixtures-runtime-owned'))
$g2Root=Join-Path $g2Owned 'python'
$g2Cache=Join-Path $PSScriptRoot 'fixtures-uv-cache'
if ($g2Lock.runtime.root -cne $g2Root -or $g2Lock.runtime.sha256 -cne '0f3ef35995160c8db3b4892d9bb3bd9ea0eba75634d4fc4505eef13e7ce56f92') { throw 'RUNTIME_OWNERSHIP' }
foreach($g2Path in @($g2Owned,$g2Cache)) { if(Test-Path -LiteralPath $g2Path) { throw 'OWNED_ALREADY_EXISTS' } }
$g2NewRun=$Action -in @('run','probe','windows-proof')
$g2Id='run-'+[guid]::NewGuid().ToString('N')
$g2Receipt=Join-Path $PSScriptRoot $(if($g2NewRun) {'runs\'+$g2Id} else {'logs\'+$Action+'-'+[guid]::NewGuid().ToString('N')})
[void][IO.Directory]::CreateDirectory($g2Receipt)
$g2Fixture=Join-Path $PSScriptRoot ('fixtures-run-'+$g2Id.Substring(4))
$g2Cleanup=@($g2Owned,$g2Cache)
if($g2NewRun) { $g2Cleanup+=@($g2Fixture); [void][IO.Directory]::CreateDirectory($g2Fixture) }
$g2StatePath=Join-Path $g2Receipt 'execution.json'
Write-G2State $g2StatePath @{schema=3;outcome='preparing';started=$false;owned=$g2Cleanup;cleanup=@();results_present=$false}
$g2Supervised=$false
try {
  Assert-G2Chain $g2Lock.runtime.source_root
  Assert-G2Chain $g2Lock.uv.path
  if ((Get-FileHash -LiteralPath $g2Lock.uv.path).Hash.ToLowerInvariant() -cne '2bfbe53d3cc95799e98fa08323b04844fc01d4f8c87dd5c00089e43f6554f162') { throw 'UV_CHANGED' }
  [void][IO.Directory]::CreateDirectory((Join-Path $g2Root 'Lib/site-packages'))
  [void][IO.Directory]::CreateDirectory((Join-Path $g2Cache 'tmp'))
  foreach($g2File in $g2Lock.runtime.files) {
    if ([IO.Path]::IsPathRooted($g2File.name) -or $g2File.name -match '(^|/)\.\.(/|$)|[\\:]') { throw 'RUNTIME_RECORD' }
    $g2Source=Join-Path $g2Lock.runtime.source_root $g2File.name
    Assert-G2Chain $g2Source
    if((Get-FileHash -LiteralPath $g2Source).Hash.ToLowerInvariant() -cne $g2File.sha256) { throw 'RUNTIME_SOURCE_CHANGED' }
    $g2Target=Join-Path $g2Root $g2File.name
    [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($g2Target))
    [IO.File]::Copy($g2Source,$g2Target,$false)
  }
  Assert-G2ClosedRuntime $g2Root $g2Lock.runtime.files
  $g2Manifest=@{}
  foreach($g2Name in $g2Captured.Keys) {
    if ($g2Name.EndsWith('.py')) { $g2Manifest[$g2Name.Substring(0,$g2Name.Length-3)]=$g2Lock.bench.$g2Name }
    if ($g2NewRun) { [IO.File]::WriteAllBytes((Join-Path $g2Receipt $g2Name),$g2Captured[$g2Name]) }
  }
  if ($g2NewRun) { [IO.File]::Copy((Join-Path $PSScriptRoot 'sources-lock.json'),(Join-Path $g2Receipt 'sources-lock.json'),$false) }
  switch($Action) {
    'run' {$g2Entry='scenarios';$g2Args=@()}
    'probe' {$g2Entry='scenarios';$g2Args=@('--new-cases')}
    'windows-proof' {$g2Entry='scenarios';$g2Args=@('--windows-proof')}
    'verify' {$g2Entry='verify';$g2Args=@();if($RunId){$g2Args=@('--run',$RunId)}}
    'seal' {$g2Entry='verify';$g2Args=@('--seal','--run',$RunId)}
    'promote' {$g2Entry='verify';$g2Args=@('--promote','--run',$RunId)}
  }
  $g2Start=[Diagnostics.ProcessStartInfo]::new()
  $g2Start.FileName=$g2Lock.uv.path
  $g2Start.WorkingDirectory=$PSScriptRoot
  $g2Start.UseShellExecute=$false;$g2Start.CreateNoWindow=$true
  $g2Start.RedirectStandardOutput=$true;$g2Start.RedirectStandardError=$true
  $g2Start.Environment.Clear()
  foreach($g2Key in @('SYSTEMROOT','WINDIR','PATH')) {
    $g2Value=[Environment]::GetEnvironmentVariable($g2Key)
    if($g2Value){$g2Start.Environment[$g2Key]=$g2Value}
  }
  $g2Start.Environment['UV_CACHE_DIR']=$g2Cache
  $g2Start.Environment['TEMP']=Join-Path $g2Cache 'tmp'
  $g2Start.Environment['TMP']=Join-Path $g2Cache 'tmp'
  if($g2NewRun){$g2Start.Environment['G2_RUN_DIR']=$g2Receipt;$g2Start.Environment['G2_FIXTURE_ROOT']=$g2Fixture}
  $g2Python=Join-Path $g2Root 'python.exe'
  $g2Bootstrap=[Text.Encoding]::UTF8.GetString($g2Captured['source_bootstrap.py'])
  foreach($g2Arg in @('run','--offline','--no-project','--no-config','--no-cache','--python',$g2Python,'--',$g2Python,'-I','-S','-B','-c',$g2Bootstrap,$PSScriptRoot,$PSScriptRoot,($g2Manifest|ConvertTo-Json -Compress),$g2Entry)+$g2Args){$g2Start.ArgumentList.Add($g2Arg)}
  $g2Supervised=$true
  $g2State=Invoke-G2Supervised $g2Start 600000 $g2StatePath $g2Cleanup $PSScriptRoot (Join-Path $g2Receipt 'launcher.stdout.log') (Join-Path $g2Receipt 'launcher.stderr.log')
  # Real pipeline objects, plus persistent logs captured directly from native pipes.
  Get-Content -Raw -LiteralPath (Join-Path $g2Receipt 'launcher.stdout.log') | Write-Output
  $g2Err=Get-Content -Raw -LiteralPath (Join-Path $g2Receipt 'launcher.stderr.log')
  if($g2Err){Write-Output $g2Err}
  Write-Output ('LAUNCH_RECEIPT: '+$g2Receipt)
  if($g2State.outcome -ne 'completed' -or $g2State.exit -ne 0){exit 1}
} catch {
  if(-not $g2Supervised){
    $g2Failure=@{schema=3;outcome='preflight-failed';started=$false;error=$_.Exception.Message;owned=$g2Cleanup;cleanup=@();results_present=$false}
    foreach($g2Path in $g2Cleanup) {
      try {Remove-G2OwnedTree $g2Path $PSScriptRoot;$g2Failure.cleanup+=@{path=$g2Path;removed=(-not(Test-Path -LiteralPath $g2Path))}}
      catch {$g2Failure.cleanup+=@{path=$g2Path;removed=$false;error=$_.Exception.Message}}
    }
    Write-G2State $g2StatePath $g2Failure
  }
  throw
}
