#!/usr/bin/env node
/**
 * Province-by-Province Scraper - Avoid API Quota Issues
 * Scrapes one jurisdiction per day to stay within CanLII limits
 * 
 * Author: 3mpwrApp
 * Date: April 2026
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Import scraping functions from main scraper
const mainScraperPath = path.join(__dirname, 'scrape-canlii-tribunals.js');

// ===== CONFIGURATION =====
const CANLII_BASE = "https://api.canlii.org/v1";
const CANLII_API_KEY = process.env.CANLII_API_KEY || "YOUR_FREE_API_KEY_HERE";
const OUTPUT_DIR = path.join(__dirname, "../data/tribunal-decisions");
const BATCH_SIZE = 50;
const CHANGED_SINCE = "2000-01-01";

// ===== PROVINCIAL GROUPS =====
// Each group scraped on a different day to avoid quota issues

const SCRAPING_SCHEDULE = {
  "day1-ontario": {
    name: "Ontario",
    tribunals: {
      "onwsiat": {
        name: "Workplace Safety & Insurance Appeals Tribunal (Ontario)",
        database: "onwsiat",
        search_terms: ["fibromyalgia", "chronic pain", "PTSD", "back injury", "disability"]
      },
      "onhrt": {
        name: "Human Rights Tribunal of Ontario",
        database: "onhrt",
        search_terms: ["accommodation", "disability"]
      },
      "onca": {
        name: "Ontario Court of Appeal",
        database: "onca",
        search_terms: ["disability", "WSIB", "accommodation"]
      }
    }
  },
  
  "day2-bc": {
    name: "British Columbia",
    tribunals: {
      "bchrt": {
        name: "British Columbia Human Rights Tribunal",
        database: "bchrt",
        search_terms: ["accommodation", "disability"]
      },
      "bcwcat": {
        name: "Workers' Compensation Appeal Tribunal (BC)",
        database: "bcwcat",
        search_terms: ["chronic pain", "PTSD", "back injury", "disability"]
      },
      "bcca": {
        name: "British Columbia Court of Appeal",
        database: "bcca",
        search_terms: ["disability", "WorkSafeBC"]
      }
    }
  },
  
  "day3-prairies": {
    name: "Alberta, Saskatchewan, Manitoba",
    tribunals: {
      "abqb": {
        name: "Alberta Court of Queen's Bench",
        database: "abqb",
        search_terms: ["disability", "WCB", "accommodation"]
      },
      "abca": {
        name: "Alberta Court of Appeal",
        database: "abca",
        search_terms: ["disability", "WCB"]
      },
      "skca": {
        name: "Saskatchewan Court of Appeal",
        database: "skca",
        search_terms: ["disability", "WCB"]
      },
      "mbca": {
        name: "Manitoba Court of Appeal",
        database: "mbca",
        search_terms: ["disability", "WCB", "accommodation"]
      }
    }
  },
  
  "day4-quebec": {
    name: "Quebec",
    tribunals: {
      "qctat": {
        name: "Tribunal administratif du travail (Quebec)",
        database: "qctat",
        search_terms: ["disability", "CNESST", "accommodation"]
      },
      "qcca": {
        name: "Quebec Court of Appeal",
        database: "qcca",
        search_terms: ["disability"]
      }
    }
  },
  
  "day5-atlantic": {
    name: "Atlantic Provinces",
    tribunals: {
      "nbca": {
        name: "New Brunswick Court of Appeal",
        database: "nbca",
        search_terms: ["disability", "WorkSafeNB"]
      },
      "nsca": {
        name: "Nova Scotia Court of Appeal",
        database: "nsca",
        search_terms: ["disability", "WCB"]
      },
      "peca": {
        name: "Prince Edward Island Court of Appeal",
        database: "peca",
        search_terms: ["disability", "WCB"]
      },
      "nlca": {
        name: "Newfoundland and Labrador Court of Appeal",
        database: "nlca",
        search_terms: ["disability", "WorkplaceNL"]
      }
    }
  },
  
  "day6-territories-federal": {
    name: "Territories & Federal",
    tribunals: {
      "ykca": {
        name: "Yukon Court of Appeal",
        database: "ykca",
        search_terms: ["disability"]
      },
      "nwtca": {
        name: "Northwest Territories Court of Appeal",
        database: "nwtca",
        search_terms: ["disability"]
      },
      "nuca": {
        name: "Nunavut Court of Appeal",
        database: "nuca",
        search_terms: ["disability"]
      },
      "chrt": {
        name: "Canadian Human Rights Tribunal",
        database: "chrt",
        search_terms: ["accommodation", "disability"]
      },
      "fct": {
        name: "Federal Court of Canada",
        database: "fct",
        search_terms: ["disability", "Canada Pension Plan"]
      },
      "fca": {
        name: "Federal Court of Appeal",
        database: "fca",
        search_terms: ["disability", "CPP"]
      }
    }
  }
};

// ===== HELPER FUNCTIONS =====
// (Copy from main scraper - httpsGet, searchCanLII, fetchDecisionHTML, etc.)

console.log("=".repeat(60));
console.log("🗓️  PROVINCIAL SCRAPING SCHEDULE");
console.log("=".repeat(60));
console.log();
console.log("To avoid API quota limits, scrape one group per day:\n");

Object.entries(SCRAPING_SCHEDULE).forEach(([day, config]) => {
  const count = Object.keys(config.tribunals).length;
  console.log(`  ${day}: ${config.name} (${count} tribunals/courts)`);
});

console.log("\n" + "=".repeat(60));
console.log("\n📋 USAGE:");
console.log(`  node scrape-by-province.js day1-ontario`);
console.log(`  node scrape-by-province.js day2-bc`);
console.log(`  node scrape-by-province.js day3-prairies`);
console.log(`  etc.\n`);
console.log("Or run ALL (may hit quota):");
console.log(`  node scrape-by-province.js all\n`);

// Get day from command line args
const targetDay = process.argv[2];

if (!targetDay) {
  console.log("⚠️  Please specify which day to scrape (or 'all')");
  process.exit(0);
}

if (targetDay === "all") {
  console.log("\n⚠️  WARNING: Scraping ALL provinces may exceed API quota!");
  console.log("Consider running one day at a time with 24-hour spacing.\n");
}

console.log(`\n✅ Selected: ${targetDay}`);
console.log(`\nTo proceed, copy scraping functions from scrape-canlii-tribunals.js`);
console.log(`and implement day-specific scraping logic here.\n`);
