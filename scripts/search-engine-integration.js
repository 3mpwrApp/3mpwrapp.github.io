// Google News & Search Engine RSS Integration
// Pulls curated disability news from Google News and specialized search engines

const https = require('https');
const fs = require('fs');
const path = require('path');

// Google News and search engine feeds for disability keywords
const SEARCH_FEEDS = {
  google_news_disability: {
    name: 'Google News: Disability Rights',
    url: 'https://news.google.com/rss/search?q=disability+rights&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['disability', 'rights', 'news'],
    scoreBonus: 1.5
  },
  
  google_news_accessibility: {
    name: 'Google News: Accessibility',
    url: 'https://news.google.com/rss/search?q=accessibility+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['accessibility', 'barrier', 'access'],
    scoreBonus: 1.5
  },
  
  google_news_employment: {
    name: 'Google News: Disability Employment',
    url: 'https://news.google.com/rss/search?q=disability+employment+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['employment', 'job', 'work', 'disability'],
    scoreBonus: 1.5
  },
  
  google_news_workers_comp: {
    name: 'Google News: Workers Compensation',
    url: 'https://news.google.com/rss/search?q=workers+compensation+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['workers compensation', 'workplace injury', 'WSIB', 'WCB'],
    scoreBonus: 1.5
  },
  
  google_news_benefits: {
    name: 'Google News: Disability Benefits',
    url: 'https://news.google.com/rss/search?q=disability+benefits+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['benefits', 'ODSP', 'AISH', 'CPP', 'support'],
    scoreBonus: 1.5
  },
  
  google_news_mental_health: {
    name: 'Google News: Mental Health Canada',
    url: 'https://news.google.com/rss/search?q=mental+health+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['mental health', 'mental illness', 'support', 'canada'],
    scoreBonus: 1.2
  },
  
  google_news_healthcare: {
    name: 'Google News: Accessible Healthcare',
    url: 'https://news.google.com/rss/search?q=accessible+healthcare+Canada&hl=en-CA&gl=CA&ceid=CA:en',
    keywords: ['healthcare', 'health', 'accessibility', 'medical'],
    scoreBonus: 1.2
  },
  
  // Alternative search - Canada-specific disability news
  bing_disability_ca: {
    name: 'Bing News: Canada Disability',
    url: 'https://www.bing.com/news/search?q=disability+Canada&format=rss',
    keywords: ['disability', 'canada', 'rights', 'services'],
    scoreBonus: 1.0
  },
  
  // Specialized accessibility search
  a11y_search: {
    name: 'Accessibility News',
    url: 'https://feeds.google.com/reader/public/com.google.reader/label/accessibility',
    keywords: ['accessibility', 'a11y', 'wcag', 'inclusive'],
    scoreBonus: 1.5
  },
  
  // Policy & legislation news
  policy_search: {
    name: 'Policy News: Disability & Accessibility',
    url: 'https://news.google.com/rss/search?q=disability+policy+legislation+Canada&hl=en-CA&gl=CA',
    keywords: ['policy', 'legislation', 'law', 'bill', 'regulation'],
    scoreBonus: 2.0
  }
};

// RSS Parser
function parseRSSFeed(xmlData) {
  const items = [];
  
  try {
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xmlData)) !== null) {
      const itemXml = match[1];
      
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\\/${tag}>`, 'i');
        const m = regex.exec(itemXml);
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
      };
      
      const item = {
        title: getTag('title'),
        link: getTag('link'),
        description: getTag('description'),
        pubDate: getTag('pubDate'),
        source: 'search-engine'
      };
      
      if (item.title && item.link) {
        items.push(item);
      }
    }
  } catch (e) {
    console.error('[search] RSS parsing error:', e.message);
  }
  
  return items;
}

// Atom format parser (Google News uses Atom)
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
      
      const linkRegex = /<link[^>]*href=["']([^"']+)["']/i;
      const linkMatch = linkRegex.exec(entryXml);
      
      const item = {
        title: getTag('title'),
        link: linkMatch ? linkMatch[1] : '',
        description: getTag('summary'),
        pubDate: getTag('published'),
        source: 'search-engine'
      };
      
      if (item.title && item.link) {
        items.push(item);
      }
    }
  } catch (e) {
    console.error('[search] Atom parsing error:', e.message);
  }
  
  return items;
}

function httpsGet(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

async function fetchSearchFeed(key, source) {
  try {
    console.log(`[search] Fetching ${source.name}...`);
    const resp = await httpsGet(source.url);
    
    if (resp.status !== 200) {
      console.warn(`[search] ${source.name} returned ${resp.status}`);
      return [];
    }
    
    let items = [];
    if (resp.data.includes('<item>')) {
      items = parseRSSFeed(resp.data);
    } else if (resp.data.includes('<entry>')) {
      items = parseAtomFeed(resp.data);
    }
    
    // Filter by keywords
    const filtered = items.filter(item => filterByKeywords(item, source.keywords));
    
    // Add metadata
    const enriched = filtered.map(item => ({
      ...item,
      source: `search:${source.name}`,
      score: source.scoreBonus + 1.0, // Base score from search relevance
      type: 'search_result'
    }));
    
    console.log(`[search] ${source.name}: ${filtered.length}/${items.length} items`);
    return enriched;
  } catch (e) {
    console.error(`[search] Error fetching ${source.name}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('[search] Starting search engine feed integration...');
  
  const allItems = [];
  
  for (const [key, source] of Object.entries(SEARCH_FEEDS)) {
    try {
      const items = await fetchSearchFeed(key, source);
      allItems.push(...items);
    } catch (e) {
      console.error(`[search] Failed to fetch ${source.name}:`, e.message);
    }
    
    // Rate limiting - respect search engine policies
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  console.log(`[search] Total search engine items: ${allItems.length}`);
  
  // Deduplicate by link
  const seen = new Set();
  const deduped = [];
  for (const item of allItems) {
    if (!seen.has(item.link)) {
      seen.add(item.link);
      deduped.push(item);
    }
  }
  
  console.log(`[search] After deduplication: ${deduped.length} unique items`);
  
  // Save results
  const outFile = path.join(process.cwd(), 'public', 'search-results.json');
  const outDir = path.dirname(outFile);
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, JSON.stringify({
    generated: new Date().toISOString(),
    items: deduped,
    count: deduped.length,
    sources: Object.keys(SEARCH_FEEDS).length,
    note: 'Curated from Google News, Bing News, and specialized search feeds'
  }, null, 2), 'utf8');
  
  console.log(`[search] Saved to ${outFile}`);
}

main().catch(e => {
  console.error('[search] Fatal error:', e);
  process.exit(1);
});
