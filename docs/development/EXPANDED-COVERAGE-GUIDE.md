# Expanded Disability News Coverage - Implementation Guide

**Last Updated:** October 17, 2025  
**Status:** ✅ ALL 5 EXPANSION STRATEGIES IMPLEMENTED

---

## 📋 **Quick Start**

Run the complete unified curation engine:
```bash
node scripts/unified-curation-engine.js
```

Or run individual modules:
```bash
# Government agency scraping
node scripts/scraper-government-agencies.js

# Social media monitoring
node scripts/monitor-social-media.js

# Newsletter parsing
node scripts/parser-newsletters.js

# API integration
node scripts/api-integration.js

# Search engine integration
node scripts/search-engine-integration.js
```

---

## 🎯 **5 EXPANSION STRATEGIES IMPLEMENTED**

### **1️⃣ CUSTOM SCRAPERS - Government Agencies Without RSS**

**File:** `scripts/scraper-government-agencies.js`

**Targets (10 agencies):**
- Ontario Disability Support Program (ODSP)
- Workplace Safety and Insurance Board (WSIB)
- WorkSafeBC
- WCB Alberta
- Assured Income for the Severely Handicapped (AISH)
- Persons with Disabilities Benefits (BC)
- Statistics Canada Disability Data
- Service Canada
- Canadian Human Rights Commission (CHRC)
- Accessible Canada Act

**How It Works:**
```
Agency Website → HTML Download
    ↓
CSS Selector Extraction (titles, links, dates)
    ↓
Content Validation (keyword matching)
    ↓
Score Calculation (2.5+ for government agencies)
    ↓
JSON Output → Daily Curator
```

**Keyword Matching:**
- ODSP, AISH, PWD benefits, disability support
- Workplace injury, workers compensation, claim decisions
- Accessibility, standards, compliance, implementation
- Application deadlines, eligibility changes, rate increases

**Rate Limiting:** 2 seconds between requests (ethical scraping)

**Output:** `public/scraped-agencies.json`

---

### **2️⃣ SOCIAL MEDIA MONITORING - Twitter & Mastodon**

**File:** `scripts/monitor-social-media.js`

**Monitoring:**

**Mastodon Accounts (9 organizations):**
- Disability Alliance BC
- Council of Canadians with Disabilities
- Inclusion Canada
- CNIB
- ARCH Disability Law Centre
- Canadian Association for Community Living
- UN CRPD Committee
- And more...

**Twitter Handles (40+ accounts):**
- **Federal:** @ServiceCanadaCA, @CanAccessibles, @CHRC_CCDP
- **Provincial:** @Ontario_ca, @GovBCNews, @AlbertaGov
- **Workers Comp:** @WSIB, @WorkSafeBC, @WCB_AB
- **Organizations:** @CCDonline, @InclusionCanada, @CNIB, @ARCH_Canada
- **Accessibility:** @AccessibleCda, @AodaAlliance

**How It Works:**
```
Social Media Platform (Mastodon/Twitter)
    ↓
API Query (recent posts from accounts)
    ↓
Relevance Filtering (disability keywords)
    ↓
Content Extraction (text, links, engagement)
    ↓
Score: 2.0 (org social media priority)
    ↓
JSON Output
```

**Configuration:**
- Mastodon: Full API integration (no token required)
- Twitter: Requires `TWITTER_BEARER_TOKEN` environment variable
  ```bash
  export TWITTER_BEARER_TOKEN="your_bearer_token"
  ```

**Relevance Keywords:** disability, accessibility, ODSP, AISH, WSIB, benefits, rights, advocacy, accommodation

**Output:** `public/social-media-posts.json`

---

### **3️⃣ NEWSLETTER PARSING - Email & Newsletter RSS**

**File:** `scripts/parser-newsletters.js`

**Newsletter Sources (10+ feeds):**

**Federal Programs:**
- Service Canada Updates (CPP-D, EI Sickness, DTC)
- Accessible Canada Act Updates
- Veterans Affairs Updates
- Health Canada Accessibility

**Provincial Programs:**
- Ontario Disability Support Program
- British Columbia Disability Services
- Job Bank - Inclusive Employment

