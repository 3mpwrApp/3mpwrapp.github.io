// Government & Public APIs Integration
// Pulls data directly from Stats Canada, Service Canada, and provincial APIs

const https = require('https');
const fs = require('fs');
const path = require('path');
const siteConfig = require('./site-config');

// Government APIs for disability-related data
const APIS = {
  statcan_disability: {
    name: 'Statistics Canada - Disability Data',
    url: 'https://api.statcan.gc.ca/api/tables/json/1/12-100001-01',
    description: 'Latest disability statistics and employment data',
    keywords: ['disability', 'employment', 'statistics', 'Canada'],
    scoreBonus: 3.0 // Government official data
  },
  
  statcan_labour: {
    name: 'Statistics Canada - Labour Force Survey',
    url: 'https://api.statcan.gc.ca/api/tables/json/1/14-100001-01',
    description: 'Labour force and employment statistics',
    keywords: ['employment', 'labour', 'disability', 'work'],
    scoreBonus: 2.5
  },
  
  open_data_benefit: {
    name: 'Open Canada - Disability Benefits Registry',
    url: 'https://open.canada.ca/data/api/3/action/package_search?q=disability',
    description: 'Open government disability benefit programs',
    keywords: ['benefits', 'disability', 'program', 'application'],
    scoreBonus: 2.5
  },
  
  service_canada_api: {
    name: 'Service Canada - Services Database',
    url: 'https://www.servicecanada.gc.ca/en/rss/news-eng.xml',
    description: 'Federal benefits and services announcements',
    keywords: ['Service Canada', 'benefits', 'CPP', 'EI', 'disability'],
    scoreBonus: 2.5
  },
  
  veterans_affairs: {
    name: 'Veterans Affairs Canada - Benefits Data',
    url: 'https://www.veterans.gc.ca/eng/rss',
    description: 'Veterans disability benefits and services',
    keywords: ['veterans', 'disability', 'benefits', 'services'],
    scoreBonus: 2.5
  },
  
  health_canada: {
    name: 'Health Canada - Accessibility & Disability',
    url: 'https://www.canada.ca/en/health/topics/accessible-care.rss.xml',
    description: 'Healthcare accessibility initiatives',
    keywords: ['healthcare', 'accessibility', 'disability', 'health'],
    scoreBonus: 2.0
  },
  
  accessible_canada_api: {
    name: 'Accessible Canada Act - Organizations Registry',
    url: 'https://accessible.canada.ca/en/registry',
    description: 'Federal organizations compliance with accessibility requirements',
    keywords: ['accessibility', 'AODA', 'compliance', 'requirements'],
    scoreBonus: 2.5
  }
};

// Transform API responses into standardized format
function transformStatCanData(data, source) {
  const items = [];
  
  try {
    if (data.tables && Array.isArray(data.tables)) {
      for (const table of data.tables.slice(0, 5)) {
        items.push({
          title: table.title || `Statistics Canada Table ${table.id}`,
          link: `https://www150.statcan.gc.ca/n1/pub/${table.id}`,
          description: table.description || `Statistical data on ${source.name}`,
          pubDate: new Date().toISOString(),
          source: `api:${source.name}`,
          score: source.scoreBonus,
          type: 'government_data'
        });
      }
    } else if (data.data && Array.isArray(data.data)) {
      // Direct data array format
      for (const row of data.data.slice(0, 10)) {
        items.push({
          title: row.title || `${source.name} Update`,
          link: row.url || source.url,
          description: row.description || `Latest data from ${source.name}`,
          pubDate: row.date || new Date().toISOString(),
          source: `api:${source.name}`,
          score: source.scoreBonus,
          type: 'government_data'
        });
      }
    }
  } catch (e) {
    console.error(`[api] Error transforming ${source.name}:`, e.message);
  }
  
  return items;
}

// Parse JSON responses from APIs
function parseAPIResponse(responseText, source) {
  try {
    const data = JSON.parse(responseText);
    return transformStatCanData(data, source);
  } catch (e) {
    console.error(`[api] JSON parse error for ${source.name}:`, e.message);
    return [];
  }
}

// HTTP wrapper for APIs
function httpsGet(url, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': siteConfig.getUserAgent(),
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      
      // Check for redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.warn(`[api] Redirect from ${url} to ${res.headers.location}`);
        return httpsGet(res.headers.location, timeoutMs)
          .then(resolve)
          .catch(reject);
      }
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('timeout'));
      reject(new Error('Request timeout'));
    });
  });
}

async function fetchAPI(key, source) {
  try {
    console.log(`[api] Fetching ${source.name}...`);
    const resp = await httpsGet(source.url);
    
    if (resp.status !== 200) {
      console.warn(`[api] ${source.name} returned ${resp.status}`);
      return [];
    }
    
    const items = parseAPIResponse(resp.data, source);
    console.log(`[api] ${source.name}: ${items.length} items`);
    return items;
  } catch (e) {
    console.error(`[api] Error fetching ${source.name}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('[api] Starting government API integration...');
  
  const allItems = [];
  
  for (const [key, source] of Object.entries(APIS)) {
    try {
      const items = await fetchAPI(key, source);
      allItems.push(...items);
    } catch (e) {
      console.error(`[api] Failed to fetch ${source.name}:`, e.message);
    }
    
    // Rate limiting - respect API quotas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`[api] Total API items: ${allItems.length}`);
  
  // Save results
  const outFile = path.join(process.cwd(), 'public', 'api-data.json');
  const outDir = path.dirname(outFile);
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, JSON.stringify({
    generated: new Date().toISOString(),
    items: allItems,
    count: allItems.length,
    sources: Object.keys(APIS).length,
    note: 'Official government data pulled via public APIs'
  }, null, 2), 'utf8');
  
  console.log(`[api] Saved to ${outFile}`);
}

main().catch(e => {
  console.error('[api] Fatal error:', e);
  process.exit(1);
});
