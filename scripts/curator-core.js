#!/usr/bin/env node
/**
 * CURATOR-CORE.JS
 * Unified news curation engine for 3mpwrApp
 * Replaces: daily-curator.js + unified-curation-engine.js
 * 
 * Features:
 * - Multi-source RSS feed aggregation
 * - Multi-factor scoring algorithm
 * - Language filtering (EN/FR)
 * - Deduplication by URL
 * - HTML entity decoding
 * - CDATA section handling
 * - Structured JSON output
 * - Markdown output for blog posts
 * - Trending topics detection & scoring boost
 * - RSS feed generation
 * - Social media card generation
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { parseISO, format } = require('date-fns');

// Load enhancement modules
const TrendingTopics = require('./curator-trending');
const CuratorRSS = require('./curator-rss');
const CuratorImages = require('./curator-images');

class CuratorCore {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), '_data', 'curator.json');
    this.config = this.loadConfig();
    this.items = [];
    this.scoredItems = [];
    this.selectedItems = [];
    this.trending = new TrendingTopics();
    this.rssGen = new CuratorRSS();
    this.imageGen = new CuratorImages();
  }

  /**
   * Load configuration from curator.json
   */
  loadConfig() {
    let config = {
      rssFeeds: [],
      scoring: {
        high_priority: { score: 3.0, terms: [] },
        medium_priority: { score: 2.0, terms: [] },
        contextual: { score: 1.0, terms: [] },
        critical: { score: 4.0, terms: [] },
        provincial: { score: 2.5, terms: [] }
      },
      minScore: 2.5,
      maxItems: 25,
      languages: ['en', 'fr'],
      excludePatterns: []
    };

    if (fs.existsSync(this.configPath)) {
      try {
        const fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        config = { ...config, ...fileConfig };
        this.log(`✅ Loaded config from ${this.configPath}`);
      } catch (err) {
        this.log(`⚠️ Config load error: ${err.message}, using defaults`);
      }
    } else {
      this.log(`⚠️ Config not found at ${this.configPath}, using defaults`);
    }

    return config;
  }

  /**
   * Logging with timestamp
   */
  log(msg) {
    if (process.env.DEBUG_CURATOR) {
      console.log(`[${new Date().toISOString()}] ${msg}`);
    }
  }

  /**
   * HTTP GET with timeout
   */
  httpGet(url, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data }));
      });
      req.on('error', reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error('Request timeout'));
        reject(new Error(`Timeout fetching ${url}`));
      });
    });
  }

  /**
   * Decode HTML entities and numeric character references
   */
  decodeHtmlEntities(text) {
    if (!text) return '';
    
    const entities = {
      '&nbsp;': ' ', '&lt;': '<', '&gt;': '>', '&quot;': '"',
      '&apos;': "'", '&amp;': '&', '&#039;': "'", '&#8217;': "'",
      '&#038;': '&', '&#8211;': '–', '&#8212;': '—', '&mdash;': '—',
      '&ndash;': '–'
    };

    let result = text;
    for (const [ent, ch] of Object.entries(entities)) {
      result = result.replace(new RegExp(ent, 'g'), ch);
    }
    
    // Numeric entities
    result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(code));
    result = result.replace(/&#x([A-Fa-f0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
    
    return result;
  }

  /**
   * Parse RSS feed (both RSS and Atom formats)
   */
  parseRSS(xml) {
    const items = [];

    // Try RSS <item> format
    const rssRe = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = rssRe.exec(xml))) {
      const chunk = match[1];
      const item = this.extractItemFields(chunk, 'rss');
      if (item.title || item.link) {
        items.push(item);
      }
    }

    // If no items, try Atom <entry> format
    if (items.length === 0) {
      const atomRe = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
      while ((match = atomRe.exec(xml))) {
        const chunk = match[1];
        const item = this.extractItemFields(chunk, 'atom');
        if (item.title || item.link) {
          items.push(item);
        }
      }
    }

    return items;
  }

  /**
   * Extract fields from item/entry chunk
   */
  extractItemFields(chunk, format) {
    const getField = (tag) => {
      // CDATA first
      const cdataRe = new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[(.*?)\\]\\]>\\s*</${tag}>`, 'i');
      let m = cdataRe.exec(chunk);
      if (m) return this.decodeHtmlEntities(m[1].trim());

      // Regular tags
      const tagRe = new RegExp(`<${tag}[^>]*>(.*?)</${tag}>`, 'i');
      m = tagRe.exec(chunk);
      if (m) {
        let content = m[1];
        if (['description', 'summary', 'content', 'content:encoded'].includes(tag.toLowerCase())) {
          content = content.replace(/<[^>]+>/g, '').trim();
        }
        return this.decodeHtmlEntities(content.trim());
      }
      return '';
    };

    const title = getField('title');
    const description = getField('description') || getField('content:encoded') || getField('summary');
    const pubDate = getField('pubDate') || getField('updated');

    let link = getField('link');
    if (!link && format === 'atom') {
      const linkMatch = chunk.match(/<link[^>]*href=["']([^"']+)["']/i);
      link = linkMatch ? linkMatch[1] : '';
    }

    return { title, link, description, pubDate };
  }

  /**
   * Fetch and parse single feed
   */
  async fetchFeed(feedUrl) {
    try {
      this.log(`📡 Fetching: ${feedUrl}`);
      const { status, data } = await this.httpGet(feedUrl);
      
      if (status !== 200) {
        this.log(`⚠️ Feed returned ${status}: ${feedUrl}`);
        return [];
      }

      const items = this.parseRSS(data);
      // Attach feedUrl to each item for later identification (e.g., Disability Bulletin)
      const itemsWithFeedUrl = items.map(item => ({ ...item, feedUrl }));
      this.log(`✅ Got ${items.length} items from ${feedUrl}`);
      return itemsWithFeedUrl;
    } catch (err) {
      this.log(`❌ Error fetching ${feedUrl}: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch all feeds
   */
  async fetchAllFeeds() {
    this.log(`📚 Fetching ${this.config.rssFeeds.length} feeds...`);
    
    const results = await Promise.all(
      this.config.rssFeeds.map((url) => this.fetchFeed(url))
    );

    this.items = results.flat();
    this.log(`📊 Total items fetched: ${this.items.length}`);
    return this.items;
  }

  /**
   * Calculate score for an item
   */
  calculateScore(item) {
    // PRIORITY: The Disability Bulletin always gets maximum score
    if (item.feedUrl && item.feedUrl.includes('feeds.blogger.com/feeds/362411661072793873')) {
      return 5.0;
    }

    let score = 0;
    const text = `${item.title} ${item.description}`.toLowerCase();

    // Critical terms (highest priority)
    for (const term of this.config.scoring.critical.terms || []) {
      if (text.includes(term.toLowerCase())) {
        score += this.config.scoring.critical.score;
      }
    }

    // High priority
    for (const term of this.config.scoring.high_priority.terms || []) {
      if (text.includes(term.toLowerCase())) {
        score += this.config.scoring.high_priority.score;
      }
    }

    // Medium priority
    for (const term of this.config.scoring.medium_priority.terms || []) {
      if (text.includes(term.toLowerCase())) {
        score += this.config.scoring.medium_priority.score;
      }
    }

    // Provincial programs
    for (const term of this.config.scoring.provincial.terms || []) {
      if (text.includes(term.toLowerCase())) {
        score += this.config.scoring.provincial.score;
      }
    }

    // Contextual (lowest priority)
    for (const term of this.config.scoring.contextual.terms || []) {
      if (text.includes(term.toLowerCase())) {
        score += this.config.scoring.contextual.score;
      }
    }

    return score;
  }

  /**
   * Score all items
   */
  scoreItems() {
    this.scoredItems = this.items.map((item) => ({
      ...item,
      score: this.calculateScore(item)
    }));

    // Sort by score descending
    this.scoredItems.sort((a, b) => b.score - a.score);
    this.log(`✅ Scored ${this.scoredItems.length} items`);
  }

  /**
   * Deduplicate items by URL
   */
  deduplicate() {
    const seen = new Set();
    const deduped = [];

    for (const item of this.scoredItems) {
      const url = item.link?.trim();
      if (url && !seen.has(url)) {
        seen.add(url);
        deduped.push(item);
      }
    }

    this.scoredItems = deduped;
    this.log(`✅ Deduplicated to ${this.scoredItems.length} unique items`);
  }

  /**
   * Filter out items that were posted in the last N days
   */
  filterPreviouslyPosted(daysToCheck = 30) {
    const postsDir = path.join(process.cwd(), '_posts');
    if (!fs.existsSync(postsDir)) {
      this.log(`⚠️ Posts directory not found: ${postsDir}`);
      return;
    }

    // Calculate cutoff date (30 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToCheck);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const previousUrls = new Set();
    
    try {
      // Get ALL daily-curation posts from the last 30 days
      const files = fs.readdirSync(postsDir)
        .filter(f => {
          if (!f.includes('daily-curation') || !f.endsWith('.md')) return false;
          
          // Extract date from filename (YYYY-MM-DD format)
          const dateMatch = f.match(/(\d{4}-\d{2}-\d{2})/);
          if (!dateMatch) return false;
          
          const fileDate = dateMatch[1];
          return fileDate >= cutoffDateStr; // Include files newer than cutoff
        })
        .sort();

      this.log(`📚 Checking ${files.length} daily curation posts from last ${daysToCheck} days for duplicates...`);

      for (const file of files) {
        const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
        // Extract URLs from markdown links [text](url)
        const urlMatches = content.matchAll(/\[Source\]\((https?:\/\/[^\)]+)\)/g);
        for (const match of urlMatches) {
          previousUrls.add(match[1].trim());
        }
      }

      this.log(`📊 Found ${previousUrls.size} unique URLs in previous ${daysToCheck} days`);

      // Filter out items with URLs that were already posted
      // EXCEPTION: Always allow The Disability Bulletin through
      const beforeCount = this.scoredItems.length;
      this.scoredItems = this.scoredItems.filter(item => {
        const url = item.link?.trim();
        const isDisabilityBulletin = item.feedUrl && item.feedUrl.includes('feeds.blogger.com/feeds/362411661072793873');
        
        // Always keep Disability Bulletin, filter others if previously posted
        if (isDisabilityBulletin) {
          return true;
        }
        return url && !previousUrls.has(url);
      });

      const filteredCount = beforeCount - this.scoredItems.length;
      this.log(`✅ Filtered out ${filteredCount} previously posted items (checked ${files.length} posts)`);
      
    } catch (err) {
      this.log(`⚠️ Error checking previous posts: ${err.message}`);
    }
  }

  /**
   * Filter items by publication date (only recent articles)
   */
  filterByDate(maxDaysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDaysOld);
    
    const beforeCount = this.scoredItems.length;
    
    this.scoredItems = this.scoredItems.filter(item => {
      if (!item.pubDate) {
        // If no pubDate, keep it (might be a government press release)
        return true;
      }

      try {
        const pubDate = new Date(item.pubDate);
        const isRecent = pubDate >= cutoffDate;
        
        if (!isRecent) {
          this.log(`🗑️ Filtering old article (${item.pubDate}): ${item.title.substring(0, 60)}...`);
        }
        
        return isRecent;
      } catch (err) {
        // If date parsing fails, keep the item
        return true;
      }
    });

    const filteredCount = beforeCount - this.scoredItems.length;
    this.log(`✅ Filtered out ${filteredCount} articles older than ${maxDaysOld} days`);
  }

  /**
   * Filter by language
   */
  filterLanguages() {
    const minScore = this.config.minScore || 2.5;
    this.selectedItems = this.scoredItems.filter((item) => {
      // Keep items above min score
      if (item.score < minScore) return false;

      // If no languages specified, keep all
      if (!this.config.languages || this.config.languages.length === 0) return true;

      // Simple language detection (check for common French words)
      const text = `${item.title} ${item.description}`.toLowerCase();
      const frenchWords = ['le', 'la', 'les', 'de', 'des', 'et', 'que', 'qui'];
      const frenchCount = frenchWords.filter((w) => text.includes(w)).length;

      // If predominantly French
      if (frenchCount >= 3 && this.config.languages.includes('fr')) return true;
      // Default to English
      if (this.config.languages.includes('en')) return true;

      return false;
    });

    // Limit to maxItems
    const max = this.config.maxItems || 25;
    this.selectedItems = this.selectedItems.slice(0, max);
    
    // ALWAYS add The Disability Bulletin at the top (static entry)
    // This ensures it appears even if the RSS feed fails
    const disabilityBulletinEntry = {
      title: 'The Disability Bulletin',
      link: 'https://linktr.ee/thedisabilitybulletin',
      description: 'Your source for disability rights news, advocacy updates, and community stories. Updated regularly with the latest developments affecting the disability community across Canada and beyond.',
      score: 10.0, // Highest score to ensure it's always first
      pubDate: new Date().toISOString(),
      feedUrl: 'static-entry',
      isDisabilityBulletin: true
    };
    
    // Add at the beginning of the array
    this.selectedItems.unshift(disabilityBulletinEntry);
    
    this.log(`✅ Selected ${this.selectedItems.length} items (including Disability Bulletin) above score ${minScore}`);
  }

  /**
   * Generate markdown output
   */
  generateMarkdown() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const lines = [
      `# Daily News Curation - ${today}`,
      '',
      `Curated ${this.selectedItems.length} items from disability, accessibility, and social policy sources.`,
      ''
    ];

    // PRIORITY: Feature The Disability Bulletin prominently at the top
    const disabilityBulletinItems = [];
    const otherItems = [];
    
    this.selectedItems.forEach((item) => {
      // Check for static entry OR RSS feed match
      if (item.isDisabilityBulletin || (item.feedUrl && (item.feedUrl.includes('feeds.blogger.com/feeds/362411661072793873') || item.feedUrl === 'static-entry'))) {
        disabilityBulletinItems.push(item);
      } else {
        otherItems.push(item);
      }
    });

    // Display Disability Bulletin items first with special highlighting
    if (disabilityBulletinItems.length > 0) {
      lines.push('## 🌟 Featured: The Disability Bulletin');
      lines.push('');
      disabilityBulletinItems.forEach((item) => {
        lines.push(`### ${item.title}`);
        if (item.description) {
          lines.push(`${item.description}`);
        }
        if (item.link) {
          lines.push(`📍 [Read More](${item.link})`);
        }
        lines.push('');
      });
      lines.push('---');
      lines.push('');
    }

    // Display other items
    if (otherItems.length > 0) {
      lines.push('## Additional Stories');
      lines.push('');
      otherItems.forEach((item, idx) => {
        lines.push(`### ${idx + 1}. ${item.title}`);
        if (item.description) {
          lines.push(`${item.description}`);
        }
        if (item.link) {
          lines.push(`📍 [Source](${item.link})`);
        }
        lines.push(`**Score:** ${item.score.toFixed(2)}`);
        lines.push('');
      });
    }

    return lines.join('\n');
  }

  /**
   * Generate JSON output
   */
  generateJSON() {
    return {
      date: format(new Date(), 'yyyy-MM-dd'),
      timestamp: new Date().toISOString(),
      count: this.selectedItems.length,
      minScore: this.config.minScore,
      items: this.selectedItems.map((item) => ({
        title: item.title,
        link: item.link,
        description: item.description,
        score: item.score,
        pubDate: item.pubDate
      }))
    };
  }

  /**
   * Save outputs
   */
  saveOutputs(outputDir = null) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const outDir = outputDir || process.cwd();

    // Create directories if needed
    const curDir = path.join(outDir, '_curation');
    const postDir = path.join(outDir, '_posts');
    const pubDir = path.join(outDir, 'public');

    [curDir, postDir, pubDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Save markdown
    const markdown = this.generateMarkdown();
    const mdPath = path.join(curDir, `${today}-curated.md`);
    fs.writeFileSync(mdPath, markdown);
    this.log(`✅ Saved markdown: ${mdPath}`);

    // Save blog post format
    const blogPost = `---
layout: post
title: "Daily News Curation - ${today}"
date: ${today}
tags: [highlights]
categories: [curation, news]
excerpt: "Today's curated disability rights, accessibility, and social policy news from across Canada."
---

${markdown}
`;
    const blogPath = path.join(postDir, `${today}-daily-curation.md`);
    fs.writeFileSync(blogPath, blogPost);
    this.log(`✅ Saved blog post: ${blogPath}`);

    // Save JSON
    const json = this.generateJSON();
    const jsonPath = path.join(pubDir, 'curation-latest.json');
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    this.log(`✅ Saved JSON API: ${jsonPath}`);

    // Also save to archive for historical data
    const archivePath = path.join(pubDir, `curation-${today}.json`);
    fs.writeFileSync(archivePath, JSON.stringify(json, null, 2));
    this.log(`✅ Saved archive: ${archivePath}`);

    return { mdPath, blogPath, jsonPath, archivePath };
  }

  /**
   * Run complete curation
   */
  async run() {
    try {
      console.log('\n🚀 Starting CURATOR-CORE v2.0 (Enhanced)\n');
      
      await this.fetchAllFeeds();
      this.scoreItems();
      
      // Filter by date first (only recent articles)
      console.log('📅 Filtering by publication date...');
      this.filterByDate(30); // Only articles from last 30 days
      
      // Apply trending topics boost
      console.log('🔥 Applying trending topics boost...');
      this.scoredItems = this.trending.applyTrendingBoosts(
        this.scoredItems, 
        this.config.scoring
      );
      
      // Apply social media trends boost
      try {
        const CuratorSocialTrends = require('./curator-social-trends.js');
        const socialTrends = new CuratorSocialTrends();
        
        this.scoredItems = this.scoredItems.map(item => {
          const text = `${item.title} ${item.description || ''}`.toLowerCase();
          let socialBoost = 1.0;
          
          // Check for emerging social topics
          socialTrends.trends.emergingTopics.forEach(topic => {
            if (text.includes(topic.keyword.toLowerCase())) {
              socialBoost = Math.max(socialBoost, socialTrends.getSocialBoost(topic.keyword));
            }
          });
          
          if (socialBoost > 1.0) {
            const oldScore = item.score;
            item.score *= socialBoost;
            this.log(`   📱 Social boost: "${item.title.substring(0, 50)}" ${oldScore.toFixed(2)} → ${item.score.toFixed(2)} (${socialBoost.toFixed(2)}x)`);
          }
          
          return item;
        });
      } catch (socialErr) {
        console.warn(`⚠️ Social trends boost skipped: ${socialErr.message}`);
      }
      
      this.deduplicate();
      
      // Filter out previously posted articles
      console.log('🔍 Checking for previously posted articles...');
      this.filterPreviouslyPosted(7); // Check last 7 days of posts
      
      this.filterLanguages();
      
      // Update trending topics tracking
      this.trending.updateFromItems(this.selectedItems, this.config.scoring);
      
      // Save core outputs
      const outputs = this.saveOutputs();
      
      // Generate RSS feed
      console.log('📡 Generating RSS feed...');
      this.rssGen.generateFromLatest();
      
      // Generate social media cards
      console.log('🎨 Generating social media cards...');
      this.imageGen.generateCards();
      
      console.log(`\n✅ CURATION COMPLETE`);
      console.log(`   Items: ${this.selectedItems.length}`);
      console.log(`   Files: Markdown, Blog Post, JSON API, RSS Feed, Social Cards`);
      console.log(`   Trending: ${this.trending.trending.currentTrending.length} keywords`);
      console.log(`\n🎯 Ready for social media posting\n`);
      
      return outputs;
    } catch (err) {
      console.error(`\n❌ CURATOR ERROR: ${err.message}\n`);
      process.exit(1);
    } finally {
      // Auto-learning: Discover new keywords from this curation
      try {
        const CuratorAutoLearn = require('./curator-auto-learn.js');
        const learner = new CuratorAutoLearn();
        
        const curationPath = path.join(process.cwd(), 'public', 'curation-latest.json');
        if (fs.existsSync(curationPath)) {
          const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
          learner.learnFromCuration(curationData);
        }
      } catch (learningErr) {
        console.warn(`⚠️ Auto-learning skipped: ${learningErr.message}`);
      }
    }
  }
}

// Run if called directly
if (require.main === module) {
  const curator = new CuratorCore();
  curator.run().catch((err) => {
    console.error(`Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = CuratorCore;
