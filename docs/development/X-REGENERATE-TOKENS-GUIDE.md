# X API: Regenerate Access Token & Access Token Secret

## Step-by-Step Guide

### 1. Go to X Developer Portal
- Visit: https://developer.twitter.com/en/portal/dashboard
- Sign in with your account

### 2. Select Your Project & App
- Click on your project (should be visible on dashboard)
- Select the **3mpwr App**

### 3. Navigate to Keys & Tokens
In the left sidebar, click:
- **Keys and Tokens** section
- You'll see three tabs:
  - **API Keys** (API Key & API Secret - these usually don't need regeneration)
  - **Bearer Token** (might show here)
  - **Access Token & Secret** (this is what we need to regenerate)

### 4. Regenerate Access Token & Secret

Under the **Access Token & Secret** section:

1. Look for the **"Regenerate"** button (usually blue)
2. Click **"Regenerate"**
3. You may be asked to confirm - click confirm
4. A modal will pop up showing:
   - New **Access Token** (looks like: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)
   - New **Access Token Secret** (looks like: `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

⚠️ **IMPORTANT**: These won't be shown again! Copy them immediately.

### 5. Copy Your New Credentials

From the modal, copy:
1. **Access Token** - Copy the full string
2. **Access Token Secret** - Copy the full string

(Keep them safe - you won't see them again in this session)

### 6. Update GitHub Secrets

Go to your GitHub repository:
- https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

Update these two secrets:

#### First Secret:
- **Name**: `X_ACCESS_TOKEN`
- **Value**: Paste your new Access Token (the long string from step 5)
- Click **Update secret**

#### Second Secret:
- **Name**: `X_ACCESS_TOKEN_SECRET`
- **Value**: Paste your new Access Token Secret
- Click **Update secret**

### 7. Verify Updated Secrets

In GitHub Secrets, you should now have:
- ✅ `X_ACCESS_TOKEN` - updated with new value
- ✅ `X_ACCESS_TOKEN_SECRET` - updated with new value
- `X_API_KEY` - (unchanged)
- `X_API_SECRET` - (unchanged)
- `X_BEARER_TOKEN` - (unchanged or regenerated earlier)

### 8. Test the New Credentials

Run the test script:
```bash
node test-x-posting.js
```

When prompted:
1. Enter your X Bearer Token
2. Choose "y" to also test OAuth 1.0a
3. Enter your new API Key
4. Enter your new API Secret
5. Enter your new Access Token
6. Enter your new Access Token Secret

### 9. Verify Your Test Tweet

If the test succeeds, check your X profile:
- Visit: https://x.com/3mpwrApp
- Look for the test tweet(s) starting with "🧪 Test from 3mpwr App"

---

## What Each Credential Does

| Credential | Purpose | Can Regenerate? |
|-----------|---------|-----------------|
| API Key | Identifies your app to X | Yes, but breaks existing apps |
| API Secret | Authenticates your app | Yes, but breaks existing apps |
| Bearer Token | Simple API v2 authentication | Yes, recommended |
| Access Token | OAuth user token for v1.1 | Yes, often needed |
| Access Token Secret | OAuth user secret for v1.1 | Yes, always needed with Access Token |

---

## Troubleshooting

### "Regenerate button not showing"
- You may not have the right app selected
- Check sidebar says "3mpwr App"
- Ensure you're in the right project

### "New tokens not working"
- Make sure you copied the ENTIRE token string (no extra spaces)
- Wait 1-2 minutes for GitHub to sync changes
- Try regenerating again if issue persists

### "Still getting 403 error"
- Verify "Read and Write" permissions are enabled on the app
- Try both Bearer Token AND OAuth methods in test script
- Check if rate limits have been exceeded

---

## Summary

✅ Visit https://developer.twitter.com/en/portal/dashboard
✅ Select 3mpwr App
✅ Click "Keys and Tokens"
✅ Find "Access Token & Secret" section
✅ Click "Regenerate" button
✅ Copy new tokens immediately
✅ Update GitHub Secrets with new values
✅ Test with test-x-posting.js script
✅ Verify test tweet appears on your profile
