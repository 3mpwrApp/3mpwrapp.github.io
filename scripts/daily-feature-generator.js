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
const siteConfig = require('./site-config');
const viralHooks = require('./viral-hooks-config');

class DailyFeatureGenerator {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.userGuidePath = path.join(process.cwd(), 'user-guide.md');
    
    // Feature library from user-guide.md - FACTUAL information only
    // NOTE: 3mpwrApp is NOW 100% PRODUCTION READY - December 2025
    // 721 tests passing, AES-256-GCM encryption, WCAG AAA compliant
    // Accepting beta testers at https://3mpwrapp.pages.dev/app-waitlist
    this.features = [
      {
        name: '3mpwrApp Technical Foundation: 721 Tests Passing',
        category: 'Technical Excellence',
        description: '3mpwrApp built on production-grade foundation with comprehensive security, accessibility, and offline support verified through automated testing',
        userGuideSection: 'technical-foundation',
        highlights: [
          '721 automated tests passing across all app features (121 test suites)',
          'AES-256-GCM military-grade encryption implemented and verified',
          'WCAG AAA accessibility compliance verified (0 critical issues in automated scans)',
          'Complete offline-first architecture with AsyncStorage',
          'XSS and SQL injection prevention mechanisms in place',
          '0 ESLint errors, 0 TypeScript errors in codebase',
          'Currently accepting beta testers: https://3mpwrapp.pages.dev/app-waitlist'
        ],
        examples: [
          'Evidence Locker designed with bank-level AES-256-GCM encryption',
          'All features architected to work offline without internet',
          'Screen reader compatibility built-in (VoiceOver, TalkBack support)',
          'Simple Mode available (reduces interface to 5 core features)',
          'Upload queue system designed for rural/low-connectivity areas'
        ],
        benefits: [
          'Bank-level security architecture protects sensitive data',
          'Offline-first design means no internet dependency',
          'Accessibility built-in from foundation, not added later',
          'Always free - permanent commitment to community access'
        ]
      },
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
        description: '22 professional letter templates for workplace accommodations, benefits applications, and appeals - completely free',
        userGuideSection: 'advocacy-tools',
        highlights: [
          '22 comprehensive letter types covering all situations',
          '6 workplace & accommodation letter templates',
          '7 benefits & disability program letter templates',
          '5 legal & appeals letter templates',
          '4 administrative & documentation letter templates',
          'Province-specific customization for all Canadian jurisdictions',
          'Built-in safety features and professional language',
          'Always free - no premium templates or hidden costs'
        ],
        examples: [
          'Request workplace accommodations under human rights legislation',
          'Apply for disability benefits (CPP-D, ODSP, AISH, PWD)',
          'Write appeals for denied benefits or accommodations',
          'Document workplace discrimination or harassment',
          'Request medical documentation from healthcare providers'
        ],
        benefits: [
          'Save time with professional templates at no cost',
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
        name: 'Benefits Navigator',
        category: 'Core Feature',
        description: 'Find and apply for disability benefits across all Canadian provinces and territories - always free',
        userGuideSection: 'benefits-navigator',
        highlights: [
          'Complete guide to all Canadian disability benefits programs',
          'Provincial programs: ODSP (ON), AISH (AB), PWD (BC), and more',
          'Federal programs: CPP-D, Disability Tax Credit, Veterans benefits',
          'Eligibility checker helps you find programs you qualify for',
          'Application guides with step-by-step instructions',
          'Appeal information for denied applications',
          'Always free - no paid features or upgrades ever'
        ],
        examples: [
          'Check eligibility for CPP Disability and provincial benefits',
          'Learn application requirements before you apply',
          'Find contact information for benefits offices',
          'Understand appeal deadlines and processes',
          'Compare benefits programs to find best fit'
        ],
        benefits: [
          'Discover benefits you didn\'t know existed',
          'Apply with confidence knowing requirements',
          'Navigate complex systems with clear guidance',
          'Maximize your financial security at no cost'
        ]
      },
      {
        name: 'Resource Directory',
        category: 'Core Feature',
        description: 'Searchable directory of disability services, organizations, and support across Canada',
        userGuideSection: 'resource-directory',
        highlights: [
          'Comprehensive directory of Canadian disability resources',
          'Search by location, service type, and specific needs',
          'Legal aid services and advocacy organizations',
          'Healthcare providers and accessible services',
          'Community support groups and peer networks',
          'Updated regularly with new resources'
        ],
        examples: [
          'Find disability lawyers in your province',
          'Locate accessible healthcare providers nearby',
          'Connect with peer support groups',
          'Discover advocacy organizations working on your issues',
          'Access crisis resources and immediate support'
        ],
        benefits: [
          'Quick access to help when you need it',
          'Connect with relevant services in your area',
          'Discover new resources and support networks',
          'Save time searching for assistance'
        ]
      },
      {
        name: 'Privacy & Security Architecture',
        category: 'Technical Foundation',
        description: 'Enterprise-grade security with AES-256 encryption, zero-knowledge architecture, and offline-first design',
        userGuideSection: 'privacy-and-security',
        highlights: [
          'AES-256 encryption for all stored data',
          'Zero-knowledge architecture: we cannot read your data',
          'Offline-first design: works without internet',
          'No tracking, no analytics, no data collection',
          'Open source code for transparency',
          'Compliant with Canadian privacy laws (PIPEDA)'
        ],
        examples: [
          'Store sensitive medical documents with military-grade encryption',
          'Use app fully offline for maximum privacy',
          'Trust that your personal information stays private',
          'Review security code yourself (open source)',
          'Delete account and all data instantly if needed'
        ],
        benefits: [
          'Complete control over your personal information',
          'Peace of mind with strong security',
          'Use app in areas without internet',
          'No corporate surveillance or data selling'
        ]
      },
      {
        name: 'Screen Reader Excellence',
        category: 'Accessibility',
        description: 'Full screen reader support with ARIA labels, semantic HTML, and optimized navigation',
        userGuideSection: 'settings-and-accessibility',
        highlights: [
          'Complete screen reader support (NVDA, JAWS, VoiceOver)',
          'Semantic HTML for proper document structure',
          'ARIA labels on all interactive elements',
          'Keyboard navigation for every feature',
          'Skip links for faster navigation',
          'Audio feedback options'
        ],
        examples: [
          'Navigate entire app using only keyboard',
          'Screen reader announces all content clearly',
          'Jump to main content with skip links',
          'Hear confirmation for important actions',
          'Use with any assistive technology'
        ],
        benefits: [
          'Full independence using screen readers',
          'Fast navigation with keyboard shortcuts',
          'Clear announcements reduce confusion',
          'Works with technology you already use'
        ]
      },
      {
        name: 'Multilingual Support (English & French)',
        category: 'Accessibility',
        description: 'Full bilingual support for English and French with professional translations',
        userGuideSection: 'language-support',
        highlights: [
          'Complete interface translation in French and English',
          'Professional translations reviewed by native speakers',
          'All letter templates available in both languages',
          'Quebec-specific legal terminology included',
          'Switch languages instantly from settings',
          'Bilingual documentation and support'
        ],
        examples: [
          'Use entire app interface in French',
          'Generate letters with correct Quebec legal terms',
          'Access help documentation in your language',
          'Switch between languages as needed',
          'Communicate with services in official language of choice'
        ],
        benefits: [
          'Access services in your preferred official language',
          'Use correct terminology for your province',
          'Reduce language barriers to advocacy',
          'Exercise your language rights confidently'
        ]
      },
      {
        name: 'Crisis Resources & Immediate Support',
        category: 'Wellness & Safety',
        description: 'Quick access to crisis lines, emergency contacts, and immediate support resources',
        userGuideSection: 'crisis-resources',
        highlights: [
          'One-tap access to crisis and suicide prevention lines',
          'Provincial and national crisis services listed',
          'Emergency contacts manager for quick dialing',
          'Safety planning tools for mental health crises',
          'Accessible 24/7 without logging in',
          'Includes specialized lines (Indigenous, LGBTQ+, Youth)'
        ],
        examples: [
          'Call crisis line with single tap in emergency',
          'Access mental health support 24/7',
          'Store trusted emergency contacts',
          'Use safety plan during difficult times',
          'Find specialized support for your community'
        ],
        benefits: [
          'Immediate access when in crisis',
          'Always available even offline',
          'Connect with appropriate support quickly',
          'Feel safer knowing help is one tap away'
        ]
      },
      {
        name: 'Spoon Theory & Energy Management',
        category: 'Wellness Tools',
        description: 'Track your daily "spoons" (energy units) and plan activities around available capacity',
        userGuideSection: 'spoon-theory-tracking',
        highlights: [
          'Visual spoon tracker with customizable daily capacity',
          'Activity cost estimates help plan your day',
          'Energy history shows patterns over time',
          'Smart suggestions for low-energy days',
          'Integration with Wellness Hub tracking',
          'Explain spoon theory to others with shareable graphics'
        ],
        examples: [
          'Start day with 12 spoons, track as activities consume them',
          'See that grocery shopping costs 3 spoons',
          'Plan medical appointment on high-energy day',
          'Discover which activities drain you most',
          'Share your spoon count with support people'
        ],
        benefits: [
          'Better understand and communicate your energy limits',
          'Avoid overcommitting and burnout',
          'Plan important tasks for when you have capacity',
          'Help others understand your experience'
        ]
      },
      {
        name: 'Accessible Document Generation',
        category: 'Legal Tools',
        description: 'Generate WCAG 2.2 AA+ compliant documents, letters, and forms with proper structure',
        userGuideSection: 'document-generation',
        highlights: [
          'All generated documents meet WCAG 2.2 AA+ standards',
          'Proper heading structure for screen readers',
          'High contrast text and clear fonts',
          'Accessible PDFs with tags and bookmarks',
          'Plain language options for complex legal text',
          'Export in multiple formats (PDF, DOCX, TXT)'
        ],
        examples: [
          'Generate accommodation letter accessible to all recipients',
          'Create appeal document with proper structure',
          'Export in format your lawyer or advocate needs',
          'Ensure accessibility officer can read your request',
          'Print documents with clear, readable formatting'
        ],
        benefits: [
          'Your documents are professional and accessible',
          'Recipients can read regardless of disability',
          'Proper structure helps your case be taken seriously',
          'Multiple formats for different needs'
        ]
      },
      // WELLNESS TOOLS (36 features from user guide)
      {
        name: 'Mood Tracker',
        category: 'Wellness Tools',
        description: 'Log your daily mood and track emotional patterns over time - completely free',
        userGuideSection: 'mood-tracker',
        highlights: [
          'Log daily mood using emoji-based interface',
          'Track patterns over weeks and months',
          'Export reports for therapist or doctor',
          'Set mood check-in reminders',
          '7-day average trends visualization',
          'Always free - no premium features or paywalls'
        ],
        examples: [
          'Record mood each morning and evening',
          'Notice patterns like "Mondays are harder"',
          'Share monthly report with therapist',
          'Get gentle reminders to check in with yourself',
          'Spot connections between activities and mood'
        ],
        benefits: [
          'Better understand your emotional patterns',
          'Communicate more clearly with healthcare providers',
          'Identify triggers and helpful activities',
          'Track progress in mental health treatment'
        ]
      },
      {
        name: 'Symptom & Pain Tracker',
        category: 'Wellness Tools',
        description: 'Log physical symptoms and pain levels to identify patterns and advocate for care',
        userGuideSection: 'symptom-pain-tracker',
        highlights: [
          'Log physical symptoms with pain scale (0-10)',
          'Track functional impact on daily activities',
          'Tag entries with triggers, medications, activities',
          'Export advocacy-oriented reports for doctors',
          'Filter by date range to see trends',
          'Completely free symptom tracking'
        ],
        examples: [
          'Record morning pain levels before work',
          'Note when new medication affects symptoms',
          'Document impact: "Pain prevented grocery shopping"',
          'Export month of data for specialist appointment',
          'Identify pattern: "Pain worse after standing"'
        ],
        benefits: [
          'Provide concrete evidence to healthcare providers',
          'Identify triggers and helpful interventions',
          'Stronger case for accommodations or benefits',
          'Better self-management through awareness'
        ]
      },
      {
        name: 'Sleep & Energy Tracker',
        category: 'Wellness Tools',
        description: 'Track sleep quality and energy levels with smart 24-hour energy forecasting',
        userGuideSection: 'sleep-energy-tracker',
        highlights: [
          'Daily sleep quality and energy level logging',
          'Smart 24-hour energy forecasting using ML',
          'Weekly wellness reports with personalized insights',
          'Personalized recommendations based on patterns',
          'Export for clinical use or disability claims',
          'Always free energy management'
        ],
        examples: [
          'Log: "Slept 6 hours, woke 3 times, energy 4/10"',
          'See prediction: "Energy will peak at 2 PM today"',
          'Receive: "Best time for important tasks: 10 AM-1 PM"',
          'Notice: "Energy drops after busy Mondays"',
          'Plan medical appointments for high-energy days'
        ],
        benefits: [
          'Schedule activities when you have energy',
          'Understand connection between sleep and function',
          'Reduce burnout by respecting energy limits',
          'Advocate with data showing impact of fatigue'
        ]
      },
      {
        name: 'Adaptive Meditation',
        category: 'Wellness Tools',
        description: 'Accessible meditation sessions adjusted for energy levels and physical limitations',
        userGuideSection: 'adaptive-meditation',
        highlights: [
          'Short sessions (2-20 minutes) for low energy',
          'Adjustable for current energy levels',
          'Chair-friendly options for mobility limitations',
          'Guided breathing exercises with visual cues',
          'Customizable soundscapes or silence',
          'Free mindfulness for everyone'
        ],
        examples: [
          '2-minute breath focus when overwhelmed',
          'Chair yoga meditation for chronic pain',
          '10-minute body scan before sleep',
          'Silent meditation with visual timer',
          'Nature sounds to reduce anxiety'
        ],
        benefits: [
          'Reduce stress and anxiety naturally',
          'Accessible regardless of physical ability',
          'Fits into busy or low-energy days',
          'Improve sleep and emotional regulation'
        ]
      },
      {
        name: 'DBT Skill Matcher',
        category: 'Wellness Tools',
        description: 'Get instant DBT skill suggestions based on your current emotion - evidence-based therapy tools',
        userGuideSection: 'dbt-skill-matcher',
        highlights: [
          'Select current emotion for instant skill suggestions',
          'Evidence-based DBT (Dialectical Behavior Therapy) techniques',
          'Easy-to-follow instructions for each skill',
          'Track which skills work best for you',
          'Covers distress tolerance, emotion regulation, interpersonal effectiveness',
          'Free access to therapy-grade skills'
        ],
        examples: [
          'Feeling anxious? Get: "TIPP skill - temperature change"',
          'Feeling angry? Get: "Opposite Action - act opposite to emotion"',
          'Feeling overwhelmed? Get: "STOP skill - pause before reacting"',
          'Track: "TIPP skill helped 4 out of 5 times"',
          'Learn: "Radical Acceptance - accept what you can\'t change"'
        ],
        benefits: [
          'Evidence-based coping skills in the moment',
          'Learn therapeutic techniques without therapist',
          'Reduce crisis situations and improve regulation',
          'Complement your therapy or counseling work'
        ]
      },
      {
        name: 'Pacing Partner',
        category: 'Wellness Tools',
        description: 'Plan activities around your energy with spoon theory tracking and break reminders',
        userGuideSection: 'pacing-partner',
        highlights: [
          'Activity planning with energy budgeting',
          'Spoon theory tracking (energy units)',
          'Automatic break reminders during tasks',
          'Daily pacing suggestions based on energy',
          'Prevention of overexertion and crashes',
          'Completely free energy management'
        ],
        examples: [
          'Plan: "Morning shower (2 spoons), rest, grocery trip (4 spoons)"',
          'Get reminder: "You\'ve been active 45 min, take a break"',
          'Suggestion: "Low energy today - prioritize essentials"',
          'Learn: "Folding laundry costs me 3 spoons"',
          'Prevent: Avoid scheduling too much on one day'
        ],
        benefits: [
          'Avoid energy crashes and flare-ups',
          'Accomplish more by pacing appropriately',
          'Better communicate limitations to others',
          'Reduce guilt about resting when needed'
        ]
      },
      {
        name: 'Resilience Points (Gamified Wellness)',
        category: 'Wellness Tools',
        description: 'Earn points for small wins and track therapy goals with gamification',
        userGuideSection: 'resilience-points',
        highlights: [
          'Earn points for self-care and progress',
          'Track therapy goals and commitments',
          'Celebrate small wins with achievement badges',
          'Weekly summaries of your accomplishments',
          'No competition - just personal growth',
          'Always free motivation and tracking'
        ],
        examples: [
          'Earn 10 points: Logged mood for 7 days straight',
          'Earn 25 points: Completed difficult phone call',
          'Badge unlocked: "Week Warrior" (7 days of tracking)',
          'Weekly: "You earned 150 points this week!"',
          'Goal: "Practice DBT skills 3x this week" (achieved!)'
        ],
        benefits: [
          'Positive reinforcement for healthy behaviors',
          'Visual progress reduces discouragement',
          'Motivation to stick with wellness practices',
          'Celebrate victories often invisible to others'
        ]
      },
      {
        name: 'Grief Support',
        category: 'Wellness Tools',
        description: 'Compassionate tools and resources for processing loss and grief',
        userGuideSection: 'grief-support',
        highlights: [
          'Psychoeducation about grief stages and process',
          'Journaling prompts for processing emotions',
          'Memorial space for honoring loved ones',
          'Connection to grief support groups',
          'Crisis resources for overwhelming grief',
          'Free, private grief support'
        ],
        examples: [
          'Read: "Grief is not linear - all feelings are valid"',
          'Journal: "What I miss most about them..."',
          'Create digital memorial with photos and memories',
          'Find local grief support groups in your area',
          'Access crisis line when grief feels unbearable'
        ],
        benefits: [
          'Normalize your grief experience',
          'Process complex emotions safely',
          'Honor your loved one privately',
          'Connect with others who understand loss'
        ]
      },
      {
        name: 'Self-Care Library',
        category: 'Wellness Tools',
        description: 'Curated collection of self-care activities organized by energy level and time',
        userGuideSection: 'self-care-library',
        highlights: [
          'Activities organized by energy level (low, medium, high)',
          'Time estimates for each activity (5-60 minutes)',
          'Categories: physical, emotional, social, creative, rest',
          'Favorites and custom activities',
          'Daily self-care reminders',
          'Completely free self-care resources'
        ],
        examples: [
          'Low energy: "Listen to favorite podcast in bed"',
          'Medium energy: "Take short walk around block"',
          'High energy: "Call friend for video chat"',
          'Quick: "5-minute breathing exercise"',
          'Extended: "Take relaxing bath with music"'
        ],
        benefits: [
          'Find appropriate self-care for current capacity',
          'Reduce decision fatigue about what to do',
          'Build consistent self-care practice',
          'Remember activities that help you feel better'
        ]
      },
      {
        name: 'Reflections Calendar',
        category: 'Wellness Tools',
        description: 'Visual calendar for tracking mood, achievements, and personal reflections',
        userGuideSection: 'reflections-calendar',
        highlights: [
          'Visual calendar with color-coded moods',
          'Daily reflection prompts and notes',
          'See patterns across weeks and months',
          'Track achievements and difficult days',
          'Export calendar view as image or PDF',
          'Free personal reflection tool'
        ],
        examples: [
          'See: "October had more green (good) days than September"',
          'Notice: "Week before my period is always harder"',
          'Reflect: "What helped me through last Tuesday?"',
          'Achievement: "3 weeks of consistent tracking!"',
          'Share calendar view with therapist'
        ],
        benefits: [
          'Visual representation of progress',
          'Identify patterns in mood and energy',
          'Evidence of improvement over time',
          'Celebrate good days and learn from hard ones'
        ]
      },
      // ADVOCACY & LEGAL TOOLS
      {
        name: 'Lawyer Finder',
        category: 'Advocacy Tools',
        description: 'Find disability law specialists, legal aid services, and advocacy lawyers in your area',
        userGuideSection: 'lawyer-finder',
        highlights: [
          'Filter by disability law specialization',
          'Location-based search across all provinces',
          'Legal aid and free/low-cost services highlighted',
          'Ratings and reviews from community',
          'Contact information and consultation details',
          'No endorsement - research all lawyers yourself'
        ],
        examples: [
          'Search: "WSIB appeal lawyer in Ontario"',
          'Filter: "Legal aid services in Vancouver"',
          'Find: "Human rights lawyer with disability experience"',
          'Review: Read experiences from other clients',
          'Contact: Phone, email, accessibility info provided'
        ],
        benefits: [
          'Find specialized legal help quickly',
          'Discover free and affordable options',
          'Learn from others\' experiences',
          'Access lawyers familiar with disability issues'
        ]
      },
      {
        name: 'Policy Explainer (Policy Made Simple)',
        category: 'Advocacy Tools',
        description: 'Translate complex policies, laws, and decisions into plain language',
        userGuideSection: 'policy-simplifier',
        highlights: [
          'AI translates legal jargon to plain language',
          'Explains your rights in simple terms',
          'Covers employment law, benefits, human rights',
          'Examples and scenarios for clarity',
          'Save explanations for future reference',
          'Always free - no premium explanations'
        ],
        examples: [
          'Input: Complex benefits denial letter',
          'Output: "They denied because... You can appeal by..."',
          'Search: "What is duty to accommodate?"',
          'Learn: "Employers must accommodate to point of undue hardship"',
          'Understand: "What does \'undue hardship\' actually mean?"'
        ],
        benefits: [
          'Understand your legal situation clearly',
          'Know your rights without law degree',
          'Make informed decisions about next steps',
          'Reduce intimidation of legal processes'
        ]
      },
      {
        name: 'AI Case Interpreter',
        category: 'Advocacy Tools',
        description: 'Upload legal documents and get plain-language summaries and next-step guidance',
        userGuideSection: 'ai-case-interpreter',
        highlights: [
          'Upload benefits decisions, court documents, letters',
          'AI analyzes and summarizes in plain language',
          'Identifies key dates, deadlines, and action items',
          'Suggests next steps and resources',
          'Highlights concerning language or issues',
          'Free document analysis for everyone'
        ],
        examples: [
          'Upload: 15-page benefits denial decision',
          'Get: "Denied for: insufficient medical evidence"',
          'Deadline: "Appeal must be filed by November 15"',
          'Next: "Gather updated medical reports, draft appeal letter"',
          'Warning: "Language suggests they didn\'t review all evidence"'
        ],
        benefits: [
          'Understand complex documents quickly',
          'Never miss critical deadlines',
          'Know exactly what to do next',
          'Spot issues to raise with lawyer'
        ]
      },
      {
        name: 'Accountability Tracker',
        category: 'Advocacy Tools',
        description: 'Track promises made by employers, government agencies, and service providers',
        userGuideSection: 'accountability-tracker',
        highlights: [
          'Log promises with dates and details',
          'Set follow-up reminders automatically',
          'Document broken promises with evidence',
          'Track delays and non-compliance',
          'Export for complaints or legal action',
          'Always free accountability tools'
        ],
        examples: [
          'Promise: "Employer will provide standing desk by Oct 15"',
          'Reminder: "Oct 15 - Check if standing desk arrived"',
          'Document: "Oct 20 - Still no desk, employer cited budget"',
          'Evidence: Emails and meeting notes saved',
          'Export: Report for union rep or lawyer'
        ],
        benefits: [
          'Hold organizations accountable',
          'Document patterns of non-compliance',
          'Stronger case if you need to escalate',
          'Reduce gaslighting about what was promised'
        ]
      },
      {
        name: 'AI Translator (Accessibility Terminology)',
        category: 'Advocacy Tools',
        description: 'Translate between medical, legal, and plain language for disability terms',
        userGuideSection: 'ai-translator',
        highlights: [
          '100+ accessibility terminology translations',
          'Medical to plain language conversion',
          'Legal to plain language conversion',
          'Plain language to professional terminology',
          'Context-aware translations',
          'Completely free translation tool'
        ],
        examples: [
          'Medical: "Ambulatory dysfunction" â†’ Plain: "Difficulty walking"',
          'Legal: "Reasonable accommodation" â†’ Plain: "Changes employer must make"',
          'Plain: "I can\'t work full time" â†’ Professional: "Reduced capacity requiring part-time arrangement"',
          'Context: Translates differently for doctor vs employer',
          'Learn: Build your advocacy vocabulary'
        ],
        benefits: [
          'Communicate clearly with professionals',
          'Understand what doctors and lawyers are saying',
          'Advocate effectively using proper terminology',
          'Bridge communication gaps'
        ]
      },
      // COMMUNITY TOOLS
      {
        name: 'Peer Support Matching',
        category: 'Community Tools',
        description: 'Connect with others who share similar disabilities, experiences, and challenges',
        userGuideSection: 'peer-support-matching',
        highlights: [
          'Match algorithm considers disability type, experiences, location',
          '94% accuracy matching based on multiple factors',
          'Safety verification and privacy controls',
          'Optional - never required to match',
          'Block and report features for safety',
          'Free peer support connections'
        ],
        examples: [
          'Match: "Also navigating WSIB claim in Ontario"',
          'Match: "Chronic pain + workplace accommodation"',
          'Match: "Parent with disability raising kids"',
          'Privacy: "Share only what you\'re comfortable with"',
          'Safety: "Report concerning behavior instantly"'
        ],
        benefits: [
          'Feel less alone in your struggles',
          'Learn from others\' experiences',
          'Practical advice from people who understand',
          'Build long-term support relationships'
        ]
      },
      {
        name: 'Discussion Forums',
        category: 'Community Tools',
        description: 'Moderated forums for questions, advice, and shared experiences',
        userGuideSection: 'discussion-forums',
        highlights: [
          'Topics: Workplace, Benefits, Health, Daily Life, Legal',
          'Moderated for safety and respectfulness',
          'Anonymous posting option available',
          'Search past discussions',
          'Report violations easily',
          'Always free community discussions'
        ],
        examples: [
          'Post: "Has anyone appealed CPP-D successfully?"',
          'Ask: "How to explain invisible disability to employer?"',
          'Share: "I got my accommodation approved!"',
          'Search: "Find previous discussions about ODSP"',
          'Learn: Read threads about issues you\'re facing'
        ],
        benefits: [
          'Get diverse perspectives and advice',
          'Learn from community wisdom',
          'Share your knowledge to help others',
          'Feel connected to supportive community'
        ]
      },
      {
        name: 'Virtual Meetups',
        category: 'Community Tools',
        description: 'Join accessible online gatherings for community connection and support',
        userGuideSection: 'virtual-meetups',
        highlights: [
          'Regular scheduled meetups by topic and region',
          'Fully accessible with captions and accommodations',
          'Drop-in or RSVP options available',
          'Facilitated by trained community moderators',
          'Small groups for safety and connection',
          'Free virtual community events'
        ],
        examples: [
          'Join: "Ontario WSIB support group - Mondays 7 PM"',
          'Attend: "Chronic pain peer support - Thursdays 2 PM"',
          'Participate: "New to benefits? Orientation - First Fridays"',
          'Accessible: Captions, ASL, pace adjustments available',
          'Safe: Community guidelines enforced'
        ],
        benefits: [
          'Face-to-face connection from home',
          'Real-time support and advice',
          'Make friends with shared experiences',
          'Reduce isolation and loneliness'
        ]
      },
      // CAMPAIGN & EVENTS TOOLS
      {
        name: 'Campaign Coordination',
        category: 'Campaign Tools',
        description: 'Organize advocacy campaigns with tools for collaboration, task management, and impact tracking',
        userGuideSection: 'campaign-coordination',
        highlights: [
          'Create campaigns around specific issues',
          'Invite collaborators and assign roles',
          'Task management and deadline tracking',
          'Share resources and strategy documents',
          'Track campaign progress and wins',
          'Free organizing tools for disability justice'
        ],
        examples: [
          'Campaign: "Accessible transit in our city"',
          'Tasks: "Draft petition", "Contact councillors", "Organize rally"',
          'Collaborate: "10 community members working together"',
          'Progress: "500 petition signatures, 3 meetings scheduled"',
          'Win: "Transit commits to accessible bus stop program!"'
        ],
        benefits: [
          'Organize effectively with clear structure',
          'Coordinate across multiple people easily',
          'Track progress toward collective goals',
          'Achieve bigger impact through collaboration'
        ]
      },
      {
        name: 'Campaign Templates',
        category: 'Campaign Tools',
        description: 'Pre-built templates for common advocacy campaigns and organizing efforts',
        userGuideSection: 'campaign-templates',
        highlights: [
          'Templates for: Accessibility, Benefits, Employment, Healthcare',
          'Pre-written tasks, timelines, and resource lists',
          'Customizable to your specific situation',
          'Proven strategies from successful campaigns',
          'Step-by-step guides included',
          'Always free organizing templates'
        ],
        examples: [
          'Use: "Accessible Workplace Campaign Template"',
          'Includes: "Sample accommodation requests, meeting agendas, email templates"',
          'Customize: "Add your organization\'s specific issues"',
          'Follow: "6-week timeline from planning to action"',
          'Learn: "What worked for similar campaigns"'
        ],
        benefits: [
          'Start campaigns quickly without reinventing wheel',
          'Learn from successful organizing strategies',
          'Save time with pre-written materials',
          'Increase likelihood of campaign success'
        ]
      },
      // RESOURCES TOOLS
      {
        name: 'Benefits Tracker',
        category: 'Resources Tools',
        description: 'Track benefit applications, payments, deadlines, and communications - always free',
        userGuideSection: 'benefits-tracker',
        highlights: [
          'Log all benefit applications and statuses',
          'Track payment amounts and dates',
          'Store correspondence and decisions',
          'Deadline reminders for recertification',
          'Note discrepancies and issues',
          'Free benefits management'
        ],
        examples: [
          'Track: "CPP-D application submitted April 1, awaiting decision"',
          'Log: "ODSP payment received: $1,308 on Sept 30"',
          'Store: "Upload approval letter and payment schedule"',
          'Reminder: "Recertify ODSP by November 15"',
          'Note: "Payment $50 short - need to call office"'
        ],
        benefits: [
          'Never miss recertification deadlines',
          'Catch payment errors quickly',
          'Evidence for appeals or complaints',
          'Organized record of your benefits'
        ]
      },
      {
        name: 'Medication Tracker',
        category: 'Resources Tools',
        description: 'Track medications, dosages, refills, and side effects with reminder system',
        userGuideSection: 'medication-tracker',
        highlights: [
          'Log all medications with dosages and schedules',
          'Refill reminders based on supply',
          'Track side effects and effectiveness',
          'Export for doctor appointments',
          'Drug interaction warnings',
          'Always free medication management'
        ],
        examples: [
          'Track: "Gabapentin 300mg, 3x daily with meals"',
          'Reminder: "Refill due in 5 days - call pharmacy"',
          'Log: "Side effect: Dizziness after morning dose"',
          'Export: "Medication list for specialist appointment"',
          'Warning: "Potential interaction between Drug A and Drug B"'
        ],
        benefits: [
          'Never run out of essential medications',
          'Track effectiveness for doctor discussions',
          'Identify side effects and patterns',
          'Safer medication management with interaction alerts'
        ]
      },
      {
        name: 'Deadlines & Reminders',
        category: 'Resources Tools',
        description: 'Never miss critical legal, medical, or benefits deadlines with smart reminder system',
        userGuideSection: 'deadlines-reminders',
        highlights: [
          'Track all important deadlines in one place',
          'Multiple reminder notifications (1 week, 3 days, 1 day)',
          'Categorize by type: legal, medical, benefits, personal',
          'Snooze and reschedule options',
          'Completed deadline history',
          'Free deadline management'
        ],
        examples: [
          'Deadline: "Appeal must be filed by October 31"',
          'Reminders: "October 24 (1 week), Oct 28 (3 days), Oct 30 (1 day)"',
          'Category: "Legal - Benefits Appeal"',
          'Link: "Connected to Evidence Locker documents"',
          'History: "Filed on Oct 29 - mark complete"'
        ],
        benefits: [
          'Reduce stress about forgetting important dates',
          'Protect your legal rights with timely action',
          'Stay organized across multiple processes',
          'Evidence you met deadlines if questioned'
        ]
      },
      {
        name: 'Government Navigator',
        category: 'Resources Tools',
        description: 'Simplified guide to government services, programs, and benefits across all provinces',
        userGuideSection: 'government-navigator',
        highlights: [
          'Directory of federal and provincial programs',
          'Eligibility pre-screening tools',
          'Application process guides',
          'Contact information for all government offices',
          'Plain language explanations',
          'Completely free government navigation'
        ],
        examples: [
          'Explore: "All disability programs available in Manitoba"',
          'Check: "Am I eligible for CPP Disability?"',
          'Guide: "Step-by-step ODSP application process"',
          'Contact: "Find phone number and hours for CRA Disability Tax Credit line"',
          'Understand: "Plain language guide to EI sickness benefits"'
        ],
        benefits: [
          'Discover programs you didn\'t know about',
          'Understand eligibility before applying',
          'Navigate bureaucracy with clear guidance',
          'Access all government resources in one place'
        ]
      },
      // ═══ COLLECTIVE FEATURES: THE 3 FLYWHEELS ═══════════════════════════════
      {
        name: 'The 3 Flywheels of Change: Turning Lived Experience Into Power',
        category: 'Collective Intelligence',
        description: 'Three interconnected systems that transform individual struggles into collective knowledge, pattern detection, and policy change',
        userGuideSection: 'three-flywheels',
        highlights: [
          '🔵 Evidence Flywheel: Your wins become proven templates that save others hours',
          '🟠 Pattern Detection Flywheel: Aggregated data reveals systemic discrimination',
          '🟢 Collective Action Flywheel: Organized evidence drives targeted advocacy',
          'Privacy-first: individual data never leaves your device',
          'Pattern analysis happens on aggregated, anonymized insights only',
          'Closed loop: victories feed back into templates and knowledge base'
        ],
        examples: [
          'Evidence Flywheel: Successful accommodation letter → Template library → 500 workers save 2 hours each',
          'Pattern Detection: 200 users denied by same adjudicator → Pattern identified → Legal challenge launched',
          'Collective Action: Community organizes campaign using shared evidence → Policy reformed',
          'You document your case → Others anonymously benefit from patterns → System improves for everyone',
          'Full transparency: see how your anonymized contribution helps the community (opt-in only)'
        ],
        benefits: [
          'Individual documentation becomes collective power',
          'Your struggles contribute to systemic change (privacy-preserved)',
          'Access winning strategies from thousands of previous cases',
          'Transform isolated experiences into organized advocacy'
        ]
      },
      {
        name: 'Evidence Flywheel: Your Wins Power Community Templates',
        category: 'Collective Intelligence',
        description: 'When you win your case, the strategies that worked become templates that help others - creating a flywheel of collective success',
        userGuideSection: 'evidence-flywheel',
        highlights: [
          'Successful letters and documentation become community templates',
          'Winning arguments analyzed and added to knowledge base',
          'Template library grows with every community victory',
          'All contributions are opt-in and anonymized',
          'Attribution credit for contributors (optional)',
          'Quality review ensures only proven strategies are shared'
        ],
        examples: [
          'You win WSIB appeal → Your accommodation letter becomes template → 500 workers use it',
          'Successful CPP-D application → Medical evidence format added to guide → 1,000 applicants benefit',
          'Human rights complaint succeeds → Legal strategy documented → Community replicates approach',
          'Template tracks success rate: "This letter has been used 347 times, 89% success rate"',
          'See impact: "Your contribution helped 1,200 community members"'
        ],
        benefits: [
          'Community learns from your hard-won victories',
          'Reduce duplication of effort across thousands of claims',
          'Proven strategies replace guesswork',
          'Feel proud of contributing to collective progress'
        ]
      },
      {
        name: 'Pattern Detection Flywheel: Turning Data Into Systemic Evidence',
        category: 'Collective Intelligence',
        description: 'Designed to aggregate anonymized data revealing discrimination patterns invisible to individuals - intended to power legal challenges and policy reform',
        userGuideSection: 'pattern-detection-flywheel',
        highlights: [
          'Architecture supports aggregate analysis of systemic discrimination',
          '100% privacy-preserving design: individual data never accessed',
          'System can identify patterns: biased adjudicators, discriminatory policies, regional disparities',
          'Output designed as legal-grade evidence for human rights complaints',
          'Alert system planned for when patterns affect specific users',
          'Community input mechanism for prioritizing pattern investigations'
        ],
        examples: [
          'Potential pattern detection: "Adjudicator X approval rate significantly lower for specific diagnosis"',
          'Trend analysis capability: "Denial rates by time period and jurisdiction"',
          'Geographic comparison: "Regional disparities in claim outcomes"',
          'Demographic analysis: "Outcome variations by protected characteristics"',
          'Use case: Patterns presented as evidence in human rights proceedings'
        ],
        benefits: [
          'Transform individual experiences into systemic evidence',
          'Validate lived experiences with aggregate data',
          'Create legal ammunition for class actions and policy challenges',
          'Build early warning system for biased decision-making'
        ]
      },
      {
        name: 'Collective Action Flywheel: Organized Evidence Drives Policy Change',
        category: 'Collective Intelligence',
        description: 'Tools designed to connect individual cases into organized campaigns for institutional accountability and systemic reform',
        userGuideSection: 'collective-action-flywheel',
        highlights: [
          'Discovery tools help find others facing same employer, insurer, or system',
          'Campaign coordination features for organizing collective responses',
          'Shared evidence repositories with permission-based access controls',
          'Template campaigns available: class actions, media campaigns, regulatory complaints',
          'Progress tracking systems: campaign milestones, media coverage, policy changes',
          'Legal referral network connections for collective representation'
        ],
        examples: [
          'Use case: Workers facing same insurer organize coordinated complaint to regulator',
          'Scenario: Community identifies policy gap, coordinates advocacy effort',
          'Template: Pattern documentation → Press release → Media outreach workflow',
          'Connection: Platform helps affected individuals find each other for class actions',
          'Knowledge base: Successful campaign strategies documented for replication'
        ],
        benefits: [
          'Transform individual grievances into collective advocacy power',
          'Leverage strength in numbers for institutional accountability',
          'Focus on systemic change beyond individual accommodations',
          'Reduce barriers to organizing with ready-made campaign templates'
        ]
      },
      // ═══ CANLII DATABASE & LEGAL INTELLIGENCE ═════════════════════════════
      {
        name: 'CanLII Database: Ontario WSIB & HRTO Cases (Expanding Canada-Wide)',
        category: 'Legal Intelligence',
        description: 'Searchable database of Canadian workplace and disability cases with plain-language summaries - starting with Ontario, expanding daily to all provinces',
        userGuideSection: 'canlii-database',
        highlights: [
          'Starting with Ontario: 1,800+ WSIB and HRTO cases (2020-2026)',
          'Database grows daily: adding cases from all provinces and territories',
          'Goal: Complete Canada-wide coverage across all jurisdictions',
          '65% disability-relevance match rate through AI filtering',
          'Plain-language summaries generated for every case',
          'Winning arguments extracted and categorized by issue type',
          'Search by: province, diagnosis, employer type, issue, outcome',
          'Case law citations in proper legal format',
          'Completely free - no paywalled legal decisions'
        ],
        examples: [
          'Current coverage: Ontario WSIB, HRTO, and related tribunals',
          'Expanding next: BC, Alberta, Quebec provincial tribunals',
          'Search: "Fibromyalgia accommodation Ontario" → Find relevant precedents',
          'Discovery: "Employer refused remote work - tribunal ruled discrimination"',
          'Winning argument template: "Undue hardship requires hard evidence, not speculation"',
          'Track expansion: New provinces added weekly to database'
        ],
        benefits: [
          'Access real Canadian case law for your jurisdiction',
          'Find precedents similar to your situation',
          'Database continuously improving with daily additions',
          'Eventually covers all provinces and territories'
        ]
      },
      {
        name: 'Case Law Summarizer: Legal Decisions in Plain Language',
        category: 'Legal Intelligence',
        description: 'Upload any legal decision and get a plain-language summary highlighting key findings, winning arguments, and relevance to your case',
        userGuideSection: 'case-law-summarizer',
        highlights: [
          'AI-powered summarization of complex legal decisions',
          'Extracts: key facts, legal issues, tribunal findings, outcome',
          'Highlights winning arguments and reasoning',
          'Assesses relevance to your specific situation',
          'Generates citations in proper legal format',
          'Saves summaries to your Evidence Locker'
        ],
        examples: [
          'Upload: 40-page WSIB tribunal decision',
          'Get: "Claimant won. Key finding: Employer failed to consider ergonomic accommodation"',
          'Relevance: "This case is highly relevant - same diagnosis and similar workplace setup"',
          'Winning argument: "Tribunal emphasized employer\'s duty to explore all accommodation options"',
          'Citation: "Jones v. WSIB, 2024 WSIAT 456 - use this in your appeal"'
        ],
        benefits: [
          'Understand legal decisions without law degree',
          'Identify precedents that support your case',
          'Save hours of reading dense legal text',
          'Communicate effectively with lawyers using plain language'
        ]
      },
      {
        name: 'Winning Arguments Library: Successful Legal Strategies from Case Law',
        category: 'Legal Intelligence',
        description: 'Database of successful legal arguments extracted from Canadian disability cases - organized by issue type and outcome',
        userGuideSection: 'winning-arguments-library',
        highlights: [
          'Arguments extracted from actual tribunal and court decisions',
          'Organized by: accommodation type, diagnosis, legal issue, jurisdiction',
          'Success rate calculated from case outcomes in database',
          'Template language adapted from actual successful cases',
          'Legal citations provided for every argument',
          'Database grows daily as new cases are added'
        ],
        examples: [
          'Search capability: "Remote work accommodation chronic pain" → relevant case arguments',
          'Example argument: "Undue hardship requires evidence, not assumption" (from successful cases)',
          'Template language: "The employer\'s assertion lacks supporting evidence..." (adapted from actual decisions)',
          'Citation format: "Supported by [Case Name] v. [Respondent], [Year] [Tribunal] [Number]"',
          'Source: All arguments extracted from publicly available case law'
        ],
        benefits: [
          'Access legal strategies from actual successful cases',
          'Adapt arguments from similar fact patterns to your case',
          'Reference actual precedents in your submissions',
          'Educate decision-makers with established legal principles'
        ]
      },
      // ═══ MORE INDIVIDUAL TOOLS ═════════════════════════════════════════════
      {
        name: 'Document Scanner with OCR: Paper to Searchable Text',
        category: 'Productivity Tools',
        description: 'Scan paper documents with your phone camera and convert to searchable, encrypted text - perfect for medical records and legal papers',
        userGuideSection: 'document-scanner',
        highlights: [
          'Camera-based scanning with automatic edge detection',
          'OCR (Optical Character Recognition) converts images to searchable text',
          'Auto-enhancement: brightness, contrast, de-skew',
          'Multi-page scanning for full documents',
          'Saves to Evidence Locker with encryption',
          'Export as PDF or text for sharing'
        ],
        examples: [
          'Scan: Medical report from doctor appointment → Searchable PDF in Evidence Locker',
          'Batch scan: 10-page benefits decision → All text searchable and organized',
          'Search: "Find all documents mentioning \'accommodation\'" → Instant results',
          'Share: Export scan as PDF for lawyer or representative',
          'Backup: Upload to encrypted cloud sync (optional)'
        ],
        benefits: [
          'Never lose important paper documents',
          'Search all your documents instantly',
          'Share professional-quality PDFs',
          'Go paperless while maintaining security'
        ]
      },
      {
        name: 'Voice Memo Evidence Logger: Document Incidents Hands-Free',
        category: 'Evidence Tools',
        description: 'Record voice memos about workplace incidents, symptoms, or important events - auto-transcribed and encrypted with timestamps',
        userGuideSection: 'voice-memo-logger',
        highlights: [
          'One-tap voice recording from anywhere in app',
          'Automatic transcription to text (offline-capable)',
          'Timestamp and GPS coordinates (optional)',
          'Tag with categories: incident, symptom, meeting, conversation',
          'Saves to Evidence Locker with encryption',
          'Export transcripts for legal documentation'
        ],
        examples: [
          'Incident: Record workplace harassment immediately after it happens',
          'Symptom: "Voice log: Pain level 8/10, unable to sit for more than 10 minutes"',
          'Meeting: Record post-meeting summary while details are fresh',
          'Legal: Auto-transcript provides dated written record for court or tribunal',
          'Search: Find all memos tagged "supervisor conversation"'
        ],
        benefits: [
          'Capture evidence when typing is too difficult',
          'Create contemporaneous records (strongest legal evidence)',
          'Never forget important details',
          'Reduce cognitive load during flare-ups'
        ]
      },
      {
        name: 'Timeline Builder: Visualize Your Legal Journey',
        category: 'Evidence Tools',
        description: 'Auto-generate visual timelines from your Evidence Locker entries - powerful tool for appeals, legal representation, and understanding patterns',
        userGuideSection: 'timeline-builder',
        highlights: [
          'Automatic timeline from all dated evidence',
          'Visual representation: medical records, workplace incidents, benefits correspondence',
          'Filter by category, date range, or tags',
          'Highlight key events with custom markers',
          'Export as PDF or image for legal submissions',
          'Share-ready format for lawyers and tribunals'
        ],
        examples: [
          'Generate: Complete timeline from injury date to present',
          'Filter: "Show only medical appointments and insurer denials"',
          'Highlight: Mark critical events - "Accommodation request denied", "Injury occurred"',
          'Pattern: Visual shows 3-month gap between injury and first physiotherapy approval',
          'Export: Professional PDF timeline for appeal hearing'
        ],
        benefits: [
          'Communicate complex history at a glance',
          'Identify gaps or delays visually',
          'Powerful visual aid for legal proceedings',
          'Understand your own journey more clearly'
        ]
      },
      {
        name: 'Accommodation Request Tracker: Never Let Them Ghost You',
        category: 'Workplace Tools',
        description: 'Track accommodation requests with automatic follow-up reminders - hold employers accountable with documented timelines',
        userGuideSection: 'accommodation-tracker',
        highlights: [
          'Log every accommodation request with date and details',
          'Automatic follow-up reminders (7 days, 14 days, 30 days)',
          'Status tracking: requested, under review, approved, denied, implemented',
          'Store all related correspondence in Evidence Locker',
          'Timeline shows employer delays and non-responses',
          'Export documentation for human rights complaints'
        ],
        examples: [
          'Request: "Standing desk requested March 1"',
          'Reminder: "No response after 14 days - follow up now"',
          'Document: "Email sent March 15 - still no response"',
          'Pattern: "Timeline shows 87 days from request to implementation"',
          'Evidence: Export full accommodation history for HRTO complaint'
        ],
        benefits: [
          'Hold employers accountable for timely responses',
          'Document delays for legal proceedings',
          'Never forget to follow up',
          'Build strong case for duty to accommodate violations'
        ]
      },
      // ═══ MORE ACCESSIBILITY FEATURES ═══════════════════════════════════════
      {
        name: 'Cognitive Load Reducer: Simplify Complex Information',
        category: 'Cognitive Accessibility',
        description: 'Transform dense text, legal documents, and complex instructions into simple, digestible formats - essential for brain fog and cognitive disabilities',
        userGuideSection: 'cognitive-load-reducer',
        highlights: [
          'AI summarization of complex documents to key points',
          'Bullet-point extraction from dense paragraphs',
          'Reading level adjustment (Grade 5-12)',
          'Visual hierarchy improvements with headings and spacing',
          'Chunking: break long content into manageable sections',
          'Progressive disclosure: show details only when requested'
        ],
        examples: [
          'Input: 10-page benefits decision → Output: 5 key points',
          'Simplify: Legal jargon → Plain language explanation',
          'Chunk: Long article → 7 short sections with headings',
          'Reading level: Adjust complex text to Grade 8 reading level',
          'Progressive: Main points visible, details expandable'
        ],
        benefits: [
          'Access complex information despite cognitive limitations',
          'Reduce overwhelm and decision fatigue',
          'Understand important documents on hard days',
          'Accommodate ADHD, brain fog, TBI, learning disabilities'
        ]
      },
      {
        name: 'ADHD Focus Mode: Minimize Distractions, Maximize Completion',
        category: 'Cognitive Accessibility',
        description: 'Focused interface with one task at a time, progress tracking, and dopamine-friendly rewards - designed with ADHD community input',
        userGuideSection: 'adhd-focus-mode',
        highlights: [
          'One task at a time: hide everything else until current task complete',
          'Visual progress bars and completion animations',
          'Break reminders every 25 minutes (Pomodoro technique)',
          'Gamification: earn points for task completion',
          'Minimal distractions: notifications paused during focus mode',
          'Quick-switch to full interface when hyperfocus kicks in'
        ],
        examples: [
          'Task: "Complete CPP-D application: Section 1" → Only that form visible',
          'Progress: "Step 3 of 7 complete - 43% done!"',
          'Break: "You\'ve been working 25 min - take a 5 min break"',
          'Reward: "+10 points! Badge unlocked: Application Warrior"',
          'Switch: "Feeling focused? Exit Focus Mode to access all features"'
        ],
        benefits: [
          'Complete important tasks without distraction',
          'Reduce task-switching and overwhelm',
          'Celebrate small wins with dopamine rewards',
          'Accommodate executive function challenges'
        ]
      },
      {
        name: 'Colorblind-Friendly Mode: Visual Accessibility for 350M People',
        category: 'Visual Accessibility',
        description: 'Alternative color schemes optimized for deuteranopia, protanopia, and tritanopia - ensuring key information never relies on color alone',
        userGuideSection: 'colorblind-mode',
        highlights: [
          'Support for deuteranopia (red-green), protanopia (red-green), tritanopia (blue-yellow)',
          'Alternative color palettes tested by colorblind community members',
          'Patterns and textures supplement color coding',
          'High-contrast outlines on important UI elements',
          'Icons and labels accompany color indicators',
          'Automatic simulation tool to preview your view'
        ],
        examples: [
          'Status: Success/error shown with ✓/✗ icons + color',
          'Charts: Patterns (dots, stripes, hatching) distinguish data series',
          'Alerts: Important notifications use bold outlines + icons',
          'Testing: Simulate deuteranopia to see what community members see',
          'Customization: Choose palette that works best for your vision'
        ],
        benefits: [
          'Access app features regardless of color vision',
          'No critical information conveyed by color alone',
          'Community-tested and validated',
          'Includes often-overlooked tritanopia support'
        ]
      },
      // ═══ MORE WELLNESS & HEALTH TOOLS ══════════════════════════════════════
      {
        name: 'Anxiety Tracker with CBT Tools:Monitor Patterns, Challenge Thoughts',
        category: 'Mental Health Tools',
        description: 'Track anxiety triggers, intensity, and duration - with integrated CBT (Cognitive Behavioral Therapy) thought-challenging exercises',
        userGuideSection: 'anxiety-tracker',
        highlights: [
          'Log anxiety episodes with intensity (0-10) and triggers',
          'Thought records: capture anxious thoughts in the moment',
          'CBT exercises: challenge cognitive distortions',
          'Pattern detection: identify common triggers over time',
          'Coping strategy library with evidence-based techniques',
          'Export summaries for therapist or psychiatrist'
        ],
        examples: [
          'Log: "Anxiety 8/10 - trigger: phone call with WSIB"',
          'Thought: "They\'ll never approve my claim"',
          'Challenge: "Evidence? I have strong medical documentation"',
          'Reframe: "Outcome uncertain, but I\'m prepared with evidence"',
          'Pattern: "Phone calls with authority figures trigger 7+ anxiety 80% of the time"'
        ],
        benefits: [
          'Understand anxiety patterns and triggers',
          'Practice CBT techniques in the moment',
          'Track progress in managing anxiety over time',
          'Share concrete data with mental health providers'
        ]
      },
      {
        name: 'Chronic Fatigue Management: Energy Banking for Crashes',
        category: 'Energy Management',
        description: 'Advanced energy management for ME/CFS, fibromyalgia, and chronic fatigue - with crash prediction and recovery protocols',
        userGuideSection: 'chronic-fatigue-management',
        highlights: [
          'Energy banking: track baseline, expenditure, and "debt"',
          'Crash prediction: alert when approaching danger zone',
          'PEM risk assessment (Post-Exertional Malaise)',
          'Recovery protocols for different severity crashes',
          'Activity-energy correlation tracking',
          'Pacing calculator: how much can I do today?'
        ],
        examples: [
          'Baseline: "I have 100 energy units today"',
          'Activity: "Grocery shopping: 40 units, medical appointment: 60 units"',
          'Alert: "You\'ve spent 95/100 units - high crash risk"',
          'Prediction: "If you continue, 85% chance of multi-day crash"',
          'Recovery: "Crash detected - enter Recovery Protocol: 3-day severe rest"'
        ],
        benefits: [
          'Prevent crashes through early warning system',
          'Understand true energy cost of activities',
          'Recover more effectively with structured protocols',
          'Advocate with data about energy limitations'
        ]
      }
      ,
      // === 13 PROVINCIAL PROGRAMS ===
      { name: 'Ontario ODSP Navigator: Eligibility, Application & Appeals', category: 'Provincial Benefits', description: 'Complete guide to Ontario Disability Support Program', userGuideSection: 'provincial-benefits', highlights: ['Eligibility: 18+, Ontario resident, substantial disability 1+ year', 'Monthly: $1,368 single (2026)', 'Asset limits: $40,000 single'], examples: ['Health benefits: Drugs, dental, vision'], benefits: ['Navigate appeals with confidence'] },
      { name: 'British Columbia PWD Program: Application to Approval', category: 'Provincial Benefits', description: 'BC Persons with Disabilities benefits', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,358 single (2026)', 'Asset limit: $100,000', '$15,000/year earnings exemption'], examples: ['Free transit pass'], benefits: ['Higher asset limits than most provinces'] },
      { name: 'Alberta AISH: Assured Income for the Severely Handicapped', category: 'Provincial Benefits', description: 'Alberta AISH - highest rates in Canada', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,787 (2026) - highest in Canada', 'Asset limit: $100,000'], examples: ['Indexed to inflation'], benefits: ['Highest monthly rate'] },
      { name: 'Québec Programme de solidarité sociale', category: 'Provincial Benefits', description: 'Quebec disability benefits (bilingual)', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,208 single (2026)', 'Housing supplement: $161/month'], examples: ['Bilingual EN/FR service'], benefits: ['Housing supplements'] },
      { name: 'Saskatchewan SIS: Disability Income Support', category: 'Provincial Benefits', description: 'Saskatchewan disability program', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,200-$1,400', 'Comprehensive health benefits'], examples: ['No CPP-D clawback'], benefits: ['Simplified application'] },
      { name: 'Manitoba EIA Disability Benefits', category: 'Provincial Benefits', description: 'Manitoba disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,200-$1,400', 'Pharmacare after deductible'], examples: ['Deductible as low as $100/year'], benefits: ['Pharmacare coverage'] },
      { name: 'Nova Scotia Income Assistance: Disability', category: 'Provincial Benefits', description: 'NS disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,100-$1,300', 'Pharmacare: $424/year max'], examples: ['Emergency dental'], benefits: ['Pharmacare caps costs'] },
      { name: 'New Brunswick Disability Support Program', category: 'Provincial Benefits', description: 'NB disability program', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,050-$1,250', 'Drug plan: $15 co-pay (max $250/year)'], examples: ['Transitional supports'], benefits: ['Low co-pays'] },
      { name: 'PEI Social Assistance for Persons with Disabilities', category: 'Provincial Benefits', description: 'PEI disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,050-$1,200', 'Drug card: $5 co-pay'], examples: ['Basic dental'], benefits: ['Faster processing'] },
      { name: 'Newfoundland & Labrador Income Support', category: 'Provincial Benefits', description: 'NL disability benefits', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,000-$1,200', 'Drug: $0-$500 deductible'], examples: ['MCP covers doctors'], benefits: ['Income-based deductible'] },
      { name: 'Yukon Disability Benefits: Northern Territory', category: 'Provincial Benefits', description: 'Yukon disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,300-$1,500 (northern cost)', 'Medical travel flights'], examples: ['Higher northern rates'], benefits: ['Medical travel coverage'] },
      { name: 'Northwest Territories Income Assistance', category: 'Provincial Benefits', description: 'NWT disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,400-$1,600 (northern)', 'Heating subsidy: $200-$300/month'], examples: ['Medical travel to Edmonton'], benefits: ['Winter heating subsidy'] },
      { name: 'Nunavut Social Assistance: Disability', category: 'Provincial Benefits', description: 'Nunavut disability assistance', userGuideSection: 'provincial-benefits', highlights: ['Monthly: $1,500-$1,700 (highest)', 'Asset limit: $15,000 (highest)', 'Food subsidy'], examples: ['Nutrition North'], benefits: ['Highest rates + limits'] },
      // === 12 LETTER TEMPLATES ===
      { name: 'Workplace Accommodation Request Letter', category: 'Letter Templates', description: 'Professional accommodation request', userGuideSection: 'letter-generator', highlights: ['Human rights legislation', 'Timeline: 14-21 days'], examples: ['Flexible hours'], benefits: ['Legally sound'] },
      { name: 'CPP-D Application Support Letter', category: 'Letter Templates', description: 'CPP-D application template', userGuideSection: 'letter-generator', highlights: ['Severe & prolonged criteria', 'Medical evidence checklist'], examples: ['Exact legal language'], benefits: ['Maximizes approval'] },
      { name: 'Benefits Appeal Letter Template', category: 'Letter Templates', description: 'Appeal denied benefits', userGuideSection: 'letter-generator', highlights: ['Grounds for appeal', 'Meets deadlines (30-90 days)'], examples: ['Case law references'], benefits: ['Professional format'] },
      { name: 'Medical Evidence Request Letter', category: 'Letter Templates', description: 'Request medical documentation', userGuideSection: 'letter-generator', highlights: ['Specific requests', 'Legal context'], examples: ['Functional limitations'], benefits: ['Professional approach'] },
      { name: 'Workplace Discrimination Documentation Letter', category: 'Letter Templates', description: 'Document discrimination', userGuideSection: 'letter-generator', highlights: ['Factual incident description', 'Impact statement'], examples: ['Contemporaneous record'], benefits: ['Creates legal evidence'] },
      { name: 'WSIB Appeal Letter Template', category: 'Letter Templates', description: 'Ontario WSIB appeal', userGuideSection: 'letter-generator', highlights: ['WSIB legal standards', 'WSIAT case law'], examples: ['Arising out of employment'], benefits: ['WSIB-specific'] },
      { name: 'Human Rights Complaint Letter', category: 'Letter Templates', description: 'Tribunal complaint', userGuideSection: 'letter-generator', highlights: ['Protected ground + adverse treatment', 'Remedy sought'], examples: ['Valid complaint structure'], benefits: ['Professional format'] },
      { name: 'Return to Work Accommodation Letter', category: 'Letter Templates', description: 'Gradual return to work', userGuideSection: 'letter-generator', highlights: ['Graduated return schedule', 'Follow-up plan'], examples: ['Week 1: 4hrs → Full-time'], benefits: ['Clear plan'] },
      { name: 'Lawyer Engagement Letter Template', category: 'Letter Templates', description: 'Engage disability lawyer', userGuideSection: 'letter-generator', highlights: ['Case summary', 'Fee arrangement'], examples: ['Contingency fee'], benefits: ['Clear case summary'] },
      { name: 'Insurance Company Dispute Letter', category: 'Letter Templates', description: 'Dispute denied insurance', userGuideSection: 'letter-generator', highlights: ['Policy quotes', 'Escalation to regulator'], examples: ['Denial challenge'], benefits: ['Legal references'] },
      { name: 'Independent Medical Examination (IME) Letter', category: 'Letter Templates', description: 'Respond to IME', userGuideSection: 'letter-generator', highlights: ['Attendance confirmation', 'Right to record'], examples: ['Audio recording'], benefits: ['Asserts rights'] },
      { name: 'Duty to Accommodate Reminder Letter', category: 'Letter Templates', description: 'Follow-up ignored request', userGuideSection: 'letter-generator', highlights: ['Documents delay', 'Legal duty'], examples: ['28 days without response'], benefits: ['Creates evidence'] },
      // === 7 ADVANCED FEATURES ===
      { name: 'Simple Mode: 3mpwrApp for Your Worst Day', category: 'Accessibility', description: 'One-tap interface - 5 core features', userGuideSection: 'simple-mode', highlights: ['One-tap toggle', 'Giant buttons (3x)'], examples: ['Low spoons → Done'], benefits: ['Usable on worst days'] },
      { name: 'Offline Mode: Full Functionality Without Internet', category: 'Core Feature', description: 'Complete offline-first', userGuideSection: 'offline-mode', highlights: ['Zero internet required', 'All features offline'], examples: ['Rural → Fully functional'], benefits: ['Rural users equal access'] },
      { name: 'Multi-Device Sync: Access Anywhere (Optional)', category: 'Productivity Tools', description: 'Optional encrypted sync', userGuideSection: 'multi-device-sync', highlights: ['End-to-end encryption', 'Phone + tablet + computer'], examples: ['Phone → Tablet instantly'], benefits: ['Never lose data'] },
      { name: 'Data Portability: Take Your Data Anywhere', category: 'Privacy Tools', description: 'Export all data', userGuideSection: 'data-export', highlights: ['JSON, CSV, PDF', 'No lock-in'], examples: ['Export to lawyer'], benefits: ['You own your data'] },
      { name: 'Contact Manager: Track Your Support Team', category: 'Productivity Tools', description: 'Organize support contacts', userGuideSection: 'contact-manager', highlights: ['Role-based organization', 'Case notes + reminders'], examples: ['Track conversations'], benefits: ['Accountability'] },
      { name: 'Notes & Journal: Document Your Journey', category: 'Evidence Tools', description: 'Freeform notes', userGuideSection: 'notes-journal', highlights: ['Automatic timestamps', 'Voice-to-text', 'Export PDF'], examples: ['Daily journal'], benefits: ['Contemporaneous records'] },
      { name: 'Daily Check-In: Quick Wellness Snapshot', category: 'Wellness Tools', description: '30-second wellness check', userGuideSection: 'daily-checkin', highlights: ['Pain/mood/energy/sleep', 'Pattern detection'], examples: ['4 ratings → Done'], benefits: ['Easy + valuable data'] }
    ];

    // â”€â”€â”€ TUTORIALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    this.tutorials = [
      {
        name: 'How to Use the Evidence Locker Effectively',
        category: 'Tutorial',
        description: 'A step-by-step guide to documenting your disability journey with AES-256-GCM encrypted evidence storage',
        highlights: [
          'Organize medical records, photos, and documents in one encrypted place',
          'Bank-level AES-256-GCM encryption â€” no one else can read your files',
          'Offline upload queue works in areas without internet access',
          'Export a complete evidence package for legal appointments in one tap',
          'Timeline view shows your entire medical and legal journey at a glance'
        ],
        examples: [
          'Photograph a workplace injury immediately and save it with a timestamp',
          'Upload every letter from your insurer or employer as soon as it arrives',
          'Record a short voice memo after every medical appointment',
          'Export a dated PDF bundle for your lawyer before their deadline'
        ],
        takeaways: [
          'Documentation is your most powerful tool â€” start before you think you need it',
          'The sooner you begin logging, the stronger your timeline becomes',
          'Encrypted local storage means your data never leaves your device without your permission'
        ],
        body: [
          'If there is one habit that makes the difference between winning and losing a disability claim, it is documentation. The Evidence Locker in 3mpwrApp is built to make that habit as frictionless as possible â€” even on bad health days.',
          'Many injured workers discover too late that they needed to keep records. A casual dismissal from HR, a worksite photograph taken before clean-up, a timestamped note about denied accommodation â€” these are the things that determine outcomes. 3mpwrApp\'s Evidence Locker is designed so you never lose any of them.',
          'All evidence is encrypted on-device using AES-256-GCM â€” the same standard used in financial services. Even if your phone is lost or stolen, your files are protected. You control when and how anything is ever shared.'
        ]
      },
      {
        name: 'Setting Up Accessibility for Your Needs',
        category: 'Tutorial',
        description: 'A personalized walkthrough of 3mpwrApp\'s WCAG AAA accessibility settings â€” from dyslexia support to Simple Mode',
        highlights: [
          'Dyslexia-friendly fonts reduce visual confusion for dense text',
          'High contrast mode supports low vision and photosensitivity',
          'Screen reader optimization works with VoiceOver and TalkBack natively',
          'Simple Mode reduces the app to 5 core features on bad health days',
          'Motor accessibility reduces required gesture precision across the whole app'
        ],
        examples: [
          'Enable Simple Mode during a flare to avoid cognitive overwhelm',
          'Turn on Dyslexia Support to apply the accessible font throughout the entire app',
          'Use Switch Access compatibility for single-button navigation on Android',
          'Set font size to Maximum or increase button target sizes for motor accessibility'
        ],
        takeaways: [
          'Accessibility is not a feature â€” it is the foundation everything else is built on',
          'No two disabilities are the same; your settings should reflect your actual situation',
          'All accessibility preferences persist across sessions â€” you configure once'
        ],
        body: [
          '3mpwrApp was built accessibility-first. Every feature was designed with the full range of disability experiences in mind â€” not retrofitted after launch.',
          'Our settings are deeply granular because "accessibility" is not one thing. Someone with ADHD has different needs than someone with low vision, who has different needs than someone with motor disabilities. You should be able to configure the app to match your actual situation.',
          'Everything you configure saves automatically. Switch between Simple Mode and full mode as many times as you need â€” your settings always come back to where you left them.'
        ]
      },
      {
        name: 'Your First Benefits Application: A Complete Walkthrough',
        category: 'Tutorial',
        description: 'How to use the Benefits Navigator to identify, apply for, and track disability benefits across all Canadian provinces',
        highlights: [
          'Province-specific listings for CPP Disability, WSIB, ODSP, AISH, and more',
          'Plain-language summaries strip out government jargon completely',
          'Eligibility checker narrows your real options down in minutes',
          'Application deadline reminders prevent the most common preventable losses',
          'Document checklists for every major benefit type'
        ],
        examples: [
          'Run the eligibility checker with your province and diagnosis to see what applies',
          'Read the plain-language summary of CPP Disability before you call the 1-800 number',
          'Set a reminder for your WSIB objection deadline the moment you receive a decision',
          'Download the document checklist for ODSP before your first appointment'
        ],
        takeaways: [
          'Most people qualify for more benefits than they know about',
          'Missing deadlines is the most preventable way to lose a legitimate claim',
          'Plain-language summaries save hours of navigating government websites in pain'
        ],
        body: [
          'The Canadian benefits system is genuinely complex. Between federal programs like CPP Disability, provincial programs like ODSP or AISH, and workplace insurance like WSIB, most injured workers simply don\'t know everything they\'re entitled to. The Benefits Navigator exists to fix that.',
          'We built plain-language summaries because official government websites are written for administrators, not for people who are sick, in pain, and trying to figure out how to survive financially. You deserve clear, direct information.',
          'Deadlines are the hidden killer of disability claims. A reconsideration request filed one day late can cost years of benefits. 3mpwrApp\'s deadline reminders are designed to prevent exactly that.'
        ]
      },
      {
        name: 'Writing an Effective Demand Letter with 3mpwrApp',
        category: 'Tutorial',
        description: 'How to use the Master Letter Generator to write legally sound, persuasive letters to employers, insurers, and government agencies',
        highlights: [
          '15+ templates for the most common disability and workers\' rights scenarios',
          'Guided completion asks targeted questions to fill in the right details',
          'Legal language validated against Canadian standards by disability advocates',
          'Export to PDF, share directly, or print â€” your choice',
          'Every letter auto-saves to your Evidence Locker with a timestamp'
        ],
        examples: [
          'Write a Return to Work accommodation request your employer cannot casually ignore',
          'Respond formally to an insurer\'s denial within the reconsideration window',
          'Request your complete medical file using the correct legal wording',
          'Notify your employer of your Human Rights Code protections in clear language'
        ],
        takeaways: [
          'A well-written letter creates a legal paper trail that protects you',
          'Using correct legal terminology signals that you know your rights',
          'Every generated letter saved to Evidence Locker builds your documented timeline'
        ],
        body: [
          'Letters are the paper trail that determines outcomes in disability claims. A vague letter gives the other side room to dismiss your concerns. A precise, well-cited letter signals you know your rights â€” and that you\'re keeping records.',
          '3mpwrApp\'s Master Letter Generator was designed in partnership with disability advocates. The templates produce professional, legally sound documents that anyone can complete without legal training.',
          'Every letter you generate is automatically saved with a timestamp to your Evidence Locker â€” creating a documented record of your communications that may be critical evidence later.'
        ]
      },
      {
        name: 'Tracking Symptoms for Doctors and Legal Appointments',
        category: 'Tutorial',
        description: 'How to build a concrete, timestamped health record using 3mpwrApp\'s Symptom Tracker that supports both medical care and disability claims',
        highlights: [
          'Timestamped entries create a legally defensible health timeline',
          'Pain scale and symptom intensity tracked visually over time',
          'Export a formatted summary report for medical appointments',
          'Pattern recognition shows which symptoms cluster or correlate',
          'Six-month view shows what memory cannot â€” the actual trend'
        ],
        examples: [
          'Log a fatigue episode with energy level, duration, and potential triggers',
          'Export a 30-day symptom summary to bring to your specialist',
          'Show your insurer six months of objective pain data in a single document',
          'Identify that your worst days correlate with specific environmental factors'
        ],
        takeaways: [
          'Objective timestamped records are far more persuasive than memory alone',
          'Symptom tracking helps your doctors make better treatment decisions',
          'Patterns in your data reveal things you would never notice day-to-day'
        ],
        body: [
          '"I\'ve been having worse days lately." That\'s a statement that\'s easy to dismiss. "My six-month symptom log shows 14 days rated 8/10 or above in the last month, compared to 4 in the same period last year" â€” that is a statement that opens doors.',
          '3mpwrApp\'s Symptom Tracker turns your subjective daily experience into objective data. Not because your experience isn\'t valid â€” it absolutely is â€” but because objective data is harder to argue with in a clinical or legal context.',
          'The export function is specifically formatted for medical appointments. Hand your doctor a ready-to-read summary instead of trying to reconstruct the last three months while sitting in a waiting room in pain.'
        ]
      },
      {
        name: 'Using Spoon Theory to Manage Your Energy Day-to-Day',
        category: 'Tutorial',
        description: 'A practical guide to using 3mpwrApp\'s spoon-based energy tools to plan better days and prevent post-exertion crashes',
        highlights: [
          'Daily spoon budget sets a realistic energy ceiling before you start the day',
          'Task spoon costs let you plan before you overcommit',
          'Energy Forecast predicts your available spoons up to 24 hours ahead',
          'Pacing Partner sends real-time reminders when you approach your limit',
          'Weekly energy report shows patterns you may not have recognized'
        ],
        examples: [
          'Set your daily spoon budget each morning based on how you woke up',
          'Assign a spoon cost to each task on your list before you begin',
          'Get a gentle alert when you\'re within 2 spoons of your daily limit',
          'Review your weekly energy report on Sunday to plan the coming week'
        ],
        takeaways: [
          'Planning spoon use in advance prevents the crashes that come from overcommitting',
          'Spoon theory gives a shared vocabulary for energy limits with people who don\'t experience them',
          'The Pacing Partner is not nagging â€” it is self-advocacy in action'
        ],
        body: [
          'Spoon Theory, coined by Christine Miserandino, gives people with chronic illness a way to describe limited energy. In 3mpwrApp, we built practical tools around this framework because it resonates so deeply with our community.',
          'The goal is not just awareness â€” it is action. Knowing you have 8 spoons today is only useful if you can make decisions based on it before you\'ve already spent 12. Our pre-planning tools shift decisions to the morning, when you still have options.',
          'The Energy Forecast learns your patterns over time. After a few weeks of tracking, it can predict your available energy 24 hours ahead â€” giving you even more lead time to make good decisions for your body.'
        ]
      },
      {
        name: 'Protecting Your Privacy: Local-First Architecture Explained',
        category: 'Tutorial',
        description: 'A plain-language explanation of how 3mpwrApp keeps your sensitive disability data private through local-first, encrypted storage',
        highlights: [
          'Your data lives on your device â€” not on remote servers â€” by default',
          'AES-256-GCM encryption protects all sensitive records at rest',
          'No advertising, no data brokering, no selling your information â€” ever',
          'You choose exactly what (if anything) ever syncs to the cloud',
          'You can export and delete everything at any time â€” you own your data'
        ],
        examples: [
          'Your Evidence Locker never leaves your device unless you explicitly share it',
          'Symptom data and medical records are encrypted before being written to storage',
          'Disable internet entirely â€” 3mpwrApp continues to work fully offline',
          'Export your complete data package at any time for portability or legal use'
        ],
        takeaways: [
          'For people with disabilities in legal disputes, privacy is not a preference â€” it is self-protection',
          'Insurance companies and employers cannot demand data that doesn\'t exist on a server we control',
          'Local-first means control stays with you â€” architecturally, not just as a policy promise'
        ],
        body: [
          'People with disabilities are disproportionately targeted by discriminatory data use. Insurance companies, employers, and even government systems have used health data in ways that harm already-vulnerable people. 3mpwrApp was built with this documented history in mind.',
          'Local-first architecture means your data lives on your device by default. We do not have a server full of your symptom logs, evidence photos, or medical records. You cannot have a data breach of data that was never collected.',
          'When you choose to back things up or sync across devices, you choose. The encryption travels with the data. You hold the keys â€” and so do we not.'
        ]
      },
      {
        name: 'Getting Crisis Support Through 3mpwrApp',
        category: 'Tutorial',
        description: 'How to access crisis lines, community safety check-ins, and immediate mental health support in 3mpwrApp â€” available offline and one tap away',
        highlights: [
          'Province-specific crisis lines accessible in one tap from the home screen',
          'Text-based options for those who cannot or prefer not to call',
          'Breathing exercises and grounding tools available without any navigation',
          'Community safety check-ins connect you with a peer supporter',
          'All crisis resources pre-loaded to device â€” available with no internet'
        ],
        examples: [
          'Access your province\'s distress line without searching for a number',
          'Use text-based crisis chat when calling is not safe or possible',
          'Open a box-breathing exercise in three seconds without unlocking',
          'Send a community safety check-in to receive a peer response'
        ],
        takeaways: [
          'Crisis resources should never require navigation â€” one tap is the standard we set',
          'Text-based options exist because calling is not always possible or safe',
          'Offline availability means help is there even when the network is not'
        ],
        body: [
          'Nobody should have to navigate menus when they are in crisis. That is why 3mpwrApp\'s crisis resources are accessible from the home screen in one tap â€” no drilling through settings, no searching.',
          'Text-based crisis options are included because calling is not always possible. For deaf and hard-of-hearing users, for people in situations where speaking aloud is unsafe, or for those who find speaking difficult during acute anxiety â€” texting is essential, not optional.',
          'Every crisis resource in the app is pre-loaded to device memory. Network failure should never be a barrier to accessing help. It is not, in 3mpwrApp.'
        ]
      }
    ];

