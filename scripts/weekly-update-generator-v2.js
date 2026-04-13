#!/usr/bin/env node
/**
 * WEEKLY-UPDATE-GENERATOR-V2.JS
 * Generates weekly update posts from unified What's New JSON data
 * 
 * Improvements over v1:
 * - Uses unified JSON data (same source as app/website What's New)
 * - Consistent categorization and messaging
 * - Highlights curated top changes (not everything)
 * - Links to What's New page for complete list
 */

const fs = require('fs');
const path = require('path');

class WeeklyUpdateGeneratorV2 {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.publicDir = path.join(__dirname, '../public');
    
    // Ensure directories exist
    [this.postsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Get ISO week number
   */
  getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /**
   * Load unified What's New JSON data
   */
  loadWhatsNewData() {
    const currentYear = new Date().getFullYear();
    const dataPath = path.join(this.publicDir, `whatsnew-${currentYear}.json`);
    
    if (!fs.existsSync(dataPath)) {
      console.warn(`⚠️ Could not find ${dataPath}`);
      return null;
    }
    
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  }

  /**
   * Get entries from past 7 days
   */
  getRecentEntries(data) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return data.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= sevenDaysAgo;
    });
  }

  /**
   * Group entries by category
   */
  categorizeEntries(entries) {
    const categories = {
      features: entries.filter(e => e.category === 'feature'),
      improvements: entries.filter(e => e.category === 'improvement'),
      fixes: entries.filter(e => e.category === 'fix'),
      docs: entries.filter(e => e.category === 'docs')
    };
    
    return categories;
  }

  /**
   * Select top entries for blog post (curated highlights, not everything)
   */
  selectHighlights(categories) {
    const highlights = {
      features: categories.features.slice(0, 5), // Top 5 features
      improvements: categories.improvements.slice(0, 3), // Top 3 improvements
      fixes: categories.fixes.slice(0, 3), // Top 3 fixes
      docs: categories.docs.slice(0, 2) // Top 2 docs
    };
    
    return highlights;
  }

  /**
   * Explain why a change matters to users (founder perspective)
   */
  explainWhyItMatters(entry) {
    const title = entry.title.toLowerCase();
    const summary = entry.summary.toLowerCase();
    
    // Accessibility-related
    if (title.includes('accessibility') || title.includes('screen reader') || summary.includes('wcag')) {
      return `Because disability tech should work for EVERYONE. If you're using a screen reader or need high contrast, this app should serve you as well as anyone else.`;
    }
    
    // Performance/speed
    if (title.includes('performance') || title.includes('speed') || title.includes('faster') || title.includes('bundle')) {
      return `You shouldn't have to wait. The faster this app loads, the faster you get the help you need.`;
    }
    
    // Testing/quality
    if (title.includes('test') || title.includes('coverage')) {
      return `I'm building this to last. More tests mean fewer bugs, which means you can rely on this when it matters most.`;
    }
    
    // UI/UX
    if (title.includes('ui') || title.includes('design') || title.includes('layout') || title.includes('interface')) {
      return `When you're dealing with disability paperwork and bureaucracy, the app itself shouldn't add to your stress. It should be intuitive.`;
    }
    
    // Documentation
    if (entry.category === 'docs') {
      return `You deserve to know how everything works. Clear documentation means no guessing, no frustration.`;
    }
    
    // Bug fixes
    if (entry.category === 'fix') {
      return `When something breaks, it breaks your trust. I fix things fast because reliability matters.`;
    }
    
    // Features
    if (entry.category === 'feature') {
      return `This makes 3mpwrApp more powerful for disability advocates, injured workers, and their families.`;
    }
    
    return `Every improvement makes this app more useful for our community.`;
  }

  /**
   * Generate weekly update content with authentic founder storytelling
   */
  generateUpdateContent(weekNumber, year, entries) {
    const categories = this.categorizeEntries(entries);
    const highlights = this.selectHighlights(categories);
    
    let content = '';

    // OPENING: Founder voice, transparency, real-time building
    content += `## This Week's Journey\n\n`;
    content += `I'm building 3mpwrApp in public—showing you every step, every decision, every improvement as they happen. `;
    content += `This is Phase 1 of beta testing, where you're getting familiar with what I'm creating for our community.\n\n`;
    
    if (entries.length === 0) {
      content += `This week I focused on behind-the-scenes work—planning, testing, and preparing for the next wave of features. `;
      content += `Not every week has visible updates, but the foundation matters. I'm building this right, not fast.\n\n`;
    } else {
      content += `Here's what I shipped this week (${entries.length} total updates—highlighting the biggest changes below):\n\n`;
    }

    // Features with founder storytelling
    if (highlights.features.length > 0) {
      content += '## ✨ New Features\n\n';
      highlights.features.forEach(entry => {
        content += `**${entry.title}**\n\n`;
        content += `${entry.summary}\n\n`;
        content += `Why I built this: ${this.explainWhyItMatters(entry)}\n\n`;
      });
      
      if (categories.features.length > highlights.features.length) {
        const remaining = categories.features.length - highlights.features.length;
        content += `*Plus ${remaining} more feature updates—[see complete list](/whats-new/)*\n\n`;
      }
    }

    // Improvements with context
    if (highlights.improvements.length > 0) {
      content += '## 🚀 Improvements\n\n';
      highlights.improvements.forEach(entry => {
        content += `**${entry.title}**\n\n`;
        content += `${entry.summary}\n\n`;
        content += `${this.explainWhyItMatters(entry)}\n\n`;
      });
      
      if (categories.improvements.length > highlights.improvements.length) {
        const remaining = categories.improvements.length - highlights.improvements.length;
        content += `*Plus ${remaining} more improvements—[see complete list](/whats-new/)*\n\n`;
      }
    }

    // Bug Fixes with empathy
    if (highlights.fixes.length > 0) {
      content += '## 🐛 Fixes\n\n';
      content += `I fixed these issues because they were getting in your way:\n\n`;
      highlights.fixes.forEach(entry => {
        content += `- **${entry.title}**: ${entry.summary}\n`;
      });
      
      if (categories.fixes.length > highlights.fixes.length) {
        const remaining = categories.fixes.length - highlights.fixes.length;
        content += `\n*Plus ${remaining} more fixes—[see complete list](/whats-new/)*\n`;
      }
      content += '\n';
    }

    // Documentation
    if (highlights.docs.length > 0) {
      content += '## 📚 Documentation\n\n';
      content += `Making 3mpwrApp easier to understand:\n\n`;
      highlights.docs.forEach(entry => {
        content += `- **${entry.title}**: ${entry.summary}\n`;
      });
      
      if (categories.docs.length > highlights.docs.length) {
        const remaining = categories.docs.length - highlights.docs.length;
        content += `\n*Plus ${remaining} more documentation updates*\n`;
      }
      content += '\n';
    }

    // CLOSING: Authentic CTA
    content += `---\n\n`;
    content += `## What's Next\n\n`;
    content += `I'm listening. If you're testing 3mpwrApp and something doesn't work, tell me. `;
    content += `If you have ideas, share them. This app exists because I fell through the cracks—I'm building it so you don't have to.\n\n`;
    content += `🔍 [See ALL ${entries.length} updates from this week](/whats-new/)\n\n`;
    content += `📬 [Get updates in your inbox](/newsletter/)\n\n`;
    content += `💬 [Join the beta testing community](https://3mpwrapp.pages.dev/beta/)\n`;

    return content;
  }

  /**
   * Generate weekly update post
   */
  generateWeeklyUpdate() {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    const dateStr = now.toISOString().split('T')[0];

    console.log(`\n📝 Generating Weekly Update - Week ${weekNumber} (${year})\n`);

    // Load data from unified JSON
    const data = this.loadWhatsNewData();
    if (!data) {
      console.error('❌ Could not load What\'s New data');
      return null;
    }

    const entries = this.getRecentEntries(data);
    console.log(`✅ Found ${entries.length} updates from past 7 days`);

    const content = this.generateUpdateContent(weekNumber, year, entries);

    // Create blog post
    const postContent = `---
layout: post
title: Week ${weekNumber} — Building 3mpwrApp in the Open
date: ${dateStr} 09:00:00 +0000
tags: [weekly, updates, transparency]
categories: [updates]
excerpt: This week's progress on 3mpwrApp. Real-time updates from a founder who fell through the cracks and built this app so you don't have to.
---

I'm an injured worker who built 3mpwrApp because I fell through the cracks. Every week, I share what I'm building and why it matters to you.

This is **Week ${weekNumber} of ${year}**—here's what happened:

${content}
`;

    const postFilename = `${dateStr}-weekly-update-week-${weekNumber}.md`;
    const postPath = path.join(this.postsDir, postFilename);

    fs.writeFileSync(postPath, postContent);
    console.log(`✅ Created blog post: ${postPath}`);

    // Save metadata for social posting
    const socialPath = path.join(this.publicDir, 'weekly-update-social.json');
    fs.writeFileSync(socialPath, JSON.stringify({
      week: weekNumber,
      year: year,
      date: dateStr,
      updateCount: entries.length,
      url: `https://3mpwrapp.github.io/updates/${year}/${dateStr.split('-')[1]}/${dateStr.split('-')[2]}/weekly-update-week-${weekNumber}/`
    }, null, 2));
    
    console.log(`📱 Created social post metadata: ${socialPath}`);
    
    return {
      postPath,
      title: `Weekly Update — Week ${weekNumber} (${year})`,
      updateCount: entries.length
    };
  }
}

// Main execution
if (require.main === module) {
  const generator = new WeeklyUpdateGeneratorV2();
  const result = generator.generateWeeklyUpdate();
  
  if (result) {
    console.log('\n✅ Weekly update generated successfully!\n');
    console.log(`   Post: ${result.postPath}`);
    console.log(`   Updates: ${result.updateCount}\n`);
  } else {
    console.error('\n❌ Failed to generate weekly update\n');
    process.exit(1);
  }
}

module.exports = WeeklyUpdateGeneratorV2;
