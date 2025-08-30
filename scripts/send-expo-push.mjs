#!/usr/bin/env node
// Send a push via Expo Push API. Usage:
// node scripts/send-expo-push.mjs --to <ExpoPushToken> --title "Hi" --body "Message"
import https from 'node:https';

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i];
    const v = args[i + 1];
    if (!k?.startsWith('--')) continue;
    out[k.slice(2)] = v;
  }
  return out;
}

const { to, title = 'Empowr', body = 'Test push from script' } = parseArgs();
if (!to) {
  console.error('Missing --to <ExpoPushToken>');
  process.exit(1);
}

const payload = JSON.stringify({ to, title, body, sound: 'default' });

const req = https.request({
  method: 'POST',
  host: 'exp.host',
  path: '/--/api/v2/push/send',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
}, (res) => {
  let data = '';
  res.on('data', (d) => (data += d.toString('utf8')));
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error('Request failed:', e.message);
  process.exit(1);
});

req.write(payload);
req.end();

