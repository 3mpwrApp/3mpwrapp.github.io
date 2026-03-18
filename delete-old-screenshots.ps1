# Delete Old Screenshots Script
# Purpose: Remove all existing screenshots before copying new ones
# Date: March 17, 2026

$screenshotsPath = "assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " DELETE OLD SCREENSHOTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running from correct directory
if (!(Test-Path "app-tour.md")) {
    Write-Host "[ERROR] Please run this script from the website root directory:" -ForegroundColor Red
    Write-Host "   d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\" -ForegroundColor Yellow
    exit 1
}

# Check if screenshots folder exists
if (!(Test-Path $screenshotsPath)) {
    Write-Host "[ERROR] Screenshots folder not found at:" -ForegroundColor Red
    Write-Host "   $screenshotsPath" -ForegroundColor Yellow
    exit 1
}

# Count files before deletion
$filesBefore = (Get-ChildItem $screenshotsPath -Recurse -File).Count
$foldersBefore = (Get-ChildItem $screenshotsPath -Recurse -Directory).Count

Write-Host "Current State:" -ForegroundColor Yellow
Write-Host "   Files: $filesBefore" -ForegroundColor White
Write-Host "   Folders: $foldersBefore" -ForegroundColor White
Write-Host ""

# Ask for confirmation
Write-Host "[WARNING] This will delete ALL files in:" -ForegroundColor Yellow
Write-Host "   $screenshotsPath" -ForegroundColor White
Write-Host ""
$confirmation = Read-Host "Type 'DELETE' to confirm (or anything else to cancel)"

if ($confirmation -ne "DELETE") {
    Write-Host "`n[CANCELLED] Deletion cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nDeleting old screenshots..." -ForegroundColor Cyan

try {
    # Remove all files and subfolders
    Get-ChildItem $screenshotsPath -Recurse | Remove-Item -Recurse -Force -ErrorAction Stop
    
    Write-Host "[SUCCESS] Successfully deleted all old screenshots" -ForegroundColor Green
    Write-Host "   $filesBefore files removed" -ForegroundColor White
    Write-Host "   $foldersBefore folders removed" -ForegroundColor White
    Write-Host ""
    Write-Host "Ready for new screenshots!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next step: Run copy-new-screenshots.ps1" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Host "[ERROR] Failed to delete screenshots" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    exit 1
}
