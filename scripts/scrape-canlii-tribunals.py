#!/usr/bin/env python3
"""
CanLII Tribunal Decision Scraper
Scrapes WSIAT, HRTO, SST decisions to seed the 3 Flywheels

FREE TOOLS ONLY - NO API COSTS
- CanLII API: Free
- BeautifulSoup: Free
- Regex extraction: Free (no GPT-4 needed)

Author: 3mpwrApp
Date: April 2026
"""

import requests
import json
import re
import time
from datetime import datetime
from typing import List, Dict, Optional
import os

# ===== CONFIGURATION =====
CANLII_BASE = "https://api.canlii.org/v1"
CANLII_API_KEY = os.getenv("CANLII_API_KEY", "YOUR_FREE_API_KEY_HERE")  # Register at canlii.org/en/info/api.html
OUTPUT_DIR = "data/tribunal-decisions"
BATCH_SIZE = 50  # Be respectful to CanLII's servers

# Tribunals to scrape
TRIBUNALS = {
    "onwsiat": {
        "name": "Workplace Safety & Insurance Appeals Tribunal (Ontario)",
        "database": "onwsiat",
        "jurisdiction": "ON",
        "search_terms": ["fibromyalgia", "chronic pain", "PTSD", "back injury", "MSK"]
    },
    "sst": {
        "name": "Social Security Tribunal (CPP-D)",
        "database": "sst",
        "jurisdiction": "CA",
        "search_terms": ["disability", "CPP", "unable to work"]
    },
    "onhrt": {
        "name": "Human Rights Tribunal of Ontario",
        "database": "onhrt",
        "jurisdiction": "ON",
        "search_terms": ["accommodation", "disability discrimination"]
    }
}


# ===== HELPER FUNCTIONS =====

def extract_condition(text: str) -> Optional[str]:
    """Extract medical condition from decision text using regex patterns"""
    conditions = [
        "fibromyalgia", "chronic pain", "PTSD", "post-traumatic stress",
        "back injury", "spinal injury", "herniated disc", "depression",
        "anxiety", "rheumatoid arthritis", "osteoarthritis", "chronic fatigue",
        "multiple sclerosis", "MS", "carpal tunnel", "tendinitis"
    ]
    
    text_lower = text.lower()
    found = []
    
    for condition in conditions:
        if condition.lower() in text_lower:
            found.append(condition)
    
    return ", ".join(found) if found else "Unknown"


def extract_outcome(text: str) -> str:
    """Extract decision outcome from text"""
    text_lower = text.lower()
    
    # Priority order (most specific first)
    if re.search(r'\bappeal.*allowed\b|\ballowed\b', text_lower):
        return "Allowed"
    elif re.search(r'\bappeal.*dismissed\b|\bdismissed\b', text_lower):
        return "Dismissed"
    elif re.search(r'\bappeal.*denied\b|\bdenied\b', text_lower):
        return "Denied"
    elif re.search(r'\bvaried\b', text_lower):
        return "Varied"
    elif re.search(r'\bremanded\b', text_lower):
        return "Remanded"
    else:
        return "Unknown"


def extract_evidence(text: str) -> List[str]:
    """Extract types of evidence mentioned"""
    evidence_patterns = {
        "RFC form": r"\bRFC\b|\bresidual functional capacity\b",
        "Functional capacity evaluation": r"\bfunctional capacity evaluation\b|\bFCE\b",
        "Specialist report": r"\bspecialist report\b|\bconsultant.*report\b",
        "Timeline": r"\btimeline\b|\bchronology\b",
        "Medical records": r"\bmedical records?\b|\bclinical notes\b",
        "Vocational assessment": r"\bvocational assessment\b|\bwork capacity\b",
        "IME report": r"\bIME\b|\bindependent medical exam",
        "Employer statement": r"\bemployer.*statement\b|\bemployer.*report\b"
    }
    
    found = []
    text_lower = text.lower()
    
    for evidence_type, pattern in evidence_patterns.items():
        if re.search(pattern, text_lower):
            found.append(evidence_type)
    
    return found


def extract_key_factors(text: str) -> List[str]:
    """Extract success/failure factors from decision"""
    factors = []
    text_lower = text.lower()
    
    # Success factors
    if "treating physician" in text_lower:
        factors.append("Treating physician testimony was persuasive")
    if "credible" in text_lower and "witness" in text_lower:
        factors.append("Witness credibility established")
    if "consistent" in text_lower:
        factors.append("Evidence was internally consistent")
    
    # Failure factors
    if "pre-existing" in text_lower:
        factors.append("Pre-existing condition argument raised")
    if "insufficient" in text_lower and "evidence" in text_lower:
        factors.append("Evidence deemed insufficient")
    if "non-compliant" in text_lower:
        factors.append("Worker deemed non-compliant")
    
    return factors


# ===== MAIN SCRAPING FUNCTIONS =====

def search_canlii(database: str, search_term: str, offset: int = 0) -> Dict:
    """Search CanLII API for decisions"""
    url = f"{CANLII_BASE}/caseBrowse/en/{database}"
    params = {
        "api_key": CANLII_API_KEY,
        "offset": offset,
        "resultCount": BATCH_SIZE,
        "search": search_term
    }
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"  ❌ Error searching CanLII: {e}")
        return {"results": []}


