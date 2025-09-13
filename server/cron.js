// Simple polling cron to recrawl sources periodically.
// Usage: npm run cron
// Env:
//  CRAWL_INTERVAL_MS=600000 (default 10 min)
//  CRAWL_LIMIT=50
//  CRAWLER_BASE=http://localhost:8080

import fetch from 'node-fetch';
import adminPkg from 'firebase-admin';

const admin = adminPkg;
try {
  if (!admin.apps?.length) admin.initializeApp({ credential: admin.credential.applicationDefault() });
} catch {}

const db = admin.firestore();
const interval = Number(process.env.CRAWL_INTERVAL_MS || 10 * 60 * 1000);
const limit = Number(process.env.CRAWL_LIMIT || 50);
const base = process.env.CRAWLER_BASE || 'http://localhost:8080';

async function crawl(url) {
  try { const res = await fetch(`${base.replace(/\/$/,'')}/crawl?url=${encodeURIComponent(url)}`); if (!res.ok) throw new Error('bad'); return await res.json(); } catch { return {}; }
}

async function once() {
  console.log('[cron] recrawl tick');
  try {
    const sources = await db.collection('sources').orderBy('createdAt','desc').limit(limit).get();
    for (const doc of sources.docs) {
      const v = doc.data() || {}; if (!v.url) continue;
      const meta = await crawl(v.url);
      await doc.ref.set({ ...v, title: meta.title || v.title || '', description: meta.description || v.description || '', links: meta.links || v.links || [], refreshedAt: new Date() }, { merge: true });
    }
  } catch (e) { console.error('[cron] error', e?.message); }
}

setInterval(once, interval);
once();

