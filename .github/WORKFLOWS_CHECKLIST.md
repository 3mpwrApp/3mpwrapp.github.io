# GitHub Actions Implementation Checklist

## 📋 Pre-Migration Checklist

### Phase 0: Preparation (30 minutes)

- [ ] **Review all documentation**
  - [ ] Read `WORKFLOWS_SUMMARY.md` (10 min)
  - [ ] Skim `WORKFLOWS_COMPARISON.md` (5 min)
  - [ ] Bookmark `WORKFLOWS_QUICKREF.md` for reference
  - [ ] Review `WORKFLOWS_MIGRATION.md` for detailed steps

- [ ] **Backup current workflows**
  ```bash
  mkdir -p .github/workflows-backup
  cp .github/workflows/*.yml .github/workflows-backup/
  git add .github/workflows-backup/
  git commit -m "chore: backup workflows before migration"
  ```

- [ ] **Verify all npm scripts exist**
  ```bash
  npm run lint:ci
  npm run typecheck:strict
  npm test
  npm run a11y:scan
  npm run i18n:validate
  npm run security:validate
  ```

- [ ] **Check current workflow status**
  ```bash
  gh workflow list
  gh run list --limit 10
  ```

- [ ] **Team notification**
  - [ ] Notify team of planned migration
  - [ ] Share timeline and expected downtime (if any)
  - [ ] Assign roles (who tests, who reviews, who approves)

---

## 🔑 Phase 1: Secrets & Configuration (15 minutes)

- [ ] **Add required secrets to repository**
  - [ ] `EXPO_TOKEN` from expo.dev
    ```bash
    # Get token from: https://expo.dev/accounts/[username]/settings/access-tokens
    gh secret set EXPO_TOKEN
    ```
  - [ ] Verify `GITHUB_TOKEN` exists (auto-provided)
    ```bash
    gh secret list
    ```

- [ ] **Enable Dependabot**
  - [ ] Go to Settings → Code security and analysis
  - [ ] Enable "Dependabot alerts"
  - [ ] Enable "Dependabot security updates"
  - [ ] Enable "Dependabot version updates"
  - [ ] Verify `dependabot.yml` is committed

- [ ] **Configure branch protection rules** (optional but recommended)
  - [ ] Require CI to pass before merge
  - [ ] Require 1 approval for PRs
  - [ ] Enable "Require status checks to pass"
  - [ ] Select: ci-consolidated / ci-success

---

## 🧪 Phase 2: Testing (1-2 hours)

### Create test branch
```bash
git checkout -b test/workflow-migration
```

### Test each new workflow individually

- [ ] **Test ci-consolidated.yml**
  - [ ] Trigger manually: `gh workflow run ci-consolidated.yml`
  - [ ] Wait for completion (~8 min)
  - [ ] Verify all jobs passed:
    - [ ] lint
    - [ ] typecheck
    - [ ] test
    - [ ] quality
    - [ ] expo-doctor
    - [ ] ci-success
  - [ ] Check artifacts uploaded:
    - [ ] coverage-report
    - [ ] wcag-report
  - [ ] Verify concurrency works (push 2 commits quickly, old should cancel)

- [ ] **Test i18n-consolidated.yml**
  - [ ] Make small change to `locales/en/common.json`
  - [ ] Push and verify workflow triggers
  - [ ] Verify all checks pass:
    - [ ] JSON validation
    - [ ] Key diff check
    - [ ] Plural validation
    - [ ] Threshold check
    - [ ] Orphan detection

- [ ] **Test whatsnew-auto.yml**
  - [ ] Update `docs/CHANGELOG.md` with test entry
  - [ ] Push and wait for workflow
  - [ ] Verify PR created with correct:
    - [ ] Branch name: `chore/whatsnew-auto-*`
    - [ ] Title: "chore(whatsnew): daily auto-generation"
    - [ ] Body: Contains checklist
    - [ ] Labels: automation, whatsnew, documentation
    - [ ] Changed file: `data/whatsnew.auto.ts`

- [ ] **Test security.yml**
  - [ ] Trigger manually: `gh workflow run security.yml`
  - [ ] Wait for completion (~15 min)
  - [ ] Verify all jobs passed:
    - [ ] codeql
    - [ ] secret-scan
    - [ ] dependency-scan
    - [ ] license-check
    - [ ] security-validation
  - [ ] Review CodeQL results in Security tab