    // â”€â”€â”€ DEV DIARIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    this.devDiaries = [
      {
        name: 'Why We Chose React Native: Accessibility Over Everything',
        category: 'Dev Diary',
        description: 'The technical and ethical reasoning behind choosing React Native as the foundation for 3mpwrApp',
        highlights: [
          'React Native exposes native VoiceOver, TalkBack, and Switch Access APIs directly',
          'One codebase for iOS, Android, and web prevents accessibility quality divergence',
          'Expo Router\'s file-based navigation is transparent to screen readers by design',
          'React Native\'s animation system supports reduced motion preferences natively',
          'Expo\'s a11y linting caught issues before any human tester saw them'
        ],
        examples: [
          'VoiceOver and TalkBack integration required native API access that web-only frameworks couldn\'t provide',
          'Switch Access compatibility was built in from day one using React Native\'s focus management APIs',
          'Accessibility scanning in CI caught regressions before they reached beta testers'
        ],
        takeaways: [
          'Framework choice is an accessibility decision, not just a technical preference',
          'Building cross-platform from the start prevents future divergence in accessibility quality',
          'The open-source React Native community\'s accessibility depth accelerated our work enormously'
        ],
        body: [
          'When we started 3mpwrApp, we had a hard constraint: the framework had to support real, deep accessibility â€” VoiceOver, TalkBack, Switch Access, and the full spectrum of assistive technology â€” from day one, not as an afterthought.',
          'React Native was the answer because it exposes the native accessibility APIs of both iOS and Android directly. A web-based hybrid approach would have meant fighting the underlying layer. React Native meant working with it.',
          'The Expo ecosystem accelerated this enormously. Expo Router\'s file-based navigation is inherently screen-reader-transparent. The community has deep accessibility expertise. We didn\'t have to build the foundations â€” we stood on good ones.'
        ]
      },
      {
        name: 'Building Offline-First: Network Access Should Never Be Required',
        category: 'Dev Diary',
        description: 'How and why 3mpwrApp was built to work completely without internet â€” and what we learned along the way',
        highlights: [
          'AsyncStorage provides local-first persistence across all platforms',
          'Evidence upload queue retries silently when connectivity returns',
          'All crisis resources are pre-loaded to device memory at install',
          'Firestore offline mode syncs transparently when connection resumes',
          'The principle: if it requires internet, it isn\'t truly accessible'
        ],
        examples: [
          'A user in a rural area with no signal can access their full Evidence Locker',
          'Crisis resources load instantly because they are committed to local storage',
          'Upload queues retry on their own â€” users never need to remember to re-upload'
        ],
        takeaways: [
          'Many of the most vulnerable community members live in rural areas with unreliable connectivity',
          'Offline-first is not a performance optimization â€” it is an equity decision',
          'Designing for offline means every feature had to work as a standalone, self-contained unit'
        ],
        body: [
          'A disability app that requires consistent internet access systematically excludes the people who need it most.',
          'Consider where chronic illness and disability intersect with geography. Rural and remote communities in Canada have both higher disability rates and significantly worse internet infrastructure. Optimizing for urban, connected users would have been a betrayal of our mission.',
          'The offline-first mandate created real technical challenges â€” every feature had to be audited for what it looks like without a network call. The upload queue was particularly complex: we needed silent, automatic retry logic that never lost data and never frustrated users.'
        ]
      },
      {
        name: 'Bank-Level Encryption for a Disability App: The Why',
        category: 'Dev Diary',
        description: 'The reasoning behind implementing AES-256-GCM encryption in 3mpwrApp and what it took to verify it works correctly',
        highlights: [
          'AES-256-GCM is the same encryption standard used in financial services',
          'All Evidence Locker entries and sensitive data encrypted at rest on-device',
          '721 security tests verify encryption is correctly implemented throughout',
          'Key management is on-device â€” we never hold your encryption keys',
          'Zero-knowledge design: even we cannot read your data'
        ],
        examples: [
          'Medical records and legal documents are encrypted before being written to any storage layer',
          'Encryption keys are stored in the device secure enclave where available',
          'Security audit confirmed zero plaintext sensitive data anywhere in the storage layer'
        ],
        takeaways: [
          'A disability data breach can cost someone their benefits claim â€” the stakes are not just personal',
          'Military-grade encryption was a baseline requirement, not an aspirational achievement',
          'Open, verifiable security claims are more trustworthy than marketing language'
        ],
        body: [
          'We encrypt at the level we do because we understand what a data breach means for someone with a disability. It is not just personal embarrassment â€” it can mean an insurer accessing evidence that undermines an active claim. It can mean an employer learning about a condition the worker hasn\'t disclosed.',
          'AES-256-GCM gives us both encryption (data cannot be read) and authentication (data has not been tampered with). It is the standard that people and organizations who genuinely need security use.',
          'Our 721 tests include a dedicated security suite that verifies not just "does the feature work" but "is this data actually encrypted." We verify what we claim, in code that can be inspected.'
        ]
      },
      {
        name: 'Simple Mode: Designing for the Worst Day',
        category: 'Dev Diary',
        description: 'The design thinking behind Simple Mode â€” how a single piece of community feedback became one of 3mpwrApp\'s most important features',
        highlights: [
          'Simple Mode originated from a direct community request about cognitive load during flares',
          'Five core features selected by community vote â€” not by the dev team alone',
          'One-tap switching from full interface to Simple Mode at any time',
          'All features remain installed â€” Simple Mode hides, never deletes',
          'Remembers your last Simple Mode state on reopen'
        ],
        examples: [
          'A user with brain fog can enable Simple Mode and still reach crisis resources instantly',
          'Someone in a pain flare can log evidence without navigating complex menus',
          'Simple Mode\'s larger targets and reduced interface work even during migraine episodes'
        ],
        takeaways: [
          'The measure of accessibility is how an interface performs on the hardest day, not the easiest',
          'Simplicity on demand respects that capacity changes day-to-day for chronic illness',
          'The five core features were chosen by the community because they know what they need'
        ],
        body: [
          'The feature request that became Simple Mode came from a community member who told us: "I want to use your app but when I\'m actually sick, it\'s too much to navigate." That single sentence became a product brief.',
          'We did not want to build a stripped-down "lite" version that patronized users with cognitive disabilities. We wanted a mode â€” something that respects that the same person can have vastly different capacity on different days without requiring them to reinstall anything.',
          'The five features in Simple Mode â€” Evidence Locker quick-add, Crisis Resources, Symptom Log, Benefits Deadline Alerts, and Energy Check-in â€” were chosen by the community in a direct vote. That is the version of Simple Mode that shipped.'
        ]
      },
      {
        name: 'From 0 to 721 Tests: Our TDD Story',
        category: 'Dev Diary',
        description: 'How 3mpwrApp grew from a prototype to a production codebase with 721 tests across 121 suites â€” and why test count is a side-effect, not the goal',
        highlights: [
          '721 tests across 121 suites â€” zero test debt intentionally accumulated',
          'Test-driven development used for every critical path in the codebase',
          'Dedicated security test suite verifies encryption implementation is correct',
          'Accessibility tested both programmatically and by community testers',
          '0 ESLint errors, 0 TypeScript errors maintained as a non-negotiable standard'
        ],
        examples: [
          'The Evidence Locker has 23 dedicated tests verifying no plaintext reaches storage',
          'Letter Generator templates tested against output format and legal language requirements',
          'Accessibility labels tested in CI to catch regressions before human testers see them'
        ],
        takeaways: [
          'A regression in a feature a disabled person depends on can cause real harm â€” tests prevent that',
          'High test count means nothing without test quality â€” our tests verify real behaviour',
          'TDD forces you to articulate exactly what you want code to do before you write it'
        ],
        body: [
          'Test-driven development means writing the test before writing the code â€” articulating exactly what you want it to do, in a verifiable way, before a single implementation line exists.',
          'We chose TDD because this app handles sensitive legal and medical data, crisis support, and accessibility requirements that non-disabled developers might not notice if they broke. We needed a way to verify that the things that matter most to our community kept working.',
          '721 is not a number we targeted. It is the number you arrive at when you write a test for every meaningful behaviour in the codebase. Test coverage of critical paths was the commitment â€” the count followed from that.'
        ]
      },
      {
        name: 'Building Indigenous Language Support: What We Learned',
        category: 'Dev Diary',
        description: 'The challenges and lessons from building Indigenous language capability into 3mpwrApp â€” and why community partnership was non-negotiable',
        highlights: [
          'Indigenous communities face disproportionate workplace injury and disability rates',
          'Colonial healthcare and legal systems create specific language-based barriers',
          'Community-verified translations rather than machine translation throughout',
          'Technical challenges: right-to-left text, special characters, syllabic font rendering',
          'Language sovereignty is both a cultural right and a disability rights issue'
        ],
        examples: [
          'Working with Indigenous language communities directly to verify translations, not automating them',
          'Adapting the UI for languages with different text directionality requirements',
          'Ensuring letters and documents can reference specific Indigenous rights frameworks'
        ],
        takeaways: [
          'Language is not just communication â€” it is identity, culture, and safety',
          'Technology that excludes Indigenous languages participates in their erasure',
          'Partnership rather than extraction: language support built with communities, not about them'
        ],
        body: [
          'When we first discussed Indigenous language support, our instinct was to use machine translation. We quickly learned why that was wrong. Indigenous languages are living, culturally rich, and complex. Machine translation into them is often inaccurate, sometimes offensive, and always insufficient.',
          'What we built instead was a framework for community-verified translations, with Indigenous language reviewers as genuine partners. The process was slower. The result was right.',
          'The technical challenges were real â€” syllabic font rendering, right-to-left text handling, character encoding edge cases. Each one was worth solving, because the people who most need this app deserve to use it in their own language.'
        ]
      },
      {
        name: 'The Ethics of Building for Vulnerable Communities',
        category: 'Dev Diary',
        description: 'A frank discussion of the ethical responsibilities that come with building tools for injured workers and people with disabilities',
        highlights: [
          'Users are often in adversarial systems â€” insurers, employers, government â€” while using this app',
          'Data ethics go beyond PIPEDA compliance â€” they require genuine respect for user vulnerability',
          'Community co-design is mandatory, not a PR exercise',
          'We are honest about what the app can and cannot do â€” we never oversell',
          'The "always free" commitment is an ethical stance, not a startup strategy'
        ],
        examples: [
          'We never imply that 3mpwrApp replaces legal advice â€” we direct users to human experts',
          'Community members sit on our informal advisory group and directly shape the roadmap',
          'We are public about feature limitations alongside feature capabilities'
        ],
        takeaways: [
          'Building for vulnerable communities amplifies the harm of getting things wrong',
          'Co-design is the difference between a tool built for a community and one built about them',
          '"Free" as a business model can still extract value â€” our commitment is to never do that'
        ],
        body: [
          'Every design decision in 3mpwrApp happens in the context of a user who may be unwell, financially stressed, and in active conflict with systems that have more resources than they do. That context demands a different standard of care than building a productivity app for well-resourced professionals.',
          'We have an obligation to be honest. When an AI feature suggests something, we label it clearly. When a letter template is a general guide and not legal advice, we say so explicitly. When we cannot support a use case, we direct people to the human experts who can.',
          'Community co-design is not a checkbox. It is how we figure out what to build in the first place. The features in 3mpwrApp exist because members of the disability and injured worker community told us they needed them.'
        ]
      },
      {
        name: 'Why 3mpwrApp Will Always Be Free',
        category: 'Dev Diary',
        description: 'The thinking behind our permanent free commitment â€” an ethical stance, not a growth strategy',
        highlights: [
          'Monetizing disability data would be a direct betrayal of the community we serve',
          'Paywalling critical features creates a two-tiered system of access to justice',
          'Sustainable through grants and advocacy partnerships â€” not user fees or advertising',
          'No advertising model â€” we will never sell exposure to our community\'s vulnerabilities',
          'The "always free" commitment is structural, not just a policy promise'
        ],
        examples: [
          'Every feature including Evidence Locker, Letter Generator, and crisis resources is always free',
          'No "premium tier" that gates the most important tools behind a paywall',
          'No advertising of any kind â€” no targeting, no impressions, no data sold'
        ],
        takeaways: [
          'People with disabilities are disproportionately in financial precarity â€” a paid app systematically excludes them',
          'If access to advocacy tools depends on money, justice is not equal',
          'Almost every sector monetizes disability data through insurance, advertising, and research â€” we will not'
        ],
        body: [
          'You cannot build a disability justice app and charge for access. The people who need 3mpwrApp most are often the ones least able to pay for it â€” injured workers waiting on a claim, people with severe disability on fixed income, people in systems that have repeatedly failed them.',
          'We had that conversation early and directly: no subscription, no premium tier, no advertising. The funding model for 3mpwrApp is grants, advocacy partnerships, and community contributions â€” not extracting value from users.',
          'The "always free" commitment is structural. It is in our founding documents. It is not a marketing promise that changes with new leadership or investor pressure. It is a hard constraint on how we operate.'
        ]
      }
    ];

    // â”€â”€â”€ LORE & PHILOSOPHY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    this.loreTopics = [
      {
        name: 'The Origin Story: Why 3mpwrApp Was Built',
        category: 'Our Story',
        description: 'The personal and political origins of 3mpwrApp â€” why it was built, by whom, and for whom',
        highlights: [
          'Born from direct experience with the failure of disability support systems in Canada',
          'Built in response to the systematic silencing of injured workers by insurers and employers',
          'Designed by community members who were themselves navigating the exact systems the app addresses',
          'The name "3mpwr" reflects collective power â€” empowerment through tools, technology, and solidarity',
          'Community advisory process shapes every major feature decision to this day'
        ],
        examples: [
          'The Evidence Locker exists because documentation is the primary tool injured workers lack',
          'The Letter Generator exists because legal language is used as a deliberate barrier',
          'Simple Mode exists because the community said directly: "I\'m too sick to navigate this app on hard days"'
        ],
        takeaways: [
          'Tools built by the community look fundamentally different from tools built about it',
          'Our origin story is a statement of accountability to the people we serve',
          'Every feature is a response to a real, named barrier that real people told us they face'
        ],
        body: [
          '3mpwrApp did not begin as a product idea. It began as a response to a crisis. A community member â€” navigating a workplace injury claim, fighting an insurer with more resources than she had â€” needed tools that did not exist. So we built them.',
          'What she needed was a way to keep evidence organized and encrypted. A way to write letters that demonstrated she knew her rights. A way to find support resources at 2 AM when the anxiety was worst. She needed 3mpwrApp, so 3mpwrApp exists.',
          'The "3mpwr" in the name is intentional. Not the hollow empowerment that asks disabled people to simply try harder in an unjust system. Collective empowerment. Power through documentation, through community, through having tools that match the tools being used against you.'
        ]
      },
      {
        name: 'Disability Justice vs Disability Charity: Our Operating Principle',
        category: 'Philosophy',
        description: '3mpwrApp is built on disability justice principles â€” not disability charity. Here is what that means in practice.',
        highlights: [
          'Disability charity positions disabled people as passive recipients of help',
          'Disability justice positions disabled people as agents with rights, power, and expertise',
          'Nothing about us without us: co-design is structurally built into how we operate',
          'Intersectionality is central â€” disability does not exist in isolation from race, class, or geography',
          'Justice demands systemic change â€” not just better individual coping strategies'
        ],
        examples: [
          'The Advocacy tab helps people organize politically â€” not just manage their own condition',
          'Campaign Coordination tools support collective action, not just individual petitioning',
          'Community spaces in 3mpwrApp facilitate mutual aid, not dependency on charity'
        ],
        takeaways: [
          'The framing of disability determines the tools you build',
          'A charity model app helps you manage your situation; a justice model app helps you change it',
          'This distinction is why 3mpwrApp includes advocacy and organizing features alongside personal support tools'
        ],
        body: [
          'There is a meaningful difference between disability charity and disability justice. Charity says: "You are suffering â€” let us help you cope." Justice says: "You are being harmed by unjust systems â€” let us organize to change them."',
          '3mpwrApp is built on the second premise. Yes, we provide coping tools â€” symptom tracking, crisis support, wellness resources. People need those. But we designed them within a framework that treats disability as a political condition, not only a medical one.',
          'This is why 3mpwrApp has an Advocacy tab. Why it has Campaign Coordination and community forums. Why it connects you to advocacy partners, not just symptom management features. The goal is not personal adjustment â€” the goal is collective change.'
        ]
      },
      {
        name: 'What 3mpwr Means: The Philosophy Behind Our Name',
        category: 'Philosophy',
        description: 'Unpacking the meaning behind "3mpwr" â€” the three pillars, the values, and the vision embedded in how we named this community',
        highlights: [
          '"3mpwr" = Empower â€” the 3 represents three pillars: Individual, Community, Systemic',
          'Individual pillar: Evidence Locker, Letter Generator, Symptom Tracker, Benefits Navigator',
          'Community pillar: Forums, Peer Support, Virtual Meetups, Mutual Aid',
          'Systemic pillar: Campaign Coordination, Advocacy Resources, Policy Explainer',
          'The name was chosen by the community â€” not by a brand consultant'
        ],
        examples: [
          'Personal tools address immediate, individual needs in the disability system',
          'Community tools create the social infrastructure that makes isolation survivable',
          'Systemic tools connect individual experiences to collective political action'
        ],
        takeaways: [
          'Why the app has features that seem very different from each other â€” they serve three distinct pillars',
          'Community naming is a form of ownership â€” this platform belongs to its users',
          'The three pillars ensure we never mistake individual coping for justice'
        ],
        body: [
          'Names are statements of intent. When we named this platform, we did not hire a brand naming consultant. We asked the community what they wanted it to represent â€” and the conversation shaped everything.',
          '"3mpwr" came from a community discussion about what kind of empowerment we were actually building toward. Not self-help empowerment. Not the kind that says "you have the power within you" and leaves you to navigate a hostile insurance system alone. Collective, structural empowerment.',
          'The three in "3mpwr" maps onto three pillars: tools for the individual, tools for community connection, and tools for systemic change. Everything in the app fits one of those three categories. The overlap between them is where the real power is.'
        ]
      },
      {
        name: 'Privacy as a Human Right: Not a Feature We Added Later',
        category: 'Philosophy',
        description: 'Why 3mpwrApp treats privacy as a foundational human right for people with disabilities â€” and what that demands of how we build',
        highlights: [
          'Disability data is uniquely dangerous: it can affect employment, insurance, housing, and custody',
          'Many disability apps monetize user data â€” 3mpwrApp never has and never will',
          'Local-first architecture is a political decision, not just a technical implementation',
          'Surveillance of disabled people has been systematically weaponized by insurance companies',
          'Privacy protection is an accessibility feature specifically for people in adversarial systems'
        ],
        examples: [
          'An insurer cannot demand data that does not exist on a server we control',
          'Encrypted local storage means your medical history is not exposed by a third-party data breach',
          'You export and delete everything you\'ve ever stored â€” your data has no home here but your device'
        ],
        takeaways: [
          'For disabled people in active legal claims, privacy is not a preference â€” it is self-defense',
          'Building privacy-first is slower and more expensive; we chose it deliberately and structurally',
          'When we say "your data never leaves without consent" we mean it architecturally â€” not as a policy'
        ],
        body: [
          'Privacy for people with disabilities is a baseline safety requirement. An injured worker whose symptom logs are accessible to their employer. A person with HIV whose health data surfaces in an insurance database. A disabled employee whose accommodation requests are on company-controlled infrastructure. These are documented realities, not hypotheticals.',
          '3mpwrApp was built knowing this history. Our privacy architecture â€” local-first, encrypted, no back door, explicit user control over sync â€” is not a technical accomplishment. It is a political commitment to the people we serve.',
          'We include this in our philosophy documentation because privacy decisions made at the architecture level cannot be undone by a future policy change. The commitment is structural to the codebase.'
        ]
      },
      {
        name: 'Spoon Theory and the Design Language We Built Around It',
        category: 'Philosophy',
        description: 'How Christine Miserandino\'s Spoon Theory became the unofficial design brief for every energy-related feature in 3mpwrApp',
        highlights: [
          'Spoon Theory became the shared language between our team and our chronic illness community',
          'Every feature evaluated against one question: would someone with 3 spoons use this today?',
          'Christine Miserandino\'s framework credited throughout our documentation and community spaces',
          'The Pacing Partner feature embodies spoon theory principles in real-time software',
          'Community members with ME/CFS, fibromyalgia, lupus were core beta testers'
        ],
        examples: [
          'Simple Mode exists specifically for the day when your whole spoon budget is 3',
          'One-tap actions throughout the app reduce the energy cost of using it during low-spoon days',
          'Evidence Locker voice-to-text exists because typing can be an unaffordable spoon cost'
        ],
        takeaways: [
          'Designing for minimum viable energy means designing better for everyone',
          'Spoon theory is not a metaphor to us â€” it is a concrete design requirement we apply to every feature',
          'The most important user journey in 3mpwrApp is the one that happens on the worst day'
        ],
        body: [
          'Christine Miserandino\'s Spoon Theory gave us a framework that is now embedded in how we evaluate every feature decision in 3mpwrApp. Before we ship anything, we ask: could someone with three spoons use this today? If the answer is no, we simplify it.',
          'The spoon community â€” people with fibromyalgia, ME/CFS, lupus, EDS, multiple sclerosis, and the hundreds of other conditions involving chronic fatigue â€” were some of our earliest and most rigorous beta testers. They told us when we got it wrong. We listened.',
          'The practical result is an app designed from the lowest-energy end of the spectrum outward. That produces a better product for everyone â€” and an essential one for people who have no margin.'
        ]
      },
      {
        name: 'Building in Public: Why Transparency Is Non-Negotiable for Us',
        category: 'Philosophy',
        description: 'Why 3mpwrApp commits to radical transparency about how we build, what we\'re working on, and where we fall short',
        highlights: [
          'The community we serve has been let down by opaque institutions too many times',
          'We publish our development process, design decisions, and setbacks openly',
          'Open source code means our security and privacy claims can be independently verified',
          'Honest about limitations â€” we never oversell features or hide known issues',
          'Community feedback shapes the roadmap directly â€” not through a "feedback portal"'
        ],
        examples: [
          'Dev Diary posts like this one document our actual decision-making, not just polished outcomes',
          'Known limitations are documented in the user guide alongside what features can do',
          'Roadmap updates shared with the community before work begins, not after'
        ],
        takeaways: [
          'Transparency is the opposite of how most institutions treat disabled people â€” we want to be the opposite',
          'An app that can be independently verified is more trustworthy than one that asks you to trust its marketing',
          'Building in public creates accountability that internal processes often cannot'
        ],
        body: [
          'The disability and injured worker communities we serve have been let down repeatedly by institutions that made promises, changed them, and explained nothing. Insurance companies that deny claims without clear reasoning. Government systems that lose paperwork and blame the applicant. Healthcare systems where decisions happen in rooms the patient never enters.',
          'We want to be the opposite of that. Building in public â€” sharing our reasoning, our failures, our technical decisions â€” is part of how we demonstrate that 3mpwrApp is accountable to its users.',
          'This is not just about publishing a roadmap. It means being honest when something takes longer than expected. Explaining why we made a technical decision that seems counterintuitive. Publishing dev diaries that document the messy reality of building complex software for real people.'
        ]
      },
      {
        name: 'Collective Advocacy: Why Individual Coping Is Not Enough',
        category: 'Philosophy',
        description: 'Why 3mpwrApp includes collective action tools alongside individual support â€” and how the two reinforce each other',
        highlights: [
          'Individual resilience without systemic change just makes injustice more sustainable',
          'Campaign Coordination tools connect personal documentation to collective advocacy',
          'Community forums create the social infrastructure that makes isolation survivable',
          'The divide between "wellness app" and "advocacy tool" is false â€” 3mpwrApp bridges it',
          'Individual evidence, when connected across users, reveals systemic patterns'
        ],
        examples: [
          'Documented symptom data becomes evidence in a community-organized workers\' rights campaign',
          'The community forum connects isolated injured workers who discover they have the same employer',
          'Campaign templates turn shared frustration into structured, organized advocacy'
        ],
        takeaways: [
          'Your personal documentation tools and your political tools should live in the same place',
          'Individual experiences, when connected, reveal patterns that courts and regulators cannot ignore',
          'Mutual aid is not charity â€” it is community infrastructure'
        ],
        body: [
          'One of the critiques we heard early was: "Is this a wellness app or an advocacy tool?" Our answer was and remains: yes.',
          'The divide between individual wellness and collective advocacy is artificial. The same person who needs to track their symptoms also needs to know they are not alone â€” that their experience is shared, that they belong to something larger, and that there are things they can do beyond managing their own condition.',
          'When a hundred 3mpwrApp users in the same province log the same employer in their Evidence Lockers, find each other in the community forum, and use Campaign Coordination to organize â€” that is the full vision of 3mpwrApp made visible. Not adapted for it. It was designed for exactly that.'
        ]
      },
      {
        name: 'Intersectionality and Disability: Building for the Full Reality',
        category: 'Philosophy',
        description: 'How 3mpwrApp approaches the intersecting layers of identity, systemic discrimination, and lived experience that shape who needs this platform most',
        highlights: [
          'Race, class, gender, geography, and immigration status all shape how disability is experienced',
          'Indigenous communities face unique colonial barriers in healthcare and legal systems',
          'Newcomers and immigrants navigate language and cultural barriers in claim systems',
          'Low-income users face the highest stakes and the fewest institutional resources simultaneously',
          '3mpwrApp is designed for those carrying the most â€” not for the most visible'
        ],
        examples: [
          'Indigenous language support directly addresses colonial exclusion from legal and medical systems',
          'Bilingual English/French design reflects Canada\'s constitutional linguistic reality',
          'Province-specific content ensures remote and rural users are not afterthoughts'
        ],
        takeaways: [
          'Building for the most marginalized users first produces a better product for everyone',
          'Intersectionality is not an ideological complication â€” it is factual accuracy about who needs the product',
          'Universal design and intersectional design are the same practice done honestly'
        ],
        body: [
          'Disability does not exist in a social vacuum. A white, urban, high-income person with a disability and an Indigenous person with a disability in a remote community are both disabled â€” and they face entirely different systems, with entirely different levels of access to support.',
          '3mpwrApp was designed with the second person at least as much as the first. Indigenous language support, offline-first architecture, province-specific content, plain-language legal guides â€” each is a direct response to a specific barrier faced by a specific community within the broader disability community.',
          'When we say intersectional design, we mean: we do not optimize for the easiest user. We start with the person carrying the most â€” medically, legally, financially, culturally â€” and build outward from there. The result serves everyone better than the alternative would.'
        ]
      }
    ];

    // Track content rotation state
    this.usedFeaturesPath = path.join(process.cwd(), 'public', 'used-features.json');
    this.usedFeatures = this.loadUsedFeatures();
    this.publishedFeatureNames = this.loadPublishedFeatureNames();
  }

  loadUsedFeatures() {
    const defaults = {
      features: [],
      tutorials: [],
      devDiaries: [],
      lore: [],
      rotationIndex: 0,
      lastReset: new Date().toISOString()
    };
    if (fs.existsSync(this.usedFeaturesPath)) {
      try {
        const stored = JSON.parse(fs.readFileSync(this.usedFeaturesPath, 'utf-8'));
        return { ...defaults, ...stored };
      } catch {
        return defaults;
      }
    }
    return defaults;
  }

  saveUsedFeatures() {
    fs.writeFileSync(this.usedFeaturesPath, JSON.stringify(this.usedFeatures, null, 2), 'utf-8');
  }

  normalizeFeatureName(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/^feature spotlight:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  loadPublishedFeatureNames() {
    const published = new Set();
    if (!fs.existsSync(this.postsDir)) {
      return published;
    }

    const files = fs.readdirSync(this.postsDir)
      .filter(name => name.includes('feature-spotlight') && name.endsWith('.md'));

    for (const file of files) {
      try {
        const source = fs.readFileSync(path.join(this.postsDir, file), 'utf-8');
        const titleMatch = source.match(/^title:\s*"Feature Spotlight:\s*(.+)"\s*$/m);
        if (titleMatch && titleMatch[1]) {
          published.add(this.normalizeFeatureName(titleMatch[1]));
        }
      } catch {
        // Skip unreadable file and continue.
      }
    }

    return published;
  }

  toPlainAscii(text) {
    return String(text || '')
      .replace(/\u2014|\u2013/g, '-')
      .replace(/\u2192/g, '->')
      .replace(/\u2022/g, '-')
      .replace(/[\u00A0]/g, ' ')
      .normalize('NFKD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\s+/gm, '')
      .replace(/\s+$/gm, '')
      .trim();
  }

  /**
   * Select next feature to write about (rotating through all features)
   * UPDATED: Randomized selection, no auto-reset (true no-repeats policy)
   */
  selectFeature() {
    // Do not spotlight features that are not yet live.
    const blockedFeatureSpotlights = new Set([
      'Nova Scotia Income Assistance: Disability'
    ]);

    // Find features not yet used and not already published.
    let availableFeatures = this.features.filter(
      f => !this.usedFeatures.features.includes(f.name)
        && !blockedFeatureSpotlights.has(f.name)
        && !this.publishedFeatureNames.has(this.normalizeFeatureName(f.name))
    );

    // NO AUTO-RESET: Stop generating when all features exhausted
    if (availableFeatures.length === 0) {
      console.log('All feature spotlights are already covered. No repeats generated.');
      console.log('To continue: add net-new features or run non-feature content types.');
      throw new Error('All feature spotlights exhausted - duplicate prevention active');
    }

    // RANDOMIZED SELECTION (no longer sequential)
    const randomIndex = Math.floor(Math.random() * availableFeatures.length);
    const selected = availableFeatures[randomIndex];

    // Mark as used
    this.usedFeatures.features.push(selected.name);
    this.saveUsedFeatures();

    return selected;
  }

  /**
   * Select next item from a named content pool, resetting when exhausted
   */
  selectFromPool(poolKey, items) {
    const used = this.usedFeatures[poolKey] || [];
    let available = items.filter(i => !used.includes(i.name));
    if (available.length === 0) {
      this.usedFeatures[poolKey] = [];
      available = [...items];
    }
    const selected = available[0];
    this.usedFeatures[poolKey] = [...(this.usedFeatures[poolKey] || []), selected.name];
    return selected;
  }

  /**
   * Select the next content item based on the rotation schedule.
   * Rotation (8-step): feature Ã— 4, tutorial, devDiary, lore, devUpdate
   * Features appear more frequently since there are 43 of them.
   */
  selectContent() {
    const rotation = ['feature', 'tutorial', 'feature', 'devDiary', 'feature', 'lore', 'feature', 'devUpdate'];
    const idx = (this.usedFeatures.rotationIndex || 0) % rotation.length;
    this.usedFeatures.rotationIndex = idx + 1;
    const contentType = rotation[idx];

    switch (contentType) {
      case 'tutorial':
        return { type: 'tutorial', item: this.selectFromPool('tutorials', this.tutorials) };
      case 'devDiary':
        return { type: 'devDiary', item: this.selectFromPool('devDiaries', this.devDiaries) };
      case 'lore':
        return { type: 'lore', item: this.selectFromPool('lore', this.loreTopics) };
      case 'devUpdate': {
        const devResult = this.generateDevUpdateContent();
        if (devResult) return { type: 'devUpdate', item: devResult.meta, article: devResult.article };
        // Fall back to feature if git log unavailable
        return { type: 'feature', item: this.selectFeature() };
      }
      default:
        return { type: 'feature', item: this.selectFeature() };
    }
  }

  /**
   * Generate article content
   */
  generateArticleContent(feature) {
    const dateStr = new Date().toISOString().split('T')[0];
    
    let content = `---
layout: post
title: "Feature Spotlight: ${feature.name}"
date: ${dateStr} 00:00:00 +0000
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
    content += `Example scenario (illustrative only):\n\n`;
    content += `An injured worker is preparing an appeal while managing medical appointments and family responsibilities. They use ${feature.name} to reduce one major barrier so their limited energy can go toward decisions that affect outcomes.\n\n`;
    content += `Practical ways this feature can be used:\n\n`;

    feature.examples.forEach((example, index) => {
      content += `${index + 1}. ${example}\n`;
    });

    content += `\n---\n\n## Flywheel Integration\n\n`;
    content += `Flywheel Stage(s): Varies by use case across Data Collection, Analysis / Pattern Recognition, Knowledge Base, Templates / Guides, Visualizations, and Real-World Impact.\n\n`;
    content += `Input -> Process -> Output -> Downstream effect:\n`;
    content += `- Input: A real barrier faced by an injured worker, disabled person, family member, or advocate.\n`;
    content += `- Process: ${feature.name} structures the work so key steps are easier to complete.\n`;
    content += `- Output: Clearer documentation, decisions, or coordination artifacts.\n`;
    content += `- Downstream effect: Better guidance, stronger case preparation, and improved outcomes in complex systems.\n`;

    content += `\n---\n\n## Why ${feature.name} Matters\n\n`;

    feature.benefits.forEach(benefit => {
      content += `- ${benefit}\n`;
    });

    content += `\n---\n\n## Getting Started\n\n`;
    content += `Ready to try ${feature.name}? Here's how to get started:\n\n`;
    content += `1. **Open 3mpwrApp** - Start here: https://3mpwrapp.pages.dev/\n`;
    content += `2. **Complete setup** - Takes just 5 minutes\n`;
    content += `3. **Find the feature** - Look for "${feature.name}" in your app\n`;
    content += `4. **Follow the guide** - In-app tutorials walk you through each step\n\n`;

    content += `---\n\n## Learn More\n\n`;
    content += `For complete information about ${feature.name} and all other features:\n\n`;
    content += `- [Read the Complete User Guide](/user-guide/#${feature.userGuideSection})\n`;
    content += `- [Explore All Features](/features/)\n`;
    content += `- [Join Beta Testing](/beta/)\n`;
    content += `- [Subscribe to Updates](/newsletter/)\n\n`;

    content += `---\n\n## About 3mpwrApp\n\n`;
    content += `3mpwrApp is a community-driven platform built for injured workers and persons with disabilities across Canada. We provide practical tools, community support, and advocacy resources - all designed with accessibility, privacy, and cultural respect at the core.\n\n`;
    content += `**All features are:**\n`;
    content += `- Fully accessible (WCAG 2.2 AA+)\n`;
    content += `- Privacy-first (local-first architecture)\n`;
    content += `- Canadian-focused (all provinces/territories)\n`;
    content += `- Culturally inclusive (Indigenous languages supported)\n`;
    content += `\nThis is one part of the 3mpwrApp flywheel. As more experiences are captured and analyzed, they feed into a growing knowledge base-powering guides, templates, and visual tools that help injured workers, the disability community, families, and advocates navigate complex systems and avoid being overlooked.\n`;

    return content;
  }

  /**
   * Generate a Tutorial article
   */
  generateTutorialContent(item) {
    const dateStr = new Date().toISOString().split('T')[0];
    const tagSlug = item.category.toLowerCase().replace(/\s+/g, '-');
    let md = `---\nlayout: post\ntitle: "${item.name}"\ndate: ${dateStr} 00:00:00 +0000\ntags: [tutorial, how-to, accessibility, ${tagSlug}]\ncategories: [tutorials]\nexcerpt: "${item.description}"\n---\n\n# ${item.name}\n\n*A practical guide from the 3mpwrApp team.*\n\n---\n\n`;
    if (item.body) md += item.body.join('\n\n') + '\n\n';
    md += `---\n\n## What You\'ll Learn\n\n`;
    item.highlights.forEach(h => { md += `- ${h}\n`; });
    md += `\n---\n\n## Step by Step\n\n`;
    item.examples.forEach((ex, i) => { md += `**Step ${i + 1}:** ${ex}\n\n`; });
    md += `---\n\n## Key Takeaways\n\n`;
    (item.takeaways || item.benefits || []).forEach(t => { md += `- ${t}\n`; });
    md += `\n---\n\n## Ready to Try It?\n\n1. **Download 3mpwrApp** â€” [3mpwrapp.pages.dev](https://3mpwrapp.pages.dev/)\n2. **Sign up or explore as guest** â€” no commitment needed\n3. **Find this feature** â€” search or browse main navigation\n\n---\n\n## About 3mpwrApp\n\n3mpwrApp is a free, accessibility-first platform for injured workers and people with disabilities across Canada.\n- ðŸ“– [Full User Guide](/user-guide/)\n- ðŸ§ª [Join the Beta](/app-waitlist/)\n- ðŸ’¬ [Community Forums](/community/)\n`;
    return md;
  }

  /**
   * Generate a Dev Diary article
   */
  generateDevDiaryContent(item) {
    const dateStr = new Date().toISOString().split('T')[0];
    let md = `---\nlayout: post\ntitle: "Dev Diary: ${item.name}"\ndate: ${dateStr} 00:00:00 +0000\ntags: [dev-diary, development, behind-the-scenes]\ncategories: [dev-diary]\nexcerpt: "${item.description}"\n---\n\n# Dev Diary: ${item.name}\n\n*A behind-the-scenes look at how we build 3mpwrApp.*\n\n---\n\n`;
    if (item.body) md += item.body.join('\n\n') + '\n\n';
    md += `---\n\n## Technical Details\n\n`;
    item.highlights.forEach(h => { md += `- ${h}\n`; });
    md += `\n---\n\n## In Practice\n\n`;
    item.examples.forEach(ex => { md += `- ${ex}\n`; });
    md += `\n---\n\n## What We Learned\n\n`;
    (item.takeaways || item.benefits || []).forEach(t => { md += `- ${t}\n`; });
    md += `\n---\n\n## Follow Our Development\n\nWe believe in building in public â€” the community we serve has been failed by opaque institutions too many times.\n\n- â­ [GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)\n- ðŸ§ª [Join Beta Testing](/app-waitlist/)\n- ðŸ’¬ [Community Discussion](/community/)\n`;
    return md;
  }

  /**
   * Generate a Lore / Philosophy article
   */
  generateLoreContent(item) {
    const dateStr = new Date().toISOString().split('T')[0];
    const tagSlug = item.category.toLowerCase().replace(/\s+/g, '-');
    let md = `---\nlayout: post\ntitle: "${item.name}"\ndate: ${dateStr} 00:00:00 +0000\ntags: [community, ${tagSlug}, mission, philosophy]\ncategories: [community]\nexcerpt: "${item.description}"\n---\n\n# ${item.name}\n\n`;
    if (item.body) md += item.body.join('\n\n') + '\n\n';
    md += `---\n\n## The Principles\n\n`;
    item.highlights.forEach(h => { md += `- ${h}\n`; });
    md += `\n---\n\n## In Action\n\n`;
    item.examples.forEach(ex => { md += `- ${ex}\n`; });
    md += `\n---\n\n## Why It Matters\n\n`;
    (item.takeaways || item.benefits || []).forEach(t => { md += `- ${t}\n`; });
    md += `\n---\n\n## Join the Community\n\n3mpwrApp is built on these principles â€” and built for and with the people who need them most.\n\n- ðŸ’¬ [Community Forums](/community/)\n- ðŸ§ª [Become a Beta Tester](/app-waitlist/)\n- ðŸ“– [Read Our Mission](/about/)\n`;
    return md;
  }

  /**
   * Generate a Dev Update article from recent git commits.
   * Returns null if git log is unavailable (caller falls back to feature).
   */
  generateDevUpdateContent() {
    const { execSync } = require('child_process');
    let commits = [];
    try {
      const log = execSync('git log --pretty=format:"%s" -20 --no-merges', {
        encoding: 'utf-8', cwd: process.cwd(), timeout: 5000
      });
      commits = log.trim().split('\n').filter(l => l.trim() && !l.toLowerCase().startsWith('merge'));
    } catch {
      return null;
    }
    if (commits.length < 3) return null;

    const dateStr = new Date().toISOString().split('T')[0];
    const clean = c => c.replace(/^(feat|fix|chore|docs|test|style|refactor|perf)(\(.*?\))?:\s*/i, '').trim();
    const features = commits.filter(c => /^feat/i.test(c)).map(clean).slice(0, 6);
    const fixes = commits.filter(c => /^fix/i.test(c)).map(clean).slice(0, 5);
    const other = commits.filter(c => !/^feat|^fix/i.test(c)).map(clean).slice(0, 3);

    const article = `---\nlayout: post\ntitle: "Dev Update: What\'s Been Happening in 3mpwrApp"\ndate: ${dateStr} 00:00:00 +0000\ntags: [dev-update, changelog, development, transparency]\ncategories: [updates]\nexcerpt: "A look at the latest improvements, fixes, and behind-the-scenes work happening in 3mpwrApp"\n---\n\n# Dev Update: What\'s Been Happening in 3mpwrApp\n\nWe believe in building in public. Here\'s a look at what our team has been working on recently, straight from our development history.\n\n---\n${features.length ? '\n## ✨ New & Improved\n\n' + features.map(c => `- ${c}`).join('\n') + '\n' : ''}${fixes.length ? '\n## ðŸ”§ Fixes & Polish\n\n' + fixes.map(c => `- ${c}`).join('\n') + '\n' : ''}${other.length ? '\n## âš™ï¸ Under the Hood\n\n' + other.map(c => `- ${c}`).join('\n') + '\n' : ''}\n---\n\n## Why We Build in Public\n\nTransparency is a core operating principle at 3mpwrApp. The community we serve has been let down by opaque institutions â€” we want to be the structural opposite of that. This means sharing our development process openly, explaining what we\'re working on and why, and being honest when things take longer than expected.\n\n---\n\n## Stay Connected\n\n- â­ [Follow our development on GitHub](https://github.com/S0vryn9-C011ect1ve/3mpwrapp.github.io)\n- ðŸ“¬ [Subscribe to updates](/newsletter/)\n- ðŸ’¬ [Join the community](/community/)\n- ðŸ§ª [Join the beta program](/app-waitlist/)\n`;

    return {
      article,
      meta: {
        name: `Dev Update â€” ${dateStr}`,
        category: 'Dev Update',
        description: 'Latest development updates from the 3mpwrApp team',
        highlights: [...features.slice(0, 3), ...fixes.slice(0, 2)],
        examples: [...features.slice(0, 2), ...fixes.slice(0, 1)],
        takeaways: ['Transparency is how we build trust with the community we serve']
      }
    };
  }

  /**
   * Generate social media post content with viral hooks
   */
  generateSocialPost(contentItem, articleUrl, contentType = 'feature') {
    const BLOG_URL = `${siteConfig.url}/blog`;
    const fullUrl = `${siteConfig.url}${articleUrl}`;

    // Get viral hook â€” fall back gracefully if category not in hooks library
    let hookData;
    try {
      hookData = viralHooks.getRandomHook(contentItem.category);
    } catch {
      hookData = { hook: 'A practical update for disability rights:', cta: 'Read more' };
    }
    const monthlyTheme = viralHooks.getMonthlyTheme();

    const ctaOptions = viralHooks.CTA_LIBRARY.feature_spotlight;
    const randomCta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)]
      .replace('{link}', fullUrl);

    const typeLabel = { feature: 'Feature Spotlight', tutorial: 'Tutorial', devDiary: 'Dev Diary', lore: 'From Our Team', devUpdate: 'Dev Update' }[contentType] || 'Feature Spotlight';

    const hook = this.toPlainAscii(hookData.hook || 'A practical update for disability rights:');
    const desc = this.toPlainAscii(contentItem.description || '');
    const highlights = (contentItem.highlights || []).map(h => this.toPlainAscii(h));
    const name = this.toPlainAscii(contentItem.name || '3mpwrApp update');
    const cta = this.toPlainAscii(hookData.cta || 'Read more');

    const shortPost = `${hook}

  ${typeLabel}: ${name}

${desc.substring(0, 120)}${desc.length > 120 ? '...' : ''}

${randomCta}

#3mpwrApp #DisabilityRights #Accessibility`;

    const longPost = `${hook}

  ${typeLabel}: ${name}

${desc}

  Key points:
${highlights.slice(0, 3).map(h => `• ${h}`).join('\n')}

  ${cta} -> ${fullUrl}

  More on the blog: ${BLOG_URL}

#3mpwrApp #DisabilityRights #Accessibility #ChronicIllness #DisabilityJustice #SpoonTheory #${monthlyTheme.theme.replace(/\s+/g, '')}`;

    // Helper function to truncate to character limit while preserving hashtags
    const truncatePost = (text, limit) => {
      if (text.length <= limit) return text;
      
      // Find hashtags at the end
      const hashtagMatch = text.match(/(#[^\s#]+(?:\s+#[^\s#]+)*)\s*$/);
      const hashtags = hashtagMatch ? hashtagMatch[0] : '';
      const mainContent = hashtagMatch ? text.substring(0, text.length - hashtags.length).trim() : text;
      
      // Calculate available space for content
      const availableSpace = limit - hashtags.length - 5; // 5 chars for "..." + spacing
      
      if (mainContent.length <= availableSpace) {
        return mainContent + '\n\n' + hashtags;
      }
      
      // Truncate at word boundary
      let truncated = mainContent.substring(0, availableSpace);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > availableSpace * 0.8) { // Only truncate at space if it's not too far back
        truncated = truncated.substring(0, lastSpace);
      }
      
      return truncated.trim() + '...\n\n' + hashtags;
    };

    // Platform-specific versions with character limits
    const mastodonPost = truncatePost(longPost, 500); // Mastodon: 500 chars
    const blueskyPost = truncatePost(shortPost, 300); // Bluesky: 300 chars
    const xPost = truncatePost(shortPost, 280); // X/Twitter: 280 chars

    return {
      shortPost: this.toPlainAscii(shortPost),
      longPost: this.toPlainAscii(longPost),
      mastodonPost: this.toPlainAscii(mastodonPost),
      blueskyPost: this.toPlainAscii(blueskyPost),
      xPost: this.toPlainAscii(xPost),
      url: fullUrl,
      blogUrl: BLOG_URL,
      hookUsed: hook,
      emotion: hookData.emotion,
      monthlyTheme: monthlyTheme.theme
    };
  }

  /**
   * Generate daily content â€” cycles through features, tutorials, dev diaries, lore, and dev updates.
   */
  generateDailyFeature() {
    const selected = this.selectContent();
    const { type: contentType, item: contentItem } = selected;

    console.log(`\nGenerating daily content [${contentType}]: ${contentItem.name}\n`);
    this.saveUsedFeatures();

    const dateStr = new Date().toISOString().split('T')[0];
    const [year, month, day] = dateStr.split('-');
    const slug = contentItem.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const typePrefix = { feature: 'feature-spotlight', tutorial: 'tutorial', devDiary: 'dev-diary', lore: 'community', devUpdate: 'dev-update' }[contentType] || 'feature-spotlight';

    const filename = `${dateStr}-${typePrefix}-${slug}.md`;
    const filepath = path.join(this.postsDir, filename);

    // Dispatch to the correct article generator
    let articleContent;
    if (contentType === 'tutorial') {
      articleContent = this.generateTutorialContent(contentItem);
    } else if (contentType === 'devDiary') {
      articleContent = this.generateDevDiaryContent(contentItem);
    } else if (contentType === 'lore') {
      articleContent = this.generateLoreContent(contentItem);
    } else if (contentType === 'devUpdate' && selected.article) {
      articleContent = selected.article;
    } else {
      articleContent = this.generateArticleContent(contentItem);
    }

    const cleanArticleContent = this.toPlainAscii(articleContent);
    fs.writeFileSync(filepath, cleanArticleContent, 'utf-8');
    console.log(`Created: ${filepath}`);

    const articleUrl = `/blog/${year}/${month}/${day}/${typePrefix}-${slug}/`;
    const social = this.generateSocialPost(contentItem, articleUrl, contentType);

    const socialPath = path.join(process.cwd(), 'public', 'daily-feature-social.json');
    fs.writeFileSync(socialPath, JSON.stringify({
      feature: contentItem.name,
      contentType,
      date: dateStr,
      shortPost: social.shortPost,
      longPost: social.longPost,
      url: social.url,
      articlePath: filepath
    }, null, 2), 'utf-8');

    console.log(`Social post ready: ${socialPath}`);

    return { feature: contentItem.name, contentType, filepath, articleUrl, social };
  }
}

// Run if called directly
if (require.main === module) {
  const generator = new DailyFeatureGenerator();
  const result = generator.generateDailyFeature();

  console.log('\n------------------------------------------------------------\n');
  console.log('Daily feature article generated.');
  console.log(`Feature: ${result.feature}`);
  console.log(`Article: ${result.filepath}`);
  console.log(`URL: ${result.articleUrl}`);
  console.log('\nSocial post ready for auto-posting');
  console.log('\n------------------------------------------------------------\n');
}

module.exports = DailyFeatureGenerator;

