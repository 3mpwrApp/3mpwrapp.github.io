# CI AAA Testing Setup Guide

## Overview

This document describes the automated WCAG 2.2 Level AAA accessibility testing system integrated into the GitHub Actions CI/CD pipeline for the 3mpwrapp website.

## What Was Implemented

### 1. GitHub Actions Workflow
**File:** `.github/workflows/wcag-aaa-testing.yml`

The workflow runs comprehensive AAA accessibility tests on:
- **Every pull request** to the main branch
- **Every push** to the main branch
- **Weekly schedule** (Mondays at 08:00 UTC)
- **Manual trigger** via workflow_dispatch

### 2. Test Suites

#### a. pa11y-ci AAA Testing
- **Config:** `.pa11yci-aaa.json`
- **Standard:** WCAG2AAA
- **Runners:** axe + htmlcs (dual validation)
- **Coverage:** 18 key pages
- **Features:**
  - Screenshot capture for violations
  - Custom timeout per page (30-40s)
  - Modal suppression via `?no-modal=1`
  - Zero tolerance threshold

#### b. Contrast Ratio Testing
- **Script:** `scripts/test-contrast-aaa.js`
- **Requirements:**
  - 7:1 for normal text (AAA)
  - 4.5:1 for large text (18px+ or 14px+ bold)
- **Tests:**
  - Light, dark, and high-contrast themes
  - All visible text elements
  - Foreground/background combinations
- **Output:** JSON report with violations

#### c. Keyboard Navigation Testing
- **Script:** `scripts/test-keyboard-navigation.js`
- **Tests:**
  - Tab order and focusable elements
  - Skip links presence
  - Focus indicator visibility
  - Keyboard trap detection
  - ARIA landmark structure
- **Output:** JSON report with violations

#### d. Enhanced axe-core AAA Testing
- **Script:** `scripts/axe-check-aaa.js`
- **Tags:** wcag2aaa, wcag21aaa, wcag22aaa, best-practice
- **Features:**
  - Quick mode (6 pages) for PRs
  - Full mode (17 pages) for scheduled runs
  - Retry logic for network issues
- **Output:** JSON report + markdown summary

#### e. Results Analysis
- **Script:** `scripts/analyze-aaa-results.js`
- **Functionality:**
  - Aggregates all test results
  - Generates unified summary
  - Creates violation flag for build failure
  - Produces GitHub Step Summary

### 3. NPM Scripts

Added to `package.json`:

```json
"a11y:test"      // Run all AAA tests locally
"a11y:pa11y"     // Run pa11y-ci only
"a11y:contrast"  // Run contrast tests only
"a11y:keyboard"  // Run keyboard tests only
"a11y:axe"       // Run axe-core tests only
"a11y:analyze"   // Analyze results
"a11y:ci"        // Alias for a11y:test
"a11y:quick"     // Quick test (axe + contrast)
```

### 4. Dependencies Added

```json
"pa11y-ci": "^3.1.0",
"puppeteer": "^23.11.1"
```

Existing dependencies utilized:
- `@axe-core/playwright`
- `playwright`

## How It Works

### CI/CD Pipeline Flow

1. **Trigger Event** (push, PR, schedule, manual)
   ↓
2. **Preflight Check** - Verify site is accessible
   ↓
3. **Parallel Test Execution:**
   - pa11y-ci with WCAG2AAA standard
   - Contrast ratio validation (7:1 / 4.5:1)
   - Keyboard navigation tests
   - axe-core AAA scan
   ↓
4. **Results Analysis** - Aggregate violations
   ↓
5. **Artifact Upload** - Save reports (30 days)
   ↓
6. **Summary Generation:**
   - GitHub Step Summary
   - PR Comment (for pull requests)
   ↓
7. **Build Status:**
   - ✅ Pass if zero violations
   - ❌ Fail if any violations found

### Test Coverage

**Pages Tested:**
- Homepage
- About
- Features
- User Guide
- Community
- Resources
- Wellness
- Contact
- Newsletter
- Blog
- Beta
- Search
- Site Map
- Accessibility
- Privacy
- Campaigns
- Events
- What's New

**WCAG 2.2 AAA Criteria Tested:**

