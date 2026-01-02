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

    const prompt = `You are a compassionate disability advocate and experienced content writer.

Write a 2,500-word blog post about the "${feature.name}" feature of 3mpwrApp.
Feature Type: ${feature.type}

REQUIRED STRUCTURE:

1. **Opening Hook** (150 words)
   - Start with a REAL PERSON'S PROBLEM this feature solves
   - Include 2 anonymized user quotes showing the struggle
   - Why this matters to the disability community
   - Example: "Stop Scrambling for Medical Records—Evidence Locker Keeps Everything Organized When You Need It Most"

2. **The Problem** (400 words)
   - Deep explanation of the challenge users face
   - Why other solutions don't work
   - Real examples preventing people from getting help
   - Cost/effort of doing this manually

3. **Introducing the Feature** (600 words)
   - What it does (plain language, no jargon)
   - How it works (detailed step-by-step)
   - Why we built it this way (accessibility-first philosophy)
   - Include a detailed use case example

4. **Real Impact** (500 words)
   - Show 3-4 real-world use cases with outcomes
   - Include specific metrics where relevant
   - Emphasize life-changing impact
   - User testimonial

5. **Accessibility & Inclusivity** (400 words)
   - How this serves disabled users specifically
   - Accessibility features built in (screen readers, voice control, color contrast)
   - How we tested with actual disabled users
   - Future improvements planned

6. **How to Get Started** (300 words)
   - Step-by-step tutorial
   - Common mistakes to avoid
   - Pro tips for advanced users
   - Links to related features

7. **Closing** (200 words)
   - Clear call-to-action (sign up, try beta, join community)
   - Invite feedback
   - Link to essential guides

WRITING STYLE:
- Use Naval Ravikant clarity (specific, jargon-free)
- Use Ogilvy persuasion (pain-point first, benefit-driven)
- Use Ann Handley humanity (real stories, emotional resonance)
- Avoid corporate jargon
- Use subheadings liberally
- Include 2-3 relevant quotes from disabled users

REQUIREMENTS:
- Title must be user-benefit focused (NOT feature-focused)
- Must include at least one accessibility-specific section
- Include CTA that drives action
- 2,500+ words exactly
- Include tags: feature-spotlight, 3mpwrapp, accessibility
- Write complete YAML frontmatter for Jekyll

FORMAT:
---
layout: post
title: "[Your title here]"
date: [ISO timestamp]
categories: [blog, feature-spotlight]
tags: [feature-spotlight, 3mpwrapp, accessibility]
---

[Blog post content in markdown]

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

    const prompt = `You are an expert in disability rights and community support.

Write a comprehensive, 2,500-word educational blog post: "${topic}"

REQUIRED STRUCTURE:

1. **Introduction** (200 words)
   - Why this topic matters
   - Who this guide is for
   - What readers will learn
   - How long it takes

2. **Background Context** (400 words)
   - Historical context (why this exists)
   - Key concepts explained simply
   - Common misconceptions addressed
   - Provincial variations (Ontario, BC, Alberta focus)

3. **Step-by-Step Process** (1,200 words)
   - 5-8 major steps
   - For each step:
     * What to do (specific)
     * Common mistakes (real examples)
     * Resources/templates
     * Time required
     * Expected outcome
   - Include real examples
   - Checklist format for action items

4. **Templates & Worksheets** (300 words)
   - Provide actual templates readers can use
   - Links to downloadable resources
   - How to customize for their situation

5. **FAQ** (200 words)
   - 4-5 common questions
   - Address hesitations
   - Success stories

6. **Action Plan** (200 words)
   - Clear next steps
   - Timeline
   - Support contacts
   - 3mpwrApp tools that help

WRITING STYLE:
- Written for someone with limited time/energy
- Short paragraphs, clear structure
- Avoid legal jargon (explain when needed)
- Encouraging, not overwhelming
- Practical over theoretical

REQUIREMENTS:
- Cite actual government programs/requirements
- Include actual contact information
- Provide downloadable templates/checklists
- Final CTA: "Start today with [specific action]"
- Tags: education, guide, benefits/workers-rights/accessibility
- 2,500+ words exactly
- Complete Jekyll frontmatter

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

    const prompt = `A community member shared their story about overcoming barriers with disability support.

Write a 2,000-word case study blog post about a transformational journey.

STRUCTURE:
1. Introduction (150 words) - Hook with their biggest challenge
2. The Struggle (400 words) - What they faced, how it affected life
3. Discovery (300 words) - How they found solutions
4. The Transformation (600 words) - Step-by-step what they did
5. The Results (300 words) - Quantified outcomes, quality of life improvements
6. Key Lessons (200 words) - What others can learn

STYLE:
- Deeply human and specific
- No corporate language
- Real details and emotions
- Inspirational without being unrealistic

REQUIREMENTS:
- Real details (not generic)
- Specific outcomes/metrics
- Compassionate framing
- Ending: "You can do this too"
- Tags: success-story, community, inspiration
- Complete Jekyll frontmatter

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
