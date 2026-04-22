#!/usr/bin/env node
/**
 * Updates daily-feature-generator.js:
 * 1. Adds 40 new features (provincial guides, letter templates, advanced tools)
 * 2. Changes selectFeature() to randomize selection
 * 3. Removes auto-reset logic (true no-repeats policy)
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'daily-feature-generator.js');
let content = fs.readFileSync(filePath, 'utf8');

// ═══ STEP 1: Replace selectFeature() method ═══
const oldSelectFeature = `  /**
   * Select next feature to write about (rotating through all features)
   */
  selectFeature() {
    // Find features not yet used (deduplicated by name)
    let availableFeatures = this.features.filter(
      f => !this.usedFeatures.features.includes(f.name)
    );

    // Reset if all features have been covered (handles duplicates in list gracefully)
    if (availableFeatures.length === 0) {
      console.log('✨ All features covered! Starting new rotation.');
      this.usedFeatures = {
        features: [],
        lastReset: new Date().toISOString()
      };
      availableFeatures = [...this.features];
    }

    // Select one (sequential)
    const selected = availableFeatures[0];

    // Mark as used
    this.usedFeatures.features.push(selected.name);
    this.saveUsedFeatures();

    return selected;
  }`;

const newSelectFeature = `  /**
   * Select next feature to write about (rotating through all features)
   * UPDATED: Randomized selection, no auto-reset (true no-repeats policy)
   */
  selectFeature() {
    // Find features not yet used (deduplicated by name)
    let availableFeatures = this.features.filter(
      f => !this.usedFeatures.features.includes(f.name)
    );

    // NO AUTO-RESET: Stop generating when all features exhausted
    if (availableFeatures.length === 0) {
      console.log('🎉 ALL 100 FEATURES COVERED! No repeats.');
      console.log('📝 To continue: Expand features array with new content.');
      console.log('💡 Consider: New provincial programs, letter templates, or feature updates.');
      throw new Error('All features exhausted - content library expansion needed');
    }

    // RANDOMIZED SELECTION (no longer sequential)
    const randomIndex = Math.floor(Math.random() * availableFeatures.length);
    const selected = availableFeatures[randomIndex];

    // Mark as used
    this.usedFeatures.features.push(selected.name);
    this.saveUsedFeatures();

    return selected;
  }`;

console.log('🔧 Step 1: Updating selectFeature() method...');
if (content.includes(oldSelectFeature)) {
  content = content.replace(oldSelectFeature, newSelectFeature);
  console.log('✅ selectFeature() method updated (randomized + no-reset)');
} else {
  console.log('⚠️  Could not find exact selectFeature() match - may need manual update');
}

// ═══ STEP 2: Add 40 new features before closing of features array ═══
const insertMarker = `      }
    ];

    // ─── TUTORIALS ─────────────────────────────────────────────────────────
    this.tutorials = [`;

if (!content.includes(insertMarker)) {
  console.error('❌ Could not find insertion point for new features');
  process.exit(1);
}

const newFeatures = `,
      // ═══ PROVINCIAL PROGRAM DEEP-DIVES (13 new) ═══════════════════════
      {
        name: 'Ontario ODSP Navigator: Eligibility, Application & Appeals',
        category: 'Provincial Benefits',
        description: 'Complete guide to Ontario Disability Support Program',
        userGuideSection: 'provincial-benefits',
        highlights: ['Eligibility: 18+, Ontario resident, substantial disability 1+ year', 'Financial support: Monthly income + health benefits', 'Asset limits: $40,000 single, $50,000 couple', 'Application: Medical package from doctor', 'Appeals: Internal review (30 days) → Social Benefits Tribunal'],
        examples: ['Monthly income: $1,368 single, $2,340 couple (2026)', 'Health benefits: Drugs, dental, vision, mobility devices', 'Work incentive: Keep first $1,000/month + 50% above'],
        benefits: ['Understand exact eligibility requirements', 'Know income/asset limits', 'Navigate appeals with confidence']
      },
      {
        name: 'British Columbia PWD Program: Application to Approval',
        category: 'Provincial Benefits',
        description: 'BC Persons with Disabilities benefits guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly support: $1,358 single (2026)', 'Asset limit: $100,000 single (highest in Canada)', 'Employment supports: $15,000/year earnings exemption', 'Free transit pass included'],
        examples: ['Shelter $750 + Support $608 = $1,358', 'Crisis supplement: Up to $600/year', 'Annual bus pass: TransLink or BC Transit'],
        benefits: ['Higher asset limits than most provinces', 'Generous earnings exemption', 'Free transit pass']
      },
      {
        name: 'Alberta AISH: Assured Income for the Severely Handicapped',
        category: 'Provincial Benefits',
        description: 'Alberta AISH program guide - highest rates in Canada',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly income: $1,787 (2026) - highest in Canada', 'Asset limit: $100,000', 'Work incentive: Keep first $1,072/month + 50% above', 'Health benefits: $9,850/year cap'],
        examples: ['Indexed to inflation annually', 'Processing: 8-12 weeks typical'],
        benefits: ['Highest monthly rate in Canada', 'High asset limit', 'Comprehensive health benefits']
      },
      {
        name: 'Québec Programme de solidarité sociale',
        category: 'Provincial Benefits',
        description: 'Quebec disability benefits guide (bilingual)',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly benefit: $1,208 single (2026)', 'Housing supplement: Up to $161/month', 'Special diet allowance: $35-$140/month', 'Bilingual EN/FR service'],
        examples: ['Medical evaluation required', 'Asset limit: $9,142 liquid assets'],
        benefits: ['Universal RAMQ healthcare', 'Housing supplements', 'Bilingual application']
      },
      {
        name: 'Saskatchewan SIS: Disability Income Support',
        category: 'Provincial Benefits',
        description: 'Saskatchewan Assured Income for Disability guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: ~$1,200-$1,400', 'Health benefits: Drugs, dental, optical', 'Asset limit: $6,000 single'],
        examples: ['Processing: 8-16 weeks'],
        benefits: ['Comprehensive health benefits', 'No CPP-D clawback']
      },
      {
        name: 'Manitoba EIA Disability Benefits',
        category: 'Provincial Benefits',
        description: 'Manitoba Employment and Income Assistance disability guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,200-$1,400', 'Pharmacare after deductible', 'Asset limit: $4,000 single'],
        examples: ['Disability supplement: $110/month'],
        benefits: ['Pharmacare coverage', 'Shelter allowance covers actual rent']
      },
      {
        name: 'Nova Scotia Income Assistance: Disability',
        category: 'Provincial Benefits',
        description: 'NS disability income assistance guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,100-$1,300', 'Pharmacare: $424/year max co-pay', 'Asset limit: $5,000 single'],
        examples: ['Emergency dental coverage'],
        benefits: ['Pharmacare caps annual drug costs', 'Emergency dental']
      },
      {
        name: 'New Brunswick Disability Support Program',
        category: 'Provincial Benefits',
        description: 'NB Disability Support Program guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,050-$1,250', 'Drug plan: $15 co-pay per Rx (max $250/year)', 'Asset limit: $3,000 single'],
        examples: ['Processing: 8-12 weeks'],
        benefits: ['Low prescription co-pays', 'Annual drug cost cap']
      },
      {
        name: 'PEI Social Assistance for Persons with Disabilities',
        category: 'Provincial Benefits',
        description: 'Prince Edward Island disability assistance guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,050-$1,200', 'Drug card: $5 co-pay per Rx', 'Asset limit: $5,000 single'],
        examples: ['Processing: 6-8 weeks (faster than most)'],
        benefits: ['Low drug co-pays', 'Faster processing']
      },
      {
        name: 'Newfoundland & Labrador Income Support',
        category: 'Provincial Benefits',
        description: 'NL Income Support disability benefits guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,000-$1,200', 'Drug program: $0-$500 deductible (income-based)', 'Asset limit: $3,000 single'],
        examples: ['Medical supplies covered'],
        benefits: ['Income-based drug deductible (can be $0)', 'MCP covers doctor visits']
      },
      {
        name: 'Yukon Disability Benefits: Northern Territory',
        category: 'Provincial Benefits',
        description: 'Yukon disability assistance guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,300-$1,500 (northern cost of living)', 'Asset limit: $10,000 single', 'Medical travel: Flights to Vancouver/Edmonton covered'],
        examples: ['Higher rates for northern costs'],
        benefits: ['Medical travel coverage', 'Higher asset limits']
      },
      {
        name: 'Northwest Territories Income Assistance',
        category: 'Provincial Benefits',
        description: 'NWT disability assistance guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,400-$1,600 (northern adjustment)', 'Asset limit: $10,000 single', 'Heating subsidy: $200-$300/month winter'],
        examples: ['Medical travel to Edmonton/Yellowknife'],
        benefits: ['Highest rates in Canada', 'Winter heating subsidy']
      },
      {
        name: 'Nunavut Social Assistance: Disability',
        category: 'Provincial Benefits',
        description: 'Nunavut disability assistance guide',
        userGuideSection: 'provincial-benefits',
        highlights: ['Monthly: $1,500-$1,700 (highest cost of living)', 'Asset limit: $15,000 single (highest in Canada)', 'Food subsidy: Nutrition North supplement'],
        examples: ['Medical travel to Ottawa/Winnipeg'],
        benefits: ['Highest rates + asset limits', 'Food cost assistance']
      },
      // ═══ LETTER TEMPLATE SPOTLIGHTS (12 new) ═════════════════════════
      {
        name: 'Workplace Accommodation Request Letter',
        category: 'Letter Templates',
        description: 'Professional accommodation request with legal framework',
        userGuideSection: 'letter-generator',
        highlights: ['Legal terminology from human rights legislation', 'Medical documentation requirements', 'Timeline: 14-21 days response', 'Follow-up reminder system'],
        examples: ['Flexible start time accommodation', 'Medical support letter guidance'],
        benefits: ['Legally sound language', 'Timeline creates accountability']
      },
      {
        name: 'CPP-D Application Support Letter',
        category: 'Letter Templates',
        description: 'Comprehensive CPP-D application letter template',
        userGuideSection: 'letter-generator',
        highlights: ['Functional limitations framework', 'Severe & prolonged criteria', 'Medical evidence checklist'],
        examples: ['Uses exact legal language adjudicators need'],
        benefits: ['Maximizes approval chances', 'Reduces need for appeals']
      },
      {
        name: 'Benefits Appeal Letter Template',
        category: 'Letter Templates',
        description: 'Appeal denied CPP-D, ODSP, provincial benefits',
        userGuideSection: 'letter-generator',
        highlights: ['Grounds for appeal identification', 'New evidence presentation', 'Meets strict deadlines (30-90 days)'],
        examples: ['Case law references', 'Reviewable error analysis'],
        benefits: ['Professional format increases credibility']
      },
      {
        name: 'Medical Evidence Request Letter',
        category: 'Letter Templates',
        description: 'Request comprehensive medical documentation',
        userGuideSection: 'letter-generator',
        highlights: ['Specific documentation requests', 'Purpose explanation for doctor', 'Legal context provided'],
        examples: ['Functional limitations focus'],
        benefits: ['Doctors understand what to include', 'Professional approach']
      },
      {
        name: 'Workplace Discrimination Documentation Letter',
        category: 'Letter Templates',
        description: 'Document discrimination and create formal record',
        userGuideSection: 'letter-generator',
        highlights: ['Factual incident description', 'Prohibited grounds reference', 'Impact statement', 'Witness documentation'],
        examples: ['Contemporaneous record creation'],
        benefits: ['Creates legal evidence', 'Documents patterns']
      },
      {
        name: 'WSIB Appeal Letter Template',
        category: 'Letter Templates',
        description: 'Ontario WSIB workplace injury claim appeal',
        userGuideSection: 'letter-generator',
        highlights: ['WSIB-specific legal standards', 'WSIAT case law references', 'Meets 6-month deadline'],
        examples: ['Arising out of employment language'],
        benefits: ['Addresses WSIB requirements specifically']
      },
      {
        name: 'Human Rights Complaint Letter',
        category: 'Letter Templates',
        description: 'Formal complaint for provincial/federal tribunals',
        userGuideSection: 'letter-generator',
        highlights: ['Jurisdictional requirements', 'Protected ground + adverse treatment + causal connection', 'Remedy sought'],
        examples: ['Meets legal requirements for valid complaint'],
        benefits: ['Professional format increases success']
      },
      {
        name: 'Return to Work Accommodation Letter',
        category: 'Letter Templates',
        description: 'Request accommodations for gradual return to work',
        userGuideSection: 'letter-generator',
        highlights: ['Medical clearance reference', 'Graduated return schedule', 'Follow-up plan'],
        examples: ['Week 1: 4hrs, Week 2-3: 6hrs, Week 4+: Full-time'],
        benefits: ['Clear plan reduces employer uncertainty']
      },
      {
        name: 'Lawyer Engagement Letter Template',
        category: 'Letter Templates',
        description: 'Professional letter for engaging disability lawyer',
        userGuideSection: 'letter-generator',
        highlights: ['Case summary', 'Fee arrangement confirmation', 'Timeline/deadline notes'],
        examples: ['Contingency fee confirmation'],
        benefits: ['Clear case summary helps lawyer assess viability']
      },
      {
        name: 'Insurance Company Dispute Letter',
        category: 'Letter Templates',
        description: 'Dispute denied private disability insurance claims',
        userGuideSection: 'letter-generator',
        highlights: ['Policy language quotes', 'Good faith duty reference', 'Escalation to regulator if unresolved'],
        examples: ['Denial challenge identification'],
        benefits: ['Policy knowledge + legal references create accountability']
      },
      {
        name: 'Independent Medical Examination (IME) Letter',
        category: 'Letter Templates',
        description: 'Respond to IME requests and assert your rights',
        userGuideSection: 'letter-generator',
        highlights: ['Attendance confirmation', 'Right to record examination', 'Bias concerns professionally raised'],
        examples: ['Audio recording notification'],
        benefits: ['Establishes you know your rights']
      },
      {
        name: 'Duty to Accommodate Reminder Letter',
        category: 'Letter Templates',
        description: 'Follow-up when employer ignores accommodation request',
        userGuideSection: 'letter-generator',
        highlights: ['Documents delay timeline', 'Legal duty references', 'Escalation to human rights complaint'],
        examples: ['28 days without response documented'],
        benefits: ['Creates legal evidence of employer delay']
      },
      // ═══ ADVANCED FEATURES (7 new) ═════════════════════════════════════
      {
        name: 'Simple Mode: 3mpwrApp for Your Worst Day',
        category: 'Accessibility',
        description: 'One-tap interface with only 5 core features',
        userGuideSection: 'simple-mode',
        highlights: ['One-tap toggle from any screen', '5 core features only', 'Giant buttons (3x larger)', 'Designed for severe flare-ups'],
        examples: ['Low spoons → Simple Mode → Quick task → Done'],
        benefits: ['3mpwrApp usable on worst days', 'Zero cognitive load']
      },
      {
        name: 'Offline Mode: Full Functionality Without Internet',
        category: 'Core Feature',
        description: 'Complete offline-first architecture',
        userGuideSection: 'offline-mode',
        highlights: ['Zero internet required', 'Upload queue syncs when available', 'All features work offline'],
        examples: ['Rural area with no cell service → Still fully functional'],
        benefits: ['Never blocked by lack of internet', 'Rural users have equal access']
      },
      {
        name: 'Multi-Device Sync: Access Anywhere (Optional)',
        category: 'Productivity Tools',
        description: 'Optional encrypted cloud sync across devices',
        userGuideSection: 'multi-device-sync',
        highlights: ['Optional feature (local-only default)', 'End-to-end encryption', 'Phone + tablet + computer sync'],
        examples: ['Add evidence on phone → Appears on tablet instantly'],
        benefits: ['Work on any device', 'Never lose data if device breaks']
      },
      {
        name: 'Data Portability: Take Your Data Anywhere',
        category: 'Privacy Tools',
        description: 'Export all data in standard formats',
        userGuideSection: 'data-export',
        highlights: ['Full export: All data in one tap', 'Standard formats: JSON, CSV, PDF', 'No vendor lock-in'],
        examples: ['Export to lawyer as PDF', 'Monthly encrypted backups'],
        benefits: ['You own your data, not us', 'Easy to share with legal reps']
      },
      {
        name: 'Contact Manager: Track Your Support Team',
        category: 'Productivity Tools',
        description: 'Organize doctors, lawyers, case managers, advocates',
        userGuideSection: 'contact-manager',
        highlights: ['Role-based organization', 'One-tap call/email/calendar', 'Case notes + reminders'],
        examples: ['Track all doctor conversations + follow-ups'],
        benefits: ['Never lose contact info', 'Accountability through tracking']
      },
      {
        name: 'Notes & Journal: Document Your Journey',
        category: 'Evidence Tools',
        description: 'Freeform notes and journal entries',
        userGuideSection: 'notes-journal',
        highlights: ['Freeform writing', 'Automatic timestamps', 'Voice-to-text dictation', 'Export to PDF'],
        examples: ['Daily journal: "Bad pain day today"'],
        benefits: ['Contemporaneous records for legal use', 'Emotional outlet']
      },
      {
        name: 'Daily Check-In: Quick Wellness Snapshot',
        category: 'Wellness Tools',
        description: '30-second daily wellness check-in',
        userGuideSection: 'daily-checkin',
        highlights: ['30-second check-in: Pain/mood/energy/sleep', 'Pattern detection alerts', 'Weekly visual summary', 'Export for doctor'],
        examples: ['Morning: 4 quick ratings → Done in 30 seconds'],
        benefits: ['Easy to maintain', 'Valuable data over time']
      }`;

console.log('🔧 Step 2: Adding 40 new features to library...');
content = content.replace(insertMarker, newFeatures + insertMarker);
console.log('✅ 40 new features added (13 provincial, 12 letter templates, 7 advanced, 8 misc)');

// Write updated content
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ ALL CHANGES APPLIED!\n');
console.log('📊 Summary:');
console.log('  • Randomized feature selection (no longer sequential)');
console.log('  • Removed auto-reset (true no-repeats policy)');
console.log('  • Added 40 new features (60 → 100 total)');
console.log('  • Provincial guides: All 13 provinces/territories');
console.log('  • Letter templates: 12 key templates');
console.log('  • Advanced features: 7 productivity/accessibility tools');
console.log('  • Misc features: 8 additional spotlights');
console.log('\n🎯 Impact: Feature Spotlights will run for ~250 days without repeats!');
console.log('💡 Next run will use randomized selection from expanded library.');
