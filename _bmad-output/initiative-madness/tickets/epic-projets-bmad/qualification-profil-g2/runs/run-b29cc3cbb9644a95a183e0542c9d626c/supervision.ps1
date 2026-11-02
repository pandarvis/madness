# Trusted finite native pipe collector, compiled in memory from this pinned file.
if (-not ('G2Capture' -as [type])) {
Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Diagnostics;
using System.Threading.Tasks;
public sealed class G2Capture {
  public byte[] Bytes;
  public bool Overflow;
  public static async Task<G2Capture> Read(Stream stream, Process child, int limit) {
    using (var output = new MemoryStream()) {
      byte[] block = new byte[8192];
      while (true) {
        int count = await stream.ReadAsync(block, 0, block.Length);
        if (count == 0) break;
        if (output.Length + count > limit) {
          try { child.Kill(true); } catch {}
          return new G2Capture { Bytes=output.ToArray(), Overflow=true };
        }
        output.Write(block, 0, count);
      }
      return new G2Capture { Bytes=output.ToArray(), Overflow=false };
    }
  }
}
"@
}
function Remove-G2OwnedTree([string]$Target,[string]$Owner) {
  $Target=[IO.Path]::GetFullPath($Target); $Owner=[IO.Path]::GetFullPath($Owner)
  if (-not $Target.StartsWith($Owner+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'CLEANUP_SCOPE' }
  Assert-G2Chain $Owner
  if (-not (Test-Path -LiteralPath $Target)) { return }
  Assert-G2Chain ([IO.Path]::GetDirectoryName($Target))
  $item=Get-Item -LiteralPath $Target -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { $item.Delete(); return }
  if ($item.PSIsContainer) {
    foreach($child in Get-ChildItem -LiteralPath $Target -Force) { Remove-G2OwnedTree $child.FullName $Owner }
    Assert-G2Chain $Target
    [IO.Directory]::Delete($Target,$false)
  } else { [IO.File]::Delete($Target) }
}
function Write-G2State([string]$Path,$Value) {
  $temp=$Path+'.next'
  [IO.File]::WriteAllText($temp,($Value|ConvertTo-Json -Depth 20),[Text.UTF8Encoding]::new($false))
  [IO.File]::Move($temp,$Path,$true)
}
function Invoke-G2Supervised($Start,[int]$TimeoutMs,[string]$StatePath,[string[]]$OwnedPaths,[string]$Owner,[string]$OutLog,[string]$ErrLog,[string]$Marker='') {
  $state=[ordered]@{schema=3;outcome='running';exit=$null;started=$false;owned=@($OwnedPaths);cleanup=@();results_present=$false}
  Write-G2State $StatePath $state
  $process=$null; $outTask=$null; $errTask=$null
  try {
    $process=[Diagnostics.Process]::Start($Start)
    $state.started=$true; $state.pid=$process.Id
    Write-G2State $StatePath $state
    $outTask=[G2Capture]::Read($process.StandardOutput.BaseStream,$process,4194304)
    $errTask=[G2Capture]::Read($process.StandardError.BaseStream,$process,4194304)
    if (-not $process.WaitForExit($TimeoutMs)) {
      if ($Marker) { $state.marker_observed=Test-Path -LiteralPath $Marker }
      $process.Kill($true)
      if (-not $process.WaitForExit(10000)) { throw 'OWNED_PROCESS_DID_NOT_STOP' }
      $state.outcome='timeout'
    } else { $state.outcome='completed' }
    $state.exit=$process.ExitCode
  } catch {
    $state.outcome=if ($state.started) {'supervision-error'} else {'start-failed'}
    $state.error=$_.Exception.Message
  } finally {
    if ($null -ne $process -and -not $process.HasExited) {
      try { $process.Kill($true); [void]$process.WaitForExit(10000) } catch { $state.stop_error=$_.Exception.Message }
    }
    # Failure of a collector/log never prevents parent teardown or terminal state.
    foreach($pair in @(@($outTask,$OutLog),@($errTask,$ErrLog))) {
      try {
        if ($null -ne $pair[0]) {
          $value=$pair[0].GetAwaiter().GetResult()
          [IO.File]::WriteAllBytes($pair[1],$value.Bytes)
          if($value.Overflow){$state.outcome='output-limit'}
        } else {[IO.File]::WriteAllBytes($pair[1],[byte[]]@())}
      } catch {$state.outcome='capture-failed';$state.capture_error=$_.Exception.Message}
    }
    foreach($target in $OwnedPaths) {
      try {
        Remove-G2OwnedTree $target $Owner
        $state.cleanup+=@{path=$target;removed=(-not (Test-Path -LiteralPath $target))}
      } catch { $state.cleanup+=@{path=$target;removed=$false;error=$_.Exception.Message} }
    }
    $state.results_present=Test-Path -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($StatePath)) 'results.json')
    if ($state.cleanup.Where({-not $_.removed}).Count) { $state.outcome='cleanup-failed' }
    Write-G2State $StatePath $state
    if ($null -ne $process) { $process.Dispose() }
  }
  return $state
}
