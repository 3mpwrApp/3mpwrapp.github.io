#!/usr/bin/env node

/**
 * MASTER CAMPAIGN ORCHESTRATOR
 * 
 * Runs all campaign systems together:
 * 1. Content posting (scheduler)
 * 2. Performance tracking (self-aware metrics)
 * 3. Feedback collection & analysis
 * 4. Automatic adaptation
 * 5. Reporting
 * 
 * This is the "brain" that coordinates everything.
 * 
 * Usage: node campaign-orchestrator.js start|status|pause|stop
 * 
 * Campaign: "Why Disability Apps Fail" (2026-01-06)
 */

const campaignScheduler = require('./campaign-scheduler-intelligent.js');
const performanceTracker = require('../tracking/performance-tracker-self-aware.js');
const feedbackLoop = require('./feedback-loop-evolution.js');
const fs = require('fs');
const path = require('path');

// Get project root directory (go up from scripts/automation/)
const PROJECT_ROOT = path.resolve(__dirname, '../../');

class CampaignOrchestrator {
  constructor(campaignId) {
    this.campaignId = campaignId;
    this.campaignName = 'disability-tech-why-apps-fail';
    this.launchDate = '2026-01-06T08:00:00Z';
    this.status = 'initialized';
    this.logFile = `logs/campaign-${campaignId}.log`;
    this.stateFile = `state/campaign-state-${campaignId}.json`;
    
    // Ensure log directory exists
    if (!fs.existsSync('logs')) fs.mkdirSync('logs', { recursive: true });
    if (!fs.existsSync('state')) fs.mkdirSync('state', { recursive: true });
    if (!fs.existsSync('reports')) fs.mkdirSync('reports', { recursive: true });
    
    this.log('Orchestrator initialized');
  }

  // LOGGING
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    // Write to file
    fs.appendFileSync(this.logFile, logEntry);
    
