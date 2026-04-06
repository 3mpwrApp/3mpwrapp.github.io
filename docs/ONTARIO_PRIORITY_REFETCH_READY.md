# Ontario Priority Refetch System - READY ✅

## What's Set Up

### ✅ Completed Right Now
1. **Local extraction** of all 4,532 Ontario cases (NO API CALLS)
   - Found **228 cases with outcomes** (5%)
   - Found **149 cases ready for templates** (Allowed + quality ≥60)
   - Identified **4,304 unknown outcome cases** that need full-text extraction

2. **Priority queue created** (`data/.refetch-priority-queue.json`)
   - 🔴 **404 High Priority** - Unknown + medical evidence (most valuable)
   - 🟡 **3,900 Medium Priority** - Unknown outcome
   - 🟢 **228 Low Priority** - Has outcome but low quality
   - All flagged and ready to refetch

3. **Smart refetch system built**
   - Processes high priority first (Unknown + medical evidence)
   - Resumable - picks up where it left off
   - Random 0.8-1.5s delays (quota-friendly)
   - Saves progress every 10 cases
   - Stops gracefully on quota exceeded

## Quick Start Guide

### Option 1: Manual Daily Refetch (After 8 PM ET)

```powershell
# Run this AFTER 8 PM ET (when quota resets)
node scripts/launch-daily-refetch.js
```

This will:
- Load API key from `.env.local`
- Process up to 500 high-priority cases
- Save enhanced data to `ontario-refetched-YYYYMMDD.json`
- Update priority queue progress
- Stop gracefully if quota exhausted

### Option 2: Check Progress Anytime

```powershell
# See how many cases left to process
Get-Content data\.refetch-priority-queue.json | ConvertFrom-Json | 
  Select-Object -ExpandProperty progress
```

### Option 3: Resume After Quota Reset

The system is **fully resumable**. Just run the launcher again:

```powershell
node scripts/launch-daily-refetch.js
```

It automatically:
- Skips already-processed cases
- Continues from where it left off
- Updates progress file

## Timeline Estimate

**Daily quota**: ~100-500 API calls (estimated)

**Refetch schedule**:
- **Day 1** (Tonight 8 PM): Process ~500 high priority (**404 done**)
- **Day 2-8**: Process ~500 medium priority per day (**3,900 total**)
- **Day 9**: Finish remaining + low priority cases

**Total time**: ~9-10 days to complete all 4,532 cases

## What We Can Do RIGHT NOW (While Waiting)

### 1. Generate Templates from 149 Ready Cases

```powershell
# Create templates from the 149 winning cases we found
node scripts/generate-templates-from-wins.js --min-quality=60
```

This gives us initial templates for Thunder Bay pilot!

### 2. Analyze Patterns from 228 Known Outcomes

```powershell
# Run pattern analysis on the 228 cases with outcomes
node scripts/analyze-patterns.js
```

### 3. Set Up Daily Automation (Windows Task Scheduler)

Create a scheduled task to run daily at 8 PM ET:

```powershell
# Create scheduled task (run as admin)
$action = New-ScheduledTaskAction -Execute "node" -Argument "scripts/launch-daily-refetch.js" -WorkingDirectory "D:\1-EmpowrApp\empowrapp-site\3mpwrapp.github.io-main\3mpwrapp.github.io-main"

$trigger = New-ScheduledTaskTrigger -Daily -At "8:00PM"

Register-ScheduledTask -TaskName "CanLII Daily Refetch" -Action $action -Trigger $trigger -Description "Daily Ontario case refetch (priority queue)"
```

## File Locations

### Input Files
- `data/tribunal-decisions/ontario-local-enhanced-20260406.json` - Source data (4,532 cases)
- `data/.refetch-priority-queue.json` - Priority queue with progress

### Output Files
- `data/tribunal-decisions/ontario-refetched-YYYYMMDD.json` - Enhanced data (updated daily)
- `data/.scraper-cache/*.json` - Cached HTML (30-day retention)
- `data/.refetch-errors.jsonl` - Error log

### Scripts
- `scripts/launch-daily-refetch.js` - **Main launcher** (run this)
- `scripts/refetch-ontario-priority.js` - Priority refetch engine
- `scripts/create-refetch-priority-queue.js` - Queue generator
- `scripts/extract-ontario-local.js` - Local extraction (already ran)

## Monitoring Progress

```powershell
# Check queue status
Get-Content data\.refetch-priority-queue.json | ConvertFrom-Json | ForEach-Object {
  Write-Host "High: $($_.progress.high_completed)/$($_.high_priority.Count)"
  Write-Host "Medium: $($_.progress.medium_completed)/$($_.medium_priority.Count)"
  Write-Host "Low: $($_.progress.low_completed)/$($_.low_priority.Count)"
  $total = $_.progress.high_completed + $_.progress.medium_completed + $_.progress.low_completed
  $all = $_.high_priority.Count + $_.medium_priority.Count + $_.low_priority.Count
  Write-Host "Total: $total/$all ($(
[Math]::Round($total/$all*100, 1))%)"
}

# Check cache size
(Get-ChildItem data\.scraper-cache).Count

# Check errors
Get-Content data\.refetch-errors.jsonl -Tail 10

# Watch refetch in real-time (if running)
Get-Content data\.refetch-priority-queue.json -Wait
```

## What Happens When All Done?

After all 4,532 cases refetched (9-10 days):

1. **Run final pattern analysis**
   ```powershell
   node scripts/analyze-patterns.js
   ```
   Expected: <5% Unknown (vs current 95%)

2. **Generate comprehensive templates**
   ```powershell
   node scripts/generate-templates-from-wins.js --city="Thunder Bay"
   ```
   Expected: 1,000+ template-ready cases

3. **Launch Thunder Bay Pilot**
   Ready for TBDIWSG with complete Ontario data

## Recommended Action RIGHT NOW

**Start with what we have!** Run template generation on the 149 ready cases:

```powershell
# Generate initial templates (no API calls, instant)
node scripts/generate-templates-from-wins.js --min-quality=60 --outcome=Allowed
```

Then set up daily refetch to expand the dataset automatically.

---

**Status**: ✅ All 4,304 unknown cases flagged and queued for priority refetch  
**Next Run**: Tonight 8 PM ET or tomorrow 8 PM ET  
**Automation**: Optional (Windows Task Scheduler)
