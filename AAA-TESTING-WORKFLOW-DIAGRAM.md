# WCAG 2.2 AAA Testing - Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRIGGER EVENTS                                │
├─────────────────────────────────────────────────────────────────────┤
│  • Pull Request to main     • Push to main                          │
│  • Weekly Schedule (Mon)    • Manual Workflow Dispatch              │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SETUP & PREFLIGHT                                 │
├─────────────────────────────────────────────────────────────────────┤
│  1. Checkout repository                                             │
│  2. Setup Node.js 20                                                │
│  3. Install dependencies (npm ci)                                   │
│  4. Install Playwright browsers                                     │
│  5. Create reports directories                                      │
│  6. Verify site is accessible (curl retry)                          │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PARALLEL TEST EXECUTION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   pa11y-ci AAA   │  │  Contrast Tests  │  │  Keyboard Tests  │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤  │
│  │ • WCAG2AAA std   │  │ • 7:1 normal     │  │ • Tab order      │  │
│  │ • axe + htmlcs   │  │ • 4.5:1 large    │  │ • Focus visible  │  │
│  │ • 18 pages       │  │ • 3 themes       │  │ • Skip links     │  │
│  │ • Screenshots    │  │ • All elements   │  │ • No traps       │  │
│  │ • JSON report    │  │ • JSON report    │  │ • ARIA checks    │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │             │
│           │   ┌──────────────────┐                    │             │
│           │   │  axe-core AAA    │                    │             │
│           │   ├──────────────────┤                    │             │
│           │   │ • AAA tags only  │                    │             │
│           │   │ • Quick/Full mode│                    │             │
│           │   │ • Retry logic    │                    │             │
│           │   │ • JSON + MD      │                    │             │
│           │   └────────┬─────────┘                    │             │
│           │            │                              │             │
└───────────┼────────────┼──────────────────────────────┼─────────────┘
            │            │                              │
            └────────────┴──────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    RESULTS ANALYSIS                                  │
├─────────────────────────────────────────────────────────────────────┤
│  analyze-aaa-results.js                                             │
│  • Load all JSON reports                                            │
│  • Count violations per suite                                       │
│  • Calculate total violations                                       │
│  • Generate summary.md                                              │
│  • Generate summary.json                                            │
│  • Create violation flag if needed                                  │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ARTIFACT UPLOAD                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Upload to GitHub (30-day retention):                               │
│  • reports/ directory (all JSON files)                              │
│  • reports/screenshots/ (violation images)                          │
│  • reports/summary.md (consolidated report)                         │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  REPORTING & NOTIFICATIONS                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────┐         ┌─────────────────────────────┐  │
│  │ GitHub Step Summary  │         │     PR Comment (if PR)      │  │
│  ├──────────────────────┤         ├─────────────────────────────┤  │
│  │ • Test status table  │         │ • Pass/Fail status          │  │
│  │ • Violation counts   │         │ • Violations table          │  │
│  │ • Detailed breakdown │         │ • Link to artifacts         │  │
│  │ • Top issues         │         │ • Recommended actions       │  │
│  └──────────────────────┘         └─────────────────────────────┘  │
│                                                                      │
└────────────────────┬────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BUILD STATUS                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Check for: reports/has-violations.flag                             │
│                                                                      │
│  ┌──────────────────┐              ┌──────────────────┐            │
│  │  ✅ NO FLAG      │              │  ❌ FLAG EXISTS  │            │
│  ├──────────────────┤              ├──────────────────┤            │
│  │ • Build PASSES   │              │ • Build FAILS    │            │
│  │ • Exit code: 0   │              │ • Exit code: 1   │            │
│  │ • Deploy allowed │              │ • Block deploy   │            │
│  └──────────────────┘              └──────────────────┘            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Test Flow Detail

### pa11y-ci Flow
```
Load .pa11yci-aaa.json
    ↓
For each URL (18 pages):
    ↓
Launch headless Chrome
    ↓
Run axe + htmlcs runners
    ↓
Apply WCAG2AAA standard
    ↓
Capture screenshot if violations
    ↓
Save to JSON array
    ↓
Exit with code based on threshold
```

