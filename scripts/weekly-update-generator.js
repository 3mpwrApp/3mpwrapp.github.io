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
const viralHooks = require('./viral-hooks-config');
const siteConfig = require('./site-config');

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
   * Generate weekly update content with authentic founder storytelling
   */
  generateUpdateContent(weekNumber, year) {
    const commits = this.getRecentCommits();
    const categories = this.categorizeCommits(commits);

    let content = '';

    // OPENING: Founder voice, transparency, real-time building
    content += `## This Week's Journey\n\n`;
    content += `I'm building 3mpwrApp in public—showing you every step, every decision, every improvement as they happen. `;
    content += `This is Phase 1 of beta testing, where you're getting familiar with what I'm creating for our community.\n\n`;
    
    if (commits.length === 0) {
      content += `This week I focused on behind-the-scenes work—planning, testing, and preparing for the next wave of features. `;
      content += `Not every week has visible updates, but the foundation matters. I'm building this right, not fast.\n\n`;
    } else {
      content += `Here's what I shipped this week and why it matters to you:\n\n`;
    }

    // Features with founder storytelling
    if (categories.features.length > 0) {
      content += '## ✨ New Features\n\n';
      categories.features.forEach(commit => {
        const feature = this.humanizeCommit(commit);
        content += `**${feature}**\n\n`;
        content += `Why I built this: ${this.explainWhyItMatters(commit, 'feature')}\n\n`;
      });
    }

    // Improvements with context
    if (categories.improvements.length > 0) {
      content += '## 🚀 Improvements\n\n';
      categories.improvements.forEach(commit => {
        const improvement = this.humanizeCommit(commit);
        content += `**${improvement}**\n\n`;
        content += `${this.explainWhyItMatters(commit, 'improvement')}\n\n`;
      });
    }

    // Bug Fixes with empathy
    if (categories.fixes.length > 0) {
      content += '## 🐛 Fixes\n\n';
      content += `I fixed these issues because they were getting in your way:\n\n`;
      categories.fixes.forEach(commit => {
        const fix = this.humanizeCommit(commit);
        content += `- ${fix}\n`;
      });
      content += '\n';
    }

    // Documentation
    if (categories.documentation.length > 0) {
      content += '## 📚 Documentation\n\n';
      content += `Making 3mpwrApp easier to understand:\n\n`;
      categories.documentation.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // Behind the Scenes
    if (categories.automation.length > 0) {
      content += '## 🤖 Behind the Scenes\n\n';
      content += `These automation improvements make development faster so I can ship features to you sooner:\n\n`;
      categories.automation.forEach(commit => {
        content += `- ${this.humanizeCommit(commit)}\n`;
      });
      content += '\n';
    }

    // CLOSING: Authentic CTA
    content += `---\n\n`;
    content += `## What's Next\n\n`;
    content += `I'm listening. If you're testing 3mpwrApp and something doesn't work, tell me. `;
    content += `If you have ideas, share them. This app exists because I fell through the cracks—I'm building it so you don't have to.\n\n`;
    content += `📬 [Get updates in your inbox](/newsletter/)\n\n`;
    content += `🔍 [See all weekly updates](/whats-new/)\n\n`;
    content += `💬 [Join the beta testing community](https://3mpwrapp.pages.dev/beta/)\n`;

    return content;
  }

  /**
   * Explain why a change matters to users (founder perspective)
   */
  explainWhyItMatters(commit, type) {
    const msg = commit.message.toLowerCase();
    
    // Accessibility-related
    if (msg.includes('a11y') || msg.includes('accessibility') || msg.includes('screen reader') || msg.includes('wcag')) {
      return `Because disability tech should work for EVERYONE. If you're using a screen reader or need high contrast, this app should serve you as well as anyone else.`;
    }
    
    // Performance/speed
    if (msg.includes('performance') || msg.includes('speed') || msg.includes('optimize') || msg.includes('bundle')) {
      return `You shouldn't have to wait. The faster this app loads, the faster you get the help you need.`;
    }
    
    // Testing/quality
    if (msg.includes('test') || msg.includes('coverage')) {
      return `I'm building this to last. More tests mean fewer bugs, which means you can rely on this when it matters most.`;
    }
    
    // UI/UX
    if (msg.includes('ui') || msg.includes('ux') || msg.includes('design') || msg.includes('layout')) {
      return `When you're dealing with disability paperwork and bureaucracy, the app itself shouldn't add to your stress. It should be intuitive.`;
    }
    
    // Documentation
    if (msg.includes('doc') || msg.includes('readme') || msg.includes('guide')) {
      return `You deserve to know how everything works. Clear documentation means no guessing, no frustration.`;
    }
    
    // Bug fixes
    if (type === 'fix' || msg.includes('fix')) {
      return `When something breaks, it breaks your trust. I fix things fast because reliability matters.`;
    }
    
    // Default explanation
    if (type === 'feature') {
      return `This makes 3mpwrApp more powerful for disability advocates, injured workers, and their families.`;
    }
    
    return `Every improvement makes this app more useful for our community.`;
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

    // Jekyll permalink: pretty with categories: [updates] converts to /updates/YYYY/MM/DD/title/
    const [year_part, month, day] = dateStr.split('-');
    const articleUrl = `/updates/${year_part}/${month}/${day}/weekly-update-week-${weekNumber}/`;
    const fullUrl = `${siteConfig.url}${articleUrl}`;
    
    // Generate viral social posts for weekly recap
    const commits = this.getRecentCommits();
    const updateCount = commits.length;
    const socialPosts = this.generateSocialPosts(weekNumber, year, updateCount, fullUrl);
    
    // Save social post content
    const socialPath = path.join(process.cwd(), 'public', 'weekly-update-social.json');
    fs.writeFileSync(socialPath, JSON.stringify({
      week: weekNumber,
      year: year,
      date: dateStr,
      updateCount: updateCount,
      shortPost: socialPosts.shortPost,
      longPost: socialPosts.longPost,
      url: fullUrl,
      hookUsed: socialPosts.hookUsed
    }, null, 2));
    
    console.log(`📱 Created social post content: ${socialPath}`);
    
    return {
      postPath,
      whatsNewPath,
      title: `Weekly Update — Week ${weekNumber} (${year})`,
      url: articleUrl,
      fullUrl: fullUrl,
      excerpt: `This week's updates to 3mpwrApp features, content, and improvements.`,
      social: socialPosts
    };
  }
  
  /**
   * Generate viral social media posts for weekly recap
   */
  generateSocialPosts(weekNumber, year, updateCount, url) {
    const viralHook = viralHooks.getWeeklyHook(updateCount);
    const monthlyTheme = viralHooks.getMonthlyTheme();
    const BLOG_URL = `${siteConfig.url}/blog`;
    
    // Get random CTA
    const ctaOptions = viralHooks.CTA_LIBRARY.weekly_recap;
    const randomCta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)]
      .replace('{link}', url);
    
    // Short version for Bluesky
    const shortPost = `${viralHook}

📅 Week ${weekNumber} Recap

Your feedback is building this app. Thank you 💚

${randomCta}

#3mpwrApp #DisabilityRights #Accessibility`;
    
    // Longer version for Mastodon
    const longPost = `${viralHook}

📅 Weekly Recap — Week ${weekNumber} (${year})

Every update is driven by disabled community feedback. Nothing about us without us.

🔧 Highlights this week:
• New features based on user requests
• Accessibility improvements
• Bug fixes and stability

${randomCta}

📰 All updates: ${BLOG_URL}#weekly-recaps

#3mpwrApp #DisabilityRights #Accessibility #ChronicIllness #DisabilityJustice #${monthlyTheme.theme.replace(/\s+/g, '')}`;
    
    return {
      shortPost,
      longPost,
      hookUsed: viralHook,
      monthlyTheme: monthlyTheme.theme
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