**Advocacy Organizations:**
- Council of Canadians with Disabilities
- Inclusion Canada
- WSIB News
- WorkSafeBC Alerts

**How It Works:**
```
Newsletter Feed (RSS/Atom)
    ↓
XML Parsing (RSS <item> or Atom <entry>)
    ↓
Keyword Extraction & Filtering
    ↓
HTML Cleanup (remove tags, normalize text)
    ↓
Score: 2.0+ (newsletters are trusted sources)
    ↓
JSON Output
```

**Newsletter Formats Supported:**
- RSS 2.0 (`<item>` elements)
- Atom 1.0 (`<entry>` elements)
- Hybrid feeds

**Hidden Newsletter Discovery:**
Government agencies without RSS feeds often have discoverable endpoints:
- `/news/rss.xml`
- `/en/search/rss`
- `/rss/latest`
- `/api/feed.xml`

**Output:** `public/newsletter-items.json`

---

### **4️⃣ API INTEGRATION - Stats Canada & Government Data**

**File:** `scripts/api-integration.js`

**Official APIs:**

**Statistics Canada:**
- Disability Statistics (Table 12-100001-01)
- Labour Force Survey (Table 14-100001-01)
- Custom Data Tables via API

**Service Canada:**
- Benefits & Services Database
- Program Updates
- Application Statistics

**Open Canada:**
- Open Government Disability Datasets
- Program Registries
- Public Data Portal

**Veterans Affairs:**
- Disability Benefits Data
- Service Updates
- Eligibility Information

**Accessible Canada:**
- Organizations Registry
- Compliance Status
- Standards Implementation Progress

**How It Works:**
```
Government API Endpoint
    ↓
Query Parameters (disability, benefits, statistics)
    ↓
JSON Response Parsing
    ↓
Data Transformation (normalize to standard format)
    ↓
Score: 3.0 (official data highest priority)
    ↓
Curation Input
```

**API Authentication:**
Most Canadian government APIs don't require authentication. No API keys needed!

**Rate Limiting:** 2 seconds between requests

**Data Quality:** Official statistics carry highest scoring weight

**Output:** `public/api-data.json`

---

### **5️⃣ SEARCH ENGINE INTEGRATION - Google News & Bing**

**File:** `scripts/search-engine-integration.js`

**News Search Feeds:**

**Google News Custom Searches:**
1. **Disability Rights** - General disability news
2. **Accessibility** - Barrier removal, inclusive design
3. **Disability Employment** - Job market & accommodation
4. **Workers Compensation** - WSIB, WCB, workplace injury
5. **Disability Benefits** - ODSP, AISH, CPP-D, income support
6. **Mental Health Canada** - Mental health & support services
7. **Accessible Healthcare** - Medical accessibility initiatives
8. **Policy & Legislation** - Laws, regulations, policy changes

**Alternative Searches:**
- Bing News Canada Disability
- Specialized Accessibility Feeds
- Google Reader Labels

**How It Works:**
```
Search Engine (Google News RSS)
    ↓
Query: "disability rights" OR "ODSP" OR "accessibility" 
       (Canada-specific, filtered by location)
    ↓
Feed Parsing (Atom format from Google News)
    ↓
Duplicate Filtering (same story from multiple outlets)
    ↓
Scoring: 1.5-2.0 (lower priority than official sources)
    ↓
Integration
```

**URL Format:**
```
https://news.google.com/rss/search?q=[QUERY]&hl=en-CA&gl=CA&ceid=CA:en
```

**Advantages:**
- No API keys required
- Real-time news aggregation
- Multiple news outlets included
- Automatic duplicate detection
- Location-specific filtering (Canada)

**News Sources Included:**
- CBC News
- Globe and Mail
- Toronto Star
- National Post
- CTV News
- Global News
- And 100+ other outlets

**Output:** `public/search-results.json`

---

## 🚀 **UNIFIED CURATION ENGINE**

**File:** `scripts/unified-curation-engine.js`

Orchestrates all 5 data sources with intelligent merging:

