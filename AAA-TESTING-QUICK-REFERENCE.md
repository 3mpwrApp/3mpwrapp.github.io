# Quick Reference: AAA Testing Commands

## 🚀 Quick Start

### Run All Tests
```bash
npm run a11y:test
```

### Run Quick Test (2-3 minutes)
```bash
npm run a11y:quick
```

## 📋 Individual Tests

### pa11y-ci AAA
```bash
npm run a11y:pa11y
```

### Contrast Ratio (7:1 / 4.5:1)
```bash
npm run a11y:contrast
```

### Keyboard Navigation
```bash
npm run a11y:keyboard
```

### axe-core AAA
```bash
npm run a11y:axe
```

### Analyze Results
```bash
npm run a11y:analyze
```

## 📁 Report Locations

- **Summary:** `reports/summary.md`
- **pa11y:** `reports/pa11y/pa11y-aaa-report.json`
- **Contrast:** `reports/contrast/contrast-aaa-report.json`
- **Keyboard:** `reports/keyboard/keyboard-navigation-report.json`
- **axe:** `reports/axe-aaa-report.json`
- **Screenshots:** `reports/screenshots/*.png`

## ✅ Pass Criteria

- **Contrast:** 7:1 normal text, 4.5:1 large text
- **Keyboard:** All focusable, visible indicators, no traps
- **WCAG:** Level AAA compliance
- **Threshold:** 0 violations allowed

## 🔧 Common Fixes

### Contrast Too Low
```css
/* Change from */
color: #777;
/* To */
color: #595959; /* 7:1 ratio */
```

### Missing Focus Indicator
```css
button:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

### Missing Skip Link
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

## 🔗 CI/CD

- **Workflow:** `.github/workflows/wcag-aaa-testing.yml`
- **Config:** `.pa11yci-aaa.json`
- **Triggers:** Push, PR, Weekly (Mon 08:00), Manual

## 📊 View Results

### In GitHub Actions
1. Go to Actions tab
2. Select "WCAG 2.2 AAA Testing"
3. Click latest run
4. Download artifacts

### In PR
- Results auto-posted as comment
- Build fails if violations found

## 🆘 Troubleshooting

### Install dependencies first
```bash
npm install
npx playwright install chromium
```

### Tests timeout
Increase timeout in `.pa11yci-aaa.json`

### Site not reachable
Verify site is deployed and accessible

## 📚 Full Documentation

See [CI-AAA-TESTING-SETUP.md](./CI-AAA-TESTING-SETUP.md) for complete guide.
