# Social Media 404 Fix - November 2025

## Problem

Automated social media posts to Mastodon and Bluesky were linking to pages that returned 404 errors because:

1. Posts were being sent **before Cloudflare Pages deployment completed**
2. Workflow waited a fixed 45 minutes, but deployment could take longer
3. No verification that URLs were accessible before posting
4. Users clicking links immediately after posting got 404 errors

## Solution

### 1. Improved Deployment Verification

**Updated workflows:**
- `.github/workflows/daily-feature.yml`
- `.github/workflows/content-curator.yml`

**Changes:**
- Replace fixed 45-minute wait with **active URL checking**
- Check every minute for up to 60 minutes
- Verify actual article/blog URL (not just homepage)
- Check HTTP status code (must be 200)
- Exit with error if URL not accessible after 60 minutes
- This prevents posting with broken links

**Before:**
```yaml
# Wait 45 minutes blindly
sleep 2700
# Try to check URL 5 times with 1-minute intervals
# Continue anyway if URL not accessible
```

**After:**
```yaml
# Check URL every minute for up to 60 minutes
# Get actual HTTP status code
# Exit with error if not accessible
# Only proceed to social posting if URL verified
```

### 2. URL Verification in Posting Scripts

**Updated scripts:**
- `scripts/post-daily-feature.js`
- `scripts/social-post.js`

**Added:**
- New `verifyUrl()` method using HTTP HEAD requests
- Pre-posting URL verification with 10-second timeout
- Exit with error if URL returns non-200 status
- Prevents posting links that would 404

**Implementation:**
```javascript
async verifyUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      method: 'HEAD',
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}
```

**Usage before posting:**
```javascript
// Verify URL is accessible before posting
const isAccessible = await this.verifyUrl(content.url);

if (!isAccessible) {
  console.error('ERROR: Article URL is not accessible!');
  console.error('Cannot post to social media with broken link');
  process.exit(1);
}
```

## Benefits

### For Users
✅ **No more 404 errors** when clicking social media links
✅ **Reliable links** - all posted URLs guaranteed accessible
✅ **Better user experience** - content is ready when announced

### For Workflows
✅ **Intelligent waiting** - checks URL status instead of blind waiting
✅ **Fail fast** - exits immediately if deployment fails
✅ **Better debugging** - clear error messages with HTTP status codes
✅ **Flexible timing** - adapts to actual deployment time (up to 60 min)

### For Maintainers
✅ **Clear failure modes** - workflow fails if URL not accessible
✅ **Actionable errors** - know exactly what failed and why
✅ **No silent failures** - prevents posting broken links
✅ **Better monitoring** - see deployment progress minute-by-minute

## How It Works

### Daily Feature Workflow
1. ✅ Generate feature article Markdown file
2. ✅ Commit and push to GitHub
3. ✅ **NEW:** Check article URL every minute until accessible (max 60 min)
4. ✅ **NEW:** Verify URL returns HTTP 200 status
5. ✅ **NEW:** Exit with error if URL not accessible
6. ✅ **NEW:** In posting script, verify URL again before sending
7. ✅ Post to Mastodon and Bluesky with verified accessible link

### Content Curator Workflow
1. ✅ Run curator, generate curated content
2. ✅ Commit and push to GitHub
3. ✅ **NEW:** Check blog URL every minute until accessible (max 60 min)
4. ✅ **NEW:** Verify blog URL returns HTTP 200 status
5. ✅ **NEW:** Exit with error if URL not accessible
6. ✅ **NEW:** In posting script, verify blog URL again before sending
7. ✅ Post to Mastodon and Bluesky with verified accessible link

## Testing

### Manual Testing
To test the fixes:

1. **Test deployment verification:**
   ```bash
   # Trigger daily feature workflow manually
   # Watch GitHub Actions logs for URL checking
   # Verify it waits until URL is accessible
   ```

2. **Test URL verification in scripts:**
   ```bash
   # Run posting script locally
   node scripts/post-daily-feature.js
   # Should fail if URL not accessible
   
   node scripts/social-post.js
   # Should fail if blog URL not accessible
   ```

### Expected Behavior

**When deployment succeeds:**
```
🔍 Verifying article URL is accessible...
✅ Article is live and accessible! (HTTP 200)
Verified at 2025-11-24 10:23:45 UTC
✅ Article URL verified accessible!
📤 Posting to Mastodon...
✅ Mastodon posted: https://mastodon.social/@3mpwrApp/...
📤 Posting to Bluesky...
✅ Bluesky posted: https://bsky.app/profile/...
```

**When deployment fails:**
```
⏳ Article not ready yet (HTTP 404) - waiting... (45/60 minutes)
⏳ Article not ready yet (HTTP 404) - waiting... (60/60 minutes)
❌ ERROR: Article not accessible after 60 minutes!
Last HTTP code: 404
Aborting social media posting to prevent 404 links.
```

## Files Modified

### Workflows
- `.github/workflows/daily-feature.yml`
  - Improved deployment verification
  - Active URL checking with HTTP status codes
  - Fail fast on inaccessible URLs

- `.github/workflows/content-curator.yml`
  - Improved deployment verification
  - Active URL checking with HTTP status codes
  - Fail fast on inaccessible URLs

### Scripts
- `scripts/post-daily-feature.js`
  - Added `verifyUrl()` method
  - Pre-posting URL verification
  - Exit on verification failure

- `scripts/social-post.js`
  - Added `verifyUrl()` method
  - Pre-posting URL verification
  - Exit on verification failure

## Deployment Time

**Typical Cloudflare Pages deployment:**
- **Build time:** 2-5 minutes
- **Deploy time:** 1-3 minutes
- **CDN propagation:** 1-5 minutes
- **Total:** 4-13 minutes average

**Maximum wait time configured:**
- **60 minutes** - generous buffer for slower deployments
- **Check interval:** Every 60 seconds
- **Early exit:** As soon as URL accessible

## Monitoring

Check workflow runs for deployment timing:
1. Go to GitHub Actions
2. Select "Daily Feature Article" or "Content Curator" workflow
3. Check "Wait for deployment" step logs
4. Review timing and HTTP status codes

## Future Improvements

Potential enhancements:
1. **Cloudflare API integration** - Check deployment status directly
2. **Webhook notifications** - Get notified when deployment completes
3. **Parallel verification** - Check multiple URLs simultaneously
4. **Deployment health checks** - Verify content integrity, not just accessibility
5. **Retry logic** - Automatic retry if posting fails

## Support

If issues persist:
1. Check GitHub Actions logs for detailed error messages
2. Verify Cloudflare Pages deployment status
3. Test URLs manually in browser
4. Check for DNS/CDN issues
5. Review posting script output

---

**Fixed:** November 24, 2025
**Status:** ✅ Deployed and Active
**Impact:** All automated social media posts
