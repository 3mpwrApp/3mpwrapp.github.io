// k6 Live Website Stress Test
// FOCUSED: Only key pages (no community/resources/wellness - those are on the app)
// Usage: k6 run LIVE-STRESS-TEST.js
// Output: Saves results to stress-test-results.json

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const duration = new Trend('request_duration');
const successRate = new Rate('successes');
const httpErrors = new Counter('http_errors');

// Test configuration - AGGRESSIVE STRESS TEST
export const options = {
  stages: [
    { duration: '2m', target: 50, name: 'Ramp-up' },        // 2m to 50 VUs
    { duration: '5m', target: 200, name: 'Sustained load' }, // 5m at 200 VUs
    { duration: '3m', target: 500, name: 'Peak load' },      // 3m at 500 VUs
    { duration: '2m', target: 800, name: 'Stress' },         // 2m at 800 VUs
    { duration: '2m', target: 0, name: 'Cool down' },        // Ramp down
  ],
  thresholds: {
    'errors': ['rate<0.05'],           // Allow <5% error rate during stress
    'request_duration': ['p(95)<5000'], // 95th percentile < 5 seconds
    'successes': ['rate>0.95'],         // >95% success rate
  },
};

// LIVE WEBSITE
const BASE_URL = 'https://3mpwrapp.github.io';

// KEY PAGES ONLY (excluding community/resources/wellness - those are on the app)
const endpoints = [
  { url: '/', weight: 35, name: 'Homepage' },
  { url: '/features', weight: 20, name: 'Features' },
  { url: '/user-guide', weight: 20, name: 'User Guide' },
  { url: '/blog', weight: 15, name: 'Blog' },
  { url: '/contact', weight: 5, name: 'Contact' },
  { url: '/search?q=features', weight: 3, name: 'Search' },
  { url: '/accessibility', weight: 2, name: 'Accessibility' },
];

// Weighted endpoint selection
let cumulativeWeights = [];
let cumsum = 0;
for (let endpoint of endpoints) {
  cumsum += endpoint.weight;
  cumulativeWeights.push(cumsum);
}
const totalWeight = cumsum;

function getRandomEndpoint() {
  const rand = Math.random() * totalWeight;
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (rand < cumulativeWeights[i]) {
      return endpoints[i];
    }
  }
  return endpoints[0];
}

export default function (data) {
  const endpoint = getRandomEndpoint();
  const url = BASE_URL + endpoint.url;
  const startTime = new Date();

  group(`${endpoint.name} (${url})`, function () {
    const res = http.get(url, {
      headers: {
        'User-Agent': 'k6-stress-test/2.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      tags: { name: endpoint.name },
    });

    // Record metrics
    const isSuccess = res.status === 200;
    successRate.add(isSuccess);
    errorRate.add(!isSuccess);
    duration.add(res.timings.duration);

    if (!isSuccess) {
      httpErrors.add(1);
    }

    // Detailed assertions
    const checkResult = check(res, {
      'status is 200': (r) => r.status === 200,
      'status not 5xx': (r) => r.status < 500,
      'page load < 2s': (r) => r.timings.duration < 2000,
      'page load < 5s': (r) => r.timings.duration < 5000,
      'has content': (r) => r.body.length > 100,
      'not rate limited (429)': (r) => r.status !== 429,
      'not timeout': (r) => r.status !== 504,
    });

    // Log critical failures
    if (res.status >= 500 || res.status === 429) {
      console.error(`⚠️ CRITICAL FAILURE: ${endpoint.name} - Status: ${res.status}, Duration: ${res.timings.duration}ms`);
    } else if (!checkResult || res.timings.duration > 3000) {
      console.warn(`⚠️ SLOW RESPONSE: ${endpoint.name} - Status: ${res.status}, Duration: ${res.timings.duration}ms`);
    }
  });

  // Think time (realistic user behavior)
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}

// Summary and results export
export function handleSummary(data) {
  const timestamp = new Date().toISOString().split('T')[0];
  
  return {
    'stdout': generateReport(data),
    [`stress-test-results-${timestamp}.json`]: JSON.stringify(data, null, 2),
  };
}

function generateReport(data) {
  const metrics = data.metrics;
  const httpReqs = metrics.http_reqs?.value || 0;
  const errors = metrics.errors?.value || 0;
  const errorPct = httpReqs > 0 ? ((errors / httpReqs) * 100).toFixed(2) : 0;
  
  let report = `
╔════════════════════════════════════════════════════════════════╗
║          3MPOWR WEBSITE - LIVE STRESS TEST RESULTS             ║
╚════════════════════════════════════════════════════════════════╝

📊 REQUEST STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Requests:        ${httpReqs}
  Total Errors:          ${errors}
  Error Rate:            ${errorPct}%
  Success Rate:          ${(100 - errorPct).toFixed(2)}%

⏱️  RESPONSE TIME METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  if (metrics.request_duration) {
    const dur = metrics.request_duration.stats;
    report += `
  Min:                   ${dur.min?.toFixed(2) || 'N/A'} ms
  Max:                   ${dur.max?.toFixed(2) || 'N/A'} ms
  Average:               ${dur.avg?.toFixed(2) || 'N/A'} ms
  P50 (Median):          ${dur.p(50)?.toFixed(2) || 'N/A'} ms
  P90:                   ${dur.p(90)?.toFixed(2) || 'N/A'} ms
  P95:                   ${dur.p(95)?.toFixed(2) || 'N/A'} ms
  P99:                   ${dur.p(99)?.toFixed(2) || 'N/A'} ms`;
  }

  // Determine pass/fail
  const errorPass = errorRate.value < 0.05;
  const durationPass = metrics.request_duration?.stats?.p(95) < 5000;
  const successPass = successRate.value > 0.95;
  
  const allPass = errorPass && durationPass && successPass;
  const status = allPass ? '✅ PASS' : '❌ FAIL';

  report += `

✓ THRESHOLD ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Error Rate < 5%:       ${errorPass ? '✅ PASS' : '❌ FAIL'} (${(errorRate.value * 100).toFixed(2)}%)
  P95 Latency < 5s:      ${durationPass ? '✅ PASS' : '❌ FAIL'} (${(metrics.request_duration?.stats?.p(95) || 0).toFixed(2)} ms)
  Success Rate > 95%:    ${successPass ? '✅ PASS' : '❌ FAIL'} (${(successRate.value * 100).toFixed(2)}%)

📈 OVERALL RESULT: ${status}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Results saved to: stress-test-results-${new Date().toISOString().split('T')[0]}.json
`;

  return report;
}
