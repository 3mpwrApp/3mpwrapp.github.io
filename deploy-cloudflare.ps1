#!/usr/bin/env pwsh
# Quick deployment script for 3mpwrApp website to Cloudflare Pages

Write-Host "`n🚀 3mpwrApp Website Deployment to Cloudflare Pages`n" -ForegroundColor Cyan

# Change to site directory
$siteDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
Set-Location $siteDir

Write-Host "📁 Working directory: $siteDir`n" -ForegroundColor Gray

# Step 1: Build Jekyll site
Write-Host "🏗️  Step 1: Building Jekyll site..." -ForegroundColor Yellow
try {
    bundle exec jekyll build
    Write-Host "✅ Jekyll build complete`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Jekyll build failed: $_`n" -ForegroundColor Red
    exit 1
}

# Step 2: Deploy to Cloudflare Pages
Write-Host "☁️  Step 2: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
try {
    wrangler pages deploy _site --project-name=3mpwrapp --branch=main
    Write-Host "`n✅ Deployment complete!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflare deployment failed: $_`n" -ForegroundColor Red
    Write-Host "💡 Make sure you're logged in with: wrangler login`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "🎉 Website deployed successfully!" -ForegroundColor Cyan
Write-Host "🌐 Check deployment status: https://dash.cloudflare.com/`n" -ForegroundColor Gray
