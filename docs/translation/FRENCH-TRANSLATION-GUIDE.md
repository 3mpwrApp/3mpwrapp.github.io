# French Translation Guide - DeepL API

This guide explains how to translate the entire 3mpwr App website from English to French using the DeepL API.

## 🎯 Overview

The DeepL API has been configured and is ready to translate all website content. The translation system includes:

- **30+ pages** to translate (homepage, about, contact, legal pages, guides, etc.)
- **Automatic frontmatter translation** (titles, descriptions)
- **Content translation** with HTML/Liquid tag preservation
- **French permalink generation** (e.g., `/about` → `/fr/about`)
- **Language metadata** (`lang: fr`) added automatically

## 📋 Prerequisites

- DeepL API key is already configured in `scripts/translate-deepl.js`
- Node.js installed (v14 or higher)
- Internet connection to access DeepL API

## 🚀 Quick Start

### Option 1: Run via GitHub Actions (Recommended)

The easiest way to run translations with internet access:

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Select **"Translate Website to French with DeepL"** workflow
4. Click **"Run workflow"**
5. Wait for the workflow to complete
6. Translations will be automatically committed to the `fr/` directory

### Option 2: Run Locally

If you have access to the DeepL API from your local machine:

```bash
# Translate all pages
node scripts/translate-deepl.js

# Or use the batch script for better control
node scripts/batch-translate.js

# Translate only high-priority pages first
node scripts/batch-translate.js --priority-1

# See what would be translated without actually translating
node scripts/batch-translate.js --dry-run

# Skip pages that already have translations
node scripts/batch-translate.js --skip-existing
```

## 📁 Files Being Translated

### Priority 1 (Most Important - 13 pages)
- `index.md` → `fr/index.md` (Homepage)
- `about.md` → `fr/about.md`
- `contact.md` → `fr/contact.md`
- `/accessibility` → `fr//accessibility`
- `privacy.md` → `fr/privacy.md`
- `faq.md` → `fr/faq.md`
- `user-guide/index.md` → `fr/user-guide.md`
- `resources/index.md` → `fr/resources/index.md`
- `community/index.md` → `fr/community/index.md`
- `terms/index.md` → `fr/terms/index.md`
- `privacy/index.md` → `fr/privacy/index.md`
- `data-ownership/index.md` → `fr/data-ownership/index.md`

### Priority 2 (Important - 11 pages)
- `roadmap.md` → `fr/roadmap.md`
- `whats-new.md` → `fr/whats-new.md`
- `wellness/index.md` → `fr/wellness/index.md`
- `campaigns/index.md` → `fr/campaigns/index.md`
- `connect/index.md` → `fr/connect/index.md`
- `community-spotlight/index.md` → `fr/community-spotlight/index.md`
- `newsletter/index.md` → `fr/newsletter/index.md`
- `blog/index.md` → `fr/blog/index.md`
- `cookies/index.md` → `fr/cookies/index.md`
- `privacy-controls/index.md` → `fr/privacy-controls/index.md`
- `delete-data/index.md` → `fr/delete-data/index.md`
- `beta/index.md` → `fr/beta/index.md`

### Priority 3 (Nice to Have - 3 pages)
- `events/index.md` → `fr/events/index.md`
- `site-map/index.md` → `fr/site-map/index.md`
- `beta-guide/index.md` → `fr/beta-guide/index.md`
- `search/index.md` → `fr/search/index.md`

## 🔧 How It Works

### 1. Frontmatter Translation
The script automatically translates:
- `title:` fields
- `description:` fields
- `image_alt:` fields

And updates:
- `permalink:` to include `/fr/` prefix
- Adds or updates `lang: fr`

### 2. Content Translation
- Translates all markdown content in chunks
- Preserves HTML tags and structure
- Skips code blocks (```), Liquid tags ({% %}), and HTML comments
- Maintains formatting and spacing

### 3. Rate Limiting
- 1-second delay between API requests to respect DeepL rate limits
- Progress logging for each chunk translated

## 📊 Expected Results

After translation completes, you'll have:

```
fr/
├── index.md                 ✅ French homepage
├── about.md                 ✅ About page
├── contact.md               ✅ Contact page
├── /accessibility         ✅ Accessibility info
├── privacy.md               ✅ Privacy policy
├── faq.md                   ✅ FAQ
├── roadmap.md               ✅ Roadmap
├── whats-new.md             ✅ What's new
├── user-guide.md            ✅ User guide
├── campaigns/
│   └── index.md            ✅ Campaigns
├── connect/
│   └── index.md            ✅ Connect page
├── community-spotlight/
│   └── index.md            ✅ Community spotlight
├── newsletter/
│   └── index.md            ✅ Newsletter
├── blog/
│   └── index.md            ✅ Blog index
├── terms/
│   └── index.md            ✅ Terms of service
├── privacy/
│   └── index.md            ✅ Privacy details
├── data-ownership/
│   └── index.md            ✅ Data ownership
└── ... (and more)
```

## 🔍 Verification

After translation, verify:

1. **File count**: Check that all files were created
   ```bash
   find fr/ -name "*.md" -type f | wc -l
   ```

2. **Sample content**: Open a few translated files and verify:
   - Frontmatter has `lang: fr`
   - Permalinks start with `/fr/`
   - Content is in French
   - HTML/Liquid tags are preserved

3. **Test locally**: Run Jekyll to test the French pages
   ```bash
   bundle exec jekyll serve
   ```
   Then visit `http://localhost:4000/fr/` to see French content

## ⚠️ Troubleshooting

### "Could not resolve host: api-free.deepl.com"
- This happens in sandboxed/restricted environments
- **Solution**: Use GitHub Actions workflow or run locally

### "No translation returned"
- Check your DeepL API key validity
- Verify you haven't exceeded API quota
- Check DeepL API status at status.deepl.com

### Translation quality issues
- DeepL generally provides high-quality translations
- Review and manually adjust translations if needed
- Consider having a native French speaker review important pages

### Rate limiting errors
- The script includes 1-second delays
- If you still hit rate limits, you can increase the delay in `translate-deepl.js`

## 🎨 Customization

### Add more pages to translate

Edit `scripts/batch-translate.js` or `scripts/translate-deepl.js`:

```javascript
{
  source: 'your-page.md',
  target: 'fr/your-page.md',
  priority: 1  // 1 = high, 2 = medium, 3 = low
}
```

### Change translation settings

In `scripts/translate-deepl.js`, you can modify:

```javascript
const options = {
  target_lang: 'FR',        // Target language
  source_lang: 'EN',        // Source language
  preserve_formatting: '1', // Keep formatting
  tag_handling: 'html'      // Handle HTML tags
};
```

## 📈 Next Steps

After translation:

1. ✅ Review high-priority pages (homepage, about, contact)
2. ✅ Test all French pages locally
3. ✅ Update navigation to include language switcher
4. ✅ Add `hreflang` tags for SEO
5. ✅ Update sitemap to include French pages
6. ✅ Test all links and forms in French version
7. ✅ Consider hiring a native speaker for review

## 🤝 Need Help?

- Check DeepL API documentation: https://www.deepl.com/docs-api
- Review translation logs for specific errors
- Test with a single file first: `node scripts/translate-deepl.js` (modify to translate one file)

## 📝 Notes

- **API Key**: The DeepL API key in the script is already configured
- **Free tier**: DeepL Free API has limits (500,000 characters/month)
- **Character count**: The website has approximately 50,000-100,000 characters
- **Translation time**: Expect 10-30 minutes for all pages (with rate limiting)

---

Ready to translate? Run the GitHub Actions workflow or use the local script!
