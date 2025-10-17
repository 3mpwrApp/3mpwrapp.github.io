// Social Media Monitoring - Track disability organizations on Twitter/Mastodon
// Monitors official disability advocacy accounts for news and announcements

const https = require('https');
const fs = require('fs');
const path = require('path');

// Disability organizations and advocates to monitor
const SOCIAL_ACCOUNTS = {
  mastodon: [
    // Canadian Disability Rights Organizations
    { handle: '@disabilityalliance', instance: 'techhub.social', name: 'Disability Alliance BC' },
    { handle: '@ccdonline', instance: 'techhub.social', name: 'Council of Canadians with Disabilities' },
    { handle: '@inclusioncanada', instance: 'techhub.social', name: 'Inclusion Canada' },
    { handle: '@cnib_ca', instance: 'techhub.social', name: 'Canadian National Institute for the Blind' },
    { handle: '@arch_canada', instance: 'techhub.social', name: 'ARCH Disability Law Centre' },
    { handle: '@cacl_canada', instance: 'techhub.social', name: 'Canadian Association for Community Living' },
    
    // International Disability Rights
    { handle: '@crpd_un', instance: 'mastodon.social', name: 'UN CRPD Committee' },
    { handle: '@disabilityrights', instance: 'mastodon.social', name: 'Disability Rights Now' },
    { handle: '@ada_us', instance: 'mastodon.social', name: 'ADA National Network (US Reference)' },
  ],
  
  twitter_handles: [
    // Canadian Government Agencies
    '@ServiceCanadaCA',
    '@ServiceCanadaFr',
    '@CanAccessibles',
    '@CHRC_CCDP',
    '@Statistics_Canada',
    '@Veterans_Canada',
    
    // Provincial Agencies
    '@Ontario_ca',
    '@ServiceON',
    '@GovBCNews',
    '@AlbertaGov',
    '@ManitobaGov',
    '@SaskGov',
    '@GovQuebec',
    '@NovaScotia_ca',
    '@gnb',
    '@GovNL',
    '@PEI_News',
    '@YukonGov',
    '@northwestel',
    '@NunavutGov',
    
    // Workers' Compensation
    '@WSIB',
    '@WorkSafeBC',
    '@WCB_AB',
    
    // Disability Organizations
    '@CCDonline',
    '@DisabilityAllianceBC',
    '@InclusionCanada',
    '@CNIB',
    '@ARCH_Canada',
    '@CACL_Official',
    '@MarchofDimes_CA',
    '@DwdNetwork',
    '@CamhOrg',
    '@VeteransCanada',
    '@DisabilityRightsCA',
    
    // Accessibility & Inclusion
    '@AccessibleCda',
    '@AodaAlliance',
    '@A11yTO',
    '@AccessibilityINTO',
    '@DisabilitiesRights',
  ]
};

// Mastodon API - Get posts from specific accounts
async function fetchMastodonAccount(handle, instance) {
  try {
    const url = `https://${instance}/api/v1/accounts/lookup?acct=${handle.replace('@', '')}`;
    const resp = await httpsGet(url);
    
    if (resp.status !== 200) {
      console.warn(`[social] Mastodon lookup failed for @${handle}@${instance}: ${resp.status}`);
      return [];
    }
    
    const account = JSON.parse(resp.data);
    const statusesUrl = `https://${instance}/api/v1/accounts/${account.id}/statuses?limit=20&exclude_replies=true`;
    const statusResp = await httpsGet(statusesUrl);
    
    if (statusResp.status !== 200) return [];
    
    const statuses = JSON.parse(statusResp.data);
    return statuses.map(status => ({
      title: status.content.replace(/<[^>]+>/g, '').substring(0, 200),
      link: status.url,
      description: status.spoiler_text || '',
      pubDate: status.created_at,
      source: `mastodon:${instance}/${handle}`,
      platform: 'mastodon',
      account: handle,
      score: 2.0 // Organizational social media
    }));
  } catch (e) {
    console.error(`[social] Error fetching Mastodon ${handle}@${instance}:`, e.message);
    return [];
  }
}

// Twitter/X API (requires bearer token) - simplified version
async function fetchTwitterAccount(handle) {
  // NOTE: This requires Twitter API bearer token set in environment
  // For demo, returns mock data structure
  
  const bearerToken = process.env.TWITTER_BEARER_TOKEN;
  if (!bearerToken) {
    console.log(`[social] Twitter API token not configured. Skipping @${handle}`);
    return [];
  }
  
  try {
    // This would use: https://api.twitter.com/2/tweets/search/recent
    // with query: `from:${handle} disability -is:retweet`
    // Requires: OAuth 2.0 Bearer Token authentication
    console.log(`[social] Twitter monitoring configured for ${handle} (requires API key)`);
    return [];
  } catch (e) {
    console.error(`[social] Twitter error for ${handle}:`, e.message);
    return [];
  }
}

function httpsGet(url, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': '3mpwrApp/1.0 (+https://3mpwrapp.github.io)'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

// Keywords to filter relevant posts
const RELEVANCE_KEYWORDS = [
  'disability', 'disabled', 'accessibility', 'inclusive', 'barrier',
  'accommodation', 'PWD', 'ODSP', 'AISH', 'WSIB', 'WorkSafe', 'WCB',
  'benefits', 'support', 'employment', 'housing', 'healthcare',
  'human rights', 'discrimination', 'advocacy', 'rights',
  'deaf', 'blind', 'wheelchair', 'mobility', 'cognitive',
  'mental health', 'neurodivergent', 'autism', 'ADHD',
  'workers compensation', 'injured worker', 'workplace safety'
];

function isRelevant(post) {
  const text = `${post.title} ${post.description}`.toLowerCase();
  return RELEVANCE_KEYWORDS.some(keyword => text.includes(keyword));
}

async function main() {
  console.log('[social] Starting social media monitoring...');
  
  const allPosts = [];
  
  // Monitor Mastodon accounts
  console.log('[social] Monitoring Mastodon accounts...');
  for (const account of SOCIAL_ACCOUNTS.mastodon) {
    const posts = await fetchMastodonAccount(account.handle, account.instance);
    const relevant = posts.filter(isRelevant);
    allPosts.push(...relevant);
    console.log(`[social] ${account.name}: ${relevant.length}/${posts.length} posts relevant`);
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Monitor Twitter accounts (if token available)
  if (process.env.TWITTER_BEARER_TOKEN) {
    console.log('[social] Monitoring Twitter accounts...');
    for (const handle of SOCIAL_ACCOUNTS.twitter_handles) {
      const posts = await fetchTwitterAccount(handle);
      allPosts.push(...posts);
    }
  } else {
    console.log('[social] Twitter API token not configured - set TWITTER_BEARER_TOKEN to enable');
  }
  
  console.log(`[social] Total relevant posts: ${allPosts.length}`);
  
  // Save results
  const outFile = path.join(process.cwd(), 'public', 'social-media-posts.json');
  const outDir = path.dirname(outFile);
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, JSON.stringify({
    generated: new Date().toISOString(),
    posts: allPosts,
    count: allPosts.length,
    sources: {
      mastodon: SOCIAL_ACCOUNTS.mastodon.length,
      twitter: SOCIAL_ACCOUNTS.twitter_handles.length
    }
  }, null, 2), 'utf8');
  
  console.log(`[social] Saved ${allPosts.length} posts to ${outFile}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
