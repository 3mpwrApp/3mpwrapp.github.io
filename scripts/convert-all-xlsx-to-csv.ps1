#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Bulk convert XLSX files to CSV for data analysis
    
.DESCRIPTION
    Converts all XLSX files in Downloads folder to CSV format
    Handles Safety Check, Tribunals Ontario, and other data files
    
.NOTES
    Total files: 100+ XLSX files (Safety Check + HRTO + ONSBT)
    Output: CSV files in same directory with "-converted" suffix
#>

param(
    [string]$SourceFolder = "C:\Users\bookw\Downloads",
    [string]$OutputFolder = "C:\Users\bookw\Downloads\converted-csv",
    [switch]$SkipExisting = $true
)

Write-Host "BULK XLSX TO CSV CONVERTER" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Create output folder if it doesn't exist
if (-not (Test-Path $OutputFolder)) {
    New-Item -ItemType Directory -Path $OutputFolder -Force | Out-Null
    Write-Host "Created output folder: $OutputFolder" -ForegroundColor Green
    Write-Host ""
}

# Get all XLSX files
$xlsxFiles = Get-ChildItem -Path $SourceFolder -Filter "*.xlsx" | 
    Where-Object { $_.Name -notlike "*~*" -and $_.Name -notlike "*tmp*" } |
    Sort-Object Name

Write-Host "Found $($xlsxFiles.Count) XLSX files to convert" -ForegroundColor Yellow
Write-Host ""

if ($xlsxFiles.Count -eq 0) {
    Write-Host "No XLSX files found in $SourceFolder" -ForegroundColor Red
    exit 1
}

# Counter for progress
$converted = 0
$skipped = 0
$failed = 0

# Try to load ImportExcel module first (fastest method)
$useImportExcel = $false
try {
    Import-Module ImportExcel -ErrorAction Stop
    $useImportExcel = $true
    Write-Host "Using ImportExcel module (fast method)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "ImportExcel module not available, using Excel application method" -ForegroundColor Yellow
    Write-Host ""
}

foreach ($file in $xlsxFiles) {
    $outputFileName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + ".csv"
    $outputPath = Join-Path $OutputFolder $outputFileName
    
    # Skip if already converted
    if ($SkipExisting -and (Test-Path $outputPath)) {
        Write-Host "Skipping (already exists): $($file.Name)" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    Write-Host "Converting: $($file.Name)" -ForegroundColor Cyan -NoNewline
    
    try {
        if ($useImportExcel) {
            # Method 1: ImportExcel module (fastest, no Excel needed)
            Import-Excel -Path $file.FullName | Export-Csv -Path $outputPath -NoTypeInformation -Encoding UTF8
        } else {
            # Method 2: Excel Application (requires Excel installed)
            $excel = New-Object -ComObject Excel.Application
            $excel.Visible = $false
            $excel.DisplayAlerts = $false
            
            $workbook = $excel.Workbooks.Open($file.FullName)
            $worksheet = $workbook.Worksheets.Item(1)
            
            # Save as CSV
            $worksheet.SaveAs($outputPath, 6) # 6 = CSV format
            
            $workbook.Close($false)
            $excel.Quit()
            
            # Clean up COM objects
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($worksheet) | Out-Null
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($workbook) | Out-Null
            [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
            [System.GC]::Collect()
            [System.GC]::WaitForPendingFinalizers()
        }
        
        Write-Host " OK" -ForegroundColor Green
        $converted++
        
    } catch {
        Write-Host " FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CONVERSION COMPLETE" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Converted: $converted files" -ForegroundColor Green
Write-Host "Skipped:   $skipped files" -ForegroundColor Gray
Write-Host "Failed:    $failed files" -ForegroundColor Red
Write-Host ""
Write-Host "Output folder: $OutputFolder" -ForegroundColor Cyan
Write-Host ""

if ($converted -gt 0) {
    Write-Host "Next step: Run parse-wsib-all-data.mjs to analyze CSV files" -ForegroundColor Yellow
}
