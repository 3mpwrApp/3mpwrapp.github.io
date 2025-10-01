Param(
  [string]$InputPath = "..\..\3mpowr App social media graphics\empowrapp-logo.png"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

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

Add-Type -AssemblyName System.Drawing

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

# 1) App icon (brand-logo.png) 1024x1024, white background
$icon = New-Canvas -Width 1024 -Height 1024 -BgColor ([System.Drawing.Color]::White)
Draw-Contain -Canvas $icon -Source $src -Padding 60
Save-Png -Image $icon -Path (Join-Path $assetsDir 'brand-logo.png')
$icon.Dispose()

# 2) Favicon 48x48, white background
$fav = New-Canvas -Width 48 -Height 48 -BgColor ([System.Drawing.Color]::White)
Draw-Contain -Canvas $fav -Source $src -Padding 2
Save-Png -Image $fav -Path (Join-Path $assetsDir 'favicon.png')
$fav.Dispose()

# 3) Android adaptive foreground: transparent canvas, symbol only (crop top ~72%), centered within 1024
$cropped = Crop-TopPortion -Source $src -TopPercent 0.72
$adaptive = New-Canvas -Width 1024 -Height 1024 -BgColor $null
Draw-Contain -Canvas $adaptive -Source $cropped -Padding 100
Save-Png -Image $adaptive -Path (Join-Path $assetsDir 'brand-adaptive.png')
$adaptive.Dispose()
$cropped.Dispose()

$src.Dispose()

Write-Host "Generated:"
Write-Host (Join-Path $assetsDir 'brand-logo.png')
Write-Host (Join-Path $assetsDir 'favicon.png')
Write-Host (Join-Path $assetsDir 'brand-adaptive.png')
