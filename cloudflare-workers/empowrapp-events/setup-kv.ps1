# Setup KV Namespace for Events Worker

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Create Events KV Namespace" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Creating KV namespace..." -ForegroundColor Yellow
wrangler kv:namespace create "EVENTS_KV"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Copy the KV namespace ID from above" -ForegroundColor White
Write-Host "2. Open wrangler.toml" -ForegroundColor White
Write-Host "3. Replace 'YOUR_KV_ID_HERE' with your KV namespace ID" -ForegroundColor White
Write-Host "4. Save the file" -ForegroundColor White
Write-Host "5. Run: wrangler deploy" -ForegroundColor White
Write-Host ""
