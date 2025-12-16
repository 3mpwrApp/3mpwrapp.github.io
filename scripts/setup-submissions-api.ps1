#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup script for 3mpwr App Submissions API on Cloudflare
.DESCRIPTION
    This script configures the Cloudflare infrastructure for receiving
    event and campaign submissions from the 3mpwr App.
.NOTES
    Prerequisites:
    - Wrangler CLI installed: npm install -g wrangler
    - Logged into Cloudflare: wrangler login
    - Cloudflare Pages project already deployed
#>

param(
    [switch]$SkipKV,
    [switch]$SkipD1,
    [switch]$SkipWebhook,
    [string]$DiscordWebhook
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 3mpwr App Submissions API Setup" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

# Check if wrangler is installed
try {
    $wranglerVersion = wrangler --version 2>$null
    Write-Host "✅ Wrangler CLI: $wranglerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Install with: npm install -g wrangler" -ForegroundColor Red
    exit 1
}

# Check login status
Write-Host "`n📋 Checking Cloudflare login status..." -ForegroundColor Yellow
try {
    wrangler whoami 2>$null | Out-Null
    Write-Host "✅ Logged into Cloudflare" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Not logged in. Running 'wrangler login'..." -ForegroundColor Yellow
    wrangler login
}

$configUpdates = @()

# ============================================
# Step 1: Create KV Namespace
# ============================================
if (-not $SkipKV) {
    Write-Host "`n📦 Step 1: Creating KV Namespace for Submissions..." -ForegroundColor Cyan
    
    try {
        $kvOutput = wrangler kv:namespace create "SUBMISSIONS_KV" 2>&1
        
        # Extract the namespace ID from the output
        if ($kvOutput -match 'id\s*=\s*"([a-f0-9]+)"') {
            $kvId = $Matches[1]
            Write-Host "✅ KV Namespace created!" -ForegroundColor Green
            Write-Host "   Namespace ID: $kvId" -ForegroundColor Gray
            $configUpdates += @{
                Type = "KV"
                Binding = "SUBMISSIONS_KV"
                Id = $kvId
            }
        } else {
            Write-Host "⚠️  Could not parse KV namespace ID from output:" -ForegroundColor Yellow
            Write-Host $kvOutput -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  KV namespace may already exist or error occurred:" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏭️  Skipping KV Namespace creation" -ForegroundColor Gray
}

# ============================================
# Step 2: Create D1 Database (Optional)
# ============================================
if (-not $SkipD1) {
    Write-Host "`n🗃️  Step 2: Creating D1 Database for Submissions..." -ForegroundColor Cyan
    
    try {
        $d1Output = wrangler d1 create "3mpwrapp-submissions" 2>&1
        
        # Extract the database ID from the output
        if ($d1Output -match 'database_id\s*=\s*"([a-f0-9-]+)"') {
            $d1Id = $Matches[1]
            Write-Host "✅ D1 Database created!" -ForegroundColor Green
            Write-Host "   Database ID: $d1Id" -ForegroundColor Gray
            $configUpdates += @{
                Type = "D1"
                Binding = "SUBMISSIONS_DB"
                DatabaseName = "3mpwrapp-submissions"
                Id = $d1Id
            }
            
            # Apply the schema
            Write-Host "`n   Applying database schema..." -ForegroundColor Yellow
            $schemaPath = Join-Path $PSScriptRoot "..\website\functions\api\submissions.sql"
            if (Test-Path $schemaPath) {
                wrangler d1 execute "3mpwrapp-submissions" --file=$schemaPath
                Write-Host "   ✅ Schema applied successfully!" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Schema file not found at: $schemaPath" -ForegroundColor Yellow
            }
        } else {
            Write-Host "⚠️  Could not parse D1 database ID from output:" -ForegroundColor Yellow
            Write-Host $d1Output -ForegroundColor Gray
        }
    } catch {
        Write-Host "⚠️  D1 database may already exist or error occurred:" -ForegroundColor Yellow
        Write-Host $_.Exception.Message -ForegroundColor Gray
    }
} else {
    Write-Host "`n⏭️  Skipping D1 Database creation" -ForegroundColor Gray
}

# ============================================
# Step 3: Configure Discord Webhook (Optional)
# ============================================
if (-not $SkipWebhook) {
    Write-Host "`n🔔 Step 3: Discord Webhook Configuration..." -ForegroundColor Cyan
    
    if ($DiscordWebhook) {
        Write-Host "   Webhook URL provided via parameter" -ForegroundColor Gray
        $configUpdates += @{
            Type = "EnvVar"
            Name = "NOTIFICATION_WEBHOOK_URL"
            Value = $DiscordWebhook
        }
    } else {
        Write-Host "`n   To receive notifications when users submit events/campaigns," -ForegroundColor White
        Write-Host "   create a Discord webhook and paste the URL below." -ForegroundColor White
        Write-Host "   (Press Enter to skip)" -ForegroundColor Gray
        
        $webhookUrl = Read-Host "   Discord Webhook URL"
        
        if ($webhookUrl) {
            $configUpdates += @{
                Type = "EnvVar"
                Name = "NOTIFICATION_WEBHOOK_URL"
                Value = $webhookUrl
            }
        } else {
            Write-Host "   ⏭️  Skipping Discord webhook" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "`n⏭️  Skipping Discord Webhook configuration" -ForegroundColor Gray
}

# ============================================
# Summary and Next Steps
# ============================================
Write-Host "`n" + "=" * 50 -ForegroundColor Gray
Write-Host "📋 SETUP SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Gray

if ($configUpdates.Count -gt 0) {
    Write-Host "`n✅ Created Resources:" -ForegroundColor Green
    foreach ($update in $configUpdates) {
        switch ($update.Type) {
            "KV" {
                Write-Host "   📦 KV Namespace: $($update.Binding)" -ForegroundColor White
                Write-Host "      ID: $($update.Id)" -ForegroundColor Gray
            }
            "D1" {
                Write-Host "   🗃️  D1 Database: $($update.DatabaseName)" -ForegroundColor White
                Write-Host "      ID: $($update.Id)" -ForegroundColor Gray
            }
            "EnvVar" {
                Write-Host "   🔐 Environment Variable: $($update.Name)" -ForegroundColor White
            }
        }
    }
}

Write-Host "`n📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host @"

1. Go to Cloudflare Dashboard:
   https://dash.cloudflare.com

2. Navigate to: Pages → 3mpwrapp → Settings → Functions

3. Add the following bindings:
"@ -ForegroundColor White

$kvUpdate = $configUpdates | Where-Object { $_.Type -eq "KV" }
if ($kvUpdate) {
    Write-Host @"
   
   KV namespace bindings:
   ┌─────────────────────────────────────────────────────┐
   │ Variable name: SUBMISSIONS_KV                       │
   │ KV namespace:  $($kvUpdate.Id)                      │
   └─────────────────────────────────────────────────────┘
"@ -ForegroundColor Cyan
}

$d1Update = $configUpdates | Where-Object { $_.Type -eq "D1" }
if ($d1Update) {
    Write-Host @"
   
   D1 database bindings:
   ┌─────────────────────────────────────────────────────┐
   │ Variable name: SUBMISSIONS_DB                       │
   │ D1 database:   $($d1Update.DatabaseName)            │
   └─────────────────────────────────────────────────────┘
"@ -ForegroundColor Cyan
}

$webhookUpdate = $configUpdates | Where-Object { $_.Type -eq "EnvVar" -and $_.Name -eq "NOTIFICATION_WEBHOOK_URL" }
if ($webhookUpdate) {
    Write-Host @"
   
   Environment variables:
   ┌─────────────────────────────────────────────────────┐
   │ Variable name: NOTIFICATION_WEBHOOK_URL             │
   │ Value:         [Your Discord webhook URL]           │
   └─────────────────────────────────────────────────────┘
"@ -ForegroundColor Cyan
}

Write-Host @"

4. Redeploy your Pages site to apply changes:
   - Push a commit to trigger automatic deployment, or
   - Go to Pages → 3mpwrapp → Deployments → Retry deployment

5. Test the endpoint:
   Invoke-RestMethod -Uri "https://3mpwrapp.pages.dev/api/submissions" -Method POST `
     -ContentType "application/json" `
     -Body '{"type":"event","data":{"id":"test-1","title":"Test Event","description":"Test","date":"2025-12-20"},"submittedBy":{"uid":"test-user"},"submittedAt":1734307200000}'

"@ -ForegroundColor White

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "`n"
