Param(
  [string]$InputPath = "..\..\3mpwrApp social media graphics\3mpwrApp-logo.png"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Brand asset generation constants
$ICON_SIZE = 1024
$ICON_PADDING = 60          # Padding for main app icon
$FAVICON_SIZE = 48
$FAVICON_PADDING = 2        # Minimal padding for favicon
$ADAPTIVE_SIZE = 1024
$ADAPTIVE_PADDING = 100     # Padding for Android adaptive icon
$CROP_TOP_PERCENT = 0.72    # Crop to top 72% for logo symbol

function New-Canvas {
  Param(
    [int]$Width,
    [int]$Height,
    [Nullable[System.Drawing.Color]]$BgColor = $null
  )
  $bmp = New-Object System.Drawing.Bitmap $Width, $Height
  if ($BgColor -ne $null) {
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $brush = New-Object System.Drawing.SolidBrush $BgColor
    $gfx.FillRectangle($brush, 0, 0, $Width, $Height)
    $brush.Dispose()
    $gfx.Dispose()
  }
  return $bmp
}

function Draw-Contain {
  Param(
    [System.Drawing.Bitmap]$Canvas,
    [System.Drawing.Image]$Source,
    [int]$Padding = 0
  )
  $gfx = [System.Drawing.Graphics]::FromImage($Canvas)
  $gfx.SmoothingMode = 'HighQuality'
  $gfx.InterpolationMode = 'HighQualityBicubic'
  $gfx.PixelOffsetMode = 'HighQuality'

  $cw = $Canvas.Width - 2*$Padding
  $ch = $Canvas.Height - 2*$Padding
  $sr = $Source.Width / $Source.Height
  $cr = $cw / $ch
  if ($sr -gt $cr) {
    $w = [int]$cw
    $h = [int]([double]$cw / $sr)
  } else {
    $h = [int]$ch
    $w = [int]([double]$ch * $sr)
  }
  $x = [int](($Canvas.Width - $w) / 2)
  $y = [int](($Canvas.Height - $h) / 2)
  $destRect = New-Object System.Drawing.Rectangle $x, $y, $w, $h
  $gfx.DrawImage($Source, $destRect)
  $gfx.Dispose()
}

function Crop-TopPortion {
  Param(
    [System.Drawing.Image]$Source,
    [double]$TopPercent = 0.72
  )
  $cropH = [int]([double]$Source.Height * $TopPercent)
  $rect = New-Object System.Drawing.Rectangle 0, 0, $Source.Width, $cropH
  $bmp = New-Object System.Drawing.Bitmap $rect.Width, $rect.Height
  $gfx = [System.Drawing.Graphics]::FromImage($bmp)
  $gfx.SmoothingMode = 'HighQuality'
  $gfx.InterpolationMode = 'HighQualityBicubic'
  $gfx.PixelOffsetMode = 'HighQuality'
  $srcRect = New-Object System.Drawing.Rectangle 0,0,$rect.Width,$rect.Height
  $destRect = New-Object System.Drawing.Rectangle 0,0,$rect.Width,$rect.Height
  $gfx.DrawImage($Source, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $gfx.Dispose()
  return $bmp
}

function Save-Png {
  Param(
    [System.Drawing.Bitmap]$Image,
    [string]$Path
  )
  $dir = Split-Path -Parent $Path
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $Image.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# Load System.Drawing assembly with error handling
try {
  Add-Type -AssemblyName System.Drawing
} catch {
  throw "Failed to load System.Drawing assembly. Ensure .NET Framework is installed."
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$assetsDir = Join-Path $repoRoot 'assets/images'
if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null }

if (!(Test-Path $InputPath)) {
  # Fallback to a repo-local master if provided
  $localMaster = Join-Path $assetsDir 'logo-master.png'
  if (Test-Path $localMaster) {
    $InputPath = $localMaster
  } else {
    throw "Master logo not found. Provide input via -InputPath or place assets/images/logo-master.png"
  }
}

$src = [System.Drawing.Image]::FromFile((Resolve-Path $InputPath))

# Validate source image dimensions
if ($src.Width -lt 512 -or $src.Height -lt 512) {
  $src.Dispose()
  throw "Source image must be at least 512x512 pixels. Current size: $($src.Width)x$($src.Height)"
}

# 1) App icon (brand-logo.png) - main 3mpwrApp icon with white background
$icon = New-Canvas -Width $ICON_SIZE -Height $ICON_SIZE -BgColor ([System.Drawing.Color]::White)
Draw-Contain -Canvas $icon -Source $src -Padding $ICON_PADDING
Save-Png -Image $icon -Path (Join-Path $assetsDir 'brand-logo.png')
$icon.Dispose()

# 2) Favicon - compact 3mpwrApp icon with white background
$fav = New-Canvas -Width $FAVICON_SIZE -Height $FAVICON_SIZE -BgColor ([System.Drawing.Color]::White)
Draw-Contain -Canvas $fav -Source $src -Padding $FAVICON_PADDING
Save-Png -Image $fav -Path (Join-Path $assetsDir 'favicon.png')
$fav.Dispose()

# 3) Android adaptive foreground: transparent canvas, 3mpwrApp symbol only (crop top for logo mark)
$cropped = Crop-TopPortion -Source $src -TopPercent $CROP_TOP_PERCENT
$adaptive = New-Canvas -Width $ADAPTIVE_SIZE -Height $ADAPTIVE_SIZE -BgColor $null
Draw-Contain -Canvas $adaptive -Source $cropped -Padding $ADAPTIVE_PADDING
Save-Png -Image $adaptive -Path (Join-Path $assetsDir 'brand-adaptive.png')
$adaptive.Dispose()
$cropped.Dispose()

$src.Dispose()

Write-Host "Generated:"
Write-Host (Join-Path $assetsDir 'brand-logo.png')
Write-Host (Join-Path $assetsDir 'favicon.png')
Write-Host (Join-Path $assetsDir 'brand-adaptive.png')
