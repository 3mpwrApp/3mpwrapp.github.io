/**
 * PERSONALIZED RECOMMENDATION ENGINE
 * Help readers discover content that matches their specific situation
 * Improves engagement, retention, and sense of "this is for me"
 */

const recommendationFramework = {
  purpose: "Move beyond 'random articles' to 'your personalized reading path'",
  
  target_outcome: "When someone reads one article, they see 3-5 relevant next reads, increasing engagement by 40%+",
  
  key_principle: "Recommendations should feel like 'Someone understands my specific situation' not 'Algorithm suggests...'"
};

const userSegmentationModel = {
  primary_segments: {
    injured_workers: {
      triggers: [
        "Visiting WSIB-related pages",
        "Clicking on workers compensation articles",
        "Saving posts about return to work",
        "Newsletter signup with 'Workers Rights' selected"
      ],
      interests: [
        "WSIB claims and appeals",
        "Workplace accommodation",
        "Return to work strategy",
        "Workplace rights and discrimination",
        "Chronic pain management"
      ],
      content_recommendations: [
        "Feature spotlights about workplace tools",
        "Essential guides on WSIB process",
        "Legal victory stories from other workers",
        "Health & wellness articles (pain management)",
        "Community action opportunities (advocacy)"
      ]
    },
    
    benefits_seekers: {
      triggers: [
        "Visiting disability benefits pages",
        "Clicking on CPP-D, ODSP, DTC articles",
        "Saving posts about benefit applications",
        "Newsletter signup with 'Disability Benefits' selected"
      ],
      interests: [
        "CPP-D, ODSP, DTC eligibility and application",
        "Benefits maximization strategies",
        "Benefit increase announcements",
        "Application deadline alerts",
        "Income support programs"
      ],
      content_recommendations: [
        "Essential guides (updated monthly)",
        "Deadline alerts (personalized by province)",
        "Money-saving strategy posts",
        "Legal victories affecting benefits",
        "Peer support and community stories"
      ]
    },
    
    accessibility_advocates: {
      triggers: [
        "Visiting accessibility pages",
        "Clicking on WCAG, AODA, barrier removal articles",
        "Saving posts about inclusive design",
        "Newsletter signup with 'Accessibility' selected"
      ],
      interests: [
        "Accessibility rights and AODA",
        "Digital and web accessibility",
        "Accessible technology",
        "Barrier removal victories",
        "Inclusive design practices"
      ],
      content_recommendations: [
        "Accessibility win celebrations",
        "How-to guides for requesting accessible formats",
        "Legal decisions protecting accessibility",
        "Feature spotlights with accessibility angles",
        "Advocacy opportunities and campaigns"
      ]
    },
    
    newly_disabled: {
      triggers: [
        "First-time blog visitors",
        "Clicking on 'What is disability?' content",
        "Newsletter signup with 'New to disability community' indicator",
        "Searching for 'how to start' or 'first steps' content"
      ],
      interests: [
        "Foundational information",
        "Quick wins (first steps)",
        "Understanding their condition",
        "Healthcare navigation",
        "Community connection"
      ],
      content_recommendations: [
        "Essential Guides (overviews, not deep-dives initially)",
        "Peer stories (others who've been where you are)",
        "Quick-start guides",
        "Healthcare team building",
        "How to find disability communities"
      ]
    },
    
    caregivers: {
      triggers: [
        "Newsletter signup with 'I'm a caregiver' option",
        "Clicking on caregiver support articles",
        "Saving posts about supporting someone with disability"
      ],
      interests: [
        "Caregiver support and respite care",
        "Tax credits and financial support for caregivers",
        "Preventing burnout",
        "Supporting without enabling",
        "Healthcare coordination"
      ],
      content_recommendations: [
        "Caregiver-specific guides and resources",
        "Financial support articles (tax deductions, programs)",
        "Mental health and wellness for caregivers",
        "Community support groups",
        "Legal and healthcare navigation tools"
      ]
    }
  }
};

