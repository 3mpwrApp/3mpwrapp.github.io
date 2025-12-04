# Dyslexia Fonts Download Script
# Run this script to download the required dyslexia-friendly fonts
# Usage: .\scripts\download-fonts.ps1

$fontsDir = Join-Path $PSScriptRoot "..\assets\fonts"

Write-Host "Dyslexia Fonts Downloader" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Create fonts directory if it doesn't exist
if (!(Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force | Out-Null
}

# Function to download font
function Get-Font {
    param (
        [string]$Url,
        [string]$FileName,
        [string]$DisplayName
    )
    
    $targetPath = Join-Path $fontsDir $FileName
    
    if (Test-Path $targetPath) {
        Write-Host "[SKIP] $DisplayName already exists" -ForegroundColor Yellow
        return $true
    }
    
    Write-Host "[DOWNLOADING] $DisplayName..." -ForegroundColor White
    
    try {
        # Try multiple methods
        try {
            Invoke-WebRequest -Uri $Url -OutFile $targetPath -UseBasicParsing -TimeoutSec 30
        } catch {
            # Fallback to .NET WebClient
            $webClient = New-Object System.Net.WebClient
            $webClient.Headers.Add("User-Agent", "Mozilla/5.0")
            $webClient.DownloadFile($Url, $targetPath)
        }
        
        if (Test-Path $targetPath) {
            $size = (Get-Item $targetPath).Length
            if ($size -gt 1000) {
                Write-Host "[SUCCESS] $DisplayName downloaded ($([math]::Round($size/1024, 1)) KB)" -ForegroundColor Green
                
                # Remove placeholder if exists
                $placeholder = "$targetPath.PLACEHOLDER"
                if (Test-Path $placeholder) {
                    Remove-Item $placeholder -Force
                    Write-Host "  Removed placeholder file" -ForegroundColor DarkGray
                }
                return $true
            } else {
                Remove-Item $targetPath -Force
                Write-Host "[FAILED] $DisplayName - file too small, may be error page" -ForegroundColor Red
                return $false
            }
        }
    } catch {
        Write-Host "[FAILED] $DisplayName - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $false
}

# OpenDyslexic URLs (try multiple sources)
$openDyslexicUrls = @(
    "https://github.com/antijingoist/opendyslexic/raw/master/compiled/OpenDyslexic-Regular.otf",
    "https://raw.githubusercontent.com/antijingoist/opendyslexic/master/compiled/OpenDyslexic-Regular.otf"
)

# Lexend URLs
$lexendUrls = @(
    "https://github.com/googlefonts/lexend/raw/main/fonts/ttf/Lexend-Regular.ttf",
    "https://raw.githubusercontent.com/googlefonts/lexend/main/fonts/ttf/Lexend-Regular.ttf"
)

Write-Host ""
Write-Host "Downloading OpenDyslexic..." -ForegroundColor Cyan

$openDyslexicSuccess = $false
foreach ($url in $openDyslexicUrls) {
    if (Get-Font -Url $url -FileName "OpenDyslexic-Regular.ttf" -DisplayName "OpenDyslexic") {
        $openDyslexicSuccess = $true
        break
    }
}

Write-Host ""
Write-Host "Downloading Lexend..." -ForegroundColor Cyan

$lexendSuccess = $false
foreach ($url in $lexendUrls) {
    if (Get-Font -Url $url -FileName "Lexend-Regular.ttf" -DisplayName "Lexend") {
        $lexendSuccess = $true
        break
    }
}

Write-Host ""
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan

if ($openDyslexicSuccess) {
    Write-Host "  OpenDyslexic: OK" -ForegroundColor Green
} else {
    Write-Host "  OpenDyslexic: FAILED - Download manually from https://opendyslexic.org/" -ForegroundColor Red
}

if ($lexendSuccess) {
    Write-Host "  Lexend: OK" -ForegroundColor Green
} else {
    Write-Host "  Lexend: FAILED - Download manually from https://fonts.google.com/specimen/Lexend" -ForegroundColor Red
}

Write-Host ""

if ($openDyslexicSuccess -and $lexendSuccess) {
    Write-Host "All fonts downloaded successfully!" -ForegroundColor Green
    Write-Host "Run 'npm run metro:clear' to refresh the Metro bundler." -ForegroundColor Yellow
} else {
    Write-Host "Some fonts failed to download. Manual download required:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. OpenDyslexic:" -ForegroundColor White
    Write-Host "   - Visit: https://opendyslexic.org/" -ForegroundColor Gray
    Write-Host "   - Or: https://github.com/antijingoist/opendyslexic/tree/master/compiled" -ForegroundColor Gray
    Write-Host "   - Download OpenDyslexic-Regular.otf" -ForegroundColor Gray
    Write-Host "   - Save as: assets/fonts/OpenDyslexic-Regular.ttf" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Lexend:" -ForegroundColor White
    Write-Host "   - Visit: https://fonts.google.com/specimen/Lexend" -ForegroundColor Gray
    Write-Host "   - Click 'Download family'" -ForegroundColor Gray
    Write-Host "   - Extract Lexend-Regular.ttf" -ForegroundColor Gray
    Write-Host "   - Save as: assets/fonts/Lexend-Regular.ttf" -ForegroundColor Gray
}
