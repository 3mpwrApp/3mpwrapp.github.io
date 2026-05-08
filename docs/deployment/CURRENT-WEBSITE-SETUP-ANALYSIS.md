# 3mpwr App Website: Current Content & Curation Setup Analysis
**January 2, 2026**

---

## Executive Summary

Your website operates as a **content hub with three interlocking systems**: (1) daily curated news aggregation, (2) structured blog content (feature spotlights, weekly recaps), and (3) What's New updates via Jekyll collections. This represents an advanced content strategy designed for a community of injured workers and persons with disabilities.

**Current strength**: Sophisticated automation with 50+ RSS source feeds, daily scoring algorithms, and multi-platform social distribution.

**Current focus areas**: Daily Canadian news curation on disability, accessibility, and social policy; community storytelling; product feature updates.

---

## I. ARCHITECTURE OVERVIEW

### A. Technology Stack
- **Framework**: Jekyll (static site generator)
- **Hosting**: GitHub Pages + Cloudflare Pages
- **Theme**: Minima (customized)
- **Markdown**: Kramdown
- **Automation**: Node.js scripts + shell automation
- **Testing**: Playwright, AXE accessibility testing

### B. Content Collections
```
/blog/                    → Main blog index (navigation hub)
/_posts/                  → Blog posts (140+ files)
/_curation/               → Daily news curations (70+ daily files)
/_whats_new/              → Product/community updates (Jekyll collection)
/_data/                   → Dynamic data (feeds, configuration, analytics)
```

---

## II. CURRENT CONTENT SYSTEMS

### 1. DAILY NEWS CURATION
**Purpose**: Surface 50 curated stories daily from trusted Canadian disability/accessibility sources  
**Location**: `/_curation/` directory

**Key Features**:
- **Frequency**: Daily (9 AM UTC)
- **Sources**: 26 RSS feeds including:
  - Government: Manitoba, Ontario, BC, Alberta, federal agencies
  - Advocacy: Inclusion Canada, CNIB, CACL, Disability Alliance BC
  - Policy: IRPP, Policy Options
  - News: CBC, Global News, Rabble, The Tyee
  
- **Scoring Algorithm** (`_data/curator.json`):
  - **Critical** (4 pts): Breaking news, emergency, lawsuit, court decisions, policy changes, funding announcements
  - **High Priority** (3 pts): Accessibility, disability, workers comp, benefits eligibility, assistive tech
  - **Medium** (2 pts): General social policy, governance, healthcare
  - **Light** (1 pt): Related context stories

- **Output Format**: Markdown with:
  - Ranked articles (1-50)
  - Extracted images
  - Source links
  - Relevance scores

**Recent Activity**: 70+ curations from Oct 6 → Dec 14, 2025

---

### 2. BLOG POSTS
**Location**: `/_posts/` directory (132 files)  
**Categories by Type**:

#### A. Daily News Highlights
- Format: Curated articles with badges
- Tags: `highlights`
- Example: `2025-10-21-daily-curation.md`
- Display: 7 most recent on blog homepage

#### B. Feature Spotlights  
- Format: Long-form product feature stories
- Tags: `feature-spotlight`
- Recent examples:
  - "Energy Forecast + Smart Scheduling" (Oct 21)
  - "Disability Wizard" (Oct 22)
  - "Evidence Locker" (Oct 24)
  - "Master Letter Generator" (Oct 23)
  - "Indigenous Language Support" (Oct 26)
  - "Legal Workflow Automation" (Oct 25)
  
**Pattern**: One spotlight per day, rotating through product features
**Writing style**: Narrative-driven, emphasizing user benefit and accessibility

#### C. Weekly Recaps
- Format: Synthesis of week's top stories + community updates
- Tags: `weekly-recap`
- Example: "Week 43 Update" (Oct 21)

#### D. Comprehensive Digests
- Format: Long-form roundups combining news + features
- Example: "Comprehensive Daily Digest" (Oct 17)

#### E. Foundational/Announcement Posts
- "Welcome to 3mpowr" (Oct 3) - Mission statement

