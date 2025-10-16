# GitHub Actions Quick Reference

## 🚀 Common Commands

### Manual Workflow Triggers
```bash
# Trigger CI manually
gh workflow run ci-consolidated.yml

# Build for Android
gh workflow run eas-build.yml -f platform=android -f profile=preview

# Create a release
gh workflow run release.yml -f version=minor

# Run security scan
gh workflow run security.yml

# Run performance checks
gh workflow run performance.yml
```

### Check Workflow Status
```bash
# List all workflows
gh workflow list

# View recent runs
gh run list --limit 10

# View specific run
gh run view <run-id>

# Watch a workflow run
gh run watch
```

### Debugging Workflows
```bash
# Download workflow logs
gh run download <run-id>

# View workflow YAML
gh workflow view ci-consolidated.yml

# Re-run failed jobs
gh run rerun <run-id> --failed
```

---

## 📋 Workflow Cheat Sheet

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **ci-consolidated.yml** | PR, Push to main | Lint, test, quality checks | ~8 min |
| **i18n-consolidated.yml** | PR (locale files) | i18n validation | ~4 min |
| **whatsnew-auto.yml** | Daily cron, CHANGELOG change | Generate What's New | ~2 min |
| **security.yml** | Weekly, PR, Push | Security scanning | ~15 min |
| **eas-build.yml** | Manual | Build Android/iOS app | ~30-60 min |
| **release.yml** | Manual, Push to main | Create release | ~5 min |
| **pr-labeler.yml** | PR opened/updated | Auto-label PR | ~1 min |
| **stale.yml** | Daily cron | Close stale issues | ~3 min |
| **performance.yml** | PR, Push | Bundle size check | ~5 min |

---

## 🔍 What Each Workflow Does

### ci-consolidated.yml
**When it runs:** Every PR and push to main  
**What it checks:**
- ✅ ESLint passes
- ✅ TypeScript compiles
- ✅ Jest tests pass
- ✅ Test coverage meets threshold
- ✅ Accessibility scan passes
- ✅ Analytics imports correct
- ✅ Performance budget met
- ✅ Expo Doctor validation

**How to fix failures:**
```bash
# Locally run all checks
npm run lint:ci
npm run typecheck:strict
npm test -- --coverage
npm run a11y:scan
npm run check:analytics
npm run perf:budget
```

---

### i18n-consolidated.yml
**When it runs:** PR changes to `locales/` or `i18n/`  
**What it checks:**
- ✅ JSON files valid
- ✅ All locales have same keys
- ✅ Plural keys formatted correctly
- ✅ Untranslated count under threshold
- ✅ No orphan/missing keys
- ✅ No [T] placeholder tags (release gate)

**How to fix failures:**
```bash
# Locally run all i18n checks
npm run i18n:validate
npm run i18n:diff
npm run i18n:plural
npm run i18n:threshold
npm run i18n:orphans
npm run i18n:assert
```

---

### whatsnew-auto.yml
**When it runs:** Daily at 6:10 AM UTC, or when CHANGELOG.md changes  
**What it does:**
- Parses `docs/CHANGELOG.md`
- Generates `data/whatsnew.auto.ts`
- Creates PR with changes

**How to run manually:**
```bash
npm run whatsnew:gen
```

---

### security.yml
**When it runs:** Weekly Monday 9 AM, every PR, push to main  
**What it checks:**
- 🔍 CodeQL static analysis
- 🔑 Secret scanning (gitleaks)
- 📦 Dependency vulnerabilities (npm audit)
- ⚖️ License compliance (no GPL/AGPL)
- 🔒 Security config validation

**How to fix failures:**
```bash
# Check for secrets locally
git secrets --scan

# Audit dependencies
npm audit --audit-level=high

# Run security validation
npm run security:validate
npm run security:test
```

---

### eas-build.yml
**When it runs:** Manual trigger only  
**What it does:**
- Builds Android/iOS app with EAS
- Optionally submits to store

**How to use:**
```bash
# Preview build for Android
gh workflow run eas-build.yml \
  -f platform=android \
  -f profile=preview \
  -f submit=false

# Production build with submission
gh workflow run eas-build.yml \
  -f platform=all \
  -f profile=production \
  -f submit=true
```

**Requirements:**
- `EXPO_TOKEN` secret must be set
- EAS account must be configured
- App credentials must be set up

---

### release.yml
**When it runs:** Manual trigger, or auto on main push  
**What it does:**
1. Bumps version (patch/minor/major)
2. Updates CHANGELOG.md
3. Commits changes
4. Creates git tag
5. Creates GitHub release

