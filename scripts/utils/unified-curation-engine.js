// Unified Disability News Curation Engine
// Combines all sources: RSS feeds, scrapers, social media, newsletters, APIs, and search results

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCES = {
  rss: {
    enabled: true,
    script: 'scripts/daily-curator.js',
    outputFile: 'public/curation-latest.json',
    weight: 1.0
  },
  
  scrapers: {
    enabled: true,
    script: 'scripts/scraper-government-agencies.js',
    outputFile: 'public/scraped-agencies.json',
    weight: 1.2 // Government agencies get slight boost
  },
  
  social_media: {
    enabled: true,
    script: 'scripts/monitor-social-media.js',
    outputFile: 'public/social-media-posts.json',
    weight: 0.9 // Social media slightly lower weight
  },
  
  newsletters: {
    enabled: true,
    script: 'scripts/parser-newsletters.js',
    outputFile: 'public/newsletter-items.json',
    weight: 1.1
  },
  
  apis: {
    enabled: true,
    script: 'scripts/api-integration.js',
    outputFile: 'public/api-data.json',
    weight: 1.3 // Official government data gets highest weight
  },
  
  search_engines: {
    enabled: true,
    script: 'scripts/search-engine-integration.js',
    outputFile: 'public/search-results.json',
    weight: 0.8 // Search results lower priority than official sources
  }
};

// Constants
const MAX_COMBINED_ITEMS = 50;
const DEDUP_THRESHOLD = 0.85; // 85% similarity = duplicate

function loadJSON(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (e) {
    console.warn(`[unified] Could not load ${filePath}:`, e.message);
  }
  return null;
}

function stringSimilarity(str1, str2) {
  const s1 = (str1 || '').toLowerCase().trim();
  const s2 = (str2 || '').toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  const editDistance = levenshteinDistance(shorter, longer);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(s1, s2) {
  const arr = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(0));
  
  for (let i = 0; i <= s1.length; i++) arr[0][i] = i;
  for (let j = 0; j <= s2.length; j++) arr[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      arr[j][i] = Math.min(
        arr[j][i - 1] + 1,
        arr[j - 1][i] + 1,
        arr[j - 1][i - 1] + indicator
      );
    }
  }
  
  return arr[s2.length][s1.length];
}