---

### 3. WHAT'S NEW (Jekyll Collection)
**Location**: `/_whats_new/`  
**Configuration**: Defined in `_config.yml` with custom permalink structure  
**Display**: Dedicated "What's New" page + RSS feed

**Purpose**: Product updates, feature releases, community announcements
**Output URL structure**: `/whats-new/{name}/`

---

## III. CONTENT DISTRIBUTION

### Homepage Integration
**File**: `index.md` (977 lines)

**Sections** (in priority order):
1. Accessibility toolbar (13 features - pain relief, reading aids, cognitive support)
2. **Daily News Highlights** (top 7 curated articles)
3. **Feature Spotlights** (latest product features)
4. **Weekly Recaps** (synthesis of week's top stories)
5. **Blog Posts** (general community updates)
6. CTA: Newsletter signup, contact, beta signup

**Navigation**:
- Blog index: `#curated-daily`, `#feature-articles`, `#weekly-recaps`, `#blog-posts`

### Blog Index
**File**: `blog/index.md` (474 lines)

**Sections**:
1. Navigation menu linking to four categories
2. Social media callout (Mastodon daily at 9 AM UTC, Bluesky daily at 9 AM UTC)
3. Daily highlights grid (7 posts max)
4. Feature articles grid
5. Weekly recaps
6. General blog posts

### Newsletter
**File**: `newsletter/index.md`  
**Signup**: Embedded Google Form  
**Value proposition**:
- Weekly updates
- Community stories
- Resource highlights
- Event announcements
- Advocacy updates

---

## IV. AUTOMATION INFRASTRUCTURE

### A. Daily Curation Pipeline
**Trigger**: Scheduled (9 AM UTC daily via GitHub Actions or similar)

**Scripts** (in `/scripts/`):
1. **`daily-curator.js`** - Main aggregation engine
2. **`curator-core.js`** - RSS parsing, article extraction
3. **`curator-rss.js`** - Feed management
4. **`curator-images.js`** - Image extraction/optimization
5. **`curator-trending.js`** - Trend identification
6. **`optimize-scoring.js`** - Algorithmic weighting

**Output**: Daily markdown file with 50 scored articles

### B. Feature Generation
**Scripts**:
1. **`daily-feature-generator.js`** - Auto-generates feature spotlight posts
2. **`post-daily-feature.js`** - Publishing pipeline
3. **`generate-3mpwrapp-articles.js`** - Product-specific content

### C. Social Media Distribution
**Platforms**: Mastodon, Bluesky, X (Twitter), Facebook, Instagram, YouTube, TikTok

**Scripts**:
1. **`post-to-mastodon.js`** - Daily 9 AM posts
2. **`post-to-bluesky.js`** - Equivalent posts
3. **`post-to-x.js`** - X/Twitter distribution
4. **`social-media-api.js`** - API management
5. **`generate-social-posts.js`** - Content adaptation for platforms

**Strategy**: 
- Standardized daily posts at 9 AM UTC
- Content adapted for platform-specific formats
- Hashtag tracking: `#3mpwrApp`, `#DisabilityRights`, `#AccessibilityMatters`

### D. Search & Discovery
**Scripts**:
1. **`build-search-index.js`** - Full-text search preparation
2. **`search-engine-integration.js`** - SEO optimization
3. **`keyword-alerts.js`** - Trend monitoring

### E. Weekly Content Synthesis
**Scripts**:
1. **`weekly-update-generator.js`** - Weekly recap automation
2. **`generate-weekly-post.js`** - Publishing pipeline

### F. Image & Media Optimization
**Scripts**:
1. **`optimize-images.js`** - Compression for web
2. **`add-image-dimensions.js`** - Performance optimization
3. **`curator-images.js`** - Extraction & processing

### G. Analysis & Learning
**Scripts**:
1. **`curator-analytics.js`** - Performance tracking
2. **`curator-auto-learn.js`** - Algorithm refinement
3. **`recommendation-engine.js`** - Personalization signals
4. **`viral-hooks-analytics.js`** - Engagement metrics

---

## V. CONTENT CALENDAR & RHYTHM

### Daily Workflow
**9:00 AM UTC**
- RSS feeds checked (50+ sources)
- Articles scored via algorithm
- Top 50 articles compiled
- Markdown generated → `/_curation/`
- Social media posts generated
- Posts distributed to Mastodon, Bluesky, X

### Weekly Patterns
**Monday-Sunday**: One feature spotlight per day
- Different feature area highlighted
- Narrative format explaining benefit
- Linked in blog + homepage

**Weekly**: One synthesis recap
- Top news stories summarized
- Community announcements
- Week ahead preview

### Ad-Hoc Content
- Announcements (new features, events)
- Community spotlights
- Accessibility/UX improvements
- Policy response articles

---

## VI. CURRENT CONTENT PERFORMANCE SIGNALS

### Coverage Areas (from curator.json weights)
**Top Priority Topics**:
1. Disability benefits (ODSP, AISH, EIA, CPP-D, DTC)
2. Workers compensation (WSIB, WorkSafe, WCB)
3. Accessibility (WCAG, ARIA, barrier-free design)
4. Accessibility Compliance (AODA, ADA, legislation)
5. Policy changes & advocacy
6. Legal/court decisions affecting disability

### Source Authority
**Government**: 10+ provincial + federal agencies (credibility signal)  
**Advocacy**: 7 established disability orgs (audience trust)  
**Policy Research**: IRPP, Policy Options (depth signal)  
**News**: CBC, Global News (timeliness + reach)  
**Independent**: Rabble, The Tyee (critical perspective)

---

## VII. DATA STRUCTURE

### `_data/curator.json`
**Components**:
- `rssFeeds[]`: 26 feed URLs
- `scoring`: Critical (4), High Priority (3), Medium (2), Light (1)
- `terms`: Keywords mapped to categories (150+ monitored terms)

### `_data/weekly.json`
**Purpose**: Track weekly synthesis articles

### `_data/updates.yml`
**Purpose**: Additional metadata for What's New collection

---

## VIII. SEO & DISCOVERY SETUP

**Site Configuration** (`_config.yml`):
- **Base URL**: https://3mpwrapp.ca
- **Plugins**: 
  - `jekyll-feed` (RSS generation)
  - `jekyll-seo-tag` (metadata)
  - `jekyll-sitemap` (search indexing)
  
**Social Metadata**:
- Twitter creator: @3mpowrApp0816
- Logo: /assets/empwrapp-logo.png
- Default image: /assets/empwrapp-logo.png
- Twitter card: summary_large_image

**Search Features**:
- Full-text search index
- Keyword alerts system
- Related article recommendations

---

## IX. ACCESSIBILITY & INCLUSION FOCUS

### Homepage Accessibility Toolbar
**13 Features** for cognitive/physical accessibility:
- **Quick Relief**: Need a break, Pain flare mode, Overwhelmed, Freeze animations
- **Reading Aids**: Too much text, Brain fog helper
- **Vision & Hearing**: Text size, color filters, audio descriptions
- **Focus & Navigation**: Simplified layout, tab focus

**Philosophy**: Built-in support for energy limitations, sensory sensitivities, cognitive load

---

## X. TRANSLATION & LOCALIZATION

**Supported Languages**: 
- English (primary)
- French (`/fr/`)
- Spanish (`/es/`)
- Portuguese (`/pa/`) 
- Arabic (`/ar/`)
- Simplified Chinese (`/zh/`)

**Integration**: Automation scripts include `batch-translate.js`, `TRANSLATION-SYSTEM-README.md`

---

## XI. TESTING & QUALITY ASSURANCE

**Accessibility Testing**:
- AXE (automated)
- Pa11y (compliance checks)
- Playwright (integration tests)
- W3C WCAG AAA compliance monitoring

**Performance**:
- Lighthouse audits (regular tracking)
- Image optimization (Sharp)
- CSS minification (cssnano, clean-css)
- JavaScript minification (Terser)

**Quality**:
- Link validation (Linkinator)
- Spelling/grammar checks
- Social media verification

---

## XII. ANALYTICS & INSIGHTS

**Tracked Metrics**:
- Article engagement (curator-analytics.js)
- Social media reach (monitor-social-media.js)
- Trending topics (curator-trending.js)
- Viral content patterns (viral-hooks-analytics.js)
- Recommendation effectiveness

**Privacy**: No Google Analytics; optional privacy-friendly analytics (Goatcounter)

---

## XIII. KEY OBSERVATIONS & STRATEGIC INSIGHTS

### Strengths
1. **Integrated approach**: News curation → blog posts → social distribution is seamless
2. **Source credibility**: Diverse feeds (government, advocacy, research, news) build trust
3. **Accessibility-first**: Native toolbar; WCAG AAA compliance target
4. **Automation maturity**: 40+ scripts for content generation, distribution, and optimization
5. **Multi-platform reach**: Mastodon, Bluesky, X, Facebook, Instagram, TikTok coverage
6. **Data-driven scoring**: Algorithm filters 50+ stories down to most relevant
7. **Community-centered**: Focus on stories affecting injured workers + PWD specifically

### Growth Opportunities
1. **Topic clustering**: Group curation by sub-topics (e.g., "Workers Comp Wins," "Accessibility Breakthroughs") for skimmability
2. **Reader engagement**: Current setup is push-based; could add pull elements (polls, community votes, discussion threads)
3. **Narrative depth**: Feature spotlights could include user testimonials, case studies for proof
4. **Cross-collection linking**: Connect blog posts to curated articles thematically for discovery
5. **Email personalization**: Newsletter could segment by interest areas (benefits, workplace law, accessibility, etc.)
6. **Content evergreen index**: Current structure favors recent content; could build "essential guides" hub
7. **Community contribution**: Could open curation to community tips/recommendations to deepen engagement

### Content Strategy Alignment (Naval + Ann Handley + Ogilvy)
- **Clarity**: ✅ Curation algorithm focuses on signal-to-noise; daily digest provides clarity
- **Storytelling**: ✅ Feature spotlights use narrative; weekly recaps show arc
- **Audience-centric**: ✅ Scoring weights favor stories affecting disability/accessibility community
- **Persuasion**: ⚠️ Could strengthen with more outcome-focused headlines ("How to Win Your WSIB Case" vs. "WSIB Update")
- **Insight density**: ✅ High; requires careful headline/summary work to be skimmable

---

## XIV. QUICK REFERENCE: CONTENT PUBLISHING PATHS

### To Add a News Story (Manual)
1. Add link to `/_curation/YYYY-MM-DD-curated.md`
2. Update social posts in scripts
3. Publish via Jekyll

### To Create a Feature Spotlight
1. Use `daily-feature-generator.js` template
2. Write narrative highlighting user benefit
3. Publish to `/_posts/YYYY-MM-DD-feature-spotlight-[title].md`
4. Appears on homepage + blog + social

### To Create Weekly Recap
1. Run `weekly-update-generator.js`
2. Edit synthesis + add commentary
3. Publish to `/_posts/YYYY-MM-DD-weekly-recap.md`

### To Add To What's New Collection
1. Create file in `/_whats_new/YYYY-MM-DD-[title].md`
2. Add front matter with date, category
3. Auto-generates `/whats-new/[title]/` permalink

---

## XV. NEXT STEPS FOR CONTENT ENHANCEMENT

**Recommended Priority Actions**:
1. **Audit current scoring weights** - Do high-priority keywords truly reflect community needs?
2. **Analyze engagement metrics** - Which content types drive most action?
3. **User research** - What stories matter most to your audience?
4. **Content repurposing** - Can curated articles become deeper guides?
5. **Community participation** - How to involve readers in curation process?

---

**Created by**: Content Strategy Analysis  
**Date**: January 2, 2026  
**Version**: 1.0
