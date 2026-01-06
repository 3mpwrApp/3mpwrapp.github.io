---
layout: page
title: Agent Integration Bridge - Campaign System
description: How the 4 autonomous agents integrate with the new campaign system
---

# 🌉 AGENT INTEGRATION BRIDGE

**Date:** January 6, 2026  
**Status:** Integration Ready  
**Scope:** 4 Autonomous Agents + Campaign System

---

## PART 1: CLARIFICATION - CURATION NEWS ON BLOG

### Current Structure ✅
The blog page already has a **designated area for Daily News Highlights**:

**Location:** `blog/index.md` - Section: "📰 Daily News Highlights"

**What It Shows:**
```
Posts tagged with: 'highlights'
Display: Latest 7 curated posts
Archive: All daily highlights expandable view
Update: Every morning at 9 AM UTC
```

**Current Implementation:**
```liquid
{% assign daily = site.posts | where_exp: 'p', "p.tags contains 'highlights'" %}
{% for post in daily limit:7 %}
  <!-- Display curated post -->
{% endfor %}
```

### Enhanced for Campaign ✅
The **Curation Agent** feeds directly into this section:

```
CURATION AGENT (Monitors 26 RSS feeds)
        ↓
    Scores articles
        ↓
    Generates daily posts (tagged: 'highlights')
        ↓
    Posts published to: /blog/ folder
        ↓
    Blog index.md automatically displays them
    in "📰 Daily News Highlights" section
        ↓
    Also distributed via:
    - RSS feed
    - Mastodon (9 AM UTC)
    - Bluesky (9 AM UTC)
    - Newsletter email
```

**Designated Areas on Blog Page:**
| Section | Agent | Tag | Limit | Update |
|---------|-------|-----|-------|--------|
| 📰 Daily News | Curation | `highlights` | 7 posts | 9 AM UTC |
| ✨ Features | Blog Post | `features, spotlight` | 6 posts | Real-time |
| 📅 Weekly Recap | Recap | `weekly` | 4 posts | Monday |
| 💬 Community | Blog Post | Other | All | Real-time |

---

## PART 2: THE 4 AUTONOMOUS AGENTS (Current Configuration)

### **Agent 1: CURATION AGENT** 🗂️

**Purpose:** Monitor RSS feeds → Score → Publish daily news

**Current Configuration:**
- **RSS Feeds Monitored:** 26+ sources
- **Feed Tiers:**
  - Tier 1 (Breaking news): Check every 2 hours
    - CBC News
    - Global News
    - Ontario.ca announcements
    - Canada.ca benefits
  - Tier 2 (High-signal): Check every 4 hours
    - Inclusion Canada
    - Policy Options
    - Maclean's
    - The Tyee
  - Tier 3 (Regular): Check daily at 9 AM
    - Disability Alliance BC
    - CNIB
    - CACL
    - ARCH
    - CHRC
    - CCDO
    - Provincial news feeds

**Scoring Algorithm:**
- Relevance to disability, accessibility, workers' comp
- Timeliness (newer = higher score)
- Source authority
- Community engagement signals
- Topic diversity
- Breaking news detection

**Output:**
- Daily posts tagged: `highlights`
- Published to: `/blog/` folder
- Displayed on: Blog index "Daily News Highlights" section
- Distributed via: RSS, Mastodon, Bluesky, email

**Status:** ✅ **ACTIVE - Running 24/7**

---

### **Agent 2: BLOG POST AGENT** 📝

**Purpose:** Generate 3-5 blog posts daily (features, education, reactions)

**Current Configuration:**
- **Content Types Generated:**
  - Feature Spotlights (Evidence Locker, Letter Generator, etc.)
  - Educational Deep-Dives (How-to guides)
  - Case Studies (From community stories)
  - Policy Reactions (When changes announced)
  - Topic Deep-Dives (Emerging issues)

**Monitoring:**
- Trending topics (real-time)
- Community questions/needs
- Policy announcements
- Accessibility news
- Success stories from community

**Output:**
- 3-5 posts per day
- Tagged: `features`, `spotlight`, or `blog`
- Published to: `/blog/` folder
- Displayed on: Blog index multiple sections
- Distributed via: RSS, email, social

**Status:** ✅ **ACTIVE - Running 24/7**

---

### **Agent 3: RECAP AGENT** 📊

**Purpose:** Synthesize weekly summaries and trends

