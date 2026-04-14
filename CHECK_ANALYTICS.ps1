# CHECK_ANALYTICS.PS1
# PowerShell script to check social media automation analytics
# Use this instead of jq commands on Windows

Write-Host "`nSocial Media Automation Analytics Check`n" -ForegroundColor Cyan

# Change to correct directory
Set-Location "D:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"

# --- Check Feature Posting Results ---
Write-Host "[1] Feature Posting Results:" -ForegroundColor Yellow
if (Test-Path "public/feature-posting-results.json") {
    $featureResults = Get-Content "public/feature-posting-results.json" -Raw | ConvertFrom-Json
    if ($featureResults.history) {
        $recent = $featureResults.history | Select-Object -Last 14
        Write-Host "   Total posts: $($featureResults.history.Count)" -ForegroundColor Green
        Write-Host "   Last 14 results:" -ForegroundColor Green
        $recent | ForEach-Object {
            $status = if ($_.success) { "[OK]" } else { "[FAIL]" }
            Write-Host "   $status $($_.date) - $($_.feature)" -ForegroundColor $(if ($_.success) { "Green" } else { "Red" })
        }
    } else {
        Write-Host "   No posting history yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [!] File not found - no posts published yet" -ForegroundColor Yellow
}

Write-Host ""

# --- Check Queue Posting Results ---
Write-Host "[2] Queue Posting Results:" -ForegroundColor Yellow
if (Test-Path "public/queue-posting-results.json") {
    $queueResults = Get-Content "public/queue-posting-results.json" -Raw | ConvertFrom-Json
    if ($queueResults.history) {
        $recent = $queueResults.history | Select-Object -Last 14
        Write-Host "   Total queue posts: $($queueResults.history.Count)" -ForegroundColor Green
        Write-Host "   Last 14 results:" -ForegroundColor Green
        $recent | ForEach-Object {
            $status = if ($_.success) { "[OK]" } else { "[FAIL]" }
            Write-Host "   $status $($_.scheduledDate) $($_.scheduledTime) - $($_.feature)" -ForegroundColor $(if ($_.success) { "Green" } else { "Red" })
        }
    } else {
        Write-Host "   No queue history yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [!] File not found - queue not processed yet" -ForegroundColor Yellow
}

Write-Host ""

# --- Check Social Queue Status ---
Write-Host "[3] Social Queue Status:" -ForegroundColor Yellow
if (Test-Path "public/social-queue.json") {
    $queue = Get-Content "public/social-queue.json" -Raw | ConvertFrom-Json
    $total = $queue.queue.Count
    $posted = ($queue.queue | Where-Object { $_.posted -eq $true }).Count
    $remaining = $total - $posted
    
    Write-Host "   Total posts: $total" -ForegroundColor Green
    Write-Host "   Posted: $posted" -ForegroundColor Green
    Write-Host "   Remaining: $remaining" -ForegroundColor $(if ($remaining -gt 0) { "Cyan" } else { "Yellow" })
    
    if ($remaining -gt 0) {
        $nextPost = $queue.queue | Where-Object { $_.posted -ne $true } | Select-Object -First 1
        Write-Host "   Next post: $($nextPost.scheduledDate) $($nextPost.scheduledTime)" -ForegroundColor Cyan
        Write-Host "   Feature: $($nextPost.feature)" -ForegroundColor Cyan
    }
} else {
    Write-Host "   [X] Social queue file not found!" -ForegroundColor Red
    Write-Host "   Run: node scripts/social-queue-converter.js" -ForegroundColor Yellow
}

Write-Host ""

# --- Check Engagement Metrics ---
Write-Host "[4] Engagement Metrics:" -ForegroundColor Yellow
if (Test-Path "public/engagement-metrics-manual.json") {
    $metrics = Get-Content "public/engagement-metrics-manual.json" -Raw | ConvertFrom-Json
    Write-Host "   Followers: $($metrics.followers)" -ForegroundColor Green
    Write-Host "   Target: $($metrics.targetFollowers)" -ForegroundColor Cyan
    Write-Host "   Engagement rate: $($metrics.engagementRate)" -ForegroundColor Green
    
    Write-Host "`n   Platform breakdown:" -ForegroundColor Cyan
    $metrics.platforms.PSObject.Properties | ForEach-Object {
        Write-Host "   - $($_.Name): $($_.Value.followers) followers" -ForegroundColor White
    }
} else {
    Write-Host "   [!] File not found - manual tracking not started" -ForegroundColor Yellow
}

Write-Host ""

# --- GitHub Actions Workflow Status ---
Write-Host "[5] GitHub Actions Workflow:" -ForegroundColor Yellow
if (Test-Path ".github/workflows/social-queue-poster.yml") {
    Write-Host "   [OK] social-queue-poster.yml exists" -ForegroundColor Green
    Write-Host "   Schedule: Daily at 10:00 AM UTC" -ForegroundColor Cyan
    Write-Host "   Check runs: https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io/actions" -ForegroundColor Blue
} else {
    Write-Host "   [X] Workflow file not found!" -ForegroundColor Red
}

Write-Host "`n[COMPLETE] Analytics check done!`n" -ForegroundColor Green
Write-Host "[REMINDER] Next analytics check: April 28, 2026 (2 weeks)" -ForegroundColor Yellow
Write-Host "[REMINDER] Content refresh: May 14, 2026 (1 month)`n" -ForegroundColor Yellow