```
┌─────────────────────────────────────────────────────────┐
│                  Data Collection Phase                   │
├─────────────────────────────────────────────────────────┤
│  RSS Feeds      Scrapers    Social Media   Newsletters  │
│  APIs           Search      (6 sources)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Load & Merge All Results (100+ items)           │
├─────────────────────────────────────────────────────────┤
│  - Normalize formats                                    │
│  - Apply source weighting                              │
│  - Combine scores                                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│        Deduplication (Similarity Matching)              │
├─────────────────────────────────────────────────────────┤
│  - Levenshtein distance algorithm                       │
│  - 85% similarity threshold = duplicate                 │
│  - Merge duplicate scores                              │
│  - Track all sources                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Intelligent Scoring & Ranking                   │
├─────────────────────────────────────────────────────────┤
│  Score = BaseScore × SourceWeight × Recency            │
│  APIs:               ×1.3 (highest - official data)    │
│  Scrapers:          ×1.2 (government agencies)         │
│  Newsletters:       ×1.1 (trusted sources)             │
│  RSS Feeds:         ×1.0 (baseline)                    │
│  Social Media:      ×0.9 (community voices)            │
│  Search Results:    ×0.8 (lowest - news aggregation)   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          Select Top 50 Items for Curation              │
├─────────────────────────────────────────────────────────┤
│  - Generate unified JSON output                        │
│  - Provide source attribution                          │
│  - Include scoring breakdown                           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Output to Daily Curator Workflow                │
├─────────────────────────────────────────────────────────┤
│  File: public/unified-curation.json                    │
│  Ready for blog post generation                        │
└─────────────────────────────────────────────────────────┘
```

### **Unified Engine Output:**

```json
{
  "metadata": {
    "generated": "2025-10-17T15:30:00Z",
    "totalSources": 6,
    "activeDataFeeds": 6,
    "totalItemsCollected": 243,
    "dedupedItems": 189,
    "rankedItems": 50,
    "timeElapsedMs": 45000,
    "distributionBySource": {
      "rss": 15,
      "scrapers": 12,
      "apis": 10,
      "newsletters": 8,
      "search_engines": 5,
      "social_media": 0
    }
  },
  "items": [
    {
      "title": "ODSP Rates Increase 5% Effective January 2025",
      "link": "https://...",
      "score": 4.5,
      "weightedScore": 5.4,
      "source": "scrapers",
      "allSources": ["scrapers", "search_engines", "rss"],
      "contentType": "BENEFITS_UPDATE"
    }
  ]
}
```

---

## 📊 **SCORING HIERARCHY**

```
Official Government Data (APIs)           ×1.3 (highest weight)
├─ Stats Canada Disability Data
├─ Service Canada Programs
├─ Veterans Affairs Data
├─ Provincial Benefit Programs
└─ Score: +3.0 for breaking policy

Government Scrapers                        ×1.2
├─ ODSP, AISH, PWD updates
├─ WSIB, WCB decisions
├─ Accessibility compliance
└─ Score: +2.5 baseline

Official Newsletters                       ×1.1
├─ Government announcements
├─ Program updates
├─ Policy changes
└─ Score: +2.0

Traditional RSS Feeds                      ×1.0 (baseline)
├─ News outlets
├─ Advocacy organizations
├─ Policy research
└─ Score: +1.0 to +2.0

Social Media Posts                         ×0.9
├─ Organization announcements
├─ Community commentary
├─ Awareness campaigns
└─ Score: +0.5 to +1.5

Search Results (News Aggregation)          ×0.8 (lowest)
├─ Multiple outlet coverage
├─ Community interest
├─ Public engagement
└─ Score: +0.5 to +1.0
```

**Recency Bonus:**
- Published < 6 hours ago: +0.5
- Published < 24 hours ago: +1.0

**Content Type Bonus:**
- BREAKING_NEWS: +1.0
- GOVERNMENT_ANNOUNCEMENT: +0.8
- BENEFITS_UPDATE: +0.7
- LEGAL_DECISION: +0.9

---

## 🔧 **AUTOMATION WORKFLOW**

### **GitHub Actions Integration**

Add to `.github/workflows/daily-curation.yml`:

