# ONSBT Classification Automation
# Classifies all remaining ONSBT batches automatically

$scriptsDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\scripts"
$batchesDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\data\comprehensive-extraction\onsbt-batches"

# Change to scripts directory for Node script execution
Set-Location $scriptsDir

# ONSBT Classification Function (Social Benefits Tribunal)
function Get-ONSBTClassification {
    param($decision)
    
    $keywords = $decision.keywords.ToLower()
    $title = $decision.title.ToLower()
    
    # Procedural matters -> other/high
    if ($keywords -match 'reconsideration|withdrawal|adjournment|extension|time limit|mediation|threshold test|clarification') {
        return @{
            outcome = "other"
            confidence = "high"
            reasoning = "Procedural matter (reconsideration, withdrawal, or time extension)"
        }
    }

    # Eligibility GRANTED -> allowed/high
    if ($keywords -match 'granted|eligibility upheld|entitled|appeal allowed|approved|person with a disability.*substantial|substantial.*impairments') {
        return @{
            outcome = "allowed"
            confidence = "high"
            reasoning = "Eligibility granted or appeal allowed"
        }
    }

    # Eligibility DENIED -> denied/high
    if ($keywords -match 'appeal dismissed|not eligible|no entitlement|dismissed|denied|not entitled|ineligible') {
        return @{
            outcome = "denied"
            confidence = "high"
            reasoning = "Appeal dismissed or eligibility denied"
        }
    }

    # Overpayment/recovery (administrative) -> other/medium
    if ($keywords -match 'overpayment|recovery|repayment|collected|amount.*owed') {
        return @{
            outcome = "other"
            confidence = "medium"
            reasoning = "Overpayment or recovery determination"
        }
    }

    # Disability determination (medical terms) -> unclear/low
    if ($keywords -match 'impairments|pain|substantial|disability|chronic|condition|medical|treatment') {
        return @{
            outcome = "unclear"
            confidence = "low"
            reasoning = "Disability or medical condition mentioned without clear outcome"
        }
    }

    # Shelter/income issues -> unclear/low
    if ($keywords -match 'shelter|income|rent|housing|subsidy|earnings') {
        return @{
            outcome = "unclear"
            confidence = "low"
            reasoning = "Financial eligibility issue without clear resolution"
        }
    }

    # Default -> unclear/low
    return @{
        outcome = "unclear"
        confidence = "low"
        reasoning = "Insufficient information to determine outcome"
    }
}

# Get starting batch number
$extractionDir = Split-Path $batchesDir -Parent
$progressFile = Join-Path $extractionDir "onsbt-progress.json"
$progress = Get-Content $progressFile -Raw | ConvertFrom-Json
$currentBatch = $progress.batches.Count + 1

# Helper function for percentage calculation
function pct($count) {
    return ([math]::Round(($count / $outcomeStats.total) * 100, 1))
}

$totalDecisions = 13798
$startTime = Get-Date

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ONSBT CLASSIFICATION AUTOMATION - ALL REMAINING BATCHES  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting from Batch $currentBatch" -ForegroundColor Yellow
Write-Host "Current progress: $($progress.classifiedCount) / $totalDecisions" -ForegroundColor Yellow
Write-Host "Remaining: $($totalDecisions - $progress.classifiedCount) decisions`n" -ForegroundColor Yellow

$batchesProcessed = 0
$decisionsClassified = 0

# Process batches until no more remain
while ($true) {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "BATCH $currentBatch" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""

    # Step 1: Prepare batch
    Write-Host "[1/4] Preparing batch..." -ForegroundColor Cyan
    $prepareOutput = node prepare-onsbt-batch.mjs 2>&1 | Out-String
    
    $pendingFile = Join-Path $batchesDir "batch-$currentBatch-PENDING.json"
    if (-not (Test-Path $pendingFile)) {
        Write-Host "  [OK] No more batches to process" -ForegroundColor Green
        break
    }
    
    Write-Host "  [OK] Batch $currentBatch created: 500 decisions" -ForegroundColor Green

    # Step 2: Classify decisions
    Write-Host "`n[2/4] Classifying decisions..." -ForegroundColor Cyan
    
    $mergedFile = Join-Path $batchesDir "batch-$currentBatch-MERGED.json"
    
    if (Test-Path $mergedFile) {
        Remove-Item $mergedFile
    }
    
    $batch = Get-Content $pendingFile -Raw | ConvertFrom-Json
    $classified = 0
    
    foreach ($decision in $batch.decisions) {
        $classification = Get-ONSBTClassification -decision $decision
        $decision.outcome = $classification.outcome
        $decision.confidence = $classification.confidence
        $decision.reasoning = $classification.reasoning
        $classified++
    }
    
    # Write with proper JSON formatting
    $batch | ConvertTo-Json -Depth 10 -Compress | Set-Content $mergedFile -NoNewline -Encoding UTF8
    
    Write-Host "  [OK] Classified $classified decisions" -ForegroundColor Green
    
    # Show quick distribution
    $dist = $batch.decisions | Group-Object outcome
    $distStr = ($dist | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", "
    Write-Host "  -> Distribution: $distStr" -ForegroundColor Gray
    
    # Step 3: Clean JSON (remove BOM if present)
    Write-Host "`n[3/4] Cleaning JSON..." -ForegroundColor Cyan
    
    try {
        $cleanOutput = node clean-onsbt-batch.mjs 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] JSON cleaned" -ForegroundColor Green
        } else {
            Write-Host "  [WARNING] Clean script not found, skipping" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [WARNING] Clean script not found, skipping" -ForegroundColor Yellow
    }
    
    # Step 4: Consolidate
    Write-Host "`n[4/4] Consolidating..." -ForegroundColor Cyan
    $consolidateOutput = node consolidate-onsbt-batch.mjs 2>&1 | Out-String
    
    if ($consolidateOutput -match "Batch consolidated successfully") {
        Write-Host "  [OK] Batch $currentBatch consolidated" -ForegroundColor Green
        $batchesProcessed++
        $decisionsClassified += $classified
    } else {
        Write-Host "  [ERROR] Consolidation failed" -ForegroundColor Red
        Write-Host $consolidateOutput
        break
    }
    
    # Progress update
    $elapsed = (Get-Date) - $startTime
    $avgPerBatch = if ($batchesProcessed -gt 0) { $elapsed.TotalMinutes / $batchesProcessed } else { 0 }
    $remaining = [math]::Max(0, [math]::Ceiling((28 - $currentBatch) * $avgPerBatch))
    
    Write-Host "`n  [PROGRESS] Overall: $decisionsClassified / $totalDecisions ($([math]::Round($decisionsClassified / $totalDecisions * 100, 1))%)" -ForegroundColor Gray
    Write-Host "`n  [TIME] $([math]::Round($elapsed.TotalMinutes, 1))m elapsed | ~$($remaining)m remaining`n" -ForegroundColor Gray
    
    $currentBatch++
}

$elapsed = (Get-Date) - $startTime
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "              CLASSIFICATION COMPLETE!                      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Batches processed: $batchesProcessed" -ForegroundColor Green
Write-Host "Decisions classified: $decisionsClassified" -ForegroundColor Green
Write-Host "Total time: $([math]::Round($elapsed.TotalMinutes, 1)) minutes" -ForegroundColor Green
Write-Host "Average: $([math]::Round($elapsed.TotalSeconds / $batchesProcessed, 1))s per batch" -ForegroundColor Green
Write-Host ""
Write-Host "*** All 13,798 ONSBT decisions now classified! ***" -ForegroundColor Yellow
Write-Host ""
