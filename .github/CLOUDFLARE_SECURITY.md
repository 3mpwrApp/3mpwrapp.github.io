# 🛡️ Cloudflare Security for Jekyll Static Sites

## Overview

Your 3mpwrApp website uses **Cloudflare Pages** for hosting, giving you enterprise-grade security **completely free**.

**Key advantage**: Static sites have minimal attack surface + Cloudflare protection = Fort Knox security!

---

## ✅ Currently Active (Free Tier)

### 1. DDoS Protection (Unlimited & Automatic)
- **What it does**: Absorbs massive traffic spikes and malicious floods
- **Capacity**: Handles multi-Tbps attacks
- **Cost**: FREE (included automatically)
- **Configuration**: None needed (always on)

### 2. SSL/TLS Encryption
- **Certificate**: Free SSL certificate (auto-renews)
- **HTTPS**: All traffic encrypted in transit
- **TLS Version**: Modern TLS 1.3 support
- **Status**: ✅ Already enforced

### 3. Web Application Firewall (WAF) - Basic
- **Protections**: Common exploits blocked
- **OWASP Top 10**: Covered
- **Free Tier**: Basic rulesets included
- **Status**: ✅ Active

### 4. Bot Management - Basic
- **Challenges**: Suspicious bots get CAPTCHAs
- **Good Bots**: Search engines allowed
- **Bad Bots**: Scrapers and spammers blocked
- **Status**: ✅ Active

### 5. CDN Caching
- **Global Network**: 300+ data centers
- **Speed**: Assets served from nearest location
- **Bandwidth**: Unlimited (free tier)
- **Security**: Shields origin from direct access

---

## 📦 What's Already Configured

### Security Headers (in `_headers` file)

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' challenges.cloudflare.com; frame-src 'self' challenges.cloudflare.com; style-src 'self' 'unsafe-inline'
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), camera=(), microphone=()
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

**These headers protect against**:
- ✅ Clickjacking (X-Frame-Options: DENY)
- ✅ XSS attacks (CSP, X-XSS-Protection)
- ✅ MIME sniffing (X-Content-Type-Options)
- ✅ Protocol downgrade (HSTS with preload)
- ✅ Cross-origin attacks (COEP, COOP, CORP)

---

## 🔧 Optional Enhancements (Free Tier)

### 1. Enable Cloudflare Turnstile (CAPTCHA Replacement)

**What**: Privacy-friendly bot verification (no image puzzles!)  
**Cost**: FREE (1M requests/month)  
**Setup**: 5 minutes

#### Steps:
1. Go to: https://dash.cloudflare.com/ → Turnstile
2. Click: "Create widget"
3. Add domain: `3mpwrapp.pages.dev` (or custom domain)
4. Copy: Site Key and Secret Key
5. Add to forms on contact pages (if any)

**Code Example**:
```html
<!-- Add to form -->
<div class="cf-turnstile" data-sitekey="YOUR_SITE_KEY"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
```

### 2. Enable Enhanced Bot Fight Mode

**Path**: Cloudflare Dashboard → Security → Bots  
**Toggle**: "Bot Fight Mode" (FREE)

**What it does**:
- Blocks known malicious bots
- Challenges likely automated traffic
- Allows good bots (Googlebot, etc.)

**Trade-off**: May occasionally challenge legitimate users

### 3. Rate Limiting (Free Tier: 1 rule)

**Use case**: Protect API endpoints (if any)  
**Path**: Cloudflare Dashboard → Security → WAF → Rate limiting rules

**Example Rule**:
```
IF: Incoming Requests to /api/*
MATCH: More than 100 requests per minute
ACTION: Challenge or Block
```

**Note**: Your Jekyll site has no APIs, but useful if you add them later

### 4. Browser Integrity Check

**Path**: Security → Settings → Browser Integrity Check  
**Toggle**: ON (recommended)

**What it does**: Blocks requests from non-browser sources (curl, wget, etc.)  
**Impact**: Minimal for static sites

---

## 🚀 Cloudflare Pages Settings

### Recommended Configuration

1. **Build Settings** (automatic):
   - Framework: Jekyll
   - Build command: `jekyll build`
   - Output directory: `_site`

2. **Environment Variables** (if needed):
   - Stored in Cloudflare Dashboard
   - Never in code or git history

3. **Custom Domains** (optional):
   ```
   3mpwrapp.com → Cloudflare Pages
   www.3mpwrapp.com → Redirect to apex
   ```

4. **Preview Deployments** (automatic):
   - Every pull request gets preview URL
   - Test before merging to main

---

## 📊 What Cloudflare Free Tier Includes

| Feature | Free Tier Limit | Good For |
|---------|----------------|----------|
| **Bandwidth** | Unlimited | ✅ Perfect |
| **Requests** | Unlimited | ✅ Perfect |
| **DDoS Protection** | Unlimited | ✅ Perfect |
| **SSL Certificates** | Unlimited | ✅ Perfect |
| **CDN Caching** | Unlimited | ✅ Perfect |
| **Page Rules** | 3 rules | ✅ Enough |
| **Rate Limiting** | 1 rule | ✅ Sufficient (no APIs) |
| **Firewall Rules** | 5 rules | ✅ Sufficient |
| **Turnstile** | 1M requests/month | ✅ Plenty |

**Bottom line**: Free tier is perfect for static sites!

---

## 🛡️ Security Layers (Visual)

