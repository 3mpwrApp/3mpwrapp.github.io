# Screenshot and Video Capture Script for 3mpwr App
# Uses ADB to capture from connected Android device

$screenshotDir = ".\play-store-assets\screenshots"
$videoDir = ".\play-store-assets\videos"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "3mpwr App - Screenshot Capture" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
adb devices
Write-Host ""

function Capture-Screenshot {
    param(
        [string]$name,
        [string]$description
    )
    
    Write-Host "Ready to capture: $description" -ForegroundColor Green
    Write-Host "   Press ENTER when ready..." -ForegroundColor Yellow
    Read-Host
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $filename = "$name-$timestamp.png"
    $devicePath = "/sdcard/$filename"
    $localPath = "$screenshotDir\$filename"
    
    Write-Host "   Capturing..." -ForegroundColor Yellow
    adb exec-out screencap -p > $localPath
    
    if (Test-Path $localPath) {
        Write-Host "   Saved: $filename" -ForegroundColor Green
        Write-Host ""
        return $true
    } else {
        Write-Host "   Failed to capture screenshot" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

function Start-VideoRecording {
    param(
        [string]$name,
        [string]$description,
        [int]$duration = 30
    )
    
    Write-Host "Ready to record: $description" -ForegroundColor Green
    Write-Host "   Duration: $duration seconds" -ForegroundColor Yellow
    Write-Host "   Press ENTER to start recording..." -ForegroundColor Yellow
    Read-Host
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $filename = "$name-$timestamp.mp4"
    $devicePath = "/sdcard/$filename"
    $localPath = "$videoDir\$filename"
    
    Write-Host "   Recording... ($duration seconds)" -ForegroundColor Red
    adb shell screenrecord --time-limit $duration $devicePath
    
    Write-Host "   Downloading video..." -ForegroundColor Yellow
    adb pull $devicePath $localPath
    adb shell rm $devicePath
    
    if (Test-Path $localPath) {
        Write-Host "   Saved: $filename" -ForegroundColor Green
        Write-Host ""
        return $true
    } else {
        Write-Host "   Failed to capture video" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

# Main menu
while ($true) {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Select capture mode:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "1. Capture all 8 screenshots (guided)" -ForegroundColor White
    Write-Host "2. Capture single screenshot" -ForegroundColor White
    Write-Host "3. Record video (30 seconds)" -ForegroundColor White
    Write-Host "4. Record video (60 seconds)" -ForegroundColor White
    Write-Host "5. Quick screenshot (no pause)" -ForegroundColor White
    Write-Host "6. Exit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Enter choice (1-6)"
    Write-Host ""
    
    switch ($choice) {
        "1" {
            Write-Host "Starting guided screenshot capture..." -ForegroundColor Cyan
            Write-Host "Navigate to each screen on your device and press ENTER to capture." -ForegroundColor Yellow
            Write-Host ""
            
            Capture-Screenshot "01-home-dashboard" "Home Screen / Dashboard"
            Capture-Screenshot "02-wellness-hub" "Wellness Hub"
            Capture-Screenshot "03-resources" "Resources - Deadlines and Rights"
            Capture-Screenshot "04-advocacy-tools" "Advocacy Tools - AI Assistant"
            Capture-Screenshot "05-community" "Community and Campaigns"
            Capture-Screenshot "06-accessibility" "Settings - Accessibility Features"
            Capture-Screenshot "07-daily-planner" "Daily Planner / Wellness Tool"
            Capture-Screenshot "08-privacy-security" "Privacy and Security"
            
            Write-Host "All screenshots captured!" -ForegroundColor Green
            Write-Host "   Location: $screenshotDir" -ForegroundColor Yellow
            Write-Host ""
        }
        "2" {
            $name = Read-Host "Enter screenshot name (e.g., feature-name)"
            $description = Read-Host "Enter description"
            Capture-Screenshot $name $description
        }
        "3" {
            $name = Read-Host "Enter video name (e.g., app-demo)"
            $description = Read-Host "Enter description"
            Start-VideoRecording $name $description 30
        }
        "4" {
            $name = Read-Host "Enter video name (e.g., full-tour)"
            $description = Read-Host "Enter description"
            Start-VideoRecording $name $description 60
        }
        "5" {
            $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
            $filename = "screenshot-$timestamp.png"
            $localPath = "$screenshotDir\$filename"
            
            Write-Host "Capturing screenshot..." -ForegroundColor Yellow
            adb exec-out screencap -p > $localPath
            
            if (Test-Path $localPath) {
                Write-Host "Saved: $filename" -ForegroundColor Green
                Write-Host ""
            }
        }
        "6" {
            Write-Host "Goodbye!" -ForegroundColor Green
            exit
        }
        default {
            Write-Host "Invalid choice. Please select 1-6." -ForegroundColor Red
            Write-Host ""
        }
    }
}
