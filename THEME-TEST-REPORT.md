# Theme Accessibility Test Report

**Date**: 2025-10-28, 7:33:04 p.m.
**Base URL**: https://3mpwrapp.pages.dev
**Total Tests**: 60
**Passed**: 29
**Failed**: 27
**Total Violations**: 27

## ⚠️ Issues Found

27 test(s) failed with 27 total violation(s).

## Results by Mode

| Mode | Passed | Failed | Violations |
|------|--------|--------|------------|
| ❌ Light Mode | 8 | 6 | 6 |
| ❌ Dark Mode | 6 | 8 | 8 |
| ❌ Light + High Contrast | 8 | 6 | 6 |
| ❌ Dark + High Contrast | 7 | 7 | 7 |

## Results by Page

| Page | Light | Dark | Light+HC | Dark+HC |
|------|-------|------|----------|----------|
| / | ❌ | ❌ | ❌ | ❌ |
| /about | ✅ | ❌ | ✅ | ❌ |
| /features | ❌ | ❌ | ❌ | ❌ |
| /user-guide | ✅ | ✅ | ✅ | ✅ |
| /blog | ❌ | ✅ | ❌ | ❌ |
| /contact | ❌ | ❌ | ❌ | ❌ |
| /privacy | ❌ | ❌ | ❌ | ❌ |
| /terms | ✅ | ✅ | ✅ | ✅ |
| /accessibility | ✅ | ✅ | ✅ | ✅ |
| /faq | ❌ | ❌ | ❌ | ❌ |
| /roadmap | ✅ | ❌ | ✅ | ✅ |
| /beta | ✅ | ✅ | ✅ | ✅ |
| /crisis-resources | ✅ | ❌ | ✅ | ✅ |
| /accessibility-settings | ✅ | ✅ | ✅ | ✅ |
| /app-waitlist | ❌ | ❌ | ❌ | ❌ |

## Detailed Violations

### / - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=home&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.28 (foreground color: #0056b3, background color: #047857, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=home&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.45 (foreground color: #0056b3, background color: #dc2626, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=home" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.36 (foreground color: #0056b3, background color: #2563eb, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /features - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=features&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.28 (foreground color: #0056b3, background color: #047857, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=features&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.45 (foreground color: #0056b3, background color: #dc2626, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=features" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.36 (foreground color: #0056b3, background color: #2563eb, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /blog - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 1

