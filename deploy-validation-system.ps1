#!/usr/bin/env pwsh

# Commit, Push, and Deploy Validation Infrastructure
# Includes scripts, guides, and 592-sample dataset

Write-Host "`n🚀 Deploying Validation System to Production" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Gray

# Navigate to project directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Git status check
Write-Host "📊 Checking git status...`n" -ForegroundColor Yellow
git status --short

# Stage validation files
Write-Host "`n📦 Staging validation infrastructure...`n" -ForegroundColor Yellow
git add scripts/ml/generate-validation-samples.js
git add scripts/ml/calculate-validation-metrics.js
git add run-validation-sampling.ps1
git add run-validation-metrics.ps1
git add VALIDATION_GUIDE.md
git add VALIDATION_IMPLEMENTATION_COMPLETE.md
git add VALIDATION_PLAN_BACKUP.md
git add validation-samples.json
git add validation-samples.csv

# Show staged files
Write-Host "✅ Staged files:" -ForegroundColor Green
git diff --cached --name-only

# Commit
Write-Host "`n💾 Committing changes...`n" -ForegroundColor Yellow
$commitMsg = @"
feat: Add ML classification validation infrastructure

- Generate stratified validation samples (592 cases across 6 tribunals)
- Calculate accuracy metrics with confidence band analysis
- PowerShell launchers for easy execution
- Comprehensive validation guide and backup plan
- Validation dataset: 240 high, 232 medium, 120 low confidence samples
- Conservative messaging framework for content updates

Phase 6 (Validation Sampling) infrastructure complete.
Manual review in progress to measure actual classification accuracy.

Files:
- scripts/ml/generate-validation-samples.js
- scripts/ml/calculate-validation-metrics.js
- run-validation-sampling.ps1
- run-validation-metrics.ps1
- VALIDATION_GUIDE.md
- VALIDATION_IMPLEMENTATION_COMPLETE.md
- VALIDATION_PLAN_BACKUP.md
- validation-samples.json (592 cases)
- validation-samples.csv (for manual review)
"@

git commit -m "$commitMsg"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Commit failed!" -ForegroundColor Red
    exit 1
}

# Push to origin
Write-Host "`n📤 Pushing to GitHub...`n" -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Git push successful!`n" -ForegroundColor Green

# Jekyll build
Write-Host "🏗️  Building Jekyll site...`n" -ForegroundColor Yellow
bundle exec jekyll build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Jekyll build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Jekyll build complete!`n" -ForegroundColor Green

# Cloudflare deploy
Write-Host "☁️  Deploying to Cloudflare Pages...`n" -ForegroundColor Yellow
npx wrangler pages deploy _site --project-name=3mpwrapp --branch=main --commit-dirty=true

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Cloudflare deploy failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n✨ SUCCESS! Validation infrastructure deployed`n" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Complete manual validation of 592 cases" -ForegroundColor White
Write-Host "2. Run: .\run-validation-metrics.ps1" -ForegroundColor White
Write-Host "3. Review validation report (docs/VALIDATION_REPORT_V3.0.md)" -ForegroundColor White
Write-Host "4. If accuracy ≥70%, proceed with Phase 1-5 content updates`n" -ForegroundColor White
