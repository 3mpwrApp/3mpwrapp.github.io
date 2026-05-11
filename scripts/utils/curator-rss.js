#!/usr/bin/env node
/**
 * CURATOR-RSS.JS
 * RSS feed generator for curated content
 * 
 * Features:
 * - Generate RSS 2.0 compliant feed
 * - Include all curated items
 * - Support for categories and tags
 * - Daily updates
 */

const fs = require('fs');
const path = require('path');

class CuratorRSS {
  constructor() {
    this.siteUrl = 'https://3mpwrapp.pages.dev';
    this.feedPath = path.join(process.cwd(), 'public', 'feeds', 'curated.xml');
  }

  /**
   * Escape XML special characters
   */
  escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Generate RSS feed from curated content
   */
  generateFeed(curationData) {
    const now = new Date();
    const rfc822Date = now.toUTCString();

    let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
    rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n';
    rss += '  <channel>\n';
    rss += `    <title>3mpwr App - Curated Disability News</title>\n`;
    rss += `    <link>${this.siteUrl}/blog/</link>\n`;
    rss += `    <atom:link href="${this.siteUrl}/feeds/curated.xml" rel="self" type="application/rss+xml" />\n`;
    rss += `    <description>Daily curated news on disability rights, accessibility, and benefits across Canada</description>\n`;
    rss += `    <language>en-ca</language>\n`;
    rss += `    <lastBuildDate>${rfc822Date}</lastBuildDate>\n`;
    rss += `    <pubDate>${rfc822Date}</pubDate>\n`;
    rss += `    <generator>3mpwr App Curator v2.0</generator>\n`;
    rss += `    <image>\n`;
    rss += `      <url>${this.siteUrl}/assets/images/logo.png</url>\n`;
    rss += `      <title>3mpwr App</title>\n`;
    rss += `      <link>${this.siteUrl}</link>\n`;
    rss += `    </image>\n`;
    rss += `    <category>Disability Rights</category>\n`;
    rss += `    <category>Accessibility</category>\n`;
    rss += `    <category>Social Policy</category>\n`;
    rss += `    <category>Benefits</category>\n\n`;

    // Add items
    if (curationData && curationData.items) {
      curationData.items.forEach(item => {
        rss += '    <item>\n';
        rss += `      <title>${this.escapeXml(item.title)}</title>\n`;
        rss += `      <link>${this.escapeXml(item.link)}</link>\n`;
        rss += `      <guid isPermaLink="true">${this.escapeXml(item.link)}</guid>\n`;
        
        if (item.description) {
          rss += `      <description><![CDATA[${item.description}]]></description>\n`;
        }
        
        if (item.pubDate) {
          const pubDate = new Date(item.pubDate);
          if (!isNaN(pubDate.getTime())) {
            rss += `      <pubDate>${pubDate.toUTCString()}</pubDate>\n`;
          }
        }
        
        if (item.source) {
          rss += `      <source url="${this.escapeXml(item.sourceUrl || '')}">${this.escapeXml(item.source)}</source>\n`;
        }

        // Add categories based on score/keywords
        if (item.score >= 4.0) {
          rss += `      <category>Critical</category>\n`;
        } else if (item.score >= 3.0) {
          rss += `      <category>High Priority</category>\n`;
        }

        rss += `      <dc:creator>3mpwr App Curator</dc:creator>\n`;
        rss += '    </item>\n\n';
      });
    }

    rss += '  </channel>\n';
    rss += '</rss>\n';

    return rss;
  }

