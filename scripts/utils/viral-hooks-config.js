#!/usr/bin/env node
/**
 * VIRAL-HOOKS-CONFIG.JS
 * Scroll-Stopping Hook Library for 3mpwrApp Content
 * 
 * Target Audience Analysis:
 * - People with disabilities (chronic illness, invisible disabilities, mental health)
 * - Injured workers navigating WSIB/WCB systems
 * - Caregivers and support allies
 * - Canadian-focused (all provinces/territories)
 * 
 * Pain Points Addressed:
 * - System bureaucracy fatigue ("Why is everything so hard?")
 * - Feeling alone/misunderstood ("Nobody gets it")
 * - Energy management struggles (spoon theory)
 * - Legal/benefits confusion ("What am I entitled to?")
 * - Invisible disability invalidation ("But you don't look sick")
 * - Gaslighting by employers/agencies
 * - Decision paralysis from brain fog
 * 
 * Desires Addressed:
 * - Validation and community
 * - Simple, clear answers
 * - Tools that actually work for their needs
 * - Advocacy power without overwhelm
 * - Being seen and believed
 * - Financial security through benefits
 * - Accessible tech that doesn't drain energy
 * 
 * Auto-updates: Every 30 days, analytics determine top-performing hooks
 * Performance tracked via curator-analytics.js
 */

const HOOK_VERSION = '2025.12.04';
const ROTATION_PERIOD_DAYS = 30;

/**
 * Power Words That Convert (Research-Backed)
 */
const POWER_WORDS = {
  urgency: ['finally', 'breaking', 'urgent', 'now', 'today', 'just launched', 'new', 'alert'],
  curiosity: ['secret', 'hidden', 'revealed', 'truth', 'actually', 'real reason', 'nobody tells you'],
  validation: ['you deserve', 'you\'re not alone', 'they\'re wrong', 'it\'s not just you', 'validated'],
  empowerment: ['fight back', 'reclaim', 'take control', 'know your rights', 'protect yourself'],
  emotion: ['heartbreaking', 'infuriating', 'life-changing', 'game-changer', 'breakthrough'],
  numbers: ['7 ways', '3 secrets', '5 tools', '22 templates', '10 minutes', '100+ resources'],
  fomo: ['before it\'s too late', 'most people don\'t know', 'you\'re missing out', 'finally available']
};

/**
 * FEATURE SPOTLIGHT VIRAL HOOKS
 * Organized by feature category with rotating hook styles
 */
