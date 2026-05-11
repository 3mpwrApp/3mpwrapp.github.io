#!/usr/bin/env node

/**
 * Priority-Based Ontario Refetch - v5.0 Enhanced
 * 
 * PURPOSE: Refetch Ontario cases in priority order (Unknown outcomes first)
 * METHOD: Uses priority queue, fetches full HTML, extracts outcomes
 * RESUMABLE: Saves progress, continues where it left off
 * 
 * QUOTA-FRIENDLY:
 * - Processes high priority first (Unknown + medical evidence)
 * - Random 0.8-1.5s delays
 * - Stops gracefully on quota exceeded
 * - Resumes automatically on next run
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

// ============================================================
// Configuration
// ============================================================

const API_KEY = process.env.CANLII_API_KEY;
const API_BASE = 'https://api.canlii.org/v1';
const LANG = 'en';

// Safety configuration
const MIN_DELAY = 800;
const MAX_DELAY = 1500;

// Processing limits
const MAX_PER_SESSION = 500; // Max cases per run (quota safety)

// File paths
const QUEUE_FILE = path.join(ROOT, 'data', '.refetch-priority-queue.json');
const SOURCE_FILE = path.join(ROOT, 'data/tribunal-decisions/ontario-local-enhanced-20260406.json');
const OUTPUT_FILE = path.join(ROOT, `data/tribunal-decisions/ontario-refetched-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`);
const CACHE_DIR = path.join(ROOT, 'data', '.scraper-cache');
const ERROR_LOG = path.join(ROOT, 'data', '.refetch-errors.jsonl');

// ============================================================
// Extraction Functions (v5.0 Enhanced)
// ============================================================

function extractCondition(text) {
  const patterns = [
    { name: 'chronic pain', pattern: /\bchronic pain\b/gi },
    { name: 'fibromyalgia', pattern: /\bfibromyalgia\b/gi },
    { name: 'PTSD', pattern: /\b(?:ptsd|post-traumatic stress)\b/gi },
    { name: 'back injury', pattern: /\b(?:back injury|spinal injury|herniated disc)\b/gi },
    { name: 'depression', pattern: /\b(?:depression|depressive disorder)\b/gi },
    { name: 'anxiety', pattern: /\b(?:anxiety|anxiety disorder)\b/gi },
    { name: 'arthritis', pattern: /\barthritis\b/gi },
    { name: 'chronic fatigue', pattern: /\bchronic fatigue\b/gi },
    { name: 'MS', pattern: /\b(?:multiple sclerosis|MS)\b/gi },
    { name: 'carpal tunnel', pattern: /\bcarpal tunnel\b/gi },
    { name: 'tendinitis', pattern: /\btendinitis\b/gi }
  ];

  const found = [];
  for (const { name, pattern } of patterns) {
    if (pattern.test(text)) found.push(name);
  }

  return found.length > 0 ? found.join(', ') : 'Unknown';
}

function extractOutcomeWithConfidence(text) {
  let outcome = 'Unknown';
  let confidence = 0;

  if (/\bappeal\s+is\s+(?:hereby\s+)?allowed\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = 90;
  } else if (/\bappeal\s+is\s+(?:hereby\s+)?dismissed\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = 90;
  } else if (/\bentitlement\s+(?:is\s+)?granted\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = 80;
  } else if (/\bentitlement\s+(?:is\s+)?denied\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = 80;
  } else if (/\bbenefits?\s+(?:are\s+)?granted\b/i.test(text)) {
    outcome = 'Allowed';
    confidence = 75;
  } else if (/\bbenefits?\s+(?:are\s+)?denied\b/i.test(text)) {
    outcome = 'Dismissed';
    confidence = 75;
  }

  // Boost confidence if multiple indicators
  if (confidence > 0) {
    const indicators = [
      /\b(?:find|conclude|determine)s?\s+that\b/i,
      /\bfor\s+the\s+(?:foregoing|above)\s+reasons\b/i,
      /\baccordingly\b/i
    ];
    const boosts = indicators.filter(p => p.test(text)).length;
    confidence = Math.min(95, confidence + (boosts * 2));
  }

  return { outcome, confidence };
}

function extractJudgeReasoning(text) {
  const patterns = [
    /(?:REASONS?|ANALYSIS|DISCUSSION):?\s+([\s\S]{500,3000}?(?:\n\n|\n(?=[A-Z]{3,})))/i,
    /(?:The panel|The court|The tribunal)\s+(?:find|conclude)s?\s+that\s+([\s\S]{200,1000}?\.)/gi,
    /(?:After\s+reviewing|Having\s+considered)\s+(?:the\s+)?(?:evidence|submissions)\s*,?\s+([\s\S]{200,1000}?\.)/gi
  ];

  const sections = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 100) {
        sections.push(match[1].trim().substring(0, 500) + '...');
        if (sections.length >= 3) break;
      }
    }
    if (sections.length >= 3) break;
  }
  
  return sections;
}

function extractCitedCaseLaw(text) {
  const pattern = /\b(\d{4}\s+(?:ONWSIAT|ONCA|CanLII|SCC|FC|FCA)\s+\d+)\b/gi;
  const matches = Array.from(text.matchAll(pattern));
  const unique = [...new Set(matches.map(m => m[1]))];
  return unique.slice(0, 10);
}

function extractWinningArguments(text, outcome) {
  if (outcome === 'Unknown') return [];

  const patterns = [
    /(?:The\s+evidence\s+demonstrates?|The\s+evidence\s+shows?)\s+([\s\S]{100,500}?\.)/gi,
    /(?:The\s+worker\s+has\s+established|The\s+appellant\s+has\s+shown)\s+([\s\S]{100,500}?\.)/gi,
    /(?:I\s+am\s+satisfied\s+that|I\s+find\s+that)\s+([\s\S]{100,500}?\.)/gi
  ];

  const winningArgs = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].trim().length > 50) {
        winningArgs.push(match[1].trim());
        if (winningArgs.length >= 5) break;
      }
    }
    if (winningArgs.length >= 5) break;
  }

  return winningArgs;
}

function extractMedicalEvidence(text) {
  const evidence = {
    reports: [],
    tests: [],
    specialists: []
  };

  const reportPatterns = /\b(ime|FCE|specialist\s+report|medical\s+report|assessment\s+report|psychiatric\s+assessment)\b/gi;
  const reportMatches = Array.from(text.matchAll(reportPatterns));
  evidence.reports = [...new Set(reportMatches.map(m => m[1].toLowerCase()))];

  const testPatterns = /\b(MRI|CT\s+scan|x-ray|ultrasound|EMG|nerve\s+conduction)\b/gi;
  const testMatches = Array.from(text.matchAll(testPatterns));
  evidence.tests = [...new Set(testMatches.map(m => m[1].toUpperCase()))];

  const specialistPatterns = /\b(orthopedic\s+surgeon|psychiatrist|psychologist|neurologist|physiatrist|pain\s+specialist)\b/gi;
  const specialistMatches = Array.from(text.matchAll(specialistPatterns));
  evidence.specialists = [...new Set(specialistMatches.map(m => m[1].toLowerCase()))];

  return evidence;
}

function calculateQualityScore(decision) {
  let score = 0;

  if (decision.outcome !== 'Unknown') {
    score += decision.outcome_confidence * 0.3;
  }

  if (decision.condition && decision.condition !== 'Unknown') {
    score += 15;
  }

  if (decision.judge_reasoning && decision.judge_reasoning.length > 0) {
    score += Math.min(20, decision.judge_reasoning.length * 7);
  }

  if (decision.cited_case_law && decision.cited_case_law.length > 0) {
    score += Math.min(15, decision.cited_case_law.length * 2);
  }

  const medEvidence = decision.medical_evidence;
  if (medEvidence) {
    const hasReports = medEvidence.reports && medEvidence.reports.length > 0;
    const hasTests = medEvidence.tests && medEvidence.tests.length > 0;
    const hasSpecialists = medEvidence.specialists && medEvidence.specialists.length > 0;
    score += (hasReports ? 4 : 0) + (hasTests ? 3 : 0) + (hasSpecialists ? 3 : 0);
  }

  return Math.round(Math.min(100, score));
}

// ============================================================
// Utility Functions
// ============================================================

function randomDelay() {
  return MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logError(context, error) {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({ timestamp, context, error: error.message }) + '\n';
  fs.appendFileSync(ERROR_LOG, logEntry);
}

function getCachedCase(caseId) {
  const cacheFile = path.join(CACHE_DIR, `${caseId}.json`);
  if (fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    const age = Date.now() - new Date(cached.cached_at).getTime();
    if (age < 30 * 24 * 60 * 60 * 1000) {
      return cached.data;
    }
  }
  return null;
}

function cacheCase(caseId, data) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
  const cacheFile = path.join(CACHE_DIR, `${caseId}.json`);
  fs.writeFileSync(cacheFile, JSON.stringify({
    cached_at: new Date().toISOString(),
    data
  }));
}

// ============================================================
// API Functions
// ============================================================

async function fetchCaseHTML(database, caseId) {
  const cached = getCachedCase(caseId);
  if (cached) {
    return cached;
  }

  const url = `${API_BASE}/caseBrowse/${LANG}/${database}/${caseId}?api_key=${API_KEY}`;
  
  try {
    await sleep(randomDelay());
    
    const response = await fetch(url);
    
    if (response.status === 429) {
      return { error: 'quota_exceeded' };
    }
    
    if (!response.ok) {
      return { error: `http_${response.status}` };
    }
    
    const html = await response.text();
    cacheCase(caseId, html);
    
    return html;
  } catch (error) {
    logError({ action: 'fetchCaseHTML', database, caseId }, error);
    return { error: error.message };
  }
}

async function processCase(caseId, existingData) {
  const database = caseId.match(/^\d{4}(\w+)\d+$/)?.[1] || 'onwsiat';
  
  const html = await fetchCaseHTML(database, caseId);
  
  if (html?.error === 'quota_exceeded') {
    return { error: 'quota_exceeded' };
  }
  
  if (html?.error) {
    return { error: html.error };
  }
  
  // Extract text from HTML
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  // Extract data
  const { outcome, confidence } = extractOutcomeWithConfidence(text);
  const condition = extractCondition(text);
  const judge_reasoning = extractJudgeReasoning(text);
  const cited_case_law = extractCitedCaseLaw(text);
  const winning_arguments = extractWinningArguments(text, outcome);
  const medical_evidence = extractMedicalEvidence(text);
  
  const enhanced = {
    ...existingData,
    full_text_extracted: true,
    extraction_version: 'v5.0-enhanced-priority',
    outcome,
    outcome_confidence: confidence,
    condition,
    judge_reasoning,
    cited_case_law,
    winning_arguments,
    medical_evidence,
    quality_score: 0
  };
  
  enhanced.quality_score = calculateQualityScore(enhanced);
  
  return enhanced;
}

// ============================================================
// Main Processing
// ============================================================

async function refetchPriority() {
  console.log('\n============================================================');
  console.log('🎯 Priority-Based Ontario Refetch - v5.0 Enhanced');
  console.log('============================================================\n');
  
  // Load priority queue
  if (!fs.existsSync(QUEUE_FILE)) {
    console.log('❌ Priority queue not found');
    console.log('💡 Run: node scripts/create-refetch-priority-queue.js first\n');
    process.exit(1);
  }
  
  const queue = JSON.parse(fs.readFileSync(QUEUE_FILE, 'utf8'));
  console.log('✅ Priority queue loaded');
  console.log(`  🔴 High priority: ${queue.high_priority.length - queue.progress.high_completed}`);
  console.log(`  🟡 Medium priority: ${queue.medium_priority.length - queue.progress.medium_completed}`);
  console.log(`  🟢 Low priority: ${queue.low_priority.length - queue.progress.low_completed}\n`);
  
  // Load source data
  const sourceCases = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const caseMap = new Map(sourceCases.map(c => [c.case_id, c]));
  
  // Build processing queue (priority order)
  const toProcess = [
    ...queue.high_priority.slice(queue.progress.high_completed),
    ...queue.medium_priority.slice(queue.progress.medium_completed),
    ...queue.low_priority.slice(queue.progress.low_completed)
  ].slice(0, MAX_PER_SESSION);
  
  console.log(`📊 Processing up to ${MAX_PER_SESSION} cases this session`);
  console.log(`🎯 Starting with ${Math.min(toProcess.length, MAX_PER_SESSION)} cases\n`);
  
  const enhanced = [...sourceCases]; // Start with all existing data
  let processed = 0;
  let quotaExceeded = false;
  let highCompleted = queue.progress.high_completed;
  let mediumCompleted = queue.progress.medium_completed;
  let lowCompleted = queue.progress.low_completed;
  
  for (const caseId of toProcess) {
    const existingData = caseMap.get(caseId);
    if (!existingData) continue;
    
    const result = await processCase(caseId, existingData);
    
    if (result.error === 'quota_exceeded') {
      quotaExceeded = true;
      console.log(`\n❌ API quota exceeded`);
      break;
    }
    
    if (result.error) {
      console.log(`  ⚠️  Error ${caseId}: ${result.error}`);
      continue;
    }
    
    // Update in enhanced array
    const index = enhanced.findIndex(c => c.case_id === caseId);
    if (index !== -1) {
      enhanced[index] = result;
    }
    
    processed++;
    
    // Update progress counters
    if (queue.high_priority.includes(caseId)) highCompleted++;
    else if (queue.medium_priority.includes(caseId)) mediumCompleted++;
    else if (queue.low_priority.includes(caseId)) lowCompleted++;
    
    if (processed % 10 === 0) {
      console.log(`  Progress: ${processed}/${toProcess.length} (${Math.round(processed/toProcess.length*100)}%)`);
      
      // Save progress
      queue.progress.high_completed = highCompleted;
      queue.progress.medium_completed = mediumCompleted;
      queue.progress.low_completed = lowCompleted;
      queue.progress.last_updated = new Date().toISOString();
      fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
    }
  }
  
  // Final save
  queue.progress.high_completed = highCompleted;
  queue.progress.medium_completed = mediumCompleted;
  queue.progress.low_completed = lowCompleted;
  queue.progress.last_updated = new Date().toISOString();
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
  
  // Save enhanced data
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enhanced, null, 2));
  
  console.log('\n============================================================');
  console.log('✅ Priority Refetch Complete!');
  console.log('============================================================\n');
  
  // Statistics
  const stats = {
    processed: processed,
    quota_exceeded: quotaExceeded,
    high_completed: highCompleted,
    high_remaining: queue.high_priority.length - highCompleted,
    medium_completed: mediumCompleted,
    medium_remaining: queue.medium_priority.length - mediumCompleted,
    low_completed: lowCompleted,
    low_remaining: queue.low_priority.length - lowCompleted,
    with_outcomes: enhanced.filter(c => c.outcome !== 'Unknown').length,
    avg_quality: Math.round(enhanced.reduce((sum, c) => sum + (c.quality_score || 0), 0) / enhanced.length)
  };
  
  console.log(`📊 Session Statistics:`);
  console.log(`  Processed: ${stats.processed} cases`);
  console.log(`  🔴 High: ${stats.high_completed}/${queue.high_priority.length} (${stats.high_remaining} remaining)`);
  console.log(`  🟡 Medium: ${stats.medium_completed}/${queue.medium_priority.length} (${stats.medium_remaining} remaining)`);
  console.log(`  🟢 Low: ${stats.low_completed}/${queue.low_priority.length} (${stats.low_remaining} remaining)`);
  console.log(`  Total with outcomes: ${stats.with_outcomes}`);
  console.log(`  Average quality: ${stats.avg_quality}/100\n`);
  
  if (stats.high_remaining + stats.medium_remaining + stats.low_remaining > 0) {
    console.log(`🔄 ${stats.high_remaining + stats.medium_remaining + stats.low_remaining} cases remaining`);
    console.log(`💡 Run again after quota resets (8 PM ET / Midnight UTC)\n`);
  } else {
    console.log(`🎉 All cases refetched!\n`);
  }
  
  return stats;
}

// ============================================================
// Entry Point
// ============================================================

if (!API_KEY) {
  console.log('❌ CANLII_API_KEY not set');
  console.log('💡 Set it with: $env:CANLII_API_KEY = "your_key_here"');
  process.exit(1);
}

refetchPriority().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
