/**
 * EMAIL SEGMENTATION TEMPLATES
 * Different newsletter versions for different audience segments
 * Maximize relevance and engagement
 */

const emailSegments = {
  audience_groups: {
    injured_workers: {
      description: "Recently injured or dealing with ongoing workplace issues",
      size: "~35% of audience",
      primary_interests: [
        "WSIB claims and appeals",
        "Return-to-work strategies",
        "Pain management",
        "Legal protection",
        "Financial support"
      ],
      frequency: "Weekly digest (Thursdays 9 AM)",
      sample_headline: "This week's WSIB wins + what you need to know about appeals"
    },
    
    disability_benefits_seekers: {
      description: "Navigating or optimizing disability income programs",
      size: "~30% of audience",
      primary_interests: [
        "ODSP, AISH, EIA updates",
        "CPP-D and DTC strategies",
        "Application deadlines",
        "Benefit increases",
        "How to maximize income"
      ],
      frequency: "Bi-weekly (1st & 15th of month)",
      sample_headline: "Benefits check-in: New changes, deadlines, and money-saving tips"
    },
    
    accessibility_advocates: {
      description: "Fighting for barrier removal and inclusive design",
      size: "~20% of audience",
      primary_interests: [
        "AODA and accessibility law",
        "Inclusive design practices",
        "Accessibility wins",
        "Technology breakthroughs",
        "Advocacy campaigns"
      ],
      frequency: "Weekly (Mondays 10 AM)",
      sample_headline: "Accessibility wins: Barriers removed, rights protected"
    },
    
    community_organizers: {
      description: "Activists, peer supporters, advocates organizing with others",
      size: "~15% of audience",
      primary_interests: [
        "Campaign updates",
        "Event listings",
        "Organizing tips",
        "Community spotlights",
        "Coalition news"
      ],
      frequency: "Weekly (Fridays 5 PM)",
      sample_headline: "Get involved: This week's events, campaigns, and opportunities"
    }
  }
};