const FEATURE_SPOTLIGHT_HOOKS = {
  // HOOKS BY FEATURE CATEGORY
  'Beta Program': {
    hooks: [
      "🚨 PSA: A free app built BY the disability community is in closed beta - Phase 1 launching soon",
      "The app we've been building in silence? Closed beta is live. Phase 1 public launch coming soon. 🧪",
      "Disability tech built by disabled people. Zero cost. Zero catch. Join the waitlist →",
      "\"Why doesn't anyone build apps FOR us?\" We did. Closed beta testing now. Public launch soon.",
      "100% free forever. No premium tier. No paywalls. Phase 1 launch is coming. Get on the waitlist."
    ],
    cta: ['Join the waitlist', 'Get notified at launch', 'Be first to know', 'Sign up for Phase 1'],
    emotion: 'empowerment'
  },

  'Phase 6: ML-Powered': {
    hooks: [
      "Your phone now knows when you have energy. No, seriously. Here's how →",
      "Tired of planning around a body that doesn't cooperate? This feature reads your patterns.",
      "What if your app could tell you: \"Hey, you'll have energy at 2pm today\"?",
      "Spoon theory + AI = an app that finally understands your fluctuating energy 🥄✨",
      "24-hour energy forecast for chronic illness. The future is HERE."
    ],
    cta: ['See your forecast', 'Learn how it works', 'Try it free'],
    emotion: 'curiosity'
  },

  'Phase 2: Personalization': {
    hooks: [
      "Your disability is unique. Why isn't your app? Meet Disability Wizard.",
      "Stop digging through settings. This wizard knows what you need before you do.",
      "\"The app suggested stretching when my pain spiked.\" Magic? No. Machine learning.",
      "An app that adapts to YOUR disability, not the other way around.",
      "Brain fog? No problem. The app remembers what you forget. 🧠"
    ],
    cta: ['Get personalized help', 'Meet your wizard', 'Start today'],
    emotion: 'validation'
  },

  'Phase 2: Legal Tools': {
    hooks: [
      "22 letter templates that have won accommodations. All free. Zero excuses left.",
      "Your employer said no? Here's the letter that changed their mind →",
      "Writing to HR shouldn't require a law degree. These templates do the work for you.",
      "DENIED. But then I sent THIS letter... [Full template inside]",
      "The exact words disability lawyers use. Now in a free template generator."
    ],
    cta: ['Get the templates', 'Start your letter', 'Fight back now'],
    emotion: 'empowerment'
  },

  'Core Feature': {
    hooks: [
      "Your evidence, encrypted. Your documents, organized. Your case, protected.",
      "\"I lost the denial letter.\" Never again. Evidence Locker keeps receipts 🔐",
      "Military-grade encryption for medical records. Because your privacy matters.",
      "Benefits Navigator: The map through Canada's disability benefits maze.",
      "Every Canadian disability benefit, explained simply. Finally. 🇨🇦"
    ],
    cta: ['Protect your documents', 'Find your benefits', 'Get started'],
    emotion: 'urgency'
  },

  'Accessibility': {
    hooks: [
      "Screen readers love this app. Here's why →",
      "Dyslexia? 5 fonts. 8 overlays. Your screen, your rules.",
      "Tremor-friendly design exists. We built it. Here's how it works →",
      "Motor accessibility features that actually work (finally)",
      "We tested with real users using real assistive tech. Here's what they said..."
    ],
    cta: ['Customize your experience', 'See accessibility features', 'Try it yourself'],
    emotion: 'validation'
  },

  'Wellness & Safety': {
    hooks: [
      "Crisis at 3am? One tap. That's it. No login. No barriers.",
      "\"I wish I had this when I was struggling.\" — every beta tester",
      "Mental health support that doesn't require 47 clicks to access.",
      "Crisis lines for Indigenous communities, LGBTQ+ folks, youth. All in one place.",
      "Safety plan in your pocket. Because bad nights don't schedule themselves."
    ],
    cta: ['See crisis resources', 'Create safety plan', 'Share with someone'],
    emotion: 'urgency'
  },

  'Wellness Tools': {
    hooks: [
      "Started with 12 spoons. Ended with 2. Here's what drained me →",
      "Spoon Theory tracking that actually makes sense. Finally.",
      "Mood tracker that doesn't feel like homework. Just taps and insights.",
      "Pain at 7/10? The app adjusts. That's Pain Flare Mode. 🔥",
      "Self-care ideas for low energy days. Not just \"take a bath\" either."
    ],
    cta: ['Track your spoons', 'Start mood tracking', 'Find low-energy self-care'],
    emotion: 'validation'
  },

  'Advocacy Tools': {
    hooks: [
      "They promised accommodations. They lied. Here's how to catch them →",
      "Accountability Tracker: Because gaslighters hate receipts 📝",
      "Legal jargon → plain English. In seconds. For free.",
      "Upload your denial letter. Get a summary + next steps. AI that helps.",
      "Find a disability lawyer in YOUR province. Zero guesswork."
    ],
    cta: ['Start tracking', 'Translate your documents', 'Find legal help'],
    emotion: 'empowerment'
  },

  'Community Tools': {
    hooks: [
      "Matched with someone navigating the EXACT same system. Coincidence? Algorithm.",
      "94% peer match accuracy. How? We asked what matters to disabled people.",
      "Discussion forums where no one says \"but have you tried yoga?\" 🙄",
      "Community built by disabled people, for disabled people. No allies without us.",
      "Found my people. On an app. In 2025. Wild, right?"
    ],
    cta: ['Find your match', 'Join the community', 'Start a discussion'],
    emotion: 'validation'
  }
};

/**
 * WEEKLY RECAP VIRAL HOOKS
 * Summarize the week with scroll-stopping openers
 */
const WEEKLY_RECAP_HOOKS = [
  // Achievement Focus
  "📊 This week we shipped {count} improvements. Here's what changed →",
  "7 days. {count} updates. Your feedback is literally building this app.",
  "Weekend recap: The features you asked for? We built {count} of them this week.",
  
  // Community Focus
  "What the disability community helped us fix this week 👇",
  "Beta testers spoke. We listened. Here's what's new →",
  "Built by community feedback. This week's proof 👇",
  
  // Progress Focus
  "Quietly making progress. This week's updates from 3mpwrApp →",
  "Small wins add up. Here's what we accomplished this week:",
  "Another week of building tools that actually work for disabled people 💪",
  
  // FOMO Focus
  "Missed this week's updates? Here's everything that's new →",
  "If you haven't checked the app this week, you're missing these features:",
  "New week, new features. Catch up on everything we shipped 👇",
  
  // Validation Focus
  "This week we fixed things other apps ignore. Here's the list →",
  "Accessibility improvements most apps would skip. We didn't. →",
  "\"Finally, someone gets it.\" — Community feedback that inspired this week's updates"
];

