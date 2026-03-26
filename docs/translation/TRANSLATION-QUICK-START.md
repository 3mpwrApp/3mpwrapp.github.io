# 🌍 Quick Start: Translate Website to French

## ⚡ Immediate Action Required

Your DeepL API key is configured and ready! To translate all 30+ pages from English to French:

### Option 1: GitHub Actions (Easiest - Recommended) ⭐

1. **Go to your repository**: https://github.com/3mpwrApp/3mpwrapp.github.io
2. **Click the "Actions" tab**
3. **Find "Translate Website to French with DeepL"** in the workflow list
4. **Click "Run workflow"** button (top right)
5. **Click the green "Run workflow" button** to confirm
6. **Wait ~15-30 minutes** for completion
7. **Translations will be automatically committed** to the `fr/` directory

✅ This method works because GitHub Actions has internet access to call the DeepL API.

### Option 2: Run Locally (If you prefer)

```bash
cd /path/to/3mpwrapp.github.io
node scripts/translate-deepl.js
```

Or use the batch script with priorities:

```bash
# Translate high-priority pages first (homepage, about, contact, etc.)
node scripts/batch-translate.js --priority-1

# Then translate medium-priority pages
node scripts/batch-translate.js --priority-2

# Finally translate low-priority pages
node scripts/batch-translate.js --priority-3

# Or translate everything at once
node scripts/batch-translate.js
```

## 📊 What Will Be Translated

**30+ pages including:**
- ✅ Homepage (`/fr/`)
- ✅ About, Contact, FAQ
- ✅ Privacy Policy, Terms of Service
- ✅ User Guide, Resources
- ✅ Community, Campaigns, Connect
- ✅ Newsletter, Blog
- ✅ Accessibility, Wellness
- ✅ And many more...

## 📖 Full Documentation

See **FRENCH-TRANSLATION-GUIDE.md** for:
- Complete file list
- Troubleshooting
- Customization options
- Verification steps

## ⏱️ Estimated Time

- **GitHub Actions**: 15-30 minutes (automated)
- **Local**: 20-40 minutes (depending on your internet speed)

## 🎯 After Translation

1. Check the `fr/` directory for all translated files
2. Test locally: `bundle exec jekyll serve` and visit `http://localhost:4000/fr/`
3. Verify key pages are properly translated
4. Review and adjust any translations if needed

---

**Ready?** Go to [GitHub Actions](https://github.com/3mpwrApp/3mpwrapp.github.io/actions) and run the workflow! 🚀