function deduplicateItems(allItems) {
  const deduped = [];
  const seen = [];
  
  for (const item of allItems) {
    let isDuplicate = false;
    
    for (const existing of seen) {
      const titleSim = stringSimilarity(item.title, existing.title);
      const descSim = stringSimilarity(item.description, existing.description);
      const avgSim = (titleSim + descSim) / 2;
      
      if (avgSim > DEDUP_THRESHOLD) {
        // Merge scores - keep highest
        existing.score = Math.max(existing.score, item.score);
        existing.sources = (existing.sources || []).concat(item.source);
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      deduped.push({
        ...item,
        sources: [item.source]
      });
      seen.push(item);
    }
  }
  
  return deduped;
}

function runScript(script) {
  try {
    console.log(`[unified] Running ${script}...`);
    execSync(`node ${script}`, { 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log(`[unified] ✓ ${script} completed`);
    return true;
  } catch (e) {
    console.warn(`[unified] Warning: ${script} failed:`, e.message);
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   3mpwrApp Unified Disability News Curation Engine          ║');
  console.log('║   Combining all data sources for comprehensive coverage     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const startTime = Date.now();
  let successCount = 0;
  
  // Run all enabled sources
  console.log('[unified] Phase 1: Running all data collection scripts...\n');
  
  for (const [key, source] of Object.entries(SOURCES)) {
    if (!source.enabled) {
      console.log(`[unified] ⊘ ${key} disabled`);
      continue;
    }
    
    const success = runScript(source.script);
    if (success) successCount++;
  }
  
  console.log(`\n[unified] Phase 1 Complete: ${successCount}/${Object.keys(SOURCES).length} sources ran successfully\n`);
  
  // Load and merge all results
  console.log('[unified] Phase 2: Loading and merging all sources...\n');
  
  const allItems = [];
  let totalLoaded = 0;
  
  for (const [key, source] of Object.entries(SOURCES)) {
    if (!source.enabled) continue;
    
    const data = loadJSON(path.join(process.cwd(), source.outputFile));
    if (!data || !data.items) continue;
    
    const items = data.items.map(item => ({
      ...item,
      source: source.outputFile,
      sourceKey: key,
      weightedScore: (item.score || 1) * source.weight
    }));
    
    allItems.push(...items);
    totalLoaded += items.length;
    console.log(`[unified] Loaded ${items.length} items from ${key}`);
  }
  
  console.log(`\n[unified] Total items loaded: ${totalLoaded}\n`);
  
  // Deduplicate
  console.log('[unified] Phase 3: Deduplicating items...\n');
  const deduped = deduplicateItems(allItems);
  console.log(`[unified] After deduplication: ${deduped.length} unique items\n`);
  
  // Score and rank
  console.log('[unified] Phase 4: Scoring and ranking...\n');
  const ranked = deduped
    .sort((a, b) => (b.weightedScore || 0) - (a.weightedScore || 0))
    .slice(0, MAX_COMBINED_ITEMS);
  
  console.log(`[unified] Top ${ranked.length} items selected for daily curation\n`);
  
  // Generate summary
  const summary = {
    generated: new Date().toISOString(),
    totalSources: Object.keys(SOURCES).filter(k => SOURCES[k].enabled).length,
    activeDataFeeds: successCount,
    totalItemsCollected: totalLoaded,
    dedupedItems: deduped.length,
    rankedItems: ranked.length,
    topItems: ranked.slice(0, 5).map(item => ({
      title: item.title?.substring(0, 70),
      score: item.weightedScore,
      source: item.sourceKey,
      sources: item.sources?.length || 1
    })),
    distributionBySource: {},
    timeElapsedMs: Date.now() - startTime
  };
  
  // Calculate distribution
  for (const [key] of Object.entries(SOURCES)) {
    summary.distributionBySource[key] = ranked.filter(i => i.sourceKey === key).length;
  }
  
  // Save unified results
  const outDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  
  const unifiedFile = path.join(outDir, 'unified-curation.json');
  fs.writeFileSync(unifiedFile, JSON.stringify({
    metadata: summary,
    items: ranked.map(item => ({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
      score: item.score,
      weightedScore: item.weightedScore,
      source: item.sourceKey,
      allSources: item.sources,
      contentType: item.contentType || 'general'
    }))
  }, null, 2), 'utf8');
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    CURATION COMPLETE                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 SUMMARY:');
  console.log(`   Total Sources:        ${summary.totalSources}`);
  console.log(`   Active Feeds:         ${summary.activeDataFeeds}`);
  console.log(`   Items Collected:      ${summary.totalItemsCollected}`);
  console.log(`   After Dedup:          ${summary.dedupedItems}`);
  console.log(`   Final Ranked Items:   ${summary.rankedItems}\n`);
  
  console.log('📈 DISTRIBUTION:');
  for (const [key, count] of Object.entries(summary.distributionBySource)) {
    console.log(`   ${key}: ${count} items`);
  }
  
  console.log(`\n⏱️  Execution Time: ${summary.timeElapsedMs}ms`);
  console.log(`\n✅ Results saved to ${unifiedFile}\n`);
  
  // Integration with main curator
  console.log('[unified] Phase 5: Integration with daily curator...');
  
  // Copy unified results for daily curation process
  const integratedFile = path.join(outDir, 'all-sources-combined.json');
  fs.copyFileSync(unifiedFile, integratedFile);
  console.log(`[unified] ✓ Combined results available for daily curation workflow\n`);
}

main().catch(e => {
  console.error('\n❌ Fatal error:', e);
  process.exit(1);
});
