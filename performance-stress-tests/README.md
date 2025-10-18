# Load Testing with k6 & Artillery

This directory contains load testing scripts for the 3mpowr App website.

## Quick Start

### Using k6 (Recommended)

**Install:**
```bash
# Windows
choco install k6

# macOS
brew install k6

# Linux
sudo apt-get install k6
```

**Run baseline test:**
```bash
k6 run --vus 10 --duration 5m load-test.js
```

**Run cloud test (k6 Cloud):**
```bash
# First, sign up at https://app.k6.io
# Then authenticate:
k6 login cloud

# Run test
k6 run --cloud load-test.js
```

**Common Options:**
- `--vus NUM` – Virtual users
- `--duration TIME` – Test duration (e.g., "5m", "300s")
- `--stages` – Define load phases (see load-test.js)
- `--rps NUM` – Max requests per second
- `--out FILE` – Output format (json, csv, influxdb)

**Examples:**
```bash
# Baseline: 10 VUs for 2 minutes
k6 run --vus 10 --duration 2m load-test.js

# Sustained: 100 VUs for 10 minutes
k6 run --vus 100 --duration 10m load-test.js

# Spike: 500 VUs for 2 minutes
k6 run --vus 500 --duration 2m load-test.js

# Stress: Gradually increase until failure
k6 run load-test.js

# Against staging (different URL)
BASE_URL=https://staging.example.com k6 run load-test.js
```

### Using Artillery

**Install:**
```bash
npm install -g artillery
```

**Run test:**
```bash
artillery run load-test.yml
```

## Test Scenarios

### Scenario 1: Baseline Load
- 10 VUs, 5 minutes
- Measures normal page response times
- Establishes baseline metrics

**Command:**
```bash
k6 run --vus 10 --duration 5m load-test.js
```

**Expected Metrics:**
- Response time p50 < 1.0s
- Response time p95 < 2.0s
- Error rate < 0.1%

---

### Scenario 2: Sustained Load
- 100 VUs constant, 10 minutes
- Tests sustained traffic (typical production load)

**Command:**
```bash
k6 run --vus 100 --duration 10m load-test.js
```

**Expected Metrics:**
- Response time p50 < 1.0s
- Response time p95 < 2.0s
- Error rate < 1%
- No memory leaks

---

### Scenario 3: Peak Load
- Spike to 500 VUs, 5 minutes
- Tests peak traffic handling (holiday traffic, viral moment)

**Command:**
```bash
k6 run --vus 500 --duration 5m load-test.js
```

**Expected Metrics:**
- Response time p50 < 1.5s
- Response time p95 < 3.0s
- Error rate < 1%
- Graceful degradation (no complete outages)

---

### Scenario 4: Stress Test
- Gradually increase until breaking point
- Tests system limits and recovery

**Command:**
```bash
k6 run load-test.js  # Uses built-in stages
```

**Expected Results:**
- System remains stable up to ~500 VUs
- Error rate increases but recovers when load decreases
- Document breaking point (max VUs before >5% errors)

---

## Interpreting Results

### Key Metrics

| **Metric** | **Good** | **Acceptable** | **Poor** |
|---|---|---|---|
| **Response Time (p50)** | <500ms | <1000ms | >1000ms |
| **Response Time (p95)** | <1000ms | <2000ms | >2000ms |
| **Response Time (p99)** | <2000ms | <3000ms | >3000ms |
| **Error Rate** | <0.1% | <1% | >1% |
| **Throughput (RPS)** | Stable | Slightly variable | Highly variable |
| **VU Success Rate** | >99.9% | >99% | <99% |

### Common Issues

**High Latency (Response Time > 3s):**
- Check CDN caching
- Verify database queries not slow
- Check for blocking operations
- Consider adding more servers

**High Error Rate (>1%):**
- Check server logs for errors
- Verify database connections
- Check memory/CPU usage
- Identify resource limits hit

**Unstable Metrics:**
- Network jitter
- Other load on shared servers
- Time-of-day variations
- External service dependencies

---

## Advanced Usage

### Custom Test Scenarios

Edit `load-test.js` to add:
- Different endpoints
- Different user behaviors
- Authentication flows
- File uploads
- Complex transactions

### Distributed Testing

For testing from multiple locations:

```bash
# Run from k6 Cloud (automatically distributed)
k6 run --cloud load-test.js
```

### Integration with CI/CD

See `.github/workflows/performance-test.yml` for GitHub Actions integration.

### Comparing Results

```bash
# Save baseline
k6 run --out json=baseline.json load-test.js

# Run new test
k6 run --out json=current.json load-test.js

# Compare with jq (JSON processor)
jq '.metrics.request_duration' baseline.json
jq '.metrics.request_duration' current.json
```

---

## Troubleshooting

### "Too many open files" Error
**Cause:** System limit on file descriptors  
**Fix:**
```bash
# Increase limit (macOS/Linux)
ulimit -n 10000

# Windows: Reboot may be needed
```

### "Connection refused"
**Cause:** Target server not running or URL incorrect  
**Fix:**
```bash
# Verify URL
curl https://3mpwrapp.github.io

# Update BASE_URL if needed
BASE_URL=https://staging.example.com k6 run load-test.js
```

### Memory Issues
**Cause:** Too many VUs for available memory  
**Fix:**
- Reduce VU count
- Increase sleep time between requests
- Use summaries instead of individual timestamps
- Run on larger machine

---

## Resources

- **k6 Documentation:** https://k6.io/docs/
- **k6 Best Practices:** https://k6.io/docs/testing-guides/load-testing-best-practices/
- **Artillery Documentation:** https://artillery.io/docs
- **Load Testing Guide:** https://www.google.com/search?q=web+load+testing+guide

