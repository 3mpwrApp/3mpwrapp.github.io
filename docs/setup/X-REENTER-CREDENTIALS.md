# Re-Enter X Credentials in GitHub Secrets

## What You Need to Do

You have **5 X credentials** that need to be in GitHub Secrets. Go to:
https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

### The 5 Credentials to Update:

1. **X_API_KEY**
   - What it is: Your X app's API Key
   - Where to get it: X Developer Portal → 3mpwr App → Keys and Tokens → API Key (under API Keys tab)
   - Example: `abcDEF123ghi456JKL789mno`

2. **X_API_SECRET**
   - What it is: Your X app's API Secret
   - Where to get it: X Developer Portal → 3mpwr App → Keys and Tokens → API Secret (under API Keys tab)
   - Example: `xyzABC123def456GHI789jkl`

3. **X_ACCESS_TOKEN**
   - What it is: Your OAuth Access Token
   - Where to get it: X Developer Portal → 3mpwr App → Keys and Tokens → Access Token (under Access Token & Secret tab)
   - Example: `1234567890-abcDEF123ghi456JKL789mno`

4. **X_ACCESS_TOKEN_SECRET**
   - What it is: Your OAuth Access Token Secret
   - Where to get it: X Developer Portal → 3mpwr App → Keys and Tokens → Access Token Secret (under Access Token & Secret tab)
   - Example: `abcDEF123ghi456JKL789mnoXYZ`

5. **X_BEARER_TOKEN**
   - What it is: Your Bearer Token for API v2
   - Where to get it: X Developer Portal → 3mpwr App → Keys and Tokens → Bearer Token
   - Example: `AAAAABCDEFabcdef123456...`

## Steps to Update Each One

### For Each Credential:

1. Go to: https://github.com/3mpowrApp/3mpwrapp.github.io/settings/secrets/actions

2. Find the secret name (e.g., `X_API_KEY`)
   - If it exists, click the **pencil icon** to edit it
   - If it doesn't exist, click **New repository secret**

3. Clear the current value and paste your new value

4. Click **Update secret** (or **Add secret** for new ones)

5. Repeat for all 5 credentials

## Your Checklist

- [ ] X_API_KEY - Updated with correct value
- [ ] X_API_SECRET - Updated with correct value  
- [ ] X_ACCESS_TOKEN - Updated with correct value
- [ ] X_ACCESS_TOKEN_SECRET - Updated with correct value
- [ ] X_BEARER_TOKEN - Updated with correct value

## Where to Find All 5 in X Developer Portal

1. Log in: https://developer.twitter.com/en/portal/dashboard
2. Select your **3mpwr App**
3. Go to: **Keys and Tokens**

You'll see:
- **API Keys tab**: Contains API Key & API Secret
- **Access Token & Secret tab**: Contains Access Token & Access Token Secret  
- **Bearer Token tab** (or shown in first tab): Contains Bearer Token

Copy each value and paste into the corresponding GitHub Secret.

## Need Help Finding Them?

All 5 credentials are in one place:
→ https://developer.twitter.com/en/portal/dashboard
→ Select project → Select 3mpwr App
→ Click "Keys and Tokens" in left sidebar

You should see all 5 values there.
