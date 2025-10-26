# PowerShell script to fix gap properties in React Native files
# Replaces inline gap properties with GapView component

$files = @(
    "app\(tabs)\wellness\symptom-tracker.tsx",
    "app\(tabs)\wellness\sleep-energy-tracker.impl.tsx",
    "app\(tabs)\wellness\resilience.tsx",
    "app\(tabs)\wellness\reflections-calendar.impl.tsx",
    "app\(tabs)\wellness\nutrition-guides.tsx",
    "app\(tabs)\wellness\hub.tsx",
    "app\whatsnew\index.tsx",
    "app\safe-landing.tsx",
    "app\podcasts\index.tsx",
    "app\campaigns\index.tsx",
    "app\events\[id].tsx",
    "app\events\index.impl.tsx",
    "app\events\finder.tsx",
    "app\research\wait-times.tsx",
    "app\research\uncrpd-info.tsx",
    "app\research\master-index.tsx",
    "app\research\index.tsx",
    "app\onboarding\index.tsx",
    "app\onboarding\first7.tsx",
    "app\(auth)\onboarding.tsx"
)

foreach ($file in $files) {
    $fullPath = "d:\1-EmpowrApp\empowrapp-new\empowrapp-new\$file"
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Check if file already imports GapView
        if ($content -notmatch "import GapView") {
            # Add GapView import after other component imports
            $content = $content -replace "(import .*from ['\`"]\.\.\/.*components\/[^'`"]+['\`"];)", "`$1`nimport GapView from '../components/GapView';"
            Write-Host "  - Added GapView import" -ForegroundColor Green
        }
        
        # Replace inline gap properties
        $replacements = 0
        
        # Pattern 1: <View style={{ ..., gap: N, ... }}>
        if ($content -match "style=\{\{\s*[^}]*gap:\s*\d+") {
            $content = $content -replace "<View\s+style=\{\{\s*([^}]*)\s*gap:\s*(\d+)([^}]*)\}\}>", "<GapView style={{ `$1`$3 }} gap={`$2}>"
            $content = $content -replace "</View>", "</GapView>"
            $replacements++
        }
        
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "  - Made $replacements replacements" -ForegroundColor Yellow
    } else {
        Write-Host "File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Please review changes and test." -ForegroundColor Green
