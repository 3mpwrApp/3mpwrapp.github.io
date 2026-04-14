#!/usr/bin/env node
/**
 * SOCIAL-QUEUE-PROCESSOR.JS
 * Reads social-queue.json and posts the next scheduled item
 * Compatible with existing post-daily-feature.js infrastructure
 * 
 * Usage: node scripts/social-queue-processor.js
 * Run via GitHub Actions or cron to process queue automatically
 */

const fs = require('fs');
const path = require('path');

class SocialQueueProcessor {
  constructor() {
    this.queuePath = path.join(process.cwd(), 'public', 'social-queue.json');
    this.resultsPath = path.join(process.cwd(), 'public', 'queue-posting-results.json');
    this.featureSocialPath = path.join(process.cwd(), 'public', 'daily-feature-social.json');
  }

  /**
   * Load queue data
   */
  loadQueue() {
    if (!fs.existsSync(this.queuePath)) {
      console.error('❌ Queue file not found:', this.queuePath);
      console.log('💡 Run: node scripts/social-queue-converter.js first');
      process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(this.queuePath, 'utf-8'));
    return data;
  }

  /**
   * Find next post to publish (by scheduled date/time)
   */
  getNextPost(queue) {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM

    // Find posts scheduled for today or earlier that haven't been posted
    const eligible = queue.filter(post => {
      if (post.posted) return false;
      
      // Post is due if:
      // 1. Scheduled date is today or earlier
      // 2. If scheduled for today, time must be current time or earlier
      const schedDate = post.scheduledDate;
      const schedTime = post.scheduledTime;

      if (schedDate < today) return true; // Past date - overdue
      if (schedDate === today && schedTime <= currentTime) return true; // Today, time passed
      return false;
    });

    if (eligible.length === 0) {
      console.log('✅ No posts due at this time');
      console.log(`   Current: ${today} ${currentTime}`);
      const nextPost = queue.find(p => !p.posted);
      if (nextPost) {
        console.log(`   Next: ${nextPost.scheduledDate} ${nextPost.scheduledTime} - ${nextPost.feature}`);
      }
      return null;
    }

    // Sort by date/time, return earliest
    eligible.sort((a, b) => {
      const aDateTime = `${a.scheduledDate}T${a.scheduledTime}`;
      const bDateTime = `${b.scheduledDate}T${b.scheduledTime}`;
      return aDateTime.localeCompare(bDateTime);
    });

    return eligible[0];
  }

  /**
   * Convert queue post to daily-feature-social.json format
   * (so post-daily-feature.js can post it)
   */
  convertToFeatureFormat(post) {
    const featureData = {
      feature: post.feature,
      date: post.scheduledDate,
      shortPost: post.content.substring(0, 280), // Bluesky limit
      longPost: post.content, // Full post
      url: post.url,
      hashtags: post.hashtags || [],
      generated: new Date().toISOString(),
      sourceType: 'social-queue',
      queueId: post.id
    };

    fs.writeFileSync(this.featureSocialPath, JSON.stringify(featureData, null, 2), 'utf-8');
    console.log('📝 Converted to daily-feature-social.json format');
    return featureData;
  }

  /**
   * Mark post as published in queue
   */
  markPosted(queueData, postId) {
    const post = queueData.queue.find(p => p.id === postId);
    if (post) {
      post.posted = true;
      post.postedAt = new Date().toISOString();
    }

    fs.writeFileSync(this.queuePath, JSON.stringify(queueData, null, 2), 'utf-8');
    console.log('✅ Marked as posted in queue');
  }

  /**
   * Save posting result
   */
  saveResult(post, success, error = null) {
    const results = fs.existsSync(this.resultsPath)
      ? JSON.parse(fs.readFileSync(this.resultsPath, 'utf-8'))
      : { history: [] };

    results.history.push({
      id: post.id,
      feature: post.feature,
      scheduledDate: post.scheduledDate,
      scheduledTime: post.scheduledTime,
      postedAt: new Date().toISOString(),
      success,
      error: error || null
    });

    // Keep last 100 results
    if (results.history.length > 100) {
      results.history = results.history.slice(-100);
    }

    fs.writeFileSync(this.resultsPath, JSON.stringify(results, null, 2), 'utf-8');
    console.log('💾 Result saved');
  }

  /**
   * Process queue (main workflow)
   */
  async process() {
    console.log('🔄 Processing social queue...\n');

    // Load queue
    const queueData = this.loadQueue();
    console.log(`📋 Queue loaded: ${queueData.queue.length} total posts`);
    const unposted = queueData.queue.filter(p => !p.posted).length;
    console.log(`   ${unposted} unposted, ${queueData.queue.length - unposted} already posted\n`);

    // Get next post
    const nextPost = this.getNextPost(queueData.queue);
    if (!nextPost) {
      console.log('🎉 Queue processing complete (no posts due now)');
      return;
    }

    console.log(`📤 Posting: ${nextPost.feature}`);
    console.log(`   Scheduled: ${nextPost.scheduledDate} ${nextPost.scheduledTime}`);
    console.log(`   Platforms: ${nextPost.platforms.join(', ')}\n`);

    try {
      // Convert to daily-feature format
      this.convertToFeatureFormat(nextPost);

      // Now post-daily-feature.js can be called to handle actual posting
      console.log('🚀 Ready for post-daily-feature.js to post');
      console.log('   Run: node scripts/post-daily-feature.js');
      console.log('   Or: This will be called automatically by GitHub Actions\n');

      // Mark as posted
      this.markPosted(queueData, nextPost.id);

      // Save success result
      this.saveResult(nextPost, true);

      console.log('✅ Queue processing successful!');
    } catch (error) {
      console.error('❌ Error:', error.message);
      this.saveResult(nextPost, false, error.message);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const processor = new SocialQueueProcessor();
  processor.process().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = SocialQueueProcessor;
