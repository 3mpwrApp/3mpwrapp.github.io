# X API Authentication Fix - User Context Required

## The Problem

Your X app is configured for **Application-Only** authentication, but posting tweets requires **User Context** authentication.

Error message:
```
Authenticating with OAuth 2.0 Application-Only is forbidden for this endpoint.
Supported authentication types are [OAuth 1.0a User Context, OAuth 2.0 User Context].
```

This is a **permissions issue on the X app**, not a credential issue.

---

## The Solution: Enable User Context Authentication

### Step 1: Go to X Developer Portal
- Visit: https://developer.twitter.com/en/portal/dashboard
- Sign in

### Step 2: Select Your App
- Click on your project
- Select **3mpwr App**

### Step 3: Go to App Settings
In the left sidebar, click:
- **Settings** (not "Keys and Tokens" - that's different)

### Step 4: Find "Authentication Settings"

Scroll down to find the section called:
- **"Authentication Settings"** or **"App Settings"**

Look for options like:
- ✅ OAuth 1.0a
- ✅ OAuth 2.0 Authorization Code with PKCE  
- ✅ OAuth 2.0 Bearer Token

### Step 5: Enable OAuth 2.0 User Context

You need to enable:
- **OAuth 2.0 Authorization Code with PKCE** (User Context)

Check the box to enable it, then save.

### Step 6: Set Redirect URIs (if required)

If prompted for "Redirect URIs" when enabling OAuth 2.0:
- Add: `http://localhost:3000/callback` (for local testing)
- Or: `https://3mpwrapp.github.io/callback` (for your site)

Save the changes.

### Step 7: Regenerate Bearer Token

Now regenerate your Bearer Token:
1. Go to **Keys and Tokens** tab
2. Find **Bearer Token**
3. Click the **"Regenerate"** button
4. Copy the new Bearer Token

This new token will have User Context permissions.

### Step 8: Update GitHub Secret

Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

- Find **X_BEARER_TOKEN**
- Update it with your new Bearer Token from Step 7

### Step 9: Test Again

Run the test again:
```bash
node test-x-posting.js
```

---

## Alternative: Use OAuth 1.0a Only

If OAuth 2.0 User Context is complicated, you can stick with **OAuth 1.0a** (which should already be enabled):

### For OAuth 1.0a to work:

1. Go to X Developer Portal → 3mpwr App → Settings
2. Ensure **"OAuth 1.0a"** is enabled ✅
3. Go to **Keys and Tokens**
4. Look at the **Access Token & Secret** tab
5. Verify you have:
   - ✅ API Key
   - ✅ API Secret
   - ✅ Access Token
   - ✅ Access Token Secret

All 4 must exist and match what's in GitHub Secrets.

If any are missing or don't match:
- Regenerate them
- Update GitHub Secrets
- Test again

---

## Quick Checklist

Before testing again, verify:

- [ ] X app has "Read and Write" permissions (in App Permissions)
- [ ] OAuth 2.0 User Context is enabled (in Authentication Settings)
- [ ] Bearer Token was regenerated after enabling OAuth 2.0 User Context
- [ ] GitHub Secret `X_BEARER_TOKEN` has the new Bearer Token
- [ ] All OAuth 1.0a credentials (4 items) match X Developer Portal
- [ ] All GitHub Secrets updated with correct values

---

## Still Not Working?

If you still get 403 or 401 after these steps:

1. **Regenerate ALL 5 X credentials fresh** in X Developer Portal
2. **Update ALL 5 in GitHub Secrets** with exact copies
3. **Wait 1-2 minutes** for GitHub to sync
4. **Test again**

Sometimes X API takes time to propagate permission changes.

---

## Summary of All 5 Credentials

| Name | Location in X Portal | Purpose |
|------|----------------------|---------|
| X_API_KEY | Keys and Tokens → API Keys tab | App identification |
| X_API_SECRET | Keys and Tokens → API Keys tab | App authentication |
| X_ACCESS_TOKEN | Keys and Tokens → Access Token & Secret tab | User authentication (OAuth 1.0a) |
| X_ACCESS_TOKEN_SECRET | Keys and Tokens → Access Token & Secret tab | User authentication secret (OAuth 1.0a) |
| X_BEARER_TOKEN | Keys and Tokens → Bearer Token (or main tab) | API v2 authentication (requires User Context) |

All must be correctly set for both API v2 and API v1.1 posting to work.
