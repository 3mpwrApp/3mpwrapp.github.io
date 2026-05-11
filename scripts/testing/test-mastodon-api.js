#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const token = process.env.MASTO_TOKEN;
const instance = process.env.MASTO_INSTANCE;

console.log('Testing Mastodon API...');
console.log('Instance:', instance);
console.log('Token present:', !!token);

const data = JSON.stringify({ 
  status: '🧪 Test post from 3mpwr - verifying Mastodon API connectivity', 
  visibility: 'public' 
});

const req = https.request({
  hostname: instance,
  path: '/api/v1/statuses',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  console.log('Status code:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log('✅ Mastodon post SUCCESS');
      const post = JSON.parse(body);
      console.log('Post URL:', post.url);
    } else {
      console.log('❌ Mastodon post FAILED');
      console.log('Response:', body);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Request error:', err.message);
});

req.write(data);
req.end();