const recommendationAlgorithm = {
  
  factors_weighted: {
    
    1_content_match: {
      weight: "40%",
      description: "Does this article match reader's topics of interest?",
      calculation: "Compare article tags/category to user's saved interests",
      example: "If reader has saved 3 WSIB articles, recommend 'Return to Work' guide with high score"
    },
    
    2_reading_level_match: {
      weight: "20%",
      description: "Is this too simple/complex for what they've already read?",
      calculation: "Track 'essential guide' vs 'advanced strategy' content",
      example: "If reader has read 5 advanced benefits articles, don't recommend introductory guide"
    },
    
    3_temporal_relevance: {
      weight: "15%",
      description: "Does this article matter right now for this reader?",
      calculation: "Track deadlines, timely alerts, seasonal info",
      example: "If it's January, recommend 'Tax deductions for disability' articles"
    },
    
    4_community_signals: {
      weight: "15%",
      description: "Are other people like you finding this valuable?",
      calculation: "Track engagement metrics by segment",
      example: "If injured workers are heavily engaging with 'Pain management' articles, recommend to similar reader"
    },
    
    5_discover_factor: {
      weight: "10%",
      description: "Show some serendipitous content outside main interests",
      calculation: "5-10% of recommendations should surprise/expand horizons",
      example: "Reader focused on WSIB might discover 'Accessibility rights' article that becomes new interest"
    }
  },

  scoring_formula: `
Recommendation Score = 
  (Content Match × 0.40) + 
  (Reading Level × 0.20) + 
  (Temporal Relevance × 0.15) + 
  (Engagement Signals × 0.15) + 
  (Serendipity × 0.10)

Articles scoring 7+/10 become recommendations
Top 5 highest-scoring articles displayed
  `,
  
  avoid_list: [
    "Don't recommend articles reader already read (unless updated)",
    "Don't recommend if exactly same topic as last 3 views (vary topic)",
    "Don't overweight new content (good older posts still relevant)",
    "Don't recommend conflicting information (e.g., outdated ODSP rates)"
  ]
};

const recommendationPlacements = {
  
  placement_1_article_sidebar: {
    location: "Right sidebar of blog post",
    layout: "3-card vertical stack",
    content: "Related articles (refined by recommendation engine)",
    cards: [
      {
        title: "What to read next",
        articles: 3,
        sorting: "By recommendation score"
      }
    ],
    visual: `
┌─────────────────────┐
│  What to read next  │
├─────────────────────┤
│ ✓ Article 1 Title   │
│   Recommended for   │
│   you because...    │
│                     │
│ ✓ Article 2 Title   │
│   Recommended for   │
│   you because...    │
│                     │
│ ✓ Article 3 Title   │
│   Recommended for   │
│   you because...    │
└─────────────────────┘
    `.trim()
  },
  
  placement_2_email: {
    location: "Bottom of newsletter (before footer)",
    layout: "3-column grid",
    content: "Articles aligned with reader's newsletter segment",
    example: `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOU MIGHT ALSO LIKE (Based on your interests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Article 1]         [Article 2]         [Article 3]
Title               Title               Title
→ Read More         → Read More         → Read More
    `.trim()
  },
  
  placement_3_homepage: {
    location: "After main content, before footer",
    layout: "4-card horizontal scroll or grid",
    content: "Personalized recommendations (if logged in)",
    personalization_note: "If not logged in, show most popular articles instead"
  },
  
  placement_4_search_results: {
    location: "Below search results",
    content: "Related topics the reader didn't search for but might want",
    example: `
You searched: "WSIB appeal"

Search Results: [7 relevant articles]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOU MIGHT ALSO WANT TO EXPLORE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Based on what others searching "WSIB appeal" also read:
→ Return-to-Work Planning Guide
→ Workplace Accommodation Rights
→ Pain Management for Workers
    `.trim()
  },
  
  placement_5_thank_you_page: {
    location: "After form submission (newsletter signup, survey, etc)",
    content: "Recommended 'get started' content",
    purpose: "Keep reader engaged after signup"
  }
};

const recommendationMessaging = {
  
  why_recommended: {
    pattern_1_interest_match: "You've been reading about [topic]. Here's more on that.",
    pattern_2_timeline: "It's [season/month]. Here's what matters now.",
    pattern_3_community_signals: "Readers like you found this helpful.",
    pattern_4_previous_save: "Similar to [article you saved].",
    pattern_5_complete_topic: "You read about [part A], here's [part B]."
  },
  
  example_messaging: {
    example_1: "You've been diving into WSIB appeals. Here's a guide on building your evidence file.",
    example_2: "January means tax planning. Here's how to maximize your disability tax credit.",
    example_3: "Members exploring accessibility just discovered this decision. Worth a read.",
    example_4: "You saved our DTC guide. This 2026 update shows what changed."
  }
};

