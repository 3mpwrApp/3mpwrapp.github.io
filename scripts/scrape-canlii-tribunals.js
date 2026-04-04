#!/usr/bin/env node
/**
 * CanLII Tribunal Decision Scraper (Node.js version)
 * Scrapes WSIAT, HRTO, SST decisions to seed the 3 Flywheels
 * 
 * FREE TOOLS ONLY - NO API COSTS
 * Author: 3mpwrApp
 * Date: April 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, "../data/tribunal-decisions");
const BATCH_SIZE = 50;

// MAXIMUM COLLECTION MODE: Get EVERYTHING from ALL of Canada
// User wants: "all data from all provinces covering all of canada from the oldest year that they have to current NO EXCEPTIONS"
// Changed from "2000-01-01" to "1900-01-01" to capture OLDEST available decisions
const CHANGED_SINCE = "1900-01-01"; // Some tribunals have decisions dating back to early 1900s

const TRIBUNALS = {
  // === ONTARIO ===
  "onwsiat": {
    "name": "Workplace Safety & Insurance Appeals Tribunal (Ontario)",
    "database": "onwsiat",
    "jurisdiction": "ON",
    "search_terms": ["fibromyalgia", "chronic pain", "PTSD", "back injury", "disability"]
  },
  "onhrt": {
    "name": "Human Rights Tribunal of Ontario",
    "database": "onhrt",
    "jurisdiction": "ON",
    "search_terms": ["accommodation", "disability"]
  },
  "onca": {
    "name": "Ontario Court of Appeal",
    "database": "onca",
    "jurisdiction": "ON",
    "search_terms": ["disability", "WSIB", "accommodation"]
  },
  
  // === BRITISH COLUMBIA ===
  "bchrt": {
    "name": "British Columbia Human Rights Tribunal",
    "database": "bchrt",
    "jurisdiction": "BC",
    "search_terms": ["accommodation", "disability"]
  },
  "bcwcat": {
    "name": "Workers' Compensation Appeal Tribunal (BC)",
    "database": "bcwcat",
    "jurisdiction": "BC",
    "search_terms": ["chronic pain", "PTSD", "back injury", "disability"]
  },
  "bcca": {
    "name": "British Columbia Court of Appeal",
    "database": "bcca",
    "jurisdiction": "BC",
    "search_terms": ["disability", "WorkSafeBC"]
  },
  
  // === ALBERTA ===
  "abqb": {
    "name": "Alberta Court of Queen's Bench",
    "database": "abqb",
    "jurisdiction": "AB",
    "search_terms": ["disability", "WCB", "accommodation"]
  },
  "abca": {
    "name": "Alberta Court of Appeal",
    "database": "abca",
    "jurisdiction": "AB",
    "search_terms": ["disability", "WCB"]
  },
  
  // === SASKATCHEWAN ===
  "skca": {
    "name": "Saskatchewan Court of Appeal",
    "database": "skca",
    "jurisdiction": "SK",
    "search_terms": ["disability", "WCB"]
  },
  
  // === MANITOBA ===
  "mbca": {
    "name": "Manitoba Court of Appeal",
    "database": "mbca",
    "jurisdiction": "MB",
    "search_terms": ["disability", "WCB", "accommodation"]
  },
  
  // === QUEBEC ===
  "qctat": {
    "name": "Tribunal administratif du travail (Quebec)",
    "database": "qctat",
    "jurisdiction": "QC",
    "search_terms": ["disability", "CNESST", "accommodation"]
  },
  "qcca": {
    "name": "Quebec Court of Appeal",
    "database": "qcca",
    "jurisdiction": "QC",
    "search_terms": ["disability"]
  },
  
  // === NEW BRUNSWICK ===
  "nbca": {
    "name": "New Brunswick Court of Appeal",
    "database": "nbca",
    "jurisdiction": "NB",
    "search_terms": ["disability", "WorkSafeNB"]
  },
  
  // === NOVA SCOTIA ===
  "nsca": {
    "name": "Nova Scotia Court of Appeal",
    "database": "nsca",
    "jurisdiction": "NS",
    "search_terms": ["disability", "WCB"]
  },
  
  // === PRINCE EDWARD ISLAND ===
  "peca": {
    "name": "Prince Edward Island Court of Appeal",
    "database": "peca",
    "jurisdiction": "PE",
    "search_terms": ["disability", "WCB"]
  },
  
  // === NEWFOUNDLAND AND LABRADOR ===
  "nlca": {
    "name": "Newfoundland and Labrador Court of Appeal",
    "database": "nlca",
    "jurisdiction": "NL",
    "search_terms": ["disability", "WorkplaceNL"]
  },
  
  // === YUKON ===
  "ykca": {
    "name": "Yukon Court of Appeal",
    "database": "ykca",
    "jurisdiction": "YT",
    "search_terms": ["disability"]
  },
  
  // === NORTHWEST TERRITORIES ===
  "nwtca": {
    "name": "Northwest Territories Court of Appeal",
    "database": "nwtca",
    "jurisdiction": "NT",
    "search_terms": ["disability"]
  },
  
  // === NUNAVUT ===
  "nuca": {
    "name": "Nunavut Court of Appeal",
    "database": "nuca",
    "jurisdiction": "NU",
    "search_terms": ["disability"]
  },
  
  // === FEDERAL ===
  "chrt": {
    "name": "Canadian Human Rights Tribunal",
    "database": "chrt",
    "jurisdiction": "FED",
    "search_terms": ["accommodation", "disability"]
  },
  "fct": {
    "name": "Federal Court of Canada",
    "database": "fct",
    "jurisdiction": "FED",
    "search_terms": ["disability", "Canada Pension Plan"]
  },
  "fca": {
    "name": "Federal Court of Appeal",
    "database": "fca",
    "jurisdiction": "FED",
    "search_terms": ["disability", "CPP"]
  }
};

// ===== HELPER FUNCTIONS =====

function extractCondition(text) {
  const conditions = [
    "fibromyalgia", "chronic pain", "PTSD", "post-traumatic stress",
    "back injury", "spinal injury", "herniated disc", "depression",
    "anxiety", "rheumatoid arthritis", "osteoarthritis", "chronic fatigue",
    "multiple sclerosis", "MS", "carpal tunnel", "tendinitis"
  ];
  
  const textLower = text.toLowerCase();
  const found = conditions.filter(c => textLower.includes(c.toLowerCase()));
  
  return found.length > 0 ? found.join(", ") : "Unknown";
}

function extractOutcome(text) {
  const textLower = text.toLowerCase();
  
  if (/\bappeal.*allowed\b|\ballowed\b/.test(textLower)) return "Allowed";
  if (/\bappeal.*dismissed\b|\bdismissed\b/.test(textLower)) return "Dismissed";
  if (/\bdenied\b/.test(textLower)) return "Denied";
  if (/\bvaried\b/.test(textLower)) return "Varied";
  if (/\bremanded\b/.test(textLower)) return "Remanded";
  
  return "Unknown";
}

function extractEvidence(text) {
  const evidence = [];
  const textLower = text.toLowerCase();
  
  const evidenceTypes = [
    { pattern: /\brfc\b|residual functional capacity/i, name: "RFC form" },
    { pattern: /\bfce\b|functional capacity evaluation/i, name: "FCE" },
    { pattern: /specialist report|rheumatologist|psychiatrist|psychologist/i, name: "Specialist report" },
    { pattern: /timeline|chronology|history/i, name: "Timeline/history" },
    { pattern: /\bime\b|independent medical exam/i, name: "IME" },
    { pattern: /medical records|treatment history/i, name: "Medical records" },
    { pattern: /employer statement|job description/i, name: "Employment docs" }
  ];
  
  evidenceTypes.forEach(({ pattern, name }) => {
    if (pattern.test(text)) evidence.push(name);
  });
  
  return evidence;
}

function extractKeyFactors(text) {
  const factors = [];
  const textLower = text.toLowerCase();
  
  const factorPatterns = [
    { pattern: /credible|credibility established/i, name: "Credible testimony", success: true },
    { pattern: /consistent with medical evidence/i, name: "Consistent evidence", success: true },
    { pattern: /objective medical findings/i, name: "Objective findings", success: true },
    { pattern: /pre-existing condition/i, name: "Pre-existing condition noted", success: false },
    { pattern: /insufficient evidence/i, name: "Insufficient evidence", success: false },
    { pattern: /not credible|credibility concerns/i, name: "Credibility issues", success: false }
  ];
  
  factorPatterns.forEach(({ pattern, name, success }) => {
    if (pattern.test(text)) factors.push({ factor: name, success_indicator: success });
  });
  
  return factors;
}

// ===== API FUNCTIONS =====

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

async function searchCanLII(database, searchTerm, offset = 0, retries = 3) {
  const params = new URLSearchParams({
    api_key: CANLII_API_KEY,
    offset: offset.toString(),
    resultCount: BATCH_SIZE.toString(),
    changedSince: CHANGED_SINCE,
    search: searchTerm
  });
  
  const url = `${CANLII_BASE}/caseBrowse/en/${database}?${params}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await httpsGet(url);
      const json = JSON.parse(data);
      // CanLII returns "cases" not "results"
      return { results: json.cases || [] };
    } catch (error) {
      if (error.message.includes('429') && attempt < retries) {
        const waitTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s
        console.log(`  ⏳ Throttled. Waiting ${waitTime/1000}s before retry ${attempt + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error(`  ❌ Error searching CanLII: ${error.message}`);
        return { results: [] };
      }
    }
  }
  
  return { results: [] };
}

async function fetchDecisionHTML(caseId, database) {
  const url = `${CANLII_BASE}/caseBrowse/en/${database}/${caseId}?api_key=${CANLII_API_KEY}`;
  
  try {
    const data = await httpsGet(url);
    return data;
  } catch (error) {
    console.error(`  ❌ Error fetching decision: ${error.message}`);
    return null;
  }
}

function parseDecision(caseData, html, tribunalName) {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
  
  return {
    case_id: caseData.caseId?.en || "Unknown",
    title: caseData.title || "Unknown",
    date: caseData.decisionDate || "Unknown",
    tribunal: tribunalName,
    url: caseData.url || "",
    condition: extractCondition(text),
    outcome: extractOutcome(text),
    evidence_cited: extractEvidence(text),
    key_factors: extractKeyFactors(text),
    snippet: text.substring(0, 500).trim() + "..."
  };
}

async function scrapeTribunal(tribunalId, config, maxResults = 100000) {
  console.log(`\n📊 Scraping ${config.name}...`);
  const allDecisions = [];
  
  for (const searchTerm of config.search_terms) {
    console.log(`  🔍 Searching for: ${searchTerm}`);
    let offset = 0;
    
    while (allDecisions.length < maxResults) {
      const results = await searchCanLII(config.database, searchTerm, offset);
      const cases = results.results || [];
      
      if (cases.length === 0) {
        console.log(`    ℹ️  No more results for '${searchTerm}'`);
        break;
      }
      
      const limit = Math.min(50, maxResults - allDecisions.length);
      for (let i = 0; i < Math.min(cases.length, limit); i++) {
        const caseData = cases[i];
        const caseId = caseData. caseId?.en;
        
        if (!caseId) continue;
        
        console.log(`    📄 Fetching ${caseId}...`);
        const html = await fetchDecisionHTML(caseId, config.database);
        
        if (html) {
          const decision = parseDecision(caseData, html, config.name);
          allDecisions.push(decision);
          console.log(`      ✅ ${decision.outcome} - ${decision.condition}`);
        }
        
        // Rate limiting - be nice to CanLII (3 seconds to avoid quota)
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      offset += BATCH_SIZE;
      if (cases.length < BATCH_SIZE) break;
    }
  }
  
  console.log(`  ✅ Scraped ${allDecisions.length} decisions from ${config.name}`);
  return allDecisions;
}

function saveDecisions(decisions, filename) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(decisions, null, 2));
  console.log(`  💾 Saved to ${filepath}`);
}

function generateSummary(allResults) {
  const summary = {
    total_decisions: 0,
    by_tribunal: {},
    by_outcome: {},
    by_condition: {},
    generated_at: new Date().toISOString()
  };
  
  Object.entries(allResults).forEach(([tribunalId, decisions]) => {
    summary.total_decisions += decisions.length;
    summary.by_tribunal[tribunalId] = decisions.length;
    
    decisions.forEach(d => {
      summary.by_outcome[d.outcome] = (summary.by_outcome[d.outcome] || 0) + 1;
      summary.by_condition[d.condition] = (summary.by_condition[d.condition] || 0) + 1;
    });
  });
  
  return summary;
}

// ===== MAIN =====

async function main() {
  console.log("=".repeat(60));
  console.log("🔄 CanLII Tribunal Decision Scraper (Node.js)");
  console.log("=".repeat(60));
  console.log(`Output directory: ${OUTPUT_DIR}`);
  console.log(`Max results per tribunal: UNLIMITED (up to 100,000)`);
  console.log(`Date range: ${CHANGED_SINCE} to today`);
  console.log(`Tribunals/Courts: ${Object.keys(TRIBUNALS).length} across Canada`);
  console.log();
  
  if (CANLII_API_KEY === "YOUR_FREE_API_KEY_HERE") {
    console.log("⚠️  WARNING: Set CANLII_API_KEY environment variable");
    console.log("   Example: $env:CANLII_API_KEY = \"your-key-here\"");
    console.log();
    process.exit(1);
  }
  
  const allResults = {};
  
  // Scrape each tribunal
  for (const [tribunalId, config] of Object.entries(TRIBUNALS)) {
    const decisions = await scrapeTribunal(tribunalId, config, 100000);
    allResults[tribunalId] = decisions;
    
    // Save individual tribunal results
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `${tribunalId}-historical-${date}.json`;
    saveDecisions(decisions, filename);
  }
  
  // Generate and save summary
  const summary = generateSummary(allResults);
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total decisions scraped: ${summary.total_decisions}`);
  console.log(`\nBy tribunal:`);
  Object.entries(summary.by_tribunal).forEach(([id, count]) => {
    console.log(`  ${id}: ${count} decisions`);
  });
  console.log(`\nBy outcome:`);
  Object.entries(summary.by_outcome).forEach(([outcome, count]) => {
    console.log(`  ${outcome}: ${count} (${(count/summary.total_decisions*100).toFixed(1)}%)`);
  });
  
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  saveDecisions(summary, `summary-historical-${date}.json`);
  
  console.log("\n✅ Scraping complete!");
  console.log(`📁 Results saved to: ${OUTPUT_DIR}`);
  console.log("\n🚀 Next: Analyze patterns with pattern-detection scripts");
}

main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
