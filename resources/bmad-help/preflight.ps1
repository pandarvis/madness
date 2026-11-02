# Loaded as trusted harness code, also exercised against owned data-only variants.
$ErrorActionPreference = 'Stop'
function Assert-BmadChain([string]$g2Path) {
  $g2Item = Get-Item -LiteralPath $g2Path -Force
  while ($null -ne $g2Item) {
    if ($g2Item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'RUNTIME_REPARSE' }
    if (-not $g2Item.PSIsContainer -and $g2Item.LinkType -eq 'HardLink') { throw 'RUNTIME_HARDLINK' }
    $g2Item = if ($g2Item.PSIsContainer) { $g2Item.Parent } else { $g2Item.Directory }
  }
}
function Assert-BmadClosedRuntime([string]$g2Root, $g2Files) {
  Assert-BmadChain $g2Root
  $g2Root=(Get-Item -LiteralPath $g2Root -Force).FullName
  foreach($g2Parent in @($g2Root,[IO.Path]::GetDirectoryName($g2Root))) {
    if (Test-Path -LiteralPath (Join-Path $g2Parent 'pyvenv.cfg')) { throw 'RUNTIME_VENV' }
  }
  $g2Expected = [Collections.Generic.Dictionary[string,string]]::new([StringComparer]::Ordinal)
  $g2Dirs = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  [void]$g2Dirs.Add('Lib/site-packages')
  foreach($g2File in $g2Files) {
    if ([IO.Path]::IsPathRooted($g2File.name) -or $g2File.name -match '(^|/)\.\.(/|$)|[\\:]') { throw 'RUNTIME_RECORD' }
    $g2Expected.Add($g2File.name,$g2File.sha256)
    $g2Rel = $g2File.name
    while ($g2Rel.Contains('/')) { $g2Rel=$g2Rel.Substring(0,$g2Rel.LastIndexOf('/')); [void]$g2Dirs.Add($g2Rel) }
  }
  $g2Seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  $g2Stack = [Collections.Generic.Stack[string]]::new()
  $g2Stack.Push($g2Root)
  $g2Count = 0
  while ($g2Stack.Count) {
    $g2Folder = $g2Stack.Pop()
    Assert-BmadChain $g2Folder
    foreach($g2Item in Get-ChildItem -LiteralPath $g2Folder -Force) {
      $g2Count++
      if ($g2Count -gt 4096) { throw 'RUNTIME_BOUND' }
      # Every directory is checked on the stack and the complete root ancestry
      # above. Check the already enumerated entry, without repeating all its
      # ancestors for each of734files.
      if ($g2Item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'RUNTIME_REPARSE' }
      if (-not $g2Item.PSIsContainer -and $g2Item.LinkType -eq 'HardLink') { throw 'RUNTIME_HARDLINK' }
      $g2Name = $g2Item.FullName.Substring($g2Root.Length+1).Replace('\','/')
      if ($g2Name.Split('/').Count -gt 17) { throw 'RUNTIME_BOUND' }
      if ($g2Item.PSIsContainer) {
        if (-not $g2Dirs.Contains($g2Name)) { throw ('RUNTIME_EXTRA: '+$g2Name) }
        $g2Stack.Push($g2Item.FullName)
      } else {
        if (-not $g2Expected.ContainsKey($g2Name)) { throw ('RUNTIME_EXTRA: '+$g2Name) }
        if ((Get-FileHash -LiteralPath $g2Item.FullName).Hash.ToLowerInvariant() -cne $g2Expected[$g2Name]) { throw ('RUNTIME_CHANGED: '+$g2Name) }
        [void]$g2Seen.Add($g2Name)
      }
    }
  }
  if ($g2Seen.Count -ne $g2Expected.Count -or -not (Test-Path -LiteralPath (Join-Path $g2Root 'Lib/site-packages') -PathType Container)) { throw 'RUNTIME_MISSING' }
}
