# File Organization Guide
**Where does every new file go?**

## 🎯 Quick Decision Tree

```
Creating a new file?
    ↓
Is it a config file (*.json, *.config.js, .rc, *.toml)?
    → YES: Keep at ROOT
    ↓ NO
Is it a script (*.js, *.mjs, *.ts for automation)?
    → YES: scripts/[category]/
    ↓ NO
Is it documentation (*.md)?
    → YES: docs/[category]/ (see table below)
    ↓
✅ File placed correctly!
```

## 📁 Documentation Categories (docs/)

| What is it about? | Folder | Examples |
|-------------------|--------|----------|
| **Accessibility** (WCAG, AAA, a11y audits) | `docs/accessibility` | WCAG audits, a11y implementation, contrast fixes |
| **Deployment** (builds, releases, distribution) | `docs/deployment/` | Build guides, EAS setup, store deployment |
| **Features** (app features, implementations) | `docs/features/` | Feature specs, implementation summaries |
| **Firebase** (Firestore, Firebase setup) | `docs/firebase/` | Firebase config, Firestore rules, fixes |
| **OAuth** (Google OAuth, API keys) | `docs/oauth/` | OAuth setup, API rotation, Google Drive fixes |
| **Performance** (optimization, bundle size) | `docs/performance/` | Bundle analysis, optimization reports |
| **Security** (security audits, protection) | `docs/security/` | Security audits, breach protection setup |
| **Testing** (tests, CI/CD, test results) | `docs/testing/` | Test reports, CI configuration, debugging |

## 📝 Naming Convention

```
[CATEGORY]-[TOPIC]-[TYPE]-[DATE].md

✅ GOOD:
- docs/accessibilityWCAG-AAA-AUDIT-MAR2026.md
- docs/deployment/BETA-DISTRIBUTION-GUIDE.md
- docs/oauth/GOOGLE-DRIVE-FIX-JAN2026.md
- docs/features/PDF-EXPORT-IMPLEMENTATION.md

❌ BAD:
- AUDIT.md (too vague, at root)
- my_notes.md (unclear purpose, wrong naming)
- FINAL-COMPLETE-SUMMARY.md (no category context)
```

## 🚫 Files That Stay at ROOT

**ONLY these stay at root:**
- ✅ `README.md` - Main project documentation
- ✅ Config files (`package.json`, `app.json`, `firebase.json`, etc.)
- ✅ Expo/React Native config (`app.config.js`, `metro.config.js`, etc.)
- ✅ Build tool config (`tsconfig.json`, `babel.config.js`, etc.)
- ✅ Environment templates (`.env.example`)
- ✅ Git config (`.gitignore`, `.gitattributes`)
- ✅ **Core identity docs** (`SOUL.md`, `USER.md`, `MEMORY.md`, `HEARTBEAT.md`, `TOOLS.md`, `LEARNINGS.md`)
- ✅ Security-sensitive (`.env.local`, `credentials.json`, `*.jks`)

**Everything else goes in folders!**

## ✅ Before Every Commit Checklist

```bash
# Step 1: Identify the category
What is this file about? → [category]

# Step 2: Check if the folder exists
ls docs/[category]/

# Step 3: Move file to correct location
mv [FILE].md docs/[category]/

# Step 4: Commit with clear message
git add docs/[category]/[FILE].md
git commit -m "docs([category]): Add [FILE]"
```

## 📚 Examples by Use Case

### Adding an OAuth Fix Document
```bash
# File: GOOGLE-DRIVE-REFRESH-TOKEN-FIX.md
# Category: OAuth
mv GOOGLE-DRIVE-REFRESH-TOKEN-FIX.md docs/oauth/
git add docs/oauth/GOOGLE-DRIVE-REFRESH-TOKEN-FIX.md
git commit -m "docs(oauth): Add Google Drive refresh token fix"
```

### Adding a Feature Implementation
```bash
# File: COMMUNITY-CHAT-IMPLEMENTATION.md
# Category: Features
mv COMMUNITY-CHAT-IMPLEMENTATION.md docs/features/
git add docs/features/COMMUNITY-CHAT-IMPLEMENTATION.md
git commit -m "docs(features): Add community chat implementation"
```

### Adding a Deployment Guide
```bash
# File: PRODUCTION-DEPLOY-CHECKLIST.md
# Category: Deployment
mv PRODUCTION-DEPLOY-CHECKLIST.md docs/deployment/
git add docs/deployment/PRODUCTION-DEPLOY-CHECKLIST.md
git commit -m "docs(deployment): Add production deploy checklist"
```

### Adding a Security Audit Report
```bash
# File: SECURITY-AUDIT-APR2026.md
# Category: Security
mv SECURITY-AUDIT-APR2026.md docs/security/
git add docs/security/SECURITY-AUDIT-APR2026.md
git commit -m "docs(security): Add April 2026 security audit"
```

## 🔗 Cross-Referencing Files

When referencing other docs, use **relative paths**:

```markdown
✅ CORRECT:
See [OAuth Setup Guide](../oauth/GOOGLE-OAUTH-QUICKSTART.md)
Related: [Performance Guide](./BUNDLE-OPTIMIZATION.md)

❌ INCORRECT:
See GOOGLE-OAUTH-QUICKSTART.md (no path - breaks!)
See d:\1-EmpowrApp\... (absolute path - breaks on other machines)
```

## 🎓 Training Yourself

**Every time you create a file, ask:**
1. **Is this a config file?** → Root
2. **Is this a script?** → `scripts/[category]/`
3. **Is this documentation?** → `docs/[category]/`
4. **Which category?** → See table above
5. **Good filename?** → `[CATEGORY]-[TOPIC]-[TYPE].md`

## 🏆 Success = Clean Workspace

**After following this guide:**
- ✅ Easy to find any document in <30 seconds
- ✅ New team members can navigate instantly
- ✅ No confusion about where files go
- ✅ Consistent structure across the project
- ✅ Future you will thank present you!

---

**Need help?** Check [WORKSPACE_ORGANIZATION_PLAN.md](./WORKSPACE_ORGANIZATION_PLAN.md) for the full detailed plan.

**Last Updated:** March 25, 2026
