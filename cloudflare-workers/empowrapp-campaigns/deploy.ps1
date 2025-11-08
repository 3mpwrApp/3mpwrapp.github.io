# Cloudflare Worker Deployment Script for 3mpwr App Campaigns
# Run this script to set up and deploy the worker

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "3mpwr App - Campaigns Worker Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "Checking for Wrangler CLI..." -ForegroundColor Yellow
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "✗ Wrangler CLI not found!" -ForegroundColor Red
    Write-Host "Installing Wrangler globally..." -ForegroundColor Yellow
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Failed to install Wrangler. Please install manually: npm install -g wrangler" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Wrangler CLI found" -ForegroundColor Green
Write-Host ""

# Navigate to worker directory
$workerDir = "cloudflare-workers\empowrapp-campaigns"
if (!(Test-Path $workerDir)) {
    Write-Host "✗ Worker directory not found: $workerDir" -ForegroundColor Red
    exit 1
}
Set-Location $workerDir
Write-Host "✓ Navigated to worker directory" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "Checking Cloudflare authentication..." -ForegroundColor Yellow
wrangler whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to Cloudflare. Opening browser for authentication..." -ForegroundColor Yellow
    wrangler login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Authentication failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✓ Authenticated with Cloudflare" -ForegroundColor Green
Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Create KV namespace
Write-Host "Creating KV namespace for campaigns..." -ForegroundColor Yellow
$kvOutput = wrangler kv:namespace create "CAMPAIGNS_KV" 2>&1 | Out-String
Write-Host $kvOutput

# Extract KV namespace ID
if ($kvOutput -match 'id\s*=\s*"([^"]+)"') {
    $kvId = $matches[1]
    Write-Host "✓ KV namespace created with ID: $kvId" -ForegroundColor Green
    
    # Update wrangler.toml with the KV ID
    Write-Host "Updating wrangler.toml with KV namespace ID..." -ForegroundColor Yellow
    $wranglerContent = Get-Content "wrangler.toml" -Raw
    $wranglerContent = $wranglerContent -replace 'id = "YOUR_KV_NAMESPACE_ID"', "id = `"$kvId`""
    Set-Content "wrangler.toml" $wranglerContent
    Write-Host "✓ wrangler.toml updated" -ForegroundColor Green
} else {
    Write-Host "⚠ Could not parse KV namespace ID. Please update wrangler.toml manually." -ForegroundColor Yellow
}
Write-Host ""

# Deploy worker
Write-Host "Deploying worker to Cloudflare..." -ForegroundColor Yellow
Write-Host "(This may take a minute...)" -ForegroundColor Gray
Write-Host ""
$deployOutput = wrangler deploy 2>&1 | Out-String
Write-Host $deployOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    
    # Extract worker URL
    if ($deployOutput -match 'https://[^\s]+\.workers\.dev') {
        $workerUrl = $matches[0]
        Write-Host "Worker URL: $workerUrl" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "API Endpoints:" -ForegroundColor Yellow
        Write-Host "  GET  $workerUrl/api/campaigns" -ForegroundColor White
        Write-Host "  POST $workerUrl/api/campaigns" -ForegroundColor White
        Write-Host "  POST $workerUrl/api/campaigns/bulk" -ForegroundColor White
        Write-Host "  DEL  $workerUrl/api/campaigns/:id" -ForegroundColor White
        Write-Host ""
        Write-Host "Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Test the worker: curl $workerUrl/health" -ForegroundColor White
        Write-Host "2. Update app configuration in services/campaignSync.ts" -ForegroundColor White
        Write-Host "3. Update website to fetch from: $workerUrl/api/campaigns" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "✗ DEPLOYMENT FAILED" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Dashboard: https://dash.cloudflare.com" -ForegroundColor Cyan
Write-Host ""

# Return to original directory
Set-Location ..\..

Write-Host "Done! 🚀" -ForegroundColor Green
