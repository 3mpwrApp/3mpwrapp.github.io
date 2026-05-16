# Run Validation Sampling Script
# Generates 600 stratified samples for manual review

Write-Host "`n🔬 Ontario Tribunal Classification Validation" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Gray

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

Write-Host "📂 Current directory: $scriptDir`n" -ForegroundColor Gray

# Run validation sampling script
Write-Host "🎲 Generating validation samples...`n" -ForegroundColor Yellow
node scripts\ml\generate-validation-samples.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✨ SUCCESS!`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Open validation-samples.csv in Excel/Google Sheets" -ForegroundColor White
    Write-Host "2. Review VALIDATION_GUIDE.md for detailed instructions" -ForegroundColor White
    Write-Host "3. For each case:" -ForegroundColor White
    Write-Host "   - Click canlii_url to read decision" -ForegroundColor Gray
    Write-Host "   - Fill actual_outcome column" -ForegroundColor Gray
    Write-Host "   - Mark match: ✅ ❌ or ⚠️" -ForegroundColor Gray
    Write-Host "4. Run: .\run-validation-metrics.ps1`n" -ForegroundColor White
    
    # Ask if user wants to open CSV now
    $openNow = Read-Host "Open validation-samples.csv now? (y/n)"
    if ($openNow -eq 'y' -or $openNow -eq 'Y') {
        Start-Process "validation-samples.csv"
    }
} else {
    Write-Host "`n❌ Error generating samples" -ForegroundColor Red
    Write-Host "Check console output above for details`n" -ForegroundColor Yellow
    exit 1
}
