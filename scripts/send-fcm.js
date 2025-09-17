#!/usr/bin/env node
// Usage examples:
//  node scripts/send-fcm.js --token <fcmToken> --title "Hello" --body "World"
//  node scripts/send-fcm.js --topic updates --title "App Update" --body "v1.2 released" --data url=https://empowr.app
// Requires a Firebase service account JSON. Provide one of:
//  - env GOOGLE_APPLICATION_CREDENTIALS pointing to the JSON path
//  - place serviceAccount.json at firebase/serviceAccount.json

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { data: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--token') args.token = argv[++i];
    else if (a === '--topic') args.topic = argv[++i];
    else if (a === '--title') args.title = argv[++i];
    else if (a === '--body') args.body = argv[++i];
    else if (a === '--data') {
      const kv = (argv[++i] || '').split('=');
      const k = kv[0];
      const v = kv.slice(1).join('=');
      if (k) args.data[k] = v;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    }
  }
  return args;
}

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

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || (!args.token && !args.topic)) {
    console.log('Usage: node scripts/send-fcm.js (--token <fcmToken> | --topic <topic>) --title <t> --body <b> [--data k=v]...');
    process.exit(args.help ? 0 : 1);
  }

  const saPath = resolveServiceAccountPath();
  const admin = require('firebase-admin');
  admin.initializeApp({
    credential: admin.credential.cert(require(saPath)),
  });

  const message = {
    notification: {
      title: args.title || '',
      body: args.body || '',
    },
    data: Object.fromEntries(Object.entries(args.data).map(([k, v]) => [String(k), String(v)])),
  };

  if (args.token) message.token = args.token;
  if (args.topic) message.topic = args.topic;

  try {
    const id = await admin.messaging().send(message);
    console.log('FCM message sent:', id);
  } catch (e) {
    console.error('Failed to send FCM message:', e.message || e);
    process.exit(1);
  }
}

main();

