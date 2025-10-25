// Newsletter & Email List Parser
// Extracts newsletter content and government email updates for disability services

const https = require('https');
const fs = require('fs');
const path = require('path');

// Government and organization newsletters with discoverable RSS/feed endpoints
const NEWSLETTER_SOURCES = {
  // Federal Government Newsletters
  service_canada: {
    name: 'Service Canada Updates',
    url: 'https://www.servicecanada.gc.ca/en/rss/news-eng.xml',
    type: 'rss',
    keywords: ['disability', 'benefits', 'CPP', 'application']
  },
  
  // Provincial Newsletters (many have hidden RSS endpoints)
  ontario_disability: {
    name: 'Ontario Disability Support Program',
    url: 'https://news.ontario.ca/en/search/rss?topic=disability',
    type: 'rss',
    keywords: ['ODSP', 'disability', 'support', 'application', 'rates']
  },
  
  bc_disability: {
    name: 'British Columbia Disability Services',
    url: 'https://news.gov.bc.ca/rss/social-development-poverty-reduction.rss',
    type: 'rss',
    keywords: ['PWD', 'disability', 'BC', 'benefits', 'application']
  },
  
  // Advocacy Organization Newsletters
  ccdonline: {
    name: 'Council of Canadians with Disabilities',
    url: 'https://www.ccdonline.ca/en/rss.xml',
    type: 'rss',
    keywords: ['disability', 'rights', 'advocacy', 'policy']
  },
  
  inclusion_canada: {
    name: 'Inclusion Canada',
    url: 'https://inclusioncanada.ca/feed/',
    type: 'rss',
    keywords: ['inclusion', 'intellectual', 'disability', 'community']
  },
  
  // Workers' Compensation Newsletters
  wsib_updates: {
    name: 'WSIB News & Updates',
    url: 'https://www.wsib.ca/en/newsroom/rss.xml',
    type: 'rss',
    keywords: ['WSIB', 'workplace', 'injury', 'compensation', 'claim']
  },
  
  worksafebc_alerts: {
    name: 'WorkSafeBC Alerts',
    url: 'https://www.worksafebc.com/en/about-us/news-events/news/rss',
    type: 'rss',
    keywords: ['WorkSafeBC', 'safety', 'injury', 'alert', 'update']
  },
  
  // Accessibility & Policy
  accessible_canada: {
    name: 'Accessible Canada Act Updates',
    url: 'https://accessible.canada.ca/en/whats-new.rss',
    type: 'rss',
    keywords: ['accessibility', 'AODA', 'standards', 'implementation']
  },
  
  // Government Job Updates (for disability employment)
  job_bank: {
    name: 'Job Bank - Inclusive Employment',
    url: 'https://www.jobbank.gc.ca/news_rss-eng.xml',
    type: 'rss',
    keywords: ['employment', 'job', 'inclusive', 'accommodation']
  },
  
  // Health & Wellness
  camh: {
    name: 'Centre for Addiction and Mental Health',
    url: 'https://www.camh.ca/en/camh-news-and-stories/rss.xml',
    type: 'rss',
    keywords: ['mental health', 'mental illness', 'recovery', 'support']
  },
  
  // International Standards (UN CRPD)
  un_crpd: {
    name: 'UN Convention on the Rights of Persons with Disabilities',
    url: 'https://www.un.org/development/desa/disabilities/news/rss.xml',
    type: 'rss',
    keywords: ['CRPD', 'UN', 'disability rights', 'convention']
  }
};

// RSS Parser - extract items from feed
function parseRSSFeed(xmlData) {
  const items = [];
  
  try {
    // Match RSS items
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlData)) !== null) {
      const itemXml = match[1];
      
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\\/${tag}>`, 'i');
        const m = regex.exec(itemXml);
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
      };
      
      items.push({
        title: getTag('title'),
        link: getTag('link'),
        description: getTag('description'),
        pubDate: getTag('pubDate'),
        category: getTag('category'),
        source: getTag('source') || 'Newsletter Feed'
      });
    }
  } catch (e) {
    console.error('[newsletter] RSS parsing error:', e.message);
  }
  
  return items;
}

// Parse Atom feeds (alternative format)
function parseAtomFeed(xmlData) {
  const items = [];
  
  try {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;
    
    while ((match = entryRegex.exec(xmlData)) !== null) {
      const entryXml = match[1];
      
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\\/${tag}>`, 'i');
        const m = regex.exec(entryXml);
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
      };
      
      // Extract link href
      const linkRegex = /<link[^>]*href=["']([^"']+)["']/i;
      const linkMatch = linkRegex.exec(entryXml);
      
      items.push({
        title: getTag('title'),
        link: linkMatch ? linkMatch[1] : '',
        description: getTag('summary'),
        pubDate: getTag('published'),
        category: getTag('category'),
        source: 'Newsletter Feed'
      });
    }
  } catch (e) {
    console.error('[newsletter] Atom parsing error:', e.message);
  }
  
  return items;
}

function httpsGet(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': '3mpwrApp/1.0 (+https://3mpwrapp.pages.dev/)'
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

function filterByKeywords(item, keywords) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

async function fetchNewsletter(key, newsletter) {
  try {
    console.log(`[newsletter] Fetching ${newsletter.name}...`);
    const resp = await httpsGet(newsletter.url);
    
    if (resp.status !== 200) {
      console.warn(`[newsletter] ${newsletter.name} returned ${resp.status}`);
      return [];
    }
    
    let items = [];
    if (newsletter.type === 'rss' || resp.data.includes('<item>')) {
      items = parseRSSFeed(resp.data);
    } else if (resp.data.includes('<entry>')) {
      items = parseAtomFeed(resp.data);
    }
    
    // Filter by keywords
    const filtered = items.filter(item => filterByKeywords(item, newsletter.keywords));
    
    // Add source metadata
    const enriched = filtered.map(item => ({
      ...item,
      source: `newsletter:${newsletter.name}`,
      score: 2.0,
      type: 'newsletter'
    }));
    
    console.log(`[newsletter] ${newsletter.name}: ${filtered.length}/${items.length} items relevant`);
    return enriched;
  } catch (e) {
    console.error(`[newsletter] Error fetching ${newsletter.name}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('[newsletter] Starting newsletter parsing...');
  
  const allItems = [];
  
  for (const [key, newsletter] of Object.entries(NEWSLETTER_SOURCES)) {
    const items = await fetchNewsletter(key, newsletter);
    allItems.push(...items);
    
    // Rate limiting - wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`[newsletter] Total newsletter items: ${allItems.length}`);
  
  // Save results
  const outFile = path.join(process.cwd(), 'public', 'newsletter-items.json');
  const outDir = path.dirname(outFile);
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, JSON.stringify({
    generated: new Date().toISOString(),
    items: allItems,
    count: allItems.length,
    sources: Object.keys(NEWSLETTER_SOURCES).length
  }, null, 2), 'utf8');
  
  console.log(`[newsletter] Saved to ${outFile}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
