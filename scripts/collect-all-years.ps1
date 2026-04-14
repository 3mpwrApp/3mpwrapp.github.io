# Automated Multi-Year Collection Runner
# Run this script daily (after 8 PM ET) to continue all in-progress collections
#
# Usage: .\scripts\collect-all-years.ps1

$ErrorActionPreference = "Stop"
Set-Location "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ONWSIAT Multi-Year Collection Runner" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Years to collect (in order)
$years = @(2020, 2021, 2022, 2023)
$maxCalls = 1200

foreach ($year in $years) {
    $progressFile = "data\tribunal-decisions\.ultra-slow-progress-onwsiat-$year.json"
    $outputFile = "data\tribunal-decisions\onwsiat-$year-ultra-slow.json"
    
    # Check if collection is complete
    if (Test-Path $outputFile) {
        $data = Get-Content $outputFile -Raw | ConvertFrom-Json
        Write-Host "📊 Year $year Status: $($data.Count) cases collected" -ForegroundColor Yellow
    } else {
        Write-Host "📊 Year $year Status: Not started" -ForegroundColor Yellow
    }
    
    # Check progress
    if (Test-Path $progressFile) {
        $progress = Get-Content $progressFile -Raw | ConvertFrom-Json
        $collected = $progress.collected.Count
        $lastCase = $progress.lastCaseNum
        Write-Host "   Resume from case #$lastCase ($collected collected so far)" -ForegroundColor Gray
    }
    
    Write-Host "`n🚀 Starting $year collection (max $maxCalls calls)...`n" -ForegroundColor Green
    
    try {
        node scripts/collect-ultra-slow.js --database=onwsiat --year=$year --max=$maxCalls
        
        # Check exit code
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Year $year collection completed/paused successfully`n" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️  Year $year collection ended with exit code $LASTEXITCODE`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "`n❌ Error collecting year $year`: $_`n" -ForegroundColor Red
        continue
    }
    
    # Small delay between years
    Start-Sleep -Seconds 5
}

Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Collection Run Complete" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Summary
Write-Host "`n📊 COLLECTION SUMMARY:`n" -ForegroundColor Cyan
foreach ($year in $years) {
    $outputFile = "data\tribunal-decisions\onwsiat-$year-ultra-slow.json"
    if (Test-Path $outputFile) {
        $data = Get-Content $outputFile -Raw | ConvertFrom-Json
        Write-Host "   $year`: $($data.Count) cases" -ForegroundColor White
    } else {
        Write-Host "   $year`: Not started" -ForegroundColor Gray
    }
}

Write-Host "`n💡 Run this script daily (after 8 PM ET) to continue collection`n" -ForegroundColor Yellow
