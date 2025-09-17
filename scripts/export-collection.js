#!/usr/bin/env node
// Usage:
//  node scripts/export-collection.js <collectionPath> [--out file.json]
//  node scripts/export-collection.js users --out users.json

const fs = require('fs');
const path = require('path');

function resolveServiceAccountPath() {
  let saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!saPath) {
    const fallback = path.join(__dirname, '..', 'firebase', 'serviceAccount.json');
    if (fs.existsSync(fallback)) saPath = fallback;
  }
  if (!saPath || !fs.existsSync(saPath)) {
    console.error('Service account JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS or add firebase/serviceAccount.json');
    process.exit(1);
  }
  return saPath;
}

function parseArgs(argv) {
  const args = { out: '' };
  if (!argv[0]) return { help: true };
  args.collection = argv[0];
  for (let i = 1; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i] || '';
    if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node scripts/export-collection.js <collectionPath> [--out file.json]');
    process.exit(0);
  }

  const admin = require('firebase-admin');
  const saPath = resolveServiceAccountPath();
  admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });
  const db = admin.firestore();

  const snap = await db.collection(args.collection).get();
  const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (args.out) {
    fs.writeFileSync(path.resolve(args.out), JSON.stringify(rows, null, 2));
    console.log(`Exported ${rows.length} docs from ${args.collection} to ${args.out}`);
  } else {
    console.log(JSON.stringify(rows, null, 2));
  }
}

main().catch(e => { console.error(e); process.exit(1); });

