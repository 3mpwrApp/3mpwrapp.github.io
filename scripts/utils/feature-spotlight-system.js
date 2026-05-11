/**
 * FEATURE SPOTLIGHTS: CASE STUDY & NARRATIVE ENHANCEMENT SYSTEM
 * Transform product features into compelling stories with real impact
 */

const narrativeFramework = {
  structure: {
    hook: {
      description: "Paint the problem (not the feature)",
      length: "2-3 sentences",
      principle: "Lead with pain point, not feature",
      example_bad: "The Evidence Locker is a new feature in 3mpwr that helps you organize documents.",
      example_good: "Imagine having a work injury. Now imagine trying to fight your WSIB denial while drowning in medical reports, vet bills, and scattered emails. You know the evidence is there—you just can't find it when your appeal lawyer needs it. That chaos ends now."
    },
    
    character: {
      description: "Introduce someone (composite or real) dealing with this pain",
      length: "2-3 sentences",
      principle: "Make it relatable and real",
      example: "Meet Maya—a project manager dealing with chronic pain from a workplace injury. After her initial WSIB denial, she had 30 days to appeal. But her evidence was everywhere: emails, doctor notes, hospital records, even photo evidence of her ergonomic setup. She spent more time searching than organizing her case."
    },
    
    feature_explanation: {
      description: "Now explain how the feature solves this problem",
      length: "3-4 paragraphs",
      principle: "Show the journey, not the buttons",
      flow: [
        "What changed (the feature exists now)",
        "How it works (in narrative terms, not technical)",
        "What that enables (the real-world impact)",
        "Why it matters for accessibility"
      ],
      example: "With Evidence Locker, Maya can now dump all her documents into one place. The app automatically organizes them by date and type. When her lawyer says 'I need proof of your pain progression,' she types that phrase and the app finds relevant documents instantly. She doesn't need to become a filing system manager—she can focus on her case."
    },
    
    impact: {
      description: "Show the real-world outcome",
      length: "1-2 paragraphs",
      principle: "Quantify or qualify the difference",
      example: "By appeal day, Maya was ready. Her evidence was organized, cross-referenced, and she could explain her case clearly. She won her appeal and got back benefits retroactively. The Evidence Locker didn't win her case alone—but it removed one obstacle so she could focus her energy where it mattered."
    },
    
    accessibility_note: {
      description: "Why this feature matters for accessibility",
      length: "1-2 sentences",
      principle: "Connect feature to independence/agency",
      example: "For people managing chronic pain or cognitive limitations, having documents organized automatically is crucial. You don't have to spend energy on filing systems—you can spend it on your case, your health, your life."
    },
    
    next_step: {
      description: "Clear action CTA",
      length: "1-2 sentences",
      principle: "Make trying it frictionless",
      example: "Want to try it? [Open Evidence Locker] or [Watch 2-min demo]. It's built for people like you."
    }
  }
};

const caseStudyTemplate = {
  format: "Optional: Include in feature spotlight as sidebar or expanded section",
  
  structure: {
    headline: "Real story: [Name] fought [challenge] using [feature]",
    
    background: {
      description: "Who is this person?",
      include: [
        "Condition/situation (general, doesn't need to be specific diagnosis)",
        "What brought them to 3mpwr App",
        "The specific problem they faced"
      ],
      length: "2-3 sentences"
    },
    
    challenge: {
      description: "The obstacle before the feature",
      include: [
        "What they were doing before (the old way)",
        "Why it wasn't working",
        "The consequence (wasted time, missed opportunities, stress, etc.)"
      ],
      length: "2-3 sentences"
    },
    
    solution: {
      description: "How they used the feature",
      include: [
        "First step they took",
        "What surprised them",
        "How it changed their workflow",
        "Any learning curve (be honest)"
      ],
      length: "3-4 sentences"
    },
    
    result: {
      description: "What happened after",
      include: [
        "Quantifiable change (time saved, money won, clarity gained, etc.)",
        "How it affected their situation",
        "Emotional impact (confidence, relief, agency)"
      ],
      length: "2-3 sentences"
    },
    
    quote: {
      description: "One powerful quote from the person",
      example: "\"I didn't think organizing my documents would give me back my power. But when my lawyer said 'You've got this,' I knew I actually did. That feeling was everything.\" - Maya, Toronto"
    },
    
    takeaway: {
      description: "Why we're sharing this story",
      include: [
        "What others can learn",
        "Why it matters for community",
        "How it connects to values"
      ],
      example: "This story isn't really about document organization. It's about removing obstacles so you can focus your energy on what matters. That's what 3mpwr is built for."
    }
  }
};

