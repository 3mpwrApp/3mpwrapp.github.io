# Fix broken links based on CSV mapping
# Reads broken-links-top20.csv and applies suggested fixes

param(
    [switch]$DryRun = $false
)

$ErrorActionPreference = 'Stop'

$rootDir = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $PSCommandPath))
$csvPath = Join-Path $rootDir "broken-links-top20.csv"

if (-not (Test-Path $csvPath)) {
    Write-Host "ERROR: broken-links-top20.csv not found" -ForegroundColor Red
    Write-Host "Run find-broken-links.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Loading broken link fixes from CSV..." -ForegroundColor Cyan
$fixes = Import-Csv $csvPath | Where-Object { $_.Status -eq "Ready" }

if ($fixes.Count -eq 0) {
    Write-Host "No links marked as 'Ready' in CSV" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($fixes.Count) links ready to fix" -ForegroundColor Green
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN MODE - No files will be modified" -ForegroundColor Yellow
    Write-Host ""
}

$fixCount = 0

foreach ($fix in $fixes) {
    $brokenLink = $fix.BrokenLink
    $suggestedFix = $fix.SuggestedFix
    
    if ([string]::IsNullOrWhiteSpace($suggestedFix)) {
        continue
    }
    
    Write-Host "Fixing: $brokenLink -> $suggestedFix" -ForegroundColor Cyan
    
    # Get all markdown files
    $markdownFiles = Get-ChildItem -Path $rootDir -Filter *.md -Recurse | 
        Where-Object { 
            $_.FullName -notlike "*node_modules*" -and 
            $_.FullName -notlike "*\.git*" -and
            $_.FullName -notlike "*vendor*"
        }
    
    $filesChanged = 0
    
    foreach ($file in $markdownFiles) {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        if ($content -match [regex]::Escape($brokenLink)) {
            $filesChanged++
            
            if ($DryRun) {
                Write-Host "   Would fix: $($file.FullName.Replace($rootDir, ''))" -ForegroundColor Gray
            } else {
                # Replace broken link with fixed link
                $newContent = $content -replace [regex]::Escape($brokenLink), $suggestedFix
                $newContent | Set-Content $file.FullName -Encoding UTF8 -NoNewline
                Write-Host "   Fixed: $($file.FullName.Replace($rootDir, ''))" -ForegroundColor Green
            }
        }
    }
    
    if ($filesChanged -gt 0) {
        $fixCount++
        Write-Host "   Total files fixed: $filesChanged" -ForegroundColor Gray
    } else {
        Write-Host "   No files contained this link" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host "DRY RUN COMPLETE" -ForegroundColor Yellow
    Write-Host "Would have fixed $fixCount broken link types" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Run without -DryRun to apply fixes" -ForegroundColor Cyan
} else {
    Write-Host "FIXES APPLIED" -ForegroundColor Green
    Write-Host "Fixed $fixCount broken link types" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next: Run find-broken-links.ps1 again to verify" -ForegroundColor Cyan
}
Write-Host "===============================================" -ForegroundColor Cyan
