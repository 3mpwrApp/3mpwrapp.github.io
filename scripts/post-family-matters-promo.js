#!/usr/bin/env node
/**
 * POST-FAMILY-MATTERS-PROMO.JS
 * Posts Family Matters research project promotions to social media
 * 
 * Research: Family Matters - Workplace Injury Impacts on Families
 * Dates: April 15, 21, 25, 2026
 * Organizer: Thunder Bay & District Injured Workers Support Group
 * Link: https://thunderbayinjuredworkers.com
 * 
 * Features:
 * - Rotates through prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Runs daily via GitHub Actions until April 25
 * 
 * Runs until April 25, 2026
 */

// Load environment variables from .env.local for local development
require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

// Research project details
const EVENT_DATES = ['2026-04-15', '2026-04-21', '2026-04-25'];
const LAST_EVENT_DATE = new Date('2026-04-25T23:59:59-04:00');
const PROJECT_URL = 'https://thunderbayinjuredworkers.com';

// State file for tracking which post we're on
const STATE_DIR = path.join(__dirname, '../.github/state');
const STATE_FILE = path.join(STATE_DIR, 'family-matters-state.json');

// Ensure state directory exists
if (!fs.existsSync(STATE_DIR)) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
}

// Post variants (6 different angles to rotate through)
const POST_VARIANTS = [
  {
    mastodon: `🔬 Research Opportunity: Family Matters

Has a workplace injury affected your family? Researchers at Lakehead University & EPID@Work want to hear from you.

📅 Focus groups: April 15, 21, 25
💰 $50 gift card for participants
🔒 All information confidential

Contact: Eugene (807) 622-8897
Details: ${PROJECT_URL}

#WorkplaceInjury #Research #FamilySupport #ThunderBay`,
    bluesky: `🔬 Research Opportunity: Family Matters

Has a workplace injury affected your family? Researchers at Lakehead University & EPID@Work want to hear from you.

📅 Focus groups: April 15, 21, 25
💰 $50 gift card
🔒 Confidential

Eugene: (807) 622-8897
${PROJECT_URL}

#WorkplaceInjury #Research`,
    discord: `🔬 **Research Opportunity: Family Matters**

Has a workplace injury affected your family? Researchers at Lakehead University & EPID@Work want to understand the impacts on family members.

**📅 Focus Groups:**
• April 15 (6-8 PM, Zoom)
• April 21 (6-8 PM, Zoom)  
• April 25 (12-3 PM, In-person with lunch at OPSEU Thunder Bay)

**💰 Compensation:** $50 gift card for all participants
**🔒 Privacy:** All information collected is confidential

**Contact:** Eugene Lefrancois at (807) 622-8897
**More info:** ${PROJECT_URL}`
  },
  {
    mastodon: `👨‍👩‍👧 Your family's story matters

Injured at work? Your family has felt the impact too. Share your experience in a confidential research study.

🎯 2-hour focus group or interview
💵 $50 gift card
📍 Zoom or in-person options

April 15, 21, or 25 - you choose!
Call Eugene: (807) 622-8897

${PROJECT_URL}

#InjuredWorkers #FamilyImpact #ThunderBay`,
    bluesky: `👨‍👩‍👧 Your family's story matters

Injured at work? Your family felt the impact too. Share your experience in confidential research.

🎯 2-hour session
💵 $50 gift card
📍 Zoom or in-person

April 15, 21, or 25
Eugene: (807) 622-8897
${PROJECT_URL}`,
    discord: `👨‍👩‍👧 **Your Family's Story Matters**

When a worker is injured, the whole family feels the impact. Researchers want to understand these effects to improve support for families.

**Why participate?**
• Help improve support for injured workers' families
• Share your experience in a safe, confidential space
• Receive $50 gift card as thanks

**Options:**
• April 15 or 21: Zoom (6-8 PM)
• April 25: In-person with lunch provided (12-3 PM, OPSEU Thunder Bay)

**Contact Eugene:** (807) 622-8897
**Learn more:** ${PROJECT_URL}`
  },
  {
    mastodon: `📢 Thunder Bay families: Research opportunity

Has a workplace injury changed your family life? Researchers need your insight.

🗓️ 3 dates available:
• April 15 (Zoom)
• April 21 (Zoom)
• April 25 (In-person + lunch)

All participants receive $50 gift card
Confidential 2-hour session

TB&DIWSG: (807) 622-8897
${PROJECT_URL}

#WorkersComp #FamilyResearch`,
    bluesky: `📢 Thunder Bay families: Research opportunity

Workplace injury affected your family? Share your experience.

🗓️ April 15, 21 (Zoom)
   April 25 (In-person+lunch)

$50 gift card
Confidential

(807) 622-8897
${PROJECT_URL}`,
    discord: `📢 **Thunder Bay Families: Research Opportunity**

**Family Matters Research Project** - Understanding the impacts of workplace injuries on families

**Project Team:**
• Lakehead University
• EPID@Work Research Institute  
• Thunder Bay & District Injured Workers Support Group

**Upcoming Sessions:**
1. **April 15** - 6-8 PM (Online via Zoom)
2. **April 21** - 6-8 PM (Online via Zoom)
3. **April 25** - 12-3 PM (In-person at OPSEU Member Centre, lunch provided)

**Compensation:** $50 gift card + lunch (April 25 only)
**Privacy:** All information remains confidential

**Register:** Contact Eugene at (807) 622-8897 or visit ${PROJECT_URL}`
  },
  {
    mastodon: `🔍 Research seeks families affected by workplace injuries

Lakehead U & EPID@Work studying family impacts. Your voice needed!

📆 Choose your date:
April 15, 21 (online) or 25 (Thunder Bay)

💰 $50 compensation
🕒 2 hours
🔐 Confidential

Details: (807) 622-8897
${PROJECT_URL}

#InjuredWorkersFamilies #Research #ThunderBay`,
    bluesky: `🔍 Research seeks families affected by workplace injuries

Lakehead U & EPID@Work studying family impacts.

📆 April 15, 21 (online)
   April 25 (Thunder Bay)

💰 $50
🕒 2 hrs
🔐 Confidential

(807) 622-8897
${PROJECT_URL}`,
    discord: `🔍 **Research Seeks Families Affected by Workplace Injuries**

The **Family Matters** project is exploring how workplace injuries impact not just workers, but their entire family.

**Who should participate?**
• Family members of injured workers
• Workers who've been off work 3+ months due to injury

**What's involved?**
• 2-hour focus group or interview
• Share your experiences and challenges
• Help shape better family support programs

**When & Where:**
• April 15 - 6-8 PM (Zoom)
• April 21 - 6-8 PM (Zoom)
• April 25 - 12-3 PM (OPSEU Thunder Bay, lunch provided)

**Thank you gift:** $50 gift card

**Contact:** Eugene Lefrancois, (807) 622-8897
**More info:** ${PROJECT_URL}`
  },
  {
    mastodon: `🏥 Workplace injuries affect entire families

New research exploring family impacts. Participants needed!

🗓️ Last chances to join:
• April 15 (evening, Zoom)
• April 21 (evening, Zoom)  
• April 25 (lunch + session, in-person TB)

💵 $50 for 2-hour participation
☎️ Eugene: (807) 622-8897

${PROJECT_URL}

#FamilyMatters #WorkplaceInjury #Research`,
    bluesky: `🏥 Workplace injuries affect entire families

Research on family impacts needs you!

🗓️ April 15, 21 (Zoom eve)
   April 25 (TB in-person+lunch)

💵 $50 for 2hrs
☎️ (807) 622-8897

${PROJECT_URL}`,
    discord: `🏥 **Workplace Injuries Affect Entire Families**

When someone gets hurt at work, family life changes too. This research wants to understand those changes.

**Family Matters Research Project**
Led by: Lakehead University, EPID@Work, TB&DIWSG

**Final opportunities to participate:**
📅 **April 15** - Evening session (6-8 PM, Zoom)
📅 **April 21** - Evening session (6-8 PM, Zoom)
📅 **April 25** - Daytime session with lunch (12-3 PM, OPSEU Member Centre, Thunder Bay)

**Your story can help:**
• Improve support services for families
• Inform policy changes
• Help other families facing similar challenges

**Compensation:** $50 gift card + lunch (April 25)
**Privacy:** Completely confidential

**Sign up:** Call Eugene at (807) 622-8897
**Details:** ${PROJECT_URL}`
  },
  {
    mastodon: `⏰ Last week to participate: Family Matters Research

3 more chances to share your family's experience with workplace injury.

April 15, 21, 25 - all with $50 gift cards
Online or in-person options available

Your input shapes better support for families

Thunder Bay & District Injured Workers:
📞 (807) 622-8897
🔗 ${PROJECT_URL}

#WCB #WSIB #FamilySupport #Research`,
    bluesky: `⏰ Last week: Family Matters Research

Share your family's workplace injury experience.

April 15, 21, 25
$50 gift cards
Online or in-person

TB&DIWSG: (807) 622-8897
${PROJECT_URL}`,
    discord: `⏰ **Last Week to Participate: Family Matters Research**

This is your final opportunity to contribute to important research about how workplace injuries affect families.

**Why this research matters:**
• Very little research exists on family impacts
• Your experience can inform better support programs
• Help ensure families aren't forgotten in workers' compensation

**Remaining Sessions:**
🗓️ **April 15** - 6-8 PM (Zoom)
🗓️ **April 21** - 6-8 PM (Zoom)
🗓️ **April 25** - 12-3 PM (In-person at OPSEU Thunder Bay, includes lunch)

**All participants receive:**
• $50 gift card
• Knowledge that your story is helping others
• Lunch (April 25 in-person session only)

**Complete confidentiality guaranteed**

**Register now:** Eugene Lefrancois
**Phone:** (807) 622-8897
**Website:** ${PROJECT_URL}

*Organized by Thunder Bay & District Injured Workers Support Group, Lakehead University, and EPID@Work Research Institute*`
  }
];

