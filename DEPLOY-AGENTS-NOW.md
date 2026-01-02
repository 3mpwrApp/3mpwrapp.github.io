# ⚡ DEPLOY AGENTS NOW

## ONE-MINUTE DEPLOYMENT

### Copy & Paste These Commands

```bash
# Step 1: Navigate to project
cd /path/to/3mpwrapp.github.io-main

# Step 2: Install dependencies (first time only)
npm install

# Step 3: Set API key (replace with your actual key)
export ANTHROPIC_API_KEY="sk-ant-..."

# Step 4: Deploy agents (starts all 4 agents)
npm run deploy
```

**Done!** All agents running. Press Ctrl+C to stop.

---

## GET YOUR API KEY

1. Go to: https://console.anthropic.com
2. Sign in or create account
3. Click "API Keys" in left menu
4. Click "Create Key"
5. Copy the key starting with `sk-ant-`
6. Paste into the export command above

---

## AFTER DEPLOYMENT

### Watch Logs Live
```bash
npm run logs
```

### Check Status
```bash
npm run status
```

### Stop Agents
```bash
# Press Ctrl+C in the terminal
# Or kill the process
pkill -f agent-orchestrator
```

### Restart
```bash
npm run deploy
```

---

## WHAT'S RUNNING

✅ **Curation Agent**
- Monitors 26 RSS feeds 24/7
- Scores articles (6-tier algorithm)
- Publishes 50 curated articles daily at 9 AM UTC
- Detects breaking news instantly

✅ **Blog Post Agent**
- Generates posts 3-5 times per day
- Uses Claude AI for writing
- Publishes to `_posts/` directory
- Schedule: 8 AM, 10 AM, 4 PM UTC

✅ **Recap Agent** (framework ready)
- Will generate 4 weekly recaps
- Different format each day

✅ **Email Agent** (framework ready)
- Will send 4 personalized emails/week
- One per segment

---

## EXPECTED OUTPUT

After running `npm run deploy`, you should see:

```
============================================================
AUTONOMOUS AGENT DEPLOYMENT VERIFICATION
============================================================

[2026-01-02T14:23:15Z] ℹ️  Starting verification...
[2026-01-02T14:23:15Z] ✅ Node.js version check passed: v18.19.0
[2026-01-02T14:23:15Z] ✅ ANTHROPIC_API_KEY found (sk-ant-...)
[2026-01-02T14:23:15Z] ✅ Dependency found: @anthropic-ai/sdk
[2026-01-02T14:23:15Z] ✅ Dependency found: rss-parser
[2026-01-02T14:23:15Z] ✅ Agent file found: scripts/agent-orchestrator.js
[2026-01-02T14:23:16Z] ✅ Config file found: _data/curator.json

============================================================
VERIFICATION SUMMARY
============================================================

[2026-01-02T14:23:16Z] ✅ Successful checks: 7
[2026-01-02T14:23:16Z] ✅ All verifications passed! Ready to deploy.

Starting agents in 3 seconds...
Press Ctrl+C to stop agents.

[2026-01-02T14:23:19Z] ℹ️  Launching agent orchestrator...
[2026-01-02T14:23:19Z] ✅ Curation Agent initialized successfully
[2026-01-02T14:23:19Z] ✅ Blog Post Agent initialized successfully
[2026-01-02T14:23:20Z] ✅ Monitoring started...
[2026-01-02T14:23:20Z] ✅ Content generation schedule active...

[2026-01-02T14:23:30Z] ✅ System status: 
   - Curation Agent: monitoring (0 articles processed)
   - Blog Agent: ready
   - Uptime: 10s
```

---

## TROUBLESHOOTING

### Issue: "command not found: npm"
```bash
# Install Node.js from nodejs.org
# Then try again
npm run deploy
```

### Issue: "ANTHROPIC_API_KEY not found"
```bash
# Verify you set it:
echo $ANTHROPIC_API_KEY

# If empty:
export ANTHROPIC_API_KEY="sk-ant-XXXXX"

# Then retry:
npm run deploy
```

### Issue: "Cannot find module 'rss-parser'"
```bash
# Reinstall dependencies
npm install

# Then retry:
npm run deploy
```

### Issue: Agents don't start
```bash
# Check the logs
npm run logs

# Or check deployment log
cat logs/agents/deployment.json

# Verify API key works
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01"
```

---

## NEXT: COMMIT & PUSH TO GITHUB

After agents are working, commit the deployment files:

```bash
# Add all new files
git add deploy.js AGENT-DEPLOYMENT-GUIDE.md AUTONOMOUS-AGENTS-DEPLOYMENT-STATUS.md

# Commit
git commit -m "Deploy: Add agent deployment scripts and documentation"

# Push to GitHub
git push origin main
```

---

## 📊 WHAT YOU'LL GET

**In the First Hour**:
- Agents initialized and running
- Feeds being monitored
- Logs showing activity

**In the First Day**:
- 3-5 blog posts published
- 50 articles curated
- Daily curation page updated
- Logs showing all activity

**In the First Week**:
- 21 blog posts (50,000+ words)
- 350 curated articles
- Real-time breaking news alerts
- Self-improving algorithm starting to learn

---

## 💡 TIPS

### Running in Background (Don't Close Terminal)

**Option 1: Use `nohup` (Mac/Linux)**
```bash
nohup npm run deploy > agent-output.log 2>&1 &
```

**Option 2: Use PM2 (Recommended)**
```bash
# Install once
npm install -g pm2

# Start agents
pm2 start scripts/agent-orchestrator.js --name "content-agents"

# Monitor
pm2 monit

# View logs
pm2 logs
```

**Option 3: Use Screen (Mac/Linux)**
```bash
screen -S agents
npm run deploy
# Ctrl+A then Ctrl+D to detach
# screen -r agents to reattach
```

### Cost Tracking
```bash
# Monitor API usage at https://console.anthropic.com/usage
# Expected cost: ~$10-50/month

# To calculate:
# ~5 posts/day × $0.10/post = ~$1.50/day = ~$45/month
```

---

## ✅ SUCCESS INDICATORS

Your agents are working if you see:

✅ No errors in logs  
✅ `npm run status` shows agents running  
✅ New files appear in `_posts/` directory  
✅ New files appear in `_curation/` directory  
✅ Status reports every 30 minutes  
✅ Console shows article processing  
✅ Console shows content generation  

---

## 🎯 FINAL CHECKLIST

Before running deployment, verify:

- [ ] `cd` into project directory
- [ ] Node.js 18+ installed
- [ ] `npm install` completed successfully
- [ ] ANTHROPIC_API_KEY exported
- [ ] All scripts/agent-*.js files exist
- [ ] _data/curator.json exists
- [ ] Network connection active

---

## 🚀 READY?

Run this command:

```bash
npm run deploy
```

That's it. Your autonomous content system is live.

---

**Duration**: ~10 minutes to first content  
**Result**: 24/7 automated content generation  
**Effort**: Single command  
**Cost**: ~$30-100/month  
**Output**: 50,000+ words/week  

**Go!** 🚀

