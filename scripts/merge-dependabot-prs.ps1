# Auto-merge Dependabot PRs when CI passes
# Usage: .\scripts\merge-dependabot-prs.ps1

$PRs = @(32, 33, 36, 37, 38, 31, 35, 41)

Write-Host "Checking status of Dependabot PRs..." -ForegroundColor Cyan

foreach ($pr in $PRs) {
    Write-Host "`nPR #${pr}:" -ForegroundColor Yellow
    
    # Check PR status
    $status = gh pr view $pr --json state,mergeable,statusCheckRollup 2>$null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ❌ PR not found or closed" -ForegroundColor Red
        continue
    }
    
    $prData = $status | ConvertFrom-Json
    
    if ($prData.state -ne "OPEN") {
        Write-Host "  ⏭️  Already closed/merged" -ForegroundColor Gray
        continue
    }
    
    # Check if all checks passed
    $failedChecks = $prData.statusCheckRollup | Where-Object { $_.conclusion -in @("FAILURE", "CANCELLED", "TIMED_OUT") }
    $pendingChecks = $prData.statusCheckRollup | Where-Object { $_.conclusion -eq $null }
    
    if ($failedChecks) {
        Write-Host "  ⚠️  Has failing checks - skipping" -ForegroundColor Red
    }
    elseif ($pendingChecks) {
        Write-Host "  ⏳ Checks still running..." -ForegroundColor Yellow
    }
    elseif ($prData.mergeable -eq "MERGEABLE") {
        Write-Host "  ✅ All checks passed! Merging..." -ForegroundColor Green
        gh pr merge $pr --squash --auto --delete-branch
        Write-Host "  🎉 Merged successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠️  Not mergeable: $($prData.mergeable)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Check complete!" -ForegroundColor Cyan
Write-Host "Run this script again to check for updates." -ForegroundColor Gray
