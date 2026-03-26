# GitHub Models Setup Guide

Your agents now use **GitHub Models API** (Claude via GitHub) instead of Anthropic.

## Step 1: Create GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name (e.g., "Empowr AI Agents")
4. Select scopes: Check **`repo`** and **`read:user`**
5. Click **"Generate token"**
6. **Copy the token** (starts with `ghp_`)

## Step 2: Set Environment Variable

**PowerShell:**
```powershell
$env:GITHUB_TOKEN = "ghp_YOUR-TOKEN-HERE"
```

**Or create `.env` file:**
```
GITHUB_TOKEN=ghp_YOUR-TOKEN-HERE
```

## Step 3: Deploy Agents

```powershell
npm run deploy
```

## Models Available

Your agents use **gpt-4o** via GitHub Models:
- ✅ Curation Agent - RSS feed monitoring (no API calls needed)
- ✅ Blog Agent - gpt-4o for content generation
- ✅ Email Agent - Personalized newsletter generation
- ✅ Recap Agent - Weekly synthesis

## Free Tier

GitHub Models provides free usage credits. Monitor your usage at:
https://github.com/marketplace/models

## Pricing

After free credits:
- **gpt-4o**: ~$0.003 per 1K input tokens
- **Monthly cost**: $50-100 for full system operation

---

**Everything is ready!** Just set your token and run `npm run deploy`.
