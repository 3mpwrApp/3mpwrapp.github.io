# PowerShell Live Website Stress Test
# Tests key pages with concurrent requests
# No dependencies - uses built-in PowerShell cmdlets

param(
    [int]$VirtualUsers = 100,
    [int]$DurationSeconds = 300,
    [string]$BaseUrl = "https://3mpwrapp.github.io"
)

# Key pages to test
$pages = @(
    @{ url = "/"; weight = 35; name = "Homepage" },
    @{ url = "/features"; weight = 20; name = "Features" },
    @{ url = "/user-guide"; weight = 20; name = "User Guide" },
    @{ url = "/blog"; weight = 15; name = "Blog" },
    @{ url = "/contact"; weight = 5; name = "Contact" },
    @{ url = "/accessibility"; weight = 5; name = "Accessibility" }
)

# Metrics
$results = @{
    TotalRequests = 0
    SuccessCount = 0
    FailureCount = 0
    ErrorCodes = @{}
    ResponseTimes = @()
    StartTime = Get-Date
}

# Helper: Select random page by weight
function Get-RandomPage {
    $totalWeight = ($pages | Measure-Object -Property weight -Sum).Sum
    $rand = Get-Random -Maximum $totalWeight
    $cumsum = 0
    
    foreach ($page in $pages) {
        $cumsum += $page.weight
        if ($rand -lt $cumsum) {
            return $page
        }
    }
    return $pages[0]
}