**Current Configuration:**
- **Frequency:** 4 times per week (Mon, Wed, Fri, Sun)
- **Analyzes:**
  - Week's top engagement
  - Reader votes/reactions
  - Trending topics
  - Feature usage patterns
  - Community feedback

**Output:**
- 4 different recap formats
- Tagged: `weekly`
- Published to: `/blog/` folder
- Displayed on: Blog index "Weekly Recaps" section
- Distributed via: RSS, email, social

**Status:** ✅ **ACTIVE - Weekly**

---

### **Agent 4: EMAIL AGENT** 📧

**Purpose:** Generate segment-specific newsletters

**Current Configuration:**
- **Segments:**
  - Disability community
  - Injured workers
  - Policy makers / Advocates
  - Builders / Technologists
  - General subscribers

**Personalization:**
- Content tailored to segment
- Relevant feature highlights
- Targeted calls-to-action
- Recommended next steps

**Output:**
- 4 segment-specific emails
- Scheduled: Weekly
- Drawn from: Blog posts, curated news, recaps
- Includes: Feature spotlights, top stories, CTAs

**Status:** ✅ **ACTIVE - Weekly**

---

## PART 3: NEW CAMPAIGN SYSTEM (Integration Points)

### **How Campaign Integrates:**

```
AUTONOMOUS AGENTS (Existing - 24/7)
│
├─ CURATION AGENT → Daily news posts → Blog "Daily News" section
│
├─ BLOG POST AGENT → Feature/education posts → Blog "Feature Spotlights"
│
├─ RECAP AGENT → Weekly summaries → Blog "Weekly Recaps"
│
└─ EMAIL AGENT → Newsletters → Email subscribers
                                    │
                                    ↓
                    CAMPAIGN SYSTEM (New - Enhanced)
                    │
                    ├─ SCHEDULER: Coordinates posts
                    │   └─ Works around agent schedule
                    │
                    ├─ PERFORMANCE TRACKER: Monitors all
                    │   └─ Measures agent + campaign impact
                    │
                    ├─ FEEDBACK LOOP: Listens to responses
                    │   └─ Feeds insights back to agents
                    │
                    └─ INTELLIGENCE ENGINE: Learns & evolves
                        └─ Improves all agent outputs over time
```

---

## PART 4: INTEGRATION MAP (Agent × Campaign)

### **Agent 1: Curation Agent**

