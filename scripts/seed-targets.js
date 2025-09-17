#!/usr/bin/env node
// Usage: node scripts/seed-targets.js targets.json
// JSON: ["Hospital A", "Clinic B", ...]
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
  const file = process.argv[2]; if (!file) { console.error('Usage: seed-targets.js targets.json'); process.exit(1); }
  const arr = JSON.parse(fs.readFileSync(file,'utf8'));
  const db = await ensureAdmin();
  let ok=0, fail=0;
  for (const t of arr) {
    try { const lower = String(t).toLowerCase(); await db.collection('rating_targets').doc(lower.replace(/[^a-z0-9._-]/g,'_')).set({ target: String(t), lower, updatedAt: new Date() }); ok++; }
    catch { fail++; }
  }
  console.log(`seed-targets: ok=${ok}, fail=${fail}`);
}
main().catch((e)=>{ console.error(e); process.exit(1); });

