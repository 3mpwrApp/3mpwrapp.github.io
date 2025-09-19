# Translation Guide

This guide explains how to add or update translations, handle placeholders, pluralization, and maintain quality gates enforced by CI.

## Directory Layout
```
locales/
  en/common.json  (source of truth)
  es/common.json  (Spanish)
  fr/common.json  (French)
```

## Key Principles
- English `common.json` is the authoritative key set.
- Non‑English locales must contain every key (tooling can auto‑fill missing with English fallback).
- Never delete a key from non‑English locales unless also removed from English.
- Keep JSON strictly valid (no comments, trailing commas, or duplicate keys).

## Placeholders
Placeholders use `{{name}}` syntax. Examples:
```
"progress": "Progress: {{done}} / {{total}} ({{pct}}%)"
"provinceChip": "Province {{code}}"
```
Rules:
- Preserve placeholder names exactly.
- Reorder if needed for grammar, but keep all occurrences.
- Do not translate placeholder identifiers.

## Pluralization
Plural keys are stored using a base plus `.one` / `.other` suffix.
Example (demo):
```
"demoPlural": {
  "item": {
    "one": "{{count}} item",
    "other": "{{count}} items"
  }
}
```
Usage in code:
```ts
const { tCount } = useTranslation();
const label = tCount('demoPlural.item', itemCount);
```
Guidelines:
- Always provide both `.one` and `.other` forms.
- Both forms must include `{{count}}` (even if grammar allows omission) so tooling can validate.
- For languages with more than 2 plural categories we currently map to: count === 1 -> `.one`, everything else -> `.other`. (Future enhancement may add ICU‑style categories.)

## Untranslated / Tagging Workflow
When new English keys are added:
1. Run `npm run i18n:diff` to list missing keys.
2. Run `npm run i18n:fill` to copy English placeholders into other locales (non‑destructive; skips existing keys).
3. Optional: Mark still‑pending translations by adding `[T]` prefix to the value. Example: `[T]Some text`.
4. Badge Mode: Set `EXPO_PUBLIC_I18N_BADGE=1` to show a ◀ marker after any `[T]` string at runtime.
5. After translating, remove the `[T]` tag or run `npm run i18n:strip`.

## Quality Scripts
| Command | Purpose |
|---------|---------|
| `npm run i18n:diff` | Lists missing keys per locale. |
| `npm run i18n:fill` | Fills missing keys with English fallback. |
| `npm run i18n:untranslated` | Lists keys identical to English (still untranslated). |
| `npm run i18n:export` | Exports untranslated keys to CSV. |
| `npm run i18n:export:open` | Export + auto open (desktop). |
| `npm run i18n:tag` | Prefix identical translations with `[T]`. |
| `npm run i18n:strip` | Remove `[T]` prefixes. |
| `npm run i18n:tag:check` | Fails if any `[T]` tags remain (ensure clean before release). |
| `npm run i18n:plural` | Validates plural pairs (.one/.other + {{count}}). |
| `npm run i18n:threshold` | Enforces untranslated ceiling (configured in script). |
| `npm run i18n:assert` | Aggregate release gate (no missing, no tags, below threshold). |
| `npm run i18n:test` | Runs diff + plural + threshold + assert. |
| `npm run i18n:progress` | Shows delta in coverage over last snapshot. |

## Adding a New Key
1. Add to `en/common.json`.
2. Run `npm run i18n:fill`.
3. Translate in each locale; tag temporarily with `[T]` if not ready.
4. Run `npm run i18n:test` before committing.

## Adding a New Locale
1. Duplicate `en/common.json` into `locales/<lang>/common.json`.
2. Replace values progressively (can tag with `[T]`).
3. Add the language code to `Lang` union and dictionaries in `i18n/index.tsx` (also handle detection logic).
4. Run all i18n scripts; ensure CI passes.

## Common Pitfalls
- Trailing commas cause JSON parse errors: validate before commit.
- Forgetting `{{count}}` in one plural form => plural check failure.
- Leaving `[T]` tags before release => CI failure (tag check / assert).
- Copying English text for legal/medical concepts without qualified review in target language.

## Reviewer Checklist
- Keys present in all locales.
- No runtime placeholders removed.
- Plural pairs complete and include `{{count}}`.
- No stray `[T]` tags for production merges.
- `npm run i18n:test` passes locally.

## Future Enhancements (Roadmap)
- ICU plural categories for Slavic / Arabic languages.
- Extraction script to pull keys referenced in code automatically.
- Screenshot-based context for translators.

---
Questions or improvements? Open an issue or add a note to this guide.
