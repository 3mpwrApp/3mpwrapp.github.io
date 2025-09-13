#!/usr/bin/env node
// Usage: node scripts/seed-resources.js resources.csv
// CSV header: province,category,title,url
const fs = require('fs');
const path = require('path');

async function ensureAdmin() {
  let sa = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!sa) { const fb = path.join(__dirname,'..','firebase','serviceAccount.json'); if (fs.existsSync(fb)) sa = fb; }
  if (!sa || !fs.existsSync(sa)) { console.error('Missing service account'); process.exit(1); }
  const admin = require('firebase-admin');
  if (!admin.apps?.length) admin.initializeApp({ credential: admin.credential.cert(require(sa)) });
  return admin.firestore();
}

function readCsv(file) {
  const txt = fs.readFileSync(file,'utf8');
  const rows = txt.split(/\r?\n/).filter(Boolean).map((l) => l.split(',').map((x)=>x.replace(/^"|"$/g,'')));
  const header = rows.shift();
  return rows.map((r) => Object.fromEntries(header.map((h,i)=>[h,r[i]])));
}

async function main() {
  const file = process.argv[2]; if (!file) { console.error('Usage: seed-resources.js resources.csv'); process.exit(1); }
  const items = readCsv(path.resolve(file));
  const db = await ensureAdmin();
  let ok=0, fail=0;
  for (const it of items) {
    try { await db.collection('resource_links').add({ province: it.province, category: it.category, title: it.title, url: it.url, createdAt: new Date() }); ok++; }
    catch { fail++; }
  }
  console.log(`seed-resources: ok=${ok}, fail=${fail}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });

