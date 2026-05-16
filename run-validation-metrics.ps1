# Calculate Validation Metrics
# Run after completing manual review of validation-samples.csv

Write-Host "`n📊 Ontario Tribunal Classification Validation Metrics" -ForegroundColor Cyan
Write-Host "===================================================`n" -ForegroundColor Gray

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detected: $nodeVersion`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org`n" -ForegroundColor Yellow
    exit 1
}

# Navigate to project directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Check if validation CSV exists
if (-not (Test-Path "validation-samples.csv")) {
    Write-Host "❌ Error: validation-samples.csv not found!`n" -ForegroundColor Red
    Write-Host "Please run: .\run-validation-sampling.ps1 first`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "📂 Found validation-samples.csv`n" -ForegroundColor Green

# Count reviewed rows (basic check)
$csvContent = Get-Content "validation-samples.csv"
$totalRows = ($csvContent | Measure-Object).Count - 1  # Exclude header
Write-Host "📋 Total samples: $totalRows" -ForegroundColor Gray

# Run metrics calculation script
Write-Host "`n🔍 Analyzing validation results...`n" -ForegroundColor Yellow
node scripts\ml\calculate-validation-metrics.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✨ SUCCESS!`n" -ForegroundColor Green
    Write-Host "Generated files:" -ForegroundColor Cyan
    Write-Host "✅ validation-results.json (detailed metrics)" -ForegroundColor White
    Write-Host "✅ docs/VALIDATION_REPORT_V3.0.md (human-readable report)`n" -ForegroundColor White
    
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review validation-results.json for detailed breakdown" -ForegroundColor White
    Write-Host "2. Read docs/VALIDATION_REPORT_V3.0.md for recommendations" -ForegroundColor White
    Write-Host "3. If accuracy ≥70%: Proceed with content updates" -ForegroundColor White
    Write-Host "4. If accuracy <70%: Adjust thresholds per recommendations`n" -ForegroundColor White
    
    # Ask if user wants to open report
    $openReport = Read-Host "Open validation report now? (y/n)"
    if ($openReport -eq 'y' -or $openReport -eq 'Y') {
        Start-Process "docs\VALIDATION_REPORT_V3.0.md"
    }
} else {
    Write-Host "`n⚠️  Script completed with warnings" -ForegroundColor Yellow
    Write-Host "Check console output above for recommendations`n" -ForegroundColor Gray
}