const storytellingTechniques = {
  technique_1_specificity: {
    description: "Specific detail > vague claim",
    bad: "Users say they save time with Evidence Locker",
    good: "Maya saved 3 hours organizing documents by appeal day. Instead, she spent those hours talking through her case with her lawyer."
  },
  
  technique_2_obstacle_first: {
    description: "Lead with problem, then feature",
    bad: "Evidence Locker organizes your documents automatically",
    good: "Imagine having 200+ documents scattered across email, text, and your phone. Now imagine needing to find one specific medical note in the next 10 minutes. Evidence Locker changes that."
  },
  
  technique_3_accessibility_angle: {
    description: "Always connect feature to independence/agency",
    bad: "This feature has keyboard navigation",
    good: "This feature has full keyboard navigation, so you don't need a mouse. Means you can use it during flare-ups when fine motor control is hard."
  },
  
  technique_4_emotion_before_logic: {
    description: "Show the feeling, then explain the reason",
    bad: "Evidence Locker uses AI-powered categorization",
    good: "When evidence is scattered, you feel powerless. When it's organized, you feel ready. That shift is what Evidence Locker creates."
  },
  
  technique_5_concrete_example: {
    description: "Show, don't tell—use specific scenarios",
    bad: "The Dashboard gives you important information at a glance",
    good: "On WSIB claim day, you open your Dashboard and see: 3 new messages, 2 documents need uploading, your next appointment is in 5 days. You're not scrambling—you know exactly what's next."
  }
};

const accessibilityIntegration = {
  questions_to_ask: [
    "Who faces the biggest obstacle this feature removes? (Physically, cognitively, systemically)",
    "How does this feature support independence or agency?",
    "What happens for someone with limited energy/spoons? Does this conserve energy?",
    "Is this accessible to people with various disabilities? (Motor, vision, hearing, cognitive)",
    "Who have we forgotten in this story? (Whose perspective should we add)"
  ],
  
  examples: {
    feature: "Energy Forecast + Smart Scheduling",
    accessibility_angle_physical: "If you have variable mobility (some days better than others), this lets you schedule tasks on your good-energy days automatically.",
    accessibility_angle_cognitive: "If you have brain fog or ADHD, Smart Scheduling removes the decision-fatigue of 'when should I do this?'",
    accessibility_angle_systemic: "If you're fighting a benefits claim and need appointments + evidence prep, Scheduling makes planning possible with limited mental bandwidth."
  }
};

const exampleFeatureSpotlight = {
  title: "Stop Losing Energy to Scheduling: Meet Smart Scheduling",
  
  hook: `
Imagine this: You have good energy today. You want to tackle important tasks—
maybe prepare for a doctor's appointment, organize evidence for your claim, 
call the ministry about a benefits question. But here's the trap: you're so busy 
planning WHEN to do things that you run out of energy before you do anything.

For people with disability, energy is finite and unpredictable. Wasting it on 
scheduling logistics is brutal.
  `.trim(),
  
  character: `
Meet Jordan—they have ME/CFS, which means every day is different. Some days 
they have enough energy for two things. Other days, one thing takes everything 
they have. They wanted to appeal their CPP-D denial, but every time they sat 
down to plan when they'd do the work—gather documents, write the letter, send 
it in—they'd crash. The planning itself was the obstacle.
  `.trim(),
  
  feature_explanation: `
Smart Scheduling changes this. Instead of Jordan planning when to do things, 
they tell the app what they need to do and how much energy each task takes 
(quick, moderate, deep work). The app learns their energy patterns—when they 
typically have most energy, how long they usually rest between activities. Then 
it schedules tasks on the days/times they're most likely to have the energy 
for them.

Jordan no longer spends energy deciding when to work on the appeal. The app did 
that. Jordan just sees "Tuesday at 10 AM is your best time to write the appeal 
letter" and does it. No decision fatigue, no false starts, no crashes.
  `.trim(),
  
  impact: `
Jordan completed their CPP-D appeal. Not because Smart Scheduling made it easier 
(though it did)—but because it removed one exhausting obstacle. Instead of 
burning out on planning, Jordan had energy left for the thing that mattered.

The appeal was approved. Retroactive payments came through. But Jordan says the 
bigger win was feeling capable again. "I didn't think I could manage this. The 
app proved I could if the system didn't exhaust me first."
  `.trim(),
  
  accessibility: `
This feature exists because energy is a real barrier. Smart Scheduling isn't 
just convenient—it's liberating for anyone whose capacity fluctuates or who 
gets exhausted by decision-making.
  `.trim(),
  
  next_step: `
Want to see how Smart Scheduling works with your energy? 
[Try Smart Scheduling] or [Watch 3-min walkthrough]
  `.trim()
};

