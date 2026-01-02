# AGENT DEPLOYMENT GUIDE

**Status**: Ready to deploy  
**Date**: January 2, 2026  
**Automation Level**: 100% (Zero human intervention after deployment)

---

## 🚀 QUICK START (5 MINUTES)

### Prerequisites
```bash
# Node.js >= 18
node --version

# Required environment variables
export ANTHROPIC_API_KEY="sk-ant-..."  # Get from https://console.anthropic.com
```

### Deploy All Agents (One Command)
```bash
# Install dependencies
npm install

# Deploy all 4 agents
npm run deploy:agents
```

**Done!** All agents now running 24/7 with zero human involvement.

---

## 📦 WHAT GETS INSTALLED

```
npm install
├─ rss-parser (feed parsing)
├─ @anthropic-ai/sdk (Claude AI for content generation)
├─ luxon (scheduling & time)
└─ dotenv (environment variables)
```

**Total Size**: ~200 MB  
**Installation Time**: ~2-3 minutes

---

## 🔧 DETAILED SETUP

### 1. Prerequisites Check
```bash
# Verify Node.js
node --version   # Must be 18.0.0 or higher
npm --version    # Must be 9.0.0 or higher

# Clone if needed
cd 3mpwrapp.github.io-main
```

### 2. Install Dependencies
```bash
npm install
```

This installs:
- RSS feed parser for Curation Agent
- Anthropic SDK for Blog Post Agent
- Scheduling tools for all agents
- Utilities for email & recap agents

### 3. Set Environment Variables
```bash
# Option 1: Set directly
export ANTHROPIC_API_KEY="sk-ant-..."

# Option 2: Create .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# Option 3: Set in shell profile
# Add to ~/.bashrc or ~/.zshrc:
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Get API Key**: https://console.anthropic.com/keys

### 4. Deploy Agents
```bash
# Deploy all 4 agents
npm run deploy:agents

# OR deploy individually
npm run deploy:curation    # Just curation
npm run deploy:blog       # Just blog
```

---

## ⏰ AFTER DEPLOYMENT

### What's Running
```
✅ Curation Agent
   └─ Monitors 26 RSS feeds
   └─ Real-time scoring (updates hourly)
   └─ Breaking news detection (immediate)
   └─ Daily curation published (9 AM UTC)

✅ Blog Post Agent
   └─ Feature spotlights (2/day)
   └─ Educational guides (1/day)
   └─ Case studies (rotating)
   └─ Policy analysis (triggered)

✅ Recap Agent
   └─ Monday 8 AM: "What's Coming"
   └─ Wednesday 10 AM: "Mid-Week Check-In"
   └─ Friday 5 PM: "Week's Winners"
   └─ Sunday 6 PM: "Deep Reflection"

✅ Email Agent
   └─ Monday: Accessibility segment
   └─ Wednesday: Benefits segment
   └─ Thursday: Workers segment
   └─ Friday: Community segment
```

### Content Being Generated

**Per Day**:
- 3-5 blog posts (fully written, 2,000-2,500 words each)
- 50 articles curated and ranked
- Breaking news alerts (immediate if detected)

**Per Week**:
- 21 blog posts (50,000+ words)
- 350 curated articles
- 4 weekly recaps (different formats)
- 4 personalized emails (completely different content per segment)

---

## 📊 MONITORING

### View Live Logs
```bash
# All agent logs
npm run logs

