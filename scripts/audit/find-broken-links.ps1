# Find and fix broken internal links in markdown files
# Part of comprehensive website audit

param(
    [int]$MaxFiles = 100,
    [switch]$FixLinks = $false
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "🔍 Scanning for broken internal links..." -ForegroundColor Cyan
Write-Host "Max files to scan: $MaxFiles" -ForegroundColor Gray
Write-Host ""

$rootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$brokenLinks = @{}
$filesScanned = 0
$totalBrokenLinks = 0

# Get all markdown files
$markdownFiles = Get-ChildItem -Path $rootDir -Filter *.md -Recurse | 
    Where-Object { 
        $_.FullName -notlike "*node_modules*" -and 
        $_.FullName -notlike "*\.git*" -and
        $_.FullName -notlike "*vendor*"
    } | 
    Select-Object -First $MaxFiles

foreach ($file in $markdownFiles) {
    $filesScanned++
    
    if ($filesScanned % 10 -eq 0) {
        Write-Progress -Activity "Scanning files" -Status "Processed $filesScanned/$($markdownFiles.Count)" -PercentComplete (($filesScanned / $markdownFiles.Count) * 100)
    }
    
    $content = Get-Content $file.FullName -Raw
    
    # Find markdown links: [text](/path/) or [text](path.md)
    $links = [regex]::Matches($content, '\[([^\]]+)\]\(([^\)]+)\)')
    
    foreach ($match in $links) {
        $linkText = $match.Groups[1].Value
        $linkPath = $match.Groups[2].Value
        
        # Skip external links
        if ($linkPath -match '^https?://' -or $linkPath -match '^mailto:' -or $linkPath -match '^#') {
            continue
        }
        
        # Resolve relative path
        $resolvedPath = $null
        
        if ($linkPath.StartsWith('/')) {
            # Absolute path from root
            $resolvedPath = Join-Path $rootDir ($linkPath.TrimStart('/') -replace '/', '\')
        } else {
            # Relative path
            $resolvedPath = Join-Path (Split-Path $file.FullName) $linkPath
        }
        
        # Remove anchor fragments
        if ($resolvedPath -match '#') {
            $resolvedPath = $resolvedPath -replace '#.*$', ''
        }
        
        # Remove query strings
        if ($resolvedPath -match '\?') {
            $resolvedPath = $resolvedPath -replace '\?.*$', ''
        }
        
        # Try with and without .md extension
        $exists = Test-Path $resolvedPath
        
        if (-not $exists -and $resolvedPath -notmatch '\.(md|html)$') {
            # Try adding .md
            $exists = Test-Path "$resolvedPath.md"
            if (-not $exists) {
                # Try as directory with index.md
                $exists = Test-Path (Join-Path $resolvedPath "index.md")
            }
        }
        
        if (-not $exists) {
            $totalBrokenLinks++
            $relativePath = $linkPath
            
            if (-not $brokenLinks.ContainsKey($relativePath)) {
                $brokenLinks[$relativePath] = @{
                    Count = 0
                    Files = @()
                }
            }
            
            $brokenLinks[$relativePath].Count++
            $brokenLinks[$relativePath].Files += $file.FullName.Replace($rootDir, '').TrimStart('\')
        }
    }
}

Write-Progress -Activity "Scanning files" -Completed

# Report results
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 BROKEN LINKS REPORT" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files scanned: $filesScanned" -ForegroundColor Gray
Write-Host "Total broken links found: $totalBrokenLinks" -ForegroundColor Gray
Write-Host "Unique broken links: $($brokenLinks.Count)" -ForegroundColor Gray
Write-Host ""

if ($brokenLinks.Count -eq 0) {
    Write-Host "✅ No broken links found!" -ForegroundColor Green
    exit 0
}

Write-Host "🔝 TOP 20 MOST FREQUENT BROKEN LINKS:" -ForegroundColor Yellow
Write-Host ""

$topBroken = $brokenLinks.GetEnumerator() | 
    Sort-Object { $_.Value.Count } -Descending | 
    Select-Object -First 20

$rank = 1
foreach ($broken in $topBroken) {
    Write-Host "$rank. $($broken.Key)" -ForegroundColor Red
    Write-Host "   ❌ Broken in $($broken.Value.Count) file(s)" -ForegroundColor Gray
    Write-Host "   📄 Files: $($broken.Value.Files[0..2] -join ', ')" -ForegroundColor Gray
    if ($broken.Value.Files.Count -gt 3) {
        Write-Host "      ... and $($broken.Value.Files.Count - 3) more" -ForegroundColor Gray
    }
    Write-Host ""
    $rank++
}

# Export full report
$reportPath = Join-Path $rootDir "broken-links-report.json"
$brokenLinks | ConvertTo-Json -Depth 10 | Out-File $reportPath -Encoding UTF8
Write-Host "📄 Full report exported to: broken-links-report.json" -ForegroundColor Cyan
Write-Host ""

# Export CSV for easy editing
$csvPath = Join-Path $rootDir "broken-links-top20.csv"
$csvData = $topBroken | ForEach-Object {
    [PSCustomObject]@{
        BrokenLink = $_.Key
        Occurrences = $_.Value.Count
        ExampleFile = $_.Value.Files[0]
        SuggestedFix = ""
        Status = "Not Fixed"
    }
}
$csvData | Export-Csv $csvPath -NoTypeInformation -Encoding UTF8
Write-Host "📊 Top 20 exported to CSV: broken-links-top20.csv" -ForegroundColor Cyan
Write-Host "   Edit the 'SuggestedFix' column to provide correct paths" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review broken-links-top20.csv" -ForegroundColor Gray
Write-Host "2. Add correct paths in 'SuggestedFix' column" -ForegroundColor Gray
Write-Host "3. Run with -FixLinks to apply fixes automatically" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
