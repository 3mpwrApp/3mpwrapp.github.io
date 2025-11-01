#!/usr/bin/env node
/**
 * DAILY-FEATURE-GENERATOR.JS
 * Automatically generates daily feature spotlight articles
 * 
 * Features:
 * - Selects a feature from user-guide and website
 * - Creates detailed, factual article
 * - References user guide sections
 * - Includes examples and use cases
 * - Generates social media posts
 * - Auto-posts to Bluesky & Mastodon with article link
 * 
 * NOTE: 3mpwrApp is in Phase 1 - Closed Beta Testing
 * Features include both app features (in development) and website features (live now)
 */

const fs = require('fs');
const path = require('path');

class DailyFeatureGenerator {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.userGuidePath = path.join(process.cwd(), 'user-guide/index.md');
    
    // Feature library - FACTUAL information only from user guide and website
    // Note: App is in closed beta phase 1, website features are live
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
      },
      {
        name: 'Pain Flare Mode',
        category: 'Website Feature - Live Now',
        description: 'One-click emergency accessibility mode that simplifies the website when you\'re in pain',
        userGuideSection: 'accessibility-features',
        highlights: [
          'Activated instantly with one button click',
          'Minimal visual stimulation to reduce cognitive load',
          'Large, easy-to-tap buttons for reduced motor control',
          'Removes animations and complex interactions',
          'Dims screen brightness automatically',
          'Available on 3mpwrapp.pages.dev website right now'
        ],
        examples: [
          'Click "Pain flare mode" button when experiencing a flare-up',
          'Interface immediately simplifies to essential information only',
          'Large buttons reduce the need for precise tapping',
          'Minimal visual elements prevent sensory overload'
        ],
        benefits: [
          'Access information when you need it most',
          'Reduce pain and fatigue from using technology',
          'Continue essential tasks during difficult moments',
          'Immediate relief without complex settings'
        ],
        websiteFeature: true
      },
      {
        name: 'Brain Fog Helper',
        category: 'Website Feature - Live Now',
        description: 'Quick summary generator that condenses long text into digestible bullet points',
        userGuideSection: 'accessibility-features',
        highlights: [
          'Instantly summarizes any page into key points',
          'Plain language summaries without jargon',
          'Available on every page of the website',
          'One-click activation from accessibility toolbar',
          'Helps with cognitive fatigue and information overload',
          'Live on 3mpwrapp.pages.dev'
        ],
        examples: [
          'Reading a long article? Click "Brain fog helper" for quick summary',
          'Get the essential information without reading everything',
          'Return to full text when you have more energy',
          'Understand complex pages quickly'
        ],
        benefits: [
          'Save cognitive energy for what matters',
          'Understand content even on difficult days',
          'Reduce anxiety from overwhelming text',
          'Make informed decisions faster'
        ],
        websiteFeature: true
      },
      {
        name: 'Mood & Symptom Tracker',
        category: 'App Core Feature',
        description: 'Track daily mood, symptoms, pain levels, and triggers to identify patterns and communicate with healthcare providers',
        userGuideSection: 'wellness-tools',
        highlights: [
          'Customizable mood scales from 1-10',
          'Track multiple symptoms simultaneously',
          'Pain level tracking with body map',
          'Identify triggers and patterns over time',
          'Generate reports for doctor appointments',
          'Completely private - all data stays on your device'
        ],
        examples: [
          'Log morning pain levels and energy before starting your day',
          'Track medication effects and side effects',
          'Identify which activities trigger symptom flares',
          'Share monthly pattern reports with your doctor',
          'Notice connections between sleep, stress, and symptoms'
        ],
        benefits: [
          'Better understand your health patterns',
          'Provide concrete data to healthcare providers',
          'Identify triggers to avoid or manage',
          'Track treatment effectiveness over time'
        ]
      },
      {
        name: 'Pacing Partner',
        category: 'App Wellness Feature',
        description: 'Intelligent activity pacing tool that helps you balance activity and rest to avoid energy crashes',
        userGuideSection: 'wellness-tools',
        highlights: [
          'Suggests rest breaks based on your energy patterns',
          'Tracks your "energy envelope" to prevent crashes',
          'Reminds you to pace during high-energy times',
          'Celebrates successful pacing achievements',
          'Adapts to your unique energy patterns',
          'Based on spoon theory principles'
        ],
        examples: [
          'Get reminder to take a break after 45 minutes of activity',
          'Receive encouragement when you successfully pace',
          'Learn your optimal activity-rest ratio',
          'Prevent post-exertional malaise before it happens'
        ],
        benefits: [
          'Reduce frequency and severity of energy crashes',
          'Accomplish more by pacing yourself appropriately',
          'Learn sustainable activity patterns',
          'Improve quality of life through better energy management'
        ]
      },
      {
        name: 'Peer Support Matching',
        category: 'App Community Feature',
        description: 'Connect with others who share similar experiences, conditions, or advocacy goals',
        userGuideSection: 'community-features',
        highlights: [
          'Match based on shared experiences and needs',
          'Privacy-focused matching algorithm',
          'Optional anonymous connections',
          'Moderated community with clear guidelines',
          'Connect for support, resources, or advocacy',
          'Block and report features for safety'
        ],
        examples: [
          'Find others navigating the same benefits system',
          'Connect with people in your province facing similar challenges',
          'Join support groups for specific conditions',
          'Share successful strategies and resources',
          'Build advocacy teams for systemic change'
        ],
        benefits: [
          'Feel less isolated in your journey',
          'Learn from others\' experiences',
          'Access peer knowledge and support',
          'Build meaningful connections'
        ]
      },
      {
        name: 'Adaptive Meditation & Breathing',
        category: 'App Wellness Feature',
        description: 'Meditation and breathing exercises adapted for chronic pain, PTSD, anxiety, and various disabilities',
        userGuideSection: 'wellness-tools',
        highlights: [
          'Exercises adapted for physical limitations',
          'Trauma-informed approaches for PTSD',
          'Short options (1-5 minutes) for limited energy',
          'Pain-aware guidance that acknowledges discomfort',
          'Multiple modalities: audio, visual, haptic',
          'No forced positivity or unrealistic expectations'
        ],
        examples: [
          'Use 2-minute breathing exercise during panic attack',
          'Practice pain-aware body scan that doesn\'t require lying down',
          'Try grounding techniques during dissociation',
          'Use haptic-only mode for sensory sensitivity',
          'Access trauma-informed meditation without triggering language'
        ],
        benefits: [
          'Self-regulation tools that actually work for disabled people',
          'Reduce anxiety and stress safely',
          'Manage pain and symptoms naturally',
          'Accessible regardless of physical ability'
        ]
      },
      {
        name: 'Lawyer Finder & Legal Resources',
        category: 'App Advocacy Feature',
        description: 'Province-specific legal resources, lawyer directory, and guidance for finding appropriate legal help',
        userGuideSection: 'advocacy-legal-resources',
        highlights: [
          'Directory of disability rights lawyers by province',
          'Information on legal aid eligibility',
          'Links to provincial law societies',
          'Guidance on what to look for in legal representation',
          'Information on pro bono services',
          'Human rights tribunal contact information'
        ],
        examples: [
          'Find disability rights lawyers in your province',
          'Learn about legal aid eligibility criteria',
          'Access contact information for human rights tribunals',
          'Understand lawyer fee structures',
          'Find pro bono legal clinics in your area'
        ],
        benefits: [
          'Connect with appropriate legal help',
          'Understand your rights and options',
          'Navigate legal systems more effectively',
          'Access justice regardless of income'
        ]
      },
      {
        name: 'Jurisdiction-Specific Resources',
        category: 'App Advocacy Feature',
        description: 'Comprehensive resources for all Canadian provinces and territories including benefits, rights, and local services',
        userGuideSection: 'advocacy-legal-resources',
        highlights: [
          'Information for all 13 provinces and territories',
          'Provincial disability benefits programs',
          'Workers\' compensation contacts and processes',
          'Human rights legislation by jurisdiction',
          'Local disability organizations and services',
          'Province-specific forms and applications'
        ],
        examples: [
          'Access ODSP information if you\'re in Ontario',
          'Find AISH resources for Alberta residents',
          'Learn about PWD program in British Columbia',
          'Understand workers\' comp process in your province',
          'Locate local disability advocacy organizations'
        ],
        benefits: [
          'Find resources specific to your location',
          'Navigate your provincial systems effectively',
          'Access local support services',
          'Understand jurisdiction-specific rights'
        ]
      },
      {
        name: 'DBT Skill Matcher',
        category: 'App Wellness Feature',
        description: 'Dialectical Behavior Therapy skills matched to your current situation and emotional state',
        userGuideSection: 'wellness-tools',
        highlights: [
          'Quick assessment of current emotional state',
          'Suggests appropriate DBT skills for the situation',
          'Step-by-step guidance for using each skill',
          'Tracks which skills work best for you',
          'Library of 20+ DBT techniques',
          'Crisis skills available for emergencies'
        ],
        examples: [
          'Feeling overwhelmed? Get distress tolerance skills',
          'Struggling with emotions? Access emotion regulation techniques',
          'Need to communicate better? Find interpersonal effectiveness skills',
          'Experiencing crisis? Access crisis survival strategies',
          'Track which skills help you most'
        ],
        benefits: [
          'Evidence-based coping strategies at your fingertips',
          'Learn what works for your specific situations',
          'Build emotional regulation skills',
          'Manage difficult moments effectively'
        ]
      },
      {
        name: 'Resilience Points System',
        category: 'App Wellness Feature',
        description: 'Gamified tracking system that celebrates small wins and builds motivation through positive reinforcement',
        userGuideSection: 'wellness-tools',
        highlights: [
          'Earn points for self-care and advocacy actions',
          'Celebrate small wins and daily victories',
          'No punishment for missed days or low activity',
          'Completely optional - use if it helps you',
          'Points unlock encouraging messages',
          'Track your journey without pressure'
        ],
        examples: [
          'Earn points for logging your mood',
          'Get recognition for attending appointments',
          'Celebrate completing legal documents',
          'Acknowledge rest days as valid achievements',
          'Build positive momentum through small actions'
        ],
        benefits: [
          'Motivation without shame or pressure',
          'Recognition for efforts often ignored',
          'Visual representation of your journey',
          'Positive reinforcement for self-care'
        ]
      },
      {
        name: 'Crisis Resources Hub',
        category: 'Website Feature - Live Now',
        description: 'Immediate access to crisis hotlines, emergency services, and mental health support resources',
        userGuideSection: 'crisis-resources',
        highlights: [
          'Available on website right now without app download',
          'Emergency numbers prominently displayed',
          '24/7 crisis hotlines for Canada',
          'Mental health, suicide prevention, and domestic violence resources',
          'Provincial-specific crisis services',
          'Quick access from any page'
        ],
        examples: [
          'Find suicide prevention hotline (1-833-456-4566)',
          'Access crisis text line (text 45645)',
          'Locate domestic violence support (1-800-363-9010)',
          'Find provincial mental health crisis lines',
          'Get help immediately without creating an account'
        ],
        benefits: [
          'Life-saving resources always accessible',
          'No barriers to accessing help',
          'Comprehensive support options',
          'Province-specific services included'
        ],
        websiteFeature: true
      },
      {
        name: 'Accessibility Toolbar',
        category: 'Website Feature - Live Now',
        description: '13 innovative accessibility features available on the website with one click',
        userGuideSection: 'accessibility-features',
        highlights: [
          '13 different accessibility tools and modes',
          'Quick Relief options: Pain flare, Need a break, Overwhelmed mode',
          'Reading Aids: Brain fog helper, Text chunking, Reading resume',
          'Display Settings: Sensory preferences, Reading level, Dyslexia mode',
          'All features available immediately on website',
          'No download or account required'
        ],
        examples: [
          'Activate pain flare mode during a bad day',
          'Use brain fog helper to understand complex pages',
          'Freeze animations if they\'re overwhelming',
          'Switch to high contrast for visual clarity',
          'Enable dyslexia-friendly fonts'
        ],
        benefits: [
          'Customize your experience immediately',
          'Access site regardless of ability',
          'Reduce barriers to information',
          'Control your sensory experience'
        ],
        websiteFeature: true
      },
      {
        name: 'Comprehensive User Guide',
        category: 'Website Feature - Live Now',
        description: 'Detailed, accessible documentation covering all app features and website tools',
        userGuideSection: 'getting-started',
        highlights: [
          'Available online at 3mpwrapp.pages.dev/user-guide/',
          'Table of contents with energy cost indicators',
          'Quick summaries for each section',
          'Downloadable PDF version',
          'Plain language explanations',
          'Real-world examples and use cases'
        ],
        examples: [
          'Learn about all features before joining beta',
          'Reference while using the app',
          'Share with healthcare providers or lawyers',
          'Understand features in depth',
          'Download for offline access'
        ],
        benefits: [
          'Informed decision about joining beta',
          'Learn at your own pace',
          'Comprehensive feature documentation',
          'Accessible reference material'
        ],
        websiteFeature: true
      },
      {
        name: 'Blog & News Curation',
        category: 'Website Feature - Live Now',
        description: 'Daily curated news about disability rights, accessibility, and social policy across Canada',
        userGuideSection: 'blog',
        highlights: [
          'Daily news curation from trusted Canadian sources',
          'Feature spotlights explaining app capabilities',
          'Accessibility news and policy updates',
          'Community spotlights and success stories',
          'Weekly updates and summaries',
          'All available on the website now'
        ],
        examples: [
          'Stay informed about disability policy changes',
          'Learn about new app features through spotlights',
          'Discover accessibility innovations',
          'Read community success stories',
          'Get weekly updates on what\'s new'
        ],
        benefits: [
          'Stay informed without effort',
          'Learn about app features',
          'Connect with broader community',
          'Understand policy changes affecting you'
        ],
        websiteFeature: true
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
    
    // Different instructions for website features vs app features
    if (feature.websiteFeature) {
      content += `**${feature.name} is available on the website right now!**\n\n`;
      content += `You can use this feature immediately at [3mpwrapp.pages.dev](https://3mpwrapp.pages.dev/) without downloading anything or creating an account.\n\n`;
      content += `1. **Visit the website** - Go to [3mpwrapp.pages.dev](https://3mpwrapp.pages.dev/)\n`;
      content += `2. **No login required** - Most website features work without an account\n`;
      content += `3. **Find the feature** - Look for "${feature.name}" in the accessibility toolbar or main navigation\n`;
      content += `4. **Start using it** - No setup needed, just click and go\n\n`;
    } else {
      content += `**Note: 3mpwrApp is currently in Phase 1 - Closed Beta Testing**\n\n`;
      content += `${feature.name} is part of the mobile app currently in development. To access this feature:\n\n`;
      content += `1. **Join the beta** - [Sign up for beta testing](/beta/) to get early access\n`;
      content += `2. **Get invited** - Beta invitations are sent in phases as features are ready\n`;
      content += `3. **Download the app** - iOS and Android (beta testers only)\n`;
      content += `4. **Complete setup** - First-time setup takes about 5-10 minutes\n`;
      content += `5. **Find the feature** - Look for "${feature.name}" in your app\n`;
      content += `6. **Follow the guide** - In-app tutorials walk you through each step\n\n`;
      content += `_Not a beta tester yet? The app is in active development. [Join our beta program](/beta/) to get access when this feature is ready._\n\n`;
    }

    content += `---\n\n## Learn More\n\n`;
    content += `For complete information about ${feature.name} and all other features:\n\n`;
    content += `- 📖 [Read the Complete User Guide](/user-guide/#${feature.userGuideSection})\n`;
    content += `- ✨ [Explore All Features](/features/)\n`;
    content += `- 🧪 [Join Beta Testing](/beta/)\n`;
    content += `- 📬 [Subscribe to Updates](/newsletter/)\n\n`;

    content += `---\n\n## About 3mpwrApp\n\n`;
    content += `3mpwrApp is a community-driven platform built for injured workers and persons with disabilities across Canada. We provide practical tools, community support, and advocacy resources—all designed with accessibility, privacy, and cultural respect at the core.\n\n`;
    
    if (feature.websiteFeature) {
      content += `**The website is live now** at [3mpwrapp.pages.dev](https://3mpwrapp.pages.dev/) with many accessibility features. The mobile app is in **Phase 1 - Closed Beta Testing** with new features being added regularly.\n\n`;
    } else {
      content += `**The mobile app is currently in Phase 1 - Closed Beta Testing.** Join the [beta program](/beta/) to get early access as features are released.\n\n`;
    }
    
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
    const fullUrl = `https://3mpwrapp.pages.dev${articleUrl}`;
    
    const availability = feature.websiteFeature ? '🌐 Live on website now!' : '📱 Coming in app beta';
    
    // Short version for Twitter/Bluesky (< 280 chars with link)
    const shortPost = `🌟 Feature Spotlight: ${feature.name}

${feature.description}

${availability}

Learn more: ${fullUrl}

#Disability #Accessibility #DisabilityRights`;

    // Longer version for Mastodon (500 chars)
    const longPost = `🌟 Feature Spotlight: ${feature.name}

${feature.description}

${availability}

Key highlights:
${feature.highlights.slice(0, 2).map(h => `✓ ${h}`).join('\n')}

Read the full article: ${fullUrl}

#Disability #Accessibility #DisabilityRights #DisabilityJustice #A11y`;

    return { shortPost, longPost, url: fullUrl };
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
