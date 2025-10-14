// Daily curator: fetch RSS feeds and Mastodon public search, score, open an Issue-like markdown, and write a blog draft.
// No external packages. Network calls via https. Intended to run in GitHub Actions.

const fs = require('fs');
const path = require('path');
const https = require('https');

const CFG_PATH = path.join(process.cwd(), '_data', 'curator.json');

function getCfg() {
  let cfg = {
    rssFeeds: [],
    mastodon: { enabled: false, instance: 'mastodon.social', query: '' },
    keywords: [],
    tags: [],
    maxItems: 25,
    minScore: 1,
    postDaily: true
  };
  if (fs.existsSync(CFG_PATH)) {
    try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync(CFG_PATH,'utf8')) }; } catch(e) {}
  }
  return cfg;
}

function httpGet(url, timeoutMs = 12000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

function parseRSS(xml) {
  // extremely simple item parsing; not robust but works for common feeds
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRegex.exec(xml))) {
    const chunk = m[1];
    const get = (tag) => {
      const r = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i');
      const mm = r.exec(chunk);
      if (!mm) return '';
      return mm[1].replace(/<[^>]+>/g,'').trim();
    };
    items.push({
      title: get('title'),
      link: get('link'),
      description: get('description'),
      pubDate: get('pubDate')
    });
  }
  return items;
}

function scoreItem(text, cfg) {
  let s = 0;
  const t = (text || '').toLowerCase();
  for (const k of cfg.keywords) if (t.includes(k.toLowerCase())) s += 1;
  for (const tag of cfg.tags) if (t.includes(tag.toLowerCase())) s += 1;
  return s;
}

