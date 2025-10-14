# Download Dyslexia-Friendly Fonts
# Requires PowerShell 5.1+ (Windows) or PowerShell Core (cross-platform)

$ErrorActionPreference = "Stop"

Write-Host "=== 3mpwr App - Dyslexia Font Downloader ===" -ForegroundColor Cyan
Write-Host ""

# Determine project root (go up from scripts/ to root)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$FontsDir = Join-Path $ProjectRoot "assets\fonts"

Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray
Write-Host "Fonts directory: $FontsDir" -ForegroundColor Gray
Write-Host ""

# Ensure fonts directory exists
if (-not (Test-Path $FontsDir)) {
    Write-Host "Creating fonts directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $FontsDir -Force | Out-Null
}

# =============================================================================
# OpenDyslexic
# =============================================================================

Write-Host "Downloading OpenDyslexic..." -ForegroundColor Green

$OpenDyslexicUrl = "https://github.com/antijingoist/opendyslexic/releases/download/v2.0.0/opendyslexic-0.91.12-20190516.zip"
$OpenDyslexicZip = Join-Path $FontsDir "opendyslexic.zip"
$OpenDyslexicTemp = Join-Path $FontsDir "temp_opendyslexic"

try {
    # Download
    Write-Host "  Downloading from GitHub..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $OpenDyslexicUrl -OutFile $OpenDyslexicZip -UseBasicParsing
    
    # Extract
    Write-Host "  Extracting archive..." -ForegroundColor Gray
    Expand-Archive -Path $OpenDyslexicZip -DestinationPath $OpenDyslexicTemp -Force
    
    # Find the Regular variant (could be in different subdirectories)
    $RegularFile = Get-ChildItem -Path $OpenDyslexicTemp -Recurse -Filter "*OpenDyslexic-Regular.ttf" | Select-Object -First 1
    
    if ($RegularFile) {
        $DestFile = Join-Path $FontsDir "OpenDyslexic-Regular.ttf"
        Copy-Item $RegularFile.FullName -Destination $DestFile -Force
        $SizeKB = [math]::Round($RegularFile.Length / 1024)
        Write-Host "  OK OpenDyslexic-Regular.ttf installed ($SizeKB KB)" -ForegroundColor Green
    } else {
        Write-Host "  ERROR Could not find OpenDyslexic-Regular.ttf in archive" -ForegroundColor Red
    }
    
    # Cleanup
    Remove-Item -Path $OpenDyslexicZip -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $OpenDyslexicTemp -Recurse -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "  ERROR downloading OpenDyslexic: $_" -ForegroundColor Red
}

Write-Host ""

# =============================================================================
# Lexend
# =============================================================================

Write-Host "Downloading Lexend..." -ForegroundColor Green

# Note: Google Fonts doesn't provide direct ZIP links easily, so we use a fallback
# Option 1: Use a known direct link if available
# Option 2: Instruct manual download

Write-Host "  Lexend requires manual download:" -ForegroundColor Yellow
Write-Host "  1. Visit: https://fonts.google.com/specimen/Lexend" -ForegroundColor Yellow
Write-Host "  2. Click 'Download family' button" -ForegroundColor Yellow
Write-Host "  3. Extract the ZIP file" -ForegroundColor Yellow
Write-Host "  4. Copy 'Lexend-Regular.ttf' to: $FontsDir" -ForegroundColor Yellow

# Alternative: Try common CDN
$LexendUrl = "https://github.com/googlefonts/lexend/raw/main/fonts/ttf/Lexend-Regular.ttf"
$LexendFile = Join-Path $FontsDir "Lexend-Regular.ttf"

try {
    Write-Host "  Attempting direct download from GitHub..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $LexendUrl -OutFile $LexendFile -UseBasicParsing
    
    if (Test-Path $LexendFile) {
        $FileSize = (Get-Item $LexendFile).Length
        $SizeKB = [math]::Round($FileSize / 1024)
        Write-Host "  OK Lexend-Regular.ttf installed ($SizeKB KB)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ERROR Automatic download failed. Please download manually." -ForegroundColor Yellow
}

Write-Host ""

# =============================================================================
# Verification
# =============================================================================

Write-Host "=== Verification ===" -ForegroundColor Cyan
Write-Host ""

$OpenDyslexicPath = Join-Path $FontsDir "OpenDyslexic-Regular.ttf"
$LexendPath = Join-Path $FontsDir "Lexend-Regular.ttf"

if (Test-Path $OpenDyslexicPath) {
    $Size = [math]::Round((Get-Item $OpenDyslexicPath).Length / 1024)
    $Hash = (Get-FileHash -Path $OpenDyslexicPath -Algorithm SHA256).Hash.Substring(0, 16)
    Write-Host "OK OpenDyslexic-Regular.ttf: ${Size} KB (SHA-256: ${Hash}...)" -ForegroundColor Green
} else {
    Write-Host "NOT FOUND OpenDyslexic-Regular.ttf: NOT FOUND" -ForegroundColor Red
}

if (Test-Path $LexendPath) {
    $Size = [math]::Round((Get-Item $LexendPath).Length / 1024)
    $Hash = (Get-FileHash -Path $LexendPath -Algorithm SHA256).Hash.Substring(0, 16)
    Write-Host "OK Lexend-Regular.ttf: ${Size} KB (SHA-256: ${Hash}...)" -ForegroundColor Green
} else {
    Write-Host "NOT FOUND Lexend-Regular.ttf: NOT FOUND" -ForegroundColor Red
}

Write-Host ""

# =============================================================================
# Next Steps
# =============================================================================

Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Clear Metro cache: npx expo start --clear" -ForegroundColor Gray
Write-Host "2. Start the app: npx expo start" -ForegroundColor Gray
Write-Host "3. Test fonts in Settings → Dyslexia Support" -ForegroundColor Gray
Write-Host ""
Write-Host "For detailed instructions, see docs/DYSLEXIA_FONT_INSTALLATION.md" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Attribution ===" -ForegroundColor Cyan
Write-Host "OpenDyslexic: CC BY 3.0 - https://opendyslexic.org/" -ForegroundColor Gray
Write-Host "Lexend: SIL OFL 1.1 - https://www.lexend.com/" -ForegroundColor Gray
Write-Host ""
