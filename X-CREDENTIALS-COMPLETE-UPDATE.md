# X Credentials - Complete GitHub Secrets Update Guide

## All 7 X Credentials to Update

You need to add/update these 7 secrets in GitHub:

### 1. X_API_KEY
- **Value:** `Pw03Ruj1bGlXrPOeZpG8mqj3c`
- **From:** X Developer Portal → 3mpwr App → Keys and Tokens → API Keys tab
- **Purpose:** Identifies your app

### 2. X_API_SECRET
- **Value:** `z0DKXUrKyJJtSZaSWypwQJm4kBTR6ZMWewNpUHAkcbirkuSwkf`
- **From:** X Developer Portal → 3mpwr App → Keys and Tokens → API Keys tab
- **Purpose:** Authenticates your app

### 3. X_ACCESS_TOKEN
- **Value:** `1957152900427190272-DTwzLV50AvsJHZGTFPjzk00eMZzAuX`
- **From:** X Developer Portal → 3mpwr App → Keys and Tokens → Access Token & Secret tab
- **Purpose:** OAuth 1.0a user authentication

### 4. X_ACCESS_TOKEN_SECRET
- **Value:** `T3JjjBrYZObxO2LwFXrAiFaPj5svvi6vYlCYybRZH9aiC`
- **From:** X Developer Portal → 3mpwr App → Keys and Tokens → Access Token & Secret tab
- **Purpose:** OAuth 1.0a user secret

### 5. X_BEARER_TOKEN
- **Value:** `AAAAAAAAAAAAAAAAAAAAAGKJ4wEAAAAA5w1phwcPlOIQJZCL66epEz5V43E%3Dpx3C5ssiSwQIPHYTOO7EAweYNnWo37X64AFsaNfLDCGPjSHqKM`
- **From:** X Developer Portal → 3mpwr App → Keys and Tokens → Bearer Token
- **Purpose:** API v2 authentication (for read operations)

### 6. X_CLIENT_ID
- **Value:** `bV9pVFljYWlpTm9ZV0tPX3NCUF86MTpjaQ`
- **From:** X Developer Portal → 3mpwr App → Settings → OAuth 2.0 Client ID
- **Purpose:** OAuth 2.0 client identification

### 7. X_CLIENT_SECRET
- **Value:** `-w6MowYqPaPwCu4zqHrb39dAKqHr6BYX3zUT8UZnqNjPkOugRS`
- **From:** X Developer Portal → 3mpwr App → Settings → Client Secret
- **Purpose:** OAuth 2.0 client authentication

---

## How to Update GitHub Secrets

### Step 1: Go to GitHub Secrets
Visit: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

### Step 2: For Each Credential

**If the secret ALREADY EXISTS:**
1. Find it in the list (e.g., `X_API_KEY`)
2. Click the **pencil icon** to edit
3. Clear the current value
4. Paste the new value from above
5. Click **Update secret**

**If the secret DOES NOT EXIST:**
1. Click **New repository secret**
2. Name: Enter the secret name (e.g., `X_API_KEY`)
3. Value: Paste the value from above
4. Click **Add secret**

### Step 3: Repeat for All 7 Secrets

Update in this order:
1. ⬜ X_API_KEY
2. ⬜ X_API_SECRET
3. ⬜ X_ACCESS_TOKEN
4. ⬜ X_ACCESS_TOKEN_SECRET
5. ⬜ X_BEARER_TOKEN
6. ⬜ X_CLIENT_ID
7. ⬜ X_CLIENT_SECRET

---

## Verification Checklist

After updating all 7 secrets, verify they're there:

Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

You should see all 7 secrets listed:
- ✅ X_API_KEY
- ✅ X_API_SECRET
- ✅ X_ACCESS_TOKEN
- ✅ X_ACCESS_TOKEN_SECRET
- ✅ X_BEARER_TOKEN
- ✅ X_CLIENT_ID
- ✅ X_CLIENT_SECRET

(Plus any other secrets like Mastodon ones)

---

## After Updating Secrets

### Test OAuth 1.0a Posting
Run: `node test-oauth1-posting.js`

When prompted, enter:
1. API Key: `Pw03Ruj1bGlXrPOeZpG8mqj3c`
2. API Secret: `z0DKXUrKyJJtSZaSWypwQJm4kBTR6ZMWewNpUHAkcbirkuSwkf`
3. Access Token: `1957152900427190272-DTwzLV50AvsJHZGTFPjzk00eMZzAuX`
4. Access Token Secret: `T3JjjBrYZObxO2LwFXrAiFaPj5svvi6vYlCYybRZH9aiC`

If successful ✅:
- You'll see "SUCCESS: Tweet Posted with OAuth 1.0a!"
- Check @3mpwrApp for the test tweet
- Daily automation is ready!

If failed ❌:
- Error will show 401 (invalid credentials) or other issue
- Double-check the values match X Developer Portal exactly
- No extra spaces before/after values

---

## Summary of Credentials

| Secret Name | Type | Uses |
|-----------|------|------|
| X_API_KEY | OAuth 1.0a | Identifies app |
| X_API_SECRET | OAuth 1.0a | Signs requests |
| X_ACCESS_TOKEN | OAuth 1.0a | User auth token |
| X_ACCESS_TOKEN_SECRET | OAuth 1.0a | User auth secret |
| X_BEARER_TOKEN | OAuth 2.0 | API v2 read-only |
| X_CLIENT_ID | OAuth 2.0 | Client identification |
| X_CLIENT_SECRET | OAuth 2.0 | Client authentication |

---

## What These Enable

✅ **OAuth 1.0a (4 credentials):**
- Posting tweets via API v1.1
- Full user context (read + write)
- Perfect for automated daily posting

✅ **OAuth 2.0 (2 credentials):**
- Client app authentication
- User authorization flow (for future use)

✅ **Bearer Token:**
- Simple read-only API v2 access
- Used for searching/reading tweets

---

## Next Steps After Updating

1. ✅ Update all 7 secrets in GitHub
2. ✅ Run test script to verify
3. ✅ Check @3mpwrApp for test tweet
4. ✅ Wait for 9 AM UTC for daily automation to run
5. ✅ Verify posts appear on X and Mastodon

**Ready to update the secrets?**
