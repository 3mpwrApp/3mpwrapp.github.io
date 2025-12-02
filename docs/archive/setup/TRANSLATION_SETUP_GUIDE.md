# Translation Setup Guide

This guide explains how to complete the 428 missing i18n keys (214 Spanish + 214 French) using zero-budget approaches.

## Current Status

- **Missing Keys**: 214 ES + 214 FR = 428 total
- **Infrastructure**: ✅ Complete (scripts, output directory, CSV templates)
- **Translation**: ⏳ Pending - Choose approach below

## Option 1: DeepL API (RECOMMENDED) ⭐

**Best for**: Highest quality automated translations

### Features
- ✅ **Free tier**: 500,000 characters/month (enough for ~10-15 full translation runs)
- ✅ **No credit card required**
- ✅ **85-98% accuracy** (better than Google Translate)
- ✅ **Excellent for ES/FR language pairs**
- ✅ **Better context awareness**

### Setup (5 minutes)

1. **Sign up for free DeepL API**:
   - Visit: https://www.deepl.com/pro-api
   - Click "Sign up for free"
   - No credit card required
   - Verify email

2. **Get your API key**:
   - Log in to https://www.deepl.com/account/summary
   - Copy your "Authentication Key for DeepL API"

3. **Set environment variable**:
   ```powershell
   # Windows PowerShell (current session)
   $env:DEEPL_API_KEY="your-key-here"
   
   # Windows PowerShell (permanent - add to profile)
   [Environment]::SetEnvironmentVariable("DEEPL_API_KEY", "your-key-here", "User")
   
   # Then restart PowerShell
   ```

4. **Run translation**:
   ```bash
   node scripts/auto-translate-deepl.js
   ```

5. **Review outputs**:
   - `i18n-auto-translated/es-common.json` - Spanish translations
   - `i18n-auto-translated/fr-common.json` - French translations
   - `i18n-auto-translated/review-translations.csv` - For human review
   - `i18n-auto-translated/REPORT.md` - Translation summary

6. **Test and validate**:
   ```bash
   # Copy to locales
   cp i18n-auto-translated/es-common.json locales/es/common.json
   cp i18n-auto-translated/fr-common.json locales/fr/common.json
   
   # Validate
   npm run i18n:validate
   
   # Test in app
   npx expo start
   ```

### Monitoring Usage
- Dashboard: https://www.deepl.com/account/usage
- Limit: 500,000 chars/month
- Our usage: ~5,000-10,000 chars per run (1-2% of limit)

---

## Option 2: LibreTranslate (Self-Hosted)

**Best for**: Complete privacy, unlimited translations, no API keys

### Features
- ✅ **100% free and unlimited**
- ✅ **Open source** (AGPL-3.0 license)
- ✅ **All data stays local**
- ✅ **No API keys or accounts**
- ⚠️ **75-85% accuracy** (lower than DeepL)
- ⚠️ **Requires Docker** or Python setup

### Setup (15 minutes)

**Quick Start with Docker**:
```bash
# Pull and run LibreTranslate
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# In another terminal, run our script (modified for localhost)
node scripts/auto-translate-libre.js
```

**Alternative: Python Installation**:
```bash
# Install LibreTranslate
pip install libretranslate

# Run server
libretranslate --host 0.0.0.0 --port 5000

# Run our script
node scripts/auto-translate-libre.js
```

### Creating the Script

Create `scripts/auto-translate-libre.js`:
```javascript
// Same as auto-translate-deepl.js but change the translation function:

async function translateString(text, targetLang, retries = 3) {
  const response = await fetch('http://localhost:5000/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang === 'ES' ? 'es' : 'fr',
      format: 'text'
    })
  });
  
  const data = await response.json();
  return data.translatedText;
}
```

---

## Option 3: Community Translation

**Best for**: Native speaker accuracy, building community engagement

### Features
- ✅ **Highest quality** (native speakers)
- ✅ **Community building opportunity**
- ✅ **Cultural appropriateness**
- ⚠️ **Takes 1-2 weeks**
- ⚠️ **Requires coordination**

### Steps

1. **Export CSV**:
   ```bash
   # CSV already created at:
   i18n-auto-translated/review-translations.csv
   ```

