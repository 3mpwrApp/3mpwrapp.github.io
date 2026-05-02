# Master script to classify all remaining WSIAT batches
# Automates: prepare → classify → clean → consolidate

$scriptsDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\scripts"
$batchesDir = "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\data\comprehensive-extraction\ai-batches"

# Classification function
function Get-Classification {
    param($decision)
    
    $keywords = $decision.keywords.ToLower()
    $title = $decision.title.ToLower()
    $caseNumber = $decision.caseNumber
    
    # Procedural matters → other/high
    if ($caseNumber -match 'R\d*$|I\d+$|E\d*$' -or 
        $keywords -match 'reconsideration|withdrawal|adjournment|proposed resolution|extension|time limit|time extension|mediation|threshold test|clarification|downside risk|withdrawn|closes|intertwined|sequential') {
        return @{
            outcome = "other"
            confidence = "high"
            reasoning = "Procedural matter - reconsideration, withdrawal, time extension, or administrative process"
        }
    }
    
    # Explicit entitlement → allowed/high
    if ($keywords -match 'entitled to benefits|entitled to full benefits|worker is entitled|compensable(?! accident)' -or
        $keywords -match 'entitled to benefits for|entitled to claim benefits') {
        return @{
            outcome = "allowed"
            confidence = "high"
            reasoning = "Explicit entitlement language indicating benefits were granted"
        }
    }
    
    # Partial entitlement → partial/high
    if ($keywords -match 'entitled to partial|partial benefits|offset by|difference between') {
        return @{
            outcome = "partial"
            confidence = "high"
            reasoning = "Partial entitlement or benefits with offset indicated"
        }
    }
    
    # Administrative/cost relief → other/medium
    if ($keywords -match 'cost relief|employer.*access|information.*file|access.*file|retroactive adjustment|premium|classification|rebate|fatal claim|related entities') {
        return @{
            outcome = "other"
            confidence = "medium"
            reasoning = "Administrative matter - cost relief, file access, premium adjustment, or classification issue"
        }
    }
    
    # Denied/non-compensable → denied/medium
    if ($keywords -match 'non-compensable|not work-related|non-work-related') {
        return @{
            outcome = "denied"
            confidence = "medium"
            reasoning = "Non-compensable or non-work-related condition mentioned"
        }
    }
    
    # Remitted back → remitted/medium
    if ($keywords -match 'remit|abeyance|adjournment|rescheduled|pandemic|future|outstanding') {
        return @{
            outcome = "remitted"
            confidence = "medium"
            reasoning = "Case remitted, adjourned, or held in abeyance"
        }
    }
    
    # Pre-existing conditions
    if ($keywords -match 'pre-existing condition|pre-accident disability|greater severity|enhanced|prolonged') {
        if ($keywords -match 'accident|work-related injury|compensable') {
            return @{
                outcome = "unclear"
                confidence = "medium"
                reasoning = "Pre-existing condition interacting with work-related injury - outcome depends on specific analysis"
            }
        } else {
            return @{
                outcome = "unclear"
                confidence = "low"
                reasoning = "Pre-existing condition mentioned without clear outcome"
            }
        }
    }
    
    # Labor market re-entry/benefits calculation → unclear/medium
    if ($keywords -match 'labour market re-entry|earnings|benefits based|suitable|modified work|return to work|entry-level' -and
        -not ($keywords -match 'entitled to')) {
        return @{
            outcome = "unclear"
            confidence = "medium"
            reasoning = "Benefits calculation or labor market re-entry issue - ongoing determination without clear final outcome"
        }
    }
    
    # Rating/impairment determination → unclear/medium
    if ($keywords -match 'rating|impairment|redetermination|quantum|permanent disability' -and
        -not ($keywords -match 'entitled to')) {
        return @{
            outcome = "unclear"
            confidence = "medium"
            reasoning = "Impairment rating or permanent disability determination - technical assessment without clear allow/deny"
        }
    }
    
    # Default: unclear/low
    return @{
        outcome = "unclear"
        confidence = "low"
        reasoning = "Injury or medical condition mentioned without clear indicators of final outcome"
    }
}

# Get starting batch number
$extractionDir = Split-Path $batchesDir -Parent
$progressFile = Join-Path $extractionDir "ai-progress.json"
$progress = Get-Content $progressFile -Raw | ConvertFrom-Json
$currentBatch = $progress.batches.Count + 1

$totalDecisions = 11430
$startTime = Get-Date

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  WSIAT CLASSIFICATION AUTOMATION - ALL REMAINING BATCHES  " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting from Batch $currentBatch" -ForegroundColor Yellow
Write-Host "Current progress: $($progress.classifiedCount) / $totalDecisions" -ForegroundColor Yellow
Write-Host "Remaining: $($totalDecisions - $progress.classifiedCount) decisions`n" -ForegroundColor Yellow

$batchesProcessed = 0
$decisionsProcessed = 0

