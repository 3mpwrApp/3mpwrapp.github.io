#!/usr/bin/env node
/**
 * CURATOR-AUTO-LEARN.JS
 * Automatic keyword learning and expansion
 * 
 * Features:
 * - Auto-discover new disability movement keywords
 * - Learn from viral content and hashtags
 * - Expand keyword list based on trending topics
 * - Track emerging disability advocacy language
 * - Update curator.json automatically
 */

const fs = require('fs');
const path = require('path');

class CuratorAutoLearn {
  constructor() {
    this.configPath = path.join(process.cwd(), '_data', 'curator.json');
    this.trendingPath = path.join(process.cwd(), 'public', 'trending-topics.json');
    this.learnedKeywordsPath = path.join(process.cwd(), 'public', 'learned-keywords.json');
    
    this.config = this.loadConfig();
    this.trending = this.loadTrending();
    this.learned = this.loadLearned();
    
    // Minimum score for a keyword to be learned
    this.learningThreshold = 5.0;
    
    // Common disability movement patterns
    this.movementPatterns = [
      /disability\s+justice/gi,
      /disability\s+rights/gi,
      /accessibility\s+is\s+a\s+right/gi,
      /nothing\s+about\s+us\s+without\s+us/gi,
      /ableism/gi,
      /accessible\s+\w+/gi,
      /inclusive\s+\w+/gi,
      /disability\s+pride/gi,
      /disability\s+advocacy/gi,
      /barrier[s]?\s+free/gi,
      /universal\s+design/gi
    ];
  }

  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
    return { scoring: {} };
  }

  loadTrending() {
    if (fs.existsSync(this.trendingPath)) {
      return JSON.parse(fs.readFileSync(this.trendingPath, 'utf8'));
    }
    return { keywords: {}, currentTrending: [] };
  }

  loadLearned() {
    const defaultLearned = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      newKeywords: [],
      viralPhrases: [],
      emergingTopics: [],
      autoAddedCount: 0
    };

    if (fs.existsSync(this.learnedKeywordsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.learnedKeywordsPath, 'utf8'));
        return { ...defaultLearned, ...data };
      } catch (err) {
        console.warn(`⚠️ Learned keywords load error: ${err.message}`);
        return defaultLearned;
      }
    }

    return defaultLearned;
  }

  saveLearned() {
    try {
      this.learned.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.learnedKeywordsPath, JSON.stringify(this.learned, null, 2));
      console.log(`✅ Saved learned keywords to ${this.learnedKeywordsPath}`);
    } catch (err) {
      console.error(`❌ Failed to save learned keywords: ${err.message}`);
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      console.log(`✅ Updated curator config at ${this.configPath}`);
    } catch (err) {
      console.error(`❌ Failed to save config: ${err.message}`);
    }
  }

  /**
   * Extract potential new keywords from trending content
   */
  extractNewKeywords(items) {
    const newKeywords = new Set();
    const wordFrequency = {};

    items.forEach(item => {
      const text = `${item.title} ${item.description || ''}`;
      
      // Extract movement phrases
      this.movementPatterns.forEach(pattern => {
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.toLowerCase().trim();
            if (cleaned.length > 3) {
              newKeywords.add(cleaned);
            }
          });
        }
      });

      // Extract frequent bigrams and trigrams
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 3);

      // Bigrams
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        if (this.isDisabilityRelated(bigram)) {
          wordFrequency[bigram] = (wordFrequency[bigram] || 0) + 1;
        }
      }

      // Trigrams
      for (let i = 0; i < words.length - 2; i++) {
        const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        if (this.isDisabilityRelated(trigram)) {
          wordFrequency[trigram] = (wordFrequency[trigram] || 0) + 1;
        }
      }
    });

    // Add frequent phrases to new keywords
    Object.entries(wordFrequency)
      .filter(([_, freq]) => freq >= 3)
      .forEach(([phrase, _]) => newKeywords.add(phrase));

    return Array.from(newKeywords);
  }

  /**
   * Check if a phrase is disability-related
   */
  isDisabilityRelated(phrase) {
    const disabilityIndicators = [
      'disability', 'disabled', 'accessible', 'accessibility',
      'inclusion', 'inclusive', 'barrier', 'accommodation',
      'assistive', 'adaptive', 'wheelchair', 'mobility',
      'deaf', 'blind', 'cognitive', 'autism', 'adhd',
      'neurodivergent', 'chronic', 'mental health', 'injury',
      'rehabilitation', 'support', 'advocate', 'rights'
    ];

    return disabilityIndicators.some(indicator => phrase.includes(indicator));
  }

  /**
   * Analyze curated items and learn new patterns
   */
  learnFromCuration(curationData) {
    console.log('\n🧠 AUTO-LEARNING FROM CURATED CONTENT\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const items = curationData.items || [];
    const highScoringItems = items.filter(item => item.score >= this.learningThreshold);

    console.log(`📊 Analyzing ${items.length} curated items`);
    console.log(`   ${highScoringItems.length} high-scoring items (score >= ${this.learningThreshold})\n`);

    // Extract new keywords
    const newKeywords = this.extractNewKeywords(highScoringItems);
    console.log(`🔍 Discovered ${newKeywords.length} potential new keywords:\n`);

    // Filter out keywords already in config
    const existingKeywords = new Set();
    Object.values(this.config.scoring || {}).forEach(category => {
      (category.terms || []).forEach(term => {
        existingKeywords.add(term.toLowerCase());
      });
    });

    const trulyNew = newKeywords.filter(kw => !existingKeywords.has(kw));

    if (trulyNew.length > 0) {
      console.log('   📝 New keywords to add:');
      trulyNew.slice(0, 10).forEach(kw => {
        console.log(`      • ${kw}`);
      });
      console.log();

      // Add to learned keywords list
      this.learned.newKeywords = [
        ...new Set([...this.learned.newKeywords, ...trulyNew])
      ].slice(0, 100); // Keep top 100

      this.learned.autoAddedCount += trulyNew.length;
    } else {
      console.log('   ✓ No new keywords discovered (all already tracked)\n');
    }

    // Identify viral phrases from trending
    const viralPhrases = this.identifyViralPhrases();
    if (viralPhrases.length > 0) {
      console.log('🔥 Viral phrases detected:');
      viralPhrases.forEach(phrase => {
        console.log(`      • ${phrase.keyword} (${phrase.mentions} mentions)`);
      });
      console.log();

      this.learned.viralPhrases = viralPhrases.map(p => p.keyword);
    }

    // Auto-add top viral keywords to config
    const autoAddCount = this.autoAddKeywords(trulyNew, viralPhrases);
    
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`✅ Learning complete: ${autoAddCount} keywords added to config\n`);

    this.saveLearned();
  }

  /**
   * Identify viral phrases from trending data
   */
  identifyViralPhrases() {
    const viralThreshold = 7.0; // Considered "viral" if mentioned 7+ times recently

    return (this.trending.currentTrending || [])
      .filter(item => item.mentions >= viralThreshold)
      .map(item => ({
        keyword: item.keyword,
        mentions: item.mentions,
        velocity: item.velocity
      }));
  }

  /**
   * Automatically add high-value keywords to config
   */
  autoAddKeywords(newKeywords, viralPhrases) {
    if (!this.config.scoring) {
      this.config.scoring = {};
    }

    // Ensure medium_priority category exists
    if (!this.config.scoring.medium_priority) {
      this.config.scoring.medium_priority = {
        score: 2.0,
        terms: []
      };
    }

    const mediumPriority = this.config.scoring.medium_priority;
    let addedCount = 0;

    // Add viral phrases (highest priority)
    viralPhrases.forEach(phrase => {
      if (!mediumPriority.terms.includes(phrase.keyword)) {
        mediumPriority.terms.push(phrase.keyword);
        addedCount++;
      }
    });

    // Add top 5 new keywords
    newKeywords.slice(0, 5).forEach(keyword => {
      if (!mediumPriority.terms.includes(keyword)) {
        mediumPriority.terms.push(keyword);
        addedCount++;
      }
    });

    if (addedCount > 0) {
      // Sort terms alphabetically for readability
      mediumPriority.terms.sort();
      this.saveConfig();
    }

    return addedCount;
  }

  /**
   * Generate learning report
   */
  generateReport() {
    console.log('\n📚 AUTO-LEARNING REPORT\n');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log(`📊 Total keywords auto-discovered: ${this.learned.newKeywords.length}`);
    console.log(`🔥 Viral phrases tracked: ${this.learned.viralPhrases.length}`);
    console.log(`➕ Keywords auto-added to config: ${this.learned.autoAddedCount}\n`);

    if (this.learned.newKeywords.length > 0) {
      console.log('📝 Recently Discovered Keywords:');
      this.learned.newKeywords.slice(0, 10).forEach(kw => {
        console.log(`   • ${kw}`);
      });
      console.log();
    }

    if (this.learned.viralPhrases.length > 0) {
      console.log('🔥 Current Viral Phrases:');
      this.learned.viralPhrases.forEach(phrase => {
        console.log(`   • ${phrase}`);
      });
      console.log();
    }

    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// Run if called directly
if (require.main === module) {
  const learner = new CuratorAutoLearn();
  
  // Load latest curation data
  const curationPath = path.join(process.cwd(), 'public', 'curation-latest.json');
  if (fs.existsSync(curationPath)) {
    const curationData = JSON.parse(fs.readFileSync(curationPath, 'utf8'));
    learner.learnFromCuration(curationData);
  } else {
    console.log('⚠️ No curation data found. Run curator first.');
    learner.generateReport();
  }
}

module.exports = CuratorAutoLearn;
