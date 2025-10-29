# Theme Accessibility Test Report

**Date**: 2025-10-28, 8:53:07 p.m.
**Base URL**: https://3mpwrapp.pages.dev
**Total Tests**: 60
**Passed**: 55
**Failed**: 1
**Total Violations**: 1

## ⚠️ Issues Found

1 test(s) failed with 1 total violation(s).

## Results by Mode

| Mode | Passed | Failed | Violations |
|------|--------|--------|------------|
| ✅ Light Mode | 14 | 0 | 0 |
| ❌ Dark Mode | 13 | 1 | 1 |
| ✅ Light + High Contrast | 14 | 0 | 0 |
| ✅ Dark + High Contrast | 14 | 0 | 0 |

## Results by Page

| Page | Light | Dark | Light+HC | Dark+HC |
|------|-------|------|----------|----------|
| / | ✅ | ✅ | ✅ | ✅ |
| /about | ✅ | ✅ | ✅ | ✅ |
| /features | ✅ | ✅ | ✅ | ✅ |
| /user-guide | ✅ | ✅ | ✅ | ✅ |
| /blog | ✅ | ✅ | ✅ | ✅ |
| /contact | ❌ | ❌ | ❌ | ❌ |
| /privacy | ✅ | ✅ | ✅ | ✅ |
| /terms | ✅ | ✅ | ✅ | ✅ |
| /accessibility | ✅ | ✅ | ✅ | ✅ |
| /faq | ✅ | ✅ | ✅ | ✅ |
| /roadmap | ✅ | ✅ | ✅ | ✅ |
| /beta | ✅ | ✅ | ✅ | ✅ |
| /crisis-resources | ✅ | ❌ | ✅ | ✅ |
| /accessibility-settings | ✅ | ✅ | ✅ | ✅ |
| /app-waitlist | ✅ | ✅ | ✅ | ✅ |

## Detailed Violations

### /crisis-resources - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 1

**Element 1**:
```html
<a href="https://hopeforwellness.ca" target="_blank" rel="noopener noreferrer">hopeforwellness.ca<span class="sr-only"> (opens in a new tab)</span></a>
```
- Target: `["a[href$=\"hopeforwellness.ca\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 10.8pt (14.4px), font weight: normal). Expected contrast ratio of 4.5:1

