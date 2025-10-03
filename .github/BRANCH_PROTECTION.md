# Branch Protection Setup Guide

This guide explains how to set up branch protection rules (rulesets) for the main branch to maintain code quality and prevent accidental changes.

## Why Branch Protection?

Branch protection rules help to:
- Prevent force pushes and accidental deletions
- Require pull request reviews before merging
- Ensure CI/CD checks pass before merging
- Maintain a clean and stable main branch
- Encourage collaborative development practices

## Setting Up Branch Protection Rules

### Step 1: Access Repository Settings

1. Go to your repository on GitHub: `https://github.com/3mpowrApp/3mpwrapp.github.io`
2. Click on **Settings** tab (you need admin permissions)
3. In the left sidebar, click on **Branches** under "Code and automation"

### Step 2: Add Branch Protection Rule

1. Click **Add branch protection rule** or **Add rule**
2. In the "Branch name pattern" field, enter: `main`

### Step 3: Configure Protection Rules

#### Required Settings (Recommended):

**Protect matching branches:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: Set to **1** (or more for stricter control)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if you have a CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Select checks: **build** (from Jekyll deployment workflow)

- ✅ **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

- ✅ **Require signed commits** (optional but recommended for security)

- ✅ **Include administrators**
  - Apply rules to repository administrators too

- ✅ **Restrict who can push to matching branches** (optional)
  - Only selected users/teams can push

- ✅ **Allow force pushes**: **Disabled**
  - Prevents rewriting history on main branch

- ✅ **Allow deletions**: **Disabled**
  - Prevents accidental branch deletion

#### Optional Settings:

- **Require linear history**: Prevents merge commits (requires rebasing or squashing)
- **Require deployments to succeed before merging**: For production environments
- **Lock branch**: Makes the branch read-only

### Step 4: Using GitHub Rulesets (New Feature)

GitHub now offers **Rulesets** as a more flexible alternative to branch protection rules:

1. Go to **Settings** → **Rules** → **Rulesets**
2. Click **New ruleset** → **New branch ruleset**
3. Name it: `Main Branch Protection`
4. Set **Enforcement status**: **Active**
5. Add target branches: `main`
6. Configure rules:
   - **Restrict deletions**: ✅
   - **Require a pull request before merging**: ✅
   - **Require status checks to pass**: ✅
   - **Block force pushes**: ✅

### Step 5: Save and Test

1. Click **Create** or **Save changes**
2. Test by trying to push directly to main (should be blocked)
3. Create a test pull request to verify the workflow

## Recommended Workflow

After setting up branch protection:

1. **Create a feature branch** for any changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub

5. **Request review** from team members

6. **Address feedback** and wait for approval

7. **Merge** once approved and checks pass

## Additional Security Measures

### Create a CODEOWNERS File

Create `.github/CODEOWNERS` to automatically request reviews from specific people:

```
# Default owners for everything
*       @3mpowrApp

# Specific paths
/.github/       @3mpowrApp
/assets/        @3mpowrApp
```

### Enable Required Reviews

For critical files, you can require multiple reviews or reviews from specific teams.

### Set Up Status Checks

Your repository already has a Jekyll build workflow that should be added as a required status check.

## Troubleshooting

### "Push declined due to repository rule violations"
- You tried to push directly to main. Create a branch and PR instead.

### "Required status check is failing"
- Your Jekyll build is failing. Check the Actions tab for error details.
- Fix the errors in your branch before merging.

### "Review required"
- Wait for a repository maintainer to review and approve your PR.
- If you're the only maintainer, you may need to adjust the rule settings.

## Quick Reference Commands

```bash
# Create and switch to a new branch
git checkout -b feature/my-feature

# Check current branch
git branch

# Push changes
git add .
git commit -m "Your commit message"
git push origin feature/my-feature

# Update your branch with main
git fetch origin
git merge origin/main

# Delete local branch after merge
git branch -d feature/my-feature
```

## Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Rulesets Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines for this repository

---

**Need Help?** Contact the repository maintainers or open an issue.
