# Classify Batch 29 decisions based on keyword patterns

$pendingFile = "batch-29-PENDING.json"
$mergedFile = "batch-29-MERGED.json"

# Read the pending batch
$batch = Get-Content $pendingFile -Raw | ConvertFrom-Json

# Classification function based on established patterns
function Get-Classification {
    param($decision)
    
    $keywords = $decision.keywords.ToLower()
    $title = $decision.title.ToLower()
    $caseNumber = $decision.caseNumber
    
    # Pattern 1: Procedural matters → other/high
    if ($caseNumber -match 'R\d*$|I\d+$|E\d*$' -or 
        $keywords -match 'reconsideration|withdrawal|adjournment|proposed resolution|extension|time limit|time extension|mediation|threshold test|clarification|downside risk|withdrawn|closes|intertwined|sequential') {
        return @{
            outcome = "other"
            confidence = "high"
            reasoning = "Procedural matter - reconsideration, withdrawal, time extension, or administrative process"
        }
    }
    
    # Pattern 2: Explicit entitlement language → allowed/high
    if ($keywords -match 'entitled to benefits|entitled to full benefits|worker is entitled|compensable(?! accident)' -or
        $keywords -match 'entitled to benefits for|entitled to claim benefits') {
        return @{
            outcome = "allowed"
            confidence = "high"
            reasoning = "Explicit entitlement language indicating benefits were granted"
        }
    }
    
    # Pattern 3: Partial entitlement → partial/high
    if ($keywords -match 'entitled to partial|partial benefits|offset by|difference between') {
        return @{
            outcome = "partial"
            confidence = "high"
            reasoning = "Partial entitlement or benefits with offset indicated"
        }
    }
    
    # Pattern 4: Administrative/cost relief matters → other/medium
    if ($keywords -match 'cost relief|employer.*access|information.*file|access.*file|retroactive adjustment|premium|classification|rebate|fatal claim|related entities') {
        return @{
            outcome = "other"
            confidence = "medium"
            reasoning = "Administrative matter - cost relief, file access, premium adjustment, or classification issue"
        }
    }
    
    # Pattern 5: Denied/non-compensable indicators → denied/medium
    if ($keywords -match 'non-compensable|not work-related|non-work-related') {
        return @{
            outcome = "denied"
            confidence = "medium"
            reasoning = "Non-compensable or non-work-related condition mentioned"
        }
    }
    
    # Pattern 6: Remitted back → remitted/medium
    if ($keywords -match 'remit|abeyance|adjournment|rescheduled|pandemic|future|outstanding') {
        return @{
            outcome = "remitted"
            confidence = "medium"
            reasoning = "Case remitted, adjourned, or held in abeyance"
        }
    }
    
    # Pattern 7: Pre-existing conditions (often partial or unclear)
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
    
    # Pattern 8: Labor market re-entry/benefits calculation → unclear/medium
    if ($keywords -match 'labour market re-entry|earnings|benefits based|suitable|modified work|return to work|entry-level' -and
        -not ($keywords -match 'entitled to')) {
        return @{
            outcome = "unclear"
            confidence = "medium"
            reasoning = "Benefits calculation or labor market re-entry issue - ongoing determination without clear final outcome"
        }
    }
    
    # Pattern 9: Rating/impairment determination → unclear/medium
    if ($keywords -match 'rating|impairment|redetermination|quantum|permanent disability' -and
        -not ($keywords -match 'entitled to')) {
        return @{
            outcome = "unclear"
            confidence = "medium"
            reasoning = "Impairment rating or permanent disability determination - technical assessment without clear allow/deny"
        }
    }
    
    # Default: Injury keywords without clear outcome → unclear/low
    return @{
        outcome = "unclear"
        confidence = "low"
        reasoning = "Injury or medical condition mentioned without clear indicators of final outcome"
    }
}

# Process all decisions
Write-Host "Classifying $($batch.decisions.Count) decisions..." -ForegroundColor Cyan

$classified = 0
foreach ($decision in $batch.decisions) {
    $classification = Get-Classification -decision $decision
    $decision.outcome = $classification.outcome
    $decision.confidence = $classification.confidence
    $decision.reasoning = $classification.reasoning
    $classified++
    
    if ($classified % 50 -eq 0) {
        Write-Host "  Classified $classified / $($batch.decisions.Count)" -ForegroundColor Gray
    }
}

# Write the merged file
$batch | ConvertTo-Json -Depth 10 | Set-Content $mergedFile -Encoding UTF8

Write-Host "`nClassification complete!" -ForegroundColor Green
Write-Host "Output: $mergedFile" -ForegroundColor Green

# Show distribution
$distribution = $batch.decisions | Group-Object outcome | Sort-Object Count -Descending
Write-Host "`nOutcome Distribution:" -ForegroundColor Yellow
$distribution | ForEach-Object {
    Write-Host "  $($_.Name): $($_.Count)" -ForegroundColor White
}
