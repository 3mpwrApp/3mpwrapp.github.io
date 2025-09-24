---
name: Unfinished Work Checklist
about: Track and resolve unfinished areas surfaced by scans and docs
labels: enhancement, tech-debt
---

## Summary
Describe the scope of cleanup or completion.

## Checklist
- [ ] Tests: Re-implement `LetterActionsBar` tests after RN testing update
- [ ] Tests: Remove or merge deprecated `__tests__/i18n.test.ts`
- [ ] i18n: Translate keys listed in `i18n-untranslated.csv`
- [ ] i18n: Remove `[T]` placeholders from locales
- [ ] i18n: Implement or remove `scripts/i18n-scan-placeholders.ts` per docs
- [ ] Notifications: Resolve `tpl.i18n.*` using `t()` at dispatch time
- [ ] Data: Deprecate `data/faqs.ts` after `scripts/seed-faqs.js` is validated
- [ ] Data: Replace Nunavut placeholder links in `data/resources.js`
- [ ] Events: Replace "TBD" fallbacks by ensuring event `location` coverage or copy
- [ ] Server: Replace or remove analyzer stub in `server/index.js`
- [ ] Accessibility: Implement audit runner per `docs/ACCESSIBILITY_AUDIT_SETUP.md`
- [ ] CI: Ensure `npm run scan:incomplete` runs and is green
- [ ] Governance: Decide evidence retention policy (docs/DATA_GOVERNANCE.md)
- [ ] Cleanup: Husky deprecated files under `.husky/_/` if unused

## Notes
Link PRs, translations, and decisions here.
