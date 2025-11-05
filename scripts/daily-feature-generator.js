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
    
    // Feature library - Phase 1 Beta + Website Features  
    // NOTE: App is in Phase 1 closed beta (no users yet), so examples reflect beta testing status
    this.features = [
      // === WEBSITE & BLOG FEATURES (Currently Live) ===
      {
        name: 'Comprehensive Blog & News Curation',
        category: 'Website: Content',
        description: 'Daily curated disability news from 26+ Canadian sources, feature spotlights, and weekly updates',
        userGuideSection: 'blog',
        highlights: [
          'Automated curation from 26+ trusted Canadian news sources',
          '3 daily posts (morning, midday, evening) on Mastodon, Bluesky, and X',
          'Weekly summary posts collecting the week\'s highlights',
          'Feature spotlight articles published daily',
          'RSS feed for easy subscription and updates'
        ],
        examples: [
          'Read today\'s curated disability policy news at https://3mpwrapp.pages.dev/blog/',
          'Subscribe to RSS feed for automatic updates on new posts',
          'Check out daily feature spotlights explaining each app capability',
          'Follow us on Mastodon/Bluesky/X for quick news updates 3x daily'
        ],
        benefits: [
          'Stay informed about disability rights and policy changes',
          'Save time with pre-curated, relevant content',
          'Discover new features through daily spotlights',
          'Never miss important disability community news'
        ]
      },
      {
        name: 'Multilingual Support (EN/FR)',
        category: 'Website: Accessibility',
        description: 'Complete website translation in English and French for all Canadians',
        userGuideSection: 'translations',
        highlights: [
          'Full English and French translations of all pages',
          'Automated translation system using DeepL API',
          'Language switcher in header for easy toggling',
          'Culturally appropriate translations reviewed by community',
          'All new content automatically translated within 24 hours'
        ],
        examples: [
          'Switch to French with one click using the language selector',
          'Read feature descriptions in your preferred language',
          'Access resources and blog posts in English or French',
          'Beta testers can provide feedback in either official language'
        ],
        benefits: [
          'Access information in your preferred official language',
          'Equal access for French-speaking Canadians',
          'Better understanding with culturally appropriate translations',
          'Inclusive platform serving all of Canada'
        ]
      },
      {
        name: 'WCAG 2.2 AAA Accessibility',
        category: 'Website: Accessibility',
        description: 'Gold-standard accessibility with AAA compliance, keyboard navigation, and screen reader support',
        userGuideSection: 'accessibility',
        highlights: [
          'WCAG 2.2 Level AAA compliance (exceeds legal requirements)',
          'Full keyboard navigation throughout entire site',
          'Screen reader tested with NVDA, JAWS, and VoiceOver',
          'Automated daily accessibility testing with pa11y and axe-core',
          'Skip links, ARIA labels, and semantic HTML throughout'
        ],
        examples: [
          'Navigate entire website using only keyboard (Tab, Enter, Arrow keys)',
          'Use screen reader to access all content with proper ARIA labels',
          'Check automated accessibility reports in GitHub Actions',
          'Beta testers with disabilities can fully access and test the site'
        ],
        benefits: [
          'Usable by everyone regardless of disability',
          'Exceeds AODA and accessibility legislation requirements',
          'Sets standard for inclusive design in disability sector',
          'Ensures equal access to information and resources'
        ]
      },
      {
        name: 'Beta Testing Program',
        category: 'Website: Community',
        description: 'Join our closed beta testing program to help shape the future of 3mpwrApp',
        userGuideSection: 'beta',
        highlights: [
          'Easy signup form with device selection options',
          'Closed beta program for dedicated testers only',
          'Test app features before public release',
          'Direct feedback channel to development team',
          'Early access to new features and improvements'
        ],
        examples: [
          'Sign up at https://3mpwrapp.pages.dev/beta/ to become a beta tester',
          'Select your testing devices (Android, iOS, Windows, Mac, Tablet)',
          'Explain why you want to test and help improve the app',
          'Get contacted by email if selected for beta program'
        ],
        benefits: [
          'Influence app development with your feedback',
          'Get early access to features before public launch',
          'Help create a better tool for the disability community',
          'Be part of building something meaningful'
        ]
      },
      {
        name: 'Comprehensive FAQ System',
        category: 'Website: Support',
        description: 'Frequently asked questions covering app features, accessibility, privacy, and technical support',
        userGuideSection: 'faq',
        highlights: [
          'Organized by category for easy navigation',
          'Searchable FAQ database',
          'Covers features, privacy, accessibility, and technical issues',
          'Regular updates based on user questions',
          'Available in English and French'
        ],
        examples: [
          'Find answers about data privacy and encryption',
          'Learn how to use specific features before beta testing',
          'Understand system requirements for different devices',
          'Get technical support information and contact details'
        ],
        benefits: [
          'Get instant answers without waiting for email support',
          'Learn about features before downloading',
          'Understand privacy and security practices',
          'Troubleshoot common issues independently'
        ]
      },
      {
        name: 'Resource Directory',
        category: 'Website: Resources',
        description: 'Curated directory of disability resources, organizations, and support services across Canada',
        userGuideSection: 'resources',
        highlights: [
          'Province-specific disability resources',
          'Links to benefits programs (CPP-D, ODSP, AISH, PWD, etc.)',
          'Community organizations and advocacy groups',
          'Crisis resources and mental health support',
          'Legal aid and human rights resources'
        ],
        examples: [
          'Find your provincial disability benefits program',
          'Locate crisis resources for immediate support',
          'Discover advocacy organizations in your area',
          'Access legal aid resources for workplace issues'
        ],
        benefits: [
          'One-stop directory for Canadian disability resources',
          'Save time searching for legitimate support services',
          'Access help during crises quickly',
          'Connect with advocacy organizations'
        ]
      },
      {
        name: 'Privacy-First Architecture',
        category: 'Website: Security',
        description: 'Transparent privacy practices with local-first data storage and no user tracking',
        userGuideSection: 'privacy',
        highlights: [
          'Local-first architecture: your data stays on your device',
          'No analytics, cookies, or tracking scripts',
          'Transparent privacy policy in plain language',
          'GDPR and PIPEDA compliant',
          'Open source code for community review'
        ],
        examples: [
          'Read our privacy policy at https://3mpwrapp.pages.dev/privacy/',
          'Review source code on GitHub to verify privacy claims',
          'Your browsing and testing data never leaves your device',
          'No corporate surveillance or data monetization'
        ],
        benefits: [
          'Complete privacy and data ownership',
          'Peace of mind about data security',
          'Trust through transparency and open source',
          'Protection from corporate surveillance'
        ]
      },
      
      // === PHASE 1 APP FEATURES (Coming in Beta) ===
      {
        name: 'Evidence Locker',
        category: 'Phase 1: Core',
        description: 'Securely store documents with AES-256 encryption (Beta testing feature)',
        userGuideSection: 'evidence-locker',
        highlights: [
          'AES-256 encryption for all stored documents',
          'Organized categories: Medical, Legal, Employment, Benefits',
          'Photo scanning with automatic date stamping',
          'Offline access to all documents',
          'Beta testers will test document storage and retrieval'
        ],
        examples: [
          'Beta testers: Store sample medical reports to test encryption',
          'Test: Upload photos of sample documents with auto date-stamping',
          'Demo: Organize test documents into categories',
          'Verify: Access stored documents offline during testing'
        ],
        benefits: [
          'Secure storage for sensitive documents',
          'Never lose important paperwork',
          'Offline access anytime',
          'Organized system for legal processes'
        ]
      },
      {
        name: 'Master Letter Generator',
        category: 'Phase 1: Advocacy',
        description: '22 professional letter templates for accommodations and benefits (Beta testing)',
        userGuideSection: 'letter-generator',
        highlights: [
          '22 letter templates covering all common scenarios',
          'Province-specific customization for all Canada',
          'Professional language and legal references',
          'Step-by-step guidance for each letter type',
          'Beta testers will test template generation and customization'
        ],
        examples: [
          'Beta test: Generate sample accommodation request letter',
          'Demo: Customize letter with test data for your province',
          'Test: Export letter as PDF or text file',
          'Verify: Check province-specific legal references are correct'
        ],
        benefits: [
          'Professional letters without hiring a lawyer',
          'Correct legal terminology and references',
          'Province-appropriate content',
          'Save time with ready templates'
        ]
      },
      {
        name: 'Wellness Tracking Hub',
        category: 'Phase 1: Health',
        description: 'Track mood, energy, symptoms, and medications (Beta testing feature)',
        userGuideSection: 'wellness',
        highlights: [
          'Daily mood and energy tracking',
          'Symptom logging with custom scales',
          'Medication reminders and tracking',
          'Pattern recognition over time',
          'Beta testers will test tracking and pattern features'
        ],
        examples: [
          'Beta test: Log sample mood and energy levels daily',
          'Demo: Set up test medication reminders',
          'Test: Track sample symptoms over a week',
          'Verify: View pattern insights from test data'
        ],
        benefits: [
          'Better understand your health patterns',
          'Never forget medications',
          'Provide accurate health info to doctors',
          'Identify triggers and patterns'
        ]
      },
      {
        name: 'Dyslexia Support Mode',
        category: 'Phase 1: Accessibility',
        description: 'Specialized fonts, color overlays, and spacing controls for dyslexia',
        userGuideSection: 'dyslexia-mode',
        highlights: [
          '5 dyslexia-friendly fonts (OpenDyslexic, Lexend, etc.)',
          '8 color overlay options to reduce visual stress',
          'Adjustable letter, line, and word spacing',
          'Reading ruler and line focus mode',
          'Beta testers with dyslexia will test readability'
        ],
        examples: [
          'Beta test: Switch between different dyslexia fonts',
          'Demo: Apply colored overlays and test readability',
          'Test: Adjust spacing to find comfortable settings',
          'Verify: Use reading ruler on long documents'
        ],
        benefits: [
          'Read comfortably without fatigue',
          'Reduce letter confusion and errors',
          'Customize to your specific needs',
          'Access all features without barriers'
        ]
      },
      {
        name: 'Motor Accessibility Features',
        category: 'Phase 1: Accessibility',
        description: 'Dwell-click, large touch targets, and switch navigation support',
        userGuideSection: 'motor-access',
        highlights: [
          'Dwell-click: activate by hovering (0.5-3 second settings)',
          'Extra-large touch targets for easier tapping',
          'Tremor compensation for precise selections',
          'Single-switch navigation support',
          'Beta testers with motor disabilities will test all modes'
        ],
        examples: [
          'Beta test: Navigate app using dwell-click only',
          'Demo: Test tremor compensation with sample tasks',
          'Test: Use single-switch navigation throughout app',
          'Verify: Adjust dwell time to comfortable setting'
        ],
        benefits: [
          'Full app access regardless of motor ability',
          'No frustration from missed taps',
          'Independent use without assistance',
          'Customizable to your abilities'
        ]
      },
      {
        name: 'Screen Reader Optimization',
        category: 'Phase 1: Accessibility',
        description: 'WCAG AAA compliant with NVDA, JAWS, and VoiceOver testing',
        userGuideSection: 'screen-readers',
        highlights: [
          'Tested with NVDA, JAWS, and VoiceOver',
          'Proper ARIA labels on all interactive elements',
          'Logical heading structure for navigation',
          'Alt text on all images and icons',
          'Beta testers using screen readers will test all features'
        ],
        examples: [
          'Beta test: Navigate entire app with screen reader only',
          'Demo: Test ARIA labels and announcements',
          'Verify: All buttons and forms are properly labeled',
          'Test: Image descriptions are accurate and helpful'
        ],
        benefits: [
          'Complete app access for blind users',
          'Efficient navigation with proper structure',
          'No missed information or features',
          'Professional-grade accessibility'
        ]
      },
      {
        name: 'Crisis Resources Quick Access',
        category: 'Phase 1: Support',
        description: 'Immediate access to crisis hotlines and mental health resources',
        userGuideSection: 'crisis-resources',
        highlights: [
          'Quick access from anywhere in app',
          '24/7 crisis hotlines for all provinces',
          'Mental health resources and support lines',
          'No login required for emergency access',
          'Beta testers will verify resource accuracy'
        ],
        examples: [
          'Beta test: Access crisis resources from main menu',
          'Verify: Phone numbers are current and correct',
          'Test: Emergency access works without logging in',
          'Demo: Quick dial feature for crisis lines'
        ],
        benefits: [
          'Get help during mental health crises',
          'Immediate access when you need it most',
          'No barriers to emergency support',
          'Peace of mind having resources available'
        ]
      },
      {
        name: 'Offline-First Design',
        category: 'Phase 1: Technical',
        description: 'Full functionality without internet connection after initial setup',
        userGuideSection: 'offline-mode',
        highlights: [
          'All core features work offline',
          'Data syncs when connection restored',
          'No cloud dependency for basic functions',
          'Perfect for rural areas or unreliable connections',
          'Beta testers will test offline functionality'
        ],
        examples: [
          'Beta test: Use app in airplane mode',
          'Demo: Create letters and store documents offline',
          'Test: Track wellness data without internet',
          'Verify: Data syncs correctly when reconnecting'
        ],
        benefits: [
          'Works anywhere, even without internet',
          'No lost work due to connection issues',
          'Reliable for rural and remote users',
          'Privacy benefit: less data transmission'
        ]
      },
      {
        name: 'Benefits Navigator (Phase 1)',
        category: 'Phase 1: Benefits',
        description: 'Guide to Canadian disability benefits programs by province',
        userGuideSection: 'benefits-navigator',
        highlights: [
          'Information on all provincial programs (ODSP, AISH, PWD, etc.)',
          'Federal programs (CPP-D, DTC, RDSP)',
          'Eligibility requirements and application processes',
          'Links to official application forms',
          'Beta testers will verify information accuracy'
        ],
        examples: [
          'Beta test: Search for Ontario ODSP information',
          'Demo: Check CPP-D eligibility requirements',
          'Test: Access Alberta AISH application links',
          'Verify: All provincial information is current and accurate'
        ],
        benefits: [
          'Understand benefits you may qualify for',
          'Province-specific guidance',
          'Direct links to applications',
          'Simplified eligibility explanations'
        ]
      },
      {
        name: 'Community Forum (Beta Preview)',
        category: 'Phase 1: Community',
        description: 'Moderated discussion spaces for disability community (Beta testing)',
        userGuideSection: 'community',
        highlights: [
          'Safe, moderated spaces for community discussion',
          'Topic-based rooms (legal, health, advocacy)',
          'Anonymous posting options for privacy',
          'Community guidelines and moderation',
          'Beta testers will create initial community culture'
        ],
        examples: [
          'Beta test: Post sample discussions in different rooms',
          'Demo: Test anonymous posting feature',
          'Test: Report system for inappropriate content',
          'Verify: Moderation tools work effectively'
        ],
        benefits: [
          'Connect with others facing similar challenges',
          'Share experiences and advice safely',
          'Build supportive community',
          'Learn from others\' experiences'
        ]
      },
      {
        name: 'Provincial Resource Guides',
        category: 'Phase 1: Resources',
        description: 'Detailed guides for disability programs in each Canadian province/territory',
        userGuideSection: 'provincial-guides',
        highlights: [
          'Guides for all 10 provinces and 3 territories',
          'Benefits programs, eligibility, and applications',
          'Legal aid and advocacy resources by region',
          'Healthcare and support services',
          'Beta testers will verify accuracy for their province'
        ],
        examples: [
          'Beta test: Review your provincial guide for accuracy',
          'Demo: Compare benefits across provinces',
          'Test: Access application links for your region',
          'Verify: Contact information is current'
        ],
        benefits: [
          'Province-specific information in one place',
          'No need to search multiple government websites',
          'Understand your local resources',
          'Make informed decisions about benefits'
        ]
      },
      {
        name: 'User Guide & Documentation',
        category: 'Website: Support',
        description: 'Comprehensive 12-minute guide explaining all 133 beta features',
        userGuideSection: 'user-guide',
        highlights: [
          'Detailed documentation for all 133 features',
          'Step-by-step tutorials with screenshots',
          'Searchable and organized by category',
          'Available in English and French',
          'Beta testers use this to understand features before testing'
        ],
        examples: [
          'Read user guide at https://3mpwrapp.pages.dev/user-guide/',
          'Search for specific feature documentation',
          'Follow step-by-step tutorials for complex features',
          'Reference guide during beta testing'
        ],
        benefits: [
          'Understand features before testing',
          'Quick reference during use',
          'Learn advanced functionality',
          'Maximize value from the app'
        ]
      },
      {
        name: 'Automated Testing & Quality Assurance',
        category: 'Website: Technical',
        description: 'Daily automated tests for accessibility, links, and performance',
        userGuideSection: 'quality',
        highlights: [
          'Daily pa11y and axe-core accessibility testing',
          'Automated link checking across entire site',
          'Lighthouse performance audits',
          'GitHub Actions CI/CD pipeline',
          'Public test results visible to all'
        ],
        examples: [
          'View test results in GitHub Actions tab',
          'Check accessibility scores in automated reports',
          'Monitor site performance over time',
          'Review link check results for broken links'
        ],
        benefits: [
          'Consistent quality and accessibility',
          'Quick detection of issues',
          'Transparent quality metrics',
          'Confidence in site reliability'
        ]
      },
      {
        name: 'Open Source Transparency',
        category: 'Website: Community',
        description: 'Fully open source codebase for community review and contribution',
        userGuideSection: 'opensource',
        highlights: [
          'All code publicly available on GitHub',
          'Community can review, suggest, and contribute',
          'Transparent development process',
          'Issue tracking and feature requests public',
          'Contributing guidelines for community participation'
        ],
        examples: [
          'Review source code at github.com/3mpwrApp/',
          'Submit feature requests via GitHub Issues',
          'Contribute code improvements via Pull Requests',
          'See development roadmap and progress'
        ],
        benefits: [
          'Trust through transparency',
          'Community-driven development',
          'Anyone can verify privacy and security claims',
          'Collaborative improvement'
        ]
      },
      {
        name: 'Responsive Mobile-First Design',
        category: 'Website: Technical',
        description: 'Optimized experience on mobile, tablet, and desktop devices',
        userGuideSection: 'responsive',
        highlights: [
          'Mobile-first design approach',
          'Touch-optimized for phones and tablets',
          'Responsive layouts adapt to any screen size',
          'Fast loading on slow connections',
          'Beta testers will test on various devices'
        ],
        examples: [
          'Browse site on phone, tablet, or desktop seamlessly',
          'Beta test: Verify layouts work on your device',
          'Test: Check touch targets are large enough on mobile',
          'Demo: Site loads fast even on 3G connection'
        ],
        benefits: [
          'Access from any device',
          'Consistent experience everywhere',
          'Works on older or budget devices',
          'Usable on slow connections'
        ]
      },
      {
        name: 'Newsletter Subscription',
        category: 'Website: Community',
        description: 'Subscribe to updates, new features, and community news',
        userGuideSection: 'newsletter',
        highlights: [
          'Regular updates on new features',
          'Beta testing opportunities',
          'Community highlights and success stories',
          'Privacy-respecting (no spam, easy unsubscribe)',
          'Available in English and French'
        ],
        examples: [
          'Subscribe at https://3mpwrapp.pages.dev/newsletter/',
          'Get notified when beta program opens',
          'Receive weekly curated disability news',
          'Stay informed about app development progress'
        ],
        benefits: [
          'Stay informed about updates',
          'Early access to new features',
          'Community connection',
          'Never miss important announcements'
        ]
      },
      {
        name: 'Contact & Support Channels',
        category: 'Website: Support',
        description: 'Multiple ways to reach the team for support and feedback',
        userGuideSection: 'contact',
        highlights: [
          'Email support for beta testers',
          'Social media presence (X, Mastodon, Bluesky)',
          'GitHub Issues for bug reports',
          'Contact form on website',
          'Response within 24-48 hours'
        ],
        examples: [
          'Email: empowrapp08162025@gmail.com',
          'Submit bugs via GitHub Issues',
          'Reach out on social media for quick questions',
          'Use contact form for general inquiries'
        ],
        benefits: [
          'Get help when you need it',
          'Multiple communication options',
          'Direct line to development team',
          'Community support available'
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
