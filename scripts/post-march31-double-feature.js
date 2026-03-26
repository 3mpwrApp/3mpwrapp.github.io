#!/usr/bin/env node
/**
 * POST-MARCH31-DOUBLE-FEATURE.JS
 * One-time post for March 31st Double Feature event
 */

const https = require('https');

const POSTS = {
  mastodon: `📅 Next Tuesday March 31st, 10am EST: Double Feature Event! 🌟

Two powerful presentations in one 2-hour session:
• 3mpwrApp Tech Demo - Transform isolated struggles into collective power
• Workers' Rights with Jaribu Hill - Founding Director, NDWA

For injured workers & disabled people!

📧 Email tbiwsg@gmail.com for Zoom link
🏠 https://thunderbayinjuredworkers.com/tuesday-events/

#InjuredWorkers #ThunderBay #WorkersRights`,
  
  bluesky: `🌟 Next Tue March 31, 10am EST: Double Feature!

• 3mpwrApp Tech Demo
• Workers' Rights with Jaribu Hill (NDWA founder)

2-hour session!

📧 tbiwsg@gmail.com for Zoom
🏠 https://thunderbayinjuredworkers.com/tuesday-events/

#ThunderBay #InjuredWorkers #WorkersRights`,
  
  discord: `**🌟 Double Feature - Next Tuesday March 31st, 10am EST**

Two powerful presentations!

✨ **3mpwrApp Tech Demo** - Transform isolated struggles into collective power. Interactive demo of tech tools for injured workers.

✨ **Workers' Rights with Jaribu Hill** - Founding Director of National Domestic Workers Alliance shares insights on building worker power.

📧 **Email tbiwsg@gmail.com for Zoom link**
🏠 **Info:** https://thunderbayinjuredworkers.com/tuesday-events/

2-hour event - mark your calendars! 📅`
};

const config = {
  mastodon: {
    enabled: !!process.env.MASTO_TOKEN,
    instance: process.env.MASTO_INSTANCE || 'https://mastodon.social',
    token: process.env.MASTO_TOKEN || '',
  },
  bluesky: {
    enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
    handle: process.env.BLUESKY_HANDLE || '',
    password: process.env.BLUESKY_PASSWORD || '',
    pds: process.env.BLUESKY_PDS || 'https://bsky.social',
  },
  discord: {
    enabled: !!process.env.DISCORD_WEBHOOK_URL,
    webhookUrl: process.env.DISCORD_WEBHOOK_URL || '',
  }
};

async function httpsRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body), headers: res.headers });
        } catch {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function postToMastodon(content) {
  if (!config.mastodon.enabled) {
    return { success: false, message: 'Not configured' };
  }

  try {
    console.log('📤 Posting to Mastodon...');
    const instance = config.mastodon.instance.replace(/^https?:\/\//, '');
    const url = new URL(`https://${instance}/api/v1/statuses`);

    const options = {
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname,
      headers: {
        'Authorization': `Bearer ${config.mastodon.token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await httpsRequest(options, { status: content, visibility: 'public' });

    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✅ Posted to Mastodon');
      return { success: true };
    } else {
      console.error('❌ Mastodon error:', response.statusCode);
      return { success: false, message: `HTTP ${response.statusCode}` };
    }
  } catch (error) {
    console.error('❌ Mastodon error:', error.message);
    return { success: false, message: error.message };
  }
}

async function postToBluesky(content) {
  if (!config.bluesky.enabled) {
    return { success: false, message: 'Not configured' };
  }

  try {
    console.log('📤 Posting to Bluesky...');
    const pdsUrl = new URL(config.bluesky.pds);

    // Login
    const loginOptions = {
      method: 'POST',
      hostname: pdsUrl.hostname,
      path: '/xrpc/com.atproto.server.createSession',
      headers: { 'Content-Type': 'application/json' }
    };

    const loginResponse = await httpsRequest(loginOptions, {
      identifier: config.bluesky.handle,
      password: config.bluesky.password
    });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`Login failed: ${loginResponse.statusCode}`);
    }

    const { accessJwt, did } = loginResponse.body;

    // Post
    const postOptions = {
      method: 'POST',
      hostname: pdsUrl.hostname,
      path: '/xrpc/com.atproto.repo.createRecord',
      headers: {
        'Authorization': `Bearer ${accessJwt}`,
        'Content-Type': 'application/json'
      }
    };

    const postResponse = await httpsRequest(postOptions, {
      repo: did,
      collection: 'app.bsky.feed.post',
      record: {
        text: content,
        createdAt: new Date().toISOString(),
        $type: 'app.bsky.feed.post'
      }
    });

    if (postResponse.statusCode === 200 || postResponse.statusCode === 201) {
      console.log('✅ Posted to Bluesky');
      return { success: true };
    } else {
      console.error('❌ Bluesky error:', postResponse.statusCode);
      return { success: false, message: `HTTP ${postResponse.statusCode}` };
    }
  } catch (error) {
    console.error('❌ Bluesky error:', error.message);
    return { success: false, message: error.message };
  }
}

async function postToDiscord(content) {
  if (!config.discord.enabled) {
    return { success: false, message: 'Not configured' };
  }

  try {
    console.log('📤 Posting to Discord...');
    const webhookUrl = new URL(config.discord.webhookUrl);

    const options = {
      method: 'POST',
      hostname: webhookUrl.hostname,
      path: webhookUrl.pathname + webhookUrl.search,
      headers: { 'Content-Type': 'application/json' }
    };

    const response = await httpsRequest(options, {
      content: content,
      username: '3mpwrApp Events',
      avatar_url: 'https://3mpwrapp.pages.dev/assets/empwrapp-logo.png'
    });

    if (response.statusCode === 204 || response.statusCode === 200) {
      console.log('✅ Posted to Discord');
      return { success: true };
    } else {
      console.error('❌ Discord error:', response.statusCode);
      return { success: false, message: `HTTP ${response.statusCode}` };
    }
  } catch (error) {
    console.error('❌ Discord error:', error.message);
    return { success: false, message: error.message };
  }
}

async function main() {
  console.log('🚀 Posting March 31st Double Feature Event');
  console.log('═'.repeat(60));
  console.log(`\n📅 Event: Tuesday, March 31st, 10am EST`);
  console.log(`🌟 Double Feature: 3mpwrApp Tech Demo + Jaribu Hill\n`);

  const results = {
    mastodon: await postToMastodon(POSTS.mastodon),
    bluesky: await postToBluesky(POSTS.bluesky),
    discord: await postToDiscord(POSTS.discord)
  };

  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n' + '═'.repeat(60));
  console.log('📊 POSTING SUMMARY');
  console.log('═'.repeat(60));

  const successful = Object.values(results).filter(r => r.success).length;
  console.log(`✅ Successful: ${successful}/3\n`);
  console.log(`Mastodon: ${results.mastodon.success ? '✅' : '❌'} ${results.mastodon.message || 'Posted'}`);
  console.log(`Bluesky:  ${results.bluesky.success ? '✅' : '❌'} ${results.bluesky.message || 'Posted'}`);
  console.log(`Discord:  ${results.discord.success ? '✅' : '❌'} ${results.discord.message || 'Posted'}`);

  process.exit(successful > 0 ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