/**
 * DAILY NEWS CURATION VIRAL HOOKS
 * For curated disability news posts
 */
const DAILY_NEWS_HOOKS = [
  // Breaking News Style
  "🔴 Breaking: {top_story_summary}",
  "⚠️ New developments in disability rights you need to know →",
  "Today's headlines disabled Canadians are talking about 👇",
  
  // Curated Knowledge Style
  "Your daily dose of disability news, curated by people who get it →",
  "50+ sources. One feed. Zero ableism. Today's roundup 👇",
  "What mainstream media isn't covering: Today's disability news →",
  
  // FOMO Style
  "Scrolled past this? Here's what you missed in disability news →",
  "Everyone's talking about this. Here's why it matters for us →",
  "Today's news that affects YOUR benefits, rights, and life →",
  
  // Validation Style
  "Finally, news reported WITH us, not AT us. Today's highlights 👇",
  "Disability news from disabled journalists. Novel concept, right? →",
  "Stories that actually matter to our community. Not inspiration porn. →",
  
  // Action-Oriented Style
  "Know your rights. Today's policy changes that affect YOU →",
  "Advocacy opportunities in today's news. Don't miss these →",
  "Today's news + what you can do about it. Thread 👇"
];

/**
 * PLATFORM-SPECIFIC FORMATTING
 */
const PLATFORM_STYLES = {
  mastodon: {
    maxLength: 500,
    hashtagStyle: 'inline', // Mix in naturally
    emojiDensity: 'moderate',
    threadSupport: false,
    ctaStyle: 'link-in-bio',
    bestTimes: ['9:00 UTC', '14:00 UTC', '20:00 UTC'],
    topHashtags: [
      '#3mpwrApp', '#DisabilityRights', '#Accessibility', '#ChronicIllness', 
      '#SpoonTheory', '#DisabilityJustice', '#WorkersRights',
      '#InjuredWorkers', '#DisabledAndProud', '#InvisibleIllness', 
      '#MentalHealth', '#WSIB', '#Canada'
    ]
  },
  
  bluesky: {
    maxLength: 300,
    hashtagStyle: 'minimal', // 1-2 max
    emojiDensity: 'high',
    threadSupport: true,
    ctaStyle: 'thread-continuation',
    bestTimes: ['10:00 UTC', '15:00 UTC', '21:00 UTC'],
    topHashtags: [
      '#3mpwrApp', '#DisabilityRights', '#Accessibility'
    ]
  }
};

/**
 * MONTHLY CONTENT THEMES
 * Rotate focus based on calendar and awareness months
 */
const MONTHLY_THEMES = {
  1: { // January
    theme: 'New Year, New Rights',
    focus: ['benefits-navigator', 'letter-generator', 'policy-changes'],
    hooks: ['New year benefits deadlines', 'Resolution: Know your rights', 'Fresh start advocacy']
  },
  2: { // February
    theme: 'Heart Health & Self-Love',
    focus: ['wellness-hub', 'self-care', 'mental-health'],
    hooks: ['Loving yourself with chronic illness', 'Heart health + disability', 'Self-care revolution']
  },
  3: { // March - Disability Awareness Month (Canada)
    theme: 'Disability Pride',
    focus: ['community', 'advocacy', 'rights'],
    hooks: ['Disability Awareness Month', 'Proud to be disabled', 'Our community, our power']
  },
  4: { // April - Autism Acceptance
    theme: 'Neurodiversity Celebration',
    focus: ['cognitive-accessibility', 'personalization', 'community'],
    hooks: ['Autism Acceptance not awareness', 'Neurodivergent joy', 'Built for how your brain works']
  },
  5: { // May - Mental Health Awareness
    theme: 'Mental Health Matters',
    focus: ['mood-tracker', 'crisis-resources', 'wellness-tools'],
    hooks: ['Mental health IS health', 'Invisible struggles', 'Your feelings are valid']
  },
  6: { // June - Deafblind Awareness, Pride
    theme: 'Intersectional Pride',
    focus: ['accessibility', 'lgbtq-resources', 'community'],
    hooks: ['Disabled AND proud', 'Intersectional justice', 'All bodies, all identities']
  },
  7: { // July - Disability Pride Month
    theme: 'Disability Pride',
    focus: ['community', 'advocacy', 'celebration'],
    hooks: ['Disability Pride Month', 'Nothing about us without us', 'Crip joy']
  },
  8: { // August
    theme: 'Back to School/Work Rights',
    focus: ['accommodations', 'letter-generator', 'legal-tools'],
    hooks: ['Know your accommodation rights', 'Back to school with a disability', 'Workplace rights 101']
  },
  9: { // September - Pain Awareness Month
    theme: 'Chronic Pain Warriors',
    focus: ['pain-tracking', 'spoon-theory', 'energy-forecast'],
    hooks: ['Pain is real', 'Chronic pain awareness', 'Invisible pain, visible impact']
  },
  10: { // October - Disability Employment Awareness
    theme: 'Disability Employment Rights',
    focus: ['workplace-accommodations', 'legal-tools', 'advocacy'],
    hooks: ['Disability Employment Awareness', 'Your workplace rights', 'Accommodations are law']
  },
  11: { // November - Injured Workers
    theme: 'Injured Workers Matter',
    focus: ['wsib-resources', 'evidence-locker', 'appeals'],
    hooks: ['WSIB/WCB advocacy', 'Injured workers deserve better', 'Fight for fair compensation']
  },
  12: { // December
    theme: 'Year in Review & Self-Care',
    focus: ['wellness', 'community', 'achievements'],
    hooks: ['You survived this year', 'Holiday self-care', 'Community accomplishments']
  }
};