2. **Post to GitHub Discussions**:
   - Category: "Help Wanted"
   - Title: "🌍 Help Translate 3mpwr App to Spanish/French"
   - Body template:
     ```markdown
     # Translation Help Needed 🌍
     
     We need native Spanish and French speakers to help translate 214 keys each!
     
     ## What You'll Do
     1. Download `review-translations.csv`
     2. Fill in "Spanish (Reviewed)" or "French (Reviewed)" columns
     3. Submit via comment or pull request
     
     ## Time Commitment
     - ~2-4 hours total
     - Can be split into batches
     - No technical skills required
     
     ## Why Help?
     - Make 3mpwr accessible to Spanish/French speakers
     - Get credited in CONTRIBUTORS.md
     - Help people with disabilities worldwide
     
     **Download CSV**: [Link to file]
     ```

3. **Alternative: Crowdin/Lokalise** (optional):
   - Create free project on Crowdin: https://crowdin.com/
   - Upload `en/common.json`
   - Invite community translators
   - Export translated files

4. **Review submissions**:
   - Check for consistency
   - Verify technical terms
   - Test in app

---

## Option 4: Manual Translation

**Best for**: Complete control, learning about the app

### Features
- ✅ **100% control**
- ✅ **Learn the app deeply**
- ✅ **No dependencies**
- ⚠️ **Time-consuming** (20-30 hours)
- ⚠️ **Requires bilingual skills**

### Steps

1. **Open CSV template**:
   ```bash
   # In Excel/Google Sheets
   open i18n-auto-translated/review-translations.csv
   ```

2. **Translate row by row**:
   - Read English text
   - Write Spanish translation
   - Write French translation
   - Save periodically

3. **Import back to JSON**:
   ```bash
   # Use provided conversion script
   node scripts/csv-to-json.js
   ```

4. **Validate**:
   ```bash
   npm run i18n:validate
   ```

---

## Hybrid Approach (RECOMMENDED for Production)

**Best quality**: DeepL + Community Review

### Workflow

1. **Auto-translate with DeepL** (1 hour):
   ```bash
   node scripts/auto-translate-deepl.js
   ```

2. **Test in app** (30 minutes):
   - Switch language to Spanish
   - Check all screens
   - Note issues

3. **Community review** (1-2 weeks):
   - Post CSV to GitHub Discussions
   - Ask for corrections/improvements
   - Focus on:
     - Technical terms (legal, medical)
     - Cultural appropriateness
     - Tone and formality

4. **Iterate** (30 minutes):
   - Apply community feedback
   - Re-validate
   - Final test

### Expected Quality

| Approach | Accuracy | Time | Cost |
|----------|----------|------|------|
| DeepL only | 85-95% | 1h | $0 |
| LibreTranslate only | 75-85% | 2h | $0 |
| Community only | 95-99% | 2w | $0 |
| Manual only | 95-99% | 30h | $0 |
| **DeepL + Community** | **98-99%** | **1h + 2w** | **$0** |

---

## Next Steps After Translation

1. **Copy translated files**:
   ```bash
   cp i18n-auto-translated/es-common.json locales/es/common.json
   cp i18n-auto-translated/fr-common.json locales/fr/common.json
   ```

2. **Validate translations**:
   ```bash
   npm run i18n:validate
   ```

3. **Test in app**:
   ```bash
   npx expo start
   # Change language in Settings
   # Test all features
   ```

4. **Update baselines**:
   ```bash
   npm run i18n:threshold:update
   ```

5. **Commit changes**:
   ```bash
   git add locales/
   git commit -m "i18n: complete ES/FR translations (214 keys each)"
   git push
   ```

---

## Troubleshooting

### DeepL API: "Invalid API key"
- Check key is copied correctly (no spaces)
- Verify environment variable: `echo $env:DEEPL_API_KEY`
- Try logging out and back into DeepL dashboard

### LibreTranslate: "Connection refused"
- Ensure Docker container is running: `docker ps`
- Check port 5000 is available: `netstat -an | findstr 5000`
- Try different port: `docker run -p 5001:5000 ...`

### CSV import issues
- Ensure UTF-8 encoding
- Check for commas in translations (escape properly)
- Verify column structure matches template

---

## Support

- **Questions**: Open GitHub Discussion
- **Bugs**: File GitHub Issue
- **DeepL API help**: https://support.deepl.com/
- **LibreTranslate docs**: https://github.com/LibreTranslate/LibreTranslate

---

## Contributing

Found a better translation approach? Please:
1. Document it here
2. Create a script in `scripts/`
3. Update this guide
4. Submit a pull request

Thank you for helping make 3mpwr accessible worldwide! 🌍
