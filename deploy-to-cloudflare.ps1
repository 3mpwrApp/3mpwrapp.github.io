# Quick deployment script for 3mpwrApp website to Cloudflare Pages

Write-Host ""
Write-Host "Deploying 3mpwrApp Website to Cloudflare Pages" -ForegroundColor Cyan
Write-Host ""

# Change to site directory
$siteDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"
Set-Location $siteDir

Write-Host "Working directory: $siteDir" -ForegroundColor Gray
Write-Host ""

# Step 1: Build Jekyll site
Write-Host "Step 1: Building Jekyll site..." -ForegroundColor Yellow
try {
    bundle exec jekyll build
    Write-Host "Jekyll build complete" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Jekyll build failed: $_" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Step 2: Deploy to Cloudflare Pages
Write-Host "Step 2: Deploying to Cloudflare Pages..." -ForegroundColor Yellow
try {
    wrangler pages deploy _site --project-name=3mpwrapp --branch=main
    Write-Host ""
    Write-Host "Deployment complete!" -ForegroundColor Green
} catch {
    Write-Host "Cloudflare deployment failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure you are logged in with: wrangler login" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "Website deployed successfully!" -ForegroundColor Cyan
Write-Host "Check deployment status at: https://dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "Live site: https://3mpwrapp.pages.dev" -ForegroundColor Gray
Write-Host ""
