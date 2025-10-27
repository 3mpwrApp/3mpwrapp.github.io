# PowerShell script to help identify and fix remaining gap properties
# Run this to get a summary of remaining work

Write-Host "`n=== REMAINING GAP PROPERTIES ===" -ForegroundColor Cyan

# Search for gap properties
$gapFiles = git grep -n "gap:\s*\d" -- "*.tsx" "*.ts" | Where-Object { $_ -notmatch "GapView" }

$grouped = $gapFiles | Group-Object { ($_ -split ":")[0] }

Write-Host "`nTotal files with gaps: $($grouped.Count)" -ForegroundColor Yellow

Write-Host "`n=== BY PRIORITY ===" -ForegroundColor Cyan

Write-Host "`nHIGH PRIORITY (App Screens):" -ForegroundColor Green
$grouped | Where-Object { $_.Name -match "app/(onboarding|research|auth)" } | ForEach-Object {
    $file = $_.Name
    $count = $_.Count
    Write-Host "  $file ($count gaps)"
}

Write-Host "`nMEDIUM PRIORITY (Settings/Resources/Wellness):" -ForegroundColor Yellow
$grouped | Where-Object { $_.Name -match "app/\(tabs\)/(settings|resources|wellness)" } | ForEach-Object {
    $file = $_.Name
    $count = $_.Count
    Write-Host "  $file ($count gaps)"
}

Write-Host "`nLOW PRIORITY (Community/Advocacy/Admin):" -ForegroundColor Gray
$grouped | Where-Object { $_.Name -match "app/\(tabs\)/(community|advocacy|admin)" } | ForEach-Object {
    $file = $_.Name
    $count = $_.Count
    Write-Host "  $file ($count gaps)"
}

Write-Host "`nCOMPONENTS:" -ForegroundColor Magenta
$grouped | Where-Object { $_.Name -match "components/" } | ForEach-Object {
    $file = $_.Name
    $count = $_.Count
    Write-Host "  $file ($count gaps)"
}

Write-Host "`n"
