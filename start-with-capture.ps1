# Start 3mpwr App with Screenshot Capture
# Launches Expo dev server and screenshot capture tool together

Write-Host "================================" -ForegroundColor Cyan
Write-Host "3mpwr App - Start with Capture" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if device is connected
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
adb devices
Write-Host ""

# Create directories if they don't exist
$screenshotDir = ".\play-store-assets\screenshots"
$videoDir = ".\play-store-assets\videos"
if (-not (Test-Path $screenshotDir)) {
    New-Item -ItemType Directory -Path $screenshotDir -Force | Out-Null
}
if (-not (Test-Path $videoDir)) {
    New-Item -ItemType Directory -Path $videoDir -Force | Out-Null
}

# Start Expo in a new window
Write-Host "🚀 Starting Expo dev server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx expo start --android"

# Wait a moment for server to initialize
Write-Host "⏳ Waiting for server to initialize (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "✓ Expo server started in separate window" -ForegroundColor Green
Write-Host "✓ App should be loading on your device" -ForegroundColor Green
Write-Host ""
Write-Host "Starting screenshot capture tool..." -ForegroundColor Cyan
Write-Host ""

# Run the capture script in this window
& ".\capture-screenshots.ps1"
