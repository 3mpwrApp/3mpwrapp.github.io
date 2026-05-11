#!/usr/bin/env node
/**
 * Search WSIAT decisions for "labour relations exclusion" pattern
 * Looking for cases with:
 * - "labour relations" OR "labor relations" keywords
 * - Combined with "mental disorder" OR "psychiatric" OR "psychological" OR "PTSD" OR "anxiety" OR "depression"
 * - Ideally also with "prohibited" OR "retaliation" OR "reprisal"
 */

import fs from 'fs';
import path from 'path';

const dataDir = 'data/tribunal-decisions';

// Search patterns
const labourRelationsPattern = /labour relations|labor relations/gi;
const mentalDisorderPattern = /mental disorder|psychiatric|psychological|PTSD|anxiety|depression|stress disorder/gi;
const retaliationPattern = /prohibited|retaliation|reprisal|termination|dismissal|employer action/gi;
const jurisdictionPattern = /jurisdiction|outside.*scope|not.*competent/gi;

async function searchDecisions() {
  const resultsFile = 'data/tribunal-decisions/labour-relations-mental-disorder-search-results.json';
  
  console.log('🔍 Searching WSIAT decisions for labour relations + mental disorder patterns...\n');
  
  const files = [
    'onwsiat-decisions-20260404.json',
    'onwsiat-historical-20260404.json',
    'onwsiat-2026-ultra-slow.json'
  ];
  
  const results = {
    searchDate: new Date().toISOString(),
    searchCriteria: {
      labourRelations: 'labour relations OR labor relations',
      mentalDisorder: 'mental disorder OR psychiatric OR psychological OR PTSD OR anxiety OR depression',
      retaliation: 'prohibited OR retaliation OR reprisal OR termination',
      jurisdiction: 'jurisdiction OR outside scope OR not competent'
    },
    matches: [],
    summary: {
      totalCasesSearched: 0,
      labourRelationsMatches: 0,
      mentalDisorderMatches: 0,
      combinedMatches: 0,
      withRetaliationKeywords: 0,
      withJurisdictionKeywords: 0
    }
  };
  
  for (const file of files) {
    const filePath = path.join(dataDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${file} (not found)`);
      continue;
    }
    
    console.log(`📂 Loading ${file}...`);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const cases = Array.isArray(data) ? data : data.decisions || [];
    
    console.log(`   Found ${cases.length} cases`);
    results.summary.totalCasesSearched += cases.length;
    
    for (const decision of cases) {
      const keywords = (decision.keywords || []).join(' ').toLowerCase();
      const title = (decision.title || '').toLowerCase();
      const searchText = `${keywords} ${title}`;
      
      const hasLabourRelations = labourRelationsPattern.test(searchText);
      const hasMentalDisorder = mentalDisorderPattern.test(searchText);
      const hasRetaliation = retaliationPattern.test(searchText);
      const hasJurisdiction = jurisdictionPattern.test(searchText);
      
      if (hasLabourRelations) results.summary.labourRelationsMatches++;
      if (hasMentalDisorder) results.summary.mentalDisorderMatches++;
      
      // Primary match: both labour relations AND mental disorder
      if (hasLabourRelations && hasMentalDisorder) {
        results.summary.combinedMatches++;
        
        if (hasRetaliation) results.summary.withRetaliationKeywords++;
        if (hasJurisdiction) results.summary.withJurisdictionKeywords++;
        
        results.matches.push({
          caseId: decision.databaseId || decision.caseId || 'unknown',
          title: decision.title || 'No title',
          date: decision.decisionDate || decision.date || 'unknown',
          url: decision.url || '',
          keywords: decision.keywords || [],
          hasLabourRelations,
          hasMentalDisorder,
          hasRetaliation,
          hasJurisdiction,
          patterns: {
            labourRelationsMatch: searchText.match(labourRelationsPattern)?.[0] || '',
            mentalDisorderMatch: searchText.match(mentalDisorderPattern)?.[0] || '',
            retaliationMatch: hasRetaliation ? searchText.match(retaliationPattern)?.[0] || '' : '',
            jurisdictionMatch: hasJurisdiction ? searchText.match(jurisdictionPattern)?.[0] || '' : ''
          }
        });
      }
    }
  }
  
  // Sort by most suspicious (has all 4 patterns)
  results.matches.sort((a, b) => {
    const scoreA = (a.hasLabourRelations ? 1 : 0) + (a.hasMentalDisorder ? 1 : 0) + 
                   (a.hasRetaliation ? 1 : 0) + (a.hasJurisdiction ? 1 : 0);
    const scoreB = (b.hasLabourRelations ? 1 : 0) + (b.hasMentalDisorder ? 1 : 0) + 
                   (b.hasRetaliation ? 1 : 0) + (b.hasJurisdiction ? 1 : 0);
    return scoreB - scoreA;
  });
  
  // Save results
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  // Print summary
  console.log('\n📊 SEARCH RESULTS SUMMARY\n');
  console.log(`Total cases searched: ${results.summary.totalCasesSearched}`);
  console.log(`Cases with "labour relations": ${results.summary.labourRelationsMatches}`);
  console.log(`Cases with mental disorder keywords: ${results.summary.mentalDisorderMatches}`);
  console.log(`Cases with BOTH (primary matches): ${results.summary.combinedMatches}`);
  console.log(`  └─ With retaliation keywords: ${results.summary.withRetaliationKeywords}`);
  console.log(`  └─ With jurisdiction keywords: ${results.summary.withJurisdictionKeywords}`);
  
  console.log(`\n💾 Full results saved to: ${resultsFile}\n`);
  
  // Print top 10 most suspicious cases
  if (results.matches.length > 0) {
    console.log('🚨 TOP 10 MOST SUSPICIOUS CASES (all 4 patterns):');
    console.log('─'.repeat(80));
    
    const top10 = results.matches.slice(0, 10);
    for (const match of top10) {
      const allPatterns = match.hasLabourRelations && match.hasMentalDisorder && 
                         match.hasRetaliation && match.hasJurisdiction;
      if (allPatterns) {
        console.log(`\n📋 ${match.caseId} (${match.date})`);
        console.log(`   ${match.title}`);
        console.log(`   🔗 ${match.url}`);
        console.log(`   Keywords: ${match.keywords.slice(0, 5).join(', ')}...`);
      }
    }
  } else {
    console.log('✅ No cases found with both "labour relations" AND mental disorder patterns');
  }
  
  console.log('\n✅ Search complete!\n');
}

searchDecisions().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
