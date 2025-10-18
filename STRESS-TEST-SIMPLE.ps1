# PowerShell Live Website Stress Test
param(
    [int]$VirtualUsers = 50,
    [int]$DurationSeconds = 180,
    [string]$BaseUrl = "https://3mpwrapp.github.io"
)

$pages = @(
    @{ url = "/"; weight = 35; name = "Homepage" },
    @{ url = "/features"; weight = 20; name = "Features" },
    @{ url = "/user-guide"; weight = 20; name = "User Guide" },
    @{ url = "/blog"; weight = 15; name = "Blog" },
    @{ url = "/contact"; weight = 5; name = "Contact" },
    @{ url = "/accessibility"; weight = 5; name = "Accessibility" }
)

$successCount = 0
$failureCount = 0
$responseTimes = @()
$startTime = Get-Date
$errors = @{}

Write-Host "======================================================"
Write-Host "  3MPOWR WEBSITE - LIVE STRESS TEST"
Write-Host "======================================================"
Write-Host ""
Write-Host "Base URL: $BaseUrl"
Write-Host "Duration: $DurationSeconds seconds"
Write-Host ""
Write-Host "Starting stress test..."
Write-Host ""

$endTime = $startTime.AddSeconds($DurationSeconds)

while ((Get-Date) -lt $endTime) {
    $rand = Get-Random -Maximum 100
    $cumsum = 0
    $page = $pages[0]
    
    foreach ($p in $pages) {
        $cumsum += $p.weight
        if ($rand -lt $cumsum) {
            $page = $p
            break
        }
    }
    
    $url = "$BaseUrl$($page.url)"
    $testStart = Get-Date
    
    try {
        $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $duration = ((Get-Date) - $testStart).TotalMilliseconds
        $successCount++
        $responseTimes += $duration
        Write-Host "[OK] $($page.name) $([int]$duration)ms" -ForegroundColor Green
    }
    catch {
        $duration = ((Get-Date) - $testStart).TotalMilliseconds
        $failureCount++
        
        $errorCode = "ERROR"
        if ($_.Exception.Response) {
            $errorCode = $_.Exception.Response.StatusCode.Value__
        }
        
        if ($errors[$errorCode] -eq $null) {
            $errors[$errorCode] = 0
        }
        $errors[$errorCode]++
        
        Write-Host "[FAIL] $($page.name) $errorCode" -ForegroundColor Red
    }
    
    Start-Sleep -Milliseconds 100
}

$totalRequests = $successCount + $failureCount
$successRate = if ($totalRequests -gt 0) { [math]::Round(($successCount / $totalRequests) * 100, 2) } else { 0 }
$errorRate = [math]::Round(100 - $successRate, 2)

if ($responseTimes.Count -gt 0) {
    $avg = [math]::Round(($responseTimes | Measure-Object -Average).Average, 2)
    $max = [math]::Round(($responseTimes | Measure-Object -Maximum).Maximum, 2)
    $min = [math]::Round(($responseTimes | Measure-Object -Minimum).Minimum, 2)
    
    $sorted = $responseTimes | Sort-Object
    $p50 = [math]::Round($sorted[[int]($sorted.Count * 0.50)], 2)
    $p95 = [math]::Round($sorted[[int]($sorted.Count * 0.95)], 2)
    $p99 = [math]::Round($sorted[[int]($sorted.Count * 0.99)], 2)
}

Write-Host ""
Write-Host "======================================================"
Write-Host "  STRESS TEST RESULTS"
Write-Host "======================================================"
Write-Host ""
Write-Host "REQUEST STATISTICS"
Write-Host "  Total: $totalRequests"
Write-Host "  Success: $successCount ($successRate%)"
Write-Host "  Failed: $failureCount ($errorRate%)"
Write-Host ""
Write-Host "RESPONSE TIME (ms)"
Write-Host "  Min: $min"
Write-Host "  Max: $max"
Write-Host "  Avg: $avg"
Write-Host "  P50: $p50"
Write-Host "  P95: $p95"
Write-Host "  P99: $p99"
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "ERRORS"
    foreach ($code in $errors.GetEnumerator()) {
        Write-Host "  $($code.Name): $($code.Value)"
    }
    Write-Host ""
}

$errorPass = if ($errorRate -le 5) { $true } else { $false }
$p95Pass = if ($p95 -le 5000) { $true } else { $false }
$successPass = if ($successRate -ge 95) { $true } else { $false }

Write-Host "THRESHOLDS"

if ($errorPass) {
    Write-Host "  Error Rate: PASS $errorRate%" -ForegroundColor Green
} else {
    Write-Host "  Error Rate: FAIL $errorRate%" -ForegroundColor Red
}

if ($p95Pass) {
    Write-Host "  P95 Latency: PASS $p95 ms" -ForegroundColor Green
} else {
    Write-Host "  P95 Latency: FAIL $p95 ms" -ForegroundColor Red
}

if ($successPass) {
    Write-Host "  Success Rate: PASS $successRate%" -ForegroundColor Green
} else {
    Write-Host "  Success Rate: FAIL $successRate%" -ForegroundColor Red
}

Write-Host ""

$allPass = $errorPass -and $p95Pass -and $successPass
if ($allPass) {
    Write-Host "RESULT: PASS" -ForegroundColor Green
} else {
    Write-Host "RESULT: FAIL" -ForegroundColor Red
}

Write-Host ""
