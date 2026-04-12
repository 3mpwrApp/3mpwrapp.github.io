#!/usr/bin/env node
/**
 * POST-AGE65-CUTOFF-PROMO.JS
 * Posts Age 65 Cut-Off campaign promotions to social media
 * 
 * Campaign: End the Age 65 Cut-Off for Injured Workers
 * Action: Email your MPP demanding fair compensation
 * Link: https://thunderbayinjuredworkers.com/2026/04/12/take-action-end-the-age-65-cut-off-for-injured-workers/
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
const CAMPAIGN_URL = 'https://thunderbayinjuredworkers.com/2026/04/12/take-action-end-the-age-65-cut-off-for-injured-workers/';
const MPP_EMAIL_THUNDER_BAY = 'kevin.holland@pc.ola.org';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/age65-cutoff-state.json');

// Post templates - optimized for character limits (Mastodon ~450, Bluesky 300, Discord 2000)
const POSTS = [
  {
    mastodon: `≡ƒÜ¿ Take Action: End the Age 65 Cut-Off

Injured workers in Ontario are being cut off benefits at 65ΓÇöor sooner if injured at 63+. It's outdated and unfair.

≡ƒôó We've created a letter you can copy, sign, and send to your MPP (any party, anywhere in Ontario).

Make your voice heard: ${CAMPAIGN_URL}

#InjuredWorkers #WorkersRights #WSIB #Ontario`,
    bluesky: `≡ƒÜ¿ Take Action: End the Age 65 Cut-Off

Injured workers cut off at 65. Outdated. Unfair.

Copy our letter. Email your MPP.

${CAMPAIGN_URL}

#InjuredWorkers #WSIB`,
    discord: `**≡ƒÜ¿ Take Action: End the Age 65 Cut-Off for Injured Workers**

Injured workers in Ontario are being cut off benefits at age 65ΓÇöor sooner if injured at 63 or older. **It's outdated and unfair.**

Many people work well past 65. Why should injured workers be penalized for wanting the same?

≡ƒôó **We've created a letter you can copy, sign, and send to your MPP** (any party, anywhere in Ontario).

Thunder Bay residents: Email directly to Kevin Holland (${MPP_EMAIL_THUNDER_BAY})

≡ƒöù **Copy the letter and make your voice heard:** ${CAMPAIGN_URL}

**One email can be ignored. Hundreds can't!** ≡ƒôó`
  },
  {
    mastodon: `≡ƒÆö Benefits cut at 65? That's not retirementΓÇöthat's discrimination.

Injured workers deserve fair compensation regardless of age.

Copy our template letter. Email your MPP today.

${CAMPAIGN_URL}

421,000+ Ontarians over 65 are still working. The law needs to catch up.

#RightsDontRetire #WorkersCompensation #Ontario`,
    bluesky: `≡ƒÆö Benefits cut at 65 = age discrimination

421,000+ Ontarians over 65 still work. Injured workers deserve the same right.

Email your MPP: ${CAMPAIGN_URL}

#RightsDontRetire`,
    discord: `**≡ƒÆö Injured at 64? You might only get ONE YEAR of compensation.**

Ontario's WSIB rules cut off Loss of Earnings benefits at age 65ΓÇöno matter if you planned to keep working.

**Workers injured at 63 or older? As little as 2 years of compensation.**

This is **age discrimination**, plain and simple.

≡ƒôè **Statistics Canada (2024):** More than 421,000 Ontarians over 65 are employed. Nearly 164,000 are over 70.

The workforce has changed. The law hasn't.

≡ƒôº **Copy our letter. Send it to your MPP:** ${CAMPAIGN_URL}

**Collective action works. Let's flood their inboxes.** ≡ƒôó`
  },
  {
    mastodon: `≡ƒôó Injured at work? Your age shouldn't determine your compensation.

Ontario's age 65 cut-off for WSIB benefits is unfair and outdated.

Γ£à Email your MPP demanding change
Γ£à Use our template letter
Γ£à Takes 2 minutes

${CAMPAIGN_URL}

#WSIB #WorkersRights #InjuredWorkers #Ontario`,
    bluesky: `≡ƒôó Age shouldn't determine compensation.

WSIB cuts benefits at 65. It's unfair.

Email your MPP (2 mins):
${CAMPAIGN_URL}

#WorkersRights #WSIB`,
    discord: `**≡ƒôó Take 2 Minutes to Fight Age Discrimination in Workers' Compensation**

**The Problem:**
- Injured workers' LOE benefits cut at age 65
- Workers injured at 63+ get as little as 2 years compensation
- Doesn't reflect today's workforce (many work past 65)

**The Solution:**
Email your MPP demanding reform. We've written the letterΓÇöyou just need to add your name.

**What We're Asking For:**
Γ£à Compensation until age 70 (if injured before 65)
Γ£à 5 years minimum (if injured at 65+)
Γ£à Extended coverage where evidence shows worker would've continued

**Thunder Bay:** Email Kevin Holland (${MPP_EMAIL_THUNDER_BAY})
**Other MPPs:** Find yours and use our template

≡ƒöù **Get the letter:** ${CAMPAIGN_URL}

**This is how change happensΓÇöcollective action!**`
  },
  {
    mastodon: `≡ƒöÑ Rights Don't Retire at 65

But WSIB benefits doΓÇöeven if you never planned to stop working.

Watch real stories from injured workers, then take action:
${CAMPAIGN_URL}

Copy the letter. Email your MPP. Demand fairness.

#RightsDontRetire #InjuredWorkers #WSIB`,
    bluesky: `≡ƒöÑ Rights Don't Retire

But WSIB cuts you off at 65.

Watch stories. Take action:
${CAMPAIGN_URL}

#RightsDontRetire #WSIB`,
    discord: `**≡ƒöÑ Rights Don't Retire at 65ΓÇöBut Your Benefits Might**

WSIB's age 65 cut-off doesn't care if you:
- Planned to work into your 70s
- Need the income
- Are physically able to work

**Watch real injured workers tell their stories:**
https://www.youtube.com/watch?v=K9pMk1wSubs&list=PLlv0PVEs2gRs41iWHD0SvVuzY8-KpWZDy

**Then take action:** Copy our letter template and email your MPP

≡ƒöù ${CAMPAIGN_URL}

**We're calling for:**
- Compensation until age 70 (for those injured before 65)
- 5-year minimum (for those injured at 65+)
- Retroactive application to 2006 (when mandatory retirement ended)

**Your email matters. Send it today.** ≡ƒôº`
  },
  {
    mastodon: `ΓÜû∩╕Å Mandatory retirement ended in 2006.
Workers' comp rules? Still stuck in the past.

Injured workers over 65 deserve fair treatment.

Email your MPP. Use our template. Demand reform:
${CAMPAIGN_URL}

#WorkersCompensation #Ontario #Justice #InjuredWorkers`,
    bluesky: `ΓÜû∩╕Å Mandatory retirement: gone in 2006
WSIB age rules: still stuck in the past

Demand reform:
${CAMPAIGN_URL}

#WorkersComp #Ontario`,
    discord: `**ΓÜû∩╕Å Ontario Abolished Mandatory Retirement in 2006. WSIB Didn't Get the Memo.**

We're asking for retroactive reforms to at least 2006ΓÇöwhen mandatory retirement was eliminated in Ontario.

**Workers injured since then have been unfairly denied compensation based on outdated assumptions.**

**Current Reality:**
- 421,000+ Ontarians over 65 employed (Stats Canada 2024)
- 164,000+ over age 70 still working
- People NEED to work longer due to cost of living

**Outdated WSIB Rule:**
- Benefits cut at 65 no matter what
- Assumed everyone retires at 65 (not true since 2006!)

≡ƒôº **Email your MPP demanding fairness:** ${CAMPAIGN_URL}

**Thunder Bay:** Send directly to kevin.holland@pc.ola.org

**The template letter is ready. Just add your name and hit send.** Γ£è`
  },
  {
    mastodon: `≡ƒôè 164,000 Ontarians over 70 are still working.

But if they're injured on the job? WSIB cuts them off at 65.

That's not just unfairΓÇöit's discriminatory.

Take action: ${CAMPAIGN_URL}

Copy our letter. Email your MPP. Demand change.

#InjuredWorkers #WSIB #Ontario #WorkersRights`,
    bluesky: `≡ƒôè 164,000 Ontarians 70+ still work

Injured? Cut off at 65.

Discriminatory.

Email your MPP:
${CAMPAIGN_URL}

#WSIB #WorkersRights`,
    discord: `**≡ƒôè By the Numbers: Why the Age 65 Cut-Off is Discriminatory**

**Statistics Canada (2024):**
- 421,000 Ontarians over 65 employed
- 164,000 over age 70 still working
- Labour force participation for older workers has INCREASED significantly

**WSIB's Response:**
Γ¥î Still cuts benefits at 65
Γ¥î Assumes everyone retires (they don't)
Γ¥î Ignores economic reality

**What Injured Workers Are Asking For:**
Γ£à Compensation until age 70 (if injured before 65)
Γ£à 5 years minimum (if injured at 65+)
Γ£à Extended coverage with evidence of continued work intent
Γ£à Retroactive to 2006

≡ƒôº **Send the letter to your MPP:** ${CAMPAIGN_URL}

**Evidence-based policy. Fair treatment. Justice for injured workers.**

**Your email adds to the collective voice. Send it now.** ≡ƒôó`
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

// Get next post (rotate through variants)
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
  console.log('≡ƒÜ¿ Age 65 Cut-Off Campaign - End Discriminatory Benefits Cut-Off');
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
    timestamp: new Date().toISOString()
  });

  const successCount = results.filter(Boolean).length;
  console.log('');
  console.log(`Γ£à Posted to ${successCount}/3 platforms`);
}

main().catch(console.error);
