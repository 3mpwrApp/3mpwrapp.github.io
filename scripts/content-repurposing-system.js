/**
 * CONTENT REPURPOSING FRAMEWORK
 * Turn one piece of content into 6-10 pieces across platforms
 * Maximize reach without doubling workload
 */

const repurposingSystemOverview = {
  principle: "One good idea, many amplifications",
  
  math: "If you publish 1 feature spotlight per day, repurposing multiplies reach by 5-8x without proportional effort",
  
  example: `
Monday: Feature Spotlight published: "Smart Scheduling Transforms Energy Management"
  - 500 word blog post with Jordan's story
  
  ↓ Becomes:
  
  - LinkedIn thread (8 tweets + replies)
  - Email newsletter feature (500 words, embedded in digest)
  - Twitter/X thread (5 main tweets)
  - Infographic (problem → solution → result)
  - TikTok/Instagram Reel script (30-sec video)
  - Podcast script (3-min segment)
  - Community email variant (case study focused)
  
  Result: 1 story reaches 6 different platforms, 7 different formats
  `,
  
  efficiency: "Once the story is written, repurposing takes ~2-3 hours per piece (not 5-10 hours to create new content)"
};

const repurposingTemplates = {
  source_material: {
    best_sources: [
      "Feature spotlights (detailed, narrative-driven)",
      "Weekly recaps (multiple story angles)",
      "Major curated articles (already high-engagement)",
      "Case studies & user stories (emotion + proof)",
      "Essential Guides (updated regularly, deep value)"
    ],
    
    worst_sources: [
      "Breaking news (too timely, loses relevance fast)",
      "Short news briefs (insufficient detail)",
      "Technical announcements (hard to make narrative)"
    ]
  },
  
  linkedin_thread: {
    format: "3-8 tweets, each ~280 characters, threaded conversation",
    
    structure: [
      {
        number: 1,
        content: "Hook - state the problem",
        length: "1-2 sentences",
        tone: "Direct, relatable",
        example: "If you have ME/CFS, ADHD, or chronic pain, you know this trap: You want to do something important today. But planning WHEN to do it exhausts you before you start."
      },
      {
        number: 2,
        content: "Add specificity - make it real",
        length: "1-2 sentences",
        tone: "Specific example",
        example: "Jordan needed to file a CPP-D appeal. They had the energy for it. But figuring out WHEN to write the letter, WHEN to gather documents... that burnt them out."
      },
      {
        number: 3,
        content: "Introduce the solution",
        length: "1-2 sentences",
        tone: "Practical",
        example: "What if the system learned your energy patterns and told you: 'Tuesday 10 AM is your best time'? No more planning. Just do it."
      },
      {
        number: 4,
        content: "How it works (step by step)",
        length: "2-3 separate tweets",
        tone: "Instructional",
        example: "Step 1: You tell the app what you need to do. Step 2: You tell it how much energy each task takes. Step 3: The app learns your patterns. Step 4: It schedules your week."
      },
      {
        number: 5,
        content: "The result - why it matters",
        length: "1-2 sentences",
        tone: "Empowering",
        example: "Jordan felt capable again. Not because the work got easier—but because the system didn't exhaust them first. That difference is everything."
      },
      {
        number: 6,
        content: "Call to action",
        length: "1 sentence",
        tone: "Inviting",
        example: "If this resonates, you're not alone. And there's a tool built for exactly this. [Link]"
      }
    ],
    
    best_practices: [
      "Lead with problem, not product",
      "Use specific details (names, numbers, situations)",
      "One idea per tweet (easier to read)",
      "Vary sentence length for rhythm",
      "Quote if you have a powerful one",
      "Engagement hooks at end (question, call to action)"
    ]
  },
  
  email_newsletter_variant: {
    format: "450-600 words, embedded in weekly digest",
    
    structure: [
      {
        section: "Opening Hook",
        length: "1-2 sentences",
        purpose: "Grab attention, state relevance",
        example: "This week's feature spotlight: We're highlighting Smart Scheduling—because energy is a real barrier, and removing obstacles should be non-negotiable."
      },
      {
        section: "The Story",
        length: "2-3 paragraphs",
        purpose: "Paint the situation and character",
        include: [
          "The challenge (Jordan's situation)",
          "Why it matters (universal relevance)",
          "The before state (what wasn't working)"
        ]
      },
      {
        section: "The Solution",
        length: "2 paragraphs",
        purpose: "Explain how it works in plain language",
        include: [
          "How to access it",
          "Step-by-step walkthrough",
          "Why it works for different situations"
        ]
      },
      {
        section: "The Result",
        length: "1-2 paragraphs",
        purpose: "Show impact and emotional shift",
        include: [
          "What changed",
          "Quote from user",
          "Why it matters for community"
        ]
      },
      {
        section: "CTA",
        length: "1-2 sentences",
        purpose: "Invite reader to try",
        example: "Want to take back your time? [Try Smart Scheduling] — it's free to experiment with."
      }
    ],
    
    tone: "Conversational, warm, specific"
  },
  
  twitter_x_thread: {
    format: "Main tweet + 3-5 replies",
    
    structure: [
      {
        part: "Main Tweet",
        length: "280 characters",
        purpose: "Hook and curiosity",
        example: "Here's the invisible trap that keeps people with chronic pain from getting things done: Scheduling logistics. And yes, there's a solution. 🧵"
      },
      {
        part: "Reply 1",
        length: "280 characters",
        purpose: "Specific problem",
        example: "You want to file an appeal. You have the energy for it. But planning WHEN to write the letter, WHEN to gather documents... that exhausts you first. So you don't do it."
      },
      {
        part: "Reply 2",
        length: "280 characters",
        purpose: "Relatable detail",
        example: "This isn't laziness. This isn't lack of motivation. This is spoon theory in action. Every decision costs energy."
      },
      {
        part: "Reply 3",
        length: "280 characters",
        purpose: "The solution",
        example: "What if a system learned YOUR energy patterns and handled the scheduling for you? That's Smart Scheduling. You plan WHAT, the app plans WHEN."
      },
      {
        part: "Reply 4",
        length: "280 characters",
        purpose: "Real outcome",
        example: "Jordan filed their CPP-D appeal. Retroactive payments approved. But the bigger win: feeling capable again. [Link to full story]"
      },
      {
        part: "Reply 5 (optional)",
        length: "280 characters",
        purpose: "Engagement",
        example: "Do you struggle with scheduling/planning energy? What helps you? Reply and let's talk. We're listening."
      }
    ]
  },
  
  infographic_concept: {
    format: "Visual 3-panel or flow diagram",
    
    panel_1: {
      title: "The Problem",
      visual: "Person with overwhelmed expression, question marks around them",
      text: "You have energy for the work. But planning WHEN exhausts you first.",
      supporting_stats: "78% of people with chronic illness struggle with scheduling & task initiation"
    },
    
    panel_2: {
      title: "How Smart Scheduling Works",
      visual: "3-step flow: Tell App → App Learns → App Schedules",
      text: [
        "Step 1: What do you need to do? (Task list)",
        "Step 2: How much energy? (Energy level estimate)",
        "Step 3: System learns your patterns (AI + data)",
        "Step 4: Scheduling happens automatically"
      ]
    },
    
    panel_3: {
      title: "The Result",
      visual: "Person confident, calendar showing scheduled tasks",
      text: "You have energy for the work. The system handles the planning. You win.",
      quote: "I felt capable again. Not because the work got easier—because the system didn't exhaust me first."
    }
  },
  
  video_script_short: {
    format: "30-second TikTok/Instagram Reel",
    length: "~100 words, natural speaking pace",
    
    script: `
[Scene 1: Person staring at blank screen, overwhelmed - 5 seconds]
Voiceover: "You want to do this. You have the energy. But planning when to do it exhausts you first."

[Scene 2: Calendar with confused person - 5 seconds]
Voiceover: "That's the trap. For people with chronic pain, energy is finite. Scheduling logistics shouldn't waste it."

[Scene 3: Phone showing app, calendar automatically filling - 10 seconds]
Voiceover: "What if your system learned your energy patterns? And just... did the scheduling for you?"

[Scene 4: Person confident, task completed - 5 seconds]
Voiceover: "Smart Scheduling. Built for energy-limited bodies."

[Scene 5: CTA - 5 seconds]
Text on screen: "Try it free. [Link]"
    `.trim(),
    
    visuals_needed: [
      "B-roll: Person looking overwhelmed at calendar",
      "Animation: Energy patterns graph",
      "Screen recording: App scheduling tasks",
      "B-roll: Person feeling relieved/accomplished"
    ],
    
    audio: "Calm, empowering voiceover. Soft background music."
  },
  
  podcast_segment: {
    format: "Standalone segment or integrated into existing show",
    length: "3-5 minutes",
    
    structure: [
      {
        segment: "Opening",
        length: "30 seconds",
        content: "Introduce feature & why it matters"
      },
      {
        segment: "Problem Narrative",
        length: "90 seconds",
        content: "Jordan's story - the struggle with scheduling"
      },
      {
        segment: "Solution Explanation",
        length: "90 seconds",
        content: "How Smart Scheduling works (walkthrough)"
      },
      {
        segment: "Real Impact",
        length: "60 seconds",
        content: "Results and why it matters"
      },
      {
        segment: "Call to Action",
        length: "30 seconds",
        content: "How to try it + link"
      }
    ],
    
    tone: "Conversational, intimate (podcast style)",
    
    transcript: `
HOST: Welcome back. Today we're talking about something I'm genuinely excited about—something that changed how one of our community members approaches their life.

[Sound effect: Gentle intro music fades]

HOST: Have you ever noticed how much energy goes into just... planning when to do things? For people with chronic illness, that's the invisible trap. Let me tell you about Jordan.

Jordan has ME/CFS. Some days they're functional. Other days, one activity takes everything. When they decided to appeal their CPP-D denial, they had the energy for the actual work. But sitting down to plan WHEN to write the letter, WHEN to gather documents? That alone exhausted them.

That's when they tried something new: Smart Scheduling.

Instead of Jordan planning their week, they told the app: "I need to file an appeal. That's deep work. That takes time." The app learned their patterns. And then—here's the magic—the app just told them: "Tuesday, 10 AM. That's your best window."

No more decision-making. No more false starts. Just one clear signal: Now is your time.

Jordan's appeal was approved. Retroactive payments came through. But here's what mattered most: "I felt capable again," they told us. "Not because the work got easier. Because the system didn't exhaust me first."

Smart Scheduling isn't magic. It's just removing one obstacle so you can focus your energy where it counts.

If that resonates with you, we've got the link in the show notes. Give it a try.

Thanks for being here.

[Sound effect: Outro music]
    `.trim()
  },
  
  "community-focused-email": {
    format: "Variant of newsletter segment, optimized for community member perspective",
    length: "400-500 words",
    
    tone: "More personal, peer-to-peer, emphasizes community aspect",
    
    difference_from_newsletter: [
      "Lead with community need, not product feature",
      "More first-person perspective",
      "Emphasize how this helps people help themselves",
      "Include invitation to share similar experiences",
      "Less polish, more authenticity"
    ],
    
    example_opening: `
Hey everyone,

One of our community members shared their story this week, and I wanted to pass it along. Because if you're dealing with energy limitations, this might speak to you.

Jordan has ME/CFS. They know what that's like. Some days you've got it. Most days you don't. And when you do have energy, the last thing you want to waste it on is... figuring out when to use it.
    `.trim()
  }
};

