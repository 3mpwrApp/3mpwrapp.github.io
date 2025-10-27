# Free Cloudflare Pages Deployment Guide

**Cost:** $0 (Forever Free Plan)  
**Benefits:** 
- Unlimited bandwidth
- Server-level security headers (_headers file support)
- Global CDN (faster worldwide)
- Automatic HTTPS
- Preview deployments for PRs
- Web analytics (privacy-friendly, free)
- DDoS protection

## Step-by-Step Setup (5 Minutes)

### 1. Create Cloudflare Account
1. Go to https://pages.cloudflare.com/
2. Sign up with email (100% free, no credit card)
3. Verify email

### 2. Connect GitHub Repository
1. Click "Create a project"
2. Click "Connect to Git"
3. Authorize Cloudflare to access GitHub
4. Select repository: `3mpwrApp/3mpwrapp.github.io`
5. Click "Begin setup"

### 3. Configure Build Settings
```
Production branch: main
Build command: bundle exec jekyll build
Build output directory: _site
Root directory: /
```

**Environment Variables:**
```
JEKYLL_ENV = production
RUBY_VERSION = 3.1.0
```

### 4. Deploy!
- Click "Save and Deploy"
- Wait 2-3 minutes for first build
- You'll get a free subdomain: `3mpwrapp.pages.dev`

### 5. Add Custom Domain (Optional, Free)
1. In Cloudflare Pages dashboard, click "Custom domains"
2. Click "Set up a custom domain"
3. Enter: `3mpwrapp.org` (or your domain)
4. Follow DNS configuration steps
5. Free SSL certificate auto-generated

## Verification

After deployment, verify security headers:
```bash
curl -I https://3mpwrapp.pages.dev
```

You should see:
```
content-security-policy: default-src 'self'; script-src...
x-frame-options: DENY
strict-transport-security: max-age=63072000
```

## Free Cloudflare Features to Enable

### 1. Web Analytics (Privacy-Friendly)
- Dashboard → Web Analytics → Enable
- Zero cookies, GDPR compliant
- No impact on page speed
- Free forever

### 2. Waiting Room (for high traffic events)
- Protects site during traffic spikes
- Free tier: 1 waiting room
- Perfect for campaign launches

### 3. Email Routing (Free Email)
- Get @3mpwrapp.org email addresses
- Forward to personal email
- Unlimited addresses, free forever

### 4. R2 Storage (Free Tier)
- 10 GB storage free
- Perfect for hosting PDFs, images
- No egress fees

## GitHub Pages vs Cloudflare Pages

| Feature | GitHub Pages | Cloudflare Pages |
|---------|-------------|------------------|
| Cost | Free | Free |
| Bandwidth | Free | Free (unlimited) |
| Build time | ~2 min | ~2 min |
| **Security headers** | ❌ No _headers support | ✅ Full _headers support |
| **CDN locations** | Limited | 275+ cities worldwide |
| **DDoS protection** | Basic | Enterprise-grade |
| **Web analytics** | Need GA | Free, privacy-friendly |
| **Preview deploys** | No | ✅ Yes |
| Custom domains | 1 | Unlimited |

## Recommended Setup

**Use BOTH (best of both worlds):**

1. **GitHub Pages:** Keep as primary for GitHub ecosystem integration
   - URL: `3mpwrapp.github.io`
   - Automatic Jekyll builds
   - Great for community contributions

2. **Cloudflare Pages:** Use as production with custom domain
   - URL: `3mpwrapp.org` or `app.3mpowr.org`
   - Server-level security headers
   - Global CDN performance
   - Advanced features

**Setup:**
- Point custom domain to Cloudflare Pages
- Keep GitHub Pages URL as backup/staging
- Both deploy automatically on git push!

## Troubleshooting

### Build Fails
**Issue:** Ruby version mismatch  
**Solution:** Add to environment variables:
```
RUBY_VERSION = 3.1.0
JEKYLL_ENV = production
```

### _headers Not Working
**Issue:** File not in _site folder  
**Solution:** Add to `_config.yml`:
```yaml
include:
  - _headers
```

### Custom Domain Not Working
**Issue:** DNS propagation  
**Solution:** Wait 5-10 minutes, clear browser cache

## Support Resources

- **Cloudflare Docs:** https://developers.cloudflare.com/pages/
- **Community Forum:** https://community.cloudflare.com/
- **24/7 Support:** Free tier includes community support
- **Status Page:** https://www.cloudflarestatus.com/

## Migration Checklist

- [ ] Create Cloudflare account
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Wait for first successful deploy
- [ ] Verify _headers file working (curl -I)
- [ ] Test all pages and functionality
- [ ] Enable Cloudflare Web Analytics
- [ ] (Optional) Configure custom domain
- [ ] Update links in documentation
- [ ] Announce new URL to community

---

**Total Cost:** $0  
**Setup Time:** 5 minutes  
**Maintenance:** Zero (automatic deployments)