const contentRepurposing = {
  one_feature_spotlight: {
    becomes: [
      "Blog post (full narrative version)",
      "LinkedIn thread (5-tweet format)",
      "Email newsletter feature (extracted case study)",
      "Social media carousel (images + quotes from story)",
      "Infographic (problem > solution > result)",
      "Short video script (Jordan's before/after)"
    ]
  },
  
  example_repurposing: {
    original: "Blog post: Smart Scheduling feature spotlight with Jordan's story",
    
    repurposing_1: {
      format: "LinkedIn Thread",
      lead: "If you have ME/CFS, ADHD, or chronic pain, let me tell you about the trap of scheduling logistics...",
      hook_focus: "The problem (relatable pain)",
      character_focus: "Minimal (just enough to make it real)",
      solution_focus: "How it works (practical tips others can use)",
      impact_focus: "The outcome (why it matters)"
    },
    
    repurposing_2: {
      format: "Newsletter Feature",
      lead: "This week we're spotlighting Smart Scheduling—a feature that might change how you approach your days.",
      hook_focus: "Energy and disability (why this matters)",
      character_focus: "Composite or simplified version",
      solution_focus: "Step-by-step how to use it",
      impact_focus: "Real outcomes from users"
    },
    
    repurposing_3: {
      format: "Social Media Carousel (6 slides)",
      slide_1: "The problem (pain point image)",
      slide_2: "Why scheduling is exhausting (stat or quote)",
      slide_3: "How Smart Scheduling works (visual step 1)",
      slide_4: "How Smart Scheduling works (visual step 2)",
      slide_5: "The result (before/after or outcome quote)",
      slide_6: "CTA (try it link)"
    }
  }
};

const qualityChecks = {
  naval_clarity: [
    "Is the problem stated clearly in the first two sentences?",
    "Could someone explain the feature to a friend in one sentence?",
    "Are there any jargon or acronyms that aren't explained?"
  ],
  
  ogilvy_persuasion: [
    "Does the headline lead with benefit or outcome, not feature name?",
    "Does it appeal to the reader's desire for autonomy, relief, or power?",
    "Would the target reader recognize themselves in the character?",
    "Is there a clear 'why should I care?' answer?"
  ],
  
  annhandley_storytelling: [
    "Is there a clear before/after or transformation?",
    "Can you point to the moment things changed?",
    "Does it feel like a real person's experience, not a marketing pitch?",
    "Is there emotional resonance alongside practical benefit?"
  ],
  
  accessibility_integration: [
    "Does it explain why this matters for people with disabilities (not generic)?",
    "Does it connect feature to independence, agency, or power?",
    "Could someone with cognitive/energy limitations understand the core benefit quickly?",
    "Are multiple disability perspectives represented?"
  ]
};

module.exports = {
  narrativeFramework,
  caseStudyTemplate,
  storytellingTechniques,
  accessibilityIntegration,
  exampleFeatureSpotlight,
  contentRepurposing,
  qualityChecks
};
