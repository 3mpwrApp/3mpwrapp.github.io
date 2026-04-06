# Set CanLII API Key and Run Scraper
# Save your API key here (this file is gitignored)

$env:CANLII_API_KEY = '5VMAI9UyXp1syvy4nEAM58QfpGZInsTF9vVc6etc'

Write-Host "API Key set" -ForegroundColor Green
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting scraper for remaining Canadian provinces..." -ForegroundColor Yellow
Write-Host "Ontario already collected - 4,632 decisions" -ForegroundColor Gray
Write-Host ""

# Run the scraper
node scripts\scrape-canlii-tribunals.js
