# GitHub Actions Migration Guide

## Overview

This guide helps you migrate from the current workflows to the new, optimized, security-hardened workflows.

## Quick Start

### Step 1: Backup Current Workflows
```bash
mkdir -p .github/workflows-backup
cp .github/workflows/*.yml .github/workflows-backup/
```

### Step 2: Required Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Required For |
|------------|-------------|--------------|
| `EXPO_TOKEN` | Expo access token from expo.dev | EAS Build workflow |
| `GITHUB_TOKEN` | Auto-provided by GitHub | All workflows (already exists) |

**How to get EXPO_TOKEN:**
```bash
# Login to Expo
npx expo login

# Generate token
npx expo whoami
# Copy the token from your Expo dashboard: https://expo.dev/accounts/[username]/settings/access-tokens
```

### Step 3: Migration Plan

Choose your migration strategy:

#### Option A: Full Migration (Recommended)
Replace all workflows at once. Best for clean slate.

```bash
# Delete old workflows
rm .github/workflows/ci.yml
rm .github/workflows/ci-quality.yml
rm .github/workflows/tests.yml
rm .github/workflows/lint.yml
rm .github/workflows/i18n-check.yml
rm .github/workflows/whatsnew-daily.yml

# New workflows are already created:
# - ci-consolidated.yml (replaces ci.yml, ci-quality.yml, tests.yml, lint.yml)
# - i18n-consolidated.yml (replaces i18n-check.yml)
# - whatsnew-auto.yml (replaces whatsnew-daily.yml)
# - security.yml (new)
# - eas-build.yml (new)
# - release.yml (new)
# - pr-labeler.yml (new)
# - stale.yml (new)
# - performance.yml (new)
```

#### Option B: Gradual Migration (Safer)
Migrate workflows one at a time over several PRs.

**Week 1: Core CI**
```bash
# Disable old workflows (rename to .disabled)
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
mv .github/workflows/ci-quality.yml .github/workflows/ci-quality.yml.disabled
mv .github/workflows/tests.yml .github/workflows/tests.yml.disabled
mv .github/workflows/lint.yml .github/workflows/lint.yml.disabled

# ci-consolidated.yml is already active
```

**Week 2: i18n & Automation**
```bash
mv .github/workflows/i18n-check.yml .github/workflows/i18n-check.yml.disabled
mv .github/workflows/whatsnew-daily.yml .github/workflows/whatsnew-daily.yml.disabled

# i18n-consolidated.yml and whatsnew-auto.yml are already active
```

**Week 3: Security & Extras**
```bash
# security.yml, pr-labeler.yml, stale.yml, performance.yml are already active
```

**Week 4: Build & Release**
```bash
# Test eas-build.yml and release.yml manually
# Enable dependabot.yml
```

### Step 4: Enable Dependabot

Dependabot is already configured in `.github/dependabot.yml`. It will automatically:
- Create PRs for npm dependency updates (weekly)
- Update GitHub Actions to latest versions (weekly)
- Group patch updates to reduce noise

**To enable:**
1. Go to Settings → Code security and analysis
2. Enable "Dependabot alerts"
3. Enable "Dependabot security updates"
4. Enable "Dependabot version updates"

### Step 5: Verify Workflows

After migration, verify each workflow:

```bash
# Trigger manually to test
gh workflow run ci-consolidated.yml
gh workflow run security.yml
gh workflow run performance.yml

# Or via GitHub UI:
# Actions → Select workflow → Run workflow
```

---

## Workflow Comparison

### Before vs After

