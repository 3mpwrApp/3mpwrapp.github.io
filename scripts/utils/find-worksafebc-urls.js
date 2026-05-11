#!/usr/bin/env node
// Quick helper to find WorkSafeBC statistics URLs
const https = require('https');

function get(hostname, path) {
  return new Promise((resolve, reject) => {
    https.get({ hostname, path, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d, location: res.headers.location }));
    }).on('error', reject);
  });
}

(async () => {
  const r = await get('www.worksafebc.com', '/en');
  const re = /href="(\/[^"]*(?:stat|annual|report|data|publication|research)[^"]*)"/gi;
  let m;
  const found = new Set();
  while ((m = re.exec(r.body)) !== null) {
    found.add(m[1]);
  }
  console.log('Stats-related links on homepage:');
  [...found].forEach(u => console.log(u));
  
  // Also try known patterns
  const testPaths = [
    '/en/resources/about-us/statistics',
    '/en/about-us/reports-publications',
    '/en/about-us/open-data',
    '/en/resources/about-us/reports-publications',
  ];
  for (const p of testPaths) {
    const r2 = await get('www.worksafebc.com', p);
    console.log(`${p} => ${r2.status} ${r2.location || ''}`);
  }
})();