# Helper: Test single URL
function Invoke-TestRequest {
    param([string]$Url)
    
    $startTime = Get-Date
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $duration = (Get-Date) - $startTime
        
        $results.SuccessCount++
        $results.ResponseTimes += $duration.TotalMilliseconds
        
        return @{
            Status = $response.StatusCode
            Duration = $duration.TotalMilliseconds
            Success = $true
        }
    }
    catch {
        $duration = (Get-Date) - $startTime
        $results.FailureCount++
        
        $statusCode = $_.Exception.Response.StatusCode.Value__ 
        if ($statusCode) {
            if (-not $results.ErrorCodes.ContainsKey($statusCode)) {
                $results.ErrorCodes[$statusCode] = 0
            }
            $results.ErrorCodes[$statusCode]++
        } else {
            if (-not $results.ErrorCodes.ContainsKey("Timeout/Error")) {
                $results.ErrorCodes["Timeout/Error"] = 0
            }
            $results.ErrorCodes["Timeout/Error"]++
        }
        
        return @{
            Status = if ($statusCode) { $statusCode } else { "Error" }
            Duration = $duration.TotalMilliseconds
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Main test loop
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          3MPOWR WEBSITE - LIVE STRESS TEST                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  Base URL:          $BaseUrl"
Write-Host "  Virtual Users:     $VirtualUsers"
Write-Host "  Duration:          $DurationSeconds seconds"
Write-Host "  Target Pages:      $($pages.Count) pages"
Write-Host ""
Write-Host "Starting stress test..." -ForegroundColor Yellow
Write-Host ""

$endTime = (Get-Date).AddSeconds($DurationSeconds)
$userBlock = @()

# Create async jobs for concurrent requests
while ((Get-Date) -lt $endTime) {
    # Spawn up to $VirtualUsers concurrent requests
    for ($i = 0; $i -lt $VirtualUsers -and (Get-Date) -lt $endTime; $i++) {
        $page = Get-RandomPage
        $url = "$BaseUrl$($page.url)"
        
        # Invoke synchronously (PowerShell job limitation)
        $result = Invoke-TestRequest -Url $url
        $results.TotalRequests++
        
        if ($result.Success) {
            Write-Host "✓ $(Get-Date -Format 'HH:mm:ss') | $($page.name) | $([int]$result.Duration)ms" -ForegroundColor Green
        } else {
            Write-Host "✗ $(Get-Date -Format 'HH:mm:ss') | $($page.name) | ERROR: $($result.Status)" -ForegroundColor Red
        }
        
        # Small delay to avoid overwhelming network
        Start-Sleep -Milliseconds 50
    }
}

# Calculate metrics
$successRate = if ($results.TotalRequests -gt 0) { [math]::Round(($results.SuccessCount / $results.TotalRequests) * 100, 2) } else { 0 }
$errorRate = [math]::Round(100 - $successRate, 2)
$avgResponseTime = if ($results.ResponseTimes.Count -gt 0) { ($results.ResponseTimes | Measure-Object -Average).Average } else { 0 }
$maxResponseTime = if ($results.ResponseTimes.Count -gt 0) { ($results.ResponseTimes | Measure-Object -Maximum).Maximum } else { 0 }
$minResponseTime = if ($results.ResponseTimes.Count -gt 0) { ($results.ResponseTimes | Measure-Object -Minimum).Minimum } else { 0 }

# Sort response times for percentiles
$sortedTimes = $results.ResponseTimes | Sort-Object
$p50 = if ($sortedTimes.Count -gt 0) { $sortedTimes[[int]($sortedTimes.Count * 0.50)] } else { 0 }
$p95 = if ($sortedTimes.Count -gt 0) { $sortedTimes[[int]($sortedTimes.Count * 0.95)] } else { 0 }
$p99 = if ($sortedTimes.Count -gt 0) { $sortedTimes[[int]($sortedTimes.Count * 0.99)] } else { 0 }

# Print results
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    STRESS TEST RESULTS                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 REQUEST STATISTICS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Total Requests:        $($results.TotalRequests)"
Write-Host "  Successful:            $($results.SuccessCount) ($successRate%)"
Write-Host "  Failed:                $($results.FailureCount) ($errorRate%)"
Write-Host ""
Write-Host "⏱️  RESPONSE TIME METRICS (ms)" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Min:                   $([math]::Round($minResponseTime, 2))"
Write-Host "  Max:                   $([math]::Round($maxResponseTime, 2))"
Write-Host "  Average:               $([math]::Round($avgResponseTime, 2))"
Write-Host "  P50 (Median):          $([math]::Round($p50, 2))"
Write-Host "  P95:                   $([math]::Round($p95, 2))"
Write-Host "  P99:                   $([math]::Round($p99, 2))"
Write-Host ""

if ($results.ErrorCodes.Count -gt 0) {
    Write-Host "⚠️  ERROR BREAKDOWN" -ForegroundColor Yellow
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    foreach ($code in $results.ErrorCodes.GetEnumerator()) {
        Write-Host "  $($code.Name): $($code.Value) occurrences"
    }
    Write-Host ""
}

# Pass/Fail thresholds
$errorRatePass = $errorRate -lt 5
$p95Pass = $p95 -lt 5000
$successRatePass = $successRate -gt 95

Write-Host "✓ THRESHOLD ANALYSIS" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "  Error Rate < 5%:       $(if ($errorRatePass) { "✅ PASS" } else { "❌ FAIL" }) ($errorRate%)"
Write-Host "  P95 Latency < 5000ms:  $(if ($p95Pass) { "✅ PASS" } else { "❌ FAIL" }) ($([math]::Round($p95, 2))ms)"
Write-Host "  Success Rate > 95%:    $(if ($successRatePass) { "✅ PASS" } else { "❌ FAIL" }) ($successRate%)"
Write-Host ""

$allPass = $errorRatePass -and $p95Pass -and $successRatePass
$status = if ($allPass) { "✅ PASS" } else { "❌ FAIL" }

Write-Host "📈 OVERALL RESULT: $status" -ForegroundColor $(if ($allPass) { "Green" } else { "Red" })
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Save results to JSON
$resultsObject = @{
    TestDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TotalRequests = $results.TotalRequests
    SuccessCount = $results.SuccessCount
    FailureCount = $results.FailureCount
    SuccessRate = $successRate
    ErrorRate = $errorRate
    ResponseTimes = @{
        Min = $minResponseTime
        Max = $maxResponseTime
        Average = $avgResponseTime
        P50 = $p50
        P95 = $p95
        P99 = $p99
    }
    ErrorCodes = $results.ErrorCodes
    ThresholdsPassed = @{
        ErrorRate = $errorRatePass
        P95Latency = $p95Pass
        SuccessRate = $successRatePass
    }
}

$jsonPath = "stress-test-results-$(Get-Date -Format 'yyyy-MM-dd').json"
$resultsObject | ConvertTo-Json | Out-File -FilePath $jsonPath
Write-Host "Results saved to: $jsonPath" -ForegroundColor Green
