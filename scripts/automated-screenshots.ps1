# Automated Screenshot Script for 3mpwr App
# Run this with emulators to capture screenshots automatically

param(
    [string]$DeviceName = "emulator-5554",
    [string]$OutputDir = "screenshots"
)

Write-Host "Starting automated screenshot capture for 3mpwr App..." -ForegroundColor Cyan

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Helper functions
function Take-Screenshot {
    param([string]$Name)
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "${Name}_${timestamp}.png"
    Write-Host " Taking screenshot: $filename" -ForegroundColor Green
    adb -s $DeviceName shell screencap -p /sdcard/$filename
    adb -s $DeviceName pull /sdcard/$filename "$OutputDir/$filename"
    adb -s $DeviceName shell rm /sdcard/$filename
    Start-Sleep -Seconds 1
}

function Tap-Screen {
    param([int]$X, [int]$Y)
    Write-Host " Tapping at ($X, $Y)" -ForegroundColor Yellow
    adb -s $DeviceName shell input tap $X $Y
    Start-Sleep -Seconds 2
}

function Swipe-Up {
    Write-Host "  Scrolling up" -ForegroundColor Magenta
    adb -s $DeviceName shell input swipe 500 1500 500 500 300
    Start-Sleep -Seconds 1
}

function Press-Back {
    Write-Host "  Pressing back" -ForegroundColor Blue
    adb -s $DeviceName shell input keyevent 4
    Start-Sleep -Seconds 1
}

# Check if device is connected
$devices = adb devices
if ($devices -notmatch $DeviceName) {
    Write-Host " Device $DeviceName not found!" -ForegroundColor Red
    Write-Host "Available devices:" -ForegroundColor Yellow
    adb devices
    exit 1
}

Write-Host " Device found: $DeviceName" -ForegroundColor Green
Write-Host ""

# Launch app
Write-Host " Launching 3mpwr App..." -ForegroundColor Cyan
adb -s $DeviceName shell am start -n com.app3mpwr.app3mpwr/.MainActivity
Start-Sleep -Seconds 5

# === TERMS GATE ===
Write-Host "`n Processing Terms Gate..." -ForegroundColor Cyan
Take-Screenshot "01_welcome"

# Click Continue
Tap-Screen 540 2000
Start-Sleep -Seconds 2
Take-Screenshot "02_terms_of_service"

# Scroll Terms
Swipe-Up
Swipe-Up
Swipe-Up
Swipe-Up
Start-Sleep -Seconds 1

# Click Next
Tap-Screen 540 2200
Start-Sleep -Seconds 2
Take-Screenshot "03_privacy_policy"

# Scroll Privacy
Swipe-Up
Swipe-Up
Swipe-Up
Swipe-Up
Start-Sleep -Seconds 1

# Click Next
Tap-Screen 540 2200
Start-Sleep -Seconds 2
Take-Screenshot "04_medical_disclaimer"

# Accept all disclaimers (tap checkbox areas and Next buttons)
# Medical
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 540 2200
Start-Sleep -Seconds 2

# Legal
Take-Screenshot "05_legal_disclaimer"
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 540 2200
Start-Sleep -Seconds 2

# Financial
Take-Screenshot "06_financial_disclaimer"
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 540 2200
Start-Sleep -Seconds 2

# AI
Take-Screenshot "07_ai_disclaimer"
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 540 2200
Start-Sleep -Seconds 2

# Crisis (2 checkboxes)
Take-Screenshot "08_crisis_disclaimer"
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 200 1200
Start-Sleep -Seconds 1
Tap-Screen 540 2200
Start-Sleep -Seconds 2

# Final (2 checkboxes)
Take-Screenshot "09_final_disclaimers"
Tap-Screen 200 1000
Start-Sleep -Seconds 1
Tap-Screen 200 1200
Start-Sleep -Seconds 1

# Accept All
Tap-Screen 540 2200
Start-Sleep -Seconds 3

# === MAIN APP ===
Write-Host "`n Capturing Home Tab..." -ForegroundColor Cyan
Take-Screenshot "10_home_tab"
Swipe-Up
Start-Sleep -Seconds 1
Take-Screenshot "11_home_scrolled"
Swipe-Up
Start-Sleep -Seconds 1

# Campaigns Tab (bottom: ~2300, spacing: ~216px each)
Write-Host "`n Capturing Campaigns Tab..." -ForegroundColor Cyan
Tap-Screen 324 2300
Start-Sleep -Seconds 2
Take-Screenshot "12_campaigns_tab"
Swipe-Up
Start-Sleep -Seconds 1
Take-Screenshot "13_campaigns_scrolled"

# Community Tab
Write-Host "`n Capturing Community Tab..." -ForegroundColor Cyan
Tap-Screen 540 2300
Start-Sleep -Seconds 2
Take-Screenshot "14_community_tab"
Swipe-Up
Start-Sleep -Seconds 1

# Resources Tab
Write-Host "`n Capturing Resources Tab..." -ForegroundColor Cyan
Tap-Screen 756 2300
Start-Sleep -Seconds 2
Take-Screenshot "15_resources_tab"
Swipe-Up
Start-Sleep -Seconds 1
Take-Screenshot "16_resources_scrolled"

# Wellness Tab
Write-Host "`n Capturing Wellness Tab..." -ForegroundColor Cyan
Tap-Screen 972 2300
Start-Sleep -Seconds 2
Take-Screenshot "17_wellness_tab"
Swipe-Up
Start-Sleep -Seconds 1

# Click Spoon Economist (estimate position)
Tap-Screen 540 800
Start-Sleep -Seconds 2
Take-Screenshot "18_spoon_economist"
Press-Back
Start-Sleep -Seconds 2

# Advocacy Tab (far right, might need adjustment)
Write-Host "`n Capturing Advocacy Tab..." -ForegroundColor Cyan
Tap-Screen 108 2300  # First tab on left
Start-Sleep -Seconds 2
Take-Screenshot "19_advocacy_tab"
Swipe-Up
Start-Sleep -Seconds 1

# Settings Tab
Write-Host "`n Capturing Settings Tab..." -ForegroundColor Cyan
Tap-Screen 324 2300
Start-Sleep -Seconds 2
Take-Screenshot "20_settings_tab"
Swipe-Up
Swipe-Up
Start-Sleep -Seconds 1
Take-Screenshot "21_settings_scrolled"

Write-Host "Screenshot capture complete!" -ForegroundColor Green
Write-Host "Screenshots saved to: $OutputDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Captured screenshots:" -ForegroundColor Yellow
Get-ChildItem -Path $OutputDir -Filter "*.png" | Select-Object Name | Format-Table -AutoSize

