# Social Media API Integration Guide

## Overview

The 3mpwrApp social media automation now supports direct API integration with all major platforms. This eliminates manual copy-paste and enables true automated posting.

## Supported Platforms

- **X (Twitter)** - Via official API v2
- **Mastodon** - Via REST API
- **Facebook** - Via Graph API
- **Instagram** - Via Graph API

## Setup Instructions

### 1. X (Twitter) API v2

#### Prerequisites
- X Developer Account with API access
- Project created in X Developer Portal

#### Steps
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Navigate to your project's "Keys and tokens"
3. Copy your **Bearer Token**
4. Set environment variable:
   ```
   X_API_KEY=your_bearer_token_here
   ```

#### API Limits
- Free tier: 300 tweets per 15-minute window
- Academic tier: 2M tweets per 15-minute window

### 2. Mastodon REST API

#### Prerequisites
- Mastodon account on any server (mastodon.social, fosstodon.org, etc.)
- Admin access to create application token

#### Steps
1. Log into your Mastodon account
2. Go to Settings → Development → New Application
3. Fill in:
   - Name: `3mpwrApp`
   - Redirect URI: `urn:ietf:wg:oauth:2.0:oob`
   - Scopes: `write:statuses` (minimum required)
4. Create and copy the **Access Token**
5. Set environment variables:
   ```
   MASTODON_INSTANCE=mastodon.social
   MASTODON_ACCESS_TOKEN=your_access_token_here
   ```

#### Server Considerations
- Our primary: mastodon.social (@3mpwrapp)
- Backup/European: fosstodon.org
- Post character limit: 500 characters

### 3. Facebook Graph API

#### Prerequisites
- Facebook Page (already created at facebook.com/3mpowrapp)
- Facebook Developer App
- Admin role on the page

#### Steps
1. Go to https://developers.facebook.com/
2. Create or select an app
3. Add "Pages" product
4. Go to Settings → Basic and copy **App ID** and **App Secret**
5. Generate a long-lived Page Access Token:
   - Go to Tools → Access Token Debugger
   - Use a page access token
   - Exchange for long-lived token
6. Get your Page ID from facebook.com/3mpowrapp
7. Set environment variables:
   ```
   FACEBOOK_PAGE_ID=your_page_id_here
   FACEBOOK_ACCESS_TOKEN=your_long_lived_token_here
   ```

#### API Limits
- Up to 6,000 posts per 24-hour period
- Individual post character limit: No strict limit, but ~63,206 characters

### 4. Instagram Business Account

#### Prerequisites
- Instagram Business Account (linked to Facebook Page)
- Facebook Developer App with Instagram Graph API access
- Meta Business Suite setup

#### Steps
1. In Facebook Developer, add Instagram product
2. Get your Business Account ID:
   - Go to Meta Business Suite
   - Settings → Instagram Accounts
   - Copy the Account ID
3. Generate Instagram Access Token (same process as Facebook)
4. Set environment variables:
   ```
   INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id_here
   INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
   ```

#### API Limits
- Carousel posts: 2-10 items
- Caption length: 2,200 characters
- Monthly publishing limit: Varies by account age/verification

## Configuration

### Option 1: Environment Variables (Recommended for Production)

Set environment variables before running:

```bash
export X_API_KEY="your_x_bearer_token"
export MASTODON_INSTANCE="mastodon.social"
export MASTODON_ACCESS_TOKEN="your_mastodon_token"
export FACEBOOK_PAGE_ID="your_page_id"
export FACEBOOK_ACCESS_TOKEN="your_facebook_token"
export INSTAGRAM_BUSINESS_ACCOUNT_ID="your_account_id"
export INSTAGRAM_ACCESS_TOKEN="your_instagram_token"

node scripts/daily-curation.js
```

### Option 2: .env File (Recommended for Development)

Create `.env` file in project root:

```bash
# X (Twitter) API
X_API_KEY=your_x_bearer_token

# Mastodon API
MASTODON_INSTANCE=mastodon.social
MASTODON_ACCESS_TOKEN=your_mastodon_token

# Facebook Graph API
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_facebook_token

# Instagram Graph API
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
INSTAGRAM_ACCESS_TOKEN=your_instagram_token
```

**⚠️ Important:** Add `.env` to `.gitignore` to prevent committing secrets!

### Option 3: GitHub Secrets (For GitHub Actions)

