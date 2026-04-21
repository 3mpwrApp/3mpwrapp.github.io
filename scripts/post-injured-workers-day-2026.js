#!/usr/bin/env node
/**
 * POST-INJURED-WORKERS-DAY-2026.JS
 * Strategic promotion campaign for Injured Workers Day - June 1, 2026
 * 
 * IMPORTANT CONTEXT:
 * - Relatively new recognition (legislated in 2024 via Bill 31)
 * - Rarely promoted - needs strategic visibility
 * - Official recognition at Queen's Park
 * - Community events across Ontario
 * 
 * Campaign strategy: Build momentum from late April through June 1
 * Rotates through 8 post variants emphasizing different aspects
 */

require('dotenv').config({ path: '.env.local' });

const fs = require('fs');
const path = require('path');
const https = require('https');

const STATE_FILE = path.join(__dirname, '../.github/state/injured-workers-day-2026-state.json');
const EVENT_DATE = new Date('2026-06-01T23:59:59-04:00');
const CAMPAIGN_START = new Date('2026-04-21T00:00:00-04:00');

// Check if we're in campaign window
if (new Date() < CAMPAIGN_START) {
  console.log('ℹ️  Campaign starts April 21, 2026');
  process.exit(0);
}

if (new Date() > EVENT_DATE) {
  console.log('ℹ️  Injured Workers Day 2026 has passed');
  process.exit(0);
}

// Resource links rotating through variants for awareness
const RESOURCE_LINKS = [
  'https://injuredworkersonline.org/june1st2025/',
  'https://www.unifor.org/news/events/recognize-injured-workers-day-june-1',
  'https://www.ohcow.on.ca/posts/the-fight-for-injured-workers-day/',
  'https://www.ontario.ca/laws/statute/s24031',
  'https://www.justice4workers.org/2025-06-01_injured_workers_day',
  'https://injuredworkersonline.org/events/injured-workers-day/'
];

const POSTS = [
  {
    variant: 1,
    text: `📢 MARK YOUR CALENDAR: June 1 - Injured Workers Day

Ontario officially recognizes June 1 as Injured Workers Day—a day to honor injured workers and their families, and advocate for fair treatment.

This recognition was hard-won after years of advocacy. Let's raise awareness together.

Learn more: ${RESOURCE_LINKS[0]}

#InjuredWorkersDay #June1 #Ontario #WorkersRights`
  },
  {
    variant: 2,
    text: `🏛️ Injured Workers Day - Sunday, June 1

Since 2024, Ontario has officially recognized June 1 as Injured Workers Day.

Why? Because injured workers face ongoing struggles:
• Denied benefits
• Inadequate compensation
• Age 65 cut-offs
• System navigation challenges

Join us in demanding justice: ${RESOURCE_LINKS[1]}

#InjuredWorkersDay #Advocacy`
  },
  {
    variant: 3,
    text: `💪 The Fight for Injured Workers Day

For years, injured workers advocated for official recognition. In 2024, Ontario's Bill 31 finally established June 1 as Injured Workers Day.

This isn't just a date—it's a commitment to:
✅ Honor those harmed at work
✅ Support their families
✅ Demand fair compensation

History: ${RESOURCE_LINKS[2]}

#June1 #InjuredWorkers #Ontario`
  },
  {
    variant: 4,
    text: `🔔 JUNE 1: A Day of Recognition and Action

Injured Workers Day is relatively new (since 2024), which is exactly why we need to amplify it.

Every year, thousands of Ontario workers are injured on the job. Many face benefit denials, financial hardship, and inadequate support.

We see you. We fight with you.

Details: ${RESOURCE_LINKS[3]}

#InjuredWorkersDay`
  },
  {
    variant: 5,
    text: `📅 Injured Workers Day - June 1, 2026

Raising awareness about:
• Injured workers' struggles
• The fight for this recognition
• Better WSIB practices needed
• Support for affected families

This is a newer observance—let's build its visibility together.

Learn more: ${RESOURCE_LINKS[4]}

#June1 #InjuredWorkers #Ontario`
  },
  {
    variant: 6,
    text: `🎗️ Why Injured Workers Day Matters

June 1, 2026 marks another year of official recognition for injured workers in Ontario.

The fight isn't over. We still need:
✅ Fair benefit calculations
✅ No age-based cutoffs
✅ Timely claim processing
✅ Respect and dignity in the system

Resources: ${RESOURCE_LINKS[5]}

#InjuredWorkersDay #Advocacy`
  },
  {
    variant: 7,
    text: `📣 Injured workers deserve recognition, respect, and fair treatment.

June 1: Injured Workers Day

Since its establishment in 2024, this day has been a rallying point for:
- System reforms
- Benefit fairness
- Family support
- Community solidarity

Don't let this new recognition fade. Amplify. Advocate.

Learn: ${RESOURCE_LINKS[0]}

#InjuredWorkersDay #WorkersRights`
  },
  {
    variant: 8,
    text: `💪 Sunday, June 1: Injured Workers Day in Ontario

If you're an injured worker or support someone who is, your voice matters.

We're demanding:
• Fair compensation
• System accountability
• End to discriminatory practices

Raise awareness about this important day.

Info: ${RESOURCE_LINKS[1]}

#June1 #Ontario #InjuredWorkersDay`
  }
];

console.log('🎗️ Injured Workers Day Campaign - June 1, 2026');
console.log(`📅 ${Math.ceil((EVENT_DATE - new Date()) / (1000 * 60 * 60 * 24))} days until Injured Workers Day`);
console.log('🔥 STRATEGIC CAMPAIGN: Building visibility for this relatively new recognition');
console.log('');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {}
  return { lastVariant: 0, lastPosted: null, totalPosts: 0 };
}

function saveState(state) {
  try {
    const dir = path.dirname(STATE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.log('⚠️  Could not save state:', err.message);
  }
}

function getNextPost(state) {
  const nextVariant = (state.lastVariant % POSTS.length) + 1;
  console.log(`📝 Using post variant ${nextVariant}/${POSTS.length} (Total campaign posts: ${state.totalPosts || 0})`);
  return { post: POSTS.find(p => p.variant === nextVariant), variant: nextVariant };
}

async function postToDiscord(text) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) { console.log('⚠️  No Discord webhook'); return false; }
  const data = JSON.stringify({ content: text, username: '3mpwr Events'});
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

  saveState({ lastVariant: variant, lastPosted: new Date().toISOString(), totalPosts: (state.totalPosts || 0) + 1 });
  process.exit(successCount > 0 ? 0 : 1);
}

main();