| Success Criterion | Level | Test Method |
|-------------------|-------|-------------|
| 1.4.6 Contrast (Enhanced) | AAA | Automated (contrast script + axe) |
| 1.4.8 Visual Presentation | AAA | pa11y + manual review |
| 2.1.3 Keyboard (No Exception) | AAA | Keyboard navigation script |
| 2.4.8 Location | AAA | axe-core |
| 2.4.9 Link Purpose (Link Only) | AAA | pa11y + axe |
| 2.4.10 Section Headings | AAA | axe-core |
| 3.1.3 Unusual Words | AAA | pa11y |
| 3.1.4 Abbreviations | AAA | pa11y |
| 3.1.5 Reading Level | AAA | Manual (not automated) |
| 3.2.5 Change on Request | AAA | Manual (not automated) |
| 3.3.5 Help | AAA | pa11y |
| 3.3.6 Error Prevention (All) | AAA | Manual (not automated) |

## Local Testing

### Prerequisites

```bash
npm install
npx playwright install chromium
```

### Run All Tests

```bash
npm run a11y:test
```

This will:
1. Run pa11y-ci with AAA standard
2. Test all contrast ratios
3. Validate keyboard navigation
4. Execute axe-core AAA scan
5. Generate consolidated report

### Run Individual Tests

```bash
# pa11y only
npm run a11y:pa11y

# Contrast only
npm run a11y:contrast

# Keyboard only
npm run a11y:keyboard

# axe-core only
npm run a11y:axe

# Quick test (axe + contrast)
npm run a11y:quick
```

### View Results

Test reports are saved to `./reports/`:

```
reports/
├── pa11y/
│   ├── pa11y-aaa-report.json
│   └── pa11y-aaa-report.txt
├── contrast/
│   └── contrast-aaa-report.json
├── keyboard/
│   └── keyboard-navigation-report.json
├── axe-aaa-report.json
├── axe-aaa-summary.md
├── summary.json
└── summary.md
```

### Screenshots

pa11y captures screenshots of violations:

```
reports/screenshots/
├── homepage.png
├── about.png
├── features.png
└── ...
```

## CI Configuration

### Environment Variables

The workflow uses these environment variables:

```yaml
SITE_URL: https://3mpwrapp.github.io  # Base URL for testing
AXE_MODE: quick  # or 'full' for scheduled runs
```

### Workflow Triggers

#### Pull Requests
- Runs on all PRs to main
- Posts comment with results
- Fails PR if violations found
- Uses quick mode (6 pages)

#### Main Branch Push
- Runs on every push to main
- Validates production code
- Uses quick mode (6 pages)

#### Scheduled
- Weekly on Mondays at 08:00 UTC
- Full test suite (18 pages)
- Comprehensive coverage

#### Manual
- Trigger via GitHub Actions UI
- Useful for debugging
- Can select branch

### Artifacts Retention

Test results are retained for **30 days** and include:
- All JSON reports
- Screenshots
- Summary documents

## Failure Handling

### When Tests Fail

The workflow will:
1. Mark the build as failed ❌
2. Show summary in GitHub Step Summary
3. Comment on PR with violation details
4. Upload detailed reports to artifacts
5. Display top violations in console

### Fixing Violations

1. **Download artifacts** from failed workflow run
2. **Review reports** in `reports/summary.md`
3. **Identify issues** by severity:
   - Critical: Fix immediately (keyboard traps, no focus)
   - Serious: Fix before merge (contrast < 7:1)
   - Moderate: Schedule fix (missing ARIA labels)
   - Minor: Nice to have (enhanced markup)
4. **Test locally:**
   ```bash
   npm run a11y:test
   ```
5. **Fix code** and re-test
6. **Push changes** and re-run CI

## Best Practices

### Development Workflow

1. **Before committing:**
   ```bash
   npm run a11y:quick
   ```

2. **Before PR:**
   ```bash
   npm run a11y:test
   ```

3. **Monitor CI:**
   - Check GitHub Actions tab
   - Review PR comments
   - Download artifacts if failures

### Maintaining AAA Compliance

- **Design phase:** Use AAA-compliant color palette
- **Development:** Test components as you build
- **Review:** Include accessibility in PR checklist
- **Monitoring:** Review scheduled test results weekly

### Common Issues & Solutions

#### Contrast Ratio Failures
```javascript
// ❌ Fails AAA (4.8:1)
color: #777;
background: white;

// ✅ Passes AAA (7.5:1)
color: #595959;
background: white;
```

