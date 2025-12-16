#!/usr/bin/env pwsh
# Setup script for 3mpwr App Submissions API on Cloudflare

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================"
Write-Host "  3mpwr App Submissions API Setup"
Write-Host "========================================"
Write-Host ""

# Check if wrangler is installed
$wranglerCheck = Get-Command wrangler -ErrorAction SilentlyContinue
if (-not $wranglerCheck) {
    Write-Host "[ERROR] Wrangler CLI not found. Install with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Wrangler CLI found" -ForegroundColor Green

# Check login status
Write-Host ""
Write-Host "Checking Cloudflare login..." -ForegroundColor Yellow
$whoami = wrangler whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in. Running 'wrangler login'..." -ForegroundColor Yellow
    wrangler login
}
Write-Host "[OK] Logged into Cloudflare" -ForegroundColor Green

# Create KV Namespace
Write-Host ""
Write-Host "========================================"
Write-Host "  Step 1: Create KV Namespace"
Write-Host "========================================"
Write-Host ""

Write-Host "Creating KV namespace 'SUBMISSIONS_KV'..." -ForegroundColor Cyan
$kvResult = wrangler kv:namespace create "SUBMISSIONS_KV" 2>&1
Write-Host $kvResult

if ($kvResult -match 'id\s*=\s*"([a-f0-9]+)"') {
    $kvId = $Matches[1]
    Write-Host ""
    Write-Host "[SUCCESS] KV Namespace created!" -ForegroundColor Green
    Write-Host "  Namespace ID: $kvId" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[INFO] KV namespace may already exist. Check Cloudflare dashboard." -ForegroundColor Yellow
}

# Create D1 Database
Write-Host ""
Write-Host "========================================"
Write-Host "  Step 2: Create D1 Database (Optional)"
Write-Host "========================================"
Write-Host ""

Write-Host "Creating D1 database '3mpwrapp-submissions'..." -ForegroundColor Cyan
$d1Result = wrangler d1 create "3mpwrapp-submissions" 2>&1
Write-Host $d1Result

if ($d1Result -match 'database_id\s*=\s*"([a-f0-9-]+)"') {
    $d1Id = $Matches[1]
    Write-Host ""
    Write-Host "[SUCCESS] D1 Database created!" -ForegroundColor Green
    Write-Host "  Database ID: $d1Id" -ForegroundColor Cyan
    
    # Apply schema
    Write-Host ""
    Write-Host "Applying database schema..." -ForegroundColor Cyan
    $schemaPath = Join-Path $PSScriptRoot "..\website\functions\api\submissions.sql"
    if (Test-Path $schemaPath) {
        wrangler d1 execute "3mpwrapp-submissions" --file="$schemaPath" 2>&1
        Write-Host "[OK] Schema applied" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Schema file not found at: $schemaPath" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[INFO] D1 database may already exist. Check Cloudflare dashboard." -ForegroundColor Yellow
}

# Instructions
Write-Host ""
Write-Host "========================================"
Write-Host "  NEXT STEPS"
Write-Host "========================================"
Write-Host ""
Write-Host "1. Go to Cloudflare Dashboard:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Navigate to: Pages -> 3mpwrapp -> Settings -> Functions" -ForegroundColor White
Write-Host ""
Write-Host "3. Add KV namespace binding:" -ForegroundColor White
Write-Host "   Variable name: SUBMISSIONS_KV" -ForegroundColor Cyan
if ($kvId) {
    Write-Host "   KV namespace ID: $kvId" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "4. (Optional) Add D1 database binding:" -ForegroundColor White
Write-Host "   Variable name: SUBMISSIONS_DB" -ForegroundColor Cyan
Write-Host "   Database: 3mpwrapp-submissions" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. (Optional) Add Discord webhook for notifications:" -ForegroundColor White
Write-Host "   Go to: Settings -> Environment Variables" -ForegroundColor Cyan
Write-Host "   Add: NOTIFICATION_WEBHOOK_URL = your-discord-webhook-url" -ForegroundColor Cyan
Write-Host ""
Write-Host "6. Redeploy the Pages site to apply changes" -ForegroundColor White
Write-Host ""
Write-Host "========================================"
Write-Host "  Setup Complete!"
Write-Host "========================================"
Write-Host ""
