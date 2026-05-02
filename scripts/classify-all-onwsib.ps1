# ONWSIB Classification Automation - All Batches
# Classifies 431 WSIB Internal Review decisions

$scriptsDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\scripts"
$batchesDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\data\comprehensive-extraction\onwsib-batches"

# Change to scripts directory
Set-Location $scriptsDir

# ONWSIB Classification Function (WSIB Internal Review)
function Get-ONWSIBClassification {
    param($decision)
    
    $keywords = $decision.keywords.ToLower()
    $title = $decision.title.ToLower()
    
    # Procedural matters -> other/high
    if ($keywords -match 'jurisdiction|time limit|extension|withdrawal|reconsideration|preliminary|threshold') {
        return @{
            outcome = "other"
            confidence = "high"
            reasoning = "Procedural matter (jurisdiction, time limits, or withdrawal)"
        }
    }

    # Appeal GRANTED/Allowed -> allowed/high
    if ($keywords -match 'appeal.*granted|appeal.*allowed|decision.*overturned|entitlement.*upheld|allowed|granted') {
        return @{
            outcome = "allowed"
            confidence = "high"
            reasoning = "Appeal granted or decision overturned"
        }
    }

    # Appeal DENIED/Dismissed -> denied/high
    if ($keywords -match 'appeal.*dismissed|appeal.*denied|decision.*confirmed|no entitlement|dismissed|denied') {
        return @{
            outcome = "denied"
            confidence = "high"
            reasoning = "Appeal dismissed or decision confirmed"
        }
    }

    # Remitted back to WSIB -> remitted/high
    if ($keywords -match 'remit|refer.*back|return.*wsib|send back') {
        return @{
            outcome = "remitted"
            confidence = "high"
            reasoning = "Case remitted back to WSIB for reconsideration"
        }
    }

    # Partial success -> partial/medium
    if ($keywords -match 'partial|in part|some.*granted') {
        return @{
            outcome = "partial"
            confidence = "medium"
            reasoning = "Partial success on appeal"
        }
    }

    # Injury/medical terms -> unclear/low
    if ($keywords -match 'injury|pain|impairment|chronic|accident|medical|condition|disability') {
        return @{
            outcome = "unclear"
            confidence = "low"
            reasoning = "Medical or injury issue without clear resolution"
        }
    }

    # Default -> unclear/low
    return @{
        outcome = "unclear"
        confidence = "low"
        reasoning = "Insufficient information to determine outcome"
    }
}

# Get starting batch
$extractionDir = Split-Path $batchesDir -Parent
$progressFile = Join-Path $extractionDir "onwsib-progress.json"
$progress = Get-Content $progressFile -Raw | ConvertFrom-Json
$currentBatch = $progress.batches.Count + 1

$totalDecisions = 431
$startTime = Get-Date

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ONWSIB CLASSIFICATION AUTOMATION - ALL BATCHES           " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting from Batch $currentBatch" -ForegroundColor Yellow
Write-Host "Total: $totalDecisions WSIB Internal Review decisions" -ForegroundColor Yellow
Write-Host "Current progress: $($progress.classified) / $totalDecisions`n" -ForegroundColor Yellow

$batchesProcessed = 0
$decisionsClassified = 0
$emptyBatchCount = 0

