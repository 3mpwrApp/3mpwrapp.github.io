# Batch replace console.error with logError
# This script updates multiple files at once

$files = @(
    "components\ErrorBoundary.tsx",
    "components\LazyLoadWrapper.tsx",
    "components\LetterWizardContent.tsx",
    "components\SafeProviderWrapper.tsx",
    "components\JurisdictionDeadlineCalculator.tsx",
    "components\LegalWorkflowEngine.tsx",
    "components\PeerSupportContent.tsx",
    "components\LegalAutomationContent.tsx",
    "components\EnhancedHubContent.tsx",
    "services\patternLearning.ts",
    "services\notifications.ts",
    "services\disabilityWizard.ts",
    "services\cloudProvider.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        # Read content
        $content = Get-Content $file -Raw
        
        # Check if errorLogger import already exists
        $hasImport = $content -match "import.*logError.*errorLogger"
        
        if (-not $hasImport) {
            # Add import at the top (after existing imports)
            if ($content -match "(?s)(import.*?from.*?[';])\s*\n\s*\n") {
                $lastImport = $Matches[0]
                $content = $content -replace [regex]::Escape($lastImport), "$lastImport`nimport { logError } from '../utils/errorLogger';`n"
                Write-Host "  Added errorLogger import" -ForegroundColor Green
            }
        }
        
        # Replace console.error patterns
        $replacements = @{
            "console\.error\('Date calculation error:', error\);" = "logError('JurisdictionDeadlineCalculator', 'Date calculation error', error);"
            "console\.error\('Error loading workflow data:', error\);" = "logError('LegalWorkflowEngine', 'Error loading workflow data', error);"
            "console\.error\(`"Error loading user profile:`", error\);" = "logError('PeerSupportContent', 'Error loading user profile', error);"
            "console\.error\(`"Error loading matches:`", error\);" = "logError('PeerSupportContent', 'Error loading matches', error);"
            "console\.error\('\[saveLetter\] Failed to save letter:', error\);" = "logError('LetterWizardContent', 'Failed to save letter', error);"
            "console\.error\('\[deleteSavedLetter\] Failed to delete letter:', error\);" = "logError('LetterWizardContent', 'Failed to delete letter', error);"
            "console\.error\('\[updateSavedLetter\] Failed to update letter:', error\);" = "logError('LetterWizardContent', 'Failed to update letter', error);"
            "console\.error\('\[saveCurrentLetter\] Error:', error\);" = "logError('LetterWizardContent', 'Failed to save current letter', error);"
            "console\.error\('Error loading legal data:', error\);" = "logError('LegalAutomationContent', 'Error loading legal data', error);"
            "console\.error\('Error loading community data:', error\);" = "logError('EnhancedHubContent', 'Error loading community data', error);"
            "console\.error\('Error recording pattern data point:', error\);" = "logError('PatternLearning', 'Error recording pattern data point', error);"
            "console\.error\('Error fetching user patterns:', error\);" = "logError('PatternLearning', 'Error fetching user patterns', error);"
            "console\.error\('Error fetching pattern:', error\);" = "logError('PatternLearning', 'Error fetching pattern', error);"
            "console\.error\('Error deleting pattern:', error\);" = "logError('PatternLearning', 'Error deleting pattern', error);"
            "console\.error\('\[Push Notification Error\]', error\);" = "logError('Notifications', 'Push notification error', error);"
            "console\.error\('\[Push\] Token registration failed:', error\);" = "logError('Notifications', 'Token registration failed', error);"
            "console\.error\('Failed to load disability profile:', e\);" = "logError('DisabilityWizard', 'Failed to load disability profile', e);"
            "console\.error\('Failed to save disability profile:', e\);" = "logError('DisabilityWizard', 'Failed to save disability profile', e);"
            "console\.error\('Failed to load rotation state:', e\);" = "logError('DisabilityWizard', 'Failed to load rotation state', e);"
            "console\.error\('Failed to save rotation state:', e\);" = "logError('DisabilityWizard', 'Failed to save rotation state', e);"
            "console\.error\('\[getWizardSuggestions\] Failed to generate suggestions:', error\);" = "logError('DisabilityWizard', 'Failed to generate suggestions', error);"
            "console\.error\('\[useDisabilityWizard\] Error fetching suggestions:', err\);" = "logError('DisabilityWizard', 'Error fetching suggestions', err);"
            "console\.error\('\[CloudProvider\] Failed to save provider:', error\);" = "logError('CloudProvider', 'Failed to save provider', error);"
        }
        
        $changed = $false
        foreach ($pattern in $replacements.Keys) {
            if ($content -match $pattern) {
                $content = $content -replace $pattern, $replacements[$pattern]
                $changed = $true
                Write-Host "  Replaced: $pattern" -ForegroundColor Yellow
            }
        }
        
        if ($changed) {
            Set-Content $file $content -NoNewline
            Write-Host "  Updated $file" -ForegroundColor Green
        } else {
            Write-Host "  No changes needed" -ForegroundColor Gray
        }
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Run tests to verify changes." -ForegroundColor Cyan
