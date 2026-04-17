#!/usr/bin/env node
/**
 * Fetch Full Decision Text - Subset Validation (Playwright Version)
 * 
 * Purpose: Validate blog post statistics by fetching full text for flagged cases
 * 
 * Strategy:
 * 1. Load analysis results (retaliation-patterns-analysis.json)
 * 2. Find all cases with ANY positive flag (termination, coercion, discipline, etc.)
 * 3. Fetch full decision text from CanLII URLs using Playwright (real browser)
 * 4. Re-run keyword analysis on full text
 * 5. Calculate multiplier: full-text % / keywords-only %
 * 6. Extrapolate to full dataset
 * 
 * Expected results:
 * - Keywords-only: 71 termination (0.62%)
 * - Full-text subset: ~100 cases → validate if blog's 8.7% is accurate
 * - Multiplier: Should be ~14x (8.7% / 0.62%)
 * 
 * Time estimate: 798 cases × 5 seconds = ~66 minutes (Playwright is slower but reliable)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data', 'tribunal-decisions');
const ANALYSIS_DIR = path.join(ROOT_DIR, 'data', 'analysis');

// Keywords from original analysis script
const KEYWORDS = {
  termination: [
    'terminated', 'termination', 'dismissal', 'dismissed', 'discharge', 'discharged',
    'fired', 'firing', 'laid off', 'layoff', 'employment ended', 'separation',
    'let go', 'job loss', 'lost employment'
  ],
  discipline: [
    'discipline', 'disciplinary', 'disciplined', 'reprimand', 'warning',
    'written warning', 'suspension', 'suspended', 'progressive discipline'
  ],
  retaliation: [
    'retaliation', 'retaliatory', 'retaliate', 'reprisal', 'revenge',
    'punish', 'punished', 'punishment'
  ],
  coercion: [
    'coercion', 'coerce', 'coerced', 'pressure', 'pressured', 'intimidation',
    'intimidate', 'intimidated', 'threaten', 'threatened', 'threat'
  ],
  privacy_violation: [
    'privacy', 'surveillance', 'monitoring', 'investigation', 'investigated',
    'private information', 'medical information', 'confidential'
  ],
  exclusion: [
    'decision of employer', 'decision of the employer', 'employer\'s decision',
    'employer decision', 'labour relations', 'labour dispute', 'collective agreement'
  ],
  mental_stress: [
    'mental stress', 'chronic stress', 'psychological', 'anxiety', 'depression',
    'ptsd', 'post-traumatic', 'harassment', 'workplace stress'
  ]
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function searchKeywords(text, keywords) {
  const lowerText = text.toLowerCase();
  return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

async function fetchDecisionHTML(page, url) {
  try {
    // Add MUCH longer random delay to avoid detection (5-10 seconds)
    // This is more human-like browsing speed
    const delay = 5000 + Math.random() * 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Check if we hit a CAPTCHA during scraping
    const hasCaptcha = await page.$('iframe[title*="CAPTCHA"], iframe[src*="captcha"]');
    const hasRestriction = await page.content().then(c => c.includes('Access is temporarily restricted'));
    
    if (hasCaptcha || hasRestriction) {
      console.log('\n\n⚠️  ========================================');
      console.log('⚠️  CAPTCHA DETECTED DURING SCRAPING!');
      console.log('⚠️  Please solve the CAPTCHA in the browser.');
      console.log('⚠️  ========================================\n');
      
      // Wait for CAPTCHA to be solved
      let captchaSolved = false;
      let attempts = 0;
      
      while (!captchaSolved && attempts < 120) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const stillBlocked = await page.content().then(c => c.includes('Access is temporarily restricted')).catch(() => true);
        const stillHasCaptcha = await page.$('iframe[title*="CAPTCHA"], iframe[src*="captcha"]').catch(() => null);
        
        if (!stillBlocked && !stillHasCaptcha) {
          captchaSolved = true;
          console.log('\n✅ CAPTCHA solved! Resuming scraping...\n');
          
          // Re-navigate to the current URL after solving
          await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        } else {
          attempts++;
          if (attempts % 10 === 0) {
            console.log(`   Still waiting for CAPTCHA... (${attempts * 3}s)`);
          }
        }
      }
      
      if (!captchaSolved) {
        console.log('\n❌ Timeout waiting for CAPTCHA.');
        return null;
      }
    }
    
    // Wait for decision content to load
    await page.waitForSelector('.documentcontent, #decisionbody', { timeout: 5000 }).catch(() => {});
    
    const html = await page.content();
    
    return html;
  } catch (error) {
    console.log(`    ⚠️  Fetch failed: ${error.message}`);
    return null;
  }
}

function extractDecisionText(html) {
  if (!html) return '';
  
  // CanLII decision text is in <div class="documentcontent">
  const match = html.match(/<div[^>]*class="documentcontent"[^>]*>(.*?)<\/div>/is);
  if (!match) {
    // Try alternate structure
    const altMatch = html.match(/<div[^>]*id="decisionbody"[^>]*>(.*?)<\/div>/is);
    if (altMatch) return stripHTML(altMatch[1]);
    return '';
  }
  
  return stripHTML(match[1]);
}

function stripHTML(html) {
  // Remove script/style tags completely
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  
  // Replace common HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Collapse multiple spaces
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

function analyzeFullText(fullText) {
  return {
    termination: searchKeywords(fullText, KEYWORDS.termination),
    discipline: searchKeywords(fullText, KEYWORDS.discipline),
    retaliation: searchKeywords(fullText, KEYWORDS.retaliation),
    coercion: searchKeywords(fullText, KEYWORDS.coercion),
    privacy_violation: searchKeywords(fullText, KEYWORDS.privacy_violation),
    exclusion: searchKeywords(fullText, KEYWORDS.exclusion),
    mental_stress: searchKeywords(fullText, KEYWORDS.mental_stress)
  };
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx];
    });
    rows.push(row);
  }
  
  return rows;
}

async function main() {
  console.log('🔍 Full-Text Validation - Subset Analysis');
  console.log('==========================================\n');
  
  // Load analysis results from CSV
  console.log('📂 Loading analysis results...');
  const csvPath = path.join(ANALYSIS_DIR, 'retaliation-patterns.csv');
  const csvText = await fs.readFile(csvPath, 'utf-8');
  const allCasesAnalysis = parseCSV(csvText);
  
  console.log(`✅ Loaded analysis for ${allCasesAnalysis.length} cases\n`);
  
  // Load JSON for summary stats
  const jsonPath = path.join(ANALYSIS_DIR, 'retaliation-patterns-analysis.json');
  const summaryData = JSON.parse(await fs.readFile(jsonPath, 'utf-8'));
  
  // Filter to flagged cases
  console.log('🔎 Filtering to flagged cases...');
  const flaggedCases = allCasesAnalysis.filter(c => 
    c.has_termination === '1' || c.has_discipline === '1' || c.has_retaliation === '1' || 
    c.has_coercion === '1' || c.has_privacy_violation === '1' || c.has_exclusion === '1' || 
    c.has_mental_stress === '1'
  );
  
  console.log(`✅ Found ${flaggedCases.length} flagged cases\n`);
  console.log('Breakdown:');
  console.log(`  Termination: ${flaggedCases.filter(c => c.has_termination === '1').length}`);
  console.log(`  Discipline: ${flaggedCases.filter(c => c.has_discipline === '1').length}`);
  console.log(`  Coercion: ${flaggedCases.filter(c => c.has_coercion === '1').length}`);
  console.log(`  Privacy: ${flaggedCases.filter(c => c.has_privacy_violation === '1').length}`);
  console.log(`  Mental Stress: ${flaggedCases.filter(c => c.has_mental_stress === '1').length}\n`);
  
  // Load original WSIAT data to get URLs
  console.log('📂 Loading WSIAT data to get URLs...');
  const yearFiles = [
    'onwsiat-2020-ultra-slow.json',
    'onwsiat-2021-ultra-slow.json',
    'onwsiat-2022-ultra-slow.json',
    'onwsiat-2023-ultra-slow.json',
    'onwsiat-2024-ultra-slow.json',
    'onwsiat-2025-ultra-slow.json',
    'onwsiat-2026-ultra-slow.json'
  ];
  
  const allCases = [];
  for (const file of yearFiles) {
    try {
      const filePath = path.join(DATA_DIR, file);
      const rawData = await fs.readFile(filePath, 'utf-8');
      const yearCases = JSON.parse(rawData);
      allCases.push(...yearCases);
    } catch (error) {
      console.log(`  ⚠️  ${file} not found, skipping...`);
    }
  }
  
  console.log(`✅ Loaded ${allCases.length} cases with URLs\n`);
  
  // Create lookup map
  const caseMap = new Map();
  for (const caseObj of allCases) {
    const data = caseObj.data || caseObj;
    const caseId = data.caseId || caseObj.caseId || data.concatenatedId;
    caseMap.set(caseId, data);
  }
  
  // Launch Playwright browser with anti-detection features
  console.log('🌐 Launching browser (manual CAPTCHA mode)...');
  console.log('   A browser window will open. If you see a CAPTCHA, solve it manually.\n');
  
  const browser = await chromium.launch({ 
    headless: false,  // Non-headless for manual CAPTCHA solving
    channel: 'chrome', // Use real Chrome instead of Chromium
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--disable-web-security'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    // Additional anti-detection
    extraHTTPHeaders: {
      'Accept-Language': 'en-CA,en-US;q=0.9,en;q=0.8',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
    }
  });
  
  // Remove automation indicators
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });
  
  const page = await context.newPage();
  
  // Navigate to first case and wait for manual CAPTCHA solving if needed (only if not resuming)
  if (startIndex === 0) {
    const firstCase = flaggedCases[0];
    const firstCaseData = caseMap.get(firstCase.case_id);
    
    if (firstCaseData && firstCaseData.url) {
      console.log('🔒 Testing first URL for CAPTCHA...');
      console.log(`   URL: ${firstCaseData.url}`);
    
    await page.goto(firstCaseData.url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Give page extra time to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if CAPTCHA is present
    const hasCaptcha = await page.$('iframe[title*="CAPTCHA"], iframe[src*="captcha"]');
    
    if (hasCaptcha) {
      console.log('\n⚠️  CAPTCHA DETECTED!');
      console.log('   Please solve the CAPTCHA in the browser window.');
      console.log('   The script will automatically continue when you do.\n');
      
      // Wait for CAPTCHA to be solved (check for navigation)
      let captchaSolved = false;
      let attempts = 0;
      
      while (!captchaSolved && attempts < 120) {  // 120 attempts = 4 minutes max
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          // Check if decision content has appeared (CAPTCHA successfully solved)
          const hasDecisionContent = await page.$('.documentcontent, #decisionbody, .decision-content').catch(() => null);
          const pageTitle = await page.title().catch(() => '');
          const hasValidTitle = pageTitle.includes('ONWSIAT') || pageTitle.includes('CanLII');
          
          if (hasDecisionContent || hasValidTitle) {
            captchaSolved = true;
            console.log('\n✅ CAPTCHA solved! Continuing with scraping...\n');
          } else {
            attempts++;
            if (attempts % 5 === 0) {
              console.log(`   Still waiting... (${attempts * 2}s) - Looking for decision content...`);
            }
          }
        } catch (error) {
          // Page might be navigating, keep waiting
          attempts++;
          if (attempts % 5 === 0) {
            console.log(`   Still waiting... (${attempts * 2}s) - ${error.message}`);
          }
        }
      }
      
      if (!captchaSolved) {
        console.log('\n❌ Timeout waiting for CAPTCHA. Please try again.');
        await browser.close();
        return;
      }
    } else {
      console.log('✅ No CAPTCHA detected!\n');
    }
  }  // End of if (startIndex === 0)
  
  console.log('✅ Browser ready\n');
  
  // Fetch full text for flagged cases
  console.log('📥 Fetching full decision text...');
  console.log(`   Processing ${flaggedCases.length} flagged cases...`);
  console.log(`   Estimated time: ~${Math.round(flaggedCases.length * 7.5 / 60)} minutes (with 5-10s delays to avoid CAPTCHA)`);
  console.log(`   Progress saved every 20 cases to: full-text-subset-validation-progress.json\n`);
  
  // Try to load previous progress
  let enrichedCases = [];
  let startIndex = 0;
  try {
    const progressData = await fs.readFile(path.join(ANALYSIS_DIR, 'full-text-subset-validation-progress.json'), 'utf-8');
    const progress = JSON.parse(progressData);
    enrichedCases = progress.enrichedCases || [];
    startIndex = enrichedCases.length;
    if (startIndex > 0) {
      console.log(`📂 Resuming from previous progress: ${startIndex} cases already processed\n`);
    }
  } catch (error) {
    // No previous progress, start fresh
  }
  
  let fetchedCount = startIndex;
  let failedCount = 0;
  
  for (let i = startIndex; i < flaggedCases.length; i++) {
    const flaggedCase = flaggedCases[i];
    const originalData = caseMap.get(flaggedCase.case_id);
    
    if (!originalData || !originalData.url) {
      console.log(`  ⚠️  No URL for ${flaggedCase.case_id}, skipping...`);
      failedCount++;
      continue;
    }
    
    console.log(`  [${i+1}/${flaggedCases.length}] Fetching ${flaggedCase.citation}...`);
    console.log(`     URL: ${originalData.url}`);
    
    const html = await fetchDecisionHTML(page, originalData.url);
    
    if (html) {
      const fullText = extractDecisionText(html);
      
      if (fullText.length > 0) {
        // Re-run analysis on full text
        const fullTextAnalysis = analyzeFullText(fullText);
        
        enrichedCases.push({
          case_id: flaggedCase.case_id,
          citation: flaggedCase.citation,
          decision_date: flaggedCase.decision_date,
          url: originalData.url,
          
          // Keywords-only analysis (original)
          keywords_analysis: {
            termination: flaggedCase.has_termination === '1',
            discipline: flaggedCase.has_discipline === '1',
            retaliation: flaggedCase.has_retaliation === '1',
            coercion: flaggedCase.has_coercion === '1',
            privacy_violation: flaggedCase.has_privacy_violation === '1',
            exclusion: flaggedCase.has_exclusion === '1',
            mental_stress: flaggedCase.has_mental_stress === '1'
          },
          
          // Full-text analysis (new)
          fulltext_analysis: fullTextAnalysis,
          
          // Metadata
          fulltext_length: fullText.length,
          keywords_length: (originalData.keywords || '').length
        });
        
        fetchedCount++;
        console.log(`     ✅ Success (${fullText.length} chars)`);
        
        // Save progress every 20 cases
        if (enrichedCases.length % 20 === 0) {
          const progressData = {
            enrichedCases,
            timestamp: new Date().toISOString(),
            lastProcessedIndex: i
          };
          await fs.writeFile(
            path.join(ANALYSIS_DIR, 'full-text-subset-validation-progress.json'),
            JSON.stringify(progressData, null, 2),
            'utf-8'
          );
          console.log(`     💾 Progress saved (${enrichedCases.length} cases)`);
        }
      } else {
        console.log(`     ⚠️  No decision text found in HTML`);
        failedCount++;
      }
    } else {
      failedCount++;
    }
    
    // Puppeteer navigation includes natural delays, no artificial sleep needed
  }
  
  console.log(`\n✅ Fetched ${fetchedCount} cases, ${failedCount} failed\n`);
  
  // Final progress save
  const progressData = {
    enrichedCases,
    timestamp: new Date().toISOString(),
    completed: true
  };
  await fs.writeFile(
    path.join(ANALYSIS_DIR, 'full-text-subset-validation-progress.json'),
    JSON.stringify(progressData, null, 2),
    'utf-8'
  );
  console.log(`💾 Final progress saved (${enrichedCases.length} cases)\n`);
  
  // Close browser
  await browser.close();
  console.log('🌐 Browser closed\n');
  
  // Calculate multipliers
  console.log('📊 CALCULATING MULTIPLIERS');
  console.log('==========================\n');
  
  const keywordsOnlyCounts = {
    termination: enrichedCases.filter(c => c.keywords_analysis.termination).length,
    discipline: enrichedCases.filter(c => c.keywords_analysis.discipline).length,
    retaliation: enrichedCases.filter(c => c.keywords_analysis.retaliation).length,
    coercion: enrichedCases.filter(c => c.keywords_analysis.coercion).length,
    privacy_violation: enrichedCases.filter(c => c.keywords_analysis.privacy_violation).length,
    exclusion: enrichedCases.filter(c => c.keywords_analysis.exclusion).length,
    mental_stress: enrichedCases.filter(c => c.keywords_analysis.mental_stress).length
  };
  
  const fullTextCounts = {
    termination: enrichedCases.filter(c => c.fulltext_analysis.termination).length,
    discipline: enrichedCases.filter(c => c.fulltext_analysis.discipline).length,
    retaliation: enrichedCases.filter(c => c.fulltext_analysis.retaliation).length,
    coercion: enrichedCases.filter(c => c.fulltext_analysis.coercion).length,
    privacy_violation: enrichedCases.filter(c => c.fulltext_analysis.privacy_violation).length,
    exclusion: enrichedCases.filter(c => c.fulltext_analysis.exclusion).length,
    mental_stress: enrichedCases.filter(c => c.fulltext_analysis.mental_stress).length
  };
  
  console.log('Keywords-Only Results (within subset):');
  for (const [key, count] of Object.entries(keywordsOnlyCounts)) {
    const pct = ((count / enrichedCases.length) * 100).toFixed(2);
    console.log(`  ${key}: ${count}/${enrichedCases.length} (${pct}%)`);
  }
  
  console.log('\nFull-Text Results (within subset):');
  for (const [key, count] of Object.entries(fullTextCounts)) {
    const pct = ((count / enrichedCases.length) * 100).toFixed(2);
    console.log(`  ${key}: ${count}/${enrichedCases.length} (${pct}%)`);
  }
  
  console.log('\nMultipliers (Full-Text / Keywords-Only):');
  const multipliers = {};
  for (const key in keywordsOnlyCounts) {
    const multiplier = keywordsOnlyCounts[key] > 0 
      ? (fullTextCounts[key] / keywordsOnlyCounts[key]).toFixed(2)
      : 'N/A (no keywords baseline)';
    multipliers[key] = multiplier;
    console.log(`  ${key}: ${multiplier}x`);
  }
  
  // Extrapolate to full dataset
  console.log('\n📈 EXTRAPOLATED FULL DATASET ESTIMATES');
  console.log('======================================\n');
  
  console.log('Using multipliers to estimate full-text prevalence:\n');
  
  const totalCases = summaryData.metadata.total_cases;
  const statistics = summaryData.statistics;
  
  for (const key in multipliers) {
    const keywordsCount = statistics[key]?.count || 0;
    const keywordsPct = statistics[key]?.percentage || '0.00';
    
    const multiplier = parseFloat(multipliers[key]) || 1;
    if (multipliers[key] === 'N/A (no keywords baseline)') {
      console.log(`${key}:`);
      console.log(`  Keywords-only: ${keywordsCount} (${keywordsPct}%)`);
      console.log(`  No multiplier available (no baseline in subset)`);
      console.log('');
      continue;
    }
    
    const estimatedCount = Math.round(keywordsCount * multiplier);
    const estimatedPct = ((estimatedCount / totalCases) * 100).toFixed(2);
    
    console.log(`${key}:`);
    console.log(`  Keywords-only: ${keywordsCount} (${keywordsPct}%)`);
    console.log(`  Multiplier: ${multiplier}x`);
    console.log(`  Estimated full-text: ${estimatedCount} (${estimatedPct}%)`);
    console.log('');
  }
  
  // Compare to blog post claims
  console.log('📰 BLOG POST VALIDATION');
  console.log('=======================\n');
  
  const blogClaims = {
    termination: 8.7,
    coercion: 2.3,
    exclusion: 4.1
  };
  
  for (const [key, claimedPct] of Object.entries(blogClaims)) {
    const keywordsCount = statistics[key]?.count || 0;
    const multiplier = parseFloat(multipliers[key]) || 1;
    
    if (multipliers[key] === 'N/A (no keywords baseline)') {
      console.log(`${key}: Cannot validate (no baseline in subset)`);
      continue;
    }
    
    const estimatedCount = Math.round(keywordsCount * multiplier);
    const estimatedPct = ((estimatedCount / totalCases) * 100).toFixed(2);
    
    const difference = Math.abs(estimatedPct - claimedPct).toFixed(2);
    const status = difference < 1 ? '✅ VALIDATED' : difference < 2 ? '⚠️  CLOSE' : '❌ DISCREPANCY';
    
    console.log(`${key}:`);
    console.log(`  Blog claim: ${claimedPct}%`);
    console.log(`  Our estimate: ${estimatedPct}%`);
    console.log(`  Difference: ${difference}%`);
    console.log(`  Status: ${status}`);
    console.log('');
  }
  
  // Save results
  console.log('💾 Saving results...');
  
  const outputPath = path.join(ANALYSIS_DIR, 'full-text-subset-validation.json');
  const output = {
    metadata: {
      date: new Date().toISOString(),
      total_dataset_cases: totalCases,
      subset_size: enrichedCases.length,
      fetched_successfully: fetchedCount,
      failed_fetches: failedCount
    },
    keywords_only_dataset: Object.fromEntries(
      Object.entries(statistics)
        .filter(([key]) => key in multipliers)
        .map(([key, val]) => [key, { count: val.count, percentage: parseFloat(val.percentage) }])
    ),
    keywords_only_subset: keywordsOnlyCounts,
    fulltext_subset: fullTextCounts,
    multipliers: multipliers,
    extrapolated_estimates: Object.fromEntries(
      Object.keys(multipliers).map(key => {
        const multiplier = parseFloat(multipliers[key]) || 1;
        const keywordsCount = statistics[key]?.count || 0;
        const estimatedCount = Math.round(keywordsCount * multiplier);
        const estimatedPct = ((estimatedCount / totalCases) * 100).toFixed(2);
        return [key, { count: estimatedCount, percentage: parseFloat(estimatedPct) }];
      })
    ),
    blog_validation: Object.fromEntries(
      Object.entries(blogClaims).map(([key, claimedPct]) => {
        const keywordsCount = statistics[key]?.count || 0;
        const multiplier = parseFloat(multipliers[key]) || 1;
        const estimatedCount = Math.round(keywordsCount * multiplier);
        const estimatedPct = parseFloat(((estimatedCount / totalCases) * 100).toFixed(2));
        const difference = Math.abs(estimatedPct - claimedPct).toFixed(2);
        return [key, {
          claimed: claimedPct,
          estimated: estimatedPct,
          difference: parseFloat(difference),
          validated: parseFloat(difference) < 1
        }];
      })
    ),
    enriched_cases: enrichedCases
  };
  
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved: ${outputPath}\n`);
  
  console.log('✅ Validation complete!');
  console.log('\n📋 NEXT STEPS:');
  console.log('==============\n');
  console.log('1. Review validation results above');
  console.log('2. If multipliers seem reasonable, use extrapolated estimates in blog');
  console.log('3. Begin gradual full-dataset enrichment (1,000 cases/day)');
  console.log('4. Script: fetch-full-text-gradual.mjs (to be created)');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
