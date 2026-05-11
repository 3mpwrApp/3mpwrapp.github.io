#!/usr/bin/env node
const https = require('https');

const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const params = new URLSearchParams({ 
  api_key: CANLII_API_KEY,
  resultCount: 5,
  offset: 0
});

const url = `https://api.canlii.org/v1/caseBrowse/en/onwsiat/?${params}`;

console.log(`Fetching: ${url}\n`);

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log(`Total cases available: ${parsed.cases?.length || 0}\n`);
    
    if (parsed.cases && parsed.cases.length > 0) {
      console.log('=== SAMPLE CASE STRUCTURE ===\n');
      const sample = parsed.cases[0];
      console.log(JSON.stringify(sample, null, 2));
      
      console.log('\n=== ALL FIELDS ===');
      console.log(Object.keys(sample).join(', '));
      
      console.log('\n=== DATE CHECK ===');
      console.log(`decisionDate: ${sample.decisionDate}`);
      console.log(`Type: ${typeof sample.decisionDate}`);
    }
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
