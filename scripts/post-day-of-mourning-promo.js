#!/usr/bin/env node
/**
 * POST-DAY-OF-MOURNING-PROMO.JS
 * Posts Day of Mourning Ceremony promotions to social media
 * 
 * Event: April 28, 2026 at 6pm EST
 * Location: First Wesley United Church, Thunder Bay
 * 
 * Features:
 * - Rotates through prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Runs 3x weekly via GitHub Actions
 * 
 * Runs until April 28, 2026
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Event details
const EVENT_DATE = new Date('2026-04-28T18:00:00-04:00');
const EVENT_LOCATION = 'First Wesley United Church, 130 Brodie Street North, Thunder Bay, ON';
const EVENT_URL_1 = 'https://thunderbayinjuredworkers.com';
const EVENT_URL_2 = 'https://thunderbaydistrictlabourcouncil.wordpress.com/';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/day-of-mourning-state.json');

// Post templates
const POSTS = [
  {
    mastodon: `🕯️ Day of Mourning - April 28, 6pm EST

Thunder Bay & District Injured Workers Support Group and Thunder Bay & District Labour Council invite you to honor workers killed, injured, or made ill on the job.

📍 First Wesley United Church
130 Brodie Street N, Thunder Bay

Ceremony followed by supper.

Every worker deserves safety. Every loss matters.

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #InjuredWorkers #WorkersSafety #ThunderBay`,
    bluesky: `🕯️ Day of Mourning - April 28, 6pm EST

Honoring workers killed, injured, or made ill on the job.

First Wesley United Church, Thunder Bay
Supper to follow.

${EVENT_URL_1}

#DayOfMourning #WorkersSafety`,
    discord: `**🕯️ Day of Mourning Ceremony - April 28**

**Time**: 6:00 PM EST
**Location**: First Wesley United Church, 130 Brodie Street N, Thunder Bay

Join TBDIWSG & TB District Labour Council to honor workers killed, injured, or made ill on the job. Ceremony followed by supper.

Every worker deserves safety. Every loss matters.

🏠 ${EVENT_URL_1}
🏠 ${EVENT_URL_2}`
  },
  {
    mastodon: `💔 April 28 is the National Day of Mourning

Join Thunder Bay & District Injured Workers Support Group and Thunder Bay & District Labour Council at 6pm EST to remember those lost or harmed in the workplace.

First Wesley United Church
130 Brodie Street North, Thunder Bay

Supper follows the ceremony. All welcome.

We mourn the dead. We fight for the living.

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #WorkplaceSafety #InjuredWorkers`,
    bluesky: `💔 April 28, 6pm: Day of Mourning ceremony in Thunder Bay

Remember those lost or harmed at work. Fight for safer workplaces.

First Wesley United Church
Supper provided.

${EVENT_URL_1}

#DayOfMourning`,
    discord: `**💔 National Day of Mourning - April 28, 6pm**

Remember workers lost or harmed in the workplace.

**Organized by**: TBDIWSG & TB District Labour Council
**Where**: First Wesley United Church, Thunder Bay
**After**: Supper together

We mourn the dead. We fight for the living.

${EVENT_URL_1}
${EVENT_URL_2}`
  },
  {
    mastodon: `⚠️ Every year on April 28, we remember

Workers killed on the job. Workers permanently disabled. Workers made ill by workplace conditions.

Thunder Bay ceremony: 6pm EST
First Wesley United Church
130 Brodie Street N

Co-hosted by TBDIWSG & TB District Labour Council

Injured workers, families, allies welcome.
Supper follows.

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #OccupationalHealth #WorkersRights`,
    bluesky: `⚠️ April 28: Day of Mourning

Workers killed, disabled, made ill on the job.

Thunder Bay ceremony 6pm
First Wesley United Church

${EVENT_URL_1}

#DayOfMourning #WorkersRights`,
    discord: `**⚠️ Day of Mourning - April 28, 6pm**

Honoring workers killed, disabled, or made ill on the job.

Co-hosted by:
• Thunder Bay & District Injured Workers Support Group
• Thunder Bay & District Labour Council

First Wesley United Church, Thunder Bay
Injured workers, families, allies welcome
Supper provided

${EVENT_URL_1}
${EVENT_URL_2}`
  },
  {
    mastodon: `🌹 Remembering. Recommitting. April 28, 6pm EST

Thunder Bay Day of Mourning ceremony at First Wesley United Church, 130 Brodie Street N.

We honor those lost to workplace injuries and illness. We renew our commitment to safer workplaces for ALL workers.

Supper follows ceremony.

Organized by TBDIWSG & TB District Labour Council

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #ThunderBay #WorkplaceSafety`,
    bluesky: `🌹 April 28, 6pm: Day of Mourning ceremony

Honor those lost. Commit to safer workplaces.

First Wesley United Church, Thunder Bay
Supper provided

${EVENT_URL_1}

#DayOfMourning`,
    discord: `**🌹 Day of Mourning Ceremony - April 28, 6pm**

Honor those lost to workplace injuries & illness.
Commit to safer workplaces.

**Organized by**:
• TBDIWSG
• TB District Labour Council

First Wesley United Church, Thunder Bay
Supper follows

${EVENT_URL_1}
${EVENT_URL_2}`
  },
  {
    mastodon: `🕊️ Join us April 28, 6pm EST - Day of Mourning

First Wesley United Church
130 Brodie Street North, Thunder Bay

Every workplace death is preventable.
Every workplace injury changes lives.
Every worker deserves safety.

Ceremony + supper. All welcome.

Co-hosted by TBDIWSG & TB District Labour Council

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #InjuredWorkers`,
    bluesky: `🕊️ April 28, 6pm: Day of Mourning in Thunder Bay

Every workplace death is preventable.
Every worker deserves safety.

First Wesley United Church
Supper to follow

${EVENT_URL_1}`,
    discord: `**🕊️ Day of Mourning - April 28, 6pm**

Every workplace death is preventable.
Every workplace injury changes lives.

Co-hosted by TBDIWSG & TB District Labour Council

First Wesley United Church, Thunder Bay
Ceremony + supper

${EVENT_URL_1}
${EVENT_URL_2}`
  },
  {
    mastodon: `📅 Mark your calendar: April 28, 6pm EST

Thunder Bay Day of Mourning Ceremony
First Wesley United Church, 130 Brodie Street N

Honor workers lost or harmed on the job.
Stand in solidarity for workplace safety.

Supper follows ceremony. Everyone welcome.

Co-hosted by TBDIWSG & TB District Labour Council

${EVENT_URL_1}
${EVENT_URL_2}

#DayOfMourning #WorkersSafety #ThunderBay #Solidarity`,
    bluesky: `📅 April 28, 6pm: Thunder Bay Day of Mourning

Honor workers lost or harmed.
Stand for workplace safety.

First Wesley United Church
Supper provided

${EVENT_URL_1}`,
    discord: `**📅 Save the Date: April 28, 6pm**

Day of Mourning Ceremony - Thunder Bay

Co-hosted by:
• TBDIWSG
• TB District Labour Council

First Wesley United Church
130 Brodie Street N

Ceremony + supper. All welcome.

${EVENT_URL_1}
${EVENT_URL_2}`
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
  console.log('🕯️  Day of Mourning Promotion - April 28, 2026');
  console.log('');

  // Check if event has passed
  const now = new Date();
  if (now > EVENT_DATE) {
    console.log('✅ Event has passed, no more promotions needed');
    return;
  }

  // Calculate days until event
  const daysUntil = Math.ceil((EVENT_DATE - now) / (1000 * 60 * 60 * 24));
  console.log(`📅 ${daysUntil} days until Day of Mourning ceremony`);
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
    timestamp: new Date().toISOString(),
    daysUntilEvent: daysUntil
  });

  const successCount = results.filter(Boolean).length;
  console.log('');
  console.log(`✅ Posted to ${successCount}/3 platforms`);
}

main().catch(console.error);
