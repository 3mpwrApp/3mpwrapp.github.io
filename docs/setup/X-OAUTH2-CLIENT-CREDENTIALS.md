# X OAuth 2.0 Client ID & Client Secret Setup

## What Are These?

For Web Apps with OAuth 2.0, X provides:
- **Client ID** - Identifies your app to X
- **Client Secret** - Authenticates your app with X

These are DIFFERENT from API Key/Secret and Bearer Token.

---

## Where to Find Them

### Step 1: Go to X Developer Portal
- Visit: https://developer.twitter.com/en/portal/dashboard
- Sign in

### Step 2: Select Your App
- Click your project
- Select **3mpwr App**

### Step 3: Go to Settings
In the left sidebar, click:
- **Settings**

### Step 4: Look for OAuth 2.0 Client Credentials

Scroll down until you find:
- **"OAuth 2.0 Client ID"** (looks like: `1234567890abcdefghij1234567890`)
- **"Client Secret"** (looks like: `abcDEF123ghi456JKL789mno_XYZ`)

⚠️ **IMPORTANT**: Client Secret won't be shown again after you close this page!

---

## Step 5: Copy Both Values

1. Copy your **Client ID** (full string)
2. Copy your **Client Secret** (full string - save it somewhere safe!)

---

## Step 6: Add to GitHub Secrets

Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

### Add First Secret:
- **Name**: `X_CLIENT_ID`
- **Value**: Paste your Client ID
- Click **Add secret**

### Add Second Secret:
- **Name**: `X_CLIENT_SECRET`
- **Value**: Paste your Client Secret
- Click **Add secret**

---

## Your X Credentials in GitHub (Complete List)

After adding Client ID and Secret, you should have:

| Secret Name | What It Is | Status |
|-----------|-----------|---------|
| X_API_KEY | API Key from Keys & Tokens | ✅ Should have |
| X_API_SECRET | API Secret from Keys & Tokens | ✅ Should have |
| X_ACCESS_TOKEN | Access Token from Keys & Tokens | ✅ Should have |
| X_ACCESS_TOKEN_SECRET | Access Token Secret from Keys & Tokens | ✅ Should have |
| X_BEARER_TOKEN | Bearer Token from Keys & Tokens | ✅ Should have |
| X_CLIENT_ID | OAuth 2.0 Client ID from Settings | ⏳ ADD THIS |
| X_CLIENT_SECRET | OAuth 2.0 Client Secret from Settings | ⏳ ADD THIS |

---

## After Adding Client ID & Secret

1. ✅ Set Callback URL to `http://localhost:3000/callback` (in Settings)
2. ✅ Regenerate Bearer Token (in Keys & Tokens)
3. ✅ Add X_CLIENT_ID to GitHub Secrets
4. ✅ Add X_CLIENT_SECRET to GitHub Secrets
5. ✅ Update X_BEARER_TOKEN with new regenerated token

Then test posting again.

---

## Why You Need These

For OAuth 2.0 authentication with posting:
- **Bearer Token** alone = Application-Only (can't post)
- **Bearer Token + Client ID + Client Secret** = Can do User Context auth (can post)

X uses the Client ID and Secret to authorize that it's really your app making the request.

---

## Summary

1. Go to X Developer Portal → 3mpwr App → Settings
2. Find and copy **OAuth 2.0 Client ID**
3. Find and copy **Client Secret**
4. Add both to GitHub Secrets as `X_CLIENT_ID` and `X_CLIENT_SECRET`
5. Test posting again

These should help the Bearer Token work correctly for posting!