- [ ] **Test eas-build.yml** (optional - requires EXPO_TOKEN)
  - [ ] Trigger with inputs:
    ```bash
    gh workflow run eas-build.yml \
      -f platform=android \
      -f profile=development \
      -f submit=false
    ```
  - [ ] Monitor build in Expo dashboard
  - [ ] Verify build completes (may take 30-60 min)

- [ ] **Test release.yml** (optional - test on separate repo first)
  - [ ] DO NOT test on main branch yet
  - [ ] Test on feature branch with workflow_dispatch:
    ```bash
    gh workflow run release.yml -f version=patch
    ```
  - [ ] Verify version bump logic works
  - [ ] Check CHANGELOG.md updates
  - [ ] Verify tag creation

- [ ] **Test pr-labeler.yml**
  - [ ] Create test PR changing different file types
  - [ ] Verify labels applied automatically:
    - [ ] frontend (app/, components/)
    - [ ] backend (services/, firebase/)
    - [ ] testing (__tests__/)
    - [ ] documentation (*.md)

- [ ] **Test stale.yml**
  - [ ] Create old test issue (or use existing)
  - [ ] Wait for daily cron or trigger manually
  - [ ] Verify stale label added (may take 60 days in production)

- [ ] **Test performance.yml**
  - [ ] Create PR with file changes
  - [ ] Verify workflow runs
  - [ ] Check PR comment with bundle size
  - [ ] Verify budget check passes/fails correctly

---

## 🚀 Phase 3: Migration (30 minutes)

Choose your migration strategy:

### Option A: Full Migration (Faster, all at once)

- [ ] **Disable old workflows**
  ```bash
  mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
  mv .github/workflows/ci-quality.yml .github/workflows/ci-quality.yml.disabled
  mv .github/workflows/tests.yml .github/workflows/tests.yml.disabled
  mv .github/workflows/lint.yml .github/workflows/lint.yml.disabled
  mv .github/workflows/i18n-check.yml .github/workflows/i18n-check.yml.disabled
  mv .github/workflows/whatsnew-daily.yml .github/workflows/whatsnew-daily.yml.disabled
  ```

- [ ] **Commit changes**
  ```bash
  git add .github/workflows/
  git commit -m "feat(ci): migrate to optimized, security-hardened workflows

  BREAKING CHANGE: Replace 6 fragmented workflows with 9 optimized workflows

  - Consolidate ci.yml, ci-quality.yml, tests.yml, lint.yml into ci-consolidated.yml
  - Optimize i18n-check.yml into i18n-consolidated.yml
  - Enhance whatsnew-daily.yml to whatsnew-auto.yml
  - Add security.yml for CodeQL, secret scanning, dependency audit
  - Add eas-build.yml for automated Expo builds
  - Add release.yml for semantic versioning
  - Add pr-labeler.yml for PR automation
  - Add stale.yml for issue management
  - Add performance.yml for bundle size tracking
  - Add dependabot.yml for dependency updates

  Security improvements:
  - Pin all actions to SHA256 (100% pinned, was 0%)
  - Add explicit permissions (least privilege)
  - Add concurrency control (cancel stale runs)
  - Add comprehensive security scanning

  Performance improvements:
  - 73% faster CI (44 min → 12 min per PR)
  - 73% cost reduction (880 → 240 min/month)
  - Enhanced caching (node_modules + npm)
  - Job dependencies for fail-fast
  - Parallel execution where safe

  See .github/WORKFLOWS_SUMMARY.md for full details"
  ```

- [ ] **Push to main**
  ```bash
  git push origin main
  ```

- [ ] **Monitor first few workflow runs**
  ```bash
  gh run watch
  ```

### Option B: Gradual Migration (Safer, step-by-step)

#### Week 1: Core CI
- [ ] Disable old CI workflows
  ```bash
  mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
  mv .github/workflows/ci-quality.yml .github/workflows/ci-quality.yml.disabled
  mv .github/workflows/tests.yml .github/workflows/tests.yml.disabled
  mv .github/workflows/lint.yml .github/workflows/lint.yml.disabled
  ```
- [ ] Commit and push
- [ ] Monitor for 1 week
- [ ] Verify: All PRs pass, no issues

#### Week 2: i18n & Automation
- [ ] Disable old i18n/automation workflows
  ```bash
  mv .github/workflows/i18n-check.yml .github/workflows/i18n-check.yml.disabled
  mv .github/workflows/whatsnew-daily.yml .github/workflows/whatsnew-daily.yml.disabled
  ```
- [ ] Commit and push
- [ ] Monitor for 1 week
- [ ] Verify: i18n checks work, automation creates PRs

