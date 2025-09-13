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

async function fetchWorld() {
  const url = process.env.WORLD_MAP_URL;
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    if (!Array.isArray(items)) return;
    for (const it of items) {
      const id = String(it.id || `${it.lat}_${it.lng}`);
      await db.collection('world_items').doc(id).set({ ...it, refreshedAt: new Date() }, { merge: true });
    }
    console.log(`[cron] world map refreshed: ${items.length} items`);
  } catch (e) { console.error('[cron] world map fetch failed', e?.message); }
}

async function fetchTargets() {
  const url = process.env.TARGETS_URL;
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const arr = await res.json();
    if (!Array.isArray(arr)) return;
    for (const t of arr) {
      const target = String(t);
      const lower = target.toLowerCase();
      await db.collection('rating_targets').doc(lower.replace(/[^a-z0-9._-]/g,'_')).set({ target, lower, updatedAt: new Date() }, { merge: true });
    }
    console.log(`[cron] rating targets refreshed: ${arr.length}`);
  } catch (e) { console.error('[cron] targets fetch failed', e?.message); }
}

async function fetchResources() {
  const url = process.env.RESOURCES_URL;
  if (!url) return;
  try {
    const res = await fetch(url);
    if (!res.ok) return;
    const items = await res.json();
    if (!Array.isArray(items)) return;
    const keepIds = new Set();
    for (const it of items) {
      const rawId = String(it.url || `${it.province||''}|${it.category||''}|${it.title||''}`);
      const id = rawId.toLowerCase().replace(/[^a-z0-9._-]/g, '_');
      keepIds.add(id);
      await db
        .collection('resource_links')
        .doc(id)
        .set({ source: 'feed', province: it.province, category: it.category, title: it.title, url: it.url, refreshedAt: new Date() }, { merge: true });
    }
    // deletion handling: remove any resource_links not present in the fetched list
    try {
      const snap = await db.collection('resource_links').where('source','==','feed').get();
      for (const d of snap.docs) {
        if (!keepIds.has(d.id)) await d.ref.delete();
      }
    } catch (e) { console.warn('[cron] resource links cleanup skipped', e?.message); }
    console.log(`[cron] resource links refreshed (upsert+cleanup): ${items.length}`);
  } catch (e) { console.error('[cron] resources fetch failed', e?.message); }
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
  await fetchWorld();
  await fetchTargets();
  await fetchResources();
}

setInterval(once, interval);
once();
