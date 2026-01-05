# 🧪 Quick Audit Commands Reference

## Essential Commands

| Command | Purpose | Time | Frequency |
|---------|---------|------|-----------|
| `npm run audit:quick` | Fast check (lint + types + tests) | 2-3 min | Before commit |
| `npm run audit:full` | Complete audit (all tools) | 10-15 min | Before release |
| `npm run lint` | Code quality check | 30 sec | Real-time |
| `npm run typecheck:strict` | Type validation | 1 min | Before PR |
| `npm test` | Unit/integration tests | 1-2 min | Continuous |
| `npx expo-doctor` | Expo configuration check | 30 sec | Setup validation |

---

## Testing Suites (780+ Tests)

### By Category
```bash
npm test                          # All tests
npm test:watch                    # Watch mode (development)
npm test:debug                    # Debug mode (detailed output)
npm test:stress                   # Performance stress tests
npm test:wcag                     # Accessibility tests
npm test:all                      # All with verbose output
```

### Specific Areas
```bash
npm test -- __tests__/accessibility.test.ts
npm test -- __tests__/analytics.test.ts
npm test -- __tests__/i18n.test.ts
```

---

## Code Quality Tools

```bash
npm run lint                      # ESLint (code standards)
npm run typecheck:strict          # TypeScript strict mode
npm run check:analytics           # Analytics validation
npm run scan:incomplete:soft      # TODO/incomplete code
npm run check:tabs:names          # Route name validation
npm run validate:structure        # Project structure check
```

---

## Accessibility & Performance

```bash
npm run a11y:scan                 # WCAG AA compliance
npm run wcag:aaa                  # WCAG AAA deep audit
npm run wcag:aaa:json             # WCAG report (JSON)
npm run perf:budget               # Bundle size check
npm run perf:breakdown            # Bundle analysis
npm run perf:max-file             # Largest files
npm run read:level                # Reading level check
```

---

## Localization (i18n)

```bash
npm run i18n:validate             # JSON validation
npm run i18n:test                 # Full i18n test suite
npm run i18n:coverage             # Translation coverage
npm run i18n:report               # Missing translations
npm run i18n:diff                 # Baseline comparison
```

---

## Security & Configuration

```bash
npm run security:validate         # Security best practices
npm run security:test             # Security test suite
npm run security:all              # Full security audit
npm run byoc:validate             # Private cloud check
npm run web:validate              # Web platform check
```

---

## Continuous Integration

```bash
npm run audit:ci                  # CI-optimized audit
npm run test:ci                   # CI test runner
npm run lint:ci                   # Zero-warnings mode
```

---

## 📊 What Gets Tested

✅ **780+ Unit/Integration Tests**
- Component rendering
- Hook functionality
- Service logic
- Data transformations
- Accessibility features

✅ **Static Analysis**
- ESLint (code quality)
- TypeScript (type safety)
- Structure validation

✅ **Accessibility (WCAG 2.2)**
- Color contrast
- Keyboard navigation
- Screen reader support
- Text alternatives
- Semantic HTML

✅ **Internationalization**
- JSON syntax
- Key completeness
- Plural forms
- Placeholder consistency

✅ **Performance**
- Bundle size
- File size limits
- Performance budgets

✅ **Security**
- OWASP Top 10
- Encryption validation
- Secure storage
- API security

---

## 🎯 Typical Workflows

### Before Committing
```bash
npm run audit:quick
```

### Before Pull Request
```bash
npm run lint && npm test && npm run typecheck:strict
```

### Before Release
```bash
npm run audit:full
```

### Debugging Test Failures
```bash
npm test:debug
npm test:watch
npm run test:stress
```

### Checking Specific Feature
```bash
npm run wcag:aaa           # Accessibility
npm run check:analytics    # Analytics
npm run i18n:test          # Localization
npm run security:all       # Security
```

---

## ⚡ Performance Tips

- **First run**: 2-3 minutes (cache warming)
- **Cache hit**: 1-2 minutes after
- **Watch mode**: Instant feedback during development
- **Parallel testing**: Jest uses all CPU cores automatically

---

## 📁 Output Files

- `audit-report.json` - Comprehensive audit results
- `wcag-aaa-report.json` - Accessibility detailed report
- `audit-ci.log` - CI pipeline logs
- Various `.log` files in root directory

---

## 🔗 Full Guide

See `TESTING_GUIDE.md` for:
- Detailed tool descriptions
- Setup instructions
- Troubleshooting
- Advanced options
- Integration patterns

---

**Status**: ✅ All systems ready
**Tests**: 780+ passing
**Linting**: Clean
**Type Safety**: Strict mode enabled
**A11y**: WCAG 2.2 AAA compliant
