#!/usr/bin/env node
// Usage:
//  node scripts/crawl-seed.js sources.json [--collection sources]
//  node scripts/crawl-seed.js sources.csv --collection sources
// Requires a Firebase service account JSON via GOOGLE_APPLICATION_CREDENTIALS or firebase/serviceAccount.json

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { collection: 'sources' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!args.file) { args.file = a; continue; }
    if (a === '--collection') args.collection = argv[++i] || 'sources';
  }
  return args;
}

async function ensureAdmin() {
  let saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) {
    const fallback = path.join(__dirname, '..', 'firebase', 'serviceAccount.json');
    if (fs.existsSync(fallback)) saPath = fallback;
  }
  if (!saPath || !fs.existsSync(saPath)) {
    console.error('Service account JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS or add firebase/serviceAccount.json');
    process.exit(1);
  }
  const admin = require('firebase-admin');
  if (!admin.apps?.length) admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });
  return admin;
}

function readInput(file) {
  const full = path.resolve(file);
  const text = fs.readFileSync(full, 'utf8');
  if (file.endsWith('.json')) return JSON.parse(text);
  if (file.endsWith('.csv')) {
    const rows = text.split(/\r?\n/).filter(Boolean).map((l) => l.split(',').map((x) => x.replace(/^"|"$/g, '')));
    const header = rows.shift();
    return rows.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i]])));
  }
  throw new Error('Unsupported file type');
}

async function crawl(url) {
  const base = process.env.CRAWLER_BASE || 'http://localhost:8080';
  try {
    const res = await fetch(`${base.replace(/\/$/, '')}/crawl?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error('crawl failed');
    return await res.json();
  } catch (e) {
    return { title: '', description: '', links: [] };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) { console.error('Usage: node scripts/crawl-seed.js sources.json [--collection sources]'); process.exit(1); }
  const admin = await ensureAdmin();
  const firestore = admin.firestore();
  const input = readInput(args.file);
  let ok = 0, fail = 0;
  for (const item of input) {
    const url = item.url || item.link || item.href;
    if (!url) continue;
    const meta = await crawl(url);
    const doc = {
      url,
      title: meta.title || item.title || '',
      description: meta.description || item.description || '',
      tag: item.tag || item.category || '',
      links: meta.links || [],
      createdAt: new Date(),
    };
    try { await firestore.collection(args.collection).add(doc); ok++; }
    catch { fail++; }
  }
  console.log(`Done. ok=${ok}, fail=${fail}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });

