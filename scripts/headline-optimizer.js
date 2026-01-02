#!/usr/bin/env node

/**
 * HEADLINE OPTIMIZATION SYSTEM
 * Applies Naval Ravikant (clarity) + David Ogilvy (persuasion) + Ann Handley (story) principles
 * to improve click-through and engagement across all content
 */

const headlinePatterns = {
  "action_driven": {
    description: "Direct action or outcome - leads with victory/change",
    templates: [
      "How to {action} your {obstacle} - {benefit}",
      "You can now {action} - Here's what changed",
      "{Community} wins {outcome} - What's next",
      "Stop losing {resource} - {solution} now available"
    ],
    examples: [
      "How to appeal your WSIB denial - And win back benefits",
      "You can now work part-time and keep benefits - Here's how",
      "Ontario workers win $2.5B in back pay - What's next for injured workers",
      "Stop losing money to tax gaps - New disability tax credit tool now available"
    ]
  },
  
  "deadline_urgency": {
    description: "Time-sensitive information that demands immediate action",
    templates: [
      "{Deadline} deadline {when} - {action}",
      "Window closing: {opportunity} ends {when}",
      "{Announcement} - Apply before {date}"
    ],
    examples: [
      "DTC application deadline extended to March 31 - What you need to know",
      "Window closing: Canada Disability Benefit applications end March 15",
      "Emergency housing support - Apply before benefits expire"
    ]
  },
  
  "revelation": {
    description: "Reveals hidden benefit, right, or option the reader didn't know existed",
    templates: [
      "You might qualify for {benefit} - {number} things to know",
      "{Benefit} for {condition} - Why most people don't claim it",
      "There's another way to get {outcome} - Here's how"
    ],
    examples: [
      "You might qualify for $10,000 retroactive payments - 3 things to know",
      "CPP-D for chronic illness - Why most people don't claim it",
      "There's another way to get workplace accommodation - Here's how"
    ]
  },
  
  "barrier_removal": {
    description: "Celebrates accessibility wins and removed obstacles",
    templates: [
      "{Organization} removes {barrier} - What changes",
      "{Change} arrives - Here's what it means for {community}",
      "After {struggle}, {outcome} is finally here"
    ],
    examples: [
      "Ontario removes prescription waiting period - What changes for you",
      "WCAG 2.2 compliance arrives - Here's what it means for accessibility",
      "After 15 years of fighting, digital accessibility law passes"
    ]
  },
  
  "policy_impact": {
    description: "New policy with clear implications - includes action plan",
    templates: [
      "New {policy} changes {impact} - Your action plan",
      "{Policy} takes effect - What you need to do now",
      "Government announces {change} - Here's who benefits"
    ],
    examples: [
      "New AODA regulations strengthen accessibility - Your action plan",
      "CPP-D rules change January 1 - What you need to do now",
      "Government announces $2B accessibility fund - Here's who qualifies"
    ]
  },
  
  "contradiction": {
    description: "Challenges common misconception - reveals truth",
    templates: [
      "Stop believing {myth} - {truth}",
      "{Misconception} is wrong - Here's what actually happens",
      "You've probably heard {claim} - Here's the real story"
    ],
    examples: [
      "Stop believing you can't work on disability - New part-time rules explained",
      "'Accessibility costs too much' is wrong - Here's what actually happens",
      "You've probably heard you lose benefits if you inherit - Here's the real story"
    ]
  },
  
  "number_based": {
    description: "Leads with data/number that's surprising or relevant",
    templates: [
      "{Number}% of {group} don't know about {benefit}",
      "{Statistic} - What this means for you",
      "New data: {finding} - Here's your takeaway"
    ],
    examples: [
      "78% of eligible people don't claim DTC - Here's why",
      "New data: Workplace injuries costing employers 3x more - Here's your leverage",
      "4 in 5 PWD face workplace discrimination - Here's your recourse"
    ]
  },
  
  "emotion_benefit": {
    description: "Leads with emotional benefit - pain relief, control, hope",
    templates: [
      "Finally: {pain point} doesn't have to be {consequence}",
      "Get your life back: {outcome} is now {status}",
      "The {pain} is over - Here's what changes"
    ],
    examples: [
      "Finally: Chronic pain doesn't have to mean financial ruin",
      "Get your life back: Workplace accommodation is now your right",
      "The waiting is over - Here's what changes on January 1"
    ]
  },
  
  "contrast": {
    description: "Shows before/after or what just changed",
    templates: [
      "Before and after: How {change} transforms {outcome}",
      "It used to be {old way} - Not anymore",
      "{Group} are now {outcome} - Here's the story"
    ],
    examples: [
      "Before and after: How digital accessibility transforms independence",
      "It used to be you lost all income - Not anymore with new work incentives",
      "Deaf workers are now protected from discrimination - Here's the story"
    ]
  }
};

