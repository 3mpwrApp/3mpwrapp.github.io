# Copy New Screenshots Script
# Purpose: Copy new screenshots from OneDrive to website with proper folder mapping
# Date: March 17, 2026

$sourcePath = "C:\Users\bookw\OneDrive\Desktop\3mpowrApp\Empowr App social media graphics\1-Official3mpwrAppScreenshots\laptop"
$destPath = "assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " COPY NEW SCREENSHOTS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if running from correct directory
if (!(Test-Path "app-tour.md")) {
    Write-Host "[ERROR] Please run this script from the website root directory:" -ForegroundColor Red
    Write-Host "   d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\" -ForegroundColor Yellow
    exit 1
}

# Check if source folder exists
if (!(Test-Path $sourcePath)) {
    Write-Host "[ERROR] Source folder not found at:" -ForegroundColor Red
    Write-Host "   $sourcePath" -ForegroundColor Yellow
    exit 1
}

# Check if destination is empty
if ((Get-ChildItem $destPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0) {
    Write-Host "[WARNING] Destination folder is not empty!" -ForegroundColor Yellow
    Write-Host "   Run delete-old-screenshots.ps1 first to clean up old files." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (type 'yes' to proceed)"
    if ($continue -ne "yes") {
        Write-Host "[CANCELLED] Copy cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Count source files
$sourceFiles = Get-ChildItem $sourcePath -Recurse -File
$totalFiles = $sourceFiles.Count

Write-Host "Source Statistics:" -ForegroundColor Yellow
Write-Host "   Total files to copy: $totalFiles" -ForegroundColor White
Write-Host ""

# Folder mapping configuration
# Maps source folder names to destination folder names
$folderMapping = @{
    "advocacy" = "advocacy"
    "campaigns" = "campaigns"
    "community" = "community"
    "events" = "events"
    "home" = "home"
    "research" = "research"
    "resources" = "resources"
    "settings" = "settings"
    "wellness" = "wellness"
    
    # Special mappings (renamed folders)
    "PROFILE-AVATAR" = "profile"
    "AppUpon1stLaunch3mpwrApp" = "termsgate"
    "AIAssistanttab" = "home"  # AI Assistant is part of home section
}

Write-Host "Folder Mapping:" -ForegroundColor Cyan
$folderMapping.GetEnumerator() | Sort-Object Key | ForEach-Object {
    if ($_.Key -ne $_.Value) {
        Write-Host "   $($_.Key) -> $($_.Value)" -ForegroundColor Yellow
    } else {
        Write-Host "   $($_.Key)" -ForegroundColor White
    }
}
Write-Host ""

$confirmation = Read-Host "Ready to copy $totalFiles files? (type 'yes' to proceed)"
if ($confirmation -ne "yes") {
    Write-Host "`n[CANCELLED] Copy cancelled." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nCopying files..." -ForegroundColor Cyan

$copiedFiles = 0
$errors = @()

# Get all folders in source
$sourceFolders = Get-ChildItem $sourcePath -Directory

foreach ($sourceFolder in $sourceFolders) {
    $sourceFolderName = $sourceFolder.Name
    
    # Check if folder has mapping
    if ($folderMapping.ContainsKey($sourceFolderName)) {
        $destFolderName = $folderMapping[$sourceFolderName]
    } else {
        Write-Host "[WARNING] No mapping found for '$sourceFolderName', using as-is" -ForegroundColor Yellow
        $destFolderName = $sourceFolderName
    }
    
    Write-Host "`nProcessing: $sourceFolderName -> $destFolderName" -ForegroundColor Cyan
    
    # Create destination folder
    $destFolderPath = Join-Path $destPath $destFolderName
    if (!(Test-Path $destFolderPath)) {
        New-Item -ItemType Directory -Path $destFolderPath -Force | Out-Null
    }
    
    # Get all files in source folder (including subfolders)
    $folderFiles = Get-ChildItem $sourceFolder.FullName -Recurse -File
    
    foreach ($file in $folderFiles) {
        try {
            # Calculate relative path within source folder
            $relativePath = $file.FullName.Substring($sourceFolder.FullName.Length + 1)
            
            # Build destination file path
            $destFilePath = Join-Path $destFolderPath $relativePath
            
            # Create subdirectories if needed
            $destFileDir = Split-Path $destFilePath -Parent
            if (!(Test-Path $destFileDir)) {
                New-Item -ItemType Directory -Path $destFileDir -Force | Out-Null
            }
            
            # Copy file
            Copy-Item $file.FullName $destFilePath -Force
            $copiedFiles++
            
            Write-Host "   [OK] $($file.Name)" -ForegroundColor Green
        }
        catch {
            $errorMsg = "Failed to copy $($file.Name): $_"
            $errors += $errorMsg
            Write-Host "   [FAIL] $($file.Name)" -ForegroundColor Red
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " COPY COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[SUCCESS] Successfully copied: $copiedFiles / $totalFiles files" -ForegroundColor Green

if ($errors.Count -gt 0) {
    Write-Host "[ERROR] Errors: $($errors.Count)" -ForegroundColor Red
    Write-Host "`nError details:" -ForegroundColor Yellow
    $errors | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
}

# Verify file count
$destFileCount = (Get-ChildItem $destPath -Recurse -File).Count
Write-Host "`nVerification:" -ForegroundColor Yellow
Write-Host "   Expected: $totalFiles files" -ForegroundColor White
Write-Host "   Actual:   $destFileCount files" -ForegroundColor White

if ($destFileCount -eq $totalFiles) {
    Write-Host "`n[SUCCESS] All files copied correctly!" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] File count mismatch!" -ForegroundColor Yellow
    Write-Host "   Please review the copy operation." -ForegroundColor Yellow
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "   1. Review copied files in: $destPath" -ForegroundColor White
Write-Host "   2. Update app-tour.md with new image references" -ForegroundColor White
Write-Host "   3. Add alt text and deep links" -ForegroundColor White
Write-Host "   4. Generate social media posts" -ForegroundColor White
Write-Host ""
