# Comprehensive Website Audit Script for 3mpwrApp
# Scans all 2,835 markdown files for:
# - Missing SEO metadata (title, description)
# - Missing French translations
# - Broken internal links
# - Missing alt text on images
# - Accessibility issues
# - Missing cross-links

Write-Host "=== 3mpwrApp Website Comprehensive Audit ===" -ForegroundColor Cyan
Write-Host "Starting audit of all markdown files..." -ForegroundColor Yellow

$results = @{
    TotalFiles = 0
    MissingTitle = @()
    MissingDescription = @()
    MissingFrenchTranslation = @()
    BrokenLinks = @()
    ImagesWithoutAlt = @()
    PagesWithoutCrossLinks = @()
    AccessibilityIssues = @()
}

# Get all markdown files
$allMarkdownFiles = Get-ChildItem -Path . -Filter "*.md" -Recurse -File | Where-Object { 
    $_.FullName -notmatch '\\node_modules\\' -and 
    $_.FullName -notmatch '\\_site\\' -and
    $_.FullName -notmatch '\\\.git\\'
}

$results.TotalFiles = $allMarkdownFiles.Count
Write-Host "Found $($results.TotalFiles) markdown files to audit" -ForegroundColor Green

# Phase 1: SEO Metadata Audit
Write-Host "`n[Phase 1/6] Auditing SEO Metadata..." -ForegroundColor Cyan
$counter = 0
foreach ($file in $allMarkdownFiles) {
    $counter++
    if ($counter % 100 -eq 0) {
        Write-Host "  Progress: $counter / $($results.TotalFiles)" -ForegroundColor Gray
    }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Check for frontmatter
    if ($content -match '^---\s*\n(.*?)\n---') {
        $frontmatter = $matches[1]
        
        # Check title
        if ($frontmatter -notmatch 'title:\s*[^\n]+') {
            $results.MissingTitle += $file.FullName.Replace((Get-Location).Path + '\', '')
        }
        
        # Check description
        if ($frontmatter -notmatch 'description:\s*[^\n]+') {
            $results.MissingDescription += $file.FullName.Replace((Get-Location).Path + '\', '')
        }
    } else {
        # No frontmatter at all
        $results.MissingTitle += $file.FullName.Replace((Get-Location).Path + '\', '')
        $results.MissingDescription += $file.FullName.Replace((Get-Location).Path + '\', '')
    }
}

# Phase 2: French Translation Coverage
Write-Host "`n[Phase 2/6] Auditing French Translation Coverage..." -ForegroundColor Cyan
$englishFiles = $allMarkdownFiles | Where-Object { $_.FullName -notmatch '\\fr\\' -and $_.FullName -notmatch '\\ar\\' -and $_.FullName -notmatch '\\es\\' -and $_.FullName -notmatch '\\zh\\' }
foreach ($file in $englishFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    $frenchPath = "fr\$relativePath"
    
    if (-not (Test-Path $frenchPath)) {
        $results.MissingFrenchTranslation += $relativePath
    }
}

# Phase 3: Image Alt Text Audit
Write-Host "`n[Phase 3/6] Auditing Image Alt Text..." -ForegroundColor Cyan
$counter = 0
foreach ($file in $allMarkdownFiles) {
    $counter++
    if ($counter % 100 -eq 0) {
        Write-Host "  Progress: $counter / $($results.TotalFiles)" -ForegroundColor Gray
    }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Find all images in markdown: ![alt](src) and <img>
    $markdownImages = [regex]::Matches($content, '!\[([^\]]*)\]\([^\)]+\)')
    $htmlImages = [regex]::Matches($content, '<img[^>]+>')
    
    # Check markdown images for empty alt text
    foreach ($match in $markdownImages) {
        $altText = $match.Groups[1].Value
        if ([string]::IsNullOrWhiteSpace($altText)) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
            if ($relativePath -notin $results.ImagesWithoutAlt) {
                $results.ImagesWithoutAlt += $relativePath
            }
            break
        }
    }
    
    # Check HTML images for missing alt attribute
    foreach ($match in $htmlImages) {
        if ($match.Value -notmatch 'alt=') {
            $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
            if ($relativePath -notin $results.ImagesWithoutAlt) {
                $results.ImagesWithoutAlt += $relativePath
            }
            break
        }
    }
}

# Phase 4: Internal Link Validation
Write-Host "`n[Phase 4/6] Validating Internal Links..." -ForegroundColor Cyan
$counter = 0
foreach ($file in $allMarkdownFiles | Select-Object -First 500) {  # Sample first 500 for speed
    $counter++
    if ($counter % 50 -eq 0) {
        Write-Host "  Progress: $counter / 500 (sampling)" -ForegroundColor Gray
    }
    
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Find all markdown links: [text](url)
    $links = [regex]::Matches($content, '\[([^\]]+)\]\(([^\)]+)\)')
    
    foreach ($match in $links) {
        $url = $match.Groups[2].Value
        
        # Skip external links and anchors
        if ($url -match '^https?://' -or $url -match '^#') { continue }
        
        # Resolve relative path
        $fileDir = Split-Path $file.FullName -Parent
        $targetPath = Join-Path $fileDir $url.Split('#')[0]
        
        if (-not (Test-Path $targetPath)) {
            $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
            if ($relativePath -notin $results.BrokenLinks) {
                $results.BrokenLinks += "$relativePath -> $url"
            }
        }
    }
}

# Phase 5 & 6: Accessibility and Cross-links (Quick scan)
Write-Host "`n[Phase 5/6] Checking for Cross-link Opportunities..." -ForegroundColor Cyan
Write-Host "  (Scanning critical pages)" -ForegroundColor Gray

$criticalPages = @('index.md', 'about.md', 'demo\index.md', 'features\index.md', 'faq.md')
foreach ($pagePath in $criticalPages) {
    if (Test-Path $pagePath) {
        $content = Get-Content $pagePath -Raw
        $linkCount = ([regex]::Matches($content, '\[([^\]]+)\]\(([^\)]+)\)')).Count
        
        if ($linkCount -lt 5) {
            $results.PagesWithoutCrossLinks += $pagePath
        }
    }
}

Write-Host "`n[Phase 6/6] Accessibility Quick Scan..." -ForegroundColor Cyan
Write-Host "  (Checking for common issues)" -ForegroundColor Gray

# Check homepage for accessibility toolbar
if (Test-Path "index.md") {
    $homepageContent = Get-Content "index.md" -Raw
    if ($homepageContent -notmatch 'accessibility-toolbar') {
        $results.AccessibilityIssues += "Homepage missing accessibility toolbar include"
    }
}

# Generate Report
Write-Host "`n`n=== AUDIT RESULTS ===" -ForegroundColor Cyan

Write-Host "`nTotal Files Scanned: $($results.TotalFiles)" -ForegroundColor White

Write-Host "`n[SEO Metadata]" -ForegroundColor Yellow
Write-Host "  Missing Title: $($results.MissingTitle.Count) files" -ForegroundColor $(if ($results.MissingTitle.Count -gt 100) { "Red" } else { "Yellow" })
Write-Host "  Missing Description: $($results.MissingDescription.Count) files" -ForegroundColor $(if ($results.MissingDescription.Count -gt 100) { "Red" } else { "Yellow" })

Write-Host "`n[Localization]" -ForegroundColor Yellow
Write-Host "  Missing French Translation: $($results.MissingFrenchTranslation.Count) files" -ForegroundColor $(if ($results.MissingFrenchTranslation.Count -gt 2500) { "Red" } else { "Yellow" })
$frenchCoverage = [math]::Round((($results.TotalFiles - $results.MissingFrenchTranslation.Count) / $results.TotalFiles) * 100, 2)
Write-Host "  French Coverage: $frenchCoverage%" -ForegroundColor $(if ($frenchCoverage -lt 5) { "Red" } elseif ($frenchCoverage -lt 50) { "Yellow" } else { "Green" })

Write-Host "`n[Accessibility]" -ForegroundColor Yellow
Write-Host "  Images Without Alt Text: $($results.ImagesWithoutAlt.Count) pages" -ForegroundColor $(if ($results.ImagesWithoutAlt.Count -gt 50) { "Red" } else { "Yellow" })
Write-Host "  Other Issues: $($results.AccessibilityIssues.Count)" -ForegroundColor Gray

Write-Host "`n[Content Quality]" -ForegroundColor Yellow
Write-Host "  Broken Internal Links: $($results.BrokenLinks.Count) links (sampled)" -ForegroundColor $(if ($results.BrokenLinks.Count -gt 20) { "Red" } else { "Yellow" })
Write-Host "  Pages Needing Cross-links: $($results.PagesWithoutCrossLinks.Count)" -ForegroundColor Gray

# Export detailed results to JSON
$results | ConvertTo-Json -Depth 10 | Out-File "audit-results.json" -Encoding UTF8
Write-Host "`n✓ Detailed results exported to: audit-results.json" -ForegroundColor Green

# Export critical issues to CSV for easy review
$criticalIssues = @()

# Top 20 pages missing SEO
$results.MissingTitle | Select-Object -First 20 | ForEach-Object {
    $criticalIssues += [PSCustomObject]@{
        Type = "Missing Title"
        Priority = "High"
        File = $_
        Recommendation = "Add 'title:' to frontmatter"
    }
}

# Top 20 missing French translations (prioritize critical pages)
$criticalFiles = @('index.md', 'about.md', 'demo/index.md', 'features/index.md', 'faq.md', 'privacy/index.md', 'legal/index.md', 'contact.md', 'app-waitlist.md', 'accessibility.md', 'security.md')
$results.MissingFrenchTranslation | Where-Object { $_ -in $criticalFiles } | ForEach-Object {
    $criticalIssues += [PSCustomObject]@{
        Type = "Missing French Translation"
        Priority = "Critical"
        File = $_
        Recommendation = "Create fr/$_"
    }
}

# All broken links
$results.BrokenLinks | ForEach-Object {
    $criticalIssues += [PSCustomObject]@{
        Type = "Broken Link"
        Priority = "High"
        File = $_
        Recommendation = "Fix or remove link"
    }
}

$criticalIssues | Export-Csv "critical-issues.csv" -NoTypeInformation -Encoding UTF8
Write-Host "✓ Critical issues exported to: critical-issues.csv" -ForegroundColor Green

Write-Host "`n=== AUDIT COMPLETE ===" -ForegroundColor Cyan
Write-Host "Next steps: Review audit-results.json and critical-issues.csv" -ForegroundColor White
