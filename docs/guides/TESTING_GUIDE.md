# 🔍 App Testing & Audit Guide

This guide explains all the free testing and auditing tools available for the Empwr app.

## Quick Start

### Run Quick Audit (5-7 minutes)
```bash
npm run audit:quick
```
Runs the essentials: linting, type checking, and unit tests.

### Run Full Comprehensive Audit (10-15 minutes)
```bash
npm run audit:full
```
Runs all tests, validations, and analysis tools.

### Individual Tools

## 1. **Code Quality & Linting** ✅

### ESLint
```bash
npm run lint
```
- **What it does**: Checks code style, best practices, and catches potential bugs
- **Rules**: Enforces proper React patterns, hooks usage, and accessibility standards
- **Free**: ✅ Yes
- **Type**: Static analysis

### TypeScript Type Checking
```bash
npm run typecheck:strict
```
- **What it does**: Validates all TypeScript types and catches type errors
- **Mode**: Strict mode (most comprehensive)
- **Free**: ✅ Yes
- **Type**: Static analysis

## 2. **Testing** ✅

### Unit & Integration Tests (Jest)
```bash
npm test
npm test:watch          # Watch mode for development
npm test:debug          # Debug mode with detailed output
npm test:stress         # Stress test suite (120 second timeout)
npm test:wcag           # Accessibility tests
npm test:all            # All tests with verbose output
```
- **What it does**: Runs 780+ unit and integration tests covering all app features
- **Coverage**: Components, utilities, services, hooks, accessibility
- **Free**: ✅ Yes
- **Type**: Unit/Integration testing

### E2E Testing (Maestro - Free)
```bash
npm run test:e2e:maestro
```
- **What it does**: Records and replays user interactions end-to-end
- **Setup**: See `e2e/maestro/` directory
- **Free**: ✅ Yes (Community Edition)

## 3. **Internationalization (i18n)** ✅

### i18n Validation
```bash
npm run i18n:validate
```
- **What it does**: Validates JSON structure and completeness
- **Checks**: Proper JSON syntax, missing keys, placeholder consistency
- **Free**: ✅ Yes

### i18n Test Suite
```bash
npm run i18n:test
```
Runs: tag checking, diffs, pluralization, threshold checks, and consistency asserts

### i18n Additional Tools
```bash
npm run i18n:coverage     # Coverage report
npm run i18n:report       # Missing translations report
npm run i18n:lint         # Lint i18n keys
npm run i18n:plural       # Check plural forms
npm run i18n:diff         # Diff against baseline
```

## 4. **Accessibility (A11y)** ✅

### Accessibility Scan
```bash
npm run a11y:scan
```
- **What it does**: Scans for WCAG compliance issues
- **Standard**: WCAG 2.2 AA
- **Free**: ✅ Yes

### WCAG AAA Audit
```bash
npm run wcag:aaa          # Interactive report
npm run wcag:aaa:json     # JSON report output
npm run wcag:aaa:strict   # Strict mode
```
- **What it does**: Deep WCAG 2.2 AAA compliance analysis
- **Standard**: WCAG 2.2 AAA (highest level)
- **Free**: ✅ Yes
- **Output**: Visual HTML report + JSON

## 5. **Security & Performance** ✅

### Security Validation
```bash
npm run security:validate
npm run security:test
npm run security:all
```
- **What it does**: Checks security best practices and configuration
- **Covers**: OWASP Mobile Top 10, crypto validation, secure storage
- **Free**: ✅ Yes

### Performance Analysis
```bash
npm run perf:budget       # Check bundle size against budget
npm run perf:breakdown    # Detailed bundle breakdown
npm run perf:max-file     # Find largest files
```
- **What it does**: Analyzes bundle sizes and performance metrics
- **Free**: ✅ Yes

### Reading Level Analysis
```bash
npm run read:level
```
- **What it does**: Scans text for reading level/complexity
- **Use case**: Ensures content is accessible to diverse audiences
- **Free**: ✅ Yes

## 6. **Code Analysis & Best Practices** ✅

### Analytics Validation
```bash
npm run check:analytics
npm run analytics:report
npm run analytics:pii:soft
```
- **What it does**: Validates analytics event names and checks for PII
- **Free**: ✅ Yes

### Incomplete Code Detection
```bash
npm run scan:incomplete:soft
```
- **What it does**: Finds TODO comments, incomplete implementations
- **Soft mode**: Non-blocking warnings
- **Free**: ✅ Yes

### Tab/Route Validation
```bash
npm run check:tabs:names
```
- **What it does**: Validates route names match their definitions
- **Free**: ✅ Yes

### Structure Validation
```bash
npm run validate:structure
npm run validate:structure:verbose
npm run validate:structure:report
```
- **What it does**: Validates project structure and file organization
- **Free**: ✅ Yes

## 7. **Expo Configuration** ✅

### Expo Doctor
```bash
npx expo-doctor
```
- **What it does**: Diagnostic check of Expo environment and dependencies
- **Checks**: Node version, package compatibility, SDK versions, credentials
- **Free**: ✅ Yes (built-in)
- **Output**: Warnings and compatibility issues

### Web Build Validation
```bash
npm run web:validate
```
- **What it does**: Checks web platform compatibility
- **Free**: ✅ Yes

## 8. **Advanced Tools** 🆓

### BYOC (Bring Your Own Cloud) Testing
```bash
npm run byoc:test
npm run byoc:validate
```
- **What it does**: Tests secure private cloud configuration
- **Free**: ✅ Yes (custom)

---

## 📊 Audit Report Summary

When you run `npm run audit:full`, you'll get:

1. **Test Results**: Pass/fail status for each tool
2. **JSON Report**: Detailed results saved to `audit-report.json`
3. **Exit Code**: 
   - `0` = All critical tests passed ✅
   - `1` = Critical tests failed ❌

## 🎯 CI/CD Integration

For continuous integration:
```bash
npm run audit:ci    # Runs audit and logs to audit-ci.log
npm run test:ci     # Optimized test run for CI
npm run lint:ci     # Lint with 0 warnings tolerance
```

## 🔐 Free vs Paid Tools

All tools listed above are **100% free** and open-source. Optional paid integrations (not included):
- **CodeRabbit** - AI code review (paid, but has free tier)
- **Snyk** - Advanced security scanning (free tier available)
- **SonarQube** - Advanced code quality (free community edition)
- **Sentry** - Error tracking (free tier + paid)

## 📈 Recommended Testing Schedule

### Before Each Commit
```bash
npm run audit:quick
```

### Before Pull Request
```bash
npm run lint && npm test
```

### Before Release
```bash
npm run audit:full
```

### In CI/CD Pipeline
```bash
npm run audit:ci
```

## 🚀 Performance Tips

- **First Run**: Takes 2-3 minutes (Jest cache warming)
- **Subsequent Runs**: 1-2 minutes (cache hit)
- **Watch Mode**: `npm test:watch` for instant feedback
- **Parallel Tests**: Jest runs tests in parallel by default

## 📝 Output Files

- `audit-report.json` - Comprehensive audit results
- `wcag-aaa-report.json` - Accessibility audit (when run)
- Various `.log` files for CI integration

## 🆘 Troubleshooting

### Tests fail with "Cannot find module"
```bash
npm install
npm run align:expo    # Realign Expo versions
```

### TypeScript errors in strict mode
```bash
npm run typecheck:strict  # Shows all errors
# Fix the errors, then re-run
```

### ESLint cache issues
```bash
npm run metro:clear   # Clear all caches
npm run lint          # Re-lint
```

---

**Last Updated**: January 2026
**Empwr App Testing Infrastructure**
