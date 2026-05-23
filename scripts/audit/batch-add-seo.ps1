# Batch process SEO metadata for multiple files
# Part of comprehensive website audit remediation

param(
    [int]$MaxFiles = 100,
    [switch]$DryRun = $false
)

$ErrorActionPreference = 'Continue'

Write-Host "Batch SEO Metadata Addition" -ForegroundColor Cyan
Write-Host "Max files to process: $MaxFiles" -ForegroundColor Gray
Write-Host "Mode: $(if ($DryRun) { 'DRY RUN' } else { 'LIVE' })" -ForegroundColor Gray
Write-Host ""

$rootDir = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$scriptPath = Join-Path (Split-Path -Parent $PSCommandPath) "add-seo-metadata.ps1"

# Priority files (public-facing pages)
$priorityFiles = @(
    "about.md",
    "accessibility.md",
    "contact.md",
    "faq.md",
    "privacy.md",
    "security.md",
    "roadmap.md",
    "whats-new.md",
    "crisis-resources.md",
    "research-data-sources.md",
    "how-to-use-this-data.md",
    "tribunal-visualizations.md",
    "feedback.md"
)

$processed = 0
$updated = 0
$alreadyComplete = 0
$errors = 0

Write-Host "Processing priority public-facing pages..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $priorityFiles) {
    $filePath = Join-Path $rootDir $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "Skipped (not found): $file" -ForegroundColor Gray
        continue
    }
    
    $processed++
    
    try {
        $result = & powershell -ExecutionPolicy Bypass -File $scriptPath -FilePath $filePath -DryRun:$DryRun 2>&1
        
        if ($result -match "Already has SEO metadata") {
            $alreadyComplete++
            Write-Host "[OK] $file" -ForegroundColor Gray
        }
        elseif ($result -match "Updated") {
            $updated++
            Write-Host "[UPDATED] $file" -ForegroundColor Green
        }
        elseif ($result -match "Error") {
            $errors++
            Write-Host "[ERROR] $file" -ForegroundColor Red
            Write-Host "   $result" -ForegroundColor Gray
        }
    }
    catch {
        $errors++
        Write-Host "[FAILED] $file" -ForegroundColor Red
        Write-Host "   $($_.Exception.Message)" -ForegroundColor Gray
    }
    
    if ($processed -ge $MaxFiles) {
        break
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "BATCH PROCESSING SUMMARY" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files processed: $processed" -ForegroundColor Gray
Write-Host "Already complete: $alreadyComplete" -ForegroundColor Green
Write-Host "Updated: $updated" -ForegroundColor Green
Write-Host "Errors: $errors" -ForegroundColor Red
Write-Host ""

if ($DryRun) {
    Write-Host "DRY RUN COMPLETE - No changes were made" -ForegroundColor Yellow
    Write-Host "   Run without -DryRun to apply changes" -ForegroundColor Gray
} else {
    Write-Host "BATCH COMPLETE" -ForegroundColor Green
}
