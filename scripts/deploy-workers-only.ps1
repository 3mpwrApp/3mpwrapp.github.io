# Deploy Only Cloudflare Workers (Skip Firestore Sync)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deploy Cloudflare Workers" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Events Worker has KV ID configured
$eventsConfig = Get-Content "$PSScriptRoot\..\cloudflare-workers\empowrapp-events\wrangler.toml" -Raw
if ($eventsConfig -match "YOUR_KV_ID_HERE") {
    Write-Host "ERROR: Events Worker KV namespace not configured!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run:" -ForegroundColor Yellow
    Write-Host "  cd cloudflare-workers\empowrapp-events" -ForegroundColor White
    Write-Host "  wrangler kv:namespace create 'EVENTS_KV'" -ForegroundColor White
    Write-Host ""
    Write-Host "Then update wrangler.toml with the KV namespace ID." -ForegroundColor White
    Write-Host ""
    Write-Host "See CLOUDFLARE_SETUP_GUIDE.md for detailed instructions." -ForegroundColor Cyan
    exit 1
}

# Step 1: Deploy Events Calendar Worker
Write-Host "[1/2] Deploying Events Calendar Worker..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\cloudflare-workers\empowrapp-events"

Write-Host "   Deploying to Cloudflare..." -ForegroundColor Gray
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Events worker deployment failed!" -ForegroundColor Red
    Write-Host "   Check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "   SUCCESS: Events worker deployed!" -ForegroundColor Green
Write-Host "   URL: https://3mpwrapp-calendar.empowrapp08162025.workers.dev" -ForegroundColor Cyan
Write-Host ""

# Step 2: Deploy Campaigns Worker
Write-Host "[2/2] Deploying Campaigns Worker..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\cloudflare-workers\empowrapp-campaigns"

Write-Host "   Deploying to Cloudflare..." -ForegroundColor Gray
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Campaigns worker deployment failed!" -ForegroundColor Red
    Write-Host "   Check the error above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "   SUCCESS: Campaigns worker deployed!" -ForegroundColor Green
Write-Host "   URL: https://empowrapp-campaigns.empowrapp08162025.workers.dev" -ForegroundColor Cyan
Write-Host ""

# Test Health Checks
Write-Host "Testing worker endpoints..." -ForegroundColor Yellow

Write-Host "   Testing Events Worker..." -ForegroundColor Gray
try {
    $eventsHealth = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health" -Method Get -ErrorAction Stop
    if ($eventsHealth.status -eq "healthy") {
        Write-Host "   SUCCESS: Events worker is healthy!" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: Events worker returned unexpected status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Events worker health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "   Testing Campaigns Worker..." -ForegroundColor Gray
try {
    $campaignsHealth = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/health" -Method Get -ErrorAction Stop
    if ($campaignsHealth.status -eq "healthy") {
        Write-Host "   SUCCESS: Campaigns worker is healthy!" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: Campaigns worker returned unexpected status" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   WARNING: Campaigns worker health check failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Test creating an event in the app (EAS Preview)" -ForegroundColor White
Write-Host "2. Verify event appears on website: https://3mpwrapp.pages.dev/events" -ForegroundColor White
Write-Host "3. Test creating a campaign in the app" -ForegroundColor White
Write-Host "4. Verify campaign appears on website: https://3mpwrapp.pages.dev/campaigns" -ForegroundColor White
Write-Host ""
Write-Host "API ENDPOINTS:" -ForegroundColor Cyan
Write-Host "Events:    https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -ForegroundColor White
Write-Host "Campaigns: https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -ForegroundColor White
Write-Host "Calendar:  https://3mpwrapp-calendar.empowrapp08162025.workers.dev/events.ics" -ForegroundColor White
Write-Host ""
