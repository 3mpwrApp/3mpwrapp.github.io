# 🚀 Quick Cloudflare Pages Setup (5 Minutes)

**Why Switch:** Cloudflare Pages activates your security headers (_headers file) and provides a global CDN for faster performance worldwide. **100% Free forever.**

## What You Keep
- ✅ GitHub Pages still works (nothing breaks)
- ✅ Same repository
- ✅ Automatic deployments on every commit
- ✅ You can use BOTH simultaneously

## Setup Steps

### 1. Sign Up for Cloudflare Pages (1 minute)
1. Go to: https://pages.cloudflare.com/
2. Click "Sign up" (no credit card required)
3. Use your email to create free account
4. Verify email

### 2. Connect GitHub Repository (2 minutes)
1. Click "Create a project"
2. Click "Connect to Git" → "GitHub"
3. Authorize Cloudflare Pages to access GitHub
4. Select repository: `3mpwrApp/3mpwrapp.github.io`
5. Click "Begin setup"

### 3. Configure Build Settings (1 minute)
Enter these exact settings:

```
Framework preset: Jekyll
Branch: main
Build command: bundle exec jekyll build
Build output directory: _site
Root directory: (leave empty)
```

**Environment Variables** - Click "Add variable":
```
Variable name: JEKYLL_ENV
Value: production
```

### 4. Deploy! (1 minute)
1. Click "Save and Deploy"
2. Wait 2-3 minutes for first build
3. You'll get a free URL: `https://3mpwrapp.pages.dev`

## After Deployment

### Test Your Site
1. Visit: `https://3mpwrapp.pages.dev`
2. Verify everything works
3. Check security headers:
   ```powershell
   curl -I https://3mpwrapp.pages.dev
   ```
   You should see:
   ```
   content-security-policy: default-src 'self'...
   x-frame-options: DENY
   strict-transport-security: max-age=63072000
   ```

### Enable Web Analytics (Optional, Free)
1. In Cloudflare dashboard → Web Analytics
2. Click "Enable"
3. No code needed - automatic
4. Zero cookies, GDPR compliant

## Using Both GitHub Pages AND Cloudflare Pages

**Recommended setup:**
- **GitHub Pages** (`3mpwrapp.github.io`) - Keep for GitHub ecosystem
- **Cloudflare Pages** (`3mpwrapp.pages.dev`) - Use as primary/production

**Why both:**
- Redundancy (if one is down, other works)
- GitHub Pages for community/open source visibility
- Cloudflare Pages for security headers and speed

**How it works:**
- Every `git push` automatically deploys to BOTH
- No extra work needed
- Zero cost for both

## Custom Domain (Optional)

If you have `3mpowr.org` or want to buy one:

1. In Cloudflare Pages dashboard
2. Click "Custom domains"
3. Click "Set up a custom domain"
4. Follow DNS instructions
5. Free SSL certificate auto-generated

**Free domain options:**
- `.github.io` (already have)
- `.pages.dev` (Cloudflare gives you)
- Buy domain: ~$12/year (optional, not required)

## Troubleshooting

**Build fails?**
- Check build log in Cloudflare dashboard
- Most common: Ruby version mismatch
- Solution: Add environment variable `RUBY_VERSION = 3.1.0`

**_headers file not working?**
- Verify in _config.yml:
  ```yaml
  include:
    - _headers
  ```
- Already done! ✅

**Google verification not working?**
- Verify in _config.yml:
  ```yaml
  include:
    - google92c2c14246b0aaae.html
  ```
- Already done! ✅

## What Changes

**Before (GitHub Pages only):**
- URL: `https://3mpwrapp.github.io`
- Security headers: Meta tags only (fallback)
- CDN: Basic
- Deploy time: ~2 minutes

**After (Cloudflare Pages):**
- URL: `https://3mpwrapp.pages.dev` (can use both)
- Security headers: Server-level (more secure)
- CDN: 275+ cities worldwide
- Deploy time: ~2 minutes
- Bonus: Free web analytics

## Support

**Cloudflare Docs:** https://developers.cloudflare.com/pages/  
**Community:** https://community.cloudflare.com/  
**Status:** https://www.cloudflarestatus.com/

---

**Cost:** $0  
**Time:** 5 minutes  
**Benefit:** Better security, faster globally, free analytics  
**Risk:** None (GitHub Pages still works)

**Ready?** Go to https://pages.cloudflare.com/ and start! 🚀
