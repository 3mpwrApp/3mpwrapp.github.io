#!/usr/bin/env node
/**
 * Pattern Analysis Script - Feed the Pattern Detection Flywheel
 * Analyzes 4,200+ tribunal decisions to find winning strategies
 * 
 * Author: 3mpwrApp
 * Date: April 2026
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, "../data/tribunal-decisions");
const OUTPUT_DIR = path.join(__dirname, "../data/pattern-analysis");

// ===== LOAD ALL DECISIONS =====

function loadAllDecisions() {
  console.log("📂 Loading tribunal decisions...\n");
  const allDecisions = [];
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.includes('summary'));
  
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
      if (Array.isArray(data)) {
        allDecisions.push(...data);
        console.log(`  ✅ ${file}: ${data.length} decisions`);
      }
    } catch (err) {
      console.log(`  ⚠️  ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Total decisions loaded: ${allDecisions.length}\n`);
  return allDecisions;
}

// ===== PATTERN ANALYSIS FUNCTIONS =====

function analyzeSuccessRates(decisions) {
  console.log("=".repeat(60));
  console.log("📈 SUCCESS RATES BY OUTCOME");
  console.log("=".repeat(60));
  
  const byOutcome = {};
  decisions.forEach(d => {
    byOutcome[d.outcome] = (byOutcome[d.outcome] || 0) + 1;
  });
  
  const total = decisions.length;
  Object.entries(byOutcome)
    .sort((a, b) => b[1] - a[1])
    .forEach(([outcome, count]) => {
      const pct = ((count / total) * 100).toFixed(1);
      console.log(`  ${outcome}: ${count} (${pct}%)`);
    });
  
  return byOutcome;
}

function analyzeByCondition(decisions) {
  console.log("\n" + "=".repeat(60));
  console.log("🏥 SUCCESS RATES BY CONDITION");
  console.log("=".repeat(60));
  
  const conditionStats = {};
  
  decisions.forEach(d => {
    if (d.condition && d.condition !== "Unknown") {
      const conditions = d.condition.split(',').map(c => c.trim());
      conditions.forEach(condition => {
        if (!conditionStats[condition]) {
          conditionStats[condition] = { total: 0, allowed: 0, dismissed: 0, denied: 0 };
        }
        conditionStats[condition].total++;
        if (d.outcome === "Allowed") conditionStats[condition].allowed++;
        if (d.outcome === "Dismissed") conditionStats[condition].dismissed++;
        if (d.outcome === "Denied") conditionStats[condition].denied++;
      });
    }
  });
  
  // Sort by total count
  const sorted = Object.entries(conditionStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 20); // Top 20 conditions
  
  console.log("\nTop 20 Conditions:\n");
  sorted.forEach(([condition, stats]) => {
    const successRate = stats.total > 0 ? ((stats.allowed / stats.total) * 100).toFixed(1) : 0;
    console.log(`  ${condition}:`);
    console.log(`    Total: ${stats.total} cases`);
    console.log(`    Success Rate: ${successRate}% (${stats.allowed} allowed / ${stats.total})`);
    console.log(`    Dismissed: ${stats.dismissed}, Denied: ${stats.denied}`);
    console.log();
  });
  
  return conditionStats;
}

function analyzeEvidenceCorrelation(decisions) {
  console.log("=".repeat(60));
  console.log("📋 EVIDENCE TYPES IN WINNING VS LOSING CASES");
  console.log("=".repeat(60));
  
  const evidenceStats = {};
  
  decisions.forEach(d => {
    if (d.evidence_cited && Array.isArray(d.evidence_cited)) {
      d.evidence_cited.forEach(evidence => {
        if (!evidenceStats[evidence]) {
          evidenceStats[evidence] = { total: 0, in_wins: 0, in_losses: 0 };
        }
        evidenceStats[evidence].total++;
        if (d.outcome === "Allowed") evidenceStats[evidence].in_wins++;
        if (d.outcome === "Dismissed" || d.outcome === "Denied") evidenceStats[evidence].in_losses++;
      });
    }
  });
  
  // Sort by total appearances
  const sorted = Object.entries(evidenceStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15); // Top 15 evidence types
  
  console.log("\nTop 15 Evidence Types:\n");
  sorted.forEach(([evidence, stats]) => {
    const winRate = stats.total > 0 ? ((stats.in_wins / (stats.in_wins + stats.in_losses)) * 100).toFixed(1) : 0;
    console.log(`  ${evidence}:`);
    console.log(`    Appears in: ${stats.total} cases`);
    console.log(`    Win correlation: ${winRate}% (${stats.in_wins} wins / ${stats.in_wins + stats.in_losses} outcomes)`);
    console.log();
  });
  
  return evidenceStats;
}

function analyzeKeyFactors(decisions) {
  console.log("=".repeat(60));
  console.log("🔑 KEY SUCCESS/FAILURE FACTORS");
  console.log("=".repeat(60));
  
  const factorStats = {};
  
  decisions.forEach(d => {
    if (d.key_factors && Array.isArray(d.key_factors)) {
      d.key_factors.forEach(({ factor, success_indicator }) => {
        if (!factorStats[factor]) {
          factorStats[factor] = { total: 0, in_wins: 0, in_losses: 0, success_factor_count: 0 };
        }
        factorStats[factor].total++;
        if (success_indicator) factorStats[factor].success_factor_count++;
        if (d.outcome === "Allowed") factorStats[factor].in_wins++;
        if (d.outcome === "Dismissed" || d.outcome === "Denied") factorStats[factor].in_losses++;
      });
    }
  });
  
  // Sort by total appearances
  const sorted = Object.entries(factorStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 15);
  
  console.log("\nTop 15 Factors:\n");
  sorted.forEach(([factor, stats]) => {
    const winRate = stats.total > 0 ? ((stats.in_wins / (stats.in_wins + stats.in_losses)) * 100).toFixed(1) : 0;
    const successIndicator = stats.success_factor_count > (stats.total / 2) ? "✅ SUCCESS" : "❌ FAILURE";
    console.log(`  ${successIndicator} ${factor}:`);
    console.log(`    Appears in: ${stats.total} cases`);
    console.log(`    Win correlation: ${winRate}%`);
    console.log();
  });
  
  return factorStats;
}

function analyzeTribunalComparison(decisions) {
  console.log("=".repeat(60));
  console.log("⚖️  TRIBUNAL COMPARISON");
  console.log("=".repeat(60));
  
  const tribunalStats = {};
  
  decisions.forEach(d => {
    if (!tribunalStats[d.tribunal]) {
      tribunalStats[d.tribunal] = { total: 0, allowed: 0, dismissed: 0, denied: 0 };
    }
    tribunalStats[d.tribunal].total++;
    if (d.outcome === "Allowed") tribunalStats[d.tribunal].allowed++;
    if (d.outcome === "Dismissed") tribunalStats[d.tribunal].dismissed++;
    if (d.outcome === "Denied") tribunalStats[d.tribunal].denied++;
  });
  
  console.log();
  Object.entries(tribunalStats)
    .sort((a, b) => b[1].total - a[1].total)
    .forEach(([tribunal, stats]) => {
      const successRate = stats.total > 0 ? ((stats.allowed / stats.total) * 100).toFixed(1) : 0;
      console.log(`  ${tribunal}:`);
      console.log(`    Total: ${stats.total} cases`);
      console.log(`    Success Rate: ${successRate}%`);
      console.log(`    Allowed: ${stats.allowed}, Dismissed: ${stats.dismissed}, Denied: ${stats.denied}`);
      console.log();
    });
  
  return tribunalStats;
}

function generateRecommendations(decisions, conditionStats, evidenceStats) {
  console.log("=".repeat(60));
  console.log("💡 RECOMMENDATIONS FOR WORKERS");
  console.log("=".repeat(60));
  
  const recommendations = [];
  
  // Top evidence that correlates with wins
  const topEvidence = Object.entries(evidenceStats)
    .map(([evidence, stats]) => ({
      evidence,
      winRate: stats.total > 0 ? (stats.in_wins / (stats.in_wins + stats.in_losses)) * 100 : 0,
      count: stats.total
    }))
    .filter(e => e.count >= 10) // Only evidence that appears 10+ times
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);
  
  console.log("\n🎯 Top 5 Evidence Types for Success:\n");
  topEvidence.forEach((e, i) => {
    console.log(`  ${i + 1}. ${e.evidence}: ${e.winRate.toFixed(1)}% win rate (${e.count} cases)`);
    recommendations.push({
      type: "evidence",
      recommendation: `Submit ${e.evidence}`,
      win_rate: e.winRate.toFixed(1),
      sample_size: e.count
    });
  });
  
  // Condition-specific recommendations
  console.log("\n🏥 Condition-Specific Strategies:\n");
  Object.entries(conditionStats)
    .filter(([_, stats]) => stats.total >= 20) // 20+ cases
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .forEach(([condition, stats]) => {
      const successRate = ((stats.allowed / stats.total) * 100).toFixed(1);
      console.log(`  ${condition}: ${successRate}% success rate (${stats.total} cases)`);
      
      if (successRate > 50) {
        console.log(`    ✅ Strong precedent - cite similar cases`);
      } else {
        console.log(`    ⚠️  Challenging - ensure strongest possible evidence`);
      }
      console.log();
    });
  
  return recommendations;
}

// ===== SAVE RESULTS =====

function saveAnalysis(data, filename) {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`\n💾 Saved analysis to: ${filepath}`);
}

// ===== MAIN =====

async function main() {
  console.log("=".repeat(60));
  console.log("🔬 3mpwrApp Pattern Detection Flywheel - Analysis Engine");
  console.log("=".repeat(60));
  console.log();
  
  const decisions = loadAllDecisions();
  
  if (decisions.length === 0) {
    console.log("❌ No decisions found. Run scraper first!");
    process.exit(1);
  }
  
  // Run all analyses
  const outcomeStats = analyzeSuccessRates(decisions);
  const conditionStats = analyzeByCondition(decisions);
  const evidenceStats = analyzeEvidenceCorrelation(decisions);
  const factorStats = analyzeKeyFactors(decisions);
  const tribunalStats = analyzeTribunalComparison(decisions);
  const recommendations = generateRecommendations(decisions, conditionStats, evidenceStats);
  
  // Save comprehensive report
  const report = {
    generated_at: new Date().toISOString(),
    total_decisions: decisions.length,
    date_range: "2000-01-01 to 2026-04-04",
    outcomes: outcomeStats,
    conditions: conditionStats,
    evidence: evidenceStats,
    key_factors: factorStats,
    tribunals: tribunalStats,
    recommendations: recommendations
  };
  
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  saveAnalysis(report, `pattern-analysis-${timestamp}.json`);
  
  console.log("\n=".repeat(60));
  console.log("✅ PATTERN ANALYSIS COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n🚀 Next Steps:");
  console.log("   1. Share findings with Thunder Bay pilot group");
  console.log("   2. Create evidence templates based on top strategies");
  console.log("   3. Build searchable decision database");
  console.log("   4. Continue scraping other provinces tomorrow");
  console.log();
}

main().catch(error => {
  console.error("\n❌ Fatal error:", error);
  process.exit(1);
});
