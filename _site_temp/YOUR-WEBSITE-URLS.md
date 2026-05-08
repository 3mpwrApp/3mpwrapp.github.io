# Your Website URLs - Quick Reference

## ✅ YOUR REAL WEBSITE (USE THESE)

### Production URL (Cloudflare Pages - Recommended)
```
https://3mpwrapp.ca
```
- **Status**: ✅ Live and fully functional
- **Has**: All updates, user guide, cookie banner, accessibility settings
- **Speed**: Fast (global CDN)
- **When to use**: Always! This is your main site.

### GitHub Pages URL (Backup)
```
https://3mpwrapp.github.io
```
- **Status**: ✅ Live (updates 2-5 min after push)
- **Has**: Same content as Cloudflare
- **Speed**: Slower (no global CDN)
- **When to use**: If Cloudflare has issues

---

## ❌ IGNORE THESE URLs

### Preview Deployments (Cloudflare)
- `https://7314eccf.3mpwrapp.pages.dev` ← This is what confused you!
- `https://abc123.3mpwrapp.pages.dev`
- Any URL with random letters/numbers before `.3mpwrapp.pages.dev`

**What are these?**
- Temporary test versions created automatically by Cloudflare
- Created for each commit to test before going live
- **NOT meant for public use**
- Often incomplete or broken
- Automatically deleted after 30 days

**How to avoid them:**
- Always use `https://3mpwrapp.ca` (no prefix!)
- In Cloudflare dashboard, click "View production deployment" not "View preview"

---

## 🎯 Quick Test Right Now

**Step 1**: Open incognito window (Ctrl+Shift+N)

**Step 2**: Go to: `https://3mpwrapp.ca`

**Step 3**: You should see:
- ✅ Full homepage with hero section
- ✅ Navigation menu (Home, Features, User Guide, etc.)
- ✅ Cookie consent banner
- ✅ All styling and colors
- ✅ Working links

**Step 4**: Click "User Guide" - should go to: `https://3mpwrapp.ca/user-guide/`

---

## 🔍 How to Find Production URL in Cloudflare

1. Log into Cloudflare Dashboard
2. Click **Workers & Pages** (left sidebar)
3. Click **3mpwrapp** project
4. Look for **"Production"** deployment (has a star icon ⭐)
5. That's your real site: `https://3mpwrapp.ca`

**Ignore:**
- Preview deployments (have random codes)
- Branch deployments
- Any URL with a hash/code before the domain

---

## 📝 Bookmark These URLs

Save these in your browser bookmarks:

### For Daily Use
- **Live Site**: https://3mpwrapp.ca
- **GitHub Repo**: https://github.com/3mpowrApp/3mpwrapp.github.io

### For Monitoring
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Google Search Console**: https://search.google.com/search-console
- **Microsoft Clarity**: https://clarity.microsoft.com

---

## ⚠️ If Production Site Looks Wrong

1. **Clear cache**: Ctrl+F5 (hard refresh)
2. **Try incognito**: Ctrl+Shift+N (bypasses cache)
3. **Check Cloudflare**: Make sure production deployment succeeded
4. **Wait**: Sometimes takes 5-10 minutes for cache to clear

---

## 🚀 What to Share with Users

When you promote your site, use:
- **Main URL**: `https://3mpwrapp.ca`

Later, you can add a custom domain like `3mpwrapp.com` that points to this!

---

**Created**: October 13, 2025  
**Last Updated**: October 13, 2025