// Load or initialize state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading state:', err.message);
  }
  
  return {
    lastPostIndex: -1,
    totalPosts: 0
  };
}

// Save state
function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Error saving state:', err.message);
  }
}

// Check if we should still be posting
function shouldPost() {
  const now = new Date();
  return now <= LAST_EVENT_DATE;
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
      if (res.statusCode === 204) {
        console.log('✅ Posted to Discord');
        resolve(true);
      } else {
        console.log(`❌ Discord error: ${res.statusCode}`);
        resolve(false);
      }
    });

   req.on('error', (err) => {
      console.log(`❌ Discord connection error: ${err.message}`);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
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
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Posted to Mastodon');
          resolve(true);
        } else {
          console.log(`❌ Mastodon error: ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Mastodon connection error: ${err.message}`);
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
    // Step 1: Create session
    const sessionData = JSON.stringify({ identifier: handle, password });
    const sessionOptions = {
      hostname: 'bsky.social',
      path: '/xrpc/com.atproto.server.createSession',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(sessionData)
      }
    };

    const session = await new Promise((resolve, reject) => {
      const req = https.request(sessionOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            reject(new Error(`Session error: ${res.statusCode}`));
          }
        });
      });
      req.on('error', reject);
      req.write(sessionData);
      req.end();
    });

    // Step 2: Create post
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        text: text,
        createdAt: new Date().toISOString()
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

    await new Promise((resolve, reject) => {
      const req = https.request(postOptions, (res) => {
        if (res.statusCode === 200) {
          console.log('✅ Posted to Bluesky');
          resolve(true);
        } else {
          console.log(`❌ Bluesky post error: ${res.statusCode}`);
          resolve(false);
        }
        res.on('data', () => {});
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    return true;
  } catch (err) {
    console.log(`❌ Bluesky error: ${err.message}`);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🔬 Family Matters Research Promotion\n');
  
  // Check if we should still post
  if (!shouldPost()) {
    console.log('❌ All focus group dates have passed. Stopping promotions.');
    process.exit(0);
  }

  // Calculate days until last event
  const now = new Date();
  const daysUntil = Math.ceil((LAST_EVENT_DATE - now) / (1000 * 60 * 60 * 24));
  console.log(`⏰ ${daysUntil} days until final focus group (April 25)\n`);

  // Load state and select next post
  const state = loadState();
  const nextIndex = (state.lastPostIndex + 1) % POST_VARIANTS.length;
  const post = POST_VARIANTS[nextIndex];

  console.log(`📝 Using post variant ${nextIndex + 1}/${POST_VARIANTS.length}\n`);

  // Post to all platforms
  const results = await Promise.all([
    postToDiscord(post.discord),
    postToMastodon(post.mastodon),
    postToBluesky(post.bluesky)
  ]);

  const successCount = results.filter(Boolean).length;
  console.log(`\n✅ Posted to ${successCount}/3 platforms`);

  // Update and save state
  state.lastPostIndex = nextIndex;
  state.totalPosts += 1;
  state.lastPostDate = new Date().toISOString();
  saveState(state);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