### Contrast Test Flow
```
For each URL:
    ↓
For each theme (light/dark/high-contrast):
    ↓
    Navigate to page
        ↓
    Apply theme settings
        ↓
    Get all text elements
        ↓
    For each element:
        ↓
        Extract foreground color
        Extract background color
        Get font size & weight
        Calculate contrast ratio
        Determine if large text
        Compare to required ratio (7:1 or 4.5:1)
        Record if violation
        ↓
    Save violations to JSON
```

### Keyboard Test Flow
```
For each URL:
    ↓
Navigate to page
    ↓
┌─────────────────────────────────┐
│ Test 1: Tab Order               │
│ • Find all focusable elements   │
│ • Check visibility              │
│ • Verify ARIA labels            │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Test 2: Skip Links              │
│ • Search for skip links         │
│ • Verify targets exist          │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Test 3: Focus Indicators        │
│ • Tab through elements          │
│ • Check outline/shadow/border   │
│ • Verify visibility             │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Test 4: Keyboard Trap           │
│ • Tab up to 50 times            │
│ • Track visited elements        │
│ • Detect infinite loops         │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Test 5: ARIA Landmarks          │
│ • Find main, nav, banner, etc.  │
│ • Verify presence               │
└─────────────────────────────────┘
    ↓
Save results to JSON
```

### axe-core Flow
```
For each URL:
    ↓
Navigate with retry (up to 3 attempts)
    ↓
Initialize AxeBuilder
    ↓
Configure tags:
  • wcag2aaa
  • wcag21aaa
  • wcag22aaa
  • best-practice
    ↓
Analyze page
    ↓
Collect violations + incomplete
    ↓
Save to report array
    ↓
Generate summary markdown
```

## Report Structure

```
reports/
├── pa11y/
│   ├── pa11y-aaa-report.json    (Array of page results)
│   └── pa11y-aaa-report.txt     (Human-readable)
├── contrast/
│   └── contrast-aaa-report.json (Violations by page/theme)
├── keyboard/
│   └── keyboard-navigation-report.json (Test results)
├── screenshots/
│   ├── homepage.png
│   ├── about.png
│   └── ... (18 pages)
├── axe-aaa-report.json          (Violations by page)
├── axe-aaa-summary.md           (Summary markdown)
├── summary.json                 (Consolidated stats)
├── summary.md                   (Final report)
└── has-violations.flag          (Present if violations)
```

## Decision Tree

```
                  Start Workflow
                       │
                       ▼
              Preflight Check Passes?
                   /        \
                 YES         NO
                  │           │
                  │           ▼
                  │      Exit with Error
                  │
                  ▼
           Run All Tests
                  │
                  ▼
         Any Violations Found?
              /        \
            YES         NO
             │           │
             ▼           ▼
    Create Flag      No Flag
             │           │
             ▼           ▼
    Upload Reports  Upload Reports
             │           │
             ▼           ▼
    Post PR Comment Post PR Comment
             │           │
             ▼           ▼
    Build FAILS ❌  Build PASSES ✅
```

## Integration Points

```
┌─────────────────────┐
│  GitHub Repository  │
└──────────┬──────────┘
           │
           ├─── Pull Request Created/Updated
           ├─── Push to main Branch
           ├─── Schedule Trigger (Cron)
           └─── Manual Dispatch
                      │
                      ▼
           ┌──────────────────────┐
           │  GitHub Actions      │
           │  Runner (Ubuntu)     │
           └──────────┬───────────┘
                      │
                      ├─── Fetch Code
                      ├─── Install Dependencies
                      ├─── Run Tests
                      └─── Upload Results
                            │
                            ▼
              ┌──────────────────────┐
              │  External Resources  │
              ├──────────────────────┤
              │ • 3mpwrapp.github.io │
              │ • npm registry       │
              │ • Playwright CDN     │
              └──────────────────────┘
```

---

*This workflow ensures comprehensive WCAG 2.2 Level AAA compliance*  
*with automated testing on every code change.*
