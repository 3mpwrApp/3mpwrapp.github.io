#!/usr/bin/env node
/**
 * POST-ONIWG-AGM-PROMO.JS
 * Posts ONIWG AGM event promotions to social media
 * 
 * Event: ONIWG Annual General Meeting
 * Date: May 7-8, 2026
 * Location: Toronto, ON
 * Link: https://thunderbayinjuredworkers.com/2026/04/11/oniwg-agm/
 * 
 * Features:
 * - Rotates through prepared promotional posts
 * - Posts to Mastodon, Bluesky, Discord
 * - Tracks state to avoid repetition
 * - Runs 3x weekly via GitHub Actions
 * 
 * Runs until May 8, 2026
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Event details
const EVENT_DATE = new Date('2026-05-08T23:59:59-04:00'); // End of May 8
const EVENT_URL = 'https://thunderbayinjuredworkers.com/2026/04/11/oniwg-agm/';
const REGISTRATION_URL = 'https://jwgwvxx.clicks.mlsend.com/tf/c/eyJ2Ijoie1wiYVwiOjE0Mjg3MDcsXCJsXCI6MTgyNTA2NTQ3Nzc3MTExMzkwLFwiclwiOjE4MjUwNjU1ODM1NzI0MzE0OX0iLCJzIjoiNTIxMzVmYTE3ZWNkNjI0MiJ9';

// State file to track which post was used last
const STATE_FILE = path.join(__dirname, '../.github/state/oniwg-agm-state.json');

// Post templates - optimized for character limits
const POSTS = [
  {
    mastodon: `≡ƒôà ONIWG AGM - May 7-8 in Toronto

Injured workers can attend FREE! Limited sponsorship available.

This is your chance to:
Γ£à Connect with injured worker advocates
Γ£à Learn about ONIWG's work
Γ£à Have your voice heard

Register: ${EVENT_URL}

Act fastΓÇöspots are limited!

#InjuredWorkers #ONIWG #Ontario`,
    bluesky: `≡ƒôà ONIWG AGM - May 7-8, Toronto

FREE for injured workers (limited sponsorship)

Register now: ${EVENT_URL}

#InjuredWorkers #ONIWG`,
    discord: `**≡ƒôà ONIWG Annual General Meeting - May 7-8, 2026**

**Location:** Toronto, Ontario

**INJURED WORKERS CAN ATTEND FREE OF CHARGE!**

ONIWG (Ontario Network of Injured Workers Groups) is holding their AGM and offering limited sponsorship for injured workers to attend.

**Why attend?**
Γ£à Network with injured worker advocates from across Ontario
Γ£à Learn about ONIWG's advocacy work
Γ£à Participate in important discussions about workers' compensation
Γ£à Have your voice heard in the movement

**Sponsorship is limitedΓÇöregister ASAP!**

≡ƒô¥ **Register here:** ${EVENT_URL}

Not an injured worker? Please share this with anyone who might benefit!

**Together we're stronger.** ≡ƒÆ¬`
  },
  {
    mastodon: `≡ƒñ¥ ONIWG AGM: May 7-8, Toronto

Free attendance for injured workers! Sponsorship available.

Join injured worker advocates from across Ontario. Network, learn, and make your voice heard.

Limited spots! Register today: ${EVENT_URL}

#WorkersRights #InjuredWorkers #ONIWG #Solidarity`,
    bluesky: `≡ƒñ¥ ONIWG AGM: May 7-8

Free for injured workers!
Toronto. Limited spots.

Register: ${EVENT_URL}

#WorkersRights #ONIWG`,
    discord: `**≡ƒñ¥ Join Us: ONIWG Annual General Meeting**

**≡ƒôà May 7-8, 2026 | ≡ƒôì Toronto**

The Ontario Network of Injured Workers Groups invites injured workers to attend their AGM **free of charge**.

**What is ONIWG?**
ONIWG is a provincial network of injured worker groups advocating for fair treatment, policy reform, and support for injured workers across Ontario.

**What happens at the AGM?**
- Reports on advocacy efforts
- Strategic planning for the year ahead
- Networking with injured worker allies
- Opportunity to get involved in the movement

**Who can attend?**
Γ£à Injured workers (FREE with limited sponsorship)
Γ£à Advocates and allies
Γ£à Anyone passionate about workers' rights

**Register now:** ${EVENT_URL}

**Spots are limited. Don't miss out!** ≡ƒôó`
  },
  {
    mastodon: `≡ƒÆ¬ Your chance to be part of the movement!

ONIWG AGM: May 7-8 in Toronto
Free for injured workers (sponsorship available)

Connect. Learn. Advocate.

Register before spots fill up: ${EVENT_URL}

Share with injured workers in your network!

#InjuredWorkers #ONIWG #WorkersCompensation`,
    bluesky: `≡ƒÆ¬ ONIWG AGM: May 7-8, Toronto

Free for injured workers!

Connect. Learn. Advocate.

${EVENT_URL}

#InjuredWorkers`,
    discord: `**≡ƒÆ¬ Be Part of the Movement: ONIWG AGM May 7-8**

**FREE attendance for injured workers** (limited sponsorship available)

**When:** May 7-8, 2026  
**Where:** Toronto, Ontario

This is more than just a meetingΓÇöit's a chance to:
Γ£à **Connect** with injured workers from across the province
Γ£à **Learn** about ongoing advocacy campaigns
Γ£à **Participate** in shaping ONIWG's priorities
Γ£à **Build solidarity** with the movement for workers' rights

ONIWG has been at the forefront of fighting for:
- Fair workers' compensation
- Ending discriminatory age cut-offs
- Improved WSIB processes
- Support for injured worker groups

**Your voice matters. Your presence makes a difference.**

≡ƒô¥ **Register:** ${EVENT_URL}

**Act fastΓÇösponsorship is limited!**`
  },
  {
    mastodon: `≡ƒùô∩╕Å Mark your calendar: ONIWG AGM, May 7-8

Toronto. Free for injured workers. Limited sponsorship.

This is where advocacy happens. Where connections are made. Where change begins.

Don't miss it: ${EVENT_URL}

#ONIWG #InjuredWorkers #Ontario #WorkersRights`,
    bluesky: `≡ƒùô∩╕Å ONIWG AGM: May 7-8, Toronto

Free for injured workers!

Where advocacy happens.

${EVENT_URL}

#ONIWG #WorkersRights`,
    discord: `**≡ƒùô∩╕Å Save the Date: ONIWG AGM - May 7-8, 2026**

**Location:** Toronto  
**Cost:** FREE for injured workers (limited sponsorship available)

**What is the Ontario Network of Injured Workers Groups?**

ONIWG is a coalition of injured worker support groups from across Ontario, united in advocating for:
- Fair compensation for workplace injuries
- Policy reform at WSIB
- Support and resources for injured workers
- An end to discriminatory practices (like the age 65 cut-off)

**Why Attend the AGM?**

1. **Network:** Meet advocates from across the province
2. **Learn:** Hear updates on campaigns like Rights Don't Retire
3. **Contribute:** Share your experiences and priorities
4. **Strategize:** Help plan advocacy for the year ahead

**This is grassroots organizing in action.**

≡ƒô¥ **Register now:** ${EVENT_URL}

**Injured workers: attendance is FREE. Sponsorship is LIMITED. Apply soon!**

Not an injured worker? Share this with your networks! ≡ƒôú`
  },
  {
    mastodon: `≡ƒÜÇ ONIWG AGM: May 7-8, Toronto

Free attendance for injured workers!

Join the network fighting for fair workers' compensation reform.

Limited spots available. Register: ${EVENT_URL}

Share with injured workers in your community!

#InjuredWorkers #ONIWG #Advocacy #Toronto`,
    bluesky: `≡ƒÜÇ ONIWG AGM: May 7-8

Free for injured workers. Limited spots.

Register: ${EVENT_URL}

#InjuredWorkers #ONIWG`,
    discord: `**≡ƒÜÇ ONIWG AGM: Join the Fight for Fair Workers' Compensation**

**≡ƒôà May 7-8, 2026 | ≡ƒôì Toronto**

**FREE for injured workers** - limited sponsorship available!

**Who should attend?**
Γ£à Injured workers who want to connect with the broader movement
Γ£à Anyone interested in workers' compensation advocacy
Γ£à People who want to learn about ONIWG's campaigns

**What you'll experience:**
- **Solidarity:** Meet injured workers from across Ontario
- **Information:** Learn about Rights Don't Retire, WSIB reform efforts, and more
- **Empowerment:** See how collective action drives change
- **Community:** Build relationships with advocates and allies

**ONIWG's Recent Wins:**
- Co-authored "Rights Don't Retire" report highlighting age discrimination
- Coordinated province-wide advocacy for WSIB reform
- Supported injured worker groups across Ontario

**Be part of the next chapter.**

≡ƒô¥ **Register:** ${EVENT_URL}

**Spots filling fastΓÇöregister today!** ΓÅ░`
  },
  {
    mastodon: `Γ£è Injured workers unite! ONIWG AGM - May 7-8, Toronto

Attend for FREE (sponsorship available, limited spots)

This is your network. Your voice. Your movement.

Register now: ${EVENT_URL}

Together we fight for fair workers' compensation.

#Solidarity #InjuredWorkers #ONIWG #WorkersRights`,
    bluesky: `Γ£è ONIWG AGM: May 7-8, Toronto

FREE for injured workers!

Your voice. Your movement.

${EVENT_URL}

#Solidarity #ONIWG`,
    discord: `**Γ£è Injured Workers Unite: ONIWG AGM - May 7-8**

**Location:** Toronto  
**Cost:** FREE for injured workers  
**Sponsorship:** LIMITED - act now!

**This is YOUR network. YOUR voice. YOUR movement.**

ONIWG brings together injured worker groups from across Ontario to fight for:
Γ£à Fair compensation
Γ£à Policy reform
Γ£à Dignity and respect for injured workers

**At the AGM, you'll:**
- Hear from injured worker leaders
- Learn about successful advocacy campaigns
- Participate in planning for the year ahead
- Connect with allies who understand your struggles

**Why it matters:**

When injured workers come together, we:
- Share experiences and strategies
- Amplify our collective voice
- Hold WSIB and government accountable
- Build a stronger movement for justice

**This is grassroots power in action.**

≡ƒô¥ **Register before spots are gone:** ${EVENT_URL}

**See you in Toronto!** ≡ƒñ¥`
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
  console.log('≡ƒôà ONIWG AGM Promotion - May 7-8, 2026');
  console.log('');

  // Check if event has passed
  const now = new Date();
  if (now > EVENT_DATE) {
    console.log('Γ£à Event has passed, no more promotions needed');
    return;
  }

  // Calculate days until event
  const daysUntil = Math.ceil((EVENT_DATE - now) / (1000 * 60 * 60 * 24));
  console.log(`≡ƒôà ${daysUntil} days until ONIWG AGM`);
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
