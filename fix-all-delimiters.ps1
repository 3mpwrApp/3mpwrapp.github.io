# Fix all blog posts with extra --- delimiters
# YAML front matter needs exactly 2 ---
# All others should be * * * for horizontal rules

$files = Get-ChildItem _posts\*.md | Where-Object { 
    (Select-String -Path $_.FullName -Pattern "^---\s*$" -AllMatches).Matches.Count -gt 2 
}

Write-Host "Found $($files.Count) files to fix" -ForegroundColor Yellow

$fixedCount = 0
$errorCount = 0

foreach ($file in $files) {
    try {
        Write-Host "Processing: $($file.Name)" -ForegroundColor Cyan
        
        # Read all lines
        $lines = Get-Content $file.FullName
        $newLines = @()
        $dashCount = 0
        
        foreach ($line in $lines) {
            if ($line -match '^\s*---\s*$') {
                $dashCount++
                if ($dashCount -le 2) {
                    # Keep first 2 --- for YAML front matter
                    $newLines += $line
                } else {
                    # Replace subsequent --- with * * *
                    $newLines += "* * *"
                }
            } else {
                $newLines += $line
            }
        }
        
        # Write back without BOM
        $content = $newLines -join "`n"
        [System.IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding $false))
        
        $fixedCount++
        Write-Host "  ✅ Fixed ($dashCount -> 2)" -ForegroundColor Green
    }
    catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n==== Summary ====" -ForegroundColor Magenta
Write-Host "Fixed: $fixedCount" -ForegroundColor Green
Write-Host "Errors: $errorCount" -ForegroundColor Red
Write-Host "Total: $($files.Count)" -ForegroundColor Cyan