const emailTemplates = {
  workers_rights_digest: {
    name: "🏭 Workers' Rights Digest",
    frequency: "Weekly (Thursdays)",
    sections: [
      {
        name: "Top WSIB News This Week",
        description: "2-3 most important workplace injury stories",
        items: "curated by WSIB relevance score"
      },
      {
        name: "⚠️ Deadline Alert",
        description: "If there's a claim deadline or appeal deadline this week",
        emphasis: "Urgent"
      },
      {
        name: "💡 Quick Tip",
        description: "One actionable strategy for workers (e.g., 'Document everything immediately after injury')",
        focus: "Practical"
      },
      {
        name: "⚔️ Legal Victory",
        description: "One recent court win that protects workers",
        focus: "Inspiration"
      },
      {
        name: "📅 What's Coming",
        description: "Upcoming events, webinars, or important dates for workers",
        focus: "Preparation"
      },
      {
        name: "Share Your Story",
        description: "CTA: Do you have a workplace injury story? We want to hear it.",
        focus: "Community"
      }
    ],
    sample_email: `
Subject: WSIB wins this week + what to know about appeals

Hi {first_name},

Three big workplace injury stories made headlines this week:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ DEADLINE ALERT
Appeal window opens for WSIB claims denied in January
→ You have 30 days from decision date. Act now.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📰 TOP NEWS (3 stories)
1. [Headline leading with outcome] | [Read more]
2. [Headline leading with outcome] | [Read more]
3. [Headline leading with outcome] | [Read more]

💡 THIS WEEK'S TIP
Document everything immediately after injury
→ Photos, witness names, incident description, dates/times
→ This creates your evidence foundation for appeals

⚔️ LEGAL VICTORY
Workers win right to retrain after workplace injury
What this means for your return-to-work plan...
→ Read the decision

📅 UPCOMING
• Webinar: "Winning Your WSIB Appeal" (Feb 12, 7 PM ET)
• Application deadline: Work Hardening Program (Feb 28)

Have a workplace injury story? We're collecting stories from workers 
who've overcome obstacles. Reply to this email or use our form.

Stay strong,
3mpwr Team

P.S. Know someone dealing with a workplace injury? Forward this to them.
    `.trim()
  },

  disability_benefits_digest: {
    name: "💰 Benefits Navigation Digest",
    frequency: "Bi-weekly (1st & 15th)",
    sections: [
      {
        name: "Benefit Updates This Cycle",
        description: "Changes to ODSP, AISH, CPP-D, DTC, Canada Disability Benefit",
        items: "Sorted by likely impact to reader"
      },
      {
        name: "📅 Upcoming Deadlines",
        description: "Applications, renewals, appeals due this month",
        emphasis: "Critical"
      },
      {
        name: "💵 Money-Saving Strategy",
        description: "One tip to maximize income or save taxes",
        focus: "Practical"
      },
      {
        name: "✅ You Might Qualify For",
        description: "A benefit reader may not have applied for yet",
        focus: "Discovery"
      },
      {
        name: "📊 By the Numbers",
        description: "Data or statistic about benefits that validates experience",
        focus: "Empowerment"
      }
    ],
    sample_email: `
Subject: Benefits changes + $2k you might be missing

Hi {first_name},

Two important changes affect your benefits this cycle:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 DEADLINE ALERT
ODSP medical review deadline: February 15
→ Don't miss this. Submit documents now.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 WHAT'S CHANGING
• ODSP increases 3% for 2025 (effective Jan 1)
• CPP-D recalculation includes inflation
• New streamlined DTC application process

💵 MONEY-SAVING STRATEGY
Claim the Caregiver Amount on your taxes
→ If you have a caregiver (family or paid), you may save $2,000+
→ Here's how to claim it this year

✅ YOU MIGHT QUALIFY FOR
Canada Disability Benefit (if you're 18-64 and under income threshold)
→ New program = up to $2,400 annually
→ Check your eligibility in 2 minutes

📊 BY THE NUMBERS
70% of eligible people don't claim the DTC.
Are you one of them?
→ Check if you qualify

Have questions? Reply with your situation and we'll help point you 
in the right direction.

Stay informed,
3mpwr Team

P.S. Next update: March 1st
    `.trim()
  },

  accessibility_digest: {
    name: "♿ Accessibility Wins Digest",
    frequency: "Weekly (Mondays)",
    sections: [
      {
        name: "Barrier Removed This Week",
        description: "The biggest accessibility victory from this week's news",
        items: "Highlight why it matters for independence"
      },
      {
        name: "AODA & Legal Updates",
        description: "New accessibility rights, regulations, or court decisions",
        items: "Explain practical impact"
      },
      {
        name: "🛠️ Tool or Tech Breakthrough",
        description: "New accessible technology that's gaining traction",
        focus: "Innovation"
      },
      {
        name: "📋 How to Advocate",
        description: "One step readers can take to push accessibility forward",
        focus: "Action"
      },
      {
        name: "💬 From the Community",
        description: "One reader story or comment about accessibility progress",
        focus: "Community"
      }
    ],
    sample_email: `
Subject: Ontario removes accessibility barrier + new tech you need to know about

Hi {first_name},

This week brought real progress on accessibility:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚔️ MAJOR WIN
Ontario removes waiting period for accessibility devices
What's changing → You can get equipment when you need it, not months later
Who benefits → Everyone using mobility aids, hearing aids, adaptive tech
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 LEGAL UPDATE
New AODA guidelines strengthen website accessibility requirements
→ Websites must now support screen readers by 2025
→ What this means for business & public sites you use

🛠️ TECH BREAKTHROUGH
Live captions now work with 99% accuracy
→ Best tools for video calls, events, and content
→ Free options for low-income users

📢 HOW TO ADVOCATE
One quick action: Comment on government accessibility consultation
(deadline Feb 28) → We'll send template language if you need it

💬 FROM OUR COMMUNITY
"When they removed the waiting period, I got my cane within a week 
instead of 6 months. It changed everything." - Sarah, Toronto

Want to share your accessibility story? Reply to this email.

Together we're breaking barriers,
3mpwr Team

Next week: Accessible design trends that benefit everyone
    `.trim()
  },

  community_action_digest: {
    name: "🤝 Community Action Digest",
    frequency: "Weekly (Fridays)",
    sections: [
      {
        name: "🎯 Events & Opportunities This Week",
        description: "Webinars, meetups, protests, campaigns happening soon",
        items: "Hyperlink to registration or details"
      },
      {
        name: "📣 Active Campaign",
        description: "One campaign people can join right now (sign petition, call MP, etc)",
        focus: "Actionable"
      },
      {
        name: "👥 Community Spotlight",
        description: "One member or organization making a difference",
        focus: "Inspiration"
      },
      {
        name: "🎓 Learning Opportunity",
        description: "Free resource: webinar, toolkit, guide, or workshop",
        focus: "Growth"
      },
      {
        name: "💬 Let's Talk",
        description: "Question or discussion prompt for community input",
        focus: "Engagement"
      }
    ],
    sample_email: `
Subject: Join the action: Campaigns, events, and ways to get involved

Hi {first_name},

Here's where you can make an impact this week:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 EVENTS & OPPORTUNITIES
• Live Q&A: "Disability Rights in 2025" (Feb 8, 2 PM ET)
  Join legal experts discussing what's coming
  
• City Council Meeting (Feb 10, 6 PM) - Speak for accessibility
  
• Online Community Meetup (Feb 9, 7 PM ET)
  Connect with other community members, swap stories
  
Register: [links to each]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📣 ACTIVE CAMPAIGN
Sign the petition: "Make caregiver benefits permanent"
→ 5 minutes to sign. Makes a real difference.
→ 87,000 signatures so far. Help us hit 100k.

👥 COMMUNITY SPOTLIGHT
Meet Marcus - He created a job training program for PWD
→ Over 200 people trained. 85% found employment.
→ Read his story and how you can help

🎓 FREE LEARNING
Webinar: "Income and Asset Limits Explained"
→ 90-min workshop breaking down benefits rules
→ Next session: Feb 15, 10 AM
→ Register (free, captions included)

💬 LET'S TALK
What's the #1 barrier you face right now? 
(Work, housing, health care, something else?)
Reply and tell us - we're listening.

See you in the community,
3mpwr Team

P.S. Know someone who should be getting these emails? 
Invite them: [forward form]
    `.trim()
  }
};