**Element 1**:
```html
<a href="#all-curated" class="btn-secondary">View All Daily Highlights →</a>
```
- Target: `[".btn-secondary"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.19 (foreground color: #0056b3, background color: #212529, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

### /privacy - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback/" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.28 (foreground color: #0056b3, background color: #047857, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback/" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.45 (foreground color: #0056b3, background color: #dc2626, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback/" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.36 (foreground color: #0056b3, background color: #2563eb, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /faq - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=faq&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, very helpful</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.28 (foreground color: #0056b3, background color: #047857, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=faq&amp;helpful=no" class="feedback-btn feedback-no">👎 Needs improvement</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.45 (foreground color: #0056b3, background color: #dc2626, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=faq&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.36 (foreground color: #0056b3, background color: #2563eb, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /app-waitlist - Light Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, signing up!</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.28 (foreground color: #0056b3, background color: #047857, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=no" class="feedback-btn feedback-no">👎 Have concerns</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.45 (foreground color: #0056b3, background color: #dc2626, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=app-waitlist&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.36 (foreground color: #0056b3, background color: #2563eb, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### / - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 5

**Element 1**:
```html
<span class="badge" aria-label="13 accessibility features available">13 features</span>
```
- Target: `["#toolbarToggle > .badge"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.21 (foreground color: #ffffff, background color: #4f8cff, font size: 9.0pt (12px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<span class="badge badge--new" aria-label="New update in the last 24 hours">New!</span>
```
- Target: `[".badge--new"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.53 (foreground color: #ffffff, background color: #10b981, font size: 10.5pt (14px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=home&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #10b981, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 4**:
```html
<a href="/feedback?page=home&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.17 (foreground color: #66b2ff, background color: #fca5a5, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 5**:
```html
<a href="/feedback?page=home" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #60a5fa, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /about - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 7

**Element 1**:
```html
<a href="/user-guide" class="resource-link">
      User Guide →
    </a>
```
- Target: `[".resource-link[href$=\"user-guide\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/features" class="resource-link">
      Explore Features →
    </a>
```
- Target: `[".resource-link[href$=\"features\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/privacy/" class="resource-link">Privacy Policy →</a>
```
- Target: `["a[href$=\"privacy/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 4**:
```html
<a href="/data-ownership/" class="resource-link">Data Ownership Statement →</a>
```
- Target: `["a[href$=\"data-ownership/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 5**:
```html
<a href="/privacy-controls/" class="resource-link">Privacy Controls →</a>
```
- Target: `["a[href$=\"privacy-controls/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 6**:
```html
<a href="/terms/" class="resource-link">Terms of Service →</a>
```
- Target: `["a[href$=\"terms/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 7**:
```html
<a href="/legal/disclaimers/" class="resource-link">Read all disclaimers →</a>
```
- Target: `["a[href$=\"disclaimers/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

### /features - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 5

**Element 1**:
```html
<span class="count">133</span>
```
- Target: `[".active > .count"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.84 (foreground color: #ffffff, background color: #3385d6, font size: 10.2pt (13.6px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<div id="filter-results" class="filter-results" role="status" aria-live="polite" style="background-color: rgb(227, 242, 253); color: rgb(0, 102, 204);">Showing 6 features</div>
```
- Target: `["#filter-results"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.14 (foreground color: #ffffff, background color: #e3f2fd, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=features&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #10b981, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 4**:
```html
<a href="/feedback?page=features&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.17 (foreground color: #66b2ff, background color: #fca5a5, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 5**:
```html
<a href="/feedback?page=features" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #60a5fa, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /privacy - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback/" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #10b981, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback/" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.17 (foreground color: #66b2ff, background color: #fca5a5, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback/" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #60a5fa, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /faq - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=faq&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, very helpful</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #10b981, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=faq&amp;helpful=no" class="feedback-btn feedback-no">👎 Needs improvement</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.17 (foreground color: #66b2ff, background color: #fca5a5, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=faq&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #60a5fa, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /roadmap - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<div class="timeline-badge upcoming-badge">📅 Coming Soon</div>
```
- Target: `[".upcoming-badge"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.8 (foreground color: #ffffff, background color: #22d3ee, font size: 10.2pt (13.6px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<div class="timeline-badge future-badge">🎯 Planned</div>
```
- Target: `["div[data-phase=\"3\"] > .timeline-content > .future-badge.timeline-badge"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.14 (foreground color: #ffffff, background color: #e3f2fd, font size: 10.2pt (13.6px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<div class="timeline-badge future-badge">🚀 Future</div>
```
- Target: `["div[data-phase=\"4\"] > .timeline-content > .future-badge.timeline-badge"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.14 (foreground color: #ffffff, background color: #e3f2fd, font size: 10.2pt (13.6px), font weight: bold). Expected contrast ratio of 4.5:1

### /crisis-resources - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 7

**Element 1**:
```html
<a href="tel:1-833-456-4566" class="service-phone phone-link" data-copy="1-833-456-4566" aria-label="Call 1-833-456-4566">1-833-456-4566</a>
```
- Target: `["a[data-copy=\"1-833-456-4566\"][href=\"tel:1-833-456-4566\"][aria-label=\"Call 1-833-456-4566\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

**Element 2**:
```html
<a href="tel:1-800-668-6868" class="service-phone phone-link" data-copy="1-800-668-6868" aria-label="Call 1-800-668-6868">1-800-668-6868</a>
```
- Target: `["a[href=\"tel:1-800-668-6868\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

**Element 3**:
```html
<a href="tel:1-855-242-3310" class="service-phone phone-link" data-copy="1-855-242-3310" aria-label="Call 1-855-242-3310">1-855-242-3310</a>
```
- Target: `["a[href=\"tel:1-855-242-3310\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

**Element 4**:
```html
<a href="https://hopeforwellness.ca" target="_blank" rel="noopener noreferrer">hopeforwellness.ca<span class="sr-only"> (opens in a new tab)</span></a>
```
- Target: `["a[href$=\"hopeforwellness.ca\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 10.8pt (14.4px), font weight: normal). Expected contrast ratio of 4.5:1

**Element 5**:
```html
<a href="tel:1-800-363-9010" class="service-phone phone-link" data-copy="1-800-363-9010" aria-label="Call 1-800-363-9010">1-800-363-9010</a>
```
- Target: `["a[href=\"tel:1-800-363-9010\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

**Element 6**:
```html
<a href="tel:211" class="service-phone phone-link" data-copy="211" aria-label="Call 211">211</a>
```
- Target: `["a[href$=\"tel:211\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

**Element 7**:
```html
<a href="tel:1-866-585-0445" class="service-phone phone-link" data-copy="1-866-585-0445" aria-label="Call 1-866-585-0445">1-866-585-0445</a>
```
- Target: `["a[href=\"tel:1-866-585-0445\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #66b2ff, background color: #ffffff, font size: 18.0pt (24px), font weight: bold). Expected contrast ratio of 3:1

### /app-waitlist - Dark Mode

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, signing up!</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #10b981, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=no" class="feedback-btn feedback-no">👎 Have concerns</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.17 (foreground color: #66b2ff, background color: #fca5a5, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=app-waitlist&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.13 (foreground color: #66b2ff, background color: #60a5fa, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### / - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 3

**Element 1**:
```html
<a class="highlight-banner__button" href="/blog/#curated-daily" aria-describedby="curated-daily-desc">
      Check out today’s curated feed →
    </a>
```
- Target: `[".highlight-banner__button"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #0000ee, background color: #000000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=home&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.35 (foreground color: #0000ee, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/feedback?page=home" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.09 (foreground color: #0000ee, background color: #0000ff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /features - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=features&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.35 (foreground color: #0000ee, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=features" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.09 (foreground color: #0000ee, background color: #0000ff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /blog - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 1

**Element 1**:
```html
<a href="#all-curated" class="btn-secondary">View All Daily Highlights →</a>
```
- Target: `[".btn-secondary"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.23 (foreground color: #0000ee, background color: #000000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /privacy - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback/" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.35 (foreground color: #0000ee, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback/" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.09 (foreground color: #0000ee, background color: #0000ff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /faq - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=faq&amp;helpful=no" class="feedback-btn feedback-no">👎 Needs improvement</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.35 (foreground color: #0000ee, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=faq&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.09 (foreground color: #0000ee, background color: #0000ff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /app-waitlist - Light + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=no" class="feedback-btn feedback-no">👎 Have concerns</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 2.35 (foreground color: #0000ee, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=app-waitlist&amp;type=suggestion" class="feedback-btn feedback-suggest">📝 Suggest improvements</a>
```
- Target: `[".feedback-suggest"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.09 (foreground color: #0000ee, background color: #0000ff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### / - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=home&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.27 (foreground color: #ffff00, background color: #00ff00, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=home&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.72 (foreground color: #ffff00, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /about - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 7

**Element 1**:
```html
<a href="/user-guide" class="resource-link">
      User Guide →
    </a>
```
- Target: `[".resource-link[href$=\"user-guide\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/features" class="resource-link">
      Explore Features →
    </a>
```
- Target: `[".resource-link[href$=\"features\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 3**:
```html
<a href="/privacy/" class="resource-link">Privacy Policy →</a>
```
- Target: `["a[href$=\"privacy/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 4**:
```html
<a href="/data-ownership/" class="resource-link">Data Ownership Statement →</a>
```
- Target: `["a[href$=\"data-ownership/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 5**:
```html
<a href="/privacy-controls/" class="resource-link">Privacy Controls →</a>
```
- Target: `["a[href$=\"privacy-controls/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 6**:
```html
<a href="/terms/" class="resource-link">Terms of Service →</a>
```
- Target: `["a[href$=\"terms/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 7**:
```html
<a href="/legal/disclaimers/" class="resource-link">Read all disclaimers →</a>
```
- Target: `["a[href$=\"disclaimers/\"]"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /features - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=features&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.27 (foreground color: #ffff00, background color: #00ff00, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=features&amp;helpful=no" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.72 (foreground color: #ffff00, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /blog - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 1

**Element 1**:
```html
<a href="#all-curated" class="btn-secondary">View All Daily Highlights →</a>
```
- Target: `[".btn-secondary"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.07 (foreground color: #ffff00, background color: #ffffff, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /privacy - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback/" class="feedback-btn feedback-yes">👍 Yes</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.27 (foreground color: #ffff00, background color: #00ff00, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback/" class="feedback-btn feedback-no">👎 No</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.72 (foreground color: #ffff00, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /faq - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=faq&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, very helpful</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.27 (foreground color: #ffff00, background color: #00ff00, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=faq&amp;helpful=no" class="feedback-btn feedback-no">👎 Needs improvement</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.72 (foreground color: #ffff00, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

### /app-waitlist - Dark + High Contrast

#### color-contrast (serious)
- **Description**: Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds
- **Affected elements**: 2

**Element 1**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=yes" class="feedback-btn feedback-yes">👍 Yes, signing up!</a>
```
- Target: `[".feedback-yes"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 1.27 (foreground color: #ffff00, background color: #00ff00, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

**Element 2**:
```html
<a href="/feedback?page=app-waitlist&amp;helpful=no" class="feedback-btn feedback-no">👎 Have concerns</a>
```
- Target: `[".feedback-no"]`
- Issue: Fix any of the following:
  Element has insufficient color contrast of 3.72 (foreground color: #ffff00, background color: #ff0000, font size: 12.0pt (16px), font weight: bold). Expected contrast ratio of 4.5:1

