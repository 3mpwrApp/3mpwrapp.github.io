# Automated SEO Metadata Addition Script
# Adds title and description to markdown frontmatter

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$Title,
    
    [Parameter(Mandatory=$false)]
    [string]$Description,
    
    [switch]$DryRun = $false
)

function Get-PageTitle {
    param([string]$content, [string]$filename)
    
    # Try to find first H1
    if ($content -match '(?m)^#\s+(.+)$') {
        return $Matches[1].Trim()
    }
    
    # Use filename
    $name = [System.IO.Path]::GetFileNameWithoutExtension($filename)
    return ($name -replace '-', ' ' -replace '_', ' ').Split() | ForEach-Object { 
        $_.Substring(0,1).ToUpper() + $_.Substring(1) 
    } -join ' '
}

function Get-PageDescription {
    param([string]$content, [string]$title)
    
    # Try to find first paragraph after title
    if ($content -match '(?s)^#[^\n]+\n+([^\n]+)') {
        $desc = $Matches[1].Trim() -replace '\*\*', '' -replace '\[([^\]]+)\]\([^\)]+\)', '$1'
        if ($desc.Length -le 160) {
            return $desc
        }
        return $desc.Substring(0, 157) + "..."
    }
    
    return "Learn more about $title on 3mpwrApp - free tools and resources for injured workers and persons with disabilities across Canada."
}

if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

$content = Get-Content $FilePath -Raw
$originalContent = $content

# Check if already has frontmatter
$hasFrontmatter = $content -match '(?s)^---\s*\n'

if (-not $hasFrontmatter) {
    Write-Host "❌ No frontmatter found in: $FilePath" -ForegroundColor Red
    Write-Host "   This file needs manual review" -ForegroundColor Yellow
    exit 1
}

# Parse existing frontmatter
if ($content -match '(?s)^---\s*\n(.*?)\n---') {
    $frontmatter = $Matches[1]
    $bodyContent = $content -replace '(?s)^---\s*\n.*?\n---\s*\n', ''
    
    $hasTitle = $frontmatter -match '(?m)^title:'
    $hasDescription = $frontmatter -match '(?m)^description:'
    
    if ($hasTitle -and $hasDescription) {
        Write-Host "✅ Already has SEO metadata: $FilePath" -ForegroundColor Green
        exit 0
    }
    
    # Generate if not provided
    if (-not $Title) {
        $Title = Get-PageTitle -content $bodyContent -filename (Split-Path -Leaf $FilePath)
    }
    
    if (-not $Description) {
        $Description = Get-PageDescription -content $bodyContent -title $Title
    }
    
    # Add missing fields
    $newFrontmatter = $frontmatter
    
    if (-not $hasTitle) {
        # Add after layout if exists, otherwise at top
        if ($newFrontmatter -match '(?m)^layout:') {
            $newFrontmatter = $newFrontmatter -replace '(?m)(^layout:[^\n]+\n)', "`$1title: $Title`n"
        } else {
            $newFrontmatter = "title: $Title`n" + $newFrontmatter
        }
        Write-Host "➕ Adding title: $Title" -ForegroundColor Cyan
    }
    
    if (-not $hasDescription) {
        # Add after title
        $newFrontmatter = $newFrontmatter -replace '(?m)(^title:[^\n]+\n)', "`$1description: $Description`n"
        Write-Host "➕ Adding description: $Description" -ForegroundColor Cyan
    }
    
    $newContent = "---`n$newFrontmatter`n---`n$bodyContent"
    
    if ($DryRun) {
        Write-Host "🔍 DRY RUN - Would update: $FilePath" -ForegroundColor Yellow
        Write-Host "New frontmatter:" -ForegroundColor Gray
        Write-Host $newFrontmatter -ForegroundColor Gray
    } else {
        $newContent | Out-File $FilePath -Encoding UTF8 -NoNewline
        Write-Host "✅ Updated: $FilePath" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Could not parse frontmatter: $FilePath" -ForegroundColor Red
    exit 1
}