const repurposingWorkflow = {
  timeline: {
    tuesday: "Feature spotlight published on blog (with full story)",
    
    wednesday: [
      "Email variant drafted (newsletter team)",
      "LinkedIn thread written (social team)",
      "Video script drafted (video team)",
      "Infographic briefed (designer)"
    ],
    
    thursday: [
      "Email version published in weekly digest",
      "LinkedIn thread posted + scheduled replies",
      "Twitter thread posted",
      "Video filmed & edited",
      "Infographic finalized"
    ],
    
    friday_monday: [
      "TikTok/Instagram Reel posted",
      "Podcast script recorded",
      "Community-focused email variant sent",
      "Reddit / Forum threads (if relevant)"
    ]
  },
  
  team_roles: {
    content_lead: "Selects story, drafts primary blog post",
    email_specialist: "Adapts for email format, segments",
    social_media: "Creates LinkedIn, Twitter, Reddit variants",
    video_producer: "Scripts, films, edits short videos",
    designer: "Creates infographics, visual assets",
    podcast_host: "Records and produces audio segment"
  },
  
  efficiency_gains: {
    current_state: "Each platform gets custom content = 10-15 hours per piece",
    after_repurposing: "One story + repurposing = 5-6 hours per story, 6-8 platform variants",
    result: "3-4x more reach with same or less effort"
  }
};