const segmentationLogic = {
  how_readers_choose: [
    "Sign-up form asks: 'What matters most to you?' (checkboxes)",
    "Readers can select multiple interests",
    "Default: All interested topics until preference set",
    "Can update preferences anytime via email footer link"
  ],
  
  assignment_process: [
    "1. Reader completes signup form with interests",
    "2. Interest tags added to subscriber profile",
    "3. Next email sends all relevant segment versions",
    "4. Reader receives digest (or digest compilation) matching interests",
    "5. Can update preferences in every email footer"
  ],
  
  email_frequency_options: {
    workers_rights: "Weekly (Thursdays) OR Monthly digest",
    disability_benefits: "Bi-weekly (1st & 15th) OR Monthly digest",
    accessibility: "Weekly (Mondays) OR Bi-weekly OR Monthly",
    community_action: "Weekly (Fridays) OR Monthly digest"
  }
};

const analyticsToTrack = {
  per_segment: [
    "Open rate by segment (vs. overall average)",
    "Click rate by segment",
    "Unsubscribe rate by segment",
    "Action taken rate (e.g., visited linked article, clicked CTA)",
    "Forwarding rate (shares with others)"
  ],
  
  insights_to_analyze: [
    "Which segment topics drive highest engagement?",
    "What time/day gets highest open rate per segment?",
    "Do certain headlines resonate better with specific segments?",
    "Which stories are shared most by each group?",
    "Are there topic overlaps (e.g., workers who also care about accessibility)?"
  ],
  
  optimization_loop: [
    "Monthly: Review open/click rates by segment",
    "Quarterly: Survey readers about content satisfaction",
    "Every 6 months: Test new headlines, formats, frequencies",
    "Annually: Major content strategy review based on data"
  ]
};

module.exports = {
  emailSegments,
  emailTemplates,
  segmentationLogic,
  analyticsToTrack
};
