# X App Permissions Fix - Step by Step

## The Problem
Your Bearer Token is "Application-Only" (read-only). You need "User Context" permissions to post.

## The Solution
You need to properly configure OAuth 2.0 User Context on your Native App.

---

## CRITICAL STEPS - Do These Exactly

### Step 1: Go to X Developer Portal
- URL: https://developer.twitter.com/en/portal/dashboard
- Sign in with your X account

### Step 2: Select Your App
- Click on your project name
- Click on **3mpwr App**

### Step 3: Go to Settings
In the left sidebar, click: **Settings**

### Step 4: CRITICAL - Find "User Authentication Settings"
Look for a section that says:
- "User Authentication Settings" OR
- "OAuth 2.0 settings" OR
- "Authentication Methods"

You should see options for:
- ☐ OAuth 1.0a
- ☐ OAuth 2.0 Authorization Code with PKCE
- ☐ OAuth 2.0 Bearer Token

### Step 5: ENABLE - OAuth 2.0 Authorization Code with PKCE
Check the box for: **OAuth 2.0 Authorization Code with PKCE**

If there's a question asking for "Redirect URIs", enter:
```
http://localhost:3000/callback
```

Click **Save**

### Step 6: Go Back to Keys and Tokens
In left sidebar, click: **Keys and Tokens**

### Step 7: REGENERATE Bearer Token
You should see a **Bearer Token** section. Click the **Regenerate** button (or trash icon to delete, then create new).

This new Bearer Token should now have **User Context** permissions.

### Step 8: Copy Your NEW Bearer Token
The full token string (should start with AAAA...)

Copy it completely, with no extra spaces.

### Step 9: Update GitHub Secret
Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

Find: **X_BEARER_TOKEN**

Click the pencil icon to edit it.

Clear the current value and paste your NEW Bearer Token.

Click **Update secret**

### Step 10: Wait 2-3 Minutes
GitHub sometimes needs time to sync secrets. Wait a bit.

### Step 11: Test Again
Run: `node test-bearer-analysis.js`

If the response changes from 403 to **201 SUCCESS**, you're done! ✅

---

## What Each Setting Does

| Setting | Purpose |
|---------|---------|
| OAuth 1.0a | User Context posting (API v1.1) |
| OAuth 2.0 with PKCE | User Context posting (API v2) |
| Redirect URI | Where X sends users after auth |
| Bearer Token | Simple token (Application-Only by default) |

For automated posting, you need either:
- OAuth 1.0a enabled (for /1.1/statuses/update.json)
- OR OAuth 2.0 PKCE enabled (for /2/tweets)

The Bearer Token should have User Context permissions once you enable PKCE.

---

## If You Can't Find These Settings

Sometimes X redesigns their interface. Look for:
1. A gear/settings icon
2. "App permissions" or "App settings"
3. Anything related to "OAuth", "authentication", or "tokens"

If the option isn't there, the app might need to be recreated with the right type selected.

---

## Summary

1. Go to X Developer Portal → 3mpwr App → Settings
2. Enable "OAuth 2.0 Authorization Code with PKCE"
3. Set Redirect URI to: `http://localhost:3000/callback`
4. Go to Keys and Tokens
5. Regenerate Bearer Token
6. Copy new token
7. Update GitHub Secret X_BEARER_TOKEN
8. Wait 2-3 minutes
9. Test with: `node test-bearer-analysis.js`

**This should fix the 403 error and give you User Context posting permissions!**

Let me know once you've done these steps and we can test.