const qualityStandards = {
  maintain_authenticity: [
    "Don't water down the message for brevity",
    "Adjust format, not substance",
    "Each variant should feel native to its platform, not forced"
  ],
  
  preserve_story: [
    "The case study/character should be recognizable across variants",
    "The core insight should be consistent",
    "The impact/outcome should be clear"
  ],
  
  adapt_language: [
    "LinkedIn = Professional, solutions-focused",
    "Twitter = Conversational, thread-narrative",
    "TikTok = Casual, visual-first, emotional",
    "Email = Warm, storytelling, personal",
    "Podcast = Intimate, no-pressure, exploratory"
  ]
};

const launchCalendar = {
  "week_1": {
    content_published: "Feature Spotlight: Smart Scheduling",
    distribution: [
      "Blog (Tuesday)",
      "Email newsletter (Wednesday)",
      "LinkedIn thread (Thursday)"
    ]
  },
  
  "week_2": {
    content_published: "Feature Spotlight: Evidence Locker",
    distribution: [
      "Blog (Tuesday)",
      "Twitter thread (Thursday)",
      "TikTok Reel (Friday)"
    ]
  },
  
  "week_3": {
    content_published: "Feature Spotlight: Master Letter Generator",
    distribution: [
      "Blog (Tuesday)",
      "Email newsletter (Wednesday)",
      "Podcast segment (Thursday)",
      "Instagram Reel (Friday)"
    ]
  },
  
  pattern: "Vary platform emphasis weekly. In month 1, every story hits 4-6 platforms. By month 3, you've built templates and it's faster."
};

module.exports = {
  repurposingSystemOverview,
  repurposingTemplates,
  repurposingWorkflow,
  qualityStandards,
  launchCalendar
};
