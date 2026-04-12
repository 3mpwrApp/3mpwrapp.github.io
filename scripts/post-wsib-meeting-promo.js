#!/usr/bin/env node
/**
 * POST-WSIB-MEETING-PROMO.JS
 * Posts WSIB Community Meeting event promotions to social media
 * 
 * Event: Learn About New WSIB Proposals - Community Meeting
 * Date: Thursday, April 16, 2026
 * Time: Dinner 6PM, Meeting 7PM EST
 * Location: OPSEU Office, 326 Memorial Ave, Thunder Bay + Zoom
 * Link: https://thunderbayinjuredworkers.com/2026/04/12/learn-about-new-wsib-proposals-join-our-community-meeting/
 * 
 * Features:
 * - Rotates through prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Runs 2x DAILY via GitHub Actions until April 16
 * 
 * Runs until April 16, 2026
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Event details
const EVENT_DATE = new Date('2026-04-16T23:59:59-04:00');
const EVENT_TIME_DINNER = '6:00 PM EST';
const EVENT_TIME_MEETING = '7:00 PM EST';
const EVENT_LOCATION = 'OPSEU Office, 326 Memorial Ave, Thunder Bay';
const EVENT_URL = 'https://thunderbayinjuredworkers.com/2026/04/12/learn-about-new-wsib-proposals-join-our-community-meeting/';
const REGISTRATION_PHONE = '(807) 623-8897';
const REGISTRATION_EMAIL = 'smantis@tbaytel.net';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/wsib-meeting-state.json');

// Post templates - optimized for character limits
const POSTS = [
  {
    mastodon: `≡ƒÜ¿ WSIB Proposals Community Meeting - April 16

New WSIB proposals are on the table. Injured workers need to be informed, involved, and heard.

≡ƒôà Thursday, April 16
≡ƒì╜∩╕Å Dinner: 6PM | ≡ƒùú∩╕Å Meeting: 7PM
≡ƒôì OPSEU Office, Thunder Bay
≡ƒÆ╗ Zoom option available

Register: ${REGISTRATION_PHONE}
Email: ${REGISTRATION_EMAIL}

Details: ${EVENT_URL}

#WSIB #InjuredWorkers #ThunderBay`,
    bluesky: `≡ƒÜ¿ WSIB Proposals Meeting - April 16

6PM dinner, 7PM meeting
OPSEU Office, Thunder Bay or Zoom

Register: ${REGISTRATION_PHONE}

${EVENT_URL}

#WSIB #ThunderBay`,
    discord: `**≡ƒÜ¿ URGENT: Community Meeting on New WSIB Proposals - April 16**

New proposals for the WSIB are on the tableΓÇöand injured workers need to be informed, involved, and heard.

**Thunder Bay & District Injured Workers Support Group** is hosting a special community meeting where we will listen, learn, discuss, and take action.

**≡ƒôà Event Details:**
- **Date:** Thursday, April 16, 2026
- **Dinner:** 6:00 PM
- **Meeting:** 7:00 PM

**≡ƒôì In Person:**
OPSEU Office
326 Memorial Ave (beside the Merla Mae)
Thunder Bay, ON

**≡ƒÆ╗ Attend by Zoom:**
Register by phone: ${REGISTRATION_PHONE}
Or email: ${REGISTRATION_EMAIL}

**These changes could impact injured workers across Ontario.**

This is your chance to understand what's being proposed and be part of the conversation.

≡ƒöù **Full details:** ${EVENT_URL}

**This is about more than policyΓÇöit's about real people, real impacts, and making sure injured workers are not left behind.**

**Everyone is welcome. Bring a friend. Be part of the change.** Γ£è`
  },
  {
    mastodon: `≡ƒôó April 16: WSIB Community Meeting, Thunder Bay

Learn about new WSIB proposals that could affect injured workers across Ontario.

Dinner 6PM, Meeting 7PM
In person or Zoom

This is YOUR chance to be informed and heard.

Register: ${REGISTRATION_PHONE}
Info: ${EVENT_URL}

#WorkersRights #WSIB #ThunderBay`,
    bluesky: `≡ƒôó April 16: WSIB Meeting

New proposals affecting injured workers.

6PM dinner, 7PM meeting
Thunder Bay or Zoom

${REGISTRATION_PHONE}

${EVENT_URL}

#WSIB`,
    discord: `**≡ƒôó Don't Miss This: WSIB Community Meeting - April 16**

**What's happening?**
New proposals for the WSIB are being discussedΓÇöproposals that could significantly impact injured workers across Ontario.

**Why should you attend?**
This is your opportunity to:
Γ£à Learn what changes are being proposed
Γ£à Understand how they might affect you
Γ£à Ask questions and voice your concerns
Γ£à Connect with other injured workers and advocates
Γ£à Be part of the solution

**Event Details:**
≡ƒôà **Thursday, April 16, 2026**
≡ƒì╜∩╕Å **6:00 PM** - Dinner (free!)
≡ƒùú∩╕Å **7:00 PM** - Meeting

**In-Person:**
OPSEU Office, 326 Memorial Ave, Thunder Bay (beside the Merla Mae)

**Online:**
Zoom option available - register by phone or email

**≡ƒô₧ Register:**
Phone: ${REGISTRATION_PHONE}
Email: ${REGISTRATION_EMAIL}

**Full details:** ${EVENT_URL}

**Knowledge is power. Your voice matters. See you there!** ≡ƒÆ¬`
  },
  {
    mastodon: `ΓÜû∩╕Å New WSIB proposals could change everything for injured workers.

Join us April 16 to learn, discuss, and take action.

6PM dinner, 7PM meeting
OPSEU Office, Thunder Bay or Zoom

Everyone welcome. Bring a friend.

Register: ${REGISTRATION_PHONE}
${EVENT_URL}

#InjuredWorkers #WSIB #CommunityAction`,
    bluesky: `ΓÜû∩╕Å WSIB proposals = big changes ahead

April 16, 7PM
Thunder Bay or Zoom

Learn. Discuss. Act.

${REGISTRATION_PHONE}

${EVENT_URL}`,
    discord: `**ΓÜû∩╕Å The Future of WSIB is Being Decided. Be Part of the Conversation.**

**Thursday, April 16 | 6PM Dinner | 7PM Meeting**

New WSIB proposals are on the table. These aren't minor tweaksΓÇöthey could fundamentally change how injured workers are treated in Ontario.

**Will you be at the table when these proposals are discussed?**

**What we'll cover:**
- What the new proposals entail
- Who they affect and how
- What injured workers need to know
- How we can respond collectively

**Location Options:**
≡ƒÅó **In-Person:** OPSEU Office, 326 Memorial Ave, Thunder Bay
≡ƒÆ╗ **Online:** Zoom (register to get link)

**Who should attend:**
Γ£à Injured workers
Γ£à Family members of injured workers
Γ£à Advocates and allies
Γ£à Anyone concerned about workers' rights

**Free dinner at 6PM. Meeting starts at 7PM.**

**Register:**
≡ƒô₧ ${REGISTRATION_PHONE}
≡ƒôº ${REGISTRATION_EMAIL}

≡ƒöù ${EVENT_URL}

**This is about more than policy. It's about real people and real impacts.**

**Don't get left behind. Register today.** ≡ƒôó`
  },
  {
    mastodon: `≡ƒùô∩╕Å THIS THURSDAY: WSIB Community Meeting

April 16, 7PM (dinner at 6PM)
Thunder Bay (in person or Zoom)

New WSIB proposals could impact injured workers across Ontario. Be informed. Be heard.

Register: ${REGISTRATION_PHONE}

Details: ${EVENT_URL}

#WSIB #ThunderBay #InjuredWorkers`,
    bluesky: `≡ƒùô∩╕Å THIS THURSDAY - WSIB Meeting

April 16, 7PM
Thunder Bay or Zoom

New proposals. Big impacts.

${REGISTRATION_PHONE}

${EVENT_URL}`,
    discord: `**≡ƒùô∩╕Å REMINDER: WSIB Community Meeting THIS THURSDAY**

**April 16, 2026**
**Dinner: 6PM | Meeting: 7PM**

Have you registered yet?

**Why this matters:**
The WSIB is considering new proposals. These proposals will affect injured workers across OntarioΓÇöincluding YOU.

If you don't understand what's being proposed, you can't advocate for yourself or others.

**What you'll get:**
≡ƒôÜ Clear explanations of the proposals
Γ¥ô Opportunity to ask questions
≡ƒùú∩╕Å Platform to voice your concerns
≡ƒñ¥ Solidarity with other injured workers

**Attend in Thunder Bay:**
OPSEU Office, 326 Memorial Ave (beside the Merla Mae)

**Or join by Zoom:**
Register for link: ${REGISTRATION_PHONE} or ${REGISTRATION_EMAIL}

**Dinner provided at 6PM. Meeting starts at 7PM.**

≡ƒöù **Full info:** ${EVENT_URL}

**Your presence = your voice. Your voice = change.**

**See you Thursday!** Γ£è`
  },
  {
    mastodon: `≡ƒÆí Knowledge is power.

Understand new WSIB proposals before they're implemented.

Community Meeting: April 16, 7PM
OPSEU Office, Thunder Bay or Zoom

Free dinner at 6PM. Everyone welcome.

Register: ${REGISTRATION_PHONE}
${EVENT_URL}

#WSIB #InjuredWorkers #ThunderBay`,
    bluesky: `≡ƒÆí Understand WSIB proposals before they're implemented.

April 16, 7PM
Thunder Bay or Zoom

${REGISTRATION_PHONE}

${EVENT_URL}`,
    discord: `**≡ƒÆí Knowledge is Power: WSIB Proposals Community Meeting**

**Thursday, April 16 | 6PM Dinner | 7PM Meeting**

Changes to the WSIB don't happen in a vacuum. They're proposed, debated, and implementedΓÇöoften without meaningful input from the people most affected: **injured workers**.

**This meeting changes that.**

**We'll discuss:**
- What's actually in the new proposals (plain language, no jargon)
- Who will be affected and how
- What injured workers can do to respond
- How to make your voice heard in the policy process

**Hosted by:**
Thunder Bay & District Injured Workers Support Group

**Location:**
≡ƒÅó In-person: OPSEU Office, 326 Memorial Ave, Thunder Bay
≡ƒÆ╗ Online: Zoom (register for link)

**When:**
Thursday, April 16
6:00 PM - Dinner (free, provided)
7:00 PM - Meeting

**Register:**
≡ƒô₧ ${REGISTRATION_PHONE}
≡ƒôº ${REGISTRATION_EMAIL}

≡ƒöù **Details:** ${EVENT_URL}

**Don't let policy happen TO you. Be part of shaping it.**

**Register today. Attend Thursday. Make your voice heard.** ≡ƒôú`
  },
  {
    mastodon: `≡ƒöö FINAL CALL: WSIB Meeting - April 16

New proposals. Real impacts. Your voice.

Thursday, 6PM dinner, 7PM meeting
OPSEU Office, Thunder Bay or Zoom

Injured workers: this affects YOU.

Register: ${REGISTRATION_PHONE}
${EVENT_URL}

#WSIB #InjuredWorkers #TakeAction`,
    bluesky: `≡ƒöö FINAL CALL: April 16

WSIB proposals meeting
7PM, Thunder Bay or Zoom

${REGISTRATION_PHONE}

${EVENT_URL}

#WSIB`,
    discord: `**≡ƒöö LAST CHANCE TO REGISTER: WSIB Community Meeting - April 16**

**This is it. Thursday, April 16.**

New WSIB proposals are on the table. These could affect:
- How injuries are assessed
- What benefits you're entitled to
- How appeals are handled
- The future of workers' compensation in Ontario

**If you're not informed, you can't fight back.**

**Event:**
≡ƒôà Thursday, April 16, 2026
≡ƒì╜∩╕Å 6:00 PM - Free dinner
≡ƒùú∩╕Å 7:00 PM - Community meeting

**Where:**
≡ƒôì OPSEU Office, 326 Memorial Ave, Thunder Bay (beside the Merla Mae)
≡ƒÆ╗ Or attend by Zoom

**Who's invited?**
Γ£à Injured workers
Γ£à Family members
Γ£à Advocates
Γ£à Anyone who cares about workers' rights

**This is about more than policy. It's about:**
- Real people
- Real injuries
- Real lives
- Real justice

**Register NOW:**
≡ƒô₧ ${REGISTRATION_PHONE}
≡ƒôº ${REGISTRATION_EMAIL}

≡ƒöù ${EVENT_URL}

**Be part of the conversation. Be part of the change.**

**See you Thursday!** ≡ƒÆ¬`
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
    console.log('ΓÜá∩╕Å  No Mastodon token, skipping Mastodon post');
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
          console.log('Γ£à Posted to Mastodon');
          resolve(true);
        } else {
          console.error('Γ¥î Mastodon error:', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.error('Γ¥î Mastodon connection error:', err.message);
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
    console.log('ΓÜá∩╕Å  No Bluesky credentials, skipping Bluesky post');
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
            console.log('Γ£à Posted to Bluesky');
            resolve(true);
          } else {
            console.error('Γ¥î Bluesky post error:', res.statusCode, body);
            resolve(false);
          }
        });
      });
      req.on('error', (err) => {
        console.error('Γ¥î Bluesky connection error:', err.message);
        resolve(false);
      });
      req.write(postData);
      req.end();
    });
  } catch (err) {
    console.error('Γ¥î Bluesky error:', err.message);
    return false;
  }
}

// Post to Discord
async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.log('ΓÜá∩╕Å  No Discord webhook, skipping Discord post');
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
          console.log('Γ£à Posted to Discord');
          resolve(true);
        } else {
          console.error('Γ¥î Discord error:', res.statusCode, body);
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.error('Γ¥î Discord connection error:', err.message);
      resolve(false);
    });
    req.write(data);
    req.end();
  });
}

// Main function
async function main() {
  console.log('≡ƒÜ¿ WSIB Community Meeting Promotion - April 16, 2026');
  console.log('');

  // Check if event has passed
  const now = new Date();
  if (now > EVENT_DATE) {
    console.log('Γ£à Event has passed, no more promotions needed');
    return;
  }

  // Calculate days until event
  const daysUntil = Math.ceil((EVENT_DATE - now) / (1000 * 60 * 60 * 24));
  console.log(`ΓÅ░ ${daysUntil} days until WSIB Community Meeting`);
  console.log('');

  // Get next post
  const state = loadState();
  const { post, index } = getNextPost(state);

  console.log(`≡ƒô¥ Using post variant ${index + 1}/${POSTS.length}`);
  console.log('');

  // Test mode
  if (process.env.TEST_MODE === 'true') {
    console.log('≡ƒº¬ TEST MODE - Would post:');
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
  console.log(`Γ£à Posted to ${successCount}/3 platforms`);
}

main().catch(console.error);
