# Social Media Automation Setup Guide

## 🎯 Overview

Your website already has **complete social media automation** built-in! You just need to add the API credentials to GitHub Secrets.

The automation will:
- ✅ Post curated news 3x daily (9 AM, 3 PM, 9 PM UTC)
- ✅ Auto-format posts for each platform
- ✅ Share top disability rights stories from Canada
- ✅ Include links back to your website
- ✅ Use relevant hashtags

---

## 📱 Platforms Supported

1. **Mastodon** - Decentralized social network
2. **Bluesky** - Open social network
3. **X (Twitter)** - Mainstream social platform

---

## 🔑 Step 1: Get API Credentials

### **Mastodon Setup**

1. **Create Account:**
   - Go to https://mastodon.social (or any Mastodon instance)
   - Click "Create account"
   - Verify your email

2. **Generate Access Token:**
   - Log in to Mastodon
   - Go to: Settings → Development → New Application
   - **Application name:** `3mpwrApp Curator`
   - **Scopes:** Check `write:statuses` and `read:accounts`
   - Click "Submit"
   - Copy the **Access token** (you'll need this)

3. **Save These Values:**
   - `MASTO_INSTANCE`: `mastodon.social` (or your chosen instance)
   - `MASTO_TOKEN`: [Your access token from above]

---

### **Bluesky Setup**

1. **Create Account:**
   - Go to https://bsky.app
   - Click "Create a new account"
   - Choose your handle (e.g., `3mpwrapp.bsky.social`)
   - Verify your email

2. **Generate App Password:**
   - Log in to Bluesky
   - Go to: Settings → App Passwords
   - Click "Add App Password"
   - **Name:** `3mpwrApp Curator`
   - Copy the generated password (shown only once!)

3. **Save These Values:**
   - `BLUESKY_HANDLE`: `your-handle.bsky.social`
   - `BLUESKY_PASSWORD`: [Your app password from above]

---

### **X (Twitter) Setup**

**Note:** X API requires a paid Developer account ($100/month for Basic tier). If you don't want to pay, you can skip X for now.

1. **Sign Up for Developer Account:**
   - Go to https://developer.twitter.com/en/portal/dashboard
   - Click "Sign up for Free Access" or upgrade to paid
   - Apply for API access (approval can take a few days)

2. **Create App:**
   - In Developer Portal, click "Create Project"
   - **Project name:** `3mpwrApp Curator`
   - **App name:** `3mpwrApp Social`
   - **Description:** `Automated disability rights news curation`

3. **Get API Keys:**
   - After creating app, click on the app name
   - Go to "Keys and tokens" tab
   - Generate and save ALL of these:
     - API Key (Consumer Key)
     - API Secret (Consumer Secret)
     - Access Token
     - Access Token Secret
     - Bearer Token

4. **Save These Values:**
   - `X_API_KEY`: [API Key/Consumer Key]
   - `X_API_SECRET`: [API Secret/Consumer Secret]
   - `X_ACCESS_TOKEN`: [Access Token]
   - `X_ACCESS_TOKEN_SECRET`: [Access Token Secret]
   - `X_BEARER_TOKEN`: [Bearer Token]

---

## 🔐 Step 2: Add Secrets to GitHub

1. **Go to GitHub Repository Settings:**
   - Navigate to: https://github.com/3mpwrApp/3mpwrapp.github.io/settings/secrets/actions

2. **Add Each Secret:**
   - Click "New repository secret"
   - Enter the **Name** exactly as shown below
   - Paste the **Value** from your notes
   - Click "Add secret"

### **Required Secrets:**

#### For Mastodon:
- **Name:** `MASTO_INSTANCE`  
  **Value:** `mastodon.social`

- **Name:** `MASTO_TOKEN`  
  **Value:** [Your Mastodon access token]

#### For Bluesky:
- **Name:** `BLUESKY_HANDLE`  
  **Value:** `your-handle.bsky.social`

- **Name:** `BLUESKY_PASSWORD`  
  **Value:** [Your Bluesky app password]

#### For X (Optional - if you have paid account):
- **Name:** `X_API_KEY`  
  **Value:** [Your X API Key]

- **Name:** `X_API_SECRET`  
  **Value:** [Your X API Secret]

- **Name:** `X_ACCESS_TOKEN`  
  **Value:** [Your X Access Token]

- **Name:** `X_ACCESS_TOKEN_SECRET`  
  **Value:** [Your X Access Token Secret]

- **Name:** `X_BEARER_TOKEN`  
  **Value:** [Your X Bearer Token]

---

## ✅ Step 3: Verify Setup

Once you've added the secrets:

1. **Test the Automation:**
   - Go to: https://github.com/3mpwrApp/3mpwrapp.github.io/actions
   - Click on "Content Curator (Unified)"
   - Click "Run workflow" (top right)
   - Select options:
     - Mode: `daily`
     - Force publish: `false`
     - Debug mode: `true` (for testing)
   - Click "Run workflow"

2. **Check Results:**
   - Wait 2-5 minutes
   - Click on the workflow run
   - Check the "Post to social media" step
   - Should see: `✅ Mastodon: Posted successfully` and `✅ Bluesky: Posted successfully`

3. **Verify Posts:**
   - Check your Mastodon account for the new post
   - Check your Bluesky account for the new post
   - Check X (if configured)

---

## 📅 Automatic Posting Schedule

Once configured, posts will automatically happen:

- **Morning:** 9:00 AM UTC (5:00 AM EST)
- **Midday:** 3:00 PM UTC (11:00 AM EST)
- **Evening:** 9:00 PM UTC (5:00 PM EST)

The workflow runs automatically - you don't need to do anything!

---

## 📝 What Gets Posted

Each post includes:
- 🕐 Time-based greeting (Good morning/Midday update/Evening digest)
- 📰 Date and story count
- 🌟 Random app feature highlight
- 📋 Top 2-5 curated stories with links
- 🔗 Link to https://3mpwrapp.pages.dev
- 🏷️ Hashtags: #Accessibility #DisabilityRights #DisabilityBenefits #News #Canada

**Example Post:**
```
☀️ Good morning! 📰 2025-10-21

3mpwrApp curated 8 stories on disability, accessibility & benefits.

🌟 Benefits Navigator: Find & apply for disability benefits across Canada

Today's Top Stories:

1. ODSP Rates to Increase in 2026
https://example.com/story1

2. Accessible Canada Act Enforcement Begins
https://example.com/story2

🔗 Visit: https://3mpwrapp.pages.dev

#Accessibility #DisabilityRights #DisabilityBenefits #News #Canada
```

---

## 🛠️ Troubleshooting

### "Post failed" errors:

**Mastodon:**
- Check token hasn't expired (regenerate if needed)
- Verify post isn't over character limit
- Check instance is up: https://mastodon.social/about

**Bluesky:**
- Verify app password is correct
- Check handle format: `username.bsky.social`
- Ensure account is active

**X:**
- Verify all 5 tokens are correct
- Check developer account is active
- Ensure API access tier allows posting

### No posts appearing:

1. Check GitHub Actions logs for errors
2. Verify secrets are named exactly as shown
3. Check if content curator found any stories (might be too early)
4. Enable debug mode and check detailed logs

---

## 💡 Pro Tips

1. **Start with 2 platforms:** Mastodon and Bluesky are free and easy
2. **Skip X initially:** Save $100/month until you need it
3. **Test manually first:** Use "Run workflow" before relying on schedule
4. **Monitor daily:** Check posts for first week to ensure quality
5. **Engage back:** Reply to comments/mentions on your posts

---

## 📊 Success Metrics

After setup, you can track:
- Number of successful posts per day
- Platform-specific engagement
- Click-throughs to your website
- Time slots with best engagement

Check GitHub Actions → Content Curator → Summary for stats.

---

## 🎯 Quick Start Checklist

- [ ] Create Mastodon account
- [ ] Generate Mastodon access token
- [ ] Create Bluesky account
- [ ] Generate Bluesky app password
- [ ] Add `MASTO_INSTANCE` to GitHub Secrets
- [ ] Add `MASTO_TOKEN` to GitHub Secrets
- [ ] Add `BLUESKY_HANDLE` to GitHub Secrets
- [ ] Add `BLUESKY_PASSWORD` to GitHub Secrets
- [ ] Run test workflow
- [ ] Verify posts appeared
- [ ] Wait for automatic posts (next scheduled time)

---

## 🆘 Need Help?

If you get stuck:
1. Check GitHub Actions logs for specific error messages
2. Verify all secret names match exactly (case-sensitive)
3. Test API credentials manually if needed
4. Reach out: empowrapp08162025@gmail.com

---

**Last Updated:** October 20, 2025