```
         Visitor → 3mpwrapp.pages.dev
                        ↓
    [1] Cloudflare DDoS Protection    ← Absorbs attacks (Tbps scale)
                        ↓
    [2] Bot Management                ← Blocks scrapers & spammers
                        ↓
    [3] Web Application Firewall      ← Blocks OWASP Top 10 exploits
                        ↓
    [4] SSL/TLS Encryption            ← Secures data in transit
                        ↓
    [5] Security Headers              ← CSP, HSTS, X-Frame-Options
                        ↓
    [6] CDN Cache                     ← Shields origin, speeds delivery
                        ↓
    [7] Static Files Only             ← No backend to exploit
                        ↓
           Safe Content Delivery
```

**7 layers of protection** - all free!

---

## 🔍 Monitoring & Alerts

### Cloudflare Analytics (Free)

**View**: Dashboard → Analytics & Logs

**Metrics available**:
- Total requests
- Bandwidth usage
- Cache hit ratio
- Threats blocked
- Top countries
- Top paths

**Recommendations**:
- Check weekly for unusual spikes
- Review threats blocked (confirms protection is working)
- Monitor cache hit ratio (>90% is great)

### Email Alerts (Free)

**Setup**: Dashboard → Notifications

**Recommended alerts**:
- SSL certificate expiring (shouldn't happen, but good to know)
- DDoS attack detected
- Firewall rule triggered

---

## 🚨 Incident Response (Free Tools)

### If You See Suspicious Traffic:

1. **Check Analytics**:
   - Dashboard → Analytics → Security
   - Look for spike in threats

2. **Enable "I'm Under Attack" Mode**:
   - Dashboard → Security → Settings
   - Toggle "I'm Under Attack Mode"
   - **Effect**: Every visitor gets JavaScript challenge
   - **Use**: Only during active attacks (reduces UX)

3. **Block Specific IPs/Countries** (if needed):
   - Dashboard → Security → WAF → Tools
   - Create IP access rule
   - FREE tier: Unlimited IP rules!

4. **Check Firewall Events**:
   - Dashboard → Security → Events
   - See what's being blocked/challenged

---

## 💡 Best Practices for Static Sites

### 1. Cache Everything
- **Why**: Reduces origin load, speeds up site
- **How**: Cloudflare → Rules → Page Rules
  ```
  Rule: 3mpwrapp.pages.dev/*
  Setting: Cache Level = Cache Everything
  Edge Cache TTL: 1 month (for static assets)
  ```

### 2. Purge Cache on Deploy
- **Why**: Ensure visitors see latest content
- **How**: Automatic with Cloudflare Pages (on each deploy)

### 3. Enable HSTS Preload
- **Why**: Browser always uses HTTPS (even first visit)
- **How**: Already in `_headers` - submit to: https://hstspreload.org/

### 4. Use SRI for External Scripts
- **What**: Subresource Integrity (ensures scripts aren't tampered)
- **Example**:
  ```html
  <script src="https://cdn.example.com/script.js" 
          integrity="sha384-..." 
          crossorigin="anonymous"></script>
  ```

---

## 📋 Security Checklist for Static Sites

- [x] SSL/TLS enforced (HTTPS)
- [x] Security headers deployed
- [x] DDoS protection active (Cloudflare)
- [x] Bot management enabled
- [x] WAF rules active
- [x] CDN caching optimized
- [x] No secrets in code
- [x] .gitignore protects credentials
- [ ] HSTS preload submitted (optional)
- [ ] Turnstile on forms (if needed)
- [ ] Rate limiting configured (if APIs exist)

---

## 🆘 Troubleshooting

### "Security header not showing in curl"
- **Cause**: Header defined in `_headers` but not deployed
- **Fix**: Redeploy site (commit + push triggers Cloudflare Pages build)
- **Verify**: `curl -I https://3mpwrapp.ca`

### "Site showing 'Checking your browser' challenge"
- **Cause**: Bot Fight Mode enabled (or "I'm Under Attack" mode)
- **Fix**: This is WORKING AS INTENDED during attacks
- **Disable**: Dashboard → Security → Settings (toggle off)

### "Cloudflare error 522 (Connection timed out)"
- **Cause**: Origin server not responding (shouldn't happen with Pages)
- **Fix**: Check Cloudflare Pages build logs
- **Rare**: Usually means build failed

---

## 🎓 Learning Resources

### Cloudflare Docs:
- **Pages**: https://developers.cloudflare.com/pages/
- **Security**: https://developers.cloudflare.com/fundamentals/security/
- **Turnstile**: https://developers.cloudflare.com/turnstile/

### Jekyll + Cloudflare:
- **Custom Headers**: https://developers.cloudflare.com/pages/platform/headers/
- **Redirects**: https://developers.cloudflare.com/pages/platform/redirects/
- **Build Configuration**: https://developers.cloudflare.com/pages/platform/build-configuration/

---

## 🎯 Summary

**Your static Jekyll website on Cloudflare Pages is inherently secure because**:

1. ✅ **No backend** - Nothing for hackers to exploit
2. ✅ **No database** - No data to breach
3. ✅ **Static files** - Pre-rendered, read-only
4. ✅ **Cloudflare** - Enterprise DDoS protection
5. ✅ **Security headers** - Prevents XSS, clickjacking, etc.
6. ✅ **SSL/TLS** - All traffic encrypted
7. ✅ **Free tier** - All critical features included

**Attack surface**: Minimal  
**Cost to secure**: $0  
**Effort**: < 30 minutes setup  
**Outcome**: Fort Knox security for a static site

---

**Last Updated**: January 13, 2026  
**Cloudflare Tier**: Free (recommended for static sites)  
**Security Status**: ✅ PRODUCTION-READY