# Or manually
tail -f logs/agents/*
```

### Status Report
```bash
npm run status
```

### Check Specific Agent
```bash
# Check logs directory
ls -la logs/agents/

# View deployment log
cat logs/agents/deployment.json

# View breaking news log
cat logs/agents/curation-agent-*.json
```

### Expected Log Output
```
✅ Curation Agent initialized successfully
   - Monitoring 26 RSS feeds
   - TIER 1 (every 2h): 3 feeds
   - TIER 2 (every 4h): 8 feeds
   - TIER 3 (daily): 15 feeds
   - 6-tier scoring algorithm active

✅ Blog Post Agent initialized successfully
   - Feature spotlight rotation: 8 features
   - Educational topics: 7 topics
   - Content schedule:
     * 8:00 AM: Feature spotlight
     * 10:00 AM: Educational guide
     * 4:00 PM: Feature spotlight or case study

[2026-01-02T09:15:00Z] Checking TIER 1 feeds...
   ✓ TIER 1 complete: 42 articles processed (0 errors) [5.2s]

[2026-01-02T08:00:00Z] Generating feature spotlight: "Evidence Locker"
   ✅ Feature spotlight published: "Evidence Locker"
   ✓ Saved to: _posts/2026-01-02-evidence-locker-guide.md
```

---

## 🛑 STOPPING AGENTS

### Stop All Agents
```bash
# Press Ctrl+C in the terminal where agents are running
# OR kill the process

# Find process
ps aux | grep agent-orchestrator

# Kill it
kill <PID>

# Or more forcefully
pkill -f agent-orchestrator
```

### Restart Agents
```bash
npm run deploy:agents
```

---

## 🐛 TROUBLESHOOTING

### Issue: "ANTHROPIC_API_KEY not found"
**Solution**:
```bash
# Check if set
echo $ANTHROPIC_API_KEY

# If empty, set it
export ANTHROPIC_API_KEY="sk-ant-..."

# Verify
echo $ANTHROPIC_API_KEY
```

### Issue: "Cannot find module 'rss-parser'"
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Error parsing RSS feed"
**This is normal**. Some feeds occasionally timeout or change format.
- Agents handle this gracefully
- Continue processing other feeds
- Check logs for details

### Issue: "AI content generation slow"
**This is normal on first run**. Claude API takes 5-10 seconds per post.
- First post: ~15 seconds
- Subsequent posts: ~10 seconds
- Check logs to see progress

### Issue: Agents stop after a few posts
**Check for errors**:
```bash
# Look for error messages in logs
tail -f logs/agents/

# Check API key is still valid
# Check API rate limits (Claude has limits)
```

---

## 🔄 CONTINUOUS OPERATION

### Running in Background (Linux/Mac)
```bash
# Run in background with nohup
nohup npm run deploy:agents > agent-output.log 2>&1 &

# Check it's running
ps aux | grep agent-orchestrator

# View output
tail -f agent-output.log
```

### Running in Background (Windows PowerShell)
```powershell
# Run in background
Start-Process node -ArgumentList "scripts/agent-orchestrator.js deploy" -WindowStyle Hidden

# Check running
Get-Process node

# Stop
Stop-Process -Name node
```

### Using PM2 (Recommended for Production)
```bash
# Install PM2
npm install -g pm2

# Start agents with PM2
pm2 start scripts/agent-orchestrator.js --name "content-agents"

# Monitor
pm2 monit

# View logs
pm2 logs

# Stop
pm2 stop content-agents

# Restart
pm2 restart content-agents

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## 📈 EXPECTED RESULTS (First 24 Hours)

### Hour 0-2
- Curation Agent starts monitoring feeds
- First articles scored and cached
- Status: Processing feeds

### Hour 2-8
- First blog post generated (8 AM)
- First educational guide generated (10 AM)
- Daily curation published (9 AM)
- Status: Content flowing

### Hour 8-24
- Multiple blog posts generated
- Real-time scoring updates happening
- Breaking news detected (if any)
- Recap agents scheduled for their times
- Status: Full operation

### First Week
- 21 blog posts published
- 350 articles curated and ranked
- 4 weekly recaps scheduled
- 4 personalized emails scheduled
- Algorithm learning from community feedback (if voting enabled)

---

## ✅ DEPLOYMENT CHECKLIST

**Before Starting**:
- [ ] Node.js >= 18 installed
- [ ] npm >= 9 installed
- [ ] Anthropic API key obtained
- [ ] Environment variable set (ANTHROPIC_API_KEY)
- [ ] Clone/cd to repository directory

**Deployment**:
- [ ] Run `npm install`
- [ ] Run `npm run deploy:agents`
- [ ] See success message
- [ ] Check logs appear

**Post-Deployment**:
- [ ] Monitor logs for 1 hour
- [ ] First blog post appears in _posts/
- [ ] First curation appears in _curation/
- [ ] No errors in logs
- [ ] Status reports show activity

**Ongoing**:
- [ ] Review generated content daily
- [ ] Check logs weekly for errors
- [ ] Adjust agent prompts if needed
- [ ] Monitor API usage (costs ~$10-50/month)
- [ ] Keep ANTHROPIC_API_KEY secure

---

## 💰 COST ESTIMATE

**API Costs** (Anthropic Claude):
- Feature spotlight (2,500 words): ~$0.05-0.10
- Educational guide (2,500 words): ~$0.05-0.10
- Case study (2,000 words): ~$0.04-0.08
- Daily: ~$0.20-0.40
- Monthly: ~$6-12

**Total Monthly Cost**:
- Anthropic API: ~$6-12
- Hosting: $0 (GitHub Pages)
- Email service: ~$20-100 (if using MailChimp/SendGrid)
- **Total: ~$26-112/month for full automation**

Much cheaper than hiring writers!

---

## 🎯 NEXT STEPS

### Immediate (Day 1)
1. Deploy agents
2. Monitor first 24 hours
3. Review generated content quality
4. Check no errors in logs

### Short Term (Week 1)
1. Adjust agent prompts if needed
2. Set up community voting tracking
3. Configure email service integration
4. Create database tables for engagement tracking

### Medium Term (Month 1)
1. Enable community feedback loop
2. Optimize algorithm based on feedback
3. Add more features/topics to rotation
4. Train team on management

### Long Term
1. Expand to other content types
2. Add language support
3. Integrate with additional platforms
4. Measure ROI and impact

---

## 📚 DOCUMENTATION

**See also**:
- [AUTONOMOUS-AGENTS-CONTENT-SYSTEM.md](../AUTONOMOUS-AGENTS-CONTENT-SYSTEM.md) — Full technical specs
- [AUTONOMOUS-AGENTS-QUICK-START.md](../AUTONOMOUS-AGENTS-QUICK-START.md) — Quick reference
- [BLOG-CURATION-RECAPS-EXPANSION.md](../BLOG-CURATION-RECAPS-EXPANSION.md) — Detailed expansion

---

## 🆘 SUPPORT

**Issues?**
1. Check troubleshooting section above
2. Review logs: `tail -f logs/agents/`
3. Check API key is valid
4. Verify Node.js version
5. Try reinstalling: `npm install`

**Still stuck?**
- Read agent implementation code: `scripts/agent-*.js`
- Check Anthropic SDK docs: https://docs.anthropic.com
- Review deployment logs carefully

---

## 🎉 YOU'RE DONE!

Your autonomous content system is now running 24/7 with:
- ✅ Real-time RSS feed monitoring
- ✅ AI-generated blog posts (3-5/day)
- ✅ Weekly recaps (4 different formats)
- ✅ Personalized emails (4 segments)
- ✅ Self-improving algorithm (learns from feedback)
- ✅ Zero human writers needed

**Total setup time**: ~10 minutes  
**Content generated per week**: 50,000+ words  
**Monthly cost**: ~$26-112  
**ROI**: Enormous (months of writing → automated daily)

Happy automating! 🚀

