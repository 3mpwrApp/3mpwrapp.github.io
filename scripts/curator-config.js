#!/usr/bin/env node
/**
 * CURATOR-CONFIG.JS
 * Centralized configuration manager for curator system
 * 
 * Features:
 * - Single source of truth (curator.json)
 * - Environment variable overrides
 * - Validation and defaults
 * - Clear documentation
 */

const fs = require('fs');
const path = require('path');

class CuratorConfig {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), '_data', 'curator.json');
    this.config = this.loadAndValidate();
  }

  /**
   * Load configuration from file
   */
  loadAndValidate() {
    const defaults = {
      version: '2.0',
      schedule: {
        timezone: 'UTC',
        time: '09:00',
        description: '9:00 AM UTC (5:00 AM EST, 6:00 AM EDT)',
        cron: '0 9 * * *'
      },
      curation: {
        minScore: 2.5,
        maxItems: 25,
        languages: ['en', 'fr'],
        rssFeeds: [],
        scoring: {
          critical: { score: 4.0, terms: [] },
          high_priority: { score: 3.0, terms: [] },
          medium_priority: { score: 2.0, terms: [] },
          provincial: { score: 2.5, terms: [] },
          contextual: { score: 1.0, terms: [] }
        }
      },
      posting: {
        enabled: true,
        platforms: {
          mastodon: {
            enabled: true,
            visibility: 'public',
            instance: 'mastodon.social'
          },
          bluesky: {
            enabled: true,
            threadFormat: false
          },
          x: {
            enabled: true
          }
        }
      }
    };

    let fileConfig = {};

    if (fs.existsSync(this.configPath)) {
      try {
        fileConfig = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      } catch (err) {
        console.warn(`⚠️ Config parse error: ${err.message}, using defaults`);
      }
    }

    // Merge with overrides
    const config = this.deepMerge(defaults, fileConfig);
    return config;
  }

  /**
   * Deep merge objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        output[key] = source[key];
      }
    }
    return output;
  }

  /**
   * Get curation config
   */
  getCurationConfig() {
    // Apply environment overrides
    return {
      ...this.config.curation,
      minScore: parseFloat(process.env.MIN_SCORE) || this.config.curation.minScore,
      maxItems: parseInt(process.env.MAX_ITEMS) || this.config.curation.maxItems,
      forcePublish: process.env.FORCE_PUBLISH === '1'
    };
  }

  /**
   * Get posting config
   */
  getPostingConfig() {
    return {
      ...this.config.posting,
      platforms: {
        mastodon: {
          ...this.config.posting.platforms.mastodon,
          instance: process.env.MASTO_INSTANCE || this.config.posting.platforms.mastodon.instance,
          enabled: !!process.env.MASTO_TOKEN
        },
        bluesky: {
          ...this.config.posting.platforms.bluesky,
          enabled: !!process.env.BLUESKY_HANDLE && !!process.env.BLUESKY_PASSWORD,
          threadFormat: process.env.BLUESKY_THREAD === '1'
        },
        x: {
          ...this.config.posting.platforms.x,
          enabled: !!process.env.X_BEARER_TOKEN
        }
      }
    };
  }

  /**
   * Get schedule config
   */
  getScheduleConfig() {
    return this.config.schedule;
  }

  /**
   * Validate configuration
   */
  validate() {
    const errors = [];

    if (!this.config.curation.rssFeeds || this.config.curation.rssFeeds.length === 0) {
      errors.push('No RSS feeds configured');
    }

    if (!this.config.curation.scoring.high_priority?.terms || this.config.curation.scoring.high_priority.terms.length === 0) {
      errors.push('No high priority keywords configured');
    }

    const postingConfig = this.getPostingConfig();
    const enabledPlatforms = Object.values(postingConfig.platforms).filter((p) => p.enabled);

    if (postingConfig.enabled && enabledPlatforms.length === 0) {
      console.warn('⚠️ Posting enabled but no platforms configured');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get full config
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get RSS feeds
   */
  getRSSFeeds() {
    return this.config.curation.rssFeeds || [];
  }

  /**
   * Get scoring rules
   */
  getScoringRules() {
    return this.config.curation.scoring || {};
  }

  /**
   * Print config summary
   */
  printSummary() {
    console.log('\n📋 CURATOR CONFIGURATION\n');

    console.log(`Schedule: ${this.config.schedule.description}`);
    console.log(`Cron: ${this.config.schedule.cron}`);

    const curation = this.getCurationConfig();
    console.log(`\nCuration:`);
    console.log(`  Min Score: ${curation.minScore}`);
    console.log(`  Max Items: ${curation.maxItems}`);
    console.log(`  Languages: ${curation.languages.join(', ')}`);
    console.log(`  RSS Feeds: ${this.config.curation.rssFeeds.length}`);

    const posting = this.getPostingConfig();
    console.log(`\nPosting:`);
    console.log(`  Enabled: ${posting.enabled}`);
    Object.entries(posting.platforms).forEach(([platform, config]) => {
      console.log(`    ${platform}: ${config.enabled ? '✅' : '❌'}`);
    });

    const validation = this.validate();
    console.log(`\nValidation:`);
    console.log(`  Status: ${validation.valid ? '✅ Valid' : '❌ Invalid'}`);
    if (validation.errors.length > 0) {
      validation.errors.forEach((err) => console.log(`  - ${err}`));
    }

    console.log('');
  }
}

// CLI interface
if (require.main === module) {
  const config = new CuratorConfig();

  const command = process.argv[2];

  switch (command) {
    case 'validate':
      const validation = config.validate();
      if (!validation.valid) {
        console.log('❌ Configuration invalid:');
        validation.errors.forEach((err) => console.log(`  - ${err}`));
        process.exit(1);
      } else {
        console.log('✅ Configuration valid');
      }
      break;

    case 'summary':
      config.printSummary();
      break;

    case 'json':
      console.log(JSON.stringify(config.getConfig(), null, 2));
      break;

    case 'curation':
      console.log(JSON.stringify(config.getCurationConfig(), null, 2));
      break;

    case 'posting':
      console.log(JSON.stringify(config.getPostingConfig(), null, 2));
      break;

    case 'feeds':
      console.log('RSS Feeds:');
      config.getRSSFeeds().forEach((feed, idx) => {
        console.log(`  ${idx + 1}. ${feed}`);
      });
      break;

    default:
      console.log(`Usage: node curator-config.js [command]`);
      console.log(`Commands:`);
      console.log(`  validate - Validate configuration`);
      console.log(`  summary  - Print configuration summary`);
      console.log(`  json     - Print full config as JSON`);
      console.log(`  curation - Print curation settings`);
      console.log(`  posting  - Print posting settings`);
      console.log(`  feeds    - List RSS feeds`);
      process.exit(1);
  }
}

module.exports = CuratorConfig;
