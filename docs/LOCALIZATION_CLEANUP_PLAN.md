# Localization Cleanup Plan

## Goals
Ensure all user-facing strings are localized, consistent, and maintainable while removing dead keys and standardizing interpolation patterns.

## Current State (Assumptions)
- Primary locale: `en/common.json`
- Extraction CSVs: `i18n-extract.csv`, `i18n-untranslated.csv`
- Mixed usage of `t('key')` and possible inline literals
- Some placeholder `[T]` markers indicating pending localization

## Objectives (Phase 1)
1. Detect and list all `[T]` placeholders remaining in repo
2. Identify untranslated keys across non-English locales (if locales exist) — else prepare scaffolds
3. Remove unused keys from `en/common.json`
4. Enforce conventions: lowercase dot-separated keys, no dynamic key concatenation
5. Introduce interpolation guard (fail build if string has `{` without valid interpolation token)

## Key Scripts
### 1. Placeholder Scanner (`scripts/i18n-scan-placeholders.ts`)
- Regex search for `\[T\]` and output file:line summary
- Exit non-zero if any found (configurable `--fail-on >0`)

### 2. Unused Key Detector (`scripts/i18n-unused-keys.ts`)
- Load `en/common.json` keys
- Grep codebase for each key usage (simple substring + refined regex to reduce false positives)
- Output `unused-keys.json`; optionally auto-prune with `--apply`

### 3. Interpolation Validator (`scripts/i18n-validate-interpolation.ts`)
- Detect any `{` or `}` in translation values not part of `{{token}}` style
- Report offending keys

## Conventions
| Aspect | Rule |
|--------|------|
| Key format | `section.feature.action` (3+ segments) |
| Variables | `{{camelCase}}` |
| Plurals | Use ICU style keys: `key_one`, `key_other` or adopt `i18next` plural forms |
| Comments | Developer notes in JSON using `_comment` prefix siblings |

## Migration Steps
1. Implement and run placeholder scanner; replace `[T]` with proper keys
2. Generate unused key list; manually verify before pruning
3. Add interpolation validator to CI (`npm run i18n:lint`)
4. Normalize any uppercase or snake_case keys
5. Document guidelines in `README.md` i18n section

## Proposed Scripts Additions
Add to `package.json`:
```json
{
  "i18n:placeholders": "ts-node scripts/i18n-scan-placeholders.ts",
  "i18n:unused": "ts-node scripts/i18n-unused-keys.ts",
  "i18n:lint": "ts-node scripts/i18n-validate-interpolation.ts"
}
```

## Data Outputs
| File | Purpose |
|------|---------|
| `i18n-placeholders.json` | Remaining placeholder instances |
| `unused-keys.json` | Keys safe to delete (pending review) |
| `i18n-interpolation-issues.json` | Invalid interpolation patterns |

## Acceptance Criteria (Phase 1)
- Zero `[T]` placeholders
- `unused-keys.json` generated and ≤10% keys flagged (or justified)
- Interpolation validator passes cleanly
- Scripts documented and added to `README.md`

## Future Enhancements
- Translation memory diffing per commit
- CLI to auto-insert new keys with stub values in other locales
- Crowdsourced translation contribution workflow

---
Prepared: 2025-09-22
