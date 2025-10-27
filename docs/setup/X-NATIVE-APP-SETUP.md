# X Native App - Regenerate All Credentials

## You Changed to Native App ✅

Good news! Native Apps are simpler for automated posting.

Now you need to **regenerate all your credentials** because they've changed.

---

## Step 1: Go to X Developer Portal

Visit: https://developer.twitter.com/en/portal/dashboard

Select: **3mpwr App**

---

## Step 2: Get Your New Credentials

Click: **Keys and Tokens** (left sidebar)

You should see different sections now. Gather these credentials:

### API Keys Section:
- **API Key** (copy the full string)
- **API Secret** (copy the full string)

### Access Token & Secret Section:
- **Access Token** (copy the full string)
- **Access Token Secret** (copy the full string)

### Bearer Token Section:
- **Bearer Token** (copy the full string)

---

## Step 3: Important - Check "Token Settings"

Look for a section called **"Token Settings"** or **"User Context"**

Make sure you see:
- ✅ "Read and Write" permission

If you don't see this, go to **Settings** and verify your app has **"Read and Write"** permissions.

---

## Step 4: Copy All 5 Credentials

You need:
1. **API Key**
2. **API Secret**
3. **Access Token**
4. **Access Token Secret**
5. **Bearer Token**

Copy each one carefully (full string, no spaces before/after).

---

## Step 5: Update GitHub Secrets

Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

Update these 5 secrets with your NEW values:
- `X_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN`
- `X_ACCESS_TOKEN_SECRET`
- `X_BEARER_TOKEN`

(You can keep the Client ID and Client Secret from before, or remove them - they're not needed for Native Apps)

---

## Step 6: Paste New Credentials Here

Once you have all 5 new credentials from X Portal, tell me:

```
API Key: [paste here]
API Secret: [paste here]
Access Token: [paste here]
Access Token Secret: [paste here]
Bearer Token: [paste here]
```

Or just update GitHub Secrets directly and let me know when done.

---

## Then We'll Test

Once all 5 are updated in GitHub, we'll run the OAuth 1.0a test again with the new credentials.

Native Apps are simpler - should work better!

---

## Native App Benefits

✅ Simpler authentication
✅ No complex OAuth 2.0 flow
✅ OAuth 1.0a usually works out of the box
✅ Perfect for automated posting

Let me know when you've regenerated the credentials!
