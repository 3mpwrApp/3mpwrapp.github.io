#!/usr/bin/env node
/**
 * DAILY-FEATURE-GENERATOR.JS
 * Automatically generates daily feature spotlight articles
 * 
 * Features:
 * - Selects a feature from user-guide.md
 * - Creates detailed, factual article
 * - References user guide sections
 * - Includes examples and use cases
 * - Generates social media posts
 * - Auto-posts to Bluesky & Mastodon with article link
 */

const fs = require('fs');
const path = require('path');

class DailyFeatureGenerator {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.userGuidePath = path.join(process.cwd(), 'user-guide.md');
    this.blogUrl = 'https://3mpwrapp.pages.dev/blog/';
    
    // Feature library from user-guide.md - FACTUAL information only
    this.features = [
      {
        name: 'Energy Forecast & Smart Scheduling',
        category: 'Phase 6: ML-Powered',
        description: '24-hour energy prediction that learns your patterns and schedules notifications for optimal times',
        userGuideSection: 'energy-forecast-smart-scheduling',
        highlights: [
          '24-hour energy prediction using your actual activity patterns',
          'Personalized forecasting with advanced ML algorithms',
          'Smart notifications scheduled when you have energy',
          'Weekly wellness reports tracking energy trends',
          'Privacy-first: all predictions happen on your device'
        ],
        examples: [
          'See when you\'ll have the most energy throughout the day',
          'Get notified about important tasks during high-energy windows',
          'Track your energy patterns over time with weekly reports',
          'Receive personalized recommendations based on your energy levels'
        ],
        benefits: [
          'Better time management around your energy levels',
          'Reduce burnout by working with your body\'s rhythms',
          'Never miss important tasks due to low energy',
          'Understand your patterns to make better decisions'
        ]
      },
      {
        name: 'Disability Wizard',
        category: 'Phase 2: Personalization',
        description: 'Your personal guide that recommends the right tools at the right time based on your specific needs',
        userGuideSection: 'disability-wizard',
        highlights: [
          'Smart recommendations that learn what works for you',
          'Daily variety with fresh feature suggestions',
          'Energy-aware matching of activities to your capacity',
          'Clear explanations for why each tool is recommended',
          'Natural flows suggesting next steps after tasks'
        ],
        examples: [
          'Morning suggestion: "Try gentle stretching" when energy is low',
          'After documenting evidence: "Would you like to draft a letter?"',
          'High energy detected: "Great time to work on your appeal"',
          'Low energy day: "Focus on self-care activities today"'
        ],
        benefits: [
          'Discover features you didn\'t know existed',
          'Get help when you need it most',
          'Reduce cognitive load of deciding what to do',
          'Maximize effectiveness with personalized guidance'
        ]
      },
      {
        name: 'Master Letter Generator',
        category: 'Phase 2: Legal Tools',
        description: '22 professional letter templates for workplace accommodations, benefits applications, and appeals',
        userGuideSection: 'advocacy-tools',
        highlights: [
          '22 comprehensive letter types covering all situations',
          '6 workplace & accommodation letter templates',
          '7 benefits & disability program letter templates',
          '5 legal & appeals letter templates',
          '4 administrative & documentation letter templates',
          'Province-specific customization for all Canadian jurisdictions',
          'Built-in safety features and professional language'
        ],
        examples: [
          'Request workplace accommodations under human rights legislation',
          'Apply for disability benefits (CPP-D, ODSP, AISH, PWD)',
          'Write appeals for denied benefits or accommodations',
          'Document workplace discrimination or harassment',
          'Request medical documentation from healthcare providers'
        ],
        benefits: [
          'Save time with professional templates',
          'Use correct legal terminology and references',
          'Feel confident your letters are complete and professional',
          'Get guidance on what information to include'
        ]
      },
      {
        name: 'Evidence Locker',
        category: 'Core Feature',
        description: 'Securely store important documents with AES-256 encryption and organized categories',
        userGuideSection: 'evidence-locker',
        highlights: [
          'Enterprise-grade AES-256 encryption for all documents',
          'Organized categories: Medical, Legal, Employment, Benefits, Personal',
          'Photo scanning with automatic date stamping',
          'Document tagging and search functionality',
          'Offline access to all stored documents',
          'Export options for sharing with lawyers or representatives'
        ],
        examples: [
          'Store medical reports and doctor\'s notes securely',
          'Keep copies of denied benefit letters for appeals',
          'Document workplace incidents with photos and notes',
          'Organize employment records and accommodation requests',
          'Save correspondence with government agencies'
        ],
        benefits: [
          'Never lose important documents again',
          'Have evidence ready when you need it',
          'Organize documents for legal processes',
          'Access your documents offline anytime'
        ]
      },
      {
        name: 'Legal Workflow Automation',
        category: 'Phase 4: Legal Core',
        description: 'Step-by-step guided processes for benefits applications, appeals, and workplace accommodations',
        userGuideSection: 'legal-workflow-automation',
        highlights: [
          'Guided workflows for common legal processes',
          'Step-by-step checklist with progress tracking',
          'Deadline reminders and timeline management',
          'Document requirements listed for each step',
          'Province-specific guidance for all jurisdictions',
          'Integration with Evidence Locker and Letter Generator'
        ],
        examples: [
          'CPP Disability application: Complete guided process from start to finish',
          'Workplace accommodation request: Know exactly what steps to take',
          'Benefits appeal: Organize evidence and write effective appeal letters',
          'Human rights complaint: Understand process and gather documentation'
        ],
        benefits: [
          'Never wonder what to do next',
          'Reduce stress of navigating complex systems',
          'Ensure you don\'t miss critical steps',
          'Meet all deadlines with automated reminders'
        ]
      },
      {
        name: 'Indigenous Language Support',
        category: 'Phase 2: Cultural',
        description: 'Support for 6+ Indigenous languages with cultural protocols and sacred knowledge protection',
        userGuideSection: 'indigenous-languages',
        highlights: [
          '6+ Indigenous languages supported',
          'Cultural protocols for handling sacred knowledge',
          'Community-reviewed translations',
          'Separate storage for culturally sensitive information',
          'Respect for traditional knowledge systems',
          'Language preservation features'
        ],
        examples: [
          'Use app interface in Cree, Ojibwe, or Inuktitut',
          'Store treaty-related documents with cultural protocols',
          'Access Indigenous-specific legal resources',
          'Connect with Indigenous community members in your language'
        ],
        benefits: [
          'Access services in your language',
          'Cultural safety and respect built-in',
          'Preserve and honor traditional knowledge',
          'Connect with your community authentically'
        ]
      },
      {
        name: 'Campaign Coordination',
        category: 'Phase 3: Community',
        description: 'Organize advocacy campaigns with task management, collaboration tools, and campaign rooms',
        userGuideSection: 'campaign-coordination',
        highlights: [
          'Create and manage advocacy campaigns',
          'Private campaign rooms for team collaboration',
          'Task assignment and progress tracking',
          'Document sharing and collaborative notes',
          'Campaign templates for common advocacy goals',
          'Real-time collaboration features'
        ],
        examples: [
          'Organize petition campaign for accessibility improvements',
          'Coordinate letter-writing campaign to government',
          'Plan advocacy event with community members',
          'Track progress on systemic change initiatives',
          'Share resources and strategies with campaign team'
        ],
        benefits: [
          'Amplify your voice through collective action',
          'Stay organized with multiple campaigns',
          'Build community around shared goals',
          'Track impact of advocacy efforts'
        ]
      },
      {
        name: 'Wellness Hub',
        category: 'Core Feature',
        description: 'Comprehensive wellness tracking with mood journal, symptom tracking, and self-care resources',
        userGuideSection: 'wellness-support',
        highlights: [
          'Daily mood and energy tracking with customizable scales',
          'Symptom tracking with pattern recognition',
          'Self-care library with 50+ activities',
          'Medication tracking with reminders',
          'Sleep tracking and quality assessment',
          'Weekly wellness reports with insights'
        ],
        examples: [
          'Track pain levels and identify triggers',
          'Monitor medication effectiveness over time',
          'Log mood patterns to discuss with healthcare providers',
          'Discover self-care activities that work for you',
          'Set medication reminders so you never miss a dose'
        ],
        benefits: [
          'Better understand your health patterns',
          'Communicate effectively with healthcare providers',
          'Identify triggers and warning signs',
          'Take proactive approach to wellness'
        ]
      },
      {
        name: 'Dyslexia Support Mode',
        category: 'Accessibility',
        description: 'Comprehensive dyslexia support with 5 specialized fonts, 8 color overlays, and spacing controls',
        userGuideSection: 'settings-and-accessibility',
        highlights: [
          '5 dyslexia-friendly fonts (OpenDyslexic, Lexend, etc.)',
          '8 color overlay options to reduce visual stress',
          'Adjustable letter spacing, line height, and word spacing',
          'Line focus mode highlighting current line',
          'Reading ruler for tracking lines',
          'Simplified layout options'
        ],
        examples: [
          'Choose OpenDyslexic font for easier reading',
          'Apply blue overlay to reduce eye strain',
          'Increase letter spacing for better letter distinction',
          'Use reading ruler to stay focused on current line',
          'Enable line focus mode for complex documents'
        ],
        benefits: [
          'Read comfortably without fatigue',
          'Reduce errors from letter confusion',
          'Customize display to your specific needs',
          'Access all features without barriers'
        ]
      },
      {
        name: 'Motor Accessibility Features',
        category: 'Accessibility',
        description: 'Dwell-click, large touch targets, tremor compensation, and switch navigation support',
        userGuideSection: 'settings-and-accessibility',
        highlights: [
          'Dwell-click: activate buttons by hovering',
          'Adjustable dwell time (0.5-3.0 seconds)',
          'Extra-large touch targets for easier tapping',
          'Tremor compensation smoothing unintended movements',
          'Switch navigation for single-switch users',
          'Voice control compatibility'
        ],
        examples: [
          'Use dwell-click to navigate without tapping',
          'Increase touch target size for easier use with tremors',
          'Enable tremor compensation for precise selections',
          'Navigate entire app with single switch',
          'Control app with voice commands'
        ],
        benefits: [
          'Full app access regardless of motor ability',
          'Reduce frustration from missed taps',
          'Use app independently without assistance',
          'Customize controls to match your abilities'
        ]
      }
    ];

