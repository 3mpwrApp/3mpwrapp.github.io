/**
 * Platform-Specific Content: X (Twitter)
 * Campaign: Why Disability Apps Fail
 * Auto-generated for posting to X with built-in scheduling
 * 
 * 3 versions:
 * - SHORT: Single tweet (280 chars) with link
 * - THREAD: 5-part thread for engagement
 * - HOOK: Hook + CTA with variations
 */

const xPosts = {
  campaign: "why-disability-apps-fail",
  publishDate: "2026-01-06",
  platform: "x",
  
  // VERSION 1: SHORT (Single tweet)
  short: {
    text: "Most disability apps are built BY people who aren't disabled. That's the problem.\n\n3mpwrApp is different.\n\nBuilt BY disabled people. FOR disabled people. No compromise.\n\nHere's why that changes everything:\n\n→ https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
    hashtags: ["#DisabilityTech", "#Accessibility", "#3mpwrApp"],
    engagementType: "direct-link"
  },

  // VERSION 2: THREAD (5-part engagement)
  thread: [
    {
      order: 1,
      text: "Most disability apps follow the same broken pattern:\n\n1. Tech company finds \"market\"\n2. Hires accessibility consultant (not disabled)\n3. Builds features for press releases\n4. Launches with inspiration porn\n5. Disabled people never return\n\nThen 3mpwrApp arrived.",
      threadPosition: "start"
    },
    {
      order: 2,
      text: "Here's what happened when disabled people designed for disabled people:\n\n✓ Built BY people who live the problem\n✓ Privacy-first: your data stays yours\n✓ Offline-first: because WiFi isn't guaranteed\n✓ 721 tests. Zero compromise.\n\nNot a therapy app. Infrastructure.",
      threadPosition: "middle",
      replyTo: 1
    },
    {
      order: 3,
      text: "Real example:\n\nMost apps require detailed accessibility forms BEFORE you can use them.\n\n3mpwrApp asks: Why?\n\nInstead: Just works. For everyone. From the start.\n\nOne design decision. Total difference in who stays.",
      threadPosition: "middle",
      replyTo: 2
    },
    {
      order: 4,
      text: "The privacy angle (this matters for policy makers):\n\nDisabled people are the most surveilled population.\n\nInsurance companies hunt disability data.\n\nMost apps = harvesting funnels.\n\n3mpwrApp flips it: YOUR data stays YOURS. Bring your own cloud.",
      threadPosition: "middle",
      replyTo: 3
    },
    {
      order: 5,
      text: "The numbers:\n\n60+ features\n721 tests passing\n100% accessibility target (not 95%)\nZero venture capital\nClosed beta with real users\n\nNot a charity. Not theater. Infrastructure.\n\nRead the full story:\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail\n\n#DisabilityTech #3mpwrApp",
      threadPosition: "end",
      replyTo: 4
    }
  ],

  // VERSION 3: Hook variations (test which converts best)
  hooks: [
    {
      variant: "A_authority",
      text: "If you work in disability policy, healthcare, or tech—you need to see this.\n\n3mpwrApp is proving that community-led design beats corporate charity every single time.\n\nHere's why →\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      cta: "direct-link",
      targetAudience: "policymakers-advocates"
    },
    {
      variant: "B_curiosity",
      text: "You've probably never heard of 3mpwrApp.\n\nBut 60,000+ disabled people are watching.\n\nHere's why →\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      cta: "direct-link",
      targetAudience: "general-public"
    },
    {
      variant: "C_contrast",
      text: "Disability apps usually fail for 3 reasons:\n\n1. Designed FOR disabled people, not BY\n2. Privacy theater (they sell your data)\n3. \"Good enough\" accessibility\n\n3mpwrApp does all three differently.\n\nHere's how →\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      cta: "direct-link",
      targetAudience: "disability-community"
    },
    {
      variant: "D_challenge",
      text: "Name a disability app that:\n\n✓ Was built by disabled people\n✓ Doesn't harvest your data\n✓ Works fully offline\n✓ Has 721 passing tests\n\nMost people can't.\n\n3mpwrApp did it all.\n\nHere's the story →\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      cta: "direct-link",
      targetAudience: "tech-builders"
    },
    {
      variant: "E_subtle_product",
      text: "Here's what happens when you stop asking \"How do we help disabled people?\" and start asking \"What do disabled people need?\"\n\nEverything changes.\n\nSee what 3mpwrApp built →\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      cta: "direct-link",
      targetAudience: "all"
    }
  ],

  // Engagement strategy
  engagement: {
    postTiming: "08:00 EST", // Morning engagement
    threadTiming: ["08:00", "08:30", "09:00", "09:30", "10:00"], // Spread over 2 hours
    hashtagStrategy: "minimal", // Only essential: #DisabilityTech #Accessibility #3mpwrApp
    replyToMentions: true,
    trackMetrics: ["likes", "retweets", "replies", "clicks"],
    expectedEngagement: {
      reach: "50k-150k",
      engagement_rate: "4-6%",
      click_through: "2-4%"
    }
  },

  // A/B Testing variants (rotate daily)
  abtesting: {
    enabled: true,
    testDuration: 7,
    variants: ["A_authority", "B_curiosity", "C_contrast", "D_challenge", "E_subtle_product"],
    winner: null, // Will be auto-determined by engagement
    winnerThreshold: 4.5 // engagement rate %
  },

  // Evolution rules (self-aware learning)
  evolution: {
    adjustIfLowEngagement: {
      condition: "engagement_rate < 2%",
      action: "Increase hook specificity, reduce link distance"
    },
    amplifyIfHighEngagement: {
      condition: "engagement_rate > 5%",
      action: "Post more threads, increase frequency"
    },
    monitorSentiment: true,
    trackReplyQuality: true
  }
};

module.exports = xPosts;
