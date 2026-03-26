# 📸 Website Visual Refresh Guide
**Date**: March 17, 2026  
**Status**: Ready for Execution

---

## 📊 Inventory Summary

| Metric | Count |
|--------|-------|
| **Old Screenshots** | 112 files |
| **New Screenshots** | 180 files |
| **Net Increase** | +68 files (+61%) |
| **Categories** | 11 → 12 (added AIAssistanttab) |

---

## 🗂️ Category Mapping

### Old → New Folder Mapping

| Old Category | Old Count | New Category | New Count | Notes |
|--------------|-----------|--------------|-----------|-------|
| advocacy | 11 | advocacy | 10 | Similar coverage |
| campaigns | 2 | campaigns | 2 | Same coverage |
| community | 5 | community | 5 | Same coverage |
| events | 6 | events | 6 | Same coverage |
| home | 11 | home | 8 | Slightly fewer |
| profile | 8 | PROFILE-AVATAR | 10 | **Renamed folder** |
| research | 5 | research | 5 | Same coverage |
| resources | 12 | resources | 39 | **Major expansion** (+27) |
| settings | 31 | settings | 48 | **Major expansion** (+17) |
| **termsgate** | 12 | **AppUpon1stLaunch3mpwrApp** | 37 | **Replaced + expanded** (+25) |
| wellness | 9 | wellness | 5 | Fewer files |
| *(new)* | — | **AIAssistanttab** | 5 | **New category** |
| **TOTAL** | **112** | **TOTAL** | **180** | **+68 files** |

---

## 📁 Folder Structure

### Website Destination (where files will go):
```
d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main\
  └── assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop\
      ├── advocacy\
      ├── campaigns\
      ├── community\
      ├── events\
      ├── home\
      ├── profile\           ← Will contain PROFILE-AVATAR screenshots
      ├── research\
      ├── resources\
      ├── settings\
      ├── termsgate\         ← Will contain AppUpon1stLaunch3mpwrApp screenshots
      ├── wellness\
      └── ai-assistant\      ← NEW: Will contain AIAssistanttab screenshots
```

### Your Source Folder (where files are now):
```
C:\Users\bookw\OneDrive\Desktop\3mpowrApp\Empowr App social media graphics\
  └── 1-Official3mpwrAppScreenshots\laptop\
      ├── advocacy\
      ├── AIAssistanttab\              ← NEW category
      ├── AppUpon1stLaunch3mpwrApp\    ← Replaces termsgate
      ├── campaigns\
      ├── community\
      ├── events\
      ├── home\
      ├── PROFILE-AVATAR\              ← Replaces profile
      ├── research\
      ├── resources\
      ├── settings\
      └── wellness\
```

---

## 🔄 Execution Plan

### Step 1: Backup Current Screenshots (OPTIONAL but recommended)
```powershell
# Run this from the website folder
cd "d:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"

# Create backup
Compress-Archive -Path "assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop" `
                 -DestinationPath "assets\images\screenshots\OLD_BACKUP_$(Get-Date -Format 'yyyy-MM-dd').zip"
```

### Step 2: Delete Old Screenshots
```powershell
# I will provide a deletion script: delete-old-screenshots.ps1
# You can review it and run it when ready
```

### Step 3: Copy New Screenshots
```powershell
# I will provide a copy script: copy-new-screenshots.ps1
# This will handle the folder renaming automatically:
#   - AIAssistanttab → ai-assistant
#   - AppUpon1stLaunch3mpwrApp → termsgate
#   - PROFILE-AVATAR → profile
```

### Step 4: Verify Files Copied
```powershell
# Check that all 180 files were copied
$count = (Get-ChildItem "assets\images\screenshots\1-Official3mpwrAppScreenshots\laptop" -Recurse -File).Count
Write-Host "Total files copied: $count (should be 180)"
```

---

## 🎨 Naming Convention

All images follow the pattern: `{category}{description}3mpwrapp.png`

**Examples:**
- `home13mpwrapp.png` — Home Dashboard #1
- `advocacygen2advocacytab3mpwrapp.png` — Advocacy tab generation 2
- `wellnesstabunifiedhealthtracker13mpwrapp.png` — Wellness Health Tracker #1
- `settingscomplexitymode13mpwrapp.png` — Settings Complexity Mode #1
- `termsgate\1welcometo3mpwrapp.png` — Welcome screen

---

## ✅ Next Steps After File Copy

1. **Review app-tour.md** — I will update all image references to match new filenames
2. **Add alt text** — Every image will get descriptive, SEO-optimized alt text
3. **Add deep links** — Link images to specific user guide sections
4. **Generate social posts** — Create 180 × 3 platforms = 540 social media posts
5. **SEO optimization** — Verify keywords, meta descriptions, file sizes
6. **Test website** — Verify lightbox, lazy loading, mobile responsive, dark mode

---

## 📝 Notes

- **Folder renaming handled automatically** by copy script (no manual work needed)
- **All PNG files** — consistent format
- **Lazy loading preserved** — existing `<img>` tags will keep `loading="lazy"` attribute
- **Lightbox functionality preserved** — existing JavaScript will continue to work
- **Dark mode compatible** — existing CSS supports both themes
- **Accessibility-first** — all images will have descriptive alt text

---

## 🚨 Important

**Do NOT manually copy files** — use the provided script to ensure correct folder mapping and structure. The script handles:
- Folder renaming (AIAssistanttab → ai-assistant, etc.)
- Nested folder structures (termsgate\termsgate\, settings\settings\)
- File validation (ensures all 180 files copied successfully)

---

**Ready to proceed?** Let me know when you want me to create the deletion and copy scripts!