/**
 * A/B TESTING VARIANTS
 * Track performance of different hook styles
 */
const HOOK_VARIANTS = {
  question: {
    template: '❓ {question}',
    example: 'Why doesn\'t anyone build apps that actually work for disabled people?',
    weight: 1.0 // Starting weight, adjusted by analytics
  },
  statement: {
    template: '💥 {bold_statement}',
    example: 'Your employer is legally required to accommodate you. They just don\'t want to.',
    weight: 1.0
  },
  number: {
    template: '📊 {number} {thing}',
    example: '22 letter templates that have won accommodations',
    weight: 1.2 // Numbers perform well
  },
  story: {
    template: '📖 {mini_story}',
    example: 'I uploaded my denial letter. 30 seconds later I knew exactly how to fight back.',
    weight: 1.1
  },
  fomo: {
    template: '🚨 {fomo_trigger}',
    example: 'Most people don\'t know they can appeal within 30 days. Don\'t miss your window.',
    weight: 1.0
  },
  validation: {
    template: '💚 {validation}',
    example: 'You\'re not lazy. You\'re managing a body that doesn\'t cooperate. There\'s a difference.',
    weight: 1.3 // Validation resonates strongly
  }
};

/**
 * CALL-TO-ACTION LIBRARY
 * Platform-optimized CTAs
 */
const CTA_LIBRARY = {
  feature_spotlight: [
    '✨ Try it free: {link}',
    '👉 See how it works: {link}',
    '🔗 Available now: {link}',
    '💡 Learn more: {link}',
    '🚀 Get started: {link}'
  ],
  weekly_recap: [
    '📰 Full update: {link}',
    '🔗 Read more: {link}',
    '📊 See all changes: {link}',
    '👀 What\'s new: {link}'
  ],
  daily_news: [
    '📰 Read all {count} stories: {link}',
    '🔗 Full digest: {link}',
    '👉 Today\'s news: {link}',
    '📚 Stay informed: {link}'
  ],
  community: [
    '🤝 Join us: {link}',
    '💬 Connect with community: {link}',
    '👥 Find your people: {link}'
  ]
};

/**
 * ANALYTICS INTEGRATION
 * Performance tracking for hook optimization
 */
const analyticsMetrics = {
  // Engagement signals to track
  track: ['impressions', 'clicks', 'reposts', 'replies', 'favorites'],
  
  // Performance thresholds
  thresholds: {
    high_performer: { engagementRate: 0.05 }, // 5%+ engagement
    average: { engagementRate: 0.02 },
    underperformer: { engagementRate: 0.01 }
  },
  
  // Rotation rules
  rotation: {
    periodDays: 30,
    promoteThreshold: 'high_performer',
    demoteThreshold: 'underperformer',
    minSamples: 5 // Minimum uses before adjusting weight
  }
};

/**
 * GET RANDOM HOOK
 * Returns a random hook for given category with weighting
 */
function getRandomHook(category, variant = null) {
  const categoryHooks = FEATURE_SPOTLIGHT_HOOKS[category];
  if (!categoryHooks) {
    // Fallback to generic empowerment hooks
    return {
      hook: "🚀 New feature just dropped. Free forever. Built for YOU.",
      cta: "Check it out",
      emotion: "empowerment"
    };
  }
  
  const hooks = categoryHooks.hooks;
  const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  const randomCta = categoryHooks.cta[Math.floor(Math.random() * categoryHooks.cta.length)];
  
  return {
    hook: randomHook,
    cta: randomCta,
    emotion: categoryHooks.emotion
  };
}

