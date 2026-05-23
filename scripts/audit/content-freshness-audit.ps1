# Content Freshness Audit Script
# Finds markdown files not updated in 6+ months
# Run monthly to identify stale content

param(
    [int]$DaysOld = 180,  # Default 6 months
    [string]$OutputFile = "docs/content-freshness-report.json"
)

Write-Host "Content Freshness Audit" -ForegroundColor Cyan
Write-Host "Finding files not updated in $DaysOld+ days..." -ForegroundColor Gray
Write-Host ""

$cutoffDate = (Get-Date).AddDays(-$DaysOld)
$rootPath = $PSScriptRoot -replace '\\scripts$', ''

# Find all markdown files
$allMarkdownFiles = Get-ChildItem -Path $rootPath -Filter *.md -Recurse -File | Where-Object {
    # Exclude node_modules, .git, vendor
    $_.FullName -notmatch '(node_modules|\.git|vendor|Gemfile)'
}

Write-Host "Total markdown files: $($allMarkdownFiles.Count)" -ForegroundColor Gray
Write-Host ""

# Find stale files
$staleFiles = $allMarkdownFiles | Where-Object {
    $_.LastWriteTime -lt $cutoffDate
} | Sort-Object LastWriteTime

Write-Host "Stale files (>$DaysOld days old): $($staleFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Create report
$report = @{
    generatedAt = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
    cutoffDate = $cutoffDate.ToString("yyyy-MM-dd")
    daysOld = $DaysOld
    totalFiles = $allMarkdownFiles.Count
    staleFiles = $staleFiles.Count
    files = @($staleFiles | ForEach-Object {
        $relativePath = $_.FullName -replace [regex]::Escape($rootPath), '' -replace '^\\', ''
        $daysStale = [math]::Floor((Get-Date) - $_.LastWriteTime).TotalDays
        
        @{
            path = $relativePath
            lastModified = $_.LastWriteTime.ToString("yyyy-MM-dd")
            daysStale = $daysStale
            size = $_.Length
        }
    })
}

# Save JSON report
$reportDir = Split-Path $OutputFile -Parent
if (!(Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report | ConvertTo-Json -Depth 10 | Out-File $OutputFile -Encoding UTF8
Write-Host "Report saved: $OutputFile" -ForegroundColor Green
Write-Host ""

# Display top 20 stalest files
if ($staleFiles.Count -gt 0) {
    Write-Host "Top 20 Stalest Files:" -ForegroundColor Cyan
    Write-Host ""
    
    $staleFiles | Select-Object -First 20 | ForEach-Object {
        $relativePath = $_.FullName -replace [regex]::Escape($rootPath), '' -replace '^\\', ''
        $daysStale = [math]::Floor(((Get-Date) - $_.LastWriteTime).TotalDays)
        $lastModified = $_.LastWriteTime.ToString("yyyy-MM-dd")
        
        Write-Host "  FILE: $relativePath" -ForegroundColor White
        Write-Host "     Last modified: $lastModified - $daysStale days ago" -ForegroundColor Gray
        Write-Host ""
    }
    
    if ($staleFiles.Count -gt 20) {
        $remainingCount = $staleFiles.Count - 20
        Write-Host "  ... and $remainingCount more" -ForegroundColor Gray
        Write-Host ""
    }
}

# Recommendations
Write-Host "Recommendations:" -ForegroundColor Cyan
Write-Host ""

if ($staleFiles.Count -eq 0) {
    Write-Host "  All content is fresh! No action needed." -ForegroundColor Green
} elseif ($staleFiles.Count -lt 50) {
    Write-Host "  Review stale files:" -ForegroundColor Yellow
    Write-Host "     - Check if content is still accurate" -ForegroundColor Gray
    Write-Host "     - Update dates, statistics, links" -ForegroundColor Gray
    Write-Host "     - Archive or delete if no longer relevant" -ForegroundColor Gray
} else {
    Write-Host "  Many stale files detected:" -ForegroundColor Red
    Write-Host "     - Prioritize high-traffic pages first" -ForegroundColor Gray
    Write-Host "     - Consider archiving old content" -ForegroundColor Gray
    Write-Host "     - Set up quarterly content review process" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Audit complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review report: $OutputFile" -ForegroundColor Gray
Write-Host "  2. Update or archive stale content" -ForegroundColor Gray
Write-Host "  3. Schedule next audit in 30 days" -ForegroundColor Gray
Write-Host ""
