#!/usr/bin/env node
/**
 * POST-WSIB-CHANGES-APRIL29.JS
 * Posts for IWC Community Meeting on Proposed WSIB Changes
 * April 29, 2026, 1:00 PM (Hybrid: 815 Danforth + Online)
 * Rotates through 5 post variants
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/wsib-changes-april29-state.json');
const EVENT_DATE = new Date('2026-04-29T13:00:00-04:00'); //1 PM EST

if (new Date() > EVENT_DATE) {
  console.log('ℹ️  WSIB Changes meeting has passed, stopping promotion');
  process.exit(0);
}

const POSTS = [
  {
    variant: 1,
    text: `🎉 HISTORIC CHANGES Coming to WSIB!

Ontario is proposing significant reforms:
✅ Benefits increased from 85% to 90% of pre-injury earnings
✅ END the Age 65 cut-off (finally!)
✅ Extended coverage for retirement/group home workers

Join us to discuss:
📅 Wednesday, April 29
⏰ 1:00 PM
📍 Hybrid: 815 Danforth Suite 411 + Online

Register: https://us02web.zoom.us/meeting/register/tZEtde6rrT0jGdDGbPz8tF4m8JhKf5cdvnw2

Injured Workers Consultants
#WSIBReform #InjuredWorkers #Ontario`
  },
  {
    variant: 2,
    text: `🔔 Community Meeting: Proposed WSIB Changes

The changes injured workers have demanded for YEARS are finally on the table!

What we know so far:
• 90% loss of earnings (up from 85%)
• No more Age 65 benefit cut-off
• New coverage for healthcare workers

April 29, 1 PM - In-person & Online

Let's discuss how to ensure these changes benefit ALL injured workers.

Register: tinyurl.com/IWApril29

#WorkersRights #WSIB #Advocacy`
  },
  {
    variant: 3,
    text: `💪 Your Voice Matters: WSIB Changes Community Conversation

Wednesday, April 29 at 1 PM

Ontario government has proposed long-awaited reforms to workers' compensation. This is OUR chance to shape how they're implemented fairly.

Topics:
- What the proposals mean for YOU
- How to advocate for proper implementation
- What we still need to fight for

Hybrid event (limited in-person spots at 815 Danforth, Toronto + Zoom)

Register: https://injuredworkersonline.org

Injured Workers Consultants`
  },
  {
    variant: 4,
    text: `🚨 URGENT: WSIB Reform Discussion - April 29

After decades of advocacy, Ontario is proposing to:
✅ Raise benefits to 90%
✅ Eliminate Age 65 cut-off
✅ Expand coverage

But the details matter. Join us to learn:
- How these changes affect current & future claims
- What's still missing from the reforms
- How to ensure proper implementation

📅 April 29, 1 PM (Hybrid)
📍 815 Danforth #411, Toronto + Online

Sign up: tinyurl.com/IWApril29

#InjuredWorkersOntario #WSIBChanges`
  },
  {
    variant: 5,
    text: `THIS WEDNESDAY: Understanding Proposed WSIB Legislation

The government says they're ending the Age 65 cut-off and raising benefits. But:
- When do changes take effect?
- Who qualifies?
- What about retroactive claims?

Get answers at our community meeting:
April 29 @ 1 PM
Hybrid: 815 Danforth Suite 411 + Zoom

Limited in-person spots—register now!

📝 https://us02web.zoom.us/meeting/register/tZEtde6rrT0jGdDGbPz8tF4m8JhKf5cdvnw2

Organized by Injured Workers Consultants

#WSIB #Ontario #InjuredWorkers`
  }
];

console.log('💼 WSIB Changes Community Meeting - April 29, 2026');
console.log(`📅 ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until meeting`);
console.log('');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {}
  return { lastVariant: 0, lastPosted: null };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {}
}

function getNextPost(state) {
  const nextVariant = (state.lastVariant % POSTS.length) + 1;
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length}`);
  return { post: POSTS.find(p => p.variant === nextVariant), variant: nextVariant };
}

async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) { console.log('⚠️  No Discord webhook'); return false; }
  const data = JSON.stringify({ content: text, username: '3mpwr Events' });
  const url = new URL(webhookUrl);
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url.hostname, path: url.pathname + url.search, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function postToMastodon(text) {
  const token = process.env.MASTO_TOKEN;
  const instance = process.env.MASTO_INSTANCE || 'mastodon.social';
  if (!token) { console.log('⚠️  No Mastodon token'); return false; }
  const data = JSON.stringify({ status: text, visibility: 'public' });
  return new Promise((resolve) => {
    const req = https.request({
      hostname: instance, path: '/api/v1/statuses', method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
    req.on('error', () => resolve(false));
    req.write(data);
    req.end();
  });
}

async function postToBluesky(text) {
  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_PASSWORD;
  if (!handle || !password) { console.log('⚠️  No Bluesky credentials'); return false; }
  try {
    const sessionData = JSON.stringify({ identifier: handle, password });
    const session = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'bsky.social', path: '/xrpc/com.atproto.server.createSession', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(sessionData) }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => res.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error('Session failed')));
      });
      req.on('error', reject);
      req.write(sessionData);
      req.end();
    });
    const postData = JSON.stringify({
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: { text, createdAt: new Date().toISOString(), $type: 'app.bsky.feed.post' }
    });
    return await new Promise((resolve) => {
      const req = https.request({
        hostname: 'bsky.social', path: '/xrpc/com.atproto.repo.createRecord', method: 'POST',
        headers: { 'Authorization': `Bearer ${session.accessJwt}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
      }, (res) => resolve(res.statusCode >= 200 && res.statusCode < 300));
      req.on('error', () => resolve(false));
      req.write(postData);
      req.end();
    });
  } catch (err) { return false; }
}

async function main() {
  const state = loadState();
  const { post, variant } = getNextPost(state);
  const results = { discord: false, mastodon: false, bluesky: false };

  try { results.discord = await postToDiscord(post.text); if (results.discord) console.log('✅ Discord'); } catch (err) { console.log('❌ Discord:', err.message); }
  try { results.mastodon = await postToMastodon(post.text); if (results.mastodon) console.log('✅ Mastodon'); } catch (err) { console.log('❌ Mastodon:', err.message); }
  try { results.bluesky = await postToBluesky(post.text); if (results.bluesky) console.log('✅ Bluesky'); } catch (err) { console.log('❌ Bluesky:', err.message); }

  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n✅ Posted to ${successCount}/3 platforms`);

  saveState({ lastVariant: variant, lastPosted: new Date().toISOString() });
  process.exit(successCount > 0 ? 0 : 1);
}

main();
