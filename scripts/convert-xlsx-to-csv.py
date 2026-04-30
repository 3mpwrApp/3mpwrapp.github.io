#!/usr/bin/env python3
"""
Bulk XLSX to CSV Converter using pandas
Converts all XLSX files in Downloads folder to CSV format
"""

import os
import sys
from pathlib import Path
import glob

try:
    import pandas as pd
    print("✅ pandas library available")
except ImportError:
    print("❌ pandas not installed. Installing...")
    os.system(f"{sys.executable} -m pip install pandas openpyxl")
    import pandas as pd

# Configuration
SOURCE_FOLDER = r"C:\Users\bookw\Downloads"
OUTPUT_FOLDER = r"C:\Users\bookw\Downloads\converted-csv"

def main():
    print("\n🔄 BULK XLSX TO CSV CONVERTER")
    print("=" * 50)
    print()
    
    # Create output folder
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)
    print(f"📁 Output folder: {OUTPUT_FOLDER}\n")
    
    # Get all XLSX files
    xlsx_files = glob.glob(os.path.join(SOURCE_FOLDER, "*.xlsx"))
    xlsx_files = [f for f in xlsx_files if not os.path.basename(f).startswith('~')]
    
    print(f"📊 Found {len(xlsx_files)} XLSX files to convert\n")
    
    if not xlsx_files:
        print("❌ No XLSX files found")
        return
    
    converted = 0
    failed = 0
    
    for i, xlsx_file in enumerate(xlsx_files, 1):
        filename = os.path.basename(xlsx_file)
        output_name = os.path.splitext(filename)[0] + ".csv"
        output_path = os.path.join(OUTPUT_FOLDER, output_name)
        
        print(f"[{i}/{len(xlsx_files)}] Converting: {filename}", end=" ")
        
        try:
            # Read XLSX (first sheet only)
            df = pd.read_excel(xlsx_file, sheet_name=0, engine='openpyxl')
            
            # Save as CSV
            df.to_csv(output_path, index=False, encoding='utf-8')
            
            print("✅")
            converted += 1
            
        except Exception as e:
            print(f"❌ Error: {str(e)[:50]}")
            failed += 1
    
    print()
    print("=" * 50)
    print("📊 CONVERSION COMPLETE")
    print("=" * 50)
    print()
    print(f"✅ Converted: {converted} files")
    print(f"❌ Failed:    {failed} files")
    print()
    print(f"📁 CSV files saved to: {OUTPUT_FOLDER}")
    print()
    
    if converted > 0:
        print("🚀 Next: Parse CSV files with Node.js scripts")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Conversion cancelled by user")
    except Exception as e:
        print(f"\n\n❌ Fatal error: {e}")
        sys.exit(1)