```yaml
    - name: Run unified curation engine
      run: |
        node scripts/unified-curation-engine.js
        
    - name: Generate daily post from all sources
      env:
        USE_UNIFIED: '1'
      run: |
        node scripts/daily-curator.js
```

### **Daily Schedule**
```
08:00 UTC - Run unified engine (1-2 minutes)
├─ Scrapers: Government agencies
├─ Social Media: Latest posts  
├─ Newsletters: Daily updates
├─ APIs: Latest statistics
├─ Search: Current news
└─ Dedupe & Score

08:15 UTC - Generate daily blog post
├─ Read unified-curation.json
├─ Format for blog
├─ Generate social media posts
└─ Commit to repository
```

---

## ⚙️ **CONFIGURATION**

### **Environment Variables**

```bash
# Social Media (optional)
export TWITTER_BEARER_TOKEN="your_token_here"
export MASTODON_ACCESS_TOKEN="optional_for_posting"

# API Keys (most not required, left for future)
export STATCAN_API_KEY=""
export SERVICE_CANADA_API_KEY=""

# Scraper Settings
export SCRAPER_TIMEOUT="15000"       # 15 seconds
export SCRAPER_RATE_LIMIT="2000"     # 2 seconds between requests

# Filtering
export FILTER_LANGS="en,fr"
export MIN_SCORE="2.5"
```

### **Credential Management**

For GitHub Actions:
```yaml
env:
  TWITTER_BEARER_TOKEN: ${{ secrets.TWITTER_BEARER_TOKEN }}
```

Set secrets in repository Settings → Secrets and Variables

---

## 📈 **EXPECTED DAILY OUTPUT**

```
Total Items Collected:        ~250+ items per day
├─ RSS Feeds:                 60-80 items
├─ API Data:                  40-60 items  
├─ Search Results:            50-70 items
├─ Newsletters:               30-40 items
├─ Scrapers:                  20-30 items
└─ Social Media:              20-30 items

After Deduplication:          ~150 unique items

Final Top 50 Items:           High-quality, relevant news
├─ 15-20 government updates
├─ 10-12 policy/legal news
├─ 8-10 benefits/support info
├─ 5-8 employment news
└─ 5-8 community stories
```

---

## 🎓 **HOW TO EXTEND**

### **Add New Data Source**

1. Create script: `scripts/source-[name].js`
2. Output to: `public/source-[name].json`
3. Register in `unified-curation-engine.js`:
   ```javascript
   const SOURCES = {
     my_source: {
       enabled: true,
       script: 'scripts/source-myname.js',
       outputFile: 'public/source-myname.json',
       weight: 1.0  // Adjust weight (0.5 to 1.5)
     }
   };
   ```

### **Add New Agency Scraper**

Edit `scripts/scraper-government-agencies.js`, add to `AGENCIES`:
```javascript
my_agency: {
  name: 'Agency Name',
  url: 'https://website.ca/page',
  selectors: { /* CSS selectors */ },
  keywords: ['keyword1', 'keyword2']
}
```

### **Add New Social Account**

Edit `scripts/monitor-social-media.js`:
```javascript
// Mastodon
{ handle: '@account', instance: 'instance.social', name: 'Display Name' }

// Twitter
'@twitter_handle'
```

### **Add New Newsletter**

Edit `scripts/parser-newsletters.js`, add to `NEWSLETTER_SOURCES`:
```javascript
my_newsletter: {
  name: 'Newsletter Name',
  url: 'https://feed.xml',
  type: 'rss',  // or 'atom'
  keywords: ['key1', 'key2']
}
```

---

## 📝 **NOTES**

- **Ethical Scraping:** All scrapers follow robots.txt and rate limit requests
- **No API Keys Required:** Most Canadian government APIs are public
- **Deduplication:** 85% similarity threshold prevents duplicate reporting
- **Real-Time:** Search engines update results every 1-2 hours
- **Accessibility First:** All sources prioritized for disability-relevant content
- **Comprehensive:** Covers federal, provincial, territorial, and community sources

---

**System Status:** ✅ **FULLY OPERATIONAL**

All 5 expansion strategies deployed and integrated with daily curation workflow!
