/**
 * Platform-Specific Content: Facebook
 * Campaign: Why Disability Apps Fail
 * Optimized for Facebook's longer format and community engagement
 * 
 * Strategies:
 * - Community-first messaging
 * - Visual descriptions for image assets
 * - CTA buttons
 * - Comment engagement prompts
 */

const facebookPosts = {
  campaign: "why-disability-apps-fail",
  publishDate: "2026-01-06",
  platform: "facebook",

  // VERSION 1: Community Post (for Pages)
  communityPost: {
    headline: "Why Everything You Know About Disability Tech Is Backwards",
    subheadline: "How 3mpwrApp is changing the game by designing WITH disabled people, not FOR them",
    
    mainText: `Here's what happens with most disability apps:

Tech company sees "untapped market" → Hires accessibility consultant (usually not disabled) → Builds features for press releases → Launches with inspiration porn → Disabled people leave.

Then 3mpwrApp arrived.

We built this differently:

✓ Built BY disabled people. Not consultants. Not board members. Actual disabled people making the decisions.

✓ Your data stays YOURS. Bring your own Google Drive. No tracking. No selling. No "anonymized insights."

✓ 721 tests. Zero compromise on accessibility. Not 95%. 100% target.

✓ Works completely offline. Because chronic illness doesn't wait for WiFi.

✓ 60+ features tested with real users before launch. No inspiration porn. Just tools that solve real problems.

Here's the real talk: When disabled people design for disabled people, you don't get a "better" therapy app. You get infrastructure.

Read the full story → [Link to blog post]`,

    cta_button: {
      text: "Read the Full Story",
      link: "https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      type: "LEARN_MORE"
    },

    image: {
      description: "Text graphic: '60+ Features. 721 Tests. 100% Accessibility. Built BY Disabled People.'",
      alt_text: "3mpwrApp: Built by disabled people for disabled people"
    },

    engagementPrompt: "What's the #1 problem you've faced with disability apps? Tell us in the comments. We're building with you.",

    hashtags: ["#DisabilityTech", "#Accessibility", "#3mpwrApp", "#DisabilityRights", "#CommunityFirst"],

    scheduledTime: "14:00 EST" // Afternoon engagement on Facebook
  },

  // VERSION 2: Story Post (Carousel - 3 slides)
  carouselPost: {
    headline: "Why Disability Apps Usually Fail",
    slides: [
      {
        order: 1,
        title: "The Broken Pattern",
        body: "Tech company hires accessibility consultant (usually not disabled). Builds features for headlines. Disabled people leave.\n\nWhy? Because it was designed FOR disabled people, not BY them.",
        image_description: "Icon: chart showing user drop-off",
        cta: "Keep reading"
      },
      {
        order: 2,
        title: "What 3mpwrApp Did Differently",
        body: "Core team IS disabled. Core team IS injured workers.\n\nWhen your designer gets a migraine during sprint and has to step back—that's when you realize what matters in design.",
        image_description: "Icon: hands coming together (collaboration)",
        cta: "Next slide"
      },
      {
        order: 3,
        title: "The Results",
        body: "60+ features | 721 tests passing | 100% accessibility target | Your data stays yours | Works offline\n\nNot inspiration. Infrastructure.",
        image_description: "Icons: checkmarks next to each achievement",
        cta: "Learn more"
      }
    ],
    
    finalCTA: {
      text: "Read the Full Story",
      link: "https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail"
    }
  },

  // VERSION 3: Personal Story / Q&A Format
  qaPost: {
    format: "dialogue",
    headline: "Ask Us: Why Is 3mpwrApp Different?",
    
    qaFormat: [
      {
        question: "Q: Why does it matter that 3mpwrApp was built BY disabled people?",
        answer: "When your design team doesn't include disabled people, you get features that sound good in meetings but don't solve real problems. 3mpwrApp was built by people living these challenges. We don't design around problems. We design with them."
      },
      {
        question: "Q: What about privacy?",
        answer: "Disabled people are hunted by insurance companies, medical networks, pharma firms for data. Most apps = harvesting funnels. 3mpwrApp: Your data is yours. Bring your own Google Drive. Period."
      },
      {
        question: "Q: Is it really 100% accessible?",
        answer: "We're targeting 100%, not settling for 95%. 721 tests. Screen readers. Cognitive accessibility. Motor accessibility. Dyslexia support. Offline-first (because WiFi access isn't guaranteed). No compromise."
      },
      {
        question: "Q: How can I get involved?",
        answer: "Join the waitlist. We're in closed beta with the disability community. Be part of building this. → [Link]"
      }
    ],

    engagementPrompt: "What questions should we answer? Drop them in the comments.",

    cta_button: {
      text: "Join the Waitlist",
      link: "https://3mpwrapp.com/waitlist"
    }
  },

  // VERSION 4: Event Post (for promoting blog as "event")
  eventPost: {
    type: "open_event", // Treat blog post as event
    title: "Community Conversation: Why Disability Tech Fails",
    description: "Join us as we break down why most disability apps don't work—and why 3mpwrApp is different.\n\nBuilt BY disabled people. Built FOR disabled people. No theater.\n\nOpen to disability community, allies, policy makers, and anyone rethinking tech.",
    
    details: {
      date: "2026-01-06",
      time: "Ongoing (read anytime)",
      location: "https://3mpwrapp.pages.dev/blog/2026-01-06-why-disability-apps-fail",
      format: "Blog post + community discussion"
    },

    rsvpText: "Read the post and share your thoughts in comments.",

    image: {
      description: "Bold text: 'Why Everything You Know About Disability Tech Is Backwards'",
      alt_text: "3mpwrApp blog post announcement"
    }
  },

  // Engagement rules for Facebook
  engagement: {
    postTiming: "14:00 EST", // Afternoon engagement peak
    responseTime: "within 2 hours",
    commentStrategy: "community-first", // Respond to all comments personally
    shareEncouragement: true,
    tagRelevantGroups: [
      "disability advocacy groups",
      "disability community pages",
      "tech accessibility groups",
      "injured worker organizations"
    ]
  },

  // Evolution: Learning what works
  evolution: {
    monitorCommentSentiment: true,
    trackShareRate: true,
    adjustIfLowEngagement: {
      condition: "engagement_rate < 1.5%",
      action: "Boost with paid promotion"
    },
    amplifyIfHighEngagement: {
      condition: "engagement_rate > 3%",
      action: "Repurpose top comments as testimonials"
    },
    communityFeedback: "Prioritize. Respond to." // Core philosophy
  }
};

module.exports = facebookPosts;