  /**
   * Save RSS feed to file
   */
  saveFeed(content) {
    try {
      // Ensure feeds directory exists
      const feedsDir = path.dirname(this.feedPath);
      if (!fs.existsSync(feedsDir)) {
        fs.mkdirSync(feedsDir, { recursive: true });
      }

      fs.writeFileSync(this.feedPath, content, 'utf8');
      console.log(`✅ RSS feed saved to ${this.feedPath}`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to save RSS feed: ${err.message}`);
      return false;
    }
  }

  /**
   * Generate and save RSS feed from latest curation
   */
  generateFromLatest() {
    try {
      const latestPath = path.join(process.cwd(), 'public', 'curation-latest.json');
      
      if (!fs.existsSync(latestPath)) {
        console.error('❌ No curation data found at:', latestPath);
        return false;
      }

      const curationData = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
      console.log(`📰 Generating RSS feed for ${curationData.count} items from ${curationData.date}`);

      const rssContent = this.generateFeed(curationData);
      return this.saveFeed(rssContent);
    } catch (err) {
      console.error(`❌ RSS generation failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Generate feed info page
   */
  generateFeedInfoPage() {
    const infoPath = path.join(process.cwd(), 'feeds', 'index.md');
    const content = `---
layout: default
title: RSS Feeds
description: Subscribe to 3mpwr App's curated disability news and updates
---

# RSS Feeds

Subscribe to our RSS feeds to get the latest curated content delivered directly to your feed reader.

---

## 📰 Curated News Feed

**Daily curated news** on disability rights, accessibility, benefits, and social policy across Canada.

- **Feed URL:** <{{ site.url }}/feeds/curated.xml>
- **Update Frequency:** 3 times daily (9 AM, 3 PM, 9 PM UTC)
- **Content:** Top 25-30 stories from 26+ trusted sources
- **Categories:** Disability Rights, Accessibility, Benefits, Social Policy

### How to Subscribe

1. **Copy the feed URL:** \`{{ site.url }}/feeds/curated.xml\`
2. **Open your RSS reader** (Feedly, Inoreader, NewsBlur, etc.)
3. **Add new feed** and paste the URL
4. **Done!** You'll receive updates automatically

---

## 🔧 Recommended RSS Readers

### Desktop & Mobile
- **[Feedly](https://feedly.com/)** - Popular, feature-rich
- **[Inoreader](https://www.inoreader.com/)** - Power user features
- **[NewsBlur](https://newsblur.com/)** - Social features
- **[The Old Reader](https://theoldreader.com/)** - Simple and clean

### Browser Extensions
- **[Feedbro](https://nodetics.com/feedbro/)** - Chrome/Firefox/Edge
- **[RSS Feed Reader](https://chrome.google.com/webstore/detail/rss-feed-reader/)** - Chrome

### Accessibility-Focused
- **Email subscriptions** - Many readers support email delivery
- **Screen reader compatible** - Most web-based readers work well
- **Keyboard shortcuts** - Available in most desktop readers

---

## 📊 Feed Information

- **Format:** RSS 2.0 (widely compatible)
- **Encoding:** UTF-8
- **Namespace Support:** Dublin Core, Atom
- **Full Text:** Descriptions and summaries included
- **Source Attribution:** Original source credited

---

## 🌐 Coming Soon

- **Weekly Digest Feed** - Summary of top stories each week
- **Blog Updates Feed** - Original content from 3mpwr App
- **Filtered Feeds** - By province, topic, or priority level

---

## ❓ Need Help?

Having trouble subscribing? [Contact us](/contact/) and we'll help you get set up!

**Privacy Note:** RSS feeds are privacy-friendly - no tracking, no cookies, no data collection.
`;

    try {
      const feedsDir = path.join(process.cwd(), 'feeds');
      if (!fs.existsSync(feedsDir)) {
        fs.mkdirSync(feedsDir, { recursive: true });
      }

      fs.writeFileSync(infoPath, content, 'utf8');
      console.log(`✅ Feed info page saved to ${infoPath}`);
      return true;
    } catch (err) {
      console.error(`❌ Failed to create feed info page: ${err.message}`);
      return false;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const rssGen = new CuratorRSS();
  console.log('\n📡 RSS FEED GENERATOR\n');
  
  const feedSuccess = rssGen.generateFromLatest();
  const pageSuccess = rssGen.generateFeedInfoPage();
  
  if (feedSuccess && pageSuccess) {
    console.log('\n✅ RSS feed and info page generated successfully!\n');
    console.log('📰 Feed: /feeds/curated.xml');
    console.log('📄 Info: /feeds/\n');
  } else {
    console.error('\n❌ Some tasks failed. Check errors above.\n');
    process.exit(1);
  }
}

module.exports = CuratorRSS;
