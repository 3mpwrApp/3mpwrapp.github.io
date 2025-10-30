# Clear Metro cache and restart Expo
Write-Host "Clearing Metro bundler cache..." -ForegroundColor Cyan

# Stop any running Expo/Node processes
Get-Process | Where-Object { $_.ProcessName -like "*expo*" -or $_.ProcessName -like "*node*" } | Stop-Process -Force
Write-Host "Stopped running processes" -ForegroundColor Green

# Clear Metro cache
Remove-Item -Path ".\.expo" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Cleared cache directories" -ForegroundColor Green

# Restart with clear cache flag
Write-Host ""
Write-Host "Starting Expo with clear cache..." -ForegroundColor Cyan
npx expo start --clear --android
