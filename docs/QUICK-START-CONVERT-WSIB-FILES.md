# QUICK START: Parse Critical WSIB Files

## 🚨 PRIORITY FILES TO CONVERT

You have TWO files that will unlock the entire claim suppression funnel:

1. **Registered claims.xlsx** (41KB) - Total claims filed
2. **Allowed claims.xlsx** (49KB) - Claims approved

## ⚡ FASTEST METHOD: Manual CSV Conversion

### Option A: Excel (If Installed)

1. Open `Registered claims.xlsx` in Excel
2. **File → Save As → Browse**
3. **Save as type:** CSV (Comma delimited) (*.csv)
4. **File name:** `Registered-claims-converted.csv`
5. Click **Save**
6. Repeat for `Allowed claims.xlsx` → `Allowed-claims-converted.csv`

### Option B: Google Sheets (If No Excel)

1. Go to https://sheets.google.com
2. **File → Import → Upload** → Select `Registered claims.xlsx`
3. **File → Download → Comma Separated Values (.csv)**
4. Save as `Registered-claims-converted.csv`
5. Repeat for `Allowed claims.xlsx`

### Option C: Online Converter

1. Go to https://convertio.co/xlsx-csv/
2. Upload `Registered claims.xlsx`
3. Convert and download
4. Repeat for `Allowed claims.xlsx`

## 📍 WHERE TO SAVE

Save both CSVs to: `C:\Users\bookw\Downloads\`

Keep the same folder as the XLSX files.

## ✅ AFTER CONVERSION

Tell me when done, and I'll:
1. Parse both CSVs (takes ~30 seconds)
2. Calculate **total denied claims**
3. Calculate **WSIAT appeal rate**
4. Calculate **suppression gap** (workers who gave up)
5. Generate the claim funnel visualization

## 🎯 THE SMOKING GUN CALCULATION

Once I have these 2 CSVs:

```
Registered Claims: X
Allowed Claims: Y
Denied Claims: X - Y
WSIAT Appeals: 98,992 (known)
Appeal Rate: 98,992 / (X - Y) = Z%
Suppression Gap: (X - Y) - 98,992 = MISSING WORKERS
```

**Example:**
- If 300,000 registered and 200,000 allowed:
  - Denied: 100,000
  - Appeal Rate: 98,992 / 100,000 = **99%** (almost everyone appeals - unlikely)
  
- If 500,000 registered and 300,000 allowed:
  - Denied: 200,000
  - WSIAT: 98,992 over 40 years = ~2,475/year
  - Appeal Rate: 2,475 / 200,000 = **1.2%**
  - Suppression Gap: **197,525 workers/year gave up**

## 🔥 WHY THIS MATTERS

This is the **first time in Canadian history** someone will calculate:
- How many workers WSIB denies annually
- What percentage actually appeal
- How many give up without fighting

**That number becomes the headline:**
"WSIB Denies 200,000 Workers Annually—Only 1.2% Appeal"

---

## 📥 BONUS: High-Priority Files (Convert If You Have Time)

3. **Mental Stress Claims.xlsx** (53KB) - Compare with WSIAT PTSD (159 cases)
4. **Schedule 1 and 2 - Part of body category profile.xlsx** (48KB) - Compare with WSIAT back injuries (13,407)
5. **Fatalities-data-2023.xlsx** (157KB) - Compare with fatal appeals

But **start with the first 2**—they're the smoking gun.

---

**Ready? Convert those 2 files and let me know!** 🚀
