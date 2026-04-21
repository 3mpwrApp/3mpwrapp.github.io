#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });
const https = require('https');

const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_PASSWORD;

console.log('Testing Bluesky API...');
console.log('Handle:', handle);
console.log('Password present:', !!password);

// Step 1: Create session
const sessionData = JSON.stringify({ identifier: handle, password });

console.log('\n1️⃣ Creating session...');

const sessionReq = https.request({
  hostname: 'bsky.social',
  path: '/xrpc/com.atproto.server.createSession',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(sessionData)
  }
}, (res) => {
  console.log('Session status code:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Session created');
      const session = JSON.parse(body);
      console.log('DID:', session.did);
      console.log('Access JWT present:', !!session.accessJwt);
      
      // Step 2: Create test post
      console.log('\n2️⃣ Creating test post...');
      const postData = JSON.stringify({
        repo: session.did,
        collection: 'app.bsky.feed.post',
        record: {
          text: '🧪 Test post from 3mpwr - verifying Bluesky API connectivity',
          createdAt: new Date().toISOString(),
          $type: 'app.bsky.feed.post'
        }
      });
      
      const postReq = https.request({
        hostname: 'bsky.social',
        path: '/xrpc/com.atproto.repo.createRecord',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (postRes) => {
        console.log('Post status code:', postRes.statusCode);
        let postBody = '';
        postRes.on('data', chunk => postBody += chunk);
        postRes.on('end', () => {
          if (postRes.statusCode >= 200 && postRes.statusCode < 300) {
            console.log('✅ Bluesky post SUCCESS');
            const result = JSON.parse(postBody);
            console.log('Post URI:', result.uri);
          } else {
            console.log('❌ Bluesky post FAILED');
            console.log('Response:', postBody);
          }
        });
      });
      
      postReq.on('error', (err) => {
        console.log('❌ Post request error:', err.message);
      });
      
      postReq.write(postData);
      postReq.end();
      
    } else {
      console.log('❌ Session creation FAILED');
      console.log('Response:', body);
    }
  });
});

sessionReq.on('error', (err) => {
  console.log('❌ Session request error:', err.message);
});

sessionReq.write(sessionData);
sessionReq.end();