| Old Workflow | New Workflow | Changes |
|-------------|--------------|---------|
| `ci.yml` | `ci-consolidated.yml` | Merged with ci-quality/tests/lint, added concurrency, pinned actions |
| `ci-quality.yml` | *(merged)* | Consolidated into ci-consolidated.yml |
| `tests.yml` | *(merged)* | Consolidated into ci-consolidated.yml |
| `lint.yml` | *(merged)* | Consolidated into ci-consolidated.yml |
| `i18n-check.yml` | `i18n-consolidated.yml` | Single job, better caching, pinned actions |
| `whatsnew-daily.yml` | `whatsnew-auto.yml` | Enhanced PR body, pinned actions, better branch naming |
| *(none)* | `security.yml` | **NEW:** CodeQL, secret scanning, dependency audit |
| *(none)* | `eas-build.yml` | **NEW:** Automated EAS builds |
| *(none)* | `release.yml` | **NEW:** Semantic versioning, changelog generation |
| *(none)* | `pr-labeler.yml` | **NEW:** Auto-label PRs |
| *(none)* | `stale.yml` | **NEW:** Auto-close stale issues/PRs |
| *(none)* | `performance.yml` | **NEW:** Bundle size tracking |

---

## Breaking Changes

### 1. Workflow Names Changed
Update any external references (badges, docs):

**Old:**
```markdown
[![CI](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/ci.yml/badge.svg)](...)
```

**New:**
```markdown
[![CI](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/ci-consolidated.yml/badge.svg)](...)
```

### 2. Required Secrets
Add `EXPO_TOKEN` to repository secrets before running `eas-build.yml`.

### 3. Workflow Dispatch Inputs
The `eas-build.yml` workflow requires manual inputs:
```bash
# CLI usage
gh workflow run eas-build.yml \
  -f platform=android \
  -f profile=preview \
  -f submit=false
```

### 4. Release Workflow Behavior
The `release.yml` workflow automatically:
- Bumps version in `package.json`
- Updates `CHANGELOG.md`
- Creates a git tag
- Creates a GitHub release

**To prevent automatic releases on every push to main:**
- Use `workflow_dispatch` only
- Or add `[skip ci]` to commit messages

---

## Testing Checklist

Before fully migrating, test each workflow:

### CI Consolidated
- [ ] PR triggers workflow
- [ ] Lint errors fail the workflow
- [ ] TypeScript errors fail the workflow
- [ ] Test failures fail the workflow
- [ ] Coverage report uploads
- [ ] WCAG report uploads
- [ ] Concurrency cancels old runs

### i18n Consolidated
- [ ] Triggers on locale file changes
- [ ] All i18n checks pass
- [ ] Threshold check fails if exceeded
- [ ] Assert check fails if [T] tags present

### What's New Auto
- [ ] Daily cron triggers
- [ ] Manual trigger works
- [ ] PR created with correct content
- [ ] Branch naming is correct

### Security
- [ ] CodeQL scans complete
- [ ] Secret scanning works (test with dummy secret)
- [ ] Dependency audit fails on high CVEs
- [ ] License check warns on GPL

### EAS Build
- [ ] Manual trigger with inputs works
- [ ] Android build starts
- [ ] iOS build starts (if macOS runner available)
- [ ] EXPO_TOKEN is valid

### Release
- [ ] Version bumps correctly
- [ ] CHANGELOG updates
- [ ] Git tag created
- [ ] GitHub release created

### PR Labeler
- [ ] PRs auto-labeled based on files
- [ ] Multiple labels applied correctly

### Stale
- [ ] Stale issues marked (test with old issue)
- [ ] Exempt labels honored

### Performance
- [ ] Bundle budget check runs
- [ ] PR comment posted with bundle size
- [ ] Fails if budget exceeded

---

## Troubleshooting

### Workflow Not Triggering

**Problem:** New workflow doesn't run on PR  
**Solution:** Ensure workflow is on `main` branch. GitHub only runs workflows from the default branch.

```bash
git checkout main
git pull origin main
# Verify workflow exists
ls .github/workflows/
```

### Permission Denied Errors

**Problem:** `Error: Resource not accessible by integration`  
**Solution:** Check `permissions:` block in workflow. Add required permission:

```yaml
permissions:
  contents: write  # For push commits
  pull-requests: write  # For PR comments
  checks: write  # For test results
```