# Process batches until complete
while ($true) {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "BATCH $currentBatch" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""

    # Step 1: Prepare batch
    Write-Host "[1/4] Preparing batch..." -ForegroundColor Cyan
    $prepareOutput = node prepare-onwsib-batch.mjs 2>&1 | Out-String
    
    $pendingFile = Join-Path $batchesDir "batch-$currentBatch-PENDING.json"
    if (-not (Test-Path $pendingFile)) {
        Write-Host "  [OK] No more batches to process" -ForegroundColor Green
        break
    }
    
    $batch = Get-Content $pendingFile -Raw | ConvertFrom-Json
    $decisionsInBatch = $batch.decisions.Count
    
    # Stop if empty batch (all decisions classified)
    if ($decisionsInBatch -eq 0) {
        Write-Host "  [OK] Batch $currentBatch is empty - all decisions classified!" -ForegroundColor Green
        $emptyBatchCount++
        if ($emptyBatchCount -ge 3) {
            Write-Host "`n  [STOP] 3 empty batches in a row - classification complete" -ForegroundColor Yellow
            break
        }
        $currentBatch++
        continue
    }
    
    Write-Host "  [OK] Batch $currentBatch created: $decisionsInBatch decisions" -ForegroundColor Green

    # Step 2: Classify decisions
    Write-Host "`n[2/4] Classifying decisions..." -ForegroundColor Cyan
    
    $mergedFile = Join-Path $batchesDir "batch-$currentBatch-MERGED.json"
    if (Test-Path $mergedFile) {
        Remove-Item $mergedFile
    }
    
    $classified = 0
    foreach ($decision in $batch.decisions) {
        $classification = Get-ONWSIBClassification -decision $decision
        $decision | Add-Member -MemberType NoteProperty -Name "outcome" -Value $classification.outcome -Force
        $decision | Add-Member -MemberType NoteProperty -Name "confidence" -Value $classification.confidence -Force
        $decision | Add-Member -MemberType NoteProperty -Name "reasoning" -Value $classification.reasoning -Force
        $classified++
    }
    
    # Write JSON
    $batch | ConvertTo-Json -Depth 10 -Compress | Set-Content $mergedFile -NoNewline -Encoding UTF8
    Write-Host "  [OK] Classified $classified decisions" -ForegroundColor Green
    
    # Show distribution
    $dist = $batch.decisions | Group-Object outcome
    $distStr = ($dist | ForEach-Object { "$($_.Name):$($_.Count)" }) -join ", "
    Write-Host "  -> Distribution: $distStr" -ForegroundColor Gray
    
    # Step 3: Clean JSON
    Write-Host "`n[3/4] Cleaning JSON..." -ForegroundColor Cyan
    try {
        $cleanOutput = node clean-onwsib-batch.mjs 2>&1
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
    $consolidateOutput = node consolidate-onwsib-batch.mjs 2>&1 | Out-String
    
    if ($consolidateOutput -match "Batch consolidated successfully") {
        Write-Host "  [OK] Batch $currentBatch consolidated" -ForegroundColor Green
        $batchesProcessed++
        $decisionsClassified += $classified
        $emptyBatchCount = 0
    } else {
        Write-Host "  [ERROR] Consolidation failed" -ForegroundColor Red
        Write-Host $consolidateOutput
        break
    }
    
    # Progress update
    $elapsed = (Get-Date) - $startTime
    $pct = [math]::Round($decisionsClassified / $totalDecisions * 100, 1)
    
    Write-Host "`n  [PROGRESS] Overall: $decisionsClassified / $totalDecisions ($pct%)" -ForegroundColor Gray
    Write-Host "`n  [TIME] $([math]::Round($elapsed.TotalSeconds, 1))s elapsed`n" -ForegroundColor Gray
    
    $currentBatch++
    
    # Safety: stop after 10 batches (431 decisions / 100 per batch = max 5 batches)
    if ($batchesProcessed -ge 10) {
        Write-Host "`n[SAFETY] Stopping after 10 batches processed" -ForegroundColor Yellow
        break
    }
}

$elapsed = (Get-Date) - $startTime
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "              CLASSIFICATION COMPLETE!                      " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Batches processed: $batchesProcessed" -ForegroundColor Green
Write-Host "Decisions classified: $decisionsClassified / $totalDecisions" -ForegroundColor Green
Write-Host "Total time: $([math]::Round($elapsed.TotalSeconds, 1))s" -ForegroundColor Green
Write-Host ""
Write-Host "*** ONWSIB classification complete! ***" -ForegroundColor Yellow
Write-Host ""
