Main branch protection (GitHub)

1) Require pull requests into main
   - Settings → Branches → Branch protection rules → Add rule
   - Branch name pattern: main
   - Check “Require a pull request before merging”
   - Require approvals: 1+ (adjust to your team)

2) Require status checks to pass
   - In the same rule, check “Require status checks to pass before merging”
   - After the first PR runs, add required checks:
     - ci / lint-typecheck (from .github/workflows/ci.yml)

3) Dismiss stale approvals, restrict force-pushes (optional but recommended)
   - Enable “Dismiss stale pull request approvals when new commits are pushed”
   - Check “Restrict who can push to matching branches” and leave empty to require PRs

4) (Optional) Require signed commits
   - Enable “Require signed commits” if your org uses GPG/SSO signing

Developer tips
 - Use feature branches; rebase or merge via PRs only.
 - Keep main protected; cut releases from tags/branches.
 - Our CI runs ESLint (quiet) and TypeScript strict typecheck.

