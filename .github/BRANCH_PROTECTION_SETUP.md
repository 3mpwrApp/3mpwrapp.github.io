# Branch Protection & Repository Security Setup

This document provides instructions for enabling comprehensive security features on the GitHub repository.

## 🔒 Branch Protection Rules

### Enable via GitHub UI:
1. Go to **Repository Settings** → **Branches**
2. Click **Add branch protection rule**
3. Set **Branch name pattern**: `main`

### Recommended Settings for `main` branch:

#### Require a pull request before merging
- ✅ Require approvals: **1** (or 2 for critical repos)
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners
- ✅ Require approval of the most recent reviewable push

#### Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Required status checks:
  - `lint-and-typecheck`
  - `unit-tests`
  - `Security Scanning / dependency-scan`

#### Require conversation resolution before merging
- ✅ All conversations must be resolved

#### Require signed commits
- ✅ Enable (recommended for security)

#### Require linear history
- ✅ Enable (prevents merge commits, keeps history clean)

#### Do not allow bypassing the above settings
- ✅ Enable (applies rules to admins too)

#### Restrict who can push to matching branches
- ✅ Enable if you want to restrict direct pushes

#### Allow force pushes
- ❌ Disable (never allow on main)

#### Allow deletions
- ❌ Disable (protect main from deletion)

---

## 🔐 Enable Secret Scanning

### Via GitHub UI:
1. Go to **Repository Settings** → **Code security and analysis**
2. Enable:
   - ✅ **Dependency graph**
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Secret scanning**
   - ✅ **Push protection** (blocks commits containing secrets)

### Secret Scanning Alerts:
- GitHub will automatically scan for:
  - API keys
  - Access tokens
  - Private keys
  - Connection strings
  - Credentials from 100+ service providers

---

## 📦 Enable Dependabot

Already configured via `.github/dependabot.yml`. Features enabled:

- **Daily npm security updates** - Automatic PRs for vulnerable dependencies
- **Weekly GitHub Actions updates** - Keep CI/CD workflows secure
- **Grouped updates** - Reduces PR noise by grouping related updates
- **Auto-labeling** - PRs labeled for easy filtering

### Manual Enable (if needed):
1. Go to **Repository Settings** → **Code security and analysis**
2. Enable:
   - ✅ **Dependabot alerts**
   - ✅ **Dependabot security updates**
   - ✅ **Dependabot version updates**

---

## 🔍 Enable Code Scanning (CodeQL)

Already configured via `.github/workflows/security.yml`. Features:
- Weekly automated security scans
- Scans on every push to main
- JavaScript/TypeScript security analysis
- Extended security queries

### Manual Enable:
1. Go to **Repository Settings** → **Code security and analysis**
2. Click **Set up** next to Code scanning
3. Select **CodeQL Analysis**

---

## 🛡️ Additional Security Settings

### Repository Settings → General → Features:
- ✅ Issues - Enable for security issue tracking
- ✅ Discussions - Enable for security Q&A
- ❌ Wikis - Disable unless needed (reduces attack surface)

### Repository Settings → Actions → General:
- ✅ Actions permissions: **Allow select actions and reusable workflows**
- ✅ Require approval for all outside collaborators
- ✅ Fork pull request workflows require approval

### Repository Settings → Secrets and variables → Actions:
- Use **Environment secrets** for production values
- Use **Repository secrets** for shared values
- Never commit secrets to code

---

## 📋 Quick Checklist

Run through this checklist to ensure full protection:

```
[ ] Branch protection enabled on main
[ ] Require 1+ PR approvals
[ ] Require status checks to pass
[ ] Require signed commits
[ ] Dependabot alerts enabled
[ ] Dependabot security updates enabled
[ ] Secret scanning enabled
[ ] Push protection enabled
[ ] CodeQL/Code scanning enabled
[ ] CODEOWNERS file configured
[ ] SECURITY.md published
[ ] Actions permissions restricted
[ ] Audit log monitoring enabled
```

---

## 🔧 GitHub CLI Commands (Alternative)

If you have GitHub CLI installed, you can enable some settings:

```bash
# Enable branch protection
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github+json" \
  -f required_status_checks='{"strict":true,"contexts":["lint-and-typecheck","unit-tests"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
  -f restrictions=null

# Enable vulnerability alerts
gh api repos/{owner}/{repo}/vulnerability-alerts -X PUT

# Enable automated security fixes  
gh api repos/{owner}/{repo}/automated-security-fixes -X PUT
```

---

## 📊 Monitoring Security

### Daily Tasks:
- Review Dependabot PRs
- Check security alerts dashboard

### Weekly Tasks:
- Review CodeQL findings
- Check secret scanning alerts
- Review audit logs

### Monthly Tasks:
- Security dependency audit
- Review access permissions
- Update security policies

---

Last updated: December 2024