**How to use:**
```bash
# Manual release
gh workflow run release.yml -f version=minor

# Or commit with conventional format
git commit -m "feat: new feature"  # → minor bump
git commit -m "fix: bug fix"       # → patch bump
git commit -m "feat!: breaking"    # → major bump
```

---

### pr-labeler.yml
**When it runs:** PR opened, synchronized, reopened  
**What it does:**
- Reads `.github/labeler.yml` rules
- Applies labels based on files changed
- Updates labels on PR sync

**Labels applied:**
- `frontend` - UI changes
- `backend` - Server/API changes
- `testing` - Test changes
- `ci/cd` - Workflow changes
- `documentation` - Docs changes
- `dependencies` - Package changes
- `i18n` - Locale changes
- `security` - Security changes
- `feature` - New features
- `bug` - Bug fixes

---

### stale.yml
**When it runs:** Daily at 1 AM UTC  
**What it does:**
- Marks issues stale after 60 days
- Closes stale issues after 7 more days
- Marks PRs stale after 30 days
- Closes stale PRs after 14 more days
- Exempts pinned/security/critical labels

**How to prevent:**
- Comment on issue/PR to reset timer
- Add exempt label (`pinned`, `security`, `critical`, etc.)

---

### performance.yml
**When it runs:** Every PR and push to main  
**What it checks:**
- 📦 Bundle size under budget
- 📊 Bundle breakdown analysis
- 📄 Max file size check
- 📚 Content reading level

**How to fix failures:**
```bash
# Check bundle locally
npm run perf:budget
npm run perf:breakdown
npm run perf:max-file

# Check reading level
npm run read:level
```

---

## 🛠️ Troubleshooting

### "Workflow not found"
**Cause:** Workflow doesn't exist on target branch  
**Fix:** Ensure workflow is committed to `main` branch

### "Resource not accessible"
**Cause:** Missing or insufficient permissions  
**Fix:** Check `permissions:` block in workflow YAML

### "Secret not found: EXPO_TOKEN"
**Cause:** Secret not set in repository  
**Fix:** Add secret in Settings → Secrets → Actions

### "Action not found"
**Cause:** Invalid SHA or action path  
**Fix:** Verify action exists on GitHub

### "Workflow still using old version"
**Cause:** GitHub caches workflow files  
**Fix:** Push to main, wait 5 minutes, or re-run

### "Concurrency not canceling"
**Cause:** Group name incorrect or missing  
**Fix:** Verify `concurrency.group` is unique per PR

---

## 📊 Monitoring Workflows

### GitHub UI
1. Go to **Actions** tab
2. Select workflow from left sidebar
3. View recent runs, durations, success rates

### CLI
```bash
# View workflow summary
gh workflow view ci-consolidated.yml

# List recent runs
gh run list --workflow=ci-consolidated.yml --limit=20

# View specific run details
gh run view <run-id> --log

# Download run logs
gh run download <run-id>
```

### Metrics to Watch
- ⏱️ **Duration:** Should stay under timeout (10-60 min)
- ✅ **Success rate:** Should be >90%
- 🔄 **Concurrency:** Old runs should cancel
- 💰 **Cost:** Should stay under 2,000 min/month (free tier)

---

## 🎯 Best Practices

### For Contributors
1. ✅ **Run checks locally** before pushing
2. ✅ **Use conventional commits** for auto-versioning
3. ✅ **Wait for CI** before requesting review
4. ✅ **Fix failures quickly** to unblock others

### For Maintainers
1. ✅ **Review workflow runs** weekly
2. ✅ **Update action SHAs** quarterly
3. ✅ **Monitor costs** in billing dashboard
4. ✅ **Adjust timeouts** based on real usage

### For Everyone
1. ✅ **Use `[skip ci]`** for docs-only commits
2. ✅ **Test locally** before pushing
3. ✅ **Read error logs** before asking for help
4. ✅ **Keep workflows fast** to improve DX

---

## 🔗 Useful Links

- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Workflow Syntax:** https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions
- **Expo EAS:** https://docs.expo.dev/eas/
- **Security Best Practices:** https://docs.github.com/en/actions/security-guides
- **GitHub CLI:** https://cli.github.com/manual/

---

## 📞 Need Help?

1. Check workflow logs in GitHub Actions tab
2. Read detailed analysis in `WORKFLOWS_ANALYSIS.md`
3. Follow migration guide in `WORKFLOWS_MIGRATION.md`
4. Review summary in `WORKFLOWS_SUMMARY.md`
5. Ask in team chat or create an issue

---

*Quick reference updated: October 15, 2025*
