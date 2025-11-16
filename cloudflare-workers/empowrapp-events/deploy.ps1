# Deploy 3mpwr Events Calendar Worker to Cloudflare

Write-Host "🚀 Deploying 3mpwr Events Calendar Worker..." -ForegroundColor Cyan

# Check if wrangler is installed
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "❌ wrangler is not installed. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

# Deploy the worker
Write-Host "📦 Deploying to Cloudflare Workers..." -ForegroundColor Yellow
wrangler deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Events Calendar Worker deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Worker URL:" -ForegroundColor Cyan
    Write-Host "   https://3mpwrapp-calendar.empowrapp08162025.workers.dev" -ForegroundColor White
    Write-Host ""
    Write-Host "📡 API Endpoints:" -ForegroundColor Cyan
    Write-Host "   GET  /api/events       - List events" -ForegroundColor White
    Write-Host "   POST /api/events       - Create/update event" -ForegroundColor White
    Write-Host "   POST /api/events/bulk  - Bulk sync events" -ForegroundColor White
    Write-Host "   DELETE /api/events/:id - Delete event" -ForegroundColor White
    Write-Host "   GET  /events.ics       - ICS calendar feed" -ForegroundColor White
    Write-Host "   GET  /health           - Health check" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Test health check: curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/health" -ForegroundColor White
    Write-Host "   2. Create test event from app" -ForegroundColor White
    Write-Host "   3. Verify sync: curl https://3mpwrapp-calendar.empowrapp08162025.workers.dev/api/events" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    exit 1
}