    // Track which features have been written about
    this.usedFeaturesPath = path.join(process.cwd(), 'public', 'used-features.json');
    this.usedFeatures = this.loadUsedFeatures();
  }

  loadUsedFeatures() {
    if (fs.existsSync(this.usedFeaturesPath)) {
      try {
        return JSON.parse(fs.readFileSync(this.usedFeaturesPath, 'utf-8'));
      } catch {
        return { features: [], lastReset: new Date().toISOString() };
      }
    }
    return { features: [], lastReset: new Date().toISOString() };
  }

  saveUsedFeatures() {
    fs.writeFileSync(this.usedFeaturesPath, JSON.stringify(this.usedFeatures, null, 2));
  }

  /**
   * Select next feature to write about (rotating through all features)
   */
  selectFeature() {
    // Reset if we've covered all features
    if (this.usedFeatures.features.length >= this.features.length) {
      console.log('✨ All features covered! Starting new rotation.');
      this.usedFeatures = {
        features: [],
        lastReset: new Date().toISOString()
      };
    }

    // Find features not yet used
    const availableFeatures = this.features.filter(
      f => !this.usedFeatures.features.includes(f.name)
    );

    // Select one (can be random or sequential)
    const selected = availableFeatures[0];
    
    // Mark as used
    this.usedFeatures.features.push(selected.name);
    this.saveUsedFeatures();

    return selected;
  }

  /**
   * Generate article content
   */
  generateArticleContent(feature) {
    const dateStr = new Date().toISOString().split('T')[0];
    
    let content = `---
layout: post
title: "Feature Spotlight: ${feature.name}"
date: ${dateStr} 09:00:00 +0000
tags: [features, spotlight, ${feature.category.toLowerCase().replace(/\s+/g, '-')}]
categories: [features]
excerpt: ${feature.description}
---

# Feature Spotlight: ${feature.name}

**Category:** ${feature.category}

${feature.description}

---

## What Is ${feature.name}?

${feature.name} is designed to ${feature.description.toLowerCase()}. This feature is part of 3mpwrApp's commitment to providing comprehensive tools for people with disabilities, injured workers, and their supporters across Canada.

---

## Key Highlights

`;

    feature.highlights.forEach(highlight => {
      content += `- **${highlight}**\n`;
    });

    content += `\n---\n\n## How It Works\n\n`;
    content += `Here are real examples of how you can use ${feature.name}:\n\n`;

    feature.examples.forEach((example, index) => {
      content += `${index + 1}. ${example}\n`;
    });

    content += `\n---\n\n## Why ${feature.name} Matters\n\n`;

    feature.benefits.forEach(benefit => {
      content += `- ${benefit}\n`;
    });

    content += `\n---\n\n## Getting Started\n\n`;
    content += `Ready to try ${feature.name}? Here's how to get started:\n\n`;
    content += `1. **Download the app** - Available on iOS and Android (coming soon)\n`;
    content += `2. **Complete setup** - Takes just 5 minutes\n`;
    content += `3. **Find the feature** - Look for "${feature.name}" in your app\n`;
    content += `4. **Follow the guide** - In-app tutorials walk you through each step\n\n`;

    content += `---\n\n## Learn More\n\n`;
    content += `For complete information about ${feature.name} and all other features:\n\n`;
    content += `- 📖 [Read the Complete User Guide](/user-guide/#${feature.userGuideSection})\n`;
    content += `- ✨ [Explore All Features](/features/)\n`;
    content += `- 🧪 [Join Beta Testing](/beta/)\n`;
    content += `- 📬 [Subscribe to Updates](/newsletter/)\n\n`;

    content += `---\n\n## About 3mpwrApp\n\n`;
    content += `3mpwrApp is a community-driven platform built for injured workers and persons with disabilities across Canada. We provide practical tools, community support, and advocacy resources—all designed with accessibility, privacy, and cultural respect at the core.\n\n`;
    content += `**All features are:**\n`;
    content += `- ✅ Fully accessible (WCAG 2.2 AA+)\n`;
    content += `- 🔒 Privacy-first (local-first architecture)\n`;
    content += `- 🇨🇦 Canadian-focused (all provinces/territories)\n`;
    content += `- 🌍 Culturally inclusive (Indigenous languages supported)\n`;

    return content;
  }

  /**
   * Generate social media post content
   */
  generateSocialPost(feature, articleUrl) {
    // Use blog URL for all social media posts as per requirements
    const blogUrl = this.blogUrl;
    
    // Short version for Twitter/Bluesky (< 280 chars with link)
    const shortPost = `🌟 Feature Spotlight: ${feature.name}

${feature.description}

Learn more: ${blogUrl}

#Disability #Accessibility #DisabilityRights`;

    // Longer version for Mastodon (500 chars)
    const longPost = `🌟 Feature Spotlight: ${feature.name}

${feature.description}

Key highlights:
${feature.highlights.slice(0, 2).map(h => `✓ ${h}`).join('\n')}

Perfect for anyone needing ${feature.category.toLowerCase()} support!

Read the full article: ${blogUrl}

#Disability #Accessibility #DisabilityRights #DisabilityJustice #A11y`;

    return { shortPost, longPost, url: blogUrl };
  }

  /**
   * Generate daily feature article
   */
  generateDailyFeature() {
    console.log('\n🌟 Generating Daily Feature Spotlight\n');

    const feature = this.selectFeature();
    console.log(`📝 Selected feature: ${feature.name}`);

    const dateStr = new Date().toISOString().split('T')[0];
    const slug = feature.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const filename = `${dateStr}-feature-spotlight-${slug}.md`;
    const filepath = path.join(this.postsDir, filename);

    const content = this.generateArticleContent(feature);
    fs.writeFileSync(filepath, content);

    console.log(`✅ Created article: ${filepath}`);

    // Generate social posts
    // Jekyll permalink: pretty converts YYYY-MM-DD-title.md to /YYYY/MM/DD/title/
    const [year, month, day] = dateStr.split('-');
    const articleUrl = `/${year}/${month}/${day}/feature-spotlight-${slug}/`;
    const social = this.generateSocialPost(feature, articleUrl);

    // Save social post content for posting script
    const socialPath = path.join(process.cwd(), 'public', 'daily-feature-social.json');
    fs.writeFileSync(socialPath, JSON.stringify({
      feature: feature.name,
      date: dateStr,
      shortPost: social.shortPost,
      longPost: social.longPost,
      url: social.url,
      articlePath: filepath
    }, null, 2));

    console.log(`📱 Created social post content: ${socialPath}`);

    return {
      feature: feature.name,
      filepath,
      articleUrl,
      social
    };
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new DailyFeatureGenerator();
  const result = generator.generateDailyFeature();

  console.log('\n═══════════════════════════════════════════════════════\n');
  console.log(`🌟 Daily feature article generated!`);
  console.log(`📝 Feature: ${result.feature}`);
  console.log(`📄 Article: ${result.filepath}`);
  console.log(`🔗 URL: ${result.articleUrl}`);
  console.log(`\n📱 Social post ready for auto-posting`);
  console.log('\n═══════════════════════════════════════════════════════\n');
}

module.exports = DailyFeatureGenerator;
