# Structure Validation System - Usage Guide

This guide explains how to use the automated folder/file structure validation system for the 3mpwr app.

## Table of Contents
- [Quick Start](#quick-start)
- [Running Validation](#running-validation)
- [Understanding Results](#understanding-results)
- [Pre-commit Integration](#pre-commit-integration)
- [CI/CD Integration](#cicd-integration)
- [Common Issues & Fixes](#common-issues--fixes)
- [Customizing Rules](#customizing-rules)

---

## Quick Start

The structure validation system ensures your codebase follows consistent naming conventions and folder organization.

### Run validation:
```bash
npm run validate:structure
```

### Generate detailed report:
```bash
npm run validate:structure:report
```

### View all files (verbose):
```bash
npm run validate:structure:verbose
```

---

## Running Validation

### Local Development

**Basic validation:**
```bash
npm run validate:structure
```
- Scans entire project structure
- Reports naming violations, misplaced files, deprecated folders
- Exit code 0 = success, 1 = issues found

**Verbose mode:**
```bash
npm run validate:structure:verbose
```
- Shows all files scanned (not just issues)
- Useful for understanding what's being checked
- Helpful for debugging false positives

**Generate JSON report:**
```bash
npm run validate:structure:report
```
- Creates `structure-report.json` with detailed issue breakdown
- Includes file paths, issue types, suggestions
- Can be used for automated tracking/metrics

### Pre-commit Hook (Opt-in)

To enable structure validation in pre-commit hooks:

```bash
VALIDATE_STRUCTURE=1 git commit -m "your message"
```

Or set globally for your shell session:
```bash
# PowerShell
$env:VALIDATE_STRUCTURE=1

# Bash/Zsh
export VALIDATE_STRUCTURE=1
```

**Why opt-in?**
- Avoids blocking commits during rapid development
- You can enable when working on structure cleanup
- Useful for enforcing standards before PR creation

### CI/CD (Automatic)

The GitHub Actions workflow runs automatically on:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

If validation fails:
- Workflow generates a report artifact (30-day retention)
- PR receives automatic comment with issue summary
- Does NOT block PR merge (informational only)

---

## Understanding Results

### Output Format

The validation script uses color-coded symbols:

- **✓ (Green)**: File follows conventions
- **✗ (Red)**: Naming violation or wrong extension
- **⚠ (Yellow)**: Warning (deprecated folder, temp file)
- **💡 (Magenta)**: Suggestion for improvement

### Issue Categories

#### 1. Naming Violations

**Components (PascalCase.tsx required):**
```
✗ components/MapEmbed.web.tsx
✗   Naming violation in components/ - expected: PascalCase.tsx
```

**Fix:** Rename to follow PascalCase convention or move to appropriate folder.

**Hooks (useCamelCase.ts required):**
```
✗ hooks/useColorScheme.web.ts
✗   Naming violation in hooks/ - expected: useCamelCase.ts
```

**Fix:** Platform-specific hooks are valid but flagged due to `.web` suffix. Consider renaming or exempting.

**Services (camelCase.ts required):**
```
✗ services/notifications.dispatcher.ts
✗   Naming violation in services/ - expected: camelCase.ts
```

**Fix:** Rename to `notificationsDispatcher.ts` (camelCase without dots).

**Scripts (kebab-case.js/mjs/ts required):**
```
✗ scripts/wcag_compliance_audit.js
✗   Naming violation in scripts/ - expected: kebab-case.js/mjs/ts
```

**Fix:** Rename to `wcag-compliance-audit.js` (kebab-case with dashes).

**Constants (SCREAMING_SNAKE_CASE.ts or PascalCase.ts required):**
```
✗ constants/a11y.ts
✗   Naming violation in constants/ - expected: SCREAMING_SNAKE_CASE.ts or PascalCase.ts
```

**Fix:** Rename to `A11Y.ts` or `ACCESSIBILITY.ts` (uppercase with underscores).

**Types (.d.ts files - PascalCase or camelCase):**
```
✗ types/expo-file-system-augmentation.d.ts
✗   Naming violation in types/ - expected: PascalCase.ts or camelCase.ts
```

**Fix:** Type definition files (`.d.ts`) with kebab-case are common for augmentations. Consider exempting or renaming to `ExpoFileSystemAugmentation.d.ts`.

#### 2. Extension Violations

**Utils (should be .ts, not .tsx):**
```
✗ utils/toast.tsx
✗   Wrong extension for utils/ - expected: .ts
```

**Fix:** If `toast.tsx` exports React components, move to `components/`. If it's just utility functions, rename to `.ts`.

**Scripts (should be .js/.mjs/.ts, not .ps1):**
```
✗ scripts/download-dyslexia-fonts.ps1
✗   Wrong extension for scripts/ - expected: .js, .mjs, .ts
```

**Fix:** PowerShell scripts are valid but flagged. Consider moving to `scripts/platform/` or updating validation rules to allow `.ps1`.

**Tests (should be .test.ts/.spec.ts, not plain .ts/.tsx):**
```
✗ __tests__/TestProviders.tsx
✗   Wrong extension for __tests__/ - expected: .test.ts, .test.tsx, .spec.ts, .spec.tsx
```

**Fix:** Rename to `TestProviders.test.tsx` or move to `__tests__/helpers/` if it's a utility (then update rules to allow helpers).

#### 3. Deprecated Folders

```
⚠ Deprecated folder found: security/
💡   Move contents to appropriate location and remove folder
```

**Fix:**
1. Review contents of `security/` folder
2. Move files to `services/security/` if they're service logic
3. Move to `utils/security/` if they're helper functions
4. Remove empty `security/` folder
5. Update all import paths referencing old location

**Check for imports:**
```bash
# Find all imports from deprecated folder
npm run --silent grep:search -- "from ['\"].*security/" --isRegexp
```

#### 4. Temporary Files

```
⚠ Temporary file in root: tsc_errors.txt
💡   Add to .gitignore or move to docs/
```

**Fix (Recommended):** Delete temporary files:
```bash
# PowerShell
Remove-Item tsc_*.txt, i18n-*.csv, temp-*.txt

# Bash
rm tsc_*.txt i18n-*.csv temp-*.txt
```

These files are now in `.gitignore` and won't be committed in the future.

#### 5. Root Clutter

```
⚠ Unexpected file in root: COMMIT_MSG.txt
```

**Fix:**
- **Documentation files** (*.md): Keep README, CHANGELOG, LICENSE. Move others to `docs/`
- **Build artifacts**: Delete or add to `.gitignore`
- **Temp files**: Delete

---

## Pre-commit Integration

### How It Works

The pre-commit hook (`opt-in` by default):

```bash
if [ "$VALIDATE_STRUCTURE" = "1" ]; then
  echo "→ Validating folder structure"
  npm run --silent validate:structure || {
    echo "⚠ Structure validation failed (not blocking commit)"
    echo "  Run 'npm run validate:structure' to see details"
  }
fi
```

### Enabling Structure Validation

**Option 1: Per-commit basis**
```bash
VALIDATE_STRUCTURE=1 git commit -m "refactor: clean up folder structure"
```

**Option 2: Always enabled (session)**
```bash
# PowerShell
$env:VALIDATE_STRUCTURE=1

# Bash/Zsh
export VALIDATE_STRUCTURE=1
```

**Option 3: Always enabled (permanent)**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, or PowerShell profile):
```bash
export VALIDATE_STRUCTURE=1
```

### Emergency Bypass

If validation is blocking progress and you need to commit urgently:

```bash
SKIP_HOOKS=1 git commit -m "emergency: bypass all hooks"
```

⚠️ **Use sparingly!** This skips ALL pre-commit checks (lint, format, etc.)

---

## CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/validate-structure.yml`

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**What it does:**
1. Checks out code
2. Installs dependencies
3. Runs structure validation with `--report`
4. Uploads report as artifact (30-day retention)
5. Comments on PR if validation fails

### PR Comment Example

When validation fails, the workflow posts:

```markdown
## 🔍 Structure Validation Failed

Found **110 issues** in the codebase structure:
- ❌ Naming violations: 31
- ⚠️ Deprecated folders: 1
- ⚠️ Temporary files: 14

### Action Required
1. Review the validation report artifact
2. Fix naming conventions to match project standards
3. Remove deprecated folders and temporary files

See [RECOMMENDED_STRUCTURE.md](docs/RECOMMENDED_STRUCTURE.md) for details.
```

### Downloading Reports

1. Go to the failed workflow run in GitHub Actions
2. Scroll to "Artifacts" section
3. Download `structure-validation-report`
4. Extract `structure-report.json`

---

## Common Issues & Fixes

### Issue 1: Platform-Specific Files Flagged

**Example:**
```
✗ components/MapEmbed.web.tsx
✗   Naming violation in components/ - expected: PascalCase.tsx
```

**Cause:** React Native platform-specific files use `.ios.tsx`, `.android.tsx`, `.web.tsx` suffixes.

**Fix Options:**
1. **Keep as-is**: These are valid React Native conventions. Consider updating validation rules to allow platform suffixes.
2. **Rename**: Use `MapEmbedWeb.tsx` instead of `MapEmbed.web.tsx` (loses automatic platform selection).

**Recommended:** Update `scripts/validate-structure.mjs` to allow platform suffixes:
```javascript
// In RULES configuration, update components pattern:
pattern: /^[A-Z][a-zA-Z0-9]*(\.(ios|android|web|native))?(\.tsx)$/
```

### Issue 2: Test Helper Files Flagged

**Example:**
```
✗ __tests__/TestProviders.tsx
✗   Wrong extension for __tests__/ - expected: .test.ts, .test.tsx, .spec.ts, .spec.tsx
```

**Cause:** Test utilities and mocks don't end in `.test.ts`.

**Fix Options:**
1. **Move to helpers**: Create `__tests__/helpers/` and exempt from strict naming.
2. **Rename**: `TestProviders.test.tsx` (not ideal for a utility).

**Recommended:** Update validation rules to allow `__tests__/helpers/` and `__tests__/mocks/`:
```javascript
// Add to RULES array:
{
  path: '__tests__/helpers',
  pattern: /^[A-Z][a-zA-Z0-9]*(\.tsx?)$/,
  description: 'Test helpers: PascalCase.ts/tsx',
  allowedExtensions: ['.ts', '.tsx']
},
{
  path: '__tests__/mocks',
  pattern: /^[a-z][a-zA-Z0-9]*(\.mock)(\.ts|\.tsx)$/,
  description: 'Test mocks: camelCase.mock.ts/tsx',
  allowedExtensions: ['.ts', '.tsx']
}
```

### Issue 3: Type Definition Files Flagged

**Example:**
```
✗ types/expo-file-system-augmentation.d.ts
✗   Naming violation in types/ - expected: PascalCase.ts or camelCase.ts
```

**Cause:** Module augmentation files often use kebab-case to match package names.

**Fix Options:**
1. **Rename to PascalCase**: `ExpoFileSystemAugmentation.d.ts`
2. **Update rules**: Allow kebab-case for `.d.ts` files

**Recommended:** Update `types/` rule to allow kebab-case for `.d.ts`:
```javascript
{
  path: 'types',
  pattern: /^([A-Z][a-zA-Z0-9]*|[a-z][a-zA-Z0-9]*|[a-z][a-z0-9-]*)(\.d\.ts|\.ts)$/,
  description: 'Type definitions: PascalCase.ts, camelCase.ts, or kebab-case.d.ts',
  allowedExtensions: ['.ts', '.d.ts']
}
```

### Issue 4: PowerShell Scripts Flagged

**Example:**
```
✗ scripts/download-dyslexia-fonts.ps1
✗   Wrong extension for scripts/ - expected: .js, .mjs, .ts
```

**Cause:** Validation only allows Node.js scripts by default.

**Fix Options:**
1. **Rewrite in Node.js**: Convert `.ps1` to `.mjs`
2. **Move to subfolder**: `scripts/platform/download-dyslexia-fonts.ps1`
3. **Update rules**: Allow `.ps1` extension

**Recommended:** Allow PowerShell/Bash scripts:
```javascript
{
  path: 'scripts',
  pattern: /^[a-z][a-z0-9-]*\.(js|mjs|ts|ps1|sh)$/,
  description: 'Scripts: kebab-case.js/mjs/ts/ps1/sh',
  allowedExtensions: ['.js', '.mjs', '.ts', '.ps1', '.sh']
}
```

### Issue 5: Service Files with Dots

**Example:**
```
✗ services/notifications.dispatcher.ts
✗   Naming violation in services/ - expected: camelCase.ts
```

**Cause:** Validation pattern doesn't allow dots in filenames.

**Fix:**
Rename to `notificationsDispatcher.ts` (camelCase):
```bash
# PowerShell
Rename-Item services/notifications.dispatcher.ts notificationsDispatcher.ts
Rename-Item services/notifications.templates.ts notificationsTemplates.ts
Rename-Item services/accountability.tracker.ts accountabilityTracker.ts
```

Then update all imports:
```bash
# Find all references
npm run --silent grep:search -- "notifications\.dispatcher"
```

---

## Customizing Rules

### Modifying Validation Rules

**File:** `scripts/validate-structure.mjs`

**Key sections to customize:**

#### 1. Folder Rules (`RULES` array)

```javascript
const RULES = [
  {
    path: 'components',
    pattern: /^[A-Z][a-zA-Z0-9]*\.tsx$/,  // Update regex here
    description: 'Components: PascalCase.tsx',
    allowedExtensions: ['.tsx']  // Add more extensions if needed
  },
  // ... add more rules
];
```

#### 2. Ignored Paths (`IGNORED_PATHS` array)

```javascript
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  '.expo',
  'dist',
  'web-build',
  // Add more paths to skip
];
```

#### 3. Deprecated Folders (`DEPRECATED_FOLDERS` array)

```javascript
const DEPRECATED_FOLDERS = [
  'security',  // Remove if security/ is still used
  // Add more deprecated folders
];
```

#### 4. Allowed Root Files (`ALLOWED_ROOT_FILES` Set)

```javascript
const ALLOWED_ROOT_FILES = new Set([
  'package.json',
  'tsconfig.json',
  'README.md',
  'CHANGELOG.md',
  'LICENSE',
  // Add more allowed root files
]);
```

### Testing Rule Changes

After modifying rules:

1. **Run validation:**
   ```bash
   npm run validate:structure
   ```

2. **Check specific folder:**
   ```bash
   npm run validate:structure:verbose | grep "components"
   ```

3. **Generate report:**
   ```bash
   npm run validate:structure:report
   cat structure-report.json | jq '.issues[] | select(.file | contains("components"))'
   ```

### Contributing Rule Updates

If you update validation rules to fix false positives:

1. Document the change in this guide
2. Update `docs/RECOMMENDED_STRUCTURE.md` if conventions changed
3. Run full validation to ensure no regressions
4. Commit with clear description:
   ```bash
   git commit -m "chore: allow platform-specific file suffixes in validation"
   ```

---

## Advanced Usage

### JSON Report Schema

The `structure-report.json` file contains:

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "summary": {
    "totalFiles": 7913,
    "validFiles": 7882,
    "issuesFound": 110
  },
  "issues": [
    {
      "file": "components/MapEmbed.web.tsx",
      "type": "naming",
      "folder": "components",
      "expected": "PascalCase.tsx",
      "suggestion": "Rename to follow PascalCase convention"
    }
  ],
  "deprecatedFolders": ["security"],
  "temporaryFiles": ["tsc_errors.txt", "temp-fix.txt"]
}
```

### Automated Metrics Tracking

You can track structure quality over time:

```bash
# Run weekly structure check and log results
npm run validate:structure:report
echo "$(date) - Issues: $(jq '.summary.issuesFound' structure-report.json)" >> structure-metrics.log
```

### Pre-push Hook (Strict Enforcement)

To make validation mandatory before pushing:

**`.husky/pre-push`:**
```bash
#!/usr/bin/env sh
echo "→ Validating folder structure (strict mode)"
npm run --silent validate:structure || {
  echo "❌ Structure validation failed. Fix issues before pushing."
  exit 1
}
```

⚠️ **Warning:** This will block all pushes until issues are fixed. Use with caution.

---

## Troubleshooting

### Validation Script Won't Run

**Error:** `Cannot find module './scripts/validate-structure.mjs'`

**Fix:**
```bash
# Verify file exists
ls scripts/validate-structure.mjs

# If missing, restore from repository
git checkout main -- scripts/validate-structure.mjs
```

### False Positives

**Issue:** Valid files are flagged as violations.

**Temporary workaround:**
Add file/folder to `IGNORED_PATHS` in `scripts/validate-structure.mjs`:

```javascript
const IGNORED_PATHS = [
  'node_modules',
  '.git',
  'components/ui',  // Ignore specific folder
];
```

**Permanent fix:** Update validation rules to accommodate the pattern (see [Customizing Rules](#customizing-rules)).

### Performance Issues

**Issue:** Validation takes too long on large codebases.

**Optimization:**
1. Increase `IGNORED_PATHS` to skip large folders:
   ```javascript
   const IGNORED_PATHS = [
     'node_modules',
     '.git',
     '.expo',
     'dist',
     'web-build',
     'coverage',  // Skip coverage reports
     '.next',     // Skip build caches
   ];
   ```

2. Run validation on specific folders only:
   ```javascript
   // Modify walkDir call to target specific path
   walkDir('./components');
   walkDir('./services');
   ```

---

## Resources

- **Recommended Structure:** [docs/RECOMMENDED_STRUCTURE.md](./RECOMMENDED_STRUCTURE.md)
- **Validation Script:** [scripts/validate-structure.mjs](../scripts/validate-structure.mjs)
- **CI Workflow:** [.github/workflows/validate-structure.yml](../.github/workflows/validate-structure.yml)
- **Project README:** [README.md](../README.md)

---

## Support

If you encounter issues with the validation system:

1. Check this guide for common solutions
2. Review `structure-report.json` for detailed issue breakdown
3. Update validation rules if you find false positives
4. Document changes in this guide for future reference

For questions about project structure standards, see [RECOMMENDED_STRUCTURE.md](./RECOMMENDED_STRUCTURE.md).
