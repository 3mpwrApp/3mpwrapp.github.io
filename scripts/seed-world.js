#!/usr/bin/env node
// Usage: node scripts/seed-world.js world.json
// JSON: [{ id, title, kind, lat, lng, city, country }]
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

async function main() {
  const file = process.argv[2]; if (!file) { console.error('Usage: seed-world.js world.json'); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(file,'utf8'));
  const db = await ensureAdmin();
  let ok=0, fail=0;
  for (const it of data) {
    try { await db.collection('world_items').doc(String(it.id||Date.now()+Math.random())).set(it); ok++; }
    catch { fail++; }
  }
  console.log(`seed-world: ok=${ok}, fail=${fail}`);
}
main().catch((e)=>{ console.error(e); process.exit(1); });

