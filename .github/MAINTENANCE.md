# Repository Maintenance Guide

This guide is for repository maintainers and administrators to help manage the 3mpowr App website repository effectively.

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Branch Protection Setup](#branch-protection-setup)
3. [Managing Pull Requests](#managing-pull-requests)
4. [Release Process](#release-process)
5. [Troubleshooting](#troubleshooting)

## Quick Setup

### First-Time Repository Setup

After creating or cloning this repository, follow these steps:

1. **Enable GitHub Pages**
   - Go to Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `(root)`
   - Click Save

2. **Set Up Branch Protection** (see detailed guide below)

3. **Configure Repository Settings**
   - Settings → General → Features
   - ✅ Enable Issues
   - ✅ Enable Pull Requests
   - ✅ Enable Discussions (optional)

4. **Add Collaborators**
   - Settings → Collaborators and teams
   - Add team members with appropriate permissions

## Branch Protection Setup

### Using Branch Protection Rules (Traditional)

1. Navigate to **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable these rules:

   **Recommended Settings:**
   ```
   ✅ Require a pull request before merging
      ✅ Require approvals: 1
      ✅ Dismiss stale pull request approvals when new commits are pushed
      ✅ Require review from Code Owners
   
   ✅ Require status checks to pass before merging
      ✅ Require branches to be up to date before merging
      ✅ Status checks: build (from jekyll.yml workflow)
   
   ✅ Require conversation resolution before merging
   
   ✅ Include administrators (apply rules to admins too)
   
   ✅ Restrict who can push to matching branches (optional)
   
   ❌ Allow force pushes: Disabled
   ❌ Allow deletions: Disabled
   ```

5. Click **Create** or **Save changes**

### Using Rulesets (Modern Approach)

GitHub Rulesets provide more flexibility:

1. Navigate to **Settings** → **Rules** → **Rulesets**
2. Click **New ruleset** → **New branch ruleset**
3. Configure:
   ```
   Name: Main Branch Protection
   Enforcement status: Active
   Target branches: main
   
   Rules:
   ✅ Restrict deletions
   ✅ Require a pull request before merging
      - Required approvals: 1
      - Dismiss stale reviews: Yes
      - Require code owner review: Yes
   ✅ Require status checks to pass
      - Build must pass
      - Require branches to be up to date: Yes
   ✅ Block force pushes
   ```

4. Click **Create**

### Verifying Branch Protection

Test that branch protection is working:

```bash
# Try to push directly to main (should fail)
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test"
git push origin main
# Expected: Remote rejected (protected branch)

# Clean up
git reset --hard HEAD~1
```

## Managing Pull Requests

### Review Checklist

When reviewing a PR, verify:

- [ ] **Code Quality**
  - Changes are minimal and focused
  - No unnecessary files included
  - Code follows project style guidelines

- [ ] **Content Quality**
  - No spelling or grammar errors
  - Content is accurate and up-to-date
  - Tone is consistent with the site

- [ ] **Technical**
  - All links work correctly
  - Images load and have alt text
  - No console errors
  - Jekyll build passes

- [ ] **Accessibility**
  - Color contrast is sufficient
  - Semantic HTML is used
  - Screen reader friendly

- [ ] **Testing**
  - Contributor has tested changes
  - Changes work on multiple browsers
  - Mobile responsive

### Approving and Merging

1. **Review the Changes**
   - Read through all changed files
   - Check the PR description
   - Run the site locally if needed

2. **Request Changes (if needed)**
   - Use the "Request changes" review option
   - Be specific and constructive
   - Provide examples or suggestions

3. **Approve the PR**
   - Click "Review changes" → "Approve"
   - Add a comment if appropriate

4. **Merge**
   - Choose merge method:
     - **Squash and merge**: Combines all commits (recommended for feature PRs)
     - **Rebase and merge**: Keeps individual commits (for clean commit history)
     - **Create a merge commit**: Standard merge (creates merge commit)
   
   - Click "Merge pull request"
   - Verify deployment succeeds

### Common PR Issues

**Build Failing:**
- Check GitHub Actions logs
- Look for Jekyll syntax errors
- Verify all files are valid Markdown/HTML

**Conflicts:**
- Ask contributor to update their branch:
  ```bash
  git fetch upstream
  git rebase upstream/main
  git push --force-with-lease origin feature-branch
  ```

**Incomplete Changes:**
- Request additional information
- Ask for screenshots or testing evidence

## Release Process

This site uses continuous deployment:

1. **Merge to Main** → Automatically triggers deployment
2. **GitHub Actions** runs Jekyll build
3. **Deploy to GitHub Pages** happens automatically
4. **Site Updates** within a few minutes

### Manual Deployment

If automatic deployment fails:

1. Check **Actions** tab for errors
2. Fix any build errors
3. Re-run failed jobs if needed
4. Contact GitHub Support if GitHub Pages is down

## Troubleshooting

### Jekyll Build Fails

**Check the workflow logs:**
1. Go to **Actions** tab
2. Click on the failed workflow run
3. Expand the failed step
4. Look for error messages

**Common Issues:**
- Invalid YAML front matter
- Broken links or images
- Invalid Liquid syntax
- Missing dependencies

**Fix:**
1. Create a PR with the fix
2. Test locally with `bundle exec jekyll build`
3. Merge once CI passes

### Branch Protection Not Working

**Verify settings:**
1. Settings → Branches
2. Check that rule is enabled for `main`
3. Ensure "Include administrators" is checked

**Common Issues:**
- Rule not applied to correct branch name
- User has admin bypass enabled
- Status checks not properly configured

### Pull Requests Can't Be Merged

**Possible reasons:**
- Required reviews not obtained
- Status checks failing
- Merge conflicts
- Branch not up to date with main

**Solution:**
1. Check PR requirements
2. Address any issues
3. Request review if needed
4. Resolve conflicts

### Pages Not Updating

**Check:**
1. Actions tab - build succeeded?
2. Settings → Pages - correctly configured?
3. Give it 5-10 minutes to propagate

**Debug:**
```bash
# Run Jekyll locally to test
bundle exec jekyll build
bundle exec jekyll serve
```

## Monitoring and Maintenance

### Regular Tasks

**Weekly:**
- Review open issues and PRs
- Check for security alerts
- Monitor site performance

**Monthly:**
- Update dependencies (`bundle update`)
- Review analytics (if configured)
- Check for broken links

**Quarterly:**
- Review branch protection rules
- Update documentation
- Archive old issues/PRs

### Security

**Dependabot:**
- Enable in Settings → Security → Dependabot
- Review and merge security updates promptly

**Code Scanning:**
- Enable in Settings → Security → Code scanning
- Review and address any findings

**Secret Scanning:**
- Automatically enabled for public repos
- Immediately rotate any exposed secrets

## Resources

- [Branch Protection Guide](.github/BRANCH_PROTECTION.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [GitHub Docs: Protected Branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Getting Help

**For repository maintainers:**
- Review GitHub documentation
- Check community forums
- Open an issue for complex problems

**For urgent issues:**
- Contact GitHub Support
- Email: empowrapp08162025@gmail.com

---

**Keep this guide updated as processes evolve!**
