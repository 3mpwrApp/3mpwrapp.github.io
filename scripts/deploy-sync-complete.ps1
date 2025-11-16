# Complete Sync Deployment Script
# Deploys both Cloudflare Workers and syncs all campaigns to Firestore + Workers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  3mpwr App - Complete Sync Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy Events Calendar Worker
Write-Host "[1/4] Deploying Events Calendar Worker..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\cloudflare-workers\empowrapp-events"

if (!(Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
}

Write-Host "   Deploying to Cloudflare..." -ForegroundColor Gray
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Events worker deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "   SUCCESS: Events worker deployed!" -ForegroundColor Green
Write-Host "   URL: https://3mpwrapp-calendar.empowrapp08162025.workers.dev" -ForegroundColor Cyan
Write-Host ""

# Step 2: Deploy Campaigns Worker
Write-Host "[2/4] Deploying Campaigns Worker..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\..\cloudflare-workers\empowrapp-campaigns"

if (!(Test-Path "node_modules")) {
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install
}

Write-Host "   Deploying to Cloudflare..." -ForegroundColor Gray
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERROR: Campaigns worker deployment failed!" -ForegroundColor Red
    exit 1
}

Write-Host "   SUCCESS: Campaigns worker deployed!" -ForegroundColor Green
Write-Host "   URL: https://empowrapp-campaigns.empowrapp08162025.workers.dev" -ForegroundColor Cyan
Write-Host ""

# Step 3: Sync Campaigns to Firestore
Write-Host "[3/4] Syncing campaigns to Firestore..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\.."

node scripts/sync-campaigns-to-firestore.mjs

if ($LASTEXITCODE -ne 0) {
    Write-Host "   WARNING: Campaigns Firestore sync had issues (check logs)" -ForegroundColor Yellow
} else {
    Write-Host "   SUCCESS: Campaigns synced to Firestore!" -ForegroundColor Green
}
Write-Host ""

# Step 4: Test Health Checks
Write-Host "[4/4] Testing worker endpoints..." -ForegroundColor Yellow

Write-Host "   Testing Events Worker..." -ForegroundColor Gray
$eventsHealth = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health" -Method Get -ErrorAction SilentlyContinue

if ($eventsHealth.status -eq "healthy") {
    Write-Host "   SUCCESS: Events worker is healthy!" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Events worker health check failed" -ForegroundColor Yellow
}

Write-Host "   Testing Campaigns Worker..." -ForegroundColor Gray
$campaignsHealth = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/health" -Method Get -ErrorAction SilentlyContinue

if ($campaignsHealth.status -eq "healthy") {
    Write-Host "   SUCCESS: Campaigns worker is healthy!" -ForegroundColor Green
} else {
    Write-Host "   WARNING: Campaigns worker health check failed" -ForegroundColor Yellow
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
