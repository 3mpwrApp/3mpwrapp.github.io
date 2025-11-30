# Start Android Emulator Helper Script
# Finds Android SDK and launches emulator

param(
    [string]$AVDName = "Pixel_8_API_34"
)

# Common Android SDK locations
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe",
    "$env:APPDATA\Android\Sdk\emulator\emulator.exe",
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk\emulator\emulator.exe",
    "C:\Android\Sdk\emulator\emulator.exe",
    "$env:ANDROID_HOME\emulator\emulator.exe"
)

$emulatorPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $emulatorPath = $path
        break
    }
}

if (-not $emulatorPath) {
    Write-Host "ERROR: Could not find Android emulator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Android Studio and create an AVD, or set ANDROID_HOME environment variable" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To find your emulator manually:" -ForegroundColor Cyan
    Write-Host "1. Open Android Studio" -ForegroundColor White
    Write-Host "2. Go to Tools -> SDK Manager -> Android SDK Location" -ForegroundColor White
    Write-Host "3. The emulator is at: <SDK Location>\emulator\emulator.exe" -ForegroundColor White
    exit 1
}

Write-Host "Found emulator at: $emulatorPath" -ForegroundColor Green

# List available AVDs
Write-Host ""
Write-Host "Available Android Virtual Devices:" -ForegroundColor Cyan
$emulatorDir = Split-Path $emulatorPath -Parent
& "$emulatorDir\emulator.exe" -list-avds

Write-Host ""
Write-Host "Starting emulator: $AVDName" -ForegroundColor Green
& "$emulatorDir\emulator.exe" -avd $AVDName
