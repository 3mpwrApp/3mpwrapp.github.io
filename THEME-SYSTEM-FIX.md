# Theme System Comprehensive Fix
**Date**: October 28, 2025  
**Status**: 🔧 IN PROGRESS

---

## 🎯 Objective
Ensure the entire website works perfectly in **all 4 mode combinations**:
1. **Light Mode** (default/no attribute)
2. **Dark Mode** (`[data-theme="dark"]`)
3. **Light + High Contrast** (`[data-contrast="high"]`)
4. **Dark + High Contrast** (`[data-theme="dark"][data-contrast="high"]`)

---

## 🚨 Current Problems Identified

### Problem 1: CSS Variable Conflicts
- **professional-polish.css** defines `:root` with hardcoded **dark mode colors**
- **accessibility-tokens.css** defines proper light/dark mode system
- Result: professional-polish overrides accessibility-tokens

**Examples**:
```css
/* professional-polish.css ❌ WRONG */
:root {
  --bg-primary: #0b0d12;      /* Dark background */
  --text-primary: #e6e8ee;    /* Light text */
}
```

```css
/* accessibility-tokens.css ✅ CORRECT */
:root {
  --bg-primary: #ffffff;      /* Light background (default) */
  --text-primary: #000000;    /* Dark text */
}

[data-theme="dark"] {
  --bg-primary: #000000;      /* Dark background */
  --text-primary: #ffffff;    /* Light text */
}
```

### Problem 2: Light Mode Missing Styles
- Footer fixes use `!important` with dark mode colors (#e6e8ee, #a8c7ff)
- These colors work on dark backgrounds but **fail on white**
- No conditional styling for `[data-theme="light"]` or default state

### Problem 3: High Contrast Mode Overrides Fail
- professional-polish.css uses `!important` on buttons/footer
- accessibility-tokens.css high contrast also uses `!important`
- Result: Whichever loads last wins (cascade order conflict)

### Problem 4: Button Colors Hardcoded
```css
/* Current in professional-polish.css */
.btn-secondary {
  background: #2e6db5 !important;  /* Fixed color, no theme awareness */
  color: #ffffff !important;
}
```

This works for dark mode but will look weird in light mode and breaks high contrast.

---

## ✅ Solution Plan

### Step 1: Remove Dark Mode Defaults from professional-polish.css
Remove all color values from `:root` in professional-polish.css. Only keep:
- Spacing variables
- Typography variables  
- Border radius variables
- Shadow variables (adjust for light/dark)

### Step 2: Use accessibility-tokens.css Variables
Change all hardcoded colors in professional-polish.css to use tokens from accessibility-tokens.css:
- `--light-*` variables for light mode
- `--dark-*` variables for dark mode (via `[data-theme="dark"]`)
- Let high contrast override everything

### Step 3: Theme-Aware Component Styles
Create conditional styles for each component:
```css
/* Footer - Light Mode (default) */
#site-footer {
  background: var(--light-bg-tertiary);
  color: var(--light-text-primary);
}

#site-footer a {
  color: var(--light-link-default);
}

/* Footer - Dark Mode */
[data-theme="dark"] #site-footer {
  background: var(--dark-bg-tertiary);
  color: var(--dark-text-primary);
}

[data-theme="dark"] #site-footer a {
  color: var(--dark-link-default);
}

/* Footer - High Contrast (auto-handles light/dark) */
[data-contrast="high"] #site-footer a {
  color: var(--hc-light-link) !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
}

[data-theme="dark"][data-contrast="high"] #site-footer a {
  color: var(--hc-dark-link) !important;
}
```

### Step 4: Remove !important Unless Necessary
Only use `!important` for:
- High contrast mode overrides
- Accessibility critical fixes
- Specificity conflicts that can't be resolved otherwise

### Step 5: Test All Combinations
Create test script that:
1. Loads page in light mode → Run axe
2. Switches to dark mode → Run axe
3. Switches to light + high contrast → Run axe
4. Switches to dark + high contrast → Run axe

All must pass with **zero violations**.

---

## 📋 Implementation Checklist

- [ ] Step 1: Clean professional-polish.css `:root` section
- [ ] Step 2: Update footer styles for all modes
- [ ] Step 3: Update button styles for all modes
- [ ] Step 4: Update link colors for all modes
- [ ] Step 5: Create comprehensive test
- [ ] Step 6: Run axe tests on all 4 modes
- [ ] Step 7: Verify GitHub Actions passes
- [ ] Step 8: Document final color values

---

## 🎨 Recommended Color System

### Footer
| Mode | Background | Text | Links | Contrast |
|------|------------|------|-------|----------|
| Light | `#f8f9fa` | `#000000` | `#004085` | ✅ 10.2:1 |
| Dark | `#1a1d26` | `#ffffff` | `#a8c7ff` | ✅ 9.8:1 |
| Light HC | `#ffffff` | `#000000` | `#0000ee` | ✅ 21:1 |
| Dark HC | `#000000` | `#ffffff` | `#ffff00` | ✅ 21:1 |

### Buttons (Secondary)
| Mode | Background | Text | Contrast |
|------|------------|------|----------|
| Light | `#004085` | `#ffffff` | ✅ 10.2:1 |
| Dark | `#2e6db5` | `#ffffff` | ✅ 4.5:1 |
| Light HC | `#000000` | `#ffffff` | ✅ 21:1 |
| Dark HC | `#ffffff` | `#000000` | ✅ 21:1 |

---

**Status**: Ready to implement  
**Est. Time**: 60-90 minutes  
**Risk**: Low (all changes in CSS, no breaking changes)
