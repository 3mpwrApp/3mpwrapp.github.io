#!/usr/bin/env node
/**
 * POST-MIGRANT-WORKER-PROMO.JS
 * Posts Injured Migrant Worker Project promotions to social media
 * 
 * Campaign: Ongoing advocacy for injured migrant workers
 * Links:
 * - https://thunderbayinjuredworkers.com/2026/04/08/injured-migrant-worker-project/
 * - https://migrantworker.ca/about/us/
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
const CAMPAIGN_URL_1 = 'https://thunderbayinjuredworkers.com/2026/04/08/injured-migrant-worker-project/';
const CAMPAIGN_URL_2 = 'https://migrantworker.ca/about/us/';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/migrant-worker-state.json');

// Post templates
const POSTS = [
  {
    mastodon: `🌍 Injured Migrant Worker Project

Too many injured migrant workers are left without proper support after workplace injuries.

Barriers they face:
• Language barriers
• Fear of deportation
• Employer intimidation
• Complex systems (WSIB + immigration)
• Limited knowledge of rights

We're pushing for FAIR ACCESS to care, compensation, and JUSTICE.

${CAMPAIGN_URL_1}
${CAMPAIGN_URL_2}

#MigrantWorkers #InjuredWorkers #WorkersRights #Justice`,
    bluesky: `🌍 Injured Migrant Worker Project

Too many barriers to care, compensation & justice after workplace injuries.

We're fighting for FAIR ACCESS for ALL workers.

${CAMPAIGN_URL_1}

#MigrantWorkers #InjuredWorkers #Justice`,
    discord: `**🌍 Injured Migrant Worker Project**

Migrant workers face unique barriers when injured on the job:
• Language barriers
• Fear of deportation
• Employer threats
• Complex WSIB + immigration systems

**We're pushing for fair access to care, compensation, and justice.**

🔗 ${CAMPAIGN_URL_1}
🔗 ${CAMPAIGN_URL_2}

Every worker deserves dignity and safety! 💪`
  },
  {
    mastodon: `⚠️ Injured migrant workers need your support!

When migrant workers are injured on the job, they face:
❌ Language barriers blocking access to services
❌ Fear of losing work permits
❌ Employer intimidation
❌ No culturally appropriate support

The Injured Migrant Worker Project is exposing these systemic barriers and demanding change.

Learn more: ${CAMPAIGN_URL_1}

#MigrantWorkers #WorkersRights #SystemicChange`,
    bluesky: `⚠️ Injured migrant workers face systemic barriers

Language barriers
Fear of deportation
Employer threats
No support

We're demanding change!

${CAMPAIGN_URL_1}

#MigrantWorkers #Justice`,
    discord: `**⚠️ Support Injured Migrant Workers**

Systemic barriers prevent injured migrant workers from accessing care & compensation.

**The Project aims to:**
✓ Expose barriers
✓ Provide multi-language resources
✓ Advocate for policy changes
✓ Connect workers with support

🔗 ${CAMPAIGN_URL_1}`
  },
  {
    mastodon: `💪 Every worker deserves dignity & safety

The Injured Migrant Worker Project pushes for:

✅ Fair access to workers' compensation (regardless of immigration status)
✅ Multi-language resources
✅ Protection from deportation threats
✅ Employer accountability
✅ Culturally appropriate support

An injury to one is an injury to all!

${CAMPAIGN_URL_1}
${CAMPAIGN_URL_2}

#Solidarity #MigrantWorkers #InjuredWorkers`,
    bluesky: `💪 Every worker deserves dignity & safety

✅ Fair compensation regardless of immigration status
✅ Multi-language resources
✅ Employer accountability

An injury to one is an injury to all!

${CAMPAIGN_URL_1}

#Solidarity #MigrantWorkers`,
    discord: `**💪 Every Worker Deserves Justice**

The Injured Migrant Worker Project fights for:
✅ Fair compensation regardless of immigration status
✅ Multi-language resources
✅ Protection from deportation
✅ Employer accountability

An injury to one is an injury to all! ✊

🔗 ${CAMPAIGN_URL_1}`
  },
  {
    mastodon: `🚨 Did you know?

Injured migrant workers often avoid seeking WSIB benefits because:
• They fear deportation
• Employers threaten them
• They don't know their rights
• Services aren't in their language

This must change.

Support the Injured Migrant Worker Project:
${CAMPAIGN_URL_1}

Partner orgs:
${CAMPAIGN_URL_2}

#MigrantWorkers #WorkersRights #WSIBReform`,
    bluesky: `🚨 Injured migrant workers avoid benefits due to:
• Fear of deportation
• Employer threats
• Language barriers
• Don't know rights

This must change!

${CAMPAIGN_URL_1}

#MigrantWorkers #WSIBReform`,
    discord: `**🚨 The Reality for Injured Migrant Workers**

Many avoid WSIB benefits due to:
• Fear of deportation
• Employer threats
• Language barriers
• Lack of knowledge about rights

**This must change.**

Support the Injured Migrant Worker Project:
${CAMPAIGN_URL_1}`
  },
  {
    mastodon: `🤝 Building solidarity between movements

Injured Workers + Migrant Workers = Stronger Together

The Injured Migrant Worker Project connects:
• Injured worker advocacy
• Migrant worker rights
• Legal support networks
• Community organizations

Fair compensation. Safe workplaces. Justice for ALL.

${CAMPAIGN_URL_1}

#Solidarity #InjuredWorkers #MigrantWorkers #Justice`,
    bluesky: `🤝 Injured Workers + Migrant Workers = Stronger Together

Fair compensation. Safe workplaces. Justice for ALL.

${CAMPAIGN_URL_1}

#Solidarity #InjuredWorkers #MigrantWorkers`,
    discord: `**🤝 Building Solidarity**

Injured Workers + Migrant Workers = Stronger Together

The Project connects advocacy, legal support, and community organizations.

**Goal**: Fair compensation, safe workplaces, justice for ALL workers.

${CAMPAIGN_URL_1}`
  },
  {
    mastodon: `📢 Take Action for Injured Migrant Workers

What you can do:
1️⃣ Read the project report
2️⃣ Share info about migrant worker rights
3️⃣ Contact your MP/MPP
4️⃣ Support local migrant worker orgs
5️⃣ Demand employer accountability

Every voice matters!

Project: ${CAMPAIGN_URL_1}
Support: ${CAMPAIGN_URL_2}

#TakeAction #MigrantWorkers #InjuredWorkers`,
    bluesky: `📢 Take Action:

1. Read the report
2. Share worker rights info
3. Contact your MP/MPP
4. Support migrant worker orgs
5. Demand employer accountability

${CAMPAIGN_URL_1}

#TakeAction #MigrantWorkers`,
    discord: `**📢 Take Action for Injured Migrant Workers**

**What you can do:**
1. Read the project report
2. Share info about rights
3. Contact your MP/MPP
4. Support local orgs
5. Demand accountability

Every voice matters! 🗣️

🔗 ${CAMPAIGN_URL_1}`
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
      'Content-Length': Buffer.byteLength(data)
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
        'Content-Length': Buffer.byteLength(authData)
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
        'Content-Length': Buffer.byteLength(postData)
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
      'Content-Length': Buffer.byteLength(data)
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
  console.log('🌍 Injured Migrant Worker Project Promotion');
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
