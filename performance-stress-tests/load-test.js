// k6 Load Testing Script for 3mpowr App Website
// Usage: k6 run --vus 100 --duration 10m load-test.js
// Docs: https://k6.io/docs/

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const duration = new Trend('request_duration');
const successRate = new Rate('successes');

// Test configuration
export const options = {
  stages: [
    // Phase 1: Baseline (ramp up)
    { duration: '1m', target: 10 },
    
    // Phase 2: Normal load (sustained)
    { duration: '5m', target: 100 },
    
    // Phase 3: Peak load (spike)
    { duration: '2m', target: 500 },
    
    // Phase 4: Cool down
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    // Fail test if error rate > 1%
    'errors': ['rate<0.01'],
    // Fail test if p95 latency > 3s
    'request_duration': ['p(95)<3000'],
    // Fail test if success rate < 99%
    'successes': ['rate>0.99'],
  },
  ext: {
    loadimpact: {
      projectID: 3350811, // Replace with your k6 project ID
      name: '3mpowr App Load Test'
    }
  }
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'https://3mpwrapp.github.io';

// List of endpoints to test (weighted by usage)
const endpoints = [
  { url: '/', weight: 40, name: 'Homepage' },
  { url: '/features', weight: 15, name: 'Features' },
  { url: '/user-guide', weight: 15, name: 'User Guide' },
  { url: '/blog', weight: 10, name: 'Blog' },
  { url: '/resources', weight: 10, name: 'Resources' },
  { url: '/contact', weight: 5, name: 'Contact' },
  { url: '/search?q=test', weight: 3, name: 'Search' },
  { url: '/accessibility', weight: 2, name: 'Accessibility' },
];

// Calculate cumulative weights for weighted selection
let cumulativeWeights = [];
let cumsum = 0;
for (let endpoint of endpoints) {
  cumsum += endpoint.weight;
  cumulativeWeights.push(cumsum);
}
const totalWeight = cumsum;

// Select random endpoint based on weights
function getRandomEndpoint() {
  const rand = Math.random() * totalWeight;
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (rand < cumulativeWeights[i]) {
      return endpoints[i];
    }
  }
  return endpoints[0]; // Fallback
}

export default function (data) {
  const endpoint = getRandomEndpoint();
  const url = BASE_URL + endpoint.url;

  group(endpoint.name, function () {
    const res = http.get(url, {
      headers: {
        'User-Agent': 'k6-load-test/1.0',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    // Record metrics
    const isSuccess = res.status === 200;
    successRate.add(isSuccess);
    errorRate.add(!isSuccess);
    duration.add(res.timings.duration);

    // Assertions
    check(res, {
      'status is 200': (r) => r.status === 200,
      'page load time < 2s': (r) => r.timings.duration < 2000,
      'has content': (r) => r.body.length > 100,
      'not rate-limited': (r) => r.status !== 429,
      'not server error': (r) => r.status < 500,
    });

    // Log failures
    if (res.status !== 200) {
      console.log(`FAILED: ${url} - Status: ${res.status}`);
    }
  });

  // Think time (user reading/browsing)
  sleep(Math.random() * 2 + 1); // Sleep 1-3 seconds
}

// Summary function
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

// Helper function for text summary
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options;
  let summary = '';
  
  // HTTP metrics
  if (data.metrics.http_reqs) {
    summary += `\n${indent}Total Requests: ${data.metrics.http_reqs.value}\n`;
  }
  
  // Error rate
  if (data.metrics.errors) {
    const errorRate = (data.metrics.errors.value / data.metrics.http_reqs.value * 100).toFixed(2);
    summary += `${indent}Error Rate: ${errorRate}%\n`;
  }
  
  // Duration metrics
  if (data.metrics.request_duration) {
    summary += `${indent}Request Duration:\n`;
    summary += `${indent}  Min: ${data.metrics.request_duration.stats.min.toFixed(2)}ms\n`;
    summary += `${indent}  Max: ${data.metrics.request_duration.stats.max.toFixed(2)}ms\n`;
    summary += `${indent}  Avg: ${data.metrics.request_duration.stats.avg.toFixed(2)}ms\n`;
    summary += `${indent}  P50: ${data.metrics.request_duration.stats.p(50).toFixed(2)}ms\n`;
    summary += `${indent}  P95: ${data.metrics.request_duration.stats.p(95).toFixed(2)}ms\n`;
    summary += `${indent}  P99: ${data.metrics.request_duration.stats.p(99).toFixed(2)}ms\n`;
  }
  
  return summary;
}
