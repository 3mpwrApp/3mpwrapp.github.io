// Government Agency Web Scraper for ODSP, WSIB, WorkSafeBC, etc.
// Scrapes agency websites that don't have RSS feeds

const https = require('https');
const fs = require('fs');
const path = require('path');

// Government agency scraping targets
const AGENCIES = {
  odsp: {
    name: 'Ontario Disability Support Program',
    url: 'https://www.ontario.ca/page/ontario-disability-support-program',
    selectors: {
      title: 'h1, h2',
      content: '.content-container, main, article',
      links: 'a[href*="/odsp"], a[href*="/disability"]',
      date: 'time, [data-date], .published-date'
    },
    keywords: ['ODSP', 'Ontario Disability', 'support program', 'eligibility', 'application', 'benefits']
  },
  wsib: {
    name: 'Workplace Safety and Insurance Board (Ontario)',
    url: 'https://www.wsib.ca/en/news-and-publications',
    selectors: {
      title: 'h2.title, .news-title',
      content: '.news-item, article, .content',
      links: 'a.news-link, a[href*="/news"], article a',
      date: '.date, time, .published'
    },
    keywords: ['WSIB', 'workplace injury', 'workers compensation', 'claim', 'decision', 'appeal']
  },
  worksafebc: {
    name: 'WorkSafeBC (British Columbia)',
    url: 'https://www.worksafebc.com/en/news-and-events',
    selectors: {
      title: '.article-title, h2',
      content: '.article-content, main',
      links: 'a[href*="/news"], a.article-link',
      date: '.publish-date, time'
    },
    keywords: ['WorkSafeBC', 'workplace safety', 'workers comp', 'injury', 'claim']
  },
  wcb_ab: {
    name: 'WCB Alberta',
    url: 'https://www.wcb.ab.ca/news',
    selectors: {
      title: '.news-title, h2',
      content: '.news-content, article',
      links: 'a.news-link, .news-item a',
      date: '.date, time'
    },
    keywords: ['WCB', 'Alberta', 'workplace', 'injury', 'compensation']
  },
  aish: {
    name: 'Assured Income for the Severely Handicapped (Alberta)',
    url: 'https://www.alberta.ca/aish-program.aspx',
    selectors: {
      title: 'h1, h2.title',
      content: '.content, main',
      links: 'a[href*="/aish"], a[href*="/disability"]',
      date: '[data-updated], time'
    },
    keywords: ['AISH', 'Assured Income', 'Alberta', 'disability', 'severe handicap', 'benefits']
  },
  pwdbc: {
    name: 'Persons with Disabilities Benefits (BC)',
    url: 'https://www2.gov.bc.ca/gov/content/family-social-supports/disability-support',
    selectors: {
      title: 'h1, h2',
      content: '.content, main article',
      links: 'a[href*="/disability"]',
      date: '[data-modified], time'
    },
    keywords: ['PWD', 'persons with disabilities', 'BC', 'benefits', 'support', 'application']
  },
  statcan: {
    name: 'Statistics Canada - Disability Data',
    url: 'https://www.statcan.gc.ca/subjects-sujets/disability-incapacite/index',
    selectors: {
      title: '.h1, h2',
      content: '.content, main',
      links: 'a[href*="/disability"], a[href*="/89-654"]',
      date: '.date-modified, time'
    },
    keywords: ['disability', 'statistics', 'employment', 'data', 'survey', 'Canada']
  },
  servicecanada: {
    name: 'Service Canada - Disability Benefits',
    url: 'https://www.servicecanada.gc.ca/en/services/benefits/index.shtml',
    selectors: {
      title: 'h1, h2.pageTitle',
      content: '.content-container, main',
      links: 'a[href*="/benefits"], a[href*="/disability"]',
      date: '.dateModified, [data-modified]'
    },
    keywords: ['Service Canada', 'CPP disability', 'benefits', 'DTC', 'disability tax credit']
  },
  chrc: {
    name: 'Canadian Human Rights Commission',
    url: 'https://www.chrc-ccdp.gc.ca/en/news-and-media',
    selectors: {
      title: 'h2.news-title, .title',
      content: '.news-content, article',
      links: 'a.news-link, article a',
      date: '.date, time, [data-date]'
    },
    keywords: ['CHRC', 'human rights', 'discrimination', 'complaint', 'accessibility']
  },
  accessible_canada: {
    name: 'Accessible Canada Act',
    url: 'https://accessible.canada.ca/en/news-and-updates',
    selectors: {
      title: 'h1, h2',
      content: '.content, main',
      links: 'a[href*="/news"]',
      date: '[data-posted], time'
    },
    keywords: ['Accessible Canada Act', 'accessibility', 'standards', 'implementation']
  }
};