def fetch_decision_html(case_id: str, database: str) -> Optional[str]:
    """Fetch full HTML of a decision"""
    url = f"{CANLII_BASE}/caseBrowse/en/{database}/{case_id}"
    params = {"api_key": CANLII_API_KEY}
    
    try:
        response = requests.get(url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        return data.get("html", "")
    except Exception as e:
        print(f"    ❌ Error fetching case {case_id}: {e}")
        return None


def parse_decision(case_data: Dict, html: str, tribunal: str) -> Dict:
    """Parse decision into structured format"""
    return {
        "id": case_data.get("caseId", {}).get("en", "unknown"),
        "title": case_data.get("title", "Untitled"),
        "date": case_data.get("decisionDate", ""),
        "tribunal": tribunal,
        "condition": extract_condition(html),
        "outcome": extract_outcome(html),
        "evidence_cited": extract_evidence(html),
        "key_factors": extract_key_factors(html),
        "url": case_data.get("url", ""),
        "scraped_at": datetime.now().isoformat()
    }


def scrape_tribunal(tribunal_id: str, config: Dict, max_results: int = 100) -> List[Dict]:
    """Scrape decisions from a specific tribunal"""
    print(f"\n📊 Scraping {config['name']}...")
    all_decisions = []
    
    for search_term in config['search_terms']:
        print(f"  🔍 Searching for: {search_term}")
        offset = 0
        
        while len(all_decisions) < max_results:
            # Search
            results = search_canlii(config['database'], search_term, offset)
            cases = results.get("results", [])
            
            if not cases:
                print(f"    ℹ️ No more results for '{search_term}'")
                break
            
            # Process each case
            for case in cases[:min(10, max_results - len(all_decisions))]:
                case_id = case.get("caseId", {}).get("en")
                if not case_id:
                    continue
                
                print(f"    📄 Fetching {case_id}...")
                html = fetch_decision_html(case_id, config['database'])
                
                if html:
                    decision = parse_decision(case, html, config['name'])
                    all_decisions.append(decision)
                    print(f"      ✅ {decision['outcome']} - {decision['condition']}")
                
                # Rate limiting
                time.sleep(1)  # Be nice to CanLII servers
            
            offset += BATCH_SIZE
            
            if len(cases) < BATCH_SIZE:
                break
    
    print(f"  ✅ Scraped {len(all_decisions)} decisions from {config['name']}")
    return all_decisions


def save_decisions(decisions: List[Dict], filename: str):
    """Save decisions to JSON file"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(decisions, f, indent=2, ensure_ascii=False)
    
    print(f"  💾 Saved to {filepath}")


def generate_summary(decisions: List[Dict]) -> Dict:
    """Generate summary statistics"""
    total = len(decisions)
    
    outcomes = {}
    conditions = {}
    evidence_types = {}
    
    for decision in decisions:
        # Count outcomes
        outcome = decision['outcome']
        outcomes[outcome] = outcomes.get(outcome, 0) + 1
        
        # Count conditions
        condition = decision['condition']
        conditions[condition] = conditions.get(condition, 0) + 1
        
        # Count evidence types
        for evidence in decision['evidence_cited']:
            evidence_types[evidence] = evidence_types.get(evidence, 0) + 1
    
    # Calculate success rate (Allowed / Total)
    allowed = outcomes.get("Allowed", 0)
    success_rate = (allowed / total * 100) if total > 0 else 0
    
    return {
        "total_decisions": total,
        "success_rate": f"{success_rate:.1f}%",
        "outcomes": outcomes,
        "conditions": conditions,
        "evidence_types": evidence_types,
        "most_common_condition": max(conditions.items(), key=lambda x: x[1])[0] if conditions else "None",
        "most_cited_evidence": max(evidence_types.items(), key=lambda x: x[1])[0] if evidence_types else "None"
    }


# ===== MAIN EXECUTION =====

def main():
    """Main execution"""
    print("=" * 60)
    print("🔄 CanLII Tribunal Decision Scraper")
    print("=" * 60)
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Max results per tribunal: 100")
    print()
    
    if CANLII_API_KEY == "YOUR_FREE_API_KEY_HERE":
        print("⚠️  WARNING: Set CANLII_API_KEY environment variable")
        print("   Register for free at: https://www.canlii.org/en/info/api.html")
        print()
        # Continue anyway for demo purposes
    
    all_results = {}
    
    # Scrape each tribunal
    for tribunal_id, config in TRIBUNALS.items():
        decisions = scrape_tribunal(tribunal_id, config, max_results=100)
        all_results[tribunal_id] = decisions
        
        # Save individual tribunal results
        filename = f"{tribunal_id}-decisions-{datetime.now().strftime('%Y%m%d')}.json"
        save_decisions(decisions, filename)
        
        # Generate summary
        summary = generate_summary(decisions)
        print(f"\n  📈 Summary for {config['name']}:")
        print(f"     Total: {summary['total_decisions']}")
        print(f"     Success rate: {summary['success_rate']}")
        print(f"     Most common condition: {summary['most_common_condition']}")
        print(f"     Most cited evidence: {summary['most_cited_evidence']}")
    
    # Combine all results
    combined = []
    for decisions in all_results.values():
        combined.extend(decisions)
    
    save_decisions(combined, f"all-tribunals-{datetime.now().strftime('%Y%m%d')}.json")
    
    # Final summary
    print("\n" + "=" * 60)
    print("✅ SCRAPING COMPLETE")
    print("=" * 60)
    print(f"Total decisions scraped: {len(combined)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print()
    print("Next steps:")
    print("1. Review data/tribunal-decisions/*.json")
    print("2. Import to database")
    print("3. Run pattern detection")
    print("4. Generate templates from successful cases")


if __name__ == "__main__":
    main()