| Integration Point | How It Works | Data Flow |
|---|---|---|
| **Scheduling** | Campaign scheduler respects curation timing (9 AM UTC posts don't conflict) | Scheduler reads agent schedule |
| **Performance** | Campaign tracker monitors curation post reach/engagement | Metrics feed to dashboard |
| **Feedback** | Reader responses to curated posts tracked | Sentiment analysis improves scoring |
| **Evolution** | Top-performing news topics identified | Guides future curation weights |
| **Output** | Daily posts automatically tagged & published | Blog displays via existing structure |

**Integration Status:** ✅ **No conflicts - fully compatible**

---

### **Agent 2: Blog Post Agent**

| Integration Point | How It Works | Data Flow |
|---|---|---|
| **Campaign Post** | Blog post "Why Disability Apps Fail" treated as regular blog post | Tagged, indexed, promoted via agent |
| **Scheduling** | Campaign posts don't interfere with agent schedule | Campaign uses 3+ hour spacing |
| **Cross-linking** | Campaign blog links to agent feature posts | Natural internal linking |
| **Feedback** | Campaign feedback informs blog post topics | Agent learns what resonates |
| **Evolution** | Agent improves topics based on campaign learnings | Playbook feeds agent rules |

**Integration Status:** ✅ **Complementary - enhances each other**

---

### **Agent 3: Recap Agent**

| Integration Point | How It Works | Data Flow |
|---|---|---|
| **Feature** | Campaign can be featured in weekly recap | High-engagement content included |
| **Analysis** | Recap analyzes campaign performance | Adds to trend analysis |
| **Timing** | Campaign feedback influences recap focus | Responsive to community |
| **Distribution** | Campaign metrics included in weekly summaries | Email subscribers see results |

**Integration Status:** ✅ **Coordinated - campaign enhances recaps**

---

### **Agent 4: Email Agent**

| Integration Point | How It Works | Data Flow |
|---|---|---|
| **Segment Content** | Campaign post included in relevant email segments | Personalized by audience |
| **Disability Segment** | "Why Apps Fail" = perfect for disability community | Direct relevance |
| **Policymakers** | Campaign positions app as solution for policy | Policy-focused angle |
| **Builders** | Campaign teaches design approach | Relevant to builders |
| **Personalization** | Email agent uses campaign feedback for future emails | Learns from engagement |

**Integration Status:** ✅ **Beneficial - campaign drives email engagement**

---

## PART 5: DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                  AUTONOMOUS AGENTS LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Curation Agent      Blog Post Agent    Recap Agent  Email Agent│
│       ↓                    ↓                 ↓            ↓      │
│   Posts to          Posts to           Posts to      Sends to   │
│   /blog/            /blog/             /blog/        Subscribers│
│                                                                  │
└─────────────┬────────────────┬────────────────┬─────────────────┘
              │                │                │
              ↓                ↓                ↓
    ┌────────────────────────────────────────────────┐
    │  BLOG INDEX (blog/index.md)                    │
    │  ┌──────────────┐  ┌──────────────┐          │
    │  │ Daily News   │  │ Feature      │ Displays │
    │  │ (7 latest)   │  │ Spotlights   │ 4        │
    │  │              │  │ (6 latest)   │ sections │
    │  ├──────────────┤  ├──────────────┤          │
    │  │ Weekly       │  │ Community    │          │
    │  │ Recaps       │  │ Updates      │          │
    │  │ (4 latest)   │  │ (all others) │          │
    │  └──────────────┘  └──────────────┘          │
    └────────────────────────────────────────────────┘
              ↑                ↑                ↑
              │ RSS Feed       │ Social Media   │ Email
              │                │                │
    ┌─────────┴────────────────┴────────────────┴──────────┐
    │  CAMPAIGN SYSTEM LAYER (New)                         │
    ├──────────────────────────────────────────────────────┤
    │                                                       │
    │  Campaign Scheduler ──→ Posts blog post             │
    │  Performance Tracker ──→ Monitors all engagement    │
    │  Feedback Loop ────────→ Collects responses         │
    │  Intelligence Engine ──→ Analyzes patterns          │
    │                                                       │
    │  Output: Daily & weekly reports, adaptations        │
    │  Feeds back: Insights to improve all agents         │
    │                                                       │
    └──────────────────────────────────────────────────────┘
              ↑                ↑                ↑
              │ Sentiment      │ Engagement     │ Topics
              │ Analysis       │ Metrics        │ Learned
              │
    ┌────────┴──────────────────────────────────────┐
    │  COMMUNITY FEEDBACK (All Platforms)            │
    │  - Blog comments                              │
    │  - Social media replies                        │
    │  - Email responses                            │
    │  - Engagement metrics                         │
    └───────────────────────────────────────────────┘
```

---

## PART 6: SYNCHRONIZATION RULES

### **Posting Schedule (No Conflicts)**

```
Time    Agent 1           Agent 2         Agent 3      Campaign
────    ──────────        ──────────      ──────────   ──────────
09:00   Curation posts
        (7 new posts)
09:30                                                   Blog post
                                                        published
10:00                     Blog post
                          (feature spot)
11:00                     Blog post
                          (education)
14:00                     Blog post                     Campaign
                          (case study)                  thread X
16:00                     Blog post
                          (reaction)
18:00   Curation
        (if breaking)
```

**Rules:**
- ✅ Curation Agent: 9 AM always (breaking news anytime)
- ✅ Blog Post Agent: Throughout day (3+ hour spacing)
- ✅ Campaign System: Uses designated times
- ✅ No two agents post simultaneously
- ✅ Blog index displays latest from each automatically

---

## PART 7: FEEDBACK LOOP (Agents ← Campaign ← Community)

```
Community Feedback
        │
        ├─ Blog comments
        ├─ Social replies
        ├─ Email opens/clicks
        └─ Engagement metrics
        │
        ↓
Campaign Feedback Loop (Analyzes)
        │
        ├─ Sentiment analysis
        ├─ Topic clustering
        ├─ Question detection
        ├─ Misconception ID
        └─ Pattern detection
        │
        ↓
Intelligence Engine (Learns)
        │
        ├─ "Disability community engages most with X topic"
        ├─ "Policy angle resonates better than inspiration"
        ├─ "Common question: How is 3mpwrApp different?"
        ├─ "Best time to post: 8-9 AM EST"
        └─ "Misconception: Think it requires internet"
        │
        ↓
Playbook Generation (For Next Campaign)
        │
        └─ Share insights with all agents
           ├─ Curation Agent: Improve scoring weights
           ├─ Blog Post Agent: Topic ideas that work
           ├─ Recap Agent: Emphasis for weekly summaries
           └─ Email Agent: Segment-specific angles

RESULT: All agents improve based on campaign learnings
```

---

## PART 8: CROSS-INTEGRATION BENEFITS

### **What Campaign Gets From Agents:**
✅ Distributed through all agent channels automatically  
✅ Included in weekly recaps (if high engagement)  
✅ Featured in segment-specific emails  
✅ Shared on social media (via agent posting)  
✅ Gets link-backs from agent-generated content  

### **What Agents Get From Campaign:**
✅ Performance data (what resonates with each segment)  
✅ Topic learnings (what community cares about)  
✅ Feedback insights (misconceptions to address)  
✅ Audience patterns (best times, formats, angles)  
✅ Playbook updates (for next campaign)  

### **What Community Gets:**
✅ Coordinated messaging (all channels aligned)  
✅ Real engagement (not just broadcasts)  
✅ Responsive content (feedback creates follow-ups)  
✅ Better curation (agents improve from data)  
✅ Personalized emails (based on segment)  

---

## PART 9: CONFIGURATION VERIFICATION ✅

### **Curation Agent Configuration**
✅ 26+ RSS feeds monitored  
✅ Tier 1: Breaking news (2-hour check)  
✅ Tier 2: High-signal (4-hour check)  
✅ Tier 3: Regular (daily 9 AM)  
✅ Scoring algorithm: 6-tier relevance  
✅ Output: Tagged `highlights` posts  
✅ Status: ACTIVE 24/7  

### **Blog Post Agent Configuration**
✅ Monitors trending topics  
✅ Generates 3-5 posts daily  
✅ Types: Features, education, cases, reactions  
✅ Output: Tagged `features`, `spotlight`  
✅ Status: ACTIVE 24/7  

### **Recap Agent Configuration**
✅ Analyzes weekly engagement  
✅ Creates 4 recap versions  
✅ Frequency: Mon, Wed, Fri, Sun  
✅ Output: Tagged `weekly` posts  
✅ Status: ACTIVE weekly  

### **Email Agent Configuration**
✅ 5 audience segments  
✅ Personalizes by segment  
✅ Sources: Blog posts + curated news  
✅ Frequency: Weekly  
✅ Status: ACTIVE weekly  

### **Campaign System Configuration**
✅ Scheduler: 4-phase intelligent schedule  
✅ Tracker: Real-time performance metrics  
✅ Feedback: 7-stage analysis system  
✅ Intelligence: Auto-learning, auto-adapting  
✅ Status: READY TO LAUNCH  

---

## PART 10: LAUNCH CHECKLIST

### **Before Campaign Launches:**
- ✅ Verify agents are running
- ✅ Check RSS feeds are updating
- ✅ Confirm blog index displays all sections
- ✅ Test blog post publishing pipeline
- ✅ Verify social media posting works
- ✅ Confirm email delivery configured

### **Campaign Launch Day:**
- ✅ Blog post published (tagged correctly)
- ✅ Campaign scheduler starts
- ✅ Performance tracker begins monitoring
- ✅ Feedback collection begins
- ✅ All platforms posting on schedule
- ✅ Reports generating

### **Ongoing:**
- ✅ Agents continue normal operation
- ✅ Campaign data feeds to agent reports
- ✅ Weekly recaps mention campaign highlights
- ✅ Campaign feedback improves agent weights
- ✅ Monthly playbook updates agents

---

## SUMMARY

```
STATUS: ✅ ALL SYSTEMS INTEGRATED & READY

AGENTS:      4/4 Operating
CAMPAIGN:    Ready to launch
INTEGRATION: Seamless (no conflicts)
DATA FLOW:   Bi-directional (agents ← → campaign)
FEEDBACK:    Continuous (community → agents → improvement)

RESULT: Coordinated, intelligent content ecosystem
        that learns and improves over time
```

---

**Next Step:** Launch campaign with `node scripts/automation/campaign-orchestrator.js start`

Everything else happens automatically.
