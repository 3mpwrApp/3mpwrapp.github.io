#!/usr/bin/env node

const https = require('https');

const API_KEY = process.env.CANLII_API_KEY;

// Try a few known LTB case ID patterns
const testIds = [
  '2020canlii1',
  '2020onltb1',
  '2024canlii100',
  '2024onltb100',
  'onltb1',
  'onltb100',
  '1',
  '100',
  '1000'
];

console.log('🧪 Testing LTB Case ID Patterns\n');
console.log('Trying direct case lookup with different ID formats...\n');

async function testCaseId(caseId) {
  return new Promise((resolve) => {
    const url = `/v1/caseBrowse/en/onltb/${caseId}/`;
    
    const options = {
      hostname: 'api.canlii.org',
      path: url,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data);
            console.log(`✅ ${caseId} - FOUND: ${json.title || 'No title'}`);
            resolve({ id: caseId, found: true, data: json });
          } catch (e) {
            console.log(`⚠️  ${caseId} - Invalid JSON`);
            resolve({ id: caseId, found: false });
          }
        } else if (res.statusCode === 404) {
          console.log(`❌ ${caseId} - Not found`);
          resolve({ id: caseId, found: false });
        } else {
          console.log(`⚠️  ${caseId} - Status ${res.statusCode}`);
          resolve({ id: caseId, found: false, status: res.statusCode });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`❌ ${caseId} - Error: ${e.message}`);
      resolve({ id: caseId, found: false });
    });
    
    req.end();
  });
}

async function runTests() {
  for (const id of testIds) {
    await testCaseId(id);
    await new Promise(r => setTimeout(r, 1000)); // Rate limit
  }
  
  console.log('\n💡 If any pattern works, we can use sequential enumeration from that format.');
}

runTests();
