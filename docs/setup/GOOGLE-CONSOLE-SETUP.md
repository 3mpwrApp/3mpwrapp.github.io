# Google Search Console Setup Guide

## Step-by-Step Verification

### 1. Access Google Search Console
1. Go to: https://search.google.com/search-console
2. Sign in with your Google account

### 2. Add Your Property
1. Click the **property selector** (top left, shows current sites if any)
2. Click **"+ Add property"**
3. You'll see two options:
   - **Domain** (requires DNS verification)
   - **URL prefix** ← Choose this one

4. Enter: `https://3mpwrapp.github.io`
5. Click **Continue**

### 3. Verify Ownership
1. You'll see several verification methods
2. Choose: **"HTML file"** (should be already selected)
3. It shows: `google92c2c14246b0aaae.html`
4. **Important:** The file is already uploaded! ✅
5. Click **"Verify"**

**Should see:** "Ownership verified" ✅

### 4. Submit Your Sitemap
After verification:
1. In left sidebar, click **"Sitemaps"**
2. Under "Add a new sitemap", enter: `sitemap.xml`
3. Click **"Submit"**

**Expected:** "Success" - Sitemap submitted

### 5. What to Check Daily/Weekly

**Coverage (Indexing):**
- Left sidebar → Coverage
- Shows pages indexed by Google
- Wait 24-48 hours for initial data

**Performance (Search Analytics):**
- Left sidebar → Performance
- Shows:
  - Total clicks from Google
  - Total impressions (how many times site appeared)
  - Average CTR (click-through rate)
  - Average position in search results
- Wait 2-3 days for initial data

**URL Inspection:**
- Top bar search: Enter any page URL
- Shows:
  - Is it indexed?
  - Any issues?
  - Mobile usability
- Click "Request Indexing" to speed up indexing

### 6. Submit Additional Sitemaps

Your site has multiple sitemaps. Submit these too:

```
sitemap.xml          (main sitemap)
feed.xml             (blog feed)
whats-new/feed.xml   (what's new feed)
```

For each one:
1. Sitemaps → Add new sitemap
2. Enter the path
3. Submit

### Common Issues & Solutions

**"Couldn't verify" error:**
- Wait 5 minutes (GitHub Pages rebuild delay)
- Make sure you're using HTTPS: `https://3mpwrapp.github.io`
- Check file is accessible: https://3mpwrapp.github.io/google92c2c14246b0aaae.html
- Try verification again

**"Sitemap couldn't be read":**
- Normal during first submission
- Wait 24 hours, it will process

**No data showing:**
- Takes 24-48 hours for first data
- Takes 2-3 days for search data
- Be patient!

### What You'll See in 1 Week

**Coverage Report:**
```
Valid pages: 50-100 (depends on your content)
Excluded pages: Some (normal - duplicates, redirects)
Errors: 0 (hopefully!)
```

**Performance Report:**
```
Impressions: 100-500 (how many times shown in search)
Clicks: 5-20 (actual visits from search)
Average position: 20-50 (will improve over time)
```

**Top Queries** (what people search):
- "workers compensation appeal"
- "disability claim letter"
- "3mpowr" (your brand)

### Weekly Actions

**Every Monday (5 minutes):**
1. Check Coverage → Any new errors?
2. Check Performance → What's trending up?
3. Check Top queries → What are people searching?
4. URL Inspection → Check your best pages

**Monthly Actions:**
1. Review top performing pages
2. Optimize content based on queries
3. Fix any indexing errors
4. Request indexing for new content

---

**Next:** Once verified, move to Cloudflare Pages setup!
