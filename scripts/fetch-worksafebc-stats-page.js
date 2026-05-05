#!/usr/bin/env node
// Fetch WorkSafeBC statistics page and extract useful links/data
const https = require('https');

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.worksafebc.com',
      path,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };
    https.get(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, location: res.headers.location }));
    }).on('error', reject);
  });
}

(async () => {
  console.log('Fetching /en/resources/about-us/statistics ...');
  const r = await get('/en/resources/about-us/statistics');
  console.log('Status:', r.status, r.location || '');
  
  // Extract all links
  const linkRe = /href="([^"]+)"/g;
  let m;
  const links = new Set();
  while ((m = linkRe.exec(r.body)) !== null) {
    const u = m[1];
    if (u.includes('stat') || u.includes('annual') || u.includes('claim') || u.includes('data') || u.includes('report')) {
      links.add(u);
    }
  }
  console.log('\nRelevant links found:');
  [...links].forEach(l => console.log(l));
  
  // Also look for any tables or data
  const tableStart = r.body.indexOf('<table');
  if (tableStart >= 0) {
    console.log('\nTable found at:', tableStart);
    console.log(r.body.substring(tableStart, tableStart + 500));
  }
  
  // Look for year references
  const yearMatches = r.body.match(/20\d\d/g);
  if (yearMatches) {
    const years = [...new Set(yearMatches)].sort();
    console.log('\nYear references:', years.join(', '));
  }
  
  // Save full response for inspection
  require('fs').writeFileSync('/tmp/worksafebc-stats.html', r.body);
  console.log('\nFull HTML saved to /tmp/worksafebc-stats.html');
  console.log('Body length:', r.body.length);
})();
