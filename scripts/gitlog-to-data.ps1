# Generates _data/gitlog.json from Git commit history
param(
  [string]$RepoPath = (Resolve-Path "..\"),
  [string]$Output = (Join-Path (Resolve-Path "..\") "_data/gitlog.json"),
  [int]$Max = 100
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if (-not (Test-Path (Join-Path $RepoPath ".git"))) {
  Write-Host "No .git directory at $RepoPath; skipping git log export."
  exit 0
}

Push-Location $RepoPath
try {
  $log = git --no-pager log -n $Max --pretty=format:'%H|%ad|%s' --date=short
  $items = @()
  foreach ($line in $log) {
    $parts = $line -split '\|', 3
    if ($parts.Length -ge 3) {
      $items += [pscustomobject]@{ hash = $parts[0]; date = $parts[1]; message = $parts[2] }
    }
  }
  $json = $items | ConvertTo-Json -Depth 3
  $dir = Split-Path $Output -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $Output -Value $json -Encoding UTF8
  Write-Host "Wrote $($items.Count) commits to $Output"
}
finally {
  Pop-Location
}
