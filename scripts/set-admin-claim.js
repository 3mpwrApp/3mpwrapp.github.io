#!/usr/bin/env node
// Usage: node scripts/set-admin-claim.js <uid> [true|false]
// Requires: a Firebase service account JSON. Provide one of:
// - env GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON path
// - place serviceAccount.json at firebase/serviceAccount.json

const fs = require('fs');
const path = require('path');

async function main() {
  const [uid, valueRaw] = process.argv.slice(2);
  if (!uid) {
    console.error('Usage: node scripts/set-admin-claim.js <uid> [true|false]');
    process.exit(1);
  }
  const adminValue = valueRaw === 'false' ? false : true;

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
  admin.initializeApp({
    credential: admin.credential.cert(require(saPath)),
  });

  await admin.auth().setCustomUserClaims(uid, { admin: adminValue });
  console.log(`Set admin=${adminValue} for UID ${uid}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

