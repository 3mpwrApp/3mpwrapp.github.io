#!/usr/bin/env node

/**
 * BLOG POST AGENT - PRODUCTION DEPLOYMENT
 * 
 * Autonomous system that generates 3-5 complete blog posts per day:
 * - Feature spotlights (2/day, 2,500 words each)
 * - Educational guides (1/day, 2,500 words each)
 * - Policy analysis (triggered by news)
 * - Case studies (from community submissions)
 * - Skill tutorials (periodic)
 * 
 * All content: AI-generated, fully autonomous
 */

const { OpenAI } = require('openai');
const fs = require('fs').promises;
const path = require('path');

class BlogPostAgentProduction {
  constructor(config = {}) {
    const apiKey = config.apiKey || process.env.GITHUB_TOKEN;
    
    if (!apiKey) {
      throw new Error('GITHUB_TOKEN environment variable is required. Set it with: $env:GITHUB_TOKEN = "ghp_..."');
    }

    this.config = {
      postsDir: config.postsDir || './_posts',
      apiKey: apiKey,
      model: config.model || 'gpt-4o',
      ...config
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: 'https://models.inference.ai.azure.com',
      defaultHeaders: {
        'user-agent': 'empowr-blog-agent/1.0'
      }
    });

    this.status = {
      postsGenerated: 0,
      totalWords: 0,
      startedAt: new Date()
    };

    // Load trending topics and optimized hashtags
    this.trendingTopics = this.loadTrendingTopics();
    this.optimizedHashtags = this.loadOptimizedHashtags();

    // Feature rotation
    this.features = [
      { name: 'Evidence Locker', type: 'Document organization & legal case building' },
      { name: 'Master Letter Generator', type: 'Professional letter templates (22 types)' },
      { name: 'Benefits Tracker', type: 'Track ODSP, CPP-D, DTC benefits' },
      { name: 'Deadline Reminders', type: 'Never miss application deadlines' },
      { name: 'Disability Wizard', type: 'Step-by-step benefit eligibility assistant' },
      { name: 'Crisis Resources', type: 'Emergency support locator' },
      { name: 'Mood Tracker', type: 'Mental health monitoring & patterns' },
      { name: 'Symptom Pain Tracker', type: 'Track symptoms & pain patterns' }
    ];

