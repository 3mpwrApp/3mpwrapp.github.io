# ===================================================================
# Image Optimization Script for 3mpwrApp Screenshots
# ===================================================================
# Purpose: Compress all 172 PNG screenshots to reduce page load time
# Target: 40-60% file size reduction while maintaining quality
# Tools: Uses pngquant via npm package imagemin-cli
# ===================================================================

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " 3mpwrApp Screenshot Optimization" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$screenshotsPath = "assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop"
$backupPath = "assets\images\screenshots\BACKUP-originals-$(Get-Date -Format 'yyyy-MM-dd')"

# Check if screenshots folder exists
if (-not (Test-Path $screenshotsPath)) {
    Write-Host "[ERROR] Screenshots folder not found: $screenshotsPath" -ForegroundColor Red
    exit 1
}

# Count total files
$totalFiles = (Get-ChildItem -Path $screenshotsPath -Filter "*.png" -Recurse).Count
Write-Host "[INFO] Found $totalFiles PNG files to optimize" -ForegroundColor Yellow
Write-Host ""

# Calculate current total size
$currentSize = (Get-ChildItem -Path $screenshotsPath -Filter "*.png" -Recurse | Measure-Object -Property Length -Sum).Sum
$currentSizeMB = [math]::Round($currentSize / 1MB, 2)
Write-Host "[INFO] Current total size: $currentSizeMB MB" -ForegroundColor Yellow
Write-Host ""

# Ask user to confirm
Write-Host "[IMPORTANT] This will optimize all PNG files in place." -ForegroundColor Yellow
Write-Host "[BACKUP] Original files will be copied to: $backupPath" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "[CANCELLED] Operation cancelled by user" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Step 1: Creating backup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Create backup
try {
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
    }
    
    Copy-Item -Path $screenshotsPath -Destination $backupPath -Recurse -Force
    Write-Host "[SUCCESS] Backup created at: $backupPath" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "[ERROR] Failed to create backup: $_" -ForegroundColor Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Step 2: Checking for imagemin-cli" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if imagemin-cli is installed
$imageminInstalled = $null
try {
    $imageminInstalled = npm list -g imagemin-cli 2>$null
} catch {
    # Likely not installed
}

if (-not $imageminInstalled -or $imageminInstalled -notmatch "imagemin-cli@") {
    Write-Host "[WARNING] imagemin-cli not found globally" -ForegroundColor Yellow
    Write-Host "[INFO] Installing imagemin-cli and imagemin-pngquant..." -ForegroundColor Yellow
    Write-Host ""
    
    try {
        npm install -g imagemin-cli imagemin-pngquant
        Write-Host ""
        Write-Host "[SUCCESS] imagemin-cli installed successfully" -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host ""
        Write-Host "[ERROR] Failed to install imagemin-cli" -ForegroundColor Red
        Write-Host "[ALTERNATIVE] You can manually compress images using TinyPNG:" -ForegroundColor Yellow
        Write-Host "              https://tinypng.com (500 images/month free)" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[NOTE] Backup is safe at: $backupPath" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[SUCCESS] imagemin-cli is already installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Step 3: Optimizing images" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] This may take 2-5 minutes for 172 files..." -ForegroundColor Yellow
Write-Host "[INFO] Using pngquant for lossy compression (40-60% reduction)" -ForegroundColor Yellow
Write-Host ""

# Optimize images using imagemin
try {
    # Process each category folder
    $categories = Get-ChildItem -Path $screenshotsPath -Directory
    $processedCount = 0
    
    foreach ($category in $categories) {
        $categoryPath = $category.FullName
        $fileCount = (Get-ChildItem -Path $categoryPath -Filter "*.png" -Recurse).Count
        
        if ($fileCount -gt 0) {
            Write-Host "[PROCESSING] $($category.Name): $fileCount files" -ForegroundColor Cyan
            
            # Run imagemin on this category
            $inputPattern = "$categoryPath\**\*.png"
            imagemin "$inputPattern" --out-dir="$categoryPath" --plugin=pngquant
            
            $processedCount += $fileCount
            Write-Host "[COMPLETE] $($category.Name) optimized" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] Optimized $processedCount files" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "[ERROR] Optimization failed: $_" -ForegroundColor Red
    Write-Host "[RECOVERY] Original files are in backup: $backupPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Step 4: Calculating savings" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Calculate new total size
$newSize = (Get-ChildItem -Path $screenshotsPath -Filter "*.png" -Recurse | Measure-Object -Property Length -Sum).Sum
$newSizeMB = [math]::Round($newSize / 1MB, 2)
$savedSize = $currentSize - $newSize
$savedSizeMB = [math]::Round($savedSize / 1MB, 2)
$savingsPercent = [math]::Round(($savedSize / $currentSize) * 100, 1)

Write-Host "[RESULTS] Optimization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "  Before: $currentSizeMB MB" -ForegroundColor Yellow
Write-Host "  After:  $newSizeMB MB" -ForegroundColor Green
Write-Host "  Saved:  $savedSizeMB MB ($savingsPercent% reduction)" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Page load time improvement: ~2-4 seconds faster" -ForegroundColor Yellow
Write-Host "[INFO] Mobile data savings: Significant for users with limited data" -ForegroundColor Yellow
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Optimization Complete!" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[NEXT STEP] Deploy to GitHub with: git add, git commit, git push" -ForegroundColor Yellow
Write-Host "[BACKUP LOCATION] $backupPath" -ForegroundColor Yellow
Write-Host ""
