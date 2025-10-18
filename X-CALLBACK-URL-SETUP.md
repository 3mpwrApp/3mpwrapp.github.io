# X Web App Callback URL Setup

## What is a Callback URL?

A **Callback URL** (also called **Redirect URI**) is where X sends the user back to after they authorize your app. It's required for Web Apps.

For automated posting (your use case), you can use a simple localhost or your website URL.

---

## Option 1: For Local Testing (Recommended First)

Use this for testing:
```
http://localhost:3000/callback
```

OR

```
http://localhost:8000/callback
```

Any localhost port works for local testing.

---

## Option 2: For Production (Your Website)

Since you have a website at `3mpwrapp.github.io`, you could use:

```
https://3mpwrapp.github.io/callback
```

OR

```
https://3mpwrapp.pages.dev/callback
```

(Use whichever matches your actual site URL)

---

## Option 3: For GitHub Actions Automation

Since this is automated posting (not user-facing), you could also use:

```
http://localhost:3000
```

The key is: **it must be the same URL you use in your authentication flow**.

---

## How to Set It Up

### Step 1: Go to X Developer Portal
- Visit: https://developer.twitter.com/en/portal/dashboard
- Sign in

### Step 2: Select Your App
- Click your project
- Select **3mpwr App**

### Step 3: Go to Settings
In the left sidebar, click:
- **Settings**

### Step 4: Find "Redirect URIs"

Scroll down to find:
- **"Redirect URIs"** or **"Callback URL"** field
- There should be a text input box

### Step 5: Add Your Callback URL

Paste ONE of these (choose based on your use case):

**For Local Testing:**
```
http://localhost:3000/callback
```

**For Production:**
```
https://3mpwrapp.github.io/callback
```

### Step 6: Save Settings

Click **Save** or **Update**

### Step 7: Regenerate Bearer Token

Once you've set the Callback URL:

1. Go to **Keys and Tokens** tab
2. Find **Bearer Token**
3. Click **Regenerate**
4. Copy the new token

This new token should now work for posting.

---

## For Your Automated Posting Use Case

Since you're using GitHub Actions for automated posting, here's what I recommend:

1. Set Callback URL to: `http://localhost:3000/callback`
   - This is just a placeholder since it's automated
   - GitHub Actions won't actually use it for user authorization

2. Regenerate Bearer Token after setting this

3. Use the new Bearer Token in your GitHub Secrets

---

## If You Don't Want a Callback URL

Some X app setups allow Application-Only Bearer Tokens that don't need Callback URLs. But for posting (which requires User Context), you need either:

- A Callback URL set, OR
- OAuth 1.0a credentials (API Key, Secret, Access Token, Access Token Secret)

Since PKCE isn't available for your app, try OAuth 1.0a instead.

---

## Next Steps

1. Set Callback URL to: `http://localhost:3000/callback`
2. Save Settings
3. Go to Keys and Tokens
4. Regenerate Bearer Token
5. Test again with the new token

OR

If Bearer Token still doesn't work, we'll use **OAuth 1.0a** authentication instead (which doesn't need PKCE).

---

## Quick Reference

**For 3mpwr App (Web App):**
- App Type: ✅ Web App
- Permissions: ✅ Read and Write
- Callback URL: → Set to `http://localhost:3000/callback`
- Bearer Token: → Regenerate after setting Callback URL

Then test posting with the new Bearer Token.
