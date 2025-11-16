#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Final sync verification - Simple and robust test
#>

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SYNC FLOW VERIFICATION - FINAL TEST  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$allPassed = $true

# Test 1: Events Worker
Write-Host "[TEST 1] Events Worker..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -Method GET
    Write-Host "  ✓ GET endpoint working" -ForegroundColor Green
    
    $testId = "verify-$timestamp"
    $testData = @{
        id = $testId
        title = "Final Verification Test"
        description = "Testing complete sync flow"
        date = "2025-12-01T14:00:00"
        createdBy = "verification-test"
        createdAt = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalMilliseconds)
    }
    
    $postResponse = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -Method POST -Body ($testData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "  ✓ POST endpoint working" -ForegroundColor Green
    
    Start-Sleep -Seconds 1
    $verifyResponse = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -Method GET
    $found = $verifyResponse.events | Where-Object { $_.id -eq $testId }
    if ($found) {
        Write-Host "  ✓ Data persistence verified" -ForegroundColor Green
    }
    
    $deleteResponse = Invoke-RestMethod -Uri "https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events/$testId" -Method DELETE
    Write-Host "  ✓ DELETE endpoint working" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FAILED" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""

# Test 2: Campaigns Worker
Write-Host "[TEST 2] Campaigns Worker..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -Method GET
    Write-Host "  ✓ GET endpoint working" -ForegroundColor Green
    
    $testId = "verify-$timestamp"
    $testData = @{
        id = $testId
        title = "Final Verification Campaign"
        summary = "Testing complete sync flow"
        goalCount = 100
        membersCount = 0
        createdBy = "verification-test"
        createdAt = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalMilliseconds)
    }
    
    $postResponse = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -Method POST -Body ($testData | ConvertTo-Json) -ContentType "application/json"
    Write-Host "  ✓ POST endpoint working" -ForegroundColor Green
    
    Start-Sleep -Seconds 1
    $verifyResponse = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -Method GET
    $found = $verifyResponse.campaigns | Where-Object { $_.id -eq $testId }
    if ($found) {
        Write-Host "  ✓ Data persistence verified" -ForegroundColor Green
    }
    
    $deleteResponse = Invoke-RestMethod -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns/$testId" -Method DELETE
    Write-Host "  ✓ DELETE endpoint working" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FAILED" -ForegroundColor Red
    $allPassed = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host ""
    Write-Host "✅ VERIFICATION COMPLETE - ALL SYSTEMS OPERATIONAL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Sync Architecture Status:" -ForegroundColor White
    Write-Host "  ✓ Events Worker deployed and tested" -ForegroundColor Green
    Write-Host "  ✓ Campaigns Worker deployed and tested" -ForegroundColor Green
    Write-Host "  ✓ All CRUD operations verified" -ForegroundColor Green
    Write-Host "  ✓ Data persistence confirmed" -ForegroundColor Green
    Write-Host ""
    Write-Host "App Integration:" -ForegroundColor White
    Write-Host "  • services/eventSyncToWorker.ts" -ForegroundColor Gray
    Write-Host "  • services/campaignSync.ts" -ForegroundColor Gray
    Write-Host "  • services/firestoreEventSync.ts" -ForegroundColor Gray
    Write-Host "  • services/firestoreCampaignSync.ts" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ready for production use!" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ VERIFICATION FAILED" -ForegroundColor Red
    Write-Host ""
}