const dataCollection = {
  
  signals_to_track: {
    explicit_signals: [
      "Article clicks (which topics they read)",
      "Save/bookmark actions",
      "Newsletter topic selection (sign-up form)",
      "Poll votes (which topics matter to you)",
      "Community contributions (which discussions they engage with)"
    ],
    
    implicit_signals: [
      "Reading depth (how far down the page they scroll)",
      "Time on page (showed genuine interest?)",
      "Return visits to specific topics (pattern of interest)",
      "Search queries (what they're looking for)",
      "Articles suggested to them that they ignore (negative signal)"
    ]
  },
  
  privacy_first: {
    approach: "Collect only behavioral data, never personal health info",
    implementation: [
      "Use client-side localStorage when possible (data stays on their device)",
      "No tracking of specific diagnoses or conditions",
      "No cross-site tracking",
      "Users can opt out anytime via settings",
      "Data deletion on request"
    ]
  },
  
  personalization_levels: {
    level_1_anonymous: "No tracking. Show popular articles for each topic.",
    level_2_cookie_based: "Track their reading on THIS device (localStorage). Personalize within site.",
    level_3_account_optional: "If logged in, save preferences across devices. Improve recommendations.",
    level_4_explicit_opt_in: "Allow readers to explicitly tell us their interests (form + quiz)"
  }
};

const implementationRoadmap = {
  
  phase_1_foundation: {
    timeline: "February 2025",
    deliverables: [
      "✓ Tag all articles with topics (workers rights, benefits, accessibility, etc)",
      "✓ Create topic-to-recommendation mapping",
      "✓ Implement basic 'related articles' on blog posts (manual)",
      "✓ Set up tracking (analytics on clicks/saves)"
    ]
  },
  
  phase_2_personalization: {
    timeline: "March 2025",
    deliverables: [
      "✓ Build user segmentation model (based on newsletter signup + behavior)",
      "✓ Implement recommendation engine algorithm",
      "✓ Add 'You might also like' sidebar to blog posts",
      "✓ Test with newsletter subscribers (A/B test recommendations)"
    ]
  },
  
  phase_3_expansion: {
    timeline: "April-May 2025",
    deliverables: [
      "✓ Homepage personalized recommendations (if logged in)",
      "✓ Search-based recommendations",
      "✓ Email newsletter recommendations (bottom of each email)",
      "✓ Quiz: 'What's your situation?' → Personalized landing page"
    ]
  },
  
  phase_4_optimization: {
    timeline: "June+ 2025",
    deliverables: [
      "✓ Analyze engagement data",
      "✓ Refine weighting algorithm",
      "✓ Add more personalization signals",
      "✓ Test video + podcast recommendations",
      "✓ A/B test messaging and placement"
    ]
  }
};

const successMetrics = {
  
  click_through_rate: {
    metric: "% of people who click on recommendations",
    target: "15-25% (industry standard is 8-12%)"
  },
  
  engagement_depth: {
    metric: "Time on recommended articles vs non-recommended",
    target: "Recommended articles should see 20%+ more engagement"
  },
  
  retention: {
    metric: "Do recommendations increase repeat visits?",
    target: "Readers who follow recommendations return 30% more often"
  },
  
  topic_expansion: {
    metric: "Do readers discover new topic areas through recommendations?",
    target: "20% of readers explore outside their primary interest"
  },
  
  satisfaction: {
    metric: "Survey: 'Were these recommendations helpful?'",
    target: "70%+ 'somewhat' or 'very' helpful"
  }
};

const sampleRecommendationScenarios = {
  
  scenario_1: {
    reader: "Jordan, WSIB appeal in progress",
    reads: "WSIB Denials & Appeals: Fighting Back guide",
    recommendation_1: {
      article: "Building Your Evidence File",
      score: 9.2,
      reasons: ["Content match (WSIB)", "Temporal (appeal in progress)", "Engagement (others appealing found it helpful)"]
    },
    recommendation_2: {
      article: "Workplace Rights for Persons with Disabilities",
      score: 8.7,
      reasons: ["Content match (broader workplace protection)", "Serendipity (related but different angle)"]
    },
    recommendation_3: {
      article: "Finding Legal Help: What to Expect",
      score: 8.3,
      reasons: ["Temporal (appeal needs representation)", "Content match (legal support)"]
    }
  },
  
  scenario_2: {
    reader: "Alex, just diagnosed, new to disability systems",
    reads: "CPP-D: Step-by-Step Guide (introductory)",
    recommendation_1: {
      article: "First Steps After Diagnosis: A Roadmap",
      score: 9.5,
      reasons: ["Reading level match (intro content)", "Temporal (early in journey)"]
    },
    recommendation_2: {
      article: "Understanding Your Healthcare Team",
      score: 8.9,
      reasons: ["Content match (healthcare basics)", "Foundational need"]
    },
    recommendation_3: {
      article: "Connecting with Disability Communities",
      score: 8.1,
      reasons: ["Community support need", "Peer connection opportunity"]
    }
  }
};

module.exports = {
  recommendationFramework,
  userSegmentationModel,
  recommendationAlgorithm,
  recommendationPlacements,
  recommendationMessaging,
  dataCollection,
  implementationRoadmap,
  successMetrics,
  sampleRecommendationScenarios
};