#### Missing Focus Indicators
```css
/* ❌ No visible focus */
button:focus {
  outline: none;
}

/* ✅ AAA-compliant focus */
button:focus-visible {
  outline: 3px solid #0066cc;
  outline-offset: 2px;
}
```

#### Keyboard Traps
```javascript
// ❌ Traps focus
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
});

// ✅ Manages focus correctly
modal.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') trapFocusInModal(e);
  if (e.key === 'Escape') closeModal();
});
```

## Customization

### Add More URLs

Edit `.pa11yci-aaa.json`:

```json
{
  "urls": [
    {
      "url": "https://3mpwrapp.github.io/new-page?no-modal=1",
      "timeout": 30000,
      "screenCapture": "./reports/screenshots/new-page.png"
    }
  ]
}
```

### Adjust Thresholds

Currently set to **zero tolerance** (`threshold: 0`).

To allow some violations (not recommended for AAA):

```json
{
  "threshold": 5  // Allow up to 5 violations
}
```

### Modify Test Runners

pa11y uses both axe and htmlcs. To change:

```json
{
  "defaults": {
    "runners": ["axe"]  // Use only axe
  }
}
```

### Add Custom Tests

Create new script in `scripts/`:

```javascript
// scripts/test-custom-aaa.js
// Your custom AAA validation logic
```

Add to workflow:

```yaml
- name: Run custom AAA tests
  run: node scripts/test-custom-aaa.js
```

Update npm scripts:

```json
{
  "scripts": {
    "a11y:custom": "node scripts/test-custom-aaa.js",
    "a11y:test": "npm run a11y:pa11y && ... && npm run a11y:custom"
  }
}
```

## Monitoring & Reporting

### GitHub Actions Dashboard

View test history:
- Go to **Actions** tab
- Select **WCAG 2.2 AAA Testing** workflow
- Review run history and trends

### Weekly Reports

Scheduled runs produce comprehensive reports:
- Download artifacts from weekly runs
- Compare trends over time
- Track compliance improvements

### PR Comments

Automated comments include:
- Test suite results table
- Violation counts
- Link to detailed reports
- Recommended actions

## Troubleshooting

### Tests Timing Out

Increase timeout in config:

```json
{
  "defaults": {
    "timeout": 60000  // 60 seconds
  }
}
```

### Site Not Reachable

Check preflight step in workflow:
- Verify URL is correct
- Check if site is deployed
- Review network logs

### False Positives

If getting incorrect violations:
1. Review screenshot in artifacts
2. Test manually with browser
3. Update config to hide elements:
   ```json
   {
     "defaults": {
       "hideElements": ".modal, .popup"
     }
   }
   ```

### Incomplete Results

Some tests may be incomplete (need manual review):
- Check `incomplete` array in axe reports
- Review `warnings` in pa11y reports
- Conduct manual testing

## Manual Testing Checklist

Some AAA criteria require manual validation:

- [ ] **Reading level** (3.1.5) - Use readability tools
- [ ] **Context-sensitive help** (3.3.5) - Verify help available
- [ ] **Error prevention** (3.3.6) - Test form submissions
- [ ] **Change on request** (3.2.5) - No automatic changes
- [ ] **Timing adjustable** (2.2.3) - User can extend limits
- [ ] **No timing** (2.2.5) - Sessions don't expire unexpectedly

## Resources

### WCAG 2.2 Documentation
- [WCAG 2.2 Overview](https://www.w3.org/WAI/WCAG22/quickref/?currentsidebar=%23col_customize&levels=aaa)
- [Understanding WCAG 2.2 Level AAA](https://www.w3.org/WAI/WCAG22/Understanding/)

### Tools
- [pa11y-ci Documentation](https://github.com/pa11y/pa11y-ci)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Playwright Testing](https://playwright.dev/)

### Validation
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

## Support

For issues with the testing system:

1. Check workflow logs in GitHub Actions
2. Run tests locally to debug
3. Review test script source code
4. Consult WCAG 2.2 documentation
5. Create an issue with:
   - Test output
   - Expected behavior
   - Screenshots/artifacts

## Changelog

### Version 1.0.0 (January 2026)
- Initial setup of AAA testing system
- GitHub Actions workflow integration
- Four test suites: pa11y, contrast, keyboard, axe
- Automated PR comments
- Artifact uploads with 30-day retention
- Comprehensive documentation

---

**Maintained by:** 3mpwr App Team  
**Last Updated:** January 15, 2026  
**License:** MIT
