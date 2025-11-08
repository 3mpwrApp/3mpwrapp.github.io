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

class DailyFeatureGenerator {
  constructor() {
    this.postsDir = path.join(process.cwd(), '_posts');
    this.userGuidePath = path.join(process.cwd(), 'user-guide.md');
    
    // Feature library from user-guide.md - FACTUAL information only
    // NOTE: 3mpwrApp is NOW IN PRODUCTION - Phase 1 Closed Beta Testing
    // Accepting beta testers at https://3mpwrapp.pages.dev/app-waitlist
    this.features = [
      {
        name: '3mpwrApp Beta Launch: Join Phase 1 Testing',
        category: 'Beta Program',
        description: '3mpwrApp is now live in Phase 1 closed beta testing - completely free forever for all users',
        userGuideSection: 'beta-testing-access',
        highlights: [
          'App is now in production with Phase 1 closed beta',
          'Completely FREE - now and forever, no premium tiers or paywalls',
          'Beta testers get early access to all core features',
          'Help shape the app through testing and feedback',
          'Direct communication with development team',
          'Installation instructions sent via email',
          'Join waitlist at https://3mpwrapp.pages.dev/app-waitlist'
        ],
        examples: [
          'Test Evidence Locker and document storage features',
          'Try out the Master Letter Generator with 22 templates',
          'Explore Wellness Hub mood and symptom tracking',
          'Provide feedback on accessibility features',
          'Report bugs and suggest improvements'
        ],
        benefits: [
          'First access to new features as they launch',
          'Shape the app to meet your actual needs',
          'Be part of a community-driven development process',
          'Always free - this is our commitment to the community'
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
          'Medical: "Ambulatory dysfunction" → Plain: "Difficulty walking"',
          'Legal: "Reasonable accommodation" → Plain: "Changes employer must make"',
          'Plain: "I can\'t work full time" → Professional: "Reduced capacity requiring part-time arrangement"',
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
    const BLOG_URL = `${siteConfig.url}/blog`;
    const fullUrl = `${siteConfig.url}${articleUrl}`;  // Full article URL
    
    // Short version for Twitter/Bluesky (< 280 chars with link)
    const shortPost = `✨ Feature Spotlight: ${feature.name}

${feature.description}

Learn more: ${fullUrl}

#DisabilityRights #Accessibility #Tools`;

    // Longer version for Mastodon (500 chars)
    const longPost = `✨ Feature Spotlight: ${feature.name}

${feature.description}

Key highlights:
${feature.highlights.slice(0, 2).map(h => `✓ ${h}`).join('\n')}

Perfect for ${feature.category.toLowerCase()} support!

📖 Read the full article: ${fullUrl}

📰 More features: ${BLOG_URL}#feature-articles

#DisabilityRights #Accessibility #DisabilityJustice #A11y #3mpwrApp`;

    return { shortPost, longPost, url: fullUrl, blogUrl: `${BLOG_URL}#feature-articles` };
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
