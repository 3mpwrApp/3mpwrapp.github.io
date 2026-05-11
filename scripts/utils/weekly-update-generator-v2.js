#!/usr/bin/env node
/**
 * WEEKLY-UPDATE-GENERATOR-V2.JS
 * Generates a single weekly recap from data/weekly-queue.json.
 * Output language is plain and user-focused.
 */

const fs = require('fs');
const path = require('path');
const {
  readQueue,
  archiveQueue,
  clearQueue,
  sanitizeMessage
} = require('./weekly-queue');

class WeeklyUpdateGeneratorV2 {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    [this.postsDir].forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  mondayForIsoWeek(year, week) {
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
    const monday = new Date(week1Monday);
    monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
    return monday;
  }

  dedupeAndFilter(commits) {
    const seen = new Set();
    const noisy = /(trending keywords|social intelligence update|update .* state|daily curation|daily content article|\[skip ci\])/i;

    return commits
      .filter((c) => c && c.sha && c.message)
      .filter((c) => {
        if (seen.has(c.sha)) return false;
        seen.add(c.sha);
        return true;
      })
      .filter((c) => !noisy.test(c.message));
  }

  categorizeEntries(entries) {
    const categories = {
      features: entries.filter((e) => e.category === 'feature'),
      improvements: entries.filter((e) => e.category === 'improvement'),
      fixes: entries.filter((e) => e.category === 'fix'),
      docs: entries.filter((e) => e.category === 'docs'),
      system: entries.filter((e) => e.category === 'system')
    };

    return categories;
  }

  selectHighlights(categories) {
    const highlights = {
      features: categories.features.slice(0, 6),
      improvements: categories.improvements.slice(0, 6),
      fixes: categories.fixes.slice(0, 8),
      docs: categories.docs.slice(0, 5),
      system: categories.system.slice(0, 5)
    };

    return highlights;
  }

  audienceImpactText() {
    return [
      'This week\'s changes focus on clear access to information and reliable site behavior.',
      'For injured workers and persons with disabilities, this means less confusion and fewer broken steps.',
      'For families and advocates, this means clearer links, clearer language, and easier follow-through.',
      'For the general public, this means a more stable and transparent public record of what changed.'
    ];
  }

  generateUpdateContent(weekNumber, year, entries) {
    const categories = this.categorizeEntries(entries);
    const highlights = this.selectHighlights(categories);

    let content = '';

    content += '## Weekly Summary\n\n';
    if (entries.length === 0) {
      content += 'No major user-facing changes were queued this week. Work focused on maintenance and preparation.\n\n';
    } else {
      content += `This recap covers Week ${weekNumber} of ${year}. `;
      content += `It summarizes ${entries.length} meaningful updates in plain language.\n\n`;
    }

    content += '## Why This Matters\n\n';
    this.audienceImpactText().forEach((line) => {
      content += `- ${line}\n`;
    });
    content += '\n';

    if (highlights.features.length > 0) {
      content += '## New Features\n\n';
      highlights.features.forEach((entry) => {
        content += `- ${sanitizeMessage(entry.message)}\n`;
      });

      if (categories.features.length > highlights.features.length) {
        const remaining = categories.features.length - highlights.features.length;
        content += `- ${remaining} additional feature updates are listed in [What\'s New](/whats-new/).\n`;
      }
      content += '\n';
    }

    if (highlights.improvements.length > 0) {
      content += '## Improvements\n\n';
      highlights.improvements.forEach((entry) => {
        content += `- ${sanitizeMessage(entry.message)}\n`;
      });
      if (categories.improvements.length > highlights.improvements.length) {
        const remaining = categories.improvements.length - highlights.improvements.length;
        content += `- ${remaining} additional improvements are listed in [What\'s New](/whats-new/).\n`;
      }
      content += '\n';
    }

    if (highlights.fixes.length > 0) {
      content += '## Fixes\n\n';
      highlights.fixes.forEach((entry) => {
        content += `- ${sanitizeMessage(entry.message)}\n`;
      });
      if (categories.fixes.length > highlights.fixes.length) {
        const remaining = categories.fixes.length - highlights.fixes.length;
        content += `- ${remaining} additional fixes are listed in [What\'s New](/whats-new/).\n`;
      }
      content += '\n';
    }

    if (highlights.docs.length > 0) {
      content += '## Documentation\n\n';
      highlights.docs.forEach((entry) => {
        content += `- ${sanitizeMessage(entry.message)}\n`;
      });
      if (categories.docs.length > highlights.docs.length) {
        const remaining = categories.docs.length - highlights.docs.length;
        content += `- ${remaining} additional documentation updates are listed in [What\'s New](/whats-new/).\n`;
      }
      content += '\n';
    }

    if (highlights.system.length > 0) {
      content += '## System Operations\n\n';
      highlights.system.forEach((entry) => {
        content += `- ${sanitizeMessage(entry.message)}\n`;
      });
      content += '\n';
    }

    content += '## Links\n\n';
    content += '- [Read the live activity feed](/whats-new/)\n';
    content += '- [Read all weekly recaps](/blog/#weekly-recaps)\n';
    content += '- [Join beta testing updates](https://3mpwrapp.pages.dev/beta/)\n';

    return content;
  }

  generateWeeklyUpdate() {
    const queue = readQueue();
    const entries = this.dedupeAndFilter(queue.commits || []);
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    const monday = this.mondayForIsoWeek(year, weekNumber);
    const dateStr = monday.toISOString().split('T')[0];

    const existing = fs.readdirSync(this.postsDir)
      .find((name) => name.toLowerCase().includes(`weekly-recap-week-${String(weekNumber).padStart(2, '0')}`));
    if (existing) {
      console.log(`Weekly recap already exists for week ${weekNumber}: ${existing}`);
      return null;
    }

    const content = this.generateUpdateContent(weekNumber, year, entries);

    const postContent = `---
layout: post
title: Weekly Recap - Week ${weekNumber} (${year})
date: ${dateStr} 09:00:00 +0000
tags: [weekly, dev-recap]
categories: [weekly-recap]
content_type: weekly-recap
excerpt: Weekly progress in simple language for injured workers, persons with disabilities, families, advocates, and the public.
---

This recap explains development work in plain language and shows practical impact.

${content}
`;

    const postFilename = `${dateStr}-weekly-recap-week-${String(weekNumber).padStart(2, '0')}.md`;
    const postPath = path.join(this.postsDir, postFilename);

    fs.writeFileSync(postPath, postContent);
    console.log(`Created blog post: ${postPath}`);

    const archivePath = archiveQueue(queue.week);
    clearQueue();
    console.log(`Archived queue to: ${archivePath}`);
    
    return {
      postPath,
      title: `Weekly Recap - Week ${weekNumber} (${year})`,
      updateCount: entries.length
    };
  }
}

if (require.main === module) {
  const generator = new WeeklyUpdateGeneratorV2();
  const result = generator.generateWeeklyUpdate();

  if (result) {
    console.log('\nWeekly update generated successfully\n');
    console.log(`   Post: ${result.postPath}`);
    console.log(`   Updates: ${result.updateCount}\n`);
  } else {
    console.log('\nNo weekly update generated\n');
  }
}

module.exports = WeeklyUpdateGeneratorV2;
