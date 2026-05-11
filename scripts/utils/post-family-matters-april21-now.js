#!/usr/bin/env node
/**
 * POST-FAMILY-MATTERS-APRIL21-NOW.JS
 * URGENT: Post about tonight's Family Matters focus group (April 21, 6-8 PM)
 */

// Load environment variables from .env.local for local development
require('dotenv').config({ path: '.env.local' });

const https = require('https');

const EVENT_DETAILS = {
  title: 'Family Matters: Focus Group TONIGHT',
  date: 'April 21, 2026',
  time: '6:00 PM - 8:00 PM EST',
  location: 'Online (Zoom)',
  compensation: '$50 gift card',
  contact: 'Eugene @ (807) 622-8897',
  url: 'https://thunderbayinjuredworkers.com'
};

// Single post for tonight's event
const POST_TEXT = `🔔 TONIGHT: Family Matters Focus Group

Do you have a family member who was injured at work?

Join us TONIGHT (April 21) from 6-8 PM for a research focus group exploring how workplace injuries impact families.

⏰ 6:00-8:00 PM EST
📍 Online (Zoom)
💰 $50 gift card for participants
🔒 All information confidential

Contact Eugene: (807) 622-8897
Register: ${EVENT_DETAILS.url}

Thunder Bay & District Injured Workers Support Group

#WorkplaceInjury #FamilySupport #Research #InjuredWorkers`;

console.log('🚨 Family Matters Focus Group - TONIGHT (April 21, 2026)');
console.log('⏰ Event starts at 6:00 PM EST');
console.log('');

// Post to all platforms
async function postToAllPlatforms() {
  const results = {
    discord: false,
    mastodon: false,
    bluesky: false
  };

  // Discord
  try {
    results.discord = await postToDiscord(POST_TEXT);
    if (results.discord) console.log('✅ Posted to Discord');
  } catch (err) {
    console.log('❌ Discord post failed:', err.message);
  }

  // Mastodon
  try {
    results.mastodon = await postToMastodon(POST_TEXT);
    if (results.mastodon) console.log('✅ Posted to Mastodon');
  } catch (err) {
    console.log('❌ Mastodon post failed:', err.message);
  }

  // Bluesky
  try {
    results.bluesky = await postToBluesky(POST_TEXT);
    if (results.bluesky) console.log('✅ Posted to Bluesky');
  } catch (err) {
    console.log('❌ Bluesky post failed:', err.message);
  }

  const successCount = Object.values(results).filter(Boolean).length;
  console.log('');
  console.log(`✅ Posted to ${successCount}/3 platforms`);
  
  process.exit(successCount > 0 ? 0 : 1);
}

// Discord posting
async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('⚠️  No Discord webhook, skipping Discord post');
    return false;
  }

  const data = JSON.stringify({
    content: text,
    username: '3mpwr Events'
  });

  const url = new URL(webhookUrl);
  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Mastodon posting
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
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 300);
    });
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

// Bluesky posting
async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  
  if (!handle || !password) {
    console.log('⚠️  No Bluesky credentials, skipping Bluesky post');
    return false;
  }

  try {
    // Create session
    const sessionData = JSON.stringify({ identifier: handle, password });
    const session = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'bsky.social',
        path: '/xrpc/com.atproto.server.createSession',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(sessionData)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) resolve(JSON.parse(body));
          else reject(new Error(`Session failed: ${res.statusCode}`));
        });
      });
      req.on('error', reject);
      req.write(sessionData);
      req.end();
    });

    // Create post
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: text,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post'
      }
    });

    return await new Promise((resolve) => {
      const req = https.request({
        hostname: 'bsky.social',
        path: '/xrpc/com.atproto.repo.createRecord',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    });
  } catch (err) {
    return false;
  }
}

// Run
postToAllPlatforms();