const qualityFramework = {
  clarity: {
    principle: "Naval - Clarity beats cleverness",
    checklist: [
      "First sentence reveals core insight? (Can someone understand in 10 seconds)",
      "Jargon minimized? (Explain acronyms on first use)",
      "Benefit to reader obvious? (Why should they care?)"
    ]
  },
  
  ogilvy_test: {
    principle: "David Ogilvy - Would I click this?",
    checklist: [
      "Does it lead with BENEFIT, not feature?",
      "Is there curiosity gap? (Intrigues without misleading)",
      "Would target audience recognize themselves in it?",
      "Does it pass the 'so what?' test? (Obvious relevance)"
    ]
  },
  
  annhandley_story: {
    principle: "Ann Handley - Clear story arc",
    checklist: [
      "Reason-to-care established? (Why does this matter NOW?)",
      "Speaks to real situation? (Not abstract)",
      "Offers next step/action? (What should reader do?)",
      "Avoids corporate jargon? (Sounds like real conversation)"
    ]
  },
  
  skim_test: {
    principle: "30-second understanding",
    checklist: [
      "What happened? (Headline + first sentence)",
      "Why does it matter? (Relevance to disability community)",
      "What should I do? (Call to action)",
      "Where's the link? (Where to learn more)"
    ]
  }
};

const callToActions = {
  educational: [
    "Learn what changed",
    "Understand your rights",
    "Explore the details",
    "Get the full story"
  ],
  
  transactional: [
    "Apply now",
    "Claim this benefit",
    "Start the process",
    "Register today"
  ],
  
  directional: [
    "Read full decision",
    "See the proposal",
    "Watch the announcement",
    "Check your eligibility"
  ],
  
  engagement: [
    "Join the conversation",
    "Share your story",
    "Vote on this issue",
    "Get involved"
  ],
  
  protective: [
    "Know your rights",
    "Understand the deadline",
    "Learn what changed",
    "Don't miss this"
  ]
};

const examples = {
  before: [
    "Update on provincial accessibility standards",
    "Benefits assessment process changes",
    "Court hearing scheduled for discrimination case",
    "New accessibility feature in app"
  ],
  
  after: [
    "Ontario strengthens accessibility rules - Here's what's improving",
    "Your benefits assessment is changing - 2 things you need to do",
    "Workers win discrimination case - What's next for your claim",
    "You can now describe images to the app - Here's why it matters"
  ]
};

/**
 * CURATION SYSTEM IMPROVEMENTS
 * Applied to daily news, feature spotlights, and blog posts
 */

const curationImprovements = {
  
  daily_news_curation: {
    current_format: "Simple article list with score",
    improved_format: {
      headline: "Rewritten using patterns above",
      relevance_statement: "Why this matters to {our_community}",
      action_prompt: "What {group} should do about this",
      topic_tag: "Workers Rights | Disability Benefits | Accessibility",
      source_credibility: "From [trusted_source]"
    }
  },
  
  feature_spotlights: {
    current_format: "Product feature description",
    improved_format: {
      headline: "Lead with user benefit, not feature",
      opening_hook: "Paint the pain point first",
      feature_explanation: "How it solves the problem",
      real_impact: "One user story or scenario",
      accessibility_note: "Why this matters for accessibility",
      next_step: "How to access/try it"
    }
  },
  
  weekly_recaps: {
    current_format: "Top stories of the week",
    improved_format: {
      headline: "Pattern-based, forward-looking",
      weekly_theme: "What this week's news means",
      top_3_wins: "Biggest victories this week",
      top_3_threats: "Biggest challenges/deadlines",
      action_items: "What to do this coming week",
      community_spotlight: "One member story"
    }
  }
};

/**
 * IMPLEMENTATION GUIDE
 */

const implementationGuide = `
## Phase 1: Update All Headlines
For each piece of content, analyze using the quality framework:
1. Read original headline
2. Identify which pattern fits best
3. Test against Ogilvy/Naval/Handley checklist
4. Rewrite to pass 30-second skim test
5. Verify CTA is clear

## Phase 2: Enhance Curation Pages
For daily curations:
- Add "Why this matters" statement for top 10 articles
- Tag articles with topic category
- Include action prompts ("What injured workers should know")

## Phase 3: Refresh Feature Spotlights
For each feature spotlight post:
- Start with user pain point
- Lead with benefit, not feature
- Add one user story or scenario
- Explain accessibility implications
- End with clear next step

## Phase 4: Create Topic Clustering
Organize blog index and homepage by:
- Workers Rights & Compensation
- Disability Benefits Navigation
- Accessibility & Inclusive Design
- Legal Victories & Rights
- Health & Wellness
- Community Action & Events

## Priority Quick Wins:
1. Next 7 feature spotlights (immediate)
2. Homepage headlines (this week)
3. Blog index navigation (this week)
4. Last 50 curated articles (rewrite where possible)
`;

module.exports = {
  headlinePatterns,
  qualityFramework,
  callToActions,
  examples,
  curationImprovements,
  implementationGuide
};
