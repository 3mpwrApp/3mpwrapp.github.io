# Push Every Canadian Counts campaign to Cloudflare Worker

$campaign = @{
    id = "every-canadian-counts"
    title = "Every Canadian Counts"
    summary = "Support a publicly funded national disability insurance plan for Canadians with long-term or chronic disabilities. Sign and share petition e-6746."
    target = "Parliament of Canada"
    goalCount = 100000
    membersCount = 460
    contactEmail = "contact@everycanadiancounts.com"
    createdAt = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    petitionId = "e-6746"
    petitionUrl = "https://www.ourcommons.ca/petitions/en/Petition/Details?Petition=e-6746"
    websiteUrl = "https://everycanadiancounts.com"
}

$json = $campaign | ConvertTo-Json -Depth 10
Write-Host "Pushing campaign to Worker..." -ForegroundColor Yellow
Write-Host $json -ForegroundColor Gray

$response = Invoke-WebRequest -Method POST -Uri "https://empowrapp-campaigns.empowrapp08162025.workers.dev/api/campaigns" -Body $json -ContentType "application/json"

Write-Host ""
Write-Host "Response:" -ForegroundColor Green
Write-Host $response.Content