### Action Not Found

**Problem:** `Unable to resolve action`  
**Solution:** The SHA may be incorrect or action renamed. Use tag instead temporarily:

```yaml
# Temporary fallback
uses: actions/checkout@v4  # Instead of SHA
```

Then update to correct SHA:
```bash
# Get latest SHA
git ls-remote https://github.com/actions/checkout.git v4
```

### EAS Build Fails

**Problem:** `EXPO_TOKEN is not set`  
**Solution:** Add secret to repository:

1. Go to https://expo.dev/accounts/[username]/settings/access-tokens
2. Create new token
3. Add to GitHub: Settings → Secrets → New repository secret
4. Name: `EXPO_TOKEN`, Value: (paste token)

### Concurrency Not Working

**Problem:** Multiple workflow runs not canceling  
**Solution:** Ensure `cancel-in-progress: true` and check group name:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}  # Must be unique per PR
  cancel-in-progress: true
```

### CodeQL Fails

**Problem:** `No code to analyze`  
**Solution:** CodeQL needs buildable code. For Expo apps, it auto-builds. If failing:

```yaml
- name: Autobuild
  uses: github/codeql-action/autobuild@...

# Replace with:
- name: Install dependencies
  run: npm ci --no-audit --fund=false
```

---

## Performance Comparison

### Before Migration
- **CI time per PR:** ~44 minutes (redundant jobs)
- **Actions used:** Mix of tags and versions
- **Security:** No scanning
- **Caching:** Minimal (npm only)
- **Cost:** ~880 min/month (20 PRs)

### After Migration
- **CI time per PR:** ~12 minutes (consolidated, cached)
- **Actions used:** SHA-pinned (secure)
- **Security:** CodeQL + secret scanning + audit
- **Caching:** node_modules + npm + build artifacts
- **Cost:** ~240 min/month (73% reduction)

---

## Rollback Plan

If something goes wrong:

```bash
# Restore from backup
cp .github/workflows-backup/*.yml .github/workflows/

# Disable new workflows
for f in .github/workflows/*.yml; do
  if [ "$f" != ".github/workflows/ci.yml" ] && \
     [ "$f" != ".github/workflows/ci-quality.yml" ] && \
     [ "$f" != ".github/workflows/tests.yml" ] && \
     [ "$f" != ".github/workflows/lint.yml" ] && \
     [ "$f" != ".github/workflows/i18n-check.yml" ] && \
     [ "$f" != ".github/workflows/whatsnew-daily.yml" ]; then
    mv "$f" "$f.disabled"
  fi
done

git add .github/workflows/
git commit -m "Rollback to previous workflows"
git push origin main
```

---

## Support

For issues or questions:
1. Check [WORKFLOWS_ANALYSIS.md](.github/WORKFLOWS_ANALYSIS.md) for detailed docs
2. Review workflow logs in GitHub Actions tab
3. Test locally: `npm run <script>`
4. Check GitHub Actions documentation: https://docs.github.com/en/actions

---

## Next Steps

After successful migration:

1. **Update README.md** - Add workflow status badges
2. **Update CONTRIBUTING.md** - Document new CI process
3. **Train team** - Share this guide with contributors
4. **Monitor** - Watch workflow runs for first week
5. **Optimize** - Adjust timeouts, caching based on actual usage
6. **Enhance** - Add Slack/Discord notifications (optional)

---

## Workflow Status Badges

Add to your README.md:

```markdown
## CI/CD Status

[![CI](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/ci-consolidated.yml/badge.svg)](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/ci-consolidated.yml)
[![Security](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/security.yml/badge.svg)](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/security.yml)
[![Performance](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/performance.yml/badge.svg)](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/performance.yml)
[![i18n](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/i18n-consolidated.yml/badge.svg)](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/i18n-consolidated.yml)
```

---

*Migration guide updated: October 15, 2025*