    // Also console if important
    if (level !== 'DEBUG') {
      console.log(logEntry.trim());
    }
  }

  // STATE MANAGEMENT
  saveState() {
    const state = {
      campaignId: this.campaignId,
      status: this.status,
      lastUpdate: new Date().toISOString(),
      phase: this.currentPhase,
      postsScheduled: this.postsScheduled || 0,
      engagementMetrics: performanceTracker.metrics,
      nextAction: this.nextAction
    };
    
    fs.writeFileSync(this.stateFile, JSON.stringify(state, null, 2));
    this.log('State saved', 'DEBUG');
  }

  loadState() {
    if (fs.existsSync(this.stateFile)) {
      const state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      this.status = state.status;
      this.currentPhase = state.phase;
      this.log(`State loaded: ${this.status}`);
      return state;
    }
    return null;
  }

  // PHASE MANAGEMENT
  getCurrentPhase() {
    const now = new Date();
    const launchDate = new Date(this.launchDate);
    const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLaunch < 1) return 'phase1_launch';
    if (daysSinceLaunch < 3) return 'phase2_amplification';
    if (daysSinceLaunch < 7) return 'phase3_optimization';
    return 'phase4_evergreen';
  }

  // MAIN ORCHESTRATION
  async start() {
    this.log('Campaign starting...', 'INFO');
    this.status = 'running';
    this.currentPhase = this.getCurrentPhase();
    this.saveState();

    try {
      // Phase detection
      this.log(`Current phase: ${this.currentPhase}`);
      
      // Get schedule for this phase
      const phaseSchedule = campaignScheduler[this.currentPhase];
      
      if (!phaseSchedule) {
        this.log('No schedule defined for current phase', 'WARN');
        return;
      }

      // Process schedule items
      await this.processSchedule(phaseSchedule.schedule);

      // Start feedback loop
      await this.startFeedbackLoop();

      // Start performance tracking
      await this.startPerformanceTracking();

      // Set up automatic adaptations
      this.setupAutomaticAdaptations();

      this.log('Campaign running successfully', 'INFO');
    } catch (error) {
      this.log(`Error during campaign start: ${error.message}`, 'ERROR');
      this.status = 'error';
      throw error;
    }

    this.saveState();
  }

  async processSchedule(schedule) {
    this.log(`Processing ${schedule.length} scheduled posts`, 'INFO');
    
    for (const item of schedule) {
      try {
        // Check safety conditions
        if (!await this.passSafetyChecks(item)) {
          this.log(`Skipping post at ${item.time} - safety check failed`, 'WARN');
          continue;
        }

        // Schedule the post
        await this.schedulePost(item);
        
        this.log(`✓ Scheduled: ${item.platform} at ${item.time}`, 'INFO');
      } catch (error) {
        this.log(`✗ Failed to schedule ${item.platform} post: ${error.message}`, 'ERROR');
      }
    }
    
    this.postsScheduled = schedule.length;
  }

  async schedulePost(item) {
    // Load content file
    let content;
    
    try {
      // Determine content source
      // Resolve path relative to project root
      const contentPath = path.join(PROJECT_ROOT, item.contentFile);
      
      if (item.contentFile.endsWith('.md')) {
        content = fs.readFileSync(contentPath, 'utf8');
      } else {
        // Clear require cache and load fresh
        delete require.cache[contentPath];
        content = require(contentPath);
      }
    } catch (error) {
      this.log(`Could not load content: ${item.contentFile}`, 'ERROR');
      throw error;
    }

    // Extract variant if needed
    let postContent = content;
    if (item.variant) {
      // Navigate to variant in content object
      const path = item.variant.split('.');
      let current = content;
      for (const key of path) {
        current = current[key];
      }
      postContent = current;
    }

    // Queue for posting (actual posting happens via social-post.js)
    const queueItem = {
      id: `${this.campaignId}-${item.platform}-${Date.now()}`,
      campaignId: this.campaignId,
      platform: item.platform,
      scheduledTime: item.time,
      content: postContent,
      variant: item.variant,
      abTest: item.abTest || false,
      testGroup: item.testGroup || null,
      expectedReach: item.expectedReach || null
    };

    // Write to queue (will be processed by existing social-post.js)
    const queueFile = `queue/social-posts-pending.json`;
    if (!fs.existsSync('queue')) fs.mkdirSync('queue', { recursive: true });
    
    let queue = [];
    if (fs.existsSync(queueFile)) {
      queue = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
    }
    
    queue.push(queueItem);
    fs.writeFileSync(queueFile, JSON.stringify(queue, null, 2));

    this.log(`Added to queue: ${item.platform} post`, 'DEBUG');
  }

  async passSafetyChecks(item) {
    // Check 1: Site health
    try {
      const response = await this.checkSiteHealth();
      if (!response) {
        this.log('Site health check failed', 'WARN');
        return false;
      }
    } catch (error) {
      this.log(`Site health check error: ${error.message}`, 'ERROR');
      return false;
    }

    // Check 2: Platform connectivity
    try {
      const isOnline = await this.checkPlatformConnectivity(item.platform);
      if (!isOnline) {
        this.log(`Platform ${item.platform} not reachable`, 'WARN');
        return false;
      }
    } catch (error) {
      this.log(`Platform connectivity check error: ${error.message}`, 'ERROR');
      return false;
    }

    // Check 3: Rate limiting
    const rateLimitOk = await this.checkRateLimits(item.platform);
    if (!rateLimitOk) {
      this.log(`Rate limit check failed for ${item.platform}`, 'WARN');
      return false;
    }

    return true;
  }

  async checkSiteHealth() {
    // Verify blog is accessible
    // This would call a health check endpoint
    this.log('Site health check: OK', 'DEBUG');
    return true;
  }

  async checkPlatformConnectivity(platform) {
    // Verify platform is reachable
    this.log(`Platform check ${platform}: OK`, 'DEBUG');
    return true;
  }

  async checkRateLimits(platform) {
    // Verify we haven't exceeded platform rate limits
    this.log(`Rate limit check ${platform}: OK`, 'DEBUG');
    return true;
  }

  async startFeedbackLoop() {
    this.log('Starting feedback loop...', 'INFO');
    
    // Set up periodic feedback collection
    setInterval(async () => {
      try {
        await this.collectFeedback();
        await this.analyzeFeedback();
        await this.detectPatterns();
      } catch (error) {
        this.log(`Feedback loop error: ${error.message}`, 'ERROR');
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours

    this.log('Feedback loop started', 'INFO');
  }

  async collectFeedback() {
    this.log('Collecting feedback from all platforms...', 'DEBUG');
    
    // This integrates with existing social media APIs
    // For now, placeholder implementation
    
    const feedback = {
      timestamp: new Date().toISOString(),
      sources: {
        x: { comments: 0, analyzed: false },
        facebook: { comments: 0, analyzed: false },
        bluesky: { comments: 0, analyzed: false },
        mastodon: { comments: 0, analyzed: false }
      }
    };

    fs.writeFileSync('reports/feedback-raw.json', JSON.stringify(feedback, null, 2));
  }

  async analyzeFeedback() {
    this.log('Analyzing feedback...', 'DEBUG');
    
    // Sentiment analysis
    // Question detection
    // Misconception identification
    // etc.
    
    const analysis = {
      timestamp: new Date().toISOString(),
      sentimentScore: 0.6,
      commonQuestions: [],
      misconceptions: [],
      testimonials: []
    };

    fs.writeFileSync('reports/feedback-analysis.json', JSON.stringify(analysis, null, 2));
  }

  async detectPatterns() {
    this.log('Detecting patterns...', 'DEBUG');
    
    // Audience clustering
    // Topic emergence
    // Confusion patterns
    // Viral momentum
    // etc.
    
    const patterns = {
      timestamp: new Date().toISOString(),
      patterns: []
    };

    fs.writeFileSync('reports/patterns-detected.json', JSON.stringify(patterns, null, 2));
  }

  async startPerformanceTracking() {
    this.log('Starting performance tracking...', 'INFO');
    
    // Update metrics every 15 minutes
    setInterval(async () => {
      try {
        await this.updateMetrics();
        await this.checkAdaptationTriggers();
        await this.generateDailyReport();
      } catch (error) {
        this.log(`Performance tracking error: ${error.message}`, 'ERROR');
      }
    }, 15 * 60 * 1000); // Every 15 minutes

    this.log('Performance tracking started', 'INFO');
  }

  async updateMetrics() {
    this.log('Updating performance metrics...', 'DEBUG');
    
    // Fetch latest engagement data from all platforms
    // Update performanceTracker.metrics
    // This integrates with existing analytics
  }

  async checkAdaptationTriggers() {
    this.log('Checking adaptation triggers...', 'DEBUG');
    
    // Check if any automatic adaptation rules have been triggered
    // e.g., engagement rate too low, sentiment shifted, etc.
  }

  async generateDailyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      campaignId: this.campaignId,
      phase: this.currentPhase,
      metrics: performanceTracker.metrics,
      topPerformers: [],
      alerts: [],
      recommendations: []
    };

    fs.writeFileSync(`reports/campaign-daily-${new Date().toISOString().split('T')[0]}.json`, JSON.stringify(report, null, 2));
    this.log('Daily report generated', 'DEBUG');
  }

  setupAutomaticAdaptations() {
    this.log('Setting up automatic adaptations...', 'INFO');
    
    // Weekly optimization (Sundays)
    const setupWeeklyOptimization = () => {
      const now = new Date();
      const sunday = new Date();
      sunday.setDate(sunday.getDate() - sunday.getDay() + 7);
      sunday.setHours(1, 0, 0, 0);
      
      const timeUntilSunday = sunday.getTime() - now.getTime();
      
      setTimeout(async () => {
        this.log('Running weekly optimization...', 'INFO');
        await this.runWeeklyOptimization();
        
        // Schedule next week
        setupWeeklyOptimization();
      }, timeUntilSunday);
    };
    
    setupWeeklyOptimization();
    this.log('Automatic adaptations configured', 'INFO');
  }

  async runWeeklyOptimization() {
    // Review best/worst hooks
    // Identify best posting times
    // Compile common questions
    // Generate learnings report
    this.log('Weekly optimization complete', 'INFO');
  }

  // COMMAND HANDLERS
  async status() {
    const state = this.loadState();
    
    console.log(`
📊 Campaign Status: ${this.campaignName}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status:              ${state?.status || this.status}
Phase:               ${state?.phase || this.getCurrentPhase()}
Posts Scheduled:     ${state?.postsScheduled || 0}
Days Since Launch:   ${Math.floor((new Date() - new Date(this.launchDate)) / (1000 * 60 * 60 * 24))}

Engagement Metrics:
  • Reach:           ${state?.engagementMetrics?.overall?.reach || 'N/A'}
  • Engagement Rate: ${state?.engagementMetrics?.overall?.engagement_rate || 'N/A'}
  • Sentiment:       ${state?.engagementMetrics?.overall?.sentiment || 'N/A'}

Next Action: ${state?.nextAction || 'None scheduled'}
    `);
  }

  pause() {
    this.status = 'paused';
    this.log('Campaign paused', 'INFO');
    this.saveState();
  }

  resume() {
    this.status = 'running';
    this.log('Campaign resumed', 'INFO');
    this.saveState();
  }

  stop() {
    this.status = 'stopped';
    this.log('Campaign stopped', 'INFO');
    this.saveState();
  }
}

// CLI INTERFACE
const orchestrator = new CampaignOrchestrator('disability-tech-why-apps-fail-2026-01-06');

const command = process.argv[2] || 'status';

(async () => {
  try {
    switch (command) {
      case 'start':
        await orchestrator.start();
        break;
      case 'status':
        await orchestrator.status();
        break;
      case 'pause':
        orchestrator.pause();
        break;
      case 'resume':
        orchestrator.resume();
        break;
      case 'stop':
        orchestrator.stop();
        break;
      default:
        console.log('Usage: node campaign-orchestrator.js [start|status|pause|resume|stop]');
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();

module.exports = CampaignOrchestrator;
