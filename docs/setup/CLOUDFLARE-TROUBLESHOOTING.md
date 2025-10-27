# Cloudflare Pages Troubleshooting - Bare Site

## Issue: Site loads but appears blank/bare

### Quick Fixes (Try These First)

#### Fix 1: Check Build Log
1. Go to Cloudflare dashboard: https://dash.cloudflare.com/
2. Click "Workers & Pages"
3. Click your project: `3mpwrapp`
4. Look at latest deployment
5. Click "View build log"

**Look for:**
- ✅ "Success: Your site has been deployed!"
- ❌ Any errors in red
- ⚠️ Warnings about missing files

#### Fix 2: Verify Build Settings

Go to your Cloudflare project settings:

**Should be:**
```
Build command: bundle exec jekyll build
Build output directory: _site
Root directory: (empty)
Framework preset: Jekyll
```

**Environment variables should include:**
```
JEKYLL_ENV = production
```

#### Fix 3: Check Output Directory

In build log, look for:
```
Configuration file: _config.yml
            Source: /opt/buildhome/repo
       Destination: /opt/buildhome/repo/_site
```

The Destination should be `_site`

#### Fix 4: Redeploy

Sometimes first deployment has issues:
1. In Cloudflare project
2. Click "Deployments" tab
3. Latest deployment → "..." menu
4. Click "Retry deployment"

### Common Issues & Solutions

#### Issue: "Error: No Jekyll installation detected"

**Solution:** Check Gemfile exists in repository root

Your Gemfile should have:
```ruby
source "https://rubygems.org"
gem "jekyll", "~> 4.3"
gem "minima", "~> 2.5"
# ... other gems
```

#### Issue: "Bundle install failed"

**Solution:** Add RUBY_VERSION environment variable
```
Name: RUBY_VERSION
Value: 3.1.0
```

Then redeploy.

#### Issue: CSS/Images not loading

**Cause:** URL mismatch in _config.yml

**Solution:** Updated _config.yml to use Cloudflare URL:
```yaml
url: "https://3mpwrapp.pages.dev"
```

This was just fixed! Commit and push will trigger new deployment.

#### Issue: Theme not applied

**Cause:** Minima theme not building properly

**Solution:** Check build log for theme errors. May need to:
1. Add minima gem to Gemfile (already there ✅)
2. Ensure theme: minima in _config.yml (already there ✅)

#### Issue: "Site deployed but blank"

**Possible causes:**
1. Build output directory wrong (should be `_site`)
2. No index.html generated
3. URL/baseurl mismatch
4. Theme not building

**Debug steps:**
1. Check build log - did it generate files?
2. Look for: "Generating... done in X seconds"
3. Should show: "29 files written to _site" (or similar)

### What the Build Log Should Show

**Successful build looks like:**
```
Cloning repository...
Installing dependencies...
bundle install
...
Building site...
Configuration file: _config.yml
            Source: /opt/buildhome/repo
       Destination: /opt/buildhome/repo/_site
...
Generating...
  Jekyll Feed: Generating feed for posts
  Jekyll Feed: Generating feed for whats_new
                    done in 2.345 seconds.
Auto-regeneration: disabled.
...
Finished
Successfully generated static files.
Deploying to Cloudflare's global network...
Success: Your site has been deployed!
```

**Failed build shows:**
```
Error: ...
Build failed
```

### Current Fix Applied

I just updated your `_config.yml` to use the Cloudflare Pages URL:
```yaml
url: "https://3mpwrapp.pages.dev"
```

**Next steps:**
1. Commit this change
2. Push to GitHub
3. Cloudflare will auto-detect and rebuild
4. Wait 2-3 minutes
5. Check `https://3mpwrapp.pages.dev/` again

### Manual Deployment Trigger

If auto-deploy doesn't work:
1. Cloudflare dashboard → Your project
2. Three dots (...) menu
3. "Retry deployment"

### Compare Working vs Broken

**GitHub Pages (working):**
- URL: https://3mpwrapp.github.io
- Uses same repository
- Same _config.yml settings
- If this works but Cloudflare doesn't → check Cloudflare build settings

### Check Specific Issues

**Test these URLs after fix:**
```
https://3mpwrapp.pages.dev/          (homepage)
https://3mpwrapp.pages.dev/about/    (about page)
https://3mpwrapp.pages.dev/features/ (features)
```

**If all are blank:**
- Build output directory issue

**If homepage works but others don't:**
- Permalink/URL structure issue

**If CSS missing but HTML shows:**
- Asset path issue (fixed by URL change)

### Environment Variables to Verify

Should have these set:
```
JEKYLL_ENV = production
RUBY_VERSION = 3.1.0 (optional but recommended)
```

### Files Cloudflare Needs

In repository root:
- ✅ _config.yml
- ✅ Gemfile
- ✅ Gemfile.lock
- ✅ index.md (or index.html)
- ✅ _layouts/default.html
- ✅ Other content files

All present! ✅

### Next Deployment Will Fix

The URL change I just made should fix the bare site issue. When you push:

**What will happen:**
1. Git push triggers Cloudflare webhook
2. Cloudflare pulls latest code
3. Runs `bundle exec jekyll build`
4. Generates files to `_site` folder
5. Deploys to global network
6. Site should work!

### If Still Broken After Fix

**Share this info:**
1. Cloudflare build log (copy/paste)
2. Any error messages
3. What you see when you visit the URL
   - Completely blank?
   - White page?
   - 404 error?
   - Some HTML but no styling?

### Alternative: Check Your Cloudflare Settings

**Project settings to verify:**
1. Build command: `bundle exec jekyll build`
2. Build output: `_site`
3. Branch: `main`
4. Root directory: (empty)

**Build environment:**
- Should auto-detect Ruby
- Should auto-detect Jekyll
- Should install dependencies from Gemfile

---

## Immediate Action

**Run these commands now:**

```powershell
git add _config.yml
git commit -m "fix: Update URL for Cloudflare Pages deployment"
git push origin main
```

Then wait 2-3 minutes and check `https://3mpwrapp.pages.dev/` again.

**It should work!** 🎉
