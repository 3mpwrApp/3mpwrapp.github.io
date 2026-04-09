#!/usr/bin/env node
/**
 * POST-DISABILITY-BULLETIN-PROMO.JS
 * Posts Disability Bulletin promotions to social media
 * 
 * Publication: Disability Bulletin
 * Status: Issue 1 out of 2 - Issue 2 coming soon
 * Link: https://t.co/7vtI7QecTg
 * 
 * Features:
 * - Rotates through prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Runs 2x weekly via GitHub Actions
 * 
 * Ongoing campaign (no end date)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Campaign details
const BULLETIN_URL = 'https://t.co/7vtI7QecTg';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/disability-bulletin-state.json');

// Post templates
const POSTS = [
  {
    mastodon: `📰 Disability Bulletin - Issue 1 of 2 is OUT!

Important updates, resources, and advocacy news for the disability community.

Issue 2 coming soon!

Read Issue 1: ${BULLETIN_URL}

Stay informed. Stay connected. Stay empowered.

#DisabilityRights #DisabilityBulletin #AccessToInformation`,
    bluesky: `📰 Disability Bulletin Issue 1 is OUT!

Updates, resources & advocacy news for the disability community.

Issue 2 coming soon!

Read: ${BULLETIN_URL}

#DisabilityRights #DisabilityBulletin`,
    discord: `**📰 Disability Bulletin - Issue 1 OUT NOW!**

Important updates, resources, and advocacy news for the disability community.

**Status**: Issue 1 of 2 published
**Next**: Issue 2 coming soon!

🔗 Read Issue 1: ${BULLETIN_URL}

Stay informed, connected, and empowered! 💪`
  },
  {
    mastodon: `✨ NEW: Disability Bulletin Issue 1

Your source for disability rights news, policy updates, and community resources.

📖 Issue 1: Now available
📖 Issue 2: Coming soon

Stay ahead of the issues that matter to YOU.

Read now: ${BULLETIN_URL}

#DisabilityAdvocacy #DisabilityCommunity #StayInformed`,
    bluesky: `✨ Disability Bulletin Issue 1

Disability rights news, policy updates & resources.

Issue 2 coming soon!

Read: ${BULLETIN_URL}

#DisabilityAdvocacy #StayInformed`,
    discord: `**✨ NEW: Disability Bulletin Issue 1**

Your source for:
• Disability rights news
• Policy updates
• Community resources
• Advocacy tools

**Issue 1**: Available now
**Issue 2**: Coming soon

🔗 ${BULLETIN_URL}`
  },
  {
    mastodon: `📬 Have you read the Disability Bulletin yet?

Issue 1 of 2 is packed with:
✅ Disability rights updates
✅ Policy changes you need to know
✅ Community resources
✅ Advocacy opportunities

Issue 2 on the way!

Read Issue 1: ${BULLETIN_URL}

#Disability #DisabilityBulletin #CommunityResources`,
    bluesky: `📬 Disability Bulletin Issue 1

✅ Rights updates
✅ Policy changes
✅ Resources
✅ Advocacy opportunities

Issue 2 coming soon!

${BULLETIN_URL}

#Disability #DisabilityBulletin`,
    discord: `**📬 Disability Bulletin Issue 1**

Packed with:
✅ Rights updates
✅ Policy changes
✅ Community resources
✅ Advocacy opportunities

Issue 2 coming soon!

🔗 ${BULLETIN_URL}`
  },
  {
    mastodon: `🔔 Don't miss the Disability Bulletin!

Issue 1: Essential reading for disability community members, advocates, and allies.

Covers the latest in:
• Legislation & policy
• Community initiatives
• Resources & support
• Advocacy wins

Issue 2 coming soon!

${BULLETIN_URL}

#DisabilityRights #Advocacy #CommunitySupport`,
    bluesky: `🔔 Don't miss Disability Bulletin Issue 1!

Latest in legislation, policy, resources & advocacy wins.

Issue 2 coming soon!

${BULLETIN_URL}

#DisabilityRights #Advocacy`,
    discord: `**🔔 Don't Miss the Disability Bulletin!**

**Issue 1** - Essential reading for disability community members, advocates & allies.

**Covers:**
• Legislation & policy
• Community initiatives
• Resources & support
• Advocacy wins

🔗 ${BULLETIN_URL}`
  },
  {
    mastodon: `💡 Knowledge is power!

The Disability Bulletin keeps you informed about the issues impacting the disability community.

Issue 1 of 2: Available now
Issue 2: Publishing soon

Stay in the loop. Read Issue 1:
${BULLETIN_URL}

Share with your network!

#DisabilityKnowledge #DisabilityBulletin #Empowerment`,
    bluesky: `💡 Knowledge is power!

Disability Bulletin keeps you informed.

Issue 1: Available now
Issue 2: Coming soon

${BULLETIN_URL}

Share with your network!

#DisabilityBulletin #Empowerment`,
    discord: `**💡 Knowledge is Power!**

The Disability Bulletin keeps you informed about issues impacting the disability community.

**Issue 1**: Available now
**Issue 2**: Publishing soon

Stay in the loop!

🔗 ${BULLETIN_URL}`
  },
  {
    mastodon: `📊 Disability Bulletin - Issue 1 of 2

Data-driven insights, policy analysis, and community updates for the disability rights movement.

What's inside Issue 1:
• Recent policy changes
• Advocacy campaigns
• Resource guides
• Community spotlights

Issue 2 in development!

${BULLETIN_URL}

#DisabilityData #PolicyAnalysis #DisabilityBulletin`,
    bluesky: `📊 Disability Bulletin Issue 1

Data-driven insights, policy analysis & community updates.

Issue 2 coming soon!

${BULLETIN_URL}

#DisabilityData #PolicyAnalysis`,
    discord: `**📊 Disability Bulletin - Issue 1**

Data-driven insights for the disability rights movement.

**Inside:**
• Policy changes
• Advocacy campaigns
• Resource guides
• Community spotlights

Issue 2 in development!

🔗 ${BULLETIN_URL}`
  }
];

// Load or initialize state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Could not load state, starting fresh:', err.message);
  }
  return { lastIndex: -1, timestamp: null };
}

// Save state
function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.warn('Could not save state:', err.message);
  }
}

// Get next post
function getNextPost(state) {
  const nextIndex = (state.lastIndex + 1) % POSTS.length;
  return { post: POSTS[nextIndex], index: nextIndex };
}

// Post to Mastodon
async function postToMastodon(text) {
  const token = process.env.MASTO_TOKEN;
  const instance = process.env.MASTO_INSTANCE || 'mastodon.social';
  
  if (!token) {
    console.log('⚠️  No Mastodon token, skipping Mastodon post');
    return false;
  }

  const data = JSON.stringify({
    status: text,
    visibility: 'public'
  });

  const options = {
    hostname: instance,
    path: '/api/v1/statuses',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Posted to Mastodon');
          resolve(true);
        } else {
          console.error('❌ Mastodon error:', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.error('❌ Mastodon connection error:', err.message);
      resolve(false);
    });
    req.write(data);
    req.end();
  });
}

// Post to Bluesky
async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  
  if (!handle || !password) {
    console.log('⚠️  No Bluesky credentials, skipping Bluesky post');
    return false;
  }

  try {
    // Authenticate
    const authData = JSON.stringify({ identifier: handle, password });
    const authOptions = {
      hostname: 'bsky.social',
      path: '/xrpc/com.atproto.server.createSession',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': authData.length
      }
    };

    const session = await new Promise((resolve, reject) => {
      const req = https.request(authOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`Auth failed: ${res.statusCode}`));
          }
        });
      });
      req.on('error', reject);
      req.write(authData);
      req.end();
    });

    // Create post
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post'
      }
    });

    const postOptions = {
      hostname: 'bsky.social',
      path: '/xrpc/com.atproto.repo.createRecord',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`,
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };

    return new Promise((resolve) => {
      const req = https.request(postOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ Posted to Bluesky');
            resolve(true);
          } else {
            console.error('❌ Bluesky post error:', res.statusCode, body);
            resolve(false);
          }
        });
      });
      req.on('error', (err) => {
        console.error('❌ Bluesky connection error:', err.message);
        resolve(false);
      });
      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.error('❌ Bluesky error:', err.message);
    return false;
  }
}

// Post to Discord
async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('⚠️  No Discord webhook, skipping Discord post');
    return false;
  }

  const url = new URL(webhookUrl);
  const data = JSON.stringify({ content: text });

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 204) {
          console.log('✅ Posted to Discord');
          resolve(true);
        } else {
          console.error('❌ Discord error:', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.error('❌ Discord connection error:', err.message);
      resolve(false);
    });
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  console.log('📰 Disability Bulletin Promotion');
  console.log('');

  // Get next post
  const state = loadState();
  const { post, index } = getNextPost(state);

  console.log(`📝 Using post variant ${index + 1}/${POSTS.length}`);
  console.log('');

  // Test mode
  if (process.env.TEST_MODE === 'true') {
    console.log('🧪 TEST MODE - Would post:');
    console.log('');
    console.log('Mastodon:');
    console.log(post.mastodon);
    console.log('');
    console.log('Bluesky:');
    console.log(post.bluesky);
    console.log('');
    console.log('Discord:');
    console.log(post.discord);
    return;
  }

  // Post to all platforms
  const results = await Promise.all([
    postToMastodon(post.mastodon),
    postToBluesky(post.bluesky),
    postToDiscord(post.discord)
  ]);

  // Save state
  saveState({
    lastIndex: index,
    timestamp: new Date().toISOString()
  });

  const successCount = results.filter(Boolean).length;
  console.log('');
  console.log(`✅ Posted to ${successCount}/3 platforms`);
}

main().catch(console.error);