#### Week 3: Security & Extras
- [ ] Workflows already active: security.yml, pr-labeler.yml, stale.yml, performance.yml
- [ ] Monitor for 1 week
- [ ] Verify: Security scans pass, PRs auto-labeled, performance tracked

#### Week 4: Build & Release
- [ ] Test eas-build.yml on development profile
- [ ] Test release.yml with patch version
- [ ] Enable for production use
- [ ] Document usage for team

---

## 📊 Phase 4: Validation (1 week)

### Daily Checks (First Week)

- [ ] **Day 1: Launch day**
  - [ ] Monitor all workflow runs hourly
  - [ ] Check for any failures
  - [ ] Respond quickly to team questions
  - [ ] Document any issues encountered

- [ ] **Day 2-3: Early monitoring**
  - [ ] Check workflow runs twice daily
  - [ ] Review any failures or errors
  - [ ] Verify concurrency working (old runs canceling)
  - [ ] Check CI minutes usage in billing

- [ ] **Day 4-5: Mid-week check**
  - [ ] Review team feedback
  - [ ] Check for any performance issues
  - [ ] Verify security scans completing
  - [ ] Ensure Dependabot PRs created

- [ ] **Day 6-7: End of week**
  - [ ] Full week retrospective
  - [ ] Calculate actual time savings
  - [ ] Review security scan results
  - [ ] Plan any optimizations

### Metrics to Track

- [ ] **Performance metrics**
  - [ ] Average CI time per PR (target: <15 min)
  - [ ] CI success rate (target: >90%)
  - [ ] Concurrency effectiveness (% of runs canceled)
  - [ ] Monthly CI minutes used (target: <500 min)

- [ ] **Security metrics**
  - [ ] CodeQL findings (review all high/critical)
  - [ ] Secret scan results (should be 0 secrets found)
  - [ ] Dependency vulnerabilities (track over time)
  - [ ] Action pinning (verify 100%)

- [ ] **Quality metrics**
  - [ ] Test coverage percentage (track trend)
  - [ ] Lint error frequency
  - [ ] TypeScript error frequency
  - [ ] Bundle size trends

- [ ] **Team metrics**
  - [ ] Developer satisfaction (survey)
  - [ ] Time to merge (should decrease)
  - [ ] PR iteration time (should decrease)
  - [ ] Questions/confusion (should be low)

---

## 🎓 Phase 5: Team Training (30 minutes)

### Training Session Agenda

- [ ] **Overview (5 min)**
  - [ ] Why we migrated
  - [ ] What changed
  - [ ] Benefits

- [ ] **New workflows tour (10 min)**
  - [ ] ci-consolidated.yml - what it does
  - [ ] security.yml - new security features
  - [ ] eas-build.yml - how to trigger builds
  - [ ] release.yml - how releases work now
  - [ ] performance.yml - bundle size tracking

- [ ] **How to use (10 min)**
  - [ ] Manual workflow triggers
  - [ ] Reading workflow logs
  - [ ] Understanding PR labels
  - [ ] Interpreting bundle size reports

- [ ] **Troubleshooting (5 min)**
  - [ ] Common errors and fixes
  - [ ] Where to find help (WORKFLOWS_QUICKREF.md)
  - [ ] Who to contact for issues

- [ ] **Q&A (5 min)**

### Training Materials

- [ ] Create slide deck (optional)
- [ ] Record session for future reference
- [ ] Share quick reference guide
- [ ] Add to onboarding docs

---

## 📚 Phase 6: Documentation Updates (30 minutes)

- [ ] **Update README.md**
  - [ ] Add workflow status badges:
    ```markdown
    [![CI](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/ci-consolidated.yml/badge.svg)](...)
    [![Security](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/security.yml/badge.svg)](...)
    [![Performance](https://github.com/3mpwrApp/empowrapp-main/actions/workflows/performance.yml/badge.svg)](...)
    ```
  - [ ] Update CI/CD section with new workflows
  - [ ] Link to workflow documentation

- [ ] **Update CONTRIBUTING.md**
  - [ ] Document CI process
  - [ ] Explain how to trigger workflows
  - [ ] Add troubleshooting section
  - [ ] Link to WORKFLOWS_QUICKREF.md

- [ ] **Create/update CHANGELOG.md**
  - [ ] Document workflow migration
  - [ ] List all changes
  - [ ] Mention breaking changes

- [ ] **Team wiki/docs**
  - [ ] Add workflow documentation page
  - [ ] Link to all workflow guides
  - [ ] Add common troubleshooting
  - [ ] Include contact info for help

---

## 🔄 Phase 7: Ongoing Maintenance