function httpGet(url, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error('timeout')));
  });
}

// Parse HTML for structured data
function parseHTML(html, agency) {
  const items = [];
  
  try {
    // Simple regex-based HTML parsing (for production, use cheerio or jsdom)
    const titleRegex = /<(h1|h2|h3|title)[^>]*>([^<]+)<\/(h1|h2|h3|title)>/gi;
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    const dateRegex = /(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}|January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/gi;
    
    // Extract potential content blocks
    const sections = html.match(/<(article|section|div[^>]*class="[^"]*content[^"]*")[^>]*>[\s\S]*?<\/(article|section|div)>/gi) || [];
    
    for (const section of sections.slice(0, 5)) {
      let titleMatch = titleRegex.exec(section);
      let linkMatch = linkRegex.exec(section);
      let dateMatch = dateRegex.exec(section);
      
      if (titleMatch && titleMatch[2]) {
        items.push({
          title: titleMatch[2].trim().substring(0, 200),
          link: linkMatch ? linkMatch[1] : agency.url,
          pubDate: dateMatch ? dateMatch[0] : new Date().toISOString(),
          description: `Updated on ${agency.name}`,
          source: `scraper:${agency.name}`,
          score: 2.5 // Government agencies get base score
        });
      }
    }
  } catch (e) {
    console.error(`Parse error for ${agency.name}:`, e.message);
  }
  
  return items;
}

// Validate scraped content against keywords
function validateContent(item, keywords) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const matches = keywords.filter(k => text.includes(k.toLowerCase()));
  return matches.length > 0;
}

async function scrapeAgency(agencyKey, agency) {
  try {
    console.log(`[scraper] Fetching ${agency.name}...`);
    const resp = await httpGet(agency.url);
    
    if (resp.status !== 200) {
      console.warn(`[scraper] ${agency.name} returned ${resp.status}`);
      return [];
    }
    
    const items = parseHTML(resp.data, agency);
    const validated = items.filter(item => validateContent(item, agency.keywords));
    
    console.log(`[scraper] ${agency.name}: ${validated.length} items found`);
    return validated;
  } catch (e) {
    console.error(`[scraper] Error fetching ${agency.name}:`, e.message);
    return [];
  }
}

async function main() {
  console.log('[scraper] Starting government agency scraping...');
  
  const allItems = [];
  
  // Scrape all agencies
  for (const [key, agency] of Object.entries(AGENCIES)) {
    const items = await scrapeAgency(key, agency);
    allItems.push(...items);
    // Rate limiting - wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`[scraper] Total items scraped: ${allItems.length}`);
  
  // Save to file for inclusion in daily curator
  const outFile = path.join(process.cwd(), 'public', 'scraped-agencies.json');
  const outDir = path.dirname(outFile);
  
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  
  fs.writeFileSync(outFile, JSON.stringify({
    generated: new Date().toISOString(),
    items: allItems,
    count: allItems.length
  }, null, 2), 'utf8');
  
  console.log(`[scraper] Saved to ${outFile}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