    this.educationalTopics = [
      'How to Apply for ODSP in Ontario',
      'WSIB Appeal Strategy: Complete 5-Step Guide',
      'CPP-D vs ODSP: Which Benefits Apply to You',
      'Requesting Workplace Accommodations: Legal Guide',
      'Building Your Case: Document Organization for Appeals',
      'Medical Evidence That Wins WSIB Appeals',
      'Accessible Job Interview Preparation Checklist'
    ];
  }

  /**
   * LOAD TRENDING TOPICS
   */
  loadTrendingTopics() {
    try {
      const trendingFile = path.join(process.cwd(), 'public', 'trending-topics.json');
      if (fs.existsSync(trendingFile)) {
        const data = JSON.parse(fs.readFileSync(trendingFile, 'utf8'));
        return data.currentTrending || [];
      }
    } catch (err) {
      console.warn(`⚠️ Could not load trending topics: ${err.message}`);
    }
    return [];
  }

  /**
   * LOAD OPTIMIZED HASHTAGS
   */
  loadOptimizedHashtags() {
    try {
      const hashtagFile = path.join(process.cwd(), '_data', 'optimized-hashtags.json');
      if (fs.existsSync(hashtagFile)) {
        const data = JSON.parse(fs.readFileSync(hashtagFile, 'utf8'));
        return data.recommended || ['3mpwrApp', 'DisabilityRights', 'Accessibility'];
      }
    } catch (err) {
      console.warn(`⚠️ Could not load optimized hashtags: ${err.message}`);
    }
    return ['3mpwrApp', 'DisabilityRights', 'Accessibility'];
  }

  /**
   * GET TRENDING TOPICS CONTEXT
   */
  getTrendingContext() {
    if (this.trendingTopics.length === 0) {
      return '';
    }

    const top5 = this.trendingTopics.slice(0, 5);
    return `\n\nCURRENT TRENDING TOPICS (incorporate naturally if relevant):\n${top5.map(t => `- ${t.keyword} (${t.mentions} mentions)`).join('\n')}\n`;
  }

  /**
   * INITIALIZE
   */
  async initialize() {
    console.log('🚀 Initializing Blog Post Agent...');

    try {
      await fs.mkdir(this.config.postsDir, { recursive: true });

      this.startContentGeneration();

      console.log('✅ Blog Post Agent initialized successfully');
      console.log(`   - Feature spotlight rotation: ${this.features.length} features`);
      console.log(`   - Educational topics: ${this.educationalTopics.length} topics`);
      console.log(`   - Content schedule:`);
      console.log(`     * 8:00 AM: Feature spotlight`);
      console.log(`     * 10:00 AM: Educational guide`);
      console.log(`     * 4:00 PM: Feature spotlight or case study`);
      console.log(`   - AI Model: ${this.config.model}`);

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Blog Post Agent:', error);
      throw error;
    }
  }

  /**
   * START CONTENT GENERATION SCHEDULE
   */
  startContentGeneration() {
    console.log('\n📝 Starting content generation schedule...\n');

    // Morning feature spotlight (8 AM UTC)
    this.scheduleDaily('08:00', () => this.generateFeatureSpotlight());

    // Educational guide (10 AM UTC)
    this.scheduleDaily('10:00', () => this.generateEducationalGuide());

    // Afternoon content (4 PM UTC) - alternates between feature and case study
    this.scheduleDaily('16:00', async () => {
      const dayOfYear = new Date().getDay();
      if (dayOfYear % 2 === 0) {
        await this.generateFeatureSpotlight();
      } else {
        await this.generateCaseStudy();
      }
    });

    console.log('✓ Content generation schedule started\n');
  }

  /**
   * GENERATE FEATURE SPOTLIGHT (AI)
   */
  async generateFeatureSpotlight() {
    const feature = this.features[Math.floor(Math.random() * this.features.length)];

    console.log(`\n[${new Date().toISOString()}] Generating feature spotlight: "${feature.name}"`);

    const prompt = `You are writing as the founder of 3mpwrApp—an injured worker who fell through the cracks and built this app so others don't have to.

Write a 2,500-word blog post about the "${feature.name}" feature of 3mpwrApp in FIRST PERSON (use "I built this..." not "This feature...").
Feature Type: ${feature.type}

CRITICAL VOICE REQUIREMENTS:
- Write as ME, the founder: "I built this because I know what it's like to..."
- Be raw and authentic: "I fell through the cracks. I built this app for you."
- Lead with PAIN POINT before solution
- Use specific examples from injured workers and disabled people in Canada
- Show solidarity, not charity: "I'm one of you. I understand."
- Phase 1 beta context: "Right now, beta testers are getting familiar with this..."

REQUIRED STRUCTURE:

1. **Opening Hook** (200 words)
   - Start with YOUR PERSONAL EXPERIENCE with this problem
   - First-person: "I remember when I couldn't...", "I know what it's like to..."
   - The PAIN: What happens when you don't have this tool
   - Example: "I Spent Six Hours Scrambling for Medical Records. Never Again."

2. **The Pain Point** (500 words)
   - Deep dive into the struggle (use "you" to connect with reader)
   - Why the current system fails disabled/injured workers
   - Real consequences: denied benefits, lost appeals, mental health impact
   - "This shouldn't be your burden to carry. But it is. Until now."

3. **Why I Built This** (600 words)
   - Your story: What made you create this specific feature
   - How you tested it with real disabled users
   - The accessibility-first philosophy (screen readers, voice control, high contrast)
   - Step-by-step: How it actually works (plain language)
   - Include detailed use case${this.getTrendingContext()}

4. **Real Impact for Our Community** (500 words)
   - 3-4 specific scenarios where this helps
   - Connect to Canadian disability/injured worker pain points:
     * WSIB/WorkSafeBC denials
     * CPP-D appeals
     * Lost documentation
     * Government bureaucracy
   - "This is what changes when you have the right tool..."

5. **Accessibility Promise** (400 words)
   - "I built this for EVERYONE—including screen reader users, people with low vision, voice control users"
   - Specific accessibility features (WCAG AAA compliance, keyboard navigation, etc.)
   - How beta testers with disabilities helped shape this
   - Future improvements you're planning

6. **Get Started Today** (200 words)
   - Clear step-by-step (assume beta tester in Phase 1)
   - Common mistakes to avoid
   - Pro tips
   - Link to related features

7. **Your Turn** (100 words)
   - Direct CTA: "Join beta testing. Tell me what's broken. Help me make this better."
   - "I built this because the system failed me. I'm building it WITH you so it serves our community."
   - Invite feedback, not as corporate speak, but as genuine request

WRITING STYLE (MANDATORY):
- FIRST PERSON throughout: "I built...", "I know...", "I understand..."
- Raw emotion: "I was furious when...", "I refused to accept that..."
- Specific Canadian context: WSIB, WorkSafeBC, CPP-D, accessibility laws
- No corporate jargon—write like talking to someone going through what you went through
- Short paragraphs, conversational tone
- Include 2-3 quotes from actual beta testers (anonymized: "Sarah, beta tester")

EXAMPLE OPENING (match this energy):
"I was denied WSIB right after they said I'd reached maximum recovery. They decided I was 'recovered' even though I couldn't work. I went on Ontario Works, then ODSP, now CPP-D. I spent 5 years in that system—5 years of lived experience with every broken process this app fixes. I built Evidence Locker because I know what it's like when the paperwork defeats you before the system even looks at your case."

REQUIREMENTS:
- Title must be BENEFIT-focused AND personal: "How I'm Solving [...Pain Point]"
- Must include Phase 1 beta testing context
- 2,500+ words exactly
- Include tags: feature-spotlight, 3mpwrapp, accessibility, beta-testing
- Complete YAML frontmatter for Jekyll

FORMAT:
---
layout: post
title: "[Your title here - first person, benefit-focused]"
date: [ISO timestamp]
categories: [blog, feature-spotlight]
tags: [feature-spotlight, 3mpwrapp, accessibility, beta-testing]
excerpt: "[First-person summary: 'I built X because I know what it's like to Y...']"
---

[Complete blog post in markdown with authentic founder voice]

Generate the COMPLETE blog post ready to publish.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.choices[0].message.content;

      await this.publishBlogPost(content, 'feature_spotlight', feature.name);

      this.status.postsGenerated++;
      this.status.totalWords += this.countWords(content);

      console.log(`   ✅ Feature spotlight published: "${feature.name}"`);

      return true;
    } catch (error) {
      console.error(`   ❌ Error generating feature spotlight: ${error.message}`);
      return false;
    }
  }

  /**
   * GENERATE EDUCATIONAL GUIDE (AI)
   */
  async generateEducationalGuide() {
    const topic = this.educationalTopics[Math.floor(Math.random() * this.educationalTopics.length)];

    console.log(`\n[${new Date().toISOString()}] Generating educational guide: "${topic}"`);

    const prompt = `You are writing as the founder of 3mpwrApp—an injured worker who researched all of this while fighting for your own benefits.

Write a comprehensive, 2,500-word educational guide in FIRST PERSON: "${topic}"

CRITICAL VOICE:
- Write as the founder: "When I was appealing my WSIB denial, I had to learn all of this the hard way..."
- Share personal research: "I spent weeks figuring this out so you don't have to"
- Authentic frustration with bureaucracy: "The system makes this way harder than it needs to be"
- Solidarity: "I know how exhausting this is. Let me break it down for you."

REQUIRED STRUCTURE:

1. **Why I'm Writing This** (200 words)
   - Your personal experience with this topic
   - "I had to learn this the hard way. You don't have to."
   - Who this guide helps (disabled, injured workers, families)
   - What you'll learn and how long it takes
   - "I'm sharing everything I wish someone had told me"

2. **The Context You Need** (400 words)
   - Why this system exists (and why it's frustrating)
   - Key concepts in plain language
   - Common misconceptions that cost people benefits
   - Provincial differences (Ontario/WSIB, BC/WorkSafeBC, Alberta/WCB)${this.getTrendingContext()}
   - "Here's what they don't tell you..."

3. **Step-by-Step (How I Did It)** (1,200 words)
   - 5-8 major steps with personal context
   - For each step:
     * What to do (specific actions)
     * Common mistakes ("I messed this up so you won't")
     * Resources/templates (provide actual links)
     * Time required (be realistic about bureaucracy)
     * Expected outcome
   - Include real examples from your experience
   - Checklist format for easy action

4. **Templates I Created for You** (300 words)
   - Actual templates readers can copy/paste
   - "These are the exact templates that worked for me"
   - How to customize for individual situations
   - Links to downloadable versions

5. **Questions I Had (And Answers)** (200 words)
   - 4-5 common questions you researched
   - Address fears and hesitations
   - Success stories from beta testers

6. **Start Here** (200 words)
   - Clear next steps (first thing to do TODAY)
   - Realistic timeline
   - Government contacts (actual phone numbers)
   - How 3mpwrApp tools help with this specific process
   - "You don't have to do this alone. Here's how I can help..."

WRITING STYLE (MANDATORY):
- First person: "I learned...", "I created...", "I'm sharing..."
- Written for exhausted people (short paragraphs, clear structure)
- No legal jargon—explain everything simply
- Encouraging but realistic: "This is hard. You can do it. Here's how."
- CANADIAN SPECIFIC: Use WSIB/WorkSafeBC, CPP-D, actual program names

REQUIREMENTS:
- Cite actual government programs (with links)
- Include actual contact information
- Provide downloadable templates/checklists
- Final CTA: "Start today with [specific action]. I'm here to help."
- Tags: education, guide, benefits/workers-rights/accessibility, beta-testing
- 2,500+ words exactly
- Complete Jekyll frontmatter

EXAMPLE OPENING (match this energy):
"I was denied WSIB right after they said I'd reached maximum recovery. Then came Ontario Works. Then ODSP. Now CPP-D. Five years navigating these systems taught me everything about appeals, documentation, and how bureaucracy is designed to exhaust you. I spent the past few years figuring out how to build this app because the resources are next to nothing. I'm sharing everything I learned so you can skip the confusion and get straight to results."

Generate the COMPLETE blog post ready to publish.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.choices[0].message.content;

      await this.publishBlogPost(content, 'educational_guide', topic);

      this.status.postsGenerated++;
      this.status.totalWords += this.countWords(content);

      console.log(`   ✅ Educational guide published: "${topic}"`);

      return true;
    } catch (error) {
      console.error(`   ❌ Error generating educational guide: ${error.message}`);
      return false;
    }
  }

  /**
   * GENERATE CASE STUDY
   */
  async generateCaseStudy() {
    console.log(`\n[${new Date().toISOString()}] Generating case study...`);

    const prompt = `You are writing as the founder of 3mpwrApp, sharing a story from YOUR OWN lived experience.

Write a 2,000-word case study in FIRST PERSON about YOUR transformational journey through the disability support system.

CRITICAL CONTEXT:
- The app is being built in REAL-TIME (no beta testers sharing success stories yet)
- You have 5 YEARS of lived experience: WSIB denial → Ontario Works → ODSP → CPP-D
- You spent the past few years figuring out how to build this app with next to no resources
- These are YOUR stories, not "beta tester testimonials"

VOICE REQUIREMENTS:
- Write as yourself: "This is what I went through..."
- Raw, unfiltered lived experience: "I was denied WSIB. Then came OW. Then ODSP. Five years."
- Show how the tools you're building NOW would have changed your past experience
- "I'm building the app I wish I had when I was drowning in paperwork"

STRUCTURE:

1. **Why I'm Sharing This** (150 words)
   - First-person: "This is my story. This is why I built 3mpwrApp."
   - Your biggest challenge (WSIB denial, system navigation, lost appeals)
   - Hook with raw emotion: "They said I'd reached maximum recovery. I couldn't even..."
   - "I'm building the tools I wish I had back then"

2. **The Struggle** (400 words)
   - What YOU faced (detailed, specific from your 5 years)
   - WSIB denial, Ontario Works, ODSP, CPP-D journey
   - How it affected your life, mental health, family
   - System failures that made it worse
   - "I spent 5 years in this broken system..."

3. **The Turning Point** (300 words)
   - When you decided to BUILD the solution instead of just surviving
   - What made you take action despite exhaustion
   - First moment you realized: "Someone needs to build this"
   - "I spent the past few years figuring out how to build an app with next to no resources"

4. **The Building Process** (600 words)
   - How you're building 3mpwrApp in real-time
   - Challenges: limited resources, technical learning, staying focused
   - What you've learned about disability tech, accessibility, real user needs
   - Features you're building based on what you NEEDED back then
   - "Every feature solves a problem I personally faced"

5. **What's Different Now** (300 words)
   - How having these tools would have changed your journey
   - Specific scenarios: "If I'd had Evidence Locker when WSIB denied me..."
   - Quality of life improvements you're creating for others
   - "I can't change my past, but I can change someone else's future"

6. **What I've Learned** (200 words)
   - Key lessons from 5 years in the system + building this app
   - What this teaches about Canadian disability support
   - Why lived experience matters when building disability tech
   - "You can't build this from the outside. You have to have lived it."

7. **Join Me** (50 words)
   - Direct CTA: "I'm building this in real-time. Watch me build it. Join beta testing when it's ready."
   - "I built this because the system failed me. I'm building it so it doesn't fail you."

WRITING STYLE (MANDATORY):
- First person from YOUR experience: "I was...", "They told me...", "I spent 5 years..."
- Deep humanity and specific details from YOUR actual journey
- Real emotions: rage at WSIB denial, exhaustion from 5 years, determination to build
- No corporate language or generic inspiration
- Canadian context: WSIB, WorkSafeBC, CPP-D, actual systems
- Connect THEIR story to YOUR story

REQUIREMENTS:
- Real details (anonymized but specific)
- Specific outcomes/metrics where possible
- Compassionate framing
- Beta testing context (Phase 1)
- Ending: Invitation to community, not sales pitch
- Tags: success-story, community, beta-testing, inspiration
- Complete Jekyll frontmatter

VOICE CONTEXT:
- App is being built in REAL-TIME (no beta tester success stories yet)
- Use HYPOTHETICAL scenarios: "Imagine you're facing...", "Here's what this would look like..."
- Base stories on YOUR lived experience or composite scenarios from the community pain points
- DO NOT claim these are "beta tester stories" - acknowledge: "I'm building this based on 5 years of lived experience"

EXAMPLE OPENING (match this energy):
"I'm building 3mpwrApp in real-time, so I don't have beta tester success stories yet. But I have 5 years of lived experience with WSIB denials, Ontario Works, ODSP, and CPP-D. I know exactly what this journey looks like. Let me walk you through a scenario I lived—and show you how the tools I'm building would have changed everything."

Generate the COMPLETE blog post ready to publish.`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.config.model,
        max_tokens: 3500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.choices[0].message.content;

      await this.publishBlogPost(content, 'case_study', 'Community Success Story');

      this.status.postsGenerated++;
      this.status.totalWords += this.countWords(content);

      console.log(`   ✅ Case study published`);

      return true;
    } catch (error) {
      console.error(`   ❌ Error generating case study: ${error.message}`);
      return false;
    }
  }

  /**
   * PUBLISH BLOG POST
   */
  async publishBlogPost(content, type, title) {
    const date = new Date().toISOString().split('T')[0];
    
    // Extract title from content if not provided
    let actualTitle = title;
    const titleMatch = content.match(/^#\s+(.+)$/m) || content.match(/title:\s*"?([^"\n]+)"?$/m);
    if (titleMatch) {
      actualTitle = titleMatch[1].replace(/"/g, '');
    }

    // Inject optimized hashtags into frontmatter if not already present
    if (!content.match(/^hashtags:/m) && this.optimizedHashtags.length > 0) {
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const hashtags = this.optimizedHashtags.slice(0, 5).map(h => `#${h}`).join(' ');
        const newFrontmatter = frontmatter + `\nhashtags: "${hashtags}"`;
        content = content.replace(frontmatterMatch[0], `---\n${newFrontmatter}\n---`);
      }
    }

    // Create filename from title
    const slug = actualTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 60);

    const filename = path.join(this.config.postsDir, `${date}-${slug}.md`);

    try {
      await fs.writeFile(filename, content);
      console.log(`   ✓ Saved to: ${filename}`);
      console.log(`   ✓ Applied optimized hashtags: ${this.optimizedHashtags.slice(0, 5).join(', ')}`);
    } catch (error) {
      console.error(`   ✗ Error writing file: ${error.message}`);
    }
  }

  /**
   * HELPER: Count words
   */
  countWords(text) {
    return text.split(/\s+/).length;
  }

  /**
   * HELPER: Schedule daily task
   */
  scheduleDaily(timeStr, callback) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();

    scheduled.setHours(hours, minutes, 0, 0);

    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    const delay = scheduled - now;
    console.log(`[Scheduler] Daily task at ${timeStr} scheduled for ${scheduled.toISOString()}`);

    setTimeout(() => {
      callback();
      setInterval(callback, 24 * 3600 * 1000);
    }, delay);
  }

  /**
   * GET STATUS
   */
  getStatus() {
    const uptime = ((Date.now() - this.status.startedAt) / 1000 / 60).toFixed(1);
    return {
      ...this.status,
      uptime: `${uptime} minutes`,
      status: 'running'
    };
  }
}

// ============================================================================
// DEPLOYMENT
// ============================================================================

async function deploy() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║   BLOG POST AGENT - PRODUCTION DEPLOYMENT                          ║
║   Autonomous AI-Generated Content (3-5 posts/day)                  ║
║   Started: ${new Date().toISOString()}                              ║
╚════════════════════════════════════════════════════════════════════╝
  `);

  try {
    const agent = new BlogPostAgentProduction({
      postsDir: './_posts',
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    await agent.initialize();

    // Log status every 1 hour
    setInterval(() => {
      const status = agent.getStatus();
      console.log(`\n[Status Report] ${new Date().toISOString()}`);
      console.log(`  Posts Generated: ${status.postsGenerated}`);
      console.log(`  Total Words: ${status.totalWords.toLocaleString()}`);
      console.log(`  Uptime: ${status.uptime}`);
    }, 60 * 60 * 1000);

    return agent;

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// Start deployment if run directly
if (require.main === module) {
  deploy().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { BlogPostAgentProduction, deploy };
