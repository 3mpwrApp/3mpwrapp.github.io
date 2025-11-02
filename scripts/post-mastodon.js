// Post a status to Mastodon using env MASTO_INSTANCE, MASTO_TOKEN, MASTO_STATUS, MASTO_VISIBILITY
// Node 20+ has global fetch. No external deps.

const siteConfig = require('./site-config');

async function main() {
  const instance = process.env.MASTO_INSTANCE; // e.g., https://mastodon.social
  const token = process.env.MASTO_TOKEN;       // user access token with write:statuses
  const siteUrl = process.env.SITE_URL || siteConfig.url;
  const visibility = process.env.MASTO_VISIBILITY || 'public';

  if (!instance || !token) {
    console.error('Missing MASTO_INSTANCE or MASTO_TOKEN. Skipping.');
    process.exitCode = 0;
    return;
  }

  const date = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
  let status = process.env.MASTO_STATUS || `Daily highlights for ${date} are live: ${siteUrl}\n\n#Accessibility #A11y #Disability #Canada`;
  // Mastodon common limit ~500 chars; trim just in case
  if (status.length > 490) status = status.slice(0, 490);

  const url = instance.replace(/\/$/, '') + '/api/v1/statuses';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, visibility })
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Mastodon post failed: ${res.status} ${res.statusText} ${text}`);
    }
    const json = await res.json();
    console.log('Mastodon status posted:', json.url || json.uri || '(ok)');
  } catch (err) {
    console.error('Error posting to Mastodon:', err.message || err);
    process.exitCode = 1;
  }
}

main();