/**
 * GET WEEKLY HOOK
 * Returns appropriate weekly recap hook
 */
function getWeeklyHook(updateCount = 0) {
  const hooks = WEEKLY_RECAP_HOOKS;
  const randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  return randomHook.replace('{count}', updateCount.toString());
}

/**
 * GET DAILY NEWS HOOK
 * Returns appropriate daily news hook
 */
function getDailyNewsHook(topStory = null) {
  const hooks = DAILY_NEWS_HOOKS;
  let randomHook = hooks[Math.floor(Math.random() * hooks.length)];
  
  if (topStory && randomHook.includes('{top_story_summary}')) {
    randomHook = randomHook.replace('{top_story_summary}', topStory);
  } else if (randomHook.includes('{top_story_summary}')) {
    // Fallback if no top story provided
    randomHook = hooks[Math.floor(Math.random() * (hooks.length - 3)) + 3]; // Skip breaking news style
  }
  
  return randomHook;
}

/**
 * GET MONTHLY THEME
 * Returns current month's theme and focus areas
 */
function getMonthlyTheme() {
  const month = new Date().getMonth() + 1;
  return MONTHLY_THEMES[month] || MONTHLY_THEMES[1];
}

/**
 * FORMAT FOR PLATFORM
 * Applies platform-specific formatting
 */
function formatForPlatform(content, platform) {
  const style = PLATFORM_STYLES[platform];
  if (!style) return content;
  
  // Truncate if needed
  if (content.length > style.maxLength) {
    content = content.substring(0, style.maxLength - 3) + '...';
  }
  
  // Add hashtags
  if (style.hashtagStyle === 'inline') {
    const hashtags = style.topHashtags.slice(0, 5).join(' ');
    if (content.length + hashtags.length + 2 <= style.maxLength) {
      content += '\n\n' + hashtags;
    }
  } else if (style.hashtagStyle === 'minimal') {
    const hashtags = style.topHashtags.slice(0, 2).join(' ');
    if (content.length + hashtags.length + 2 <= style.maxLength) {
      content += '\n\n' + hashtags;
    }
  }
  
  return content;
}

/**
 * BUILD VIRAL POST
 * Complete post generation with hook, content, and CTA
 */
function buildViralPost(options) {
  const {
    type = 'feature_spotlight',
    category = 'Core Feature',
    featureName = '',
    description = '',
    link = '',
    platform = 'mastodon',
    highlights = [],
    storyCount = 0
  } = options;
  
  let post = '';
  
  switch (type) {
    case 'feature_spotlight':
      const hookData = getRandomHook(category);
      post = `${hookData.hook}\n\n`;
      post += `✨ ${featureName}\n\n`;
      post += `${description}\n\n`;
      
      if (highlights.length > 0) {
        const topHighlights = highlights.slice(0, 3);
        topHighlights.forEach(h => {
          post += `• ${h}\n`;
        });
        post += '\n';
      }
      
      const ctaOptions = CTA_LIBRARY.feature_spotlight;
      const cta = ctaOptions[Math.floor(Math.random() * ctaOptions.length)];
      post += cta.replace('{link}', link);
      break;
      
    case 'weekly_recap':
      post = `${getWeeklyHook(storyCount)}\n\n`;
      post += description + '\n\n';
      const weekCta = CTA_LIBRARY.weekly_recap[Math.floor(Math.random() * CTA_LIBRARY.weekly_recap.length)];
      post += weekCta.replace('{link}', link);
      break;
      
    case 'daily_news':
      post = `${getDailyNewsHook()}\n\n`;
      post += description + '\n\n';
      const newsCta = CTA_LIBRARY.daily_news[Math.floor(Math.random() * CTA_LIBRARY.daily_news.length)];
      post += newsCta.replace('{count}', storyCount.toString()).replace('{link}', link);
      break;
  }
  
  return formatForPlatform(post, platform);
}

// Export for use in other scripts
module.exports = {
  HOOK_VERSION,
  POWER_WORDS,
  FEATURE_SPOTLIGHT_HOOKS,
  WEEKLY_RECAP_HOOKS,
  DAILY_NEWS_HOOKS,
  PLATFORM_STYLES,
  MONTHLY_THEMES,
  HOOK_VARIANTS,
  CTA_LIBRARY,
  analyticsMetrics,
  getRandomHook,
  getWeeklyHook,
  getDailyNewsHook,
  getMonthlyTheme,
  formatForPlatform,
  buildViralPost
};
