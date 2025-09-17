#!/usr/bin/env node
// Usage:
//  node scripts/list-users.js [--format json|csv]
// Outputs uid, email, displayName, disabled, customClaims

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
  const args = { format: 'json' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') args.format = argv[++i] || 'json';
    if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node scripts/list-users.js [--format json|csv]');
    process.exit(0);
  }

  const admin = require('firebase-admin');
  const saPath = resolveServiceAccountPath();
  admin.initializeApp({ credential: admin.credential.cert(require(saPath)) });

  const users = [];
  let nextPageToken = undefined;
  do {
    const res = await admin.auth().listUsers(1000, nextPageToken);
    res.users.forEach(u => {
      users.push({
        uid: u.uid,
        email: u.email || '',
        displayName: u.displayName || '',
        disabled: !!u.disabled,
        customClaims: u.customClaims || {},
      });
    });
    nextPageToken = res.pageToken;
  } while (nextPageToken);

  if (args.format === 'csv') {
    const header = 'uid,email,displayName,disabled,customClaims';
    const lines = users.map(u => {
      const claims = JSON.stringify(u.customClaims || {});
      const esc = s => '"' + String(s).replaceAll('"', '""') + '"';
      return [u.uid, u.email, u.displayName, u.disabled, claims].map(esc).join(',');
    });
    console.log([header, ...lines].join('\n'));
  } else {
    console.log(JSON.stringify(users, null, 2));
  }
}

main().catch(e => { console.error(e); process.exit(1); });

