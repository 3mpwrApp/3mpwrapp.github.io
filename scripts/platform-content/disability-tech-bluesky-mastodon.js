/**
 * Platform-Specific Content: Bluesky & Mastodon
 * Campaign: Why Disability Apps Fail
 * 
 * Both platforms favor:
 * - Thread conversations (Bluesky) / Toots (Mastodon)
 * - Educational, in-depth content
 * - Community-first culture
 * - Minimal hashtags
 * - Authentic voice over corporate tone
 */

const bskyMastodonPosts = {
  campaign: "why-disability-apps-fail",
  publishDate: "2026-01-06",
  platforms: ["bluesky", "mastodon"],

  // BLUESKY: Native thread format (preferred)
  bluesky: {
    threadTitle: "Why Disability Apps Fail (And Why 3mpwrApp Is Different)",
    
    posts: [
      {
        order: 1,
        text: "Here's what happens with most disability apps:\n\n1. Tech company finds \"market\"\n2. Hires accessibility consultant (usually not disabled)\n3. Builds features for press releases\n4. Launches with inspiration porn\n5. Disabled people never return\n\nIt's so predictable you could automate it.\n\nThen 3mpwrApp arrived.",
        threadPosition: "start",
        replyTo: null
      },
      {
        order: 2,
        text: "Real talk: When a design team doesn't include disabled people, you get products that sound good in meetings but don't solve actual problems.\n\nExample: An app that required detailed accessibility preference forms BEFORE you could use it.\n\nGreat intention. Completely missed the point.",
        threadPosition: "middle",
        replyTo: 1
      },
      {
        order: 3,
        text: "3mpwrApp flipped it.\n\nCore team: Disabled people. Injured workers. People living these challenges.\n\nWhen your designer experiences a migraine during sprint—you don't design \"inspiration.\" You design what actually works.\n\nDifference shows up everywhere.",
        threadPosition: "middle",
        replyTo: 2
      },
      {
        order: 4,
        text: "Three things it got right:\n\n1. Built BY, not FOR\nEvery feature tested with real users before launch.\n\n2. Privacy-first\nYour data stays yours. Bring your own cloud. No harvesting.\n\n3. Accessibility = No compromise\n721 tests. 100% target. Not 95%.\n\nNot theater. Infrastructure.",
        threadPosition: "middle",
        replyTo: 3
      },
      {
        order: 5,
        text: "Real example of the difference:\n\nMost apps assume WiFi access is guaranteed. Except—for people with energy limits, chronic illness, disability—WiFi isn't guaranteed.\n\n3mpwrApp: Full offline functionality.\n\nNot fancy. Necessary.",
        threadPosition: "middle",
        replyTo: 4
      },
      {
        order: 6,
        text: "On privacy (this matters for everyone paying attention to tech):\n\nDisabled people are the most surveilled population.\n\nInsurance companies, pharma, medical networks—they hunt disability data.\n\nMost apps = funnels.\n\n3mpwrApp: Your data, your control.",
        threadPosition: "middle",
        replyTo: 5
      },
      {
        order: 7,
        text: "For policy makers & advocates:\n\nThis is what community-led design looks like.\n\nNot consultants explaining disability.\nNot focus groups.\nNot boards deciding for communities.\n\nCommunity leading. Making decisions. Building solutions.\n\nEvery industry should be watching.",
        threadPosition: "middle",
        replyTo: 6
      },
      {
        order: 8,
        text: "The numbers:\n\n60+ features\n721 tests passing\n100% accessibility target\n5 jurisdictions with targeted resources\nZero venture capital\nClosed beta with real users\n\nNot a therapy app. Not inspiration. Infrastructure.\n\nRead the full story:\nhttps://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
        threadPosition: "end",
        replyTo: 7,
        hashtags: ["#DisabilityTech", "#Accessibility", "#3mpwrApp"]
      }
    ],

    engagement: {
      postTiming: "10:00 EST",
      expectedAudience: "disability advocates, accessibility professionals, curious builders",
      replyToComments: true,
      threadFollowUps: "Based on community questions"
    }
  },

  // MASTODON: Toot format (similar to Bluesky but federated)
  mastodon: {
    mainToot: {
      text: `Why Everything You Know About Disability Tech Is Backwards

Here's the pattern that repeats:
1. Tech company finds \"market\"
2. Hires accessibility consultant (usually not disabled)
3. Builds features for press releases
4. Launches with inspiration porn
5. Disabled people leave

Then 3mpwrApp said no.

Built BY disabled people. Privacy-first. 100% accessibility target. No compromise.

Why this changes everything:
https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail

#DisabilityTech #Accessibility #3mpwrApp`,
      
      sensitive_content: false,
      visibility: "public",
      postTiming: "10:00 EST"
    },

    followUpToots: [
      {
        order: 1,
        text: `When your design team doesn't include disabled people, you get features that sound good in meetings but don't solve real problems.

Real example: An app that required detailed accessibility form BEFORE you could use it.

3mpwrApp? Just works. For everyone. From start.

That's the difference.`,
        replyTo: "main",
        timing: "+5 mins"
      },
      {
        order: 2,
        text: `3 things it got right:

1. Core team IS disabled people
2. Your data stays yours (bring your own cloud)
3. 721 tests. 100% accessibility target. Not 95%.

Not inspiration. Infrastructure.`,
        replyTo: 1,
        timing: "+15 mins"
      },
      {
        order: 3,
        text: `Real example of the impact:

Most apps assume WiFi is always available.

For people with energy limits, chronic illness—WiFi isn't guaranteed.

3mpwrApp works completely offline.

Not fancy. Necessary.`,
        replyTo: 2,
        timing: "+20 mins"
      },
      {
        order: 4,
        text: `For anyone working in disability policy, tech, or accessibility:

This is what community-led design looks like.

Not boards deciding for communities.
Not consultants explaining disability.

Communities leading. Making decisions. Building solutions.

Thread: https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail`,
        replyTo: 3,
        timing: "+25 mins"
      }
    ],

    engagement: {
      postTiming: "10:00 EST",
      expectedAudience: "fediverse privacy-focused folks, disability advocacy community",
      boostFactor: "Let community amplify",
      replyStrategy: "Conversational and detailed"
    }
  },

  // Shared strategy across both platforms
  sharedStrategy: {
    tone: "Conversational, specific, authentic",
    philosophy: "Educate > Promote",
    hashtagRule: "Minimal. Only essential.",
    linkStrength: "Blog post is the value",
    communityFirst: true,
    
    whatWorks: {
      specific_examples: true,
      numbers: true,
      community_voice: true,
      no_inspiration_porn: true,
      direct_language: true
    },

    engagement_targets: {
      reach: "5k-15k per platform",
      boost_rate: "10-20%",
      reply_quality: "thoughtful conversations",
      share_goal: "organic amplification"
    }
  },

  // Evolution & Learning
  evolution: {
    monitorFediverse: "Track what resonates",
    adaptToConversations: "Let community guide follow-ups",
    trackIfBoosted: "Learn what people find valuable",
    adjustToneIfNeeded: "More conversational if high engagement",
    
    rules: {
      ifVeryHighEngagement: "Follow up with related questions",
      ifLowEngagement: "Stay patient. Fediverse grows slower but deeper",
      ifControversialReplies: "Engage thoughtfully. Don't dismiss.",
      ifAskedQuestions: "Answer thoroughly. These are real questions."
    }
  }
};

module.exports = bskyMastodonPosts;
