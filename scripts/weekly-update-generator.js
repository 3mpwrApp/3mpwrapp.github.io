#!/usr/bin/env node
/**
 * WEEKLY-UPDATE-GENERATOR.JS
 * Automatically generates weekly update posts for What's New section
 * 
 * Features:
 * - Analyzes git commits from past week
 * - Generates user-friendly summary
 * - Creates blog post in _posts/
 * - Posts to social media with article link
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class WeeklyUpdateGenerator {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.whatsNewDir = path.join(process.cwd(), '_whats_new');
    
    // Ensure directories exist
    [this.postsDir, this.whatsNewDir].forEach(dir => {
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
   * Get commits from past 7 days
   */
  getRecentCommits() {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since = sevenDaysAgo.toISOString().split('T')[0];

      const commits = execSync(
        `git log --since="${since}" --pretty=format:"%H|%s|%ad" --date=short`,
        { encoding: 'utf-8' }
      );

      if (!commits.trim()) {
        return [];
      }

      return commits.trim().split('\n').map(line => {
        const [hash, message, date] = line.split('|');
        return { hash, message, date };
      });
    } catch (err) {
      console.warn(`⚠️ Could not fetch git commits: ${err.message}`);
      return [];
    }
  }

  /**
   * Categorize commits into user-friendly updates
   */
  categorizeCommits(commits) {
    const categories = {
      features: [],
      improvements: [],
      fixes: [],
      documentation: [],
      automation: [],
      other: []
    };

    commits.forEach(commit => {
      const msg = commit.message.toLowerCase();

      if (msg.includes('feat:') || msg.includes('feature')) {
        categories.features.push(commit);
      } else if (msg.includes('fix:') || msg.includes('bug')) {
        categories.fixes.push(commit);
      } else if (msg.includes('docs:') || msg.includes('documentation')) {
        categories.documentation.push(commit);
      } else if (msg.includes('chore:') || msg.includes('automation')) {
        categories.automation.push(commit);
      } else if (msg.includes('improve') || msg.includes('enhance')) {
        categories.improvements.push(commit);
      } else {
        categories.other.push(commit);
      }
    });

    return categories;
  }

  /**
   * Generate human-readable summary from commit message
   */
  humanizeCommit(commit) {
    let msg = commit.message;

    // Remove conventional commit prefixes
    msg = msg.replace(/^(feat|fix|docs|chore|style|refactor|test|perf)(\(.+?\))?:\s*/i, '');

    // Capitalize first letter
    msg = msg.charAt(0).toUpperCase() + msg.slice(1);

    // Clean up common patterns
    msg = msg.replace(/curator/gi, 'content curator');
    msg = msg.replace(/a11y/gi, 'accessibility');
    msg = msg.replace(/auto-learn/gi, 'auto-learning');

    return msg;
  }

  /**
   * Generate weekly update content
   */
  generateUpdateContent(weekNumber, year) {
    const commits = this.getRecentCommits();
    const categories = this.categorizeCommits(commits);

    let content = '';

    // New Features
    if (categories.features.length > 0) {
      content += '## ✨ New Features\n\n';
      categories.features.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // Improvements
    if (categories.improvements.length > 0) {
      content += '## 🚀 Improvements\n\n';
      categories.improvements.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // Bug Fixes
    if (categories.fixes.length > 0) {
      content += '## 🐛 Bug Fixes\n\n';
      categories.fixes.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // Documentation
    if (categories.documentation.length > 0) {
      content += '## 📚 Documentation\n\n';
      categories.documentation.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // Automation
    if (categories.automation.length > 0) {
      content += '## 🤖 Behind the Scenes\n\n';
      categories.automation.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // No changes
    if (commits.length === 0) {
      content = `No major changes were published this week. We're working behind the scenes on upcoming features!\n\n`;
    }

    // Footer
    content += `---\n\n`;
    content += `📬 Want updates in your inbox? [Subscribe to our newsletter](/newsletter/)\n\n`;
    content += `🔍 See all updates: [What's New](/whats-new/)\n`;

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

    const content = this.generateUpdateContent(weekNumber, year);

    // Create blog post
    const postContent = `---
layout: post
title: Weekly Update — Week ${weekNumber} (${year})
date: ${dateStr} 09:00:00 +0000
tags: [weekly, updates]
categories: [updates]
excerpt: This week's updates to 3mpwrApp features, content, and improvements.
---

Here's what changed this week, in simple terms:

${content}
`;

    const postFilename = `${dateStr}-weekly-update-week-${weekNumber}.md`;
    const postPath = path.join(this.postsDir, postFilename);

    fs.writeFileSync(postPath, postContent);
    console.log(`✅ Created blog post: ${postPath}`);

    // Create What's New entry
    const whatsNewContent = `---
layout: whats_new
title: Week ${weekNumber} Updates (${year})
date: ${dateStr}
---

${content}
`;

    const whatsNewFilename = `${dateStr}-week-${weekNumber}-updates.md`;
    const whatsNewPath = path.join(this.whatsNewDir, whatsNewFilename);

    fs.writeFileSync(whatsNewPath, whatsNewContent);
    console.log(`✅ Created What's New entry: ${whatsNewPath}`);

    return {
      postPath,
      whatsNewPath,
      title: `Weekly Update — Week ${weekNumber} (${year})`,
      url: `/blog/${dateStr}-weekly-update-week-${weekNumber}/`,
      excerpt: `This week's updates to 3mpwrApp features, content, and improvements.`
    };
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new WeeklyUpdateGenerator();
  const result = generator.generateWeeklyUpdate();

  console.log('\n═══════════════════════════════════════════════════════\n');
  console.log(`📰 Weekly update generated successfully!`);
  console.log(`📝 Blog post: ${result.postPath}`);
  console.log(`🔔 What's New: ${result.whatsNewPath}`);
  console.log(`🔗 URL: ${result.url}`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

module.exports = WeeklyUpdateGenerator;