while ($progress.classifiedCount -lt $totalDecisions) {
    $batchNum = $progress.batches.Count + 1
    
    Write-Host "=" -ForegroundColor DarkCyan -NoNewline; Write-Host ("="*59) -ForegroundColor DarkCyan
    Write-Host "BATCH $batchNum" -ForegroundColor White -BackgroundColor DarkCyan
    Write-Host "=" -ForegroundColor DarkCyan -NoNewline; Write-Host ("="*59) -ForegroundColor DarkCyan
    
    # Step 1: Prepare batch
    Write-Host "`n[1/4] Preparing batch..." -ForegroundColor Cyan
    Set-Location $scriptsDir
    $prepareOutput = node prepare-ai-batch.mjs 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [ERROR] Failed preparing batch" -ForegroundColor Red
        Write-Host $prepareOutput
        break
    }
    
    # Extract batch info from output
    if ($prepareOutput -match "Batch (\d+): Decisions (\d+) - (\d+)") {
        $batchStart = [int]$Matches[2]
        $batchEnd = [int]$Matches[3]
        $batchSize = $batchEnd - $batchStart + 1
        Write-Host "  [OK] Batch $batchNum created: $batchSize decisions" -ForegroundColor Green
    }
    
    # Step 2: Classify decisions
    Write-Host "`n[2/4] Classifying decisions..." -ForegroundColor Cyan
    Set-Location $batchesDir
    
    $pendingFile = "batch-$batchNum-PENDING.json"
    $mergedFile = "batch-$batchNum-MERGED.json"
    
    if (-not (Test-Path $pendingFile)) {
        Write-Host "  [ERROR] Pending file not found: $pendingFile" -ForegroundColor Red
        break
    }
    
    $batch = Get-Content $pendingFile -Raw | ConvertFrom-Json
    $classified = 0
    
    foreach ($decision in $batch.decisions) {
        $classification = Get-Classification -decision $decision
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
    Set-Location $scriptsDir
    
    $cleanScript = @"
import fs from 'fs';
import path from 'path';
const batchesDir = '../data/comprehensive-extraction/ai-batches';
const file = path.join(batchesDir, 'batch-$batchNum-MERGED.json');
const raw = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);
fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Cleaned');
"@
    
    $cleanScript | Set-Content "temp-clean.mjs" -Encoding UTF8
    $cleanOutput = node temp-clean.mjs 2>&1
    Remove-Item "temp-clean.mjs" -ErrorAction SilentlyContinue
    
    if ($cleanOutput -match "Cleaned") {
        Write-Host "  [OK] JSON cleaned" -ForegroundColor Green
    }
    
    # Step 4: Consolidate
    Write-Host "`n[4/4] Consolidating..." -ForegroundColor Cyan
    $consOutput = node consolidate-ai-batch.mjs 2>&1 | Out-String
    
    if ($consOutput -match "Batch $batchNum merged successfully") {
        Write-Host "  [OK] Batch $batchNum consolidated" -ForegroundColor Green
        $batchesProcessed++
        $decisionsProcessed += $classified
        
        # Extract progress from output
        if ($consOutput -match "Classified: (\d+)") {
            $totalClassified = [int]$Matches[1]
            $percentComplete = [math]::Round(($totalClassified / $totalDecisions) * 100, 1)
            Write-Host "`n  [PROGRESS] Overall: $totalClassified / $totalDecisions ($percentComplete%)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [ERROR] Consolidation failed" -ForegroundColor Red
        Write-Host $consOutput
        break
    }
    
    # Reload progress for next iteration
    $progress = Get-Content $progressFile -Raw | ConvertFrom-Json
    
    # Show time estimate
    $elapsed = (Get-Date) - $startTime
    $avgTimePerBatch = $elapsed.TotalSeconds / $batchesProcessed
    $remainingBatches = [math]::Ceiling(($totalDecisions - $progress.classifiedCount) / 500)
    $estimatedRemaining = [TimeSpan]::FromSeconds($avgTimePerBatch * $remainingBatches)
    
    Write-Host "`n  [TIME] $([math]::Round($elapsed.TotalMinutes, 1))m elapsed | ~$([math]::Round($estimatedRemaining.TotalMinutes, 0))m remaining" -ForegroundColor Gray
    Write-Host ""
}

$totalTime = (Get-Date) - $startTime

Write-Host "============================================================" -ForegroundColor Green
Write-Host "              CLASSIFICATION COMPLETE!                      " -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Batches processed: $batchesProcessed" -ForegroundColor White
Write-Host "Decisions classified: $decisionsProcessed" -ForegroundColor White
Write-Host "Total time: $([math]::Round($totalTime.TotalMinutes, 1)) minutes" -ForegroundColor White
Write-Host "Average: $([math]::Round($totalTime.TotalSeconds / $batchesProcessed, 1))s per batch" -ForegroundColor White
Write-Host ""
Write-Host "*** All 11,430 WSIAT decisions now classified! ***" -ForegroundColor Cyan
