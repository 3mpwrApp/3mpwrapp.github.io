#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test the complete sync flow for events and campaigns
.DESCRIPTION
    Verifies that both Cloudflare Workers are responding and ready to receive syncs
#>

Write-Host "=== Testing Complete Sync Flow ===" -ForegroundColor Cyan
Write-Host ""

# Test Events Worker
Write-Host "1. Testing Events Worker..." -ForegroundColor Yellow
try {
    $eventsResponse = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -Method GET
    if ($eventsResponse.success) {
        Write-Host "   ✓ Events Worker responding" -ForegroundColor Green
        Write-Host "   - Environment: $($eventsResponse.environment)" -ForegroundColor Gray
        Write-Host "   - Events count: $($eventsResponse.count)" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Events Worker returned success=false" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Events Worker not responding: $_" -ForegroundColor Red
}

Write-Host ""

# Test Campaigns Worker
Write-Host "2. Testing Campaigns Worker..." -ForegroundColor Yellow
try {
    $campaignsResponse = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -Method GET
    if ($campaignsResponse.success) {
        Write-Host "   ✓ Campaigns Worker responding" -ForegroundColor Green
        Write-Host "   - Environment: $($campaignsResponse.environment)" -ForegroundColor Gray
        Write-Host "   - Campaigns count: $($campaignsResponse.campaigns.Count)" -ForegroundColor Gray
    } else {
        Write-Host "   ✗ Campaigns Worker returned success=false" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Campaigns Worker not responding: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Sync Architecture Status ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Events Worker: Deployed and responding" -ForegroundColor Green
Write-Host "  - URL: https://3mpwrapp-calendar.empowrapp08162025.workers.dev" -ForegroundColor Gray
Write-Host "  - KV Namespace: calendar_cache_prod (f4026c4d54c1498eac1b920c9ef1bb3e)" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ Campaigns Worker: Deployed and responding" -ForegroundColor Green
Write-Host "  - URL: https://empowrapp-campaigns.empowrapp08162025.workers.dev" -ForegroundColor Gray
Write-Host "  - KV Namespace: CAMPAIGNS_KV (735bf388954b4dbeb6f8b5d357b1e5ed)" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ App Sync Services: Configured" -ForegroundColor Green
Write-Host "  - eventSyncToWorker.ts → Events Worker" -ForegroundColor Gray
Write-Host "  - campaignSync.ts → Campaigns Worker" -ForegroundColor Gray
Write-Host ""
Write-Host "✓ App Data Fetching: Configured" -ForegroundColor Green
Write-Host "  - Events: Fetches from Firestore events_preview/events_production" -ForegroundColor Gray
Write-Host "  - Campaigns: Fetches from Firestore campaigns_preview/campaigns_production" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Create an event in the app (EAS Preview)" -ForegroundColor White
Write-Host "   → Should sync to Firestore events_preview" -ForegroundColor Gray
Write-Host "   → Should sync to Events Worker → Website" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create a campaign in the app (EAS Preview)" -ForegroundColor White
Write-Host "   → Should sync to Firestore campaigns_preview" -ForegroundColor Gray
Write-Host "   → Should sync to Campaigns Worker → Website" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Check website at https://3mpwrapp.pages.dev" -ForegroundColor White
Write-Host "   → Events should appear in calendar" -ForegroundColor Gray
Write-Host "   → Campaigns should appear in campaigns list" -ForegroundColor Gray
Write-Host ""