function toISODate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2,'0');
  const day = String(d.getUTCDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

async function fetchMastodon(cfg) {
  if (!cfg.mastodon || !cfg.mastodon.enabled) return [];
  const q = encodeURIComponent(cfg.mastodon.query || cfg.keywords.join(' '));
  const url = `https://${cfg.mastodon.instance}/api/v2/search?q=${q}&type=statuses&limit=40`;
  try {
    const resp = await httpGet(url);
    if (resp.status !== 200) return [];
    const json = JSON.parse(resp.data);
    const statuses = json.statuses || [];
    return statuses.map(s => ({
      title: s.account?.display_name || s.account?.acct || 'Mastodon post',
      link: s.url,
      description: (s.content || '').replace(/<[^>]+>/g,'').trim(),
      pubDate: s.created_at
    }));
  } catch(_) { return []; }
}

async function main(){
  const cfg = getCfg();
  const now = new Date();
  const todayISO = toISODate(now);
  const collected = [];
  // RSS
  let fetchOk = 0, fetchFail = 0;
  for (const feed of cfg.rssFeeds) {
    try {
      const resp = await httpGet(feed);
      if (resp.status !== 200) continue;
      const items = parseRSS(resp.data).slice(0, 20);
      for (const it of items) {
        const text = `${it.title} ${it.description}`;
        let score = scoreItem(text, cfg);
        // Source weighting: boost federal/agency sources
        if (/accessible\.canada|canada\.ca|chrc-ccdp|a11y\.canada/i.test(feed)) score += 1;
        if (/wsib|worksafebc|wcb\./i.test(feed)) score += 0.5;
        // Recency boost: if pubDate within last 24h add +1
        const pub = Date.parse(it.pubDate || '');
        if (!isNaN(pub) && (Date.now() - pub) < 24*60*60*1000) score += 1;
        collected.push({ ...it, source: feed, score });
      }
      fetchOk++;
    } catch(e){
      fetchFail++;
      console.warn('Feed error:', feed, e && e.message ? e.message : String(e));
    }
  }
  // Mastodon
  const masto = await fetchMastodon(cfg);
  for (const it of masto) {
    const text = `${it.title} ${it.description}`;
    const score = scoreItem(text, cfg);
    collected.push({ ...it, source: `mastodon:${cfg.mastodon.instance}`, score });
  }

  // Filter, rank, limit
  // Deduplicate by link (keep highest score)
  const byLink = new Map();
  for (const it of collected) {
    const key = (it.link || '').trim();
    if (!key) continue;
    const prev = byLink.get(key);
    if (!prev || it.score > prev.score) byLink.set(key, it);
  }
  const deduped = Array.from(byLink.values());
  // Per-source caps: limit items from a single domain to avoid dominance
  const domainCounts = Object.create(null);
  const capPerSource = Number(cfg.perSourceCap || 4);
  const capped = [];
  for (const it of deduped.sort((a,b)=> b.score - a.score)) {
    const u = (it.link || '').toString();
    const m = u.match(/^https?:\/\/([^\/]+)/i);
    const host = m ? m[1].toLowerCase() : 'unknown';
    domainCounts[host] = (domainCounts[host] || 0) + 1;
    if (domainCounts[host] <= capPerSource) capped.push(it);
  }

  // Must-include allowlist: ensure at least 1 item from each, if present
  const mustIncludeHosts = Array.isArray(cfg.mustIncludeHosts) ? cfg.mustIncludeHosts : [
    'accessible.canada.ca', 'www.canada.ca', 'chrc-ccdp.gc.ca',
    'www.wsib.ca', 'www.worksafebc.com', 'www.wcb.ab.ca'
  ];
  const ensured = new Map();
  for (const it of deduped) {
    const u = (it.link || '').toString();
    const m = u.match(/^https?:\/\/([^\/]+)/i);
    const host = m ? m[1].toLowerCase() : '';
    if (mustIncludeHosts.includes(host)) {
      if (!ensured.has(host)) ensured.set(host, it);
    }
  }

  const ranked = capped
    .filter(i => i.score >= cfg.minScore)
    .sort((a,b)=> b.score - a.score);
  // Prepend ensured must-include items if not already present
  for (const it of ensured.values()) {
    if (!ranked.find(r => r.link === it.link)) ranked.unshift(it);
  }
  // Cut to maxItems after ensuring must-haves
  ranked.splice(cfg.maxItems);

  // Write a daily blog draft (optional) - ONLY if there are results
  if (cfg.postDaily && ranked.length > 0) {
    const postsDir = path.join(process.cwd(), '_posts');
    if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });
    const file = path.join(postsDir, `${todayISO}-daily-curation.md`);
    if (!fs.existsSync(file)) {
      const out = [];
      out.push('---');
      out.push('layout: post');
      out.push(`title: Daily Highlights (${todayISO})`);
      out.push(`date: ${todayISO} 09:00:00 +0000`);
      out.push('tags: [community, highlights]');
      out.push('categories: [community]');
      out.push('---');
      out.push('');
      out.push('A quick round-up of community stories, mutual aid, and calls-to-action:');
      out.push('');
      for (const it of ranked) {
        const title = it.title || 'Post';
        out.push(`- [${title}](${it.link}) — ${it.description || ''}`);
      }
      out.push('');
      fs.writeFileSync(file, out.join('\n'), 'utf8');
      console.log('Wrote daily draft', file);
    } else {
      console.log('Daily draft already exists, skipping');
    }
  } else if (cfg.postDaily && ranked.length === 0) {
    console.log('Skipping daily post - no items met minimum score threshold');
  }

  // Also write an ISSUE-like markdown summary to _curation/ for human review
  const issuesDir = path.join(process.cwd(), '_curation');
  if (!fs.existsSync(issuesDir)) fs.mkdirSync(issuesDir, { recursive: true });
  const issueFile = path.join(issuesDir, `${todayISO}-curation.md`);
  const lines = [];
  lines.push(`# Daily Curation — ${todayISO}`);
  lines.push('');
  lines.push('Top items (auto-scored):');
  lines.push('');
  if (ranked.length === 0) {
    lines.push('- None met the minimum score today.');
  } else {
    ranked.forEach((it, idx) => {
      lines.push(`${idx+1}. [${it.title || 'Post'}](${it.link})  `);
      lines.push(`   - Score: ${it.score}  `);
      lines.push(`   - Source: ${it.source}  `);
      if (it.description) lines.push(`   - ${it.description}`);
    });
  }
  fs.writeFileSync(issueFile, lines.join('\n'), 'utf8');
  console.log('Wrote curation summary', issueFile);
  console.log(`Feeds success: ${fetchOk}, failed: ${fetchFail}, ranked: ${ranked.length}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