1. Go to Repository Settings → Secrets and Variables → Actions
2. Add each secret:
   - `X_API_KEY`
   - `MASTODON_ACCESS_TOKEN`
   - `MASTODON_INSTANCE`
   - `FACEBOOK_PAGE_ID`
   - `FACEBOOK_ACCESS_TOKEN`
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`
   - `INSTAGRAM_ACCESS_TOKEN`

3. Update `.github/workflows/daily-curation.yml`:

```yaml
- name: Post to social media via APIs
  env:
    X_API_KEY: ${{ secrets.X_API_KEY }}
    MASTODON_INSTANCE: ${{ secrets.MASTODON_INSTANCE }}
    MASTODON_ACCESS_TOKEN: ${{ secrets.MASTODON_ACCESS_TOKEN }}
    FACEBOOK_PAGE_ID: ${{ secrets.FACEBOOK_PAGE_ID }}
    FACEBOOK_ACCESS_TOKEN: ${{ secrets.FACEBOOK_ACCESS_TOKEN }}
    INSTAGRAM_BUSINESS_ACCOUNT_ID: ${{ secrets.INSTAGRAM_BUSINESS_ACCOUNT_ID }}
    INSTAGRAM_ACCESS_TOKEN: ${{ secrets.INSTAGRAM_ACCESS_TOKEN }}
  run: node scripts/daily-curation.js
```

## Usage

### Basic Usage

```javascript
const { SocialMediaManager } = require('./scripts/social-media-api.js');

const manager = new SocialMediaManager();

const content = {
  x: "Check out 3mpwrApp: Tools for disability advocacy https://3mpwrapp.com",
  mastodon: "Check out 3mpwrApp: Free tools for disability advocacy and accessibility https://3mpwrapp.com #accessibility #disability",
  facebook: "New: 3mpwrApp launches free tools for disability advocacy. Features include policy guidance, resource discovery, and community support.",
  instagram: "Free disability advocacy tools now available. 📱 Letter generation, policy resources, community support. #accessibility",
  imageUrl: "https://3mpwrapp.com/assets/images/hero.png",
  link: "https://3mpwrapp.com"
};

await manager.postToAll(content);
```

### Scheduled Posting

```javascript
// Post in 1 hour
const delayMs = 60 * 60 * 1000;
await manager.schedulePost(content, delayMs);
```

## API Response Handling

### Success Responses

All successful posts return objects containing:

```javascript
{
  x: { data: { id: "1234567890", text: "..." } },
  mastodon: { id: "123456789", content: "..." },
  facebook: { id: "page_id_post_id" },
  instagram: { id: "instagram_post_id" }
}
```

### Error Handling

Each platform returns null on error and logs the error message:

```javascript
const results = await manager.postToAll(content);

if (!results.x) {
  console.log('X posting failed - check logs');
}
```

## Testing

### Check Configuration

```bash
node scripts/social-media-api.js
```

Output shows which platforms are configured and ready.

### Test Individual Platforms

```javascript
// Test X
const xClient = new XApiClient(process.env.X_API_KEY);
await xClient.postTweet("Test tweet from 3mpwrApp");

// Test Mastodon
const mastodon = new MastodonApiClient(
  process.env.MASTODON_INSTANCE,
  process.env.MASTODON_ACCESS_TOKEN
);
await mastodon.postStatus("Test toot from 3mpwrApp");
```

## Troubleshooting

### "No social media APIs are configured"
- Check environment variables: `echo $X_API_KEY`
- Verify .env file exists and is readable
- Ensure file is not in .gitignore accidentally

### 401 Unauthorized errors
- Verify tokens are correct (copy/paste carefully)
- Check if tokens have expired (regenerate if needed)
- Confirm scope permissions are set correctly

### 403 Forbidden errors
- Check app/page permissions in developer portals
- Verify you have admin access to the page/account
- Ensure token has appropriate scopes

### Rate limit errors
- Space out requests
- Check platform rate limits
- Wait appropriate retry-after duration

## Platform-Specific Notes

### X (Twitter)
- 280 character limit (enforced, text truncated if needed)
- Links count toward character limit
- Emoji and special characters supported
- Media attachments require separate API calls

### Mastodon
- 500 character standard limit (some instances customized)
- No built-in link shortening
- Fully supports Markdown
- Hashtags are indexed and searchable

### Facebook
- No strict character limit
- Supports media URLs and album creation
- Link preview generated automatically
- Scheduling available through Graph API

### Instagram
- Character limit: 2,200
- Carousel posts: 2-10 items
- Image dimensions: 1080x1350 (portrait) or 1200x628 (landscape)
- Scheduling available for business accounts

## Security Best Practices

1. **Never commit credentials**
   - Use .env or environment variables
   - Add .env to .gitignore
   - Use GitHub Secrets for CI/CD

2. **Use long-lived tokens where available**
   - Facebook and Instagram support this
   - X requires OAuth flow
   - Mastodon tokens don't expire by default

3. **Rotate tokens periodically**
   - Every 90 days recommended
   - Immediately if compromised
   - After personnel changes

4. **Use minimal permissions**
   - Request only required scopes
   - Use dedicated app/tokens if possible
   - Avoid admin-level access if not needed

5. **Monitor API usage**
   - Check rate limit status
   - Review posted content
   - Set up alerts for failures

## Support

For issues or questions:
- Check logs: `public/social-posts-{date}.md`
- Review error messages in console output
- Verify credentials in each platform's developer portal
- Test with manual API calls first

## References

- [X API v2 Documentation](https://developer.twitter.com/en/docs/twitter-api)
- [Mastodon API Documentation](https://docs.joinmastodon.org/client/intro/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-graph-api)