### Weekly Tasks
- [ ] Review failed workflow runs
- [ ] Check security scan results
- [ ] Monitor CI minute usage
- [ ] Review Dependabot PRs

### Monthly Tasks
- [ ] Review and merge Dependabot PRs
- [ ] Check for workflow optimization opportunities
- [ ] Update team on CI metrics
- [ ] Analyze performance trends

### Quarterly Tasks
- [ ] Update action SHAs to latest
  ```bash
  # Check for updates
  gh api repos/actions/checkout/releases/latest
  # Update SHAs in workflows
  ```
- [ ] Review and optimize workflow efficiency
- [ ] Audit security posture
- [ ] Update documentation

### Annual Tasks
- [ ] Full security audit
- [ ] Team feedback survey
- [ ] Evaluate new GitHub Actions features
- [ ] Major workflow refactor (if needed)

---

## ✅ Success Criteria

Migration is successful when:

- [ ] **All workflows passing**
  - [ ] ci-consolidated.yml: ✅ passing on all PRs
  - [ ] i18n-consolidated.yml: ✅ passing on locale changes
  - [ ] security.yml: ✅ passing weekly
  - [ ] whatsnew-auto.yml: ✅ creating PRs daily
  - [ ] Other workflows: ✅ functioning as expected

- [ ] **Performance targets met**
  - [ ] CI time per PR: <15 minutes
  - [ ] Monthly CI minutes: <500 minutes
  - [ ] Success rate: >90%
  - [ ] Time savings: >60%

- [ ] **Security targets met**
  - [ ] All actions pinned: 100%
  - [ ] CodeQL passing: ✅
  - [ ] No secrets detected: ✅
  - [ ] Dependency vulnerabilities: <5 medium, 0 high/critical

- [ ] **Team satisfaction**
  - [ ] Team understands new workflows
  - [ ] No major complaints
  - [ ] Productivity improved
  - [ ] Documentation clear

- [ ] **Documentation complete**
  - [ ] All guides created
  - [ ] README updated
  - [ ] CONTRIBUTING.md updated
  - [ ] Team trained

---

## 🚨 Rollback Plan

If things go wrong:

### Immediate Rollback (5 minutes)
```bash
# Restore backup
cp .github/workflows-backup/*.yml .github/workflows/

# Disable new workflows
for f in .github/workflows/*.yml; do
  if [[ ! "$f" =~ (ci|tests|lint|i18n-check|whatsnew-daily)\.yml$ ]]; then
    mv "$f" "$f.disabled"
  fi
done

# Commit and push
git add .github/workflows/
git commit -m "rollback: restore previous workflows"
git push origin main
```

### Partial Rollback
- Keep working workflows
- Rollback only problematic ones
- Fix issues
- Re-deploy fixed version

### When to Rollback
- [ ] Critical workflow failures (>50% failure rate)
- [ ] Security issues introduced
- [ ] Team blocked from merging PRs
- [ ] Cost overrun (>1500 min in first week)

---

## 📞 Support & Resources

### Documentation
- **WORKFLOWS_INDEX.md** - Start here for navigation
- **WORKFLOWS_SUMMARY.md** - Executive overview
- **WORKFLOWS_ANALYSIS.md** - Technical deep-dive
- **WORKFLOWS_MIGRATION.md** - Step-by-step guide
- **WORKFLOWS_COMPARISON.md** - Before/after comparison
- **WORKFLOWS_QUICKREF.md** - Daily cheat sheet

### Commands
```bash
# View workflow status
gh workflow list

# Recent runs
gh run list --limit 20

# Watch a run
gh run watch

# Re-run failed jobs
gh run rerun <run-id> --failed

# Manual trigger
gh workflow run <workflow-name>.yml
```

### Getting Help
1. Check WORKFLOWS_QUICKREF.md
2. Search workflow logs
3. Check GitHub Actions docs
4. Ask team lead
5. Create issue with label ci/cd

---

## 🎉 Post-Migration Celebration

When migration is successful:

- [ ] Announce success to team
- [ ] Share metrics (time saved, cost reduced)
- [ ] Thank contributors
- [ ] Document lessons learned
- [ ] Plan next improvements

---

**Estimated Total Time: 4-6 hours**
- Preparation: 30 min
- Secrets setup: 15 min
- Testing: 1-2 hours
- Migration: 30 min
- Validation: 1 week (passive)
- Training: 30 min
- Documentation: 30 min

**ROI: ~21 hours/month saved in CI wait time**

---

*Checklist created: October 15, 2025*  
*Ready for implementation*  
*Good luck! 🚀*
