/**
 * Collective Evidence Aggregation Service
 *
 * Privacy-first pattern detection across anonymous user data.
 * Builds competitive moat through collective evidence dataset.
 *
 * PRIVACY SAFEGUARDS:
 * - Anonymous contribution (strip all PII)
 * - Minimum threshold: 50 users before showing patterns
 * - User can opt-out anytime
 * - Dates → "days since event"
 * - Locations → regions only
 *
 * WEEK 3-4 ENHANCEMENTS:
 * 1. Enhanced Theme Extraction:
 *    - Medical terminology (fibromyalgia, PTSD, chronic pain, etc.)
 *    - Insurance company patterns (Blue Cross, Aetna, UnitedHealthcare, etc.)
 *    - Medication detection (Humira, biologics, opioids, antidepressants, etc.)
 *    - Procedure types (prior auth, appeals, external review, etc.)
 *
 * 2. Advanced Pattern Scoring:
 *    - Frequency-based ranking (# of users with pattern)
 *    - Severity scoring (denial rates that block treatment)
 *    - Time sensitivity (trending up/down/stable)
 *    - Geographic clustering (patterns across multiple regions)
 *    - Emerging pattern detection (new patterns in last 30 days)
 *
 * 3. Enriched Pattern Data:
 *    - denialRate: Percentage of denials (0-100)
 *    - trending: 'up' | 'down' | 'stable'
 *    - severity: 'low' | 'medium' | 'high' | 'urgent'
 *    - regions: Geographic areas affected
 *    - conditions: Associated medical conditions
 *    - metadata: Additional context (emerging, avg time to decision, etc.)
 *
 * 4. Pattern Types:
 *    - Denial reasons (insufficient evidence, not medically necessary, etc.)
 *    - Timeline delays (by insurance type)
 *    - Missing documentation (medical records, imaging, etc.)
 *    - Condition-specific patterns (fibromyalgia, PTSD, etc.)
 *    - Geographic trends (regional patterns)
 *    - Insurance company patterns (insurer-specific trends)
 *    - Medication access issues (biologics, opioids, etc.)
 *
 * @module services/collectiveEvidence
 */

import type { EvidenceLocalNote } from './evidenceCrypto';

let AsyncStorage: any;
let analytics: any;

try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

try {
  const analyticsModule = require('@react-native-firebase/analytics').default;
  // The module might be a factory function or an instance
  if (typeof analyticsModule === 'function') {
    analytics = analyticsModule();
  } else {
    analytics = analyticsModule;
  }
} catch {
  // Fallback: provide a mock analytics object
  analytics = {
    logEvent: async () => {},
  };
}

// Storage keys
const OPT_IN_KEY = 'collective_evidence:opt_in:v1';
const CONTRIBUTIONS_KEY = 'collective_evidence:contributions:v1';
const PATTERNS_CACHE_KEY = 'collective_evidence:patterns_cache:v1';
const LAST_ANALYSIS_KEY = 'collective_evidence:last_analysis:v1';

// Privacy constants
export const MINIMUM_USER_THRESHOLD = 50; // Never show patterns with fewer users
const MINIMUM_PATTERN_FREQUENCY = 5; // Minimum occurrences to surface pattern
const REANALYSIS_INTERVAL_MS = 1000 * 60 * 60 * 24; // 24 hours

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Anonymous pattern contribution (all PII removed)
 */
export type AnonymousContribution = {
  id: string; // Unique contribution ID (not user ID)
  daysAgo: number; // Relative time (not absolute date)
  themes: string[]; // Extracted themes (PII-removed)
  region?: string; // Geographic region (not city/address)
  insuranceType?: string; // e.g., "Private", "Medicare", "Medicaid"
  conditionCategory?: string; // e.g., "Chronic Pain", "Mental Health"
  denialReason?: string; // If evidence mentions denial
  timelineDelayDays?: number; // Days from submission to decision
  missingDocs?: string[]; // Types of docs requested
  contributedAt: number; // Timestamp of contribution
};

/**
 * Detected pattern across multiple contributions
 */
export type DetectedPattern = {
  id: string;
  type: 'denial_reason' | 'timeline_delay' | 'missing_docs' | 'insurance_pattern' | 'condition_pattern' | 'geographic_trend';
  title: string; // e.g., "Common denial reason"
  insight: string; // e.g., "Insufficient medical evidence"
  statistic: string; // e.g., "78% of fibromyalgia claims denied"
  userCount: number; // Number of users contributing to this pattern
  frequency: number; // Number of occurrences
  denialRate: number; // Percentage of denials for this pattern (0-100)
  score: number; // Pattern importance score (0-100)
  trending: 'up' | 'down' | 'stable'; // Pattern trending direction
  severity: 'low' | 'medium' | 'high' | 'urgent'; // Pattern severity level
  regions: string[]; // Regions where this pattern appears
  conditions: string[]; // Conditions associated with this pattern
  solidarityMessage: string; // e.g., "You're not alone: 1,247 users"
  actionLabel?: string; // e.g., "Join Campaign"
  actionLink?: string; // Link to related advocacy
  metadata: Record<string, any>; // Additional pattern data
};

/**
 * Aggregated insights dashboard data
 */
export type CollectiveInsights = {
  totalContributions: number;
  uniqueUsers: number; // Estimated (privacy-preserving)
  lastUpdated: number;
  patterns: DetectedPattern[];
  privacyNote: string;
};

/**
 * User opt-in state
 */
export type OptInState = {
  optedIn: boolean;
  optInDate?: number;
  contributionCount: number;
  lastContribution?: number;
};

// ============================================================================
// PII REMOVAL & ANONYMIZATION
// ============================================================================

/**
 * Remove names from text (simple pattern matching)
 */
function removeNames(text: string): string {
  // Remove common name patterns
  // This is a basic implementation - production would use NLP
  let cleaned = text;

  // Remove "My name is..." patterns
  cleaned = cleaned.replace(/my name is [A-Z][a-z]+( [A-Z][a-z]+)*/gi, 'my name is [REDACTED]');
  cleaned = cleaned.replace(/I am [A-Z][a-z]+( [A-Z][a-z]+)*/gi, 'I am [REDACTED]');
  cleaned = cleaned.replace(/called [A-Z][a-z]+( [A-Z][a-z]+)*/gi, 'called [REDACTED]');

  // Remove proper nouns (capitalized words) that might be names
  // Be conservative - only remove if followed by common name indicators
  cleaned = cleaned.replace(/Dr\.? [A-Z][a-z]+( [A-Z][a-z]+)*/g, 'Dr. [REDACTED]');
  cleaned = cleaned.replace(/Mr\.? [A-Z][a-z]+( [A-Z][a-z]+)*/g, 'Mr. [REDACTED]');
  cleaned = cleaned.replace(/Ms\.? [A-Z][a-z]+( [A-Z][a-z]+)*/g, 'Ms. [REDACTED]');
  cleaned = cleaned.replace(/Mrs\.? [A-Z][a-z]+( [A-Z][a-z]+)*/g, 'Mrs. [REDACTED]');

  return cleaned;
}

/**
 * Remove specific locations (cities, addresses)
 */
function removeLocations(text: string): string {
  let cleaned = text;

  // Remove addresses (numbers + street)
  cleaned = cleaned.replace(/\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)/gi, '[ADDRESS REDACTED]');

  // Remove city, state patterns
  cleaned = cleaned.replace(/[A-Z][a-z]+,\s*[A-Z]{2}/g, '[LOCATION REDACTED]');

  // Remove Canadian postal codes (e.g., A1A 1A1)
  cleaned = cleaned.replace(/\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/g, '[POSTAL CODE REDACTED]');

  // Remove US zip codes
  cleaned = cleaned.replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP REDACTED]');

  // Remove UK postcodes (basic pattern)
  cleaned = cleaned.replace(/\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/g, '[POSTCODE REDACTED]');

  return cleaned;
}

/**
 * Remove specific dates
 */
function removeDates(text: string): string {
  let cleaned = text;

  // Remove MM/DD/YYYY, MM-DD-YYYY patterns
  cleaned = cleaned.replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[DATE REDACTED]');

  // Remove "Month Day, Year" patterns
  cleaned = cleaned.replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, '[DATE REDACTED]');

  return cleaned;
}

/**
 * Extract region from location string (if provided)
 * Converts specific locations to broad regions
 */
function getRegionFromLocation(location?: string): string | undefined {
  if (!location) return undefined;

  const locationLower = location.toLowerCase();

  // Canadian Regions
  if (/(bc|british columbia|vancouver|victoria|kelowna)/i.test(locationLower)) {
    return 'Southwest Canada';
  }
  if (/(ab|alberta|calgary|edmonton)/i.test(locationLower)) {
    return 'Central Canada';
  }
  if (/(sk|saskatchewan|regina|saskatoon)/i.test(locationLower)) {
    return 'Central Canada';
  }
  if (/(mb|manitoba|winnipeg)/i.test(locationLower)) {
    return 'Central Canada';
  }
  if (/(on|ontario|toronto|ottawa|hamilton|london)/i.test(locationLower)) {
    return 'Central Canada';
  }
  if (/(qc|quebec|montreal|quebec city)/i.test(locationLower)) {
    return 'Eastern Canada';
  }
  if (/(nb|new brunswick|fredericton|moncton)/i.test(locationLower)) {
    return 'Eastern Canada';
  }
  if (/(ns|nova scotia|halifax)/i.test(locationLower)) {
    return 'Eastern Canada';
  }
  if (/(pe|pei|prince edward island|charlottetown)/i.test(locationLower)) {
    return 'Eastern Canada';
  }
  if (/(nl|newfoundland|labrador|st\.? john)/i.test(locationLower)) {
    return 'Eastern Canada';
  }

  // US Regions (broad geographic areas only)
  if (/(wa|washington|seattle|spokane|tacoma)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(or|oregon|portland|eugene|salem)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(ca|california|los angeles|san francisco|san diego|sacramento)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(id|idaho|boise)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(nv|nevada|las vegas|reno)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(ak|alaska|anchorage)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(hi|hawaii|honolulu)/i.test(locationLower)) {
    return 'US West';
  }
  if (/(az|arizona|phoenix|tucson)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(nm|new mexico|albuquerque|santa fe)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(ut|utah|salt lake)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(co|colorado|denver|boulder|colorado springs)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(tx|texas|houston|dallas|austin|san antonio)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(ok|oklahoma|oklahoma city|tulsa)/i.test(locationLower)) {
    return 'US Southwest';
  }
  if (/(mt|montana|billings|missoula)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(wy|wyoming|cheyenne|casper)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(nd|north dakota|fargo|bismarck)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(sd|south dakota|sioux falls|rapid city)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(ne|nebraska|omaha|lincoln)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(ks|kansas|wichita|topeka)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(mn|minnesota|minneapolis|st\.? paul)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(ia|iowa|des moines|cedar rapids)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(mo|missouri|kansas city|st\.? louis)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(wi|wisconsin|milwaukee|madison)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(il|illinois|chicago|springfield)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(in|indiana|indianapolis|fort wayne)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(oh|ohio|columbus|cleveland|cincinnati)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(mi|michigan|detroit|grand rapids)/i.test(locationLower)) {
    return 'US Midwest';
  }
  if (/(me|maine|portland|augusta)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(nh|new hampshire|manchester|concord)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(vt|vermont|burlington|montpelier)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(ma|massachusetts|boston|worcester)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(ri|rhode island|providence)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(ct|connecticut|hartford|new haven)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(ny|new york|nyc|buffalo|rochester)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(nj|new jersey|newark|jersey city)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(pa|pennsylvania|philadelphia|pittsburgh)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(de|delaware|wilmington|dover)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(md|maryland|baltimore|annapolis)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(dc|district of columbia|washington)/i.test(locationLower)) {
    return 'US Northeast';
  }
  if (/(wv|west virginia|charleston|huntington)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(va|virginia|richmond|virginia beach)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(nc|north carolina|charlotte|raleigh)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(sc|south carolina|columbia|charleston)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(ga|georgia|atlanta|savannah)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(fl|florida|miami|tampa|orlando|jacksonville)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(al|alabama|birmingham|montgomery)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(ms|mississippi|jackson|gulfport)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(tn|tennessee|nashville|memphis)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(ky|kentucky|louisville|lexington)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(ar|arkansas|little rock|fayetteville)/i.test(locationLower)) {
    return 'US Southeast';
  }
  if (/(la|louisiana|new orleans|baton rouge)/i.test(locationLower)) {
    return 'US Southeast';
  }

  // UK Regions
  if (/(london|greater london)/i.test(locationLower)) {
    return 'UK Southeast';
  }
  if (/(england|manchester|liverpool|birmingham|leeds|sheffield|newcastle)/i.test(locationLower)) {
    return 'UK England';
  }
  if (/(scotland|edinburgh|glasgow)/i.test(locationLower)) {
    return 'UK Scotland';
  }
  if (/(wales|cardiff|swansea)/i.test(locationLower)) {
    return 'UK Wales';
  }
  if (/(northern ireland|belfast)/i.test(locationLower)) {
    return 'UK Northern Ireland';
  }

  // EU Regions
  if (/(germany|berlin|munich|hamburg)/i.test(locationLower)) {
    return 'EU Germany';
  }
  if (/(france|paris|lyon|marseille)/i.test(locationLower)) {
    return 'EU France';
  }
  if (/(spain|madrid|barcelona)/i.test(locationLower)) {
    return 'EU Spain';
  }
  if (/(italy|rome|milan|naples)/i.test(locationLower)) {
    return 'EU Italy';
  }
  if (/(netherlands|amsterdam|rotterdam)/i.test(locationLower)) {
    return 'EU Netherlands';
  }
  if (/(belgium|brussels|antwerp)/i.test(locationLower)) {
    return 'EU Belgium';
  }

  // Australia Regions
  if (/(nsw|new south wales|sydney)/i.test(locationLower)) {
    return 'Australia Southeast';
  }
  if (/(vic|victoria|melbourne)/i.test(locationLower)) {
    return 'Australia Southeast';
  }
  if (/(qld|queensland|brisbane)/i.test(locationLower)) {
    return 'Australia Northeast';
  }
  if (/(wa|western australia|perth)/i.test(locationLower)) {
    return 'Australia West';
  }
  if (/(sa|south australia|adelaide)/i.test(locationLower)) {
    return 'Australia South';
  }

  // Generic fallbacks
  if (/(canada|canadian)/i.test(locationLower)) return 'Canada';
  if (/(uk|united kingdom|britain|british)/i.test(locationLower)) return 'United Kingdom';
  if (/(australia|australian)/i.test(locationLower)) return 'Australia';
  if (/(united states|usa|us|america)/i.test(locationLower)) return 'United States';

  return 'Other'; // Default for unrecognized locations
}

/**
 * Extract themes from evidence text
 * Identifies common patterns: denial reasons, delays, missing docs, conditions
 */
function extractThemes(text: string): string[] {
  const themes: string[] = [];

  // Denial reasons - comprehensive detection
  if (/denied|denial|rejection|rejected|refuse|declined/i.test(text)) {
    if (/insufficient (medical )?evidence|lack (of )?evidence|not enough evidence/i.test(text)) {
      themes.push('denied_insufficient_evidence');
    }
    if (/not medically necessary|medical necessity|medically unnecessary/i.test(text)) {
      themes.push('denied_not_medically_necessary');
    }
    if (/experimental|investigational|not (FDA )?approved|unapproved/i.test(text)) {
      themes.push('denied_experimental');
    }
    if (/pre-?existing condition|preexisting|existed before/i.test(text)) {
      themes.push('denied_preexisting_condition');
    }
    if (/documentation|paperwork|forms|missing (docs|documents)/i.test(text)) {
      themes.push('denied_documentation_issue');
    }
    if (/prior auth|prior authorization|pre-?authorization|PA required/i.test(text)) {
      themes.push('denied_prior_authorization');
    }
    if (/out of network|not in network|network restriction/i.test(text)) {
      themes.push('denied_out_of_network');
    }
    if (/step therapy|try (this|another) first|failed other treatment/i.test(text)) {
      themes.push('denied_step_therapy');
    }
  }

  // Timeline delays
  if (/delay|waiting|wait|pending|slow|taking (too )?long/i.test(text)) {
    if (/weeks?/i.test(text)) themes.push('delay_weeks');
    if (/months?/i.test(text)) themes.push('delay_months');
    if (/years?/i.test(text)) themes.push('delay_years');
  }

  // Missing documentation
  if (/request|need|require|ask|missing|want/i.test(text)) {
    if (/medical records?/i.test(text)) themes.push('missing_medical_records');
    if (/doctor('s)? note|physician('s)? (note|letter)/i.test(text)) themes.push('missing_doctor_note');
    if (/test results?|lab work|blood (test|work)/i.test(text)) themes.push('missing_test_results');
    if (/prescription|rx/i.test(text)) themes.push('missing_prescription');
    if (/imaging|x-?ray|mri|ct scan|ultrasound|scan/i.test(text)) themes.push('missing_imaging');
    if (/referral|specialist (note|letter)/i.test(text)) themes.push('missing_referral');
  }

  // Chronic Pain Conditions
  if (/fibromyalgia|fibro/i.test(text)) {
    themes.push('condition_fibromyalgia');
    themes.push('category_chronic_pain');
  }
  if (/chronic pain|persistent pain/i.test(text)) {
    themes.push('condition_chronic_pain');
    themes.push('category_chronic_pain');
  }
  if (/arthritis|rheumatoid|osteoarthritis|RA/i.test(text)) {
    themes.push('condition_arthritis');
    themes.push('category_chronic_pain');
  }
  if (/back pain|spine|spinal|herniated disc/i.test(text)) {
    themes.push('condition_back_pain');
    themes.push('category_chronic_pain');
  }
  if (/joint pain|hip pain|knee pain/i.test(text)) {
    themes.push('condition_joint_pain');
    themes.push('category_chronic_pain');
  }

  // Mental Health Conditions
  if (/depression|depressive|major depression|MDD/i.test(text)) {
    themes.push('condition_depression');
    themes.push('category_mental_health');
  }
  if (/anxiety|GAD|panic (attack|disorder)|anxious/i.test(text)) {
    themes.push('condition_anxiety');
    themes.push('category_mental_health');
  }
  if (/PTSD|post-?traumatic|trauma/i.test(text)) {
    themes.push('condition_ptsd');
    themes.push('category_mental_health');
  }
  if (/bipolar|manic|mania/i.test(text)) {
    themes.push('condition_bipolar');
    themes.push('category_mental_health');
  }
  if (/OCD|obsessive|compulsive/i.test(text)) {
    themes.push('condition_ocd');
    themes.push('category_mental_health');
  }

  // Autoimmune Conditions
  if (/lupus|SLE|systemic lupus/i.test(text)) {
    themes.push('condition_lupus');
    themes.push('category_autoimmune');
  }
  if (/multiple sclerosis|MS/i.test(text)) {
    themes.push('condition_ms');
    themes.push('category_autoimmune');
  }
  if (/crohn('s)?|colitis|IBD|inflammatory bowel/i.test(text)) {
    themes.push('condition_ibd');
    themes.push('category_autoimmune');
  }
  if (/psoriasis|psoriatic/i.test(text)) {
    themes.push('condition_psoriasis');
    themes.push('category_autoimmune');
  }
  if (/rheumatoid arthritis|RA/i.test(text)) {
    themes.push('condition_rheumatoid_arthritis');
    themes.push('category_autoimmune');
  }

  // Neurological Conditions
  if (/migraine|headache/i.test(text)) {
    themes.push('condition_migraine');
    themes.push('category_neurological');
  }
  if (/epilepsy|seizure/i.test(text)) {
    themes.push('condition_epilepsy');
    themes.push('category_neurological');
  }
  if (/parkinson('s)?/i.test(text)) {
    themes.push('condition_parkinsons');
    themes.push('category_neurological');
  }
  if (/neuropathy|nerve (pain|damage)/i.test(text)) {
    themes.push('condition_neuropathy');
    themes.push('category_neurological');
  }

  // Developmental/Neurodevelopmental
  if (/autism|autistic|ASD/i.test(text)) {
    themes.push('condition_autism');
    themes.push('category_neurodevelopmental');
  }
  if (/adhd|add|attention deficit/i.test(text)) {
    themes.push('condition_adhd');
    themes.push('category_neurodevelopmental');
  }

  // Chronic Fatigue/Chronic Illness
  if (/(chronic fatigue|cfs|me\/cfs|myalgic encephalomyelitis)/i.test(text)) {
    themes.push('condition_chronic_fatigue');
    themes.push('category_chronic_illness');
  }
  if (/long covid|post-?covid|PASC/i.test(text)) {
    themes.push('condition_long_covid');
    themes.push('category_chronic_illness');
  }

  // Diabetes
  if (/diabetes|diabetic|type 1|type 2|insulin/i.test(text)) {
    themes.push('condition_diabetes');
    themes.push('category_endocrine');
  }

  // Cancer
  if (/cancer|tumor|oncology|chemotherapy|chemo|radiation therapy/i.test(text)) {
    themes.push('condition_cancer');
    themes.push('category_oncology');
  }

  // Insurance type mentions
  if (/medicare/i.test(text)) themes.push('insurance_medicare');
  if (/medicaid/i.test(text)) themes.push('insurance_medicaid');
  if (/private insurance|employer insurance|commercial insurance/i.test(text)) themes.push('insurance_private');
  if (/marketplace|aca|obamacare|healthcare\.gov/i.test(text)) themes.push('insurance_marketplace');
  if (/tricare|military insurance/i.test(text)) themes.push('insurance_tricare');
  if (/veterans|VA healthcare/i.test(text)) themes.push('insurance_va');

  // Insurance company detection (anonymized but tracked)
  // Major US insurers
  if (/united\s*health|unitedhealthcare|uhc/i.test(text)) themes.push('insurer_detected');
  if (/anthem|blue\s*cross|blue\s*shield|bcbs/i.test(text)) themes.push('insurer_detected');
  if (/aetna/i.test(text)) themes.push('insurer_detected');
  if (/cigna/i.test(text)) themes.push('insurer_detected');
  if (/humana/i.test(text)) themes.push('insurer_detected');
  if (/kaiser/i.test(text)) themes.push('insurer_detected');
  if (/(molina|centene|wellcare)/i.test(text)) themes.push('insurer_detected');

  // Medication detection (common biologics and specialty drugs)
  if (/humira|adalimumab/i.test(text)) {
    themes.push('medication_humira');
    themes.push('medication_biologic');
  }
  if (/enbrel|etanercept/i.test(text)) {
    themes.push('medication_enbrel');
    themes.push('medication_biologic');
  }
  if (/remicade|infliximab/i.test(text)) {
    themes.push('medication_remicade');
    themes.push('medication_biologic');
  }
  if (/stelara|ustekinumab/i.test(text)) {
    themes.push('medication_stelara');
    themes.push('medication_biologic');
  }
  if (/cosentyx|secukinumab/i.test(text)) {
    themes.push('medication_cosentyx');
    themes.push('medication_biologic');
  }
  if (/skyrizi|risankizumab/i.test(text)) {
    themes.push('medication_skyrizi');
    themes.push('medication_biologic');
  }
  if (/biologic|biological therapy/i.test(text)) {
    themes.push('medication_biologic');
  }
  if (/opioid|morphine|oxycodone|hydrocodone|fentanyl|tramadol/i.test(text)) {
    themes.push('medication_opioid');
  }
  if (/antidepressant|ssri|snri|lexapro|prozac|zoloft|wellbutrin/i.test(text)) {
    themes.push('medication_antidepressant');
  }
  if (/stimulant|adderall|ritalin|vyvanse|concerta/i.test(text)) {
    themes.push('medication_stimulant');
  }

  // Procedure types
  if (/appeal|appealing|appealed/i.test(text)) {
    themes.push('procedure_appeal');
  }
  if (/external review|independent review/i.test(text)) {
    themes.push('procedure_external_review');
  }
  if (/(re)?submission|resubmit|submit (again|new)/i.test(text)) {
    themes.push('procedure_resubmission');
  }
  if (/peer.*review|medical review/i.test(text)) {
    themes.push('procedure_peer_review');
  }

  return themes;
}

/**
 * Parse timeline delay from text
 */
function extractTimelineDelay(text: string): number | undefined {
  const textLower = text.toLowerCase();

  // Look for explicit delay mentions
  const weekMatch = textLower.match(/(\d+)\s*weeks?/);
  if (weekMatch) return parseInt(weekMatch[1]) * 7;

  const monthMatch = textLower.match(/(\d+)\s*months?/);
  if (monthMatch) return parseInt(monthMatch[1]) * 30;

  const dayMatch = textLower.match(/(\d+)\s*days?/);
  if (dayMatch) return parseInt(dayMatch[1]);

  return undefined;
}

/**
 * Extract denial reason from themes
 */
function extractDenialReason(themes: string[]): string | undefined {
  if (themes.includes('denied_insufficient_evidence')) return 'Insufficient medical evidence';
  if (themes.includes('denied_not_medically_necessary')) return 'Not medically necessary';
  if (themes.includes('denied_experimental')) return 'Experimental/investigational';
  if (themes.includes('denied_preexisting_condition')) return 'Pre-existing condition';
  if (themes.includes('denied_prior_authorization')) return 'Prior authorization required';
  if (themes.includes('denied_out_of_network')) return 'Out of network';
  if (themes.includes('denied_step_therapy')) return 'Step therapy requirement';
  if (themes.includes('denied_documentation_issue')) return 'Documentation issue';
  return undefined;
}

/**
 * Extract missing documents from themes
 */
function extractMissingDocs(themes: string[]): string[] {
  const docs: string[] = [];
  if (themes.includes('missing_medical_records')) docs.push('Medical records');
  if (themes.includes('missing_doctor_note')) docs.push('Doctor\'s note');
  if (themes.includes('missing_test_results')) docs.push('Test results');
  if (themes.includes('missing_prescription')) docs.push('Prescription');
  if (themes.includes('missing_imaging')) docs.push('Imaging/scans');
  if (themes.includes('missing_referral')) docs.push('Specialist referral');
  return docs;
}

/**
 * Anonymize evidence note (strip all PII)
 */
export function anonymizeEvidence(evidence: EvidenceLocalNote, location?: string): AnonymousContribution {
  // Remove PII from text
  let cleanedText = evidence.text;
  cleanedText = removeNames(cleanedText);
  cleanedText = removeLocations(cleanedText);
  cleanedText = removeDates(cleanedText);

  // Extract themes
  const themes = extractThemes(cleanedText);

  // Convert absolute date to relative days
  const evidenceDate = new Date(evidence.date).getTime();
  const daysAgo = Math.floor((Date.now() - evidenceDate) / (1000 * 60 * 60 * 24));

  // Extract structured data from themes
  const denialReason = extractDenialReason(themes);
  const timelineDelayDays = extractTimelineDelay(cleanedText);
  const missingDocs = extractMissingDocs(themes);

  // Determine insurance type from themes
  let insuranceType: string | undefined;
  if (themes.includes('insurance_medicare')) insuranceType = 'Medicare';
  else if (themes.includes('insurance_medicaid')) insuranceType = 'Medicaid';
  else if (themes.includes('insurance_private')) insuranceType = 'Private';
  else if (themes.includes('insurance_marketplace')) insuranceType = 'Marketplace';

  // Determine condition category from themes (prioritize specific over general)
  let conditionCategory: string | undefined;

  // Chronic Pain conditions
  if (themes.includes('condition_fibromyalgia')) conditionCategory = 'Fibromyalgia';
  else if (themes.includes('condition_arthritis')) conditionCategory = 'Arthritis';
  else if (themes.includes('condition_back_pain')) conditionCategory = 'Back Pain';
  else if (themes.includes('condition_joint_pain')) conditionCategory = 'Joint Pain';
  else if (themes.includes('condition_chronic_pain')) conditionCategory = 'Chronic Pain';

  // Mental Health conditions
  else if (themes.includes('condition_depression')) conditionCategory = 'Depression';
  else if (themes.includes('condition_anxiety')) conditionCategory = 'Anxiety';
  else if (themes.includes('condition_ptsd')) conditionCategory = 'PTSD';
  else if (themes.includes('condition_bipolar')) conditionCategory = 'Bipolar Disorder';
  else if (themes.includes('condition_ocd')) conditionCategory = 'OCD';

  // Autoimmune conditions
  else if (themes.includes('condition_lupus')) conditionCategory = 'Lupus';
  else if (themes.includes('condition_ms')) conditionCategory = 'Multiple Sclerosis';
  else if (themes.includes('condition_ibd')) conditionCategory = 'Inflammatory Bowel Disease';
  else if (themes.includes('condition_psoriasis')) conditionCategory = 'Psoriasis';
  else if (themes.includes('condition_rheumatoid_arthritis')) conditionCategory = 'Rheumatoid Arthritis';

  // Neurological conditions
  else if (themes.includes('condition_migraine')) conditionCategory = 'Migraine';
  else if (themes.includes('condition_epilepsy')) conditionCategory = 'Epilepsy';
  else if (themes.includes('condition_parkinsons')) conditionCategory = 'Parkinson\'s Disease';
  else if (themes.includes('condition_neuropathy')) conditionCategory = 'Neuropathy';

  // Neurodevelopmental conditions
  else if (themes.includes('condition_autism')) conditionCategory = 'Autism';
  else if (themes.includes('condition_adhd')) conditionCategory = 'ADHD';

  // Chronic Illness
  else if (themes.includes('condition_chronic_fatigue')) conditionCategory = 'Chronic Fatigue Syndrome';
  else if (themes.includes('condition_long_covid')) conditionCategory = 'Long COVID';

  // Other conditions
  else if (themes.includes('condition_diabetes')) conditionCategory = 'Diabetes';
  else if (themes.includes('condition_cancer')) conditionCategory = 'Cancer';

  return {
    id: evidence.id,
    daysAgo,
    themes,
    region: getRegionFromLocation(location),
    insuranceType,
    conditionCategory,
    denialReason,
    timelineDelayDays,
    missingDocs: missingDocs.length > 0 ? missingDocs : undefined,
    contributedAt: Date.now(),
  };
}

// ============================================================================
// OPT-IN MANAGEMENT
// ============================================================================

/**
 * Get user's opt-in state
 */
export async function getOptInState(): Promise<OptInState> {
  try {
    const raw = await AsyncStorage.getItem(OPT_IN_KEY);
    if (!raw) {
      return {
        optedIn: false,
        contributionCount: 0,
      };
    }
    return JSON.parse(raw) as OptInState;
  } catch {
    return {
      optedIn: false,
      contributionCount: 0,
    };
  }
}

/**
 * Opt in to collective evidence sharing
 */
export async function optIn(): Promise<void> {
  const state: OptInState = {
    optedIn: true,
    optInDate: Date.now(),
    contributionCount: 0,
  };
  await AsyncStorage.setItem(OPT_IN_KEY, JSON.stringify(state));
}

/**
 * Opt out and delete all contributions
 */
export async function optOut(): Promise<void> {
  const state: OptInState = {
    optedIn: false,
    contributionCount: 0,
  };
  await AsyncStorage.setItem(OPT_IN_KEY, JSON.stringify(state));
  await AsyncStorage.removeItem(CONTRIBUTIONS_KEY);
}

// ============================================================================
// CONTRIBUTION MANAGEMENT
// ============================================================================

/**
 * Contribute evidence to collective dataset (if opted in)
 */
export async function contributeEvidence(
  evidence: EvidenceLocalNote,
  location?: string
): Promise<boolean> {
  try {
    const optInState = await getOptInState();
    if (!optInState.optedIn) return false;

    // Anonymize evidence
    const contribution = anonymizeEvidence(evidence, location);

    // Load existing contributions
    const raw = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
    const contributions: AnonymousContribution[] = raw ? JSON.parse(raw) : [];

    // Add new contribution
    contributions.push(contribution);

    // Save
    await AsyncStorage.setItem(CONTRIBUTIONS_KEY, JSON.stringify(contributions));

    // Update opt-in state
    optInState.contributionCount++;
    optInState.lastContribution = Date.now();
    await AsyncStorage.setItem(OPT_IN_KEY, JSON.stringify(optInState));

    // Track contribution analytics
    try {
      // analytics is already an instance, call logEvent directly
      if (analytics && typeof analytics.logEvent === 'function') {
        await analytics.logEvent('collective_contribution_submitted', {
          themes_count: contribution.themes.length,
          has_denial_reason: !!contribution.denialReason,
          has_timeline: !!contribution.timelineDelayDays,
          region: contribution.region || 'unknown',
        });
      }
    } catch (analyticsError) {
      // Log error but don't fail the contribution
      console.error('Analytics error in contributeEvidence:', analyticsError);
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Get all contributions (for local analysis)
 */
async function getContributions(): Promise<AnonymousContribution[]> {
  try {
    const raw = await AsyncStorage.getItem(CONTRIBUTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ============================================================================
// PATTERN DETECTION
// ============================================================================

/**
 * Score pattern by impact and importance
 * Returns a score from 0-100 where:
 * - Higher frequency = more important
 * - Higher user count = more important
 * - More recent patterns = scored higher
 * - Higher denial rate = more severe
 * - Severity level affects score
 * - Geographic clustering (more regions = broader impact)
 */
function scorePattern(pattern: DetectedPattern, allContributions: AnonymousContribution[]): number {
  let score = 0;

  // 1. Frequency score (0-25 points)
  // Normalize frequency relative to total contributions
  const frequencyRatio = pattern.frequency / allContributions.length;
  score += Math.min(25, frequencyRatio * 100);

  // 2. User count score (0-20 points)
  // More users affected = higher importance
  const userCountScore = Math.min(20, (pattern.userCount / MINIMUM_USER_THRESHOLD) * 10);
  score += userCountScore;

  // 3. Recency/Trending score (0-15 points)
  // Patterns with more recent contributions score higher
  const recentContributions = allContributions.filter(c => {
    const contributionAge = Date.now() - c.contributedAt;
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return contributionAge < thirtyDays;
  });
  const recencyRatio = recentContributions.length / allContributions.length;
  score += recencyRatio * 10;

  // Bonus for trending up (emerging patterns)
  if (pattern.trending === 'up') {
    score += 5;
  }

  // 4. Denial rate score (0-20 points)
  // Higher denial rate = more severe problem
  score += Math.min(20, (pattern.denialRate / 100) * 20);

  // 5. Severity level score (0-15 points)
  if (pattern.severity === 'urgent') {
    score += 15;
  } else if (pattern.severity === 'high') {
    score += 10;
  } else if (pattern.severity === 'medium') {
    score += 5;
  } else {
    score += 2;
  }

  // 6. Pattern type score (0-10 points)
  // Denials and condition patterns are most actionable
  if (pattern.type === 'denial_reason' || pattern.type === 'condition_pattern') {
    score += 10; // Most actionable
  } else if (pattern.type === 'insurance_pattern') {
    score += 8; // Insurance-specific patterns are highly valuable
  } else if (pattern.type === 'timeline_delay') {
    score += 7; // Delays are moderately actionable
  } else if (pattern.type === 'missing_docs') {
    score += 5; // Documentation patterns are useful
  } else if (pattern.type === 'geographic_trend') {
    score += 4; // Geographic trends are informational
  }

  // 7. Geographic spread bonus (0-5 points)
  // Patterns affecting multiple regions have broader impact
  if (pattern.regions && pattern.regions.length > 0) {
    const regionSpread = Math.min(5, pattern.regions.length);
    score += regionSpread;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Calculate severity level based on denial rate and impact
 */
function calculateSeverity(
  denialRate: number,
  frequency: number,
  userCount: number
): 'low' | 'medium' | 'high' | 'urgent' {
  // Urgent: >80% denial rate OR affects >500 users with >50% denial rate
  if (denialRate > 80 || (userCount > 500 && denialRate > 50)) {
    return 'urgent';
  }

  // High: >60% denial rate OR affects >200 users with >40% denial rate
  if (denialRate > 60 || (userCount > 200 && denialRate > 40)) {
    return 'high';
  }

  // Medium: >30% denial rate OR affects >100 users
  if (denialRate > 30 || (userCount > 100 && frequency > 20)) {
    return 'medium';
  }

  // Low: everything else
  return 'low';
}

/**
 * Extract regions associated with pattern contributions
 */
function extractRegions(
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): string[] {
  const regions = new Set<string>();
  contributions
    .filter(patternMatcher)
    .forEach(c => {
      if (c.region) {
        regions.add(c.region);
      }
    });
  return Array.from(regions);
}

/**
 * Extract conditions associated with pattern contributions
 */
function extractConditions(
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): string[] {
  const conditions = new Set<string>();
  contributions
    .filter(patternMatcher)
    .forEach(c => {
      if (c.conditionCategory) {
        conditions.add(c.conditionCategory);
      }
    });
  return Array.from(conditions);
}

/**
 * Calculate denial rate for pattern
 */
function calculateDenialRate(
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): number {
  const matchingContributions = contributions.filter(patternMatcher);
  if (matchingContributions.length === 0) return 0;

  const denialsCount = matchingContributions.filter(c => c.denialReason).length;
  return Math.round((denialsCount / matchingContributions.length) * 100);
}

/**
 * Check if pattern is emerging (majority of contributions are new in last 30 days)
 */
function isEmergingPattern(
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): boolean {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

  const matchingContributions = contributions.filter(patternMatcher);
  if (matchingContributions.length === 0) return false;

  const recentCount = matchingContributions.filter(c => c.contributedAt >= thirtyDaysAgo).length;

  // Pattern is "emerging" if >70% of contributions are from last 30 days
  return (recentCount / matchingContributions.length) > 0.7;
}

/**
 * Calculate average time to decision for pattern
 */
function calculateAvgTimeToDecision(
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): number | undefined {
  const matchingContributions = contributions.filter(patternMatcher);
  const delays = matchingContributions
    .map(c => c.timelineDelayDays)
    .filter((d): d is number => d !== undefined);

  if (delays.length === 0) return undefined;

  const sum = delays.reduce((a, b) => a + b, 0);
  return Math.round(sum / delays.length);
}

/**
 * Calculate trend for a pattern
 * Compares recent frequency to historical frequency
 */
function calculateTrend(
  patternId: string,
  contributions: AnonymousContribution[],
  patternMatcher: (c: AnonymousContribution) => boolean
): 'up' | 'down' | 'stable' {
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

  // Recent period: last 30 days
  const recentContributions = contributions.filter(c =>
    c.contributedAt >= thirtyDaysAgo && patternMatcher(c)
  );

  // Historical period: 30-60 days ago
  const historicalContributions = contributions.filter(c =>
    c.contributedAt >= sixtyDaysAgo && c.contributedAt < thirtyDaysAgo && patternMatcher(c)
  );

  const recentCount = recentContributions.length;
  const historicalCount = historicalContributions.length;

  // Need minimum data for trend calculation
  if (recentCount < 3 && historicalCount < 3) {
    return 'stable';
  }

  // Calculate percentage change
  if (historicalCount === 0) {
    return recentCount > 0 ? 'up' : 'stable';
  }

  const percentageChange = ((recentCount - historicalCount) / historicalCount) * 100;

  // Threshold for trend detection: >20% change
  if (percentageChange > 20) return 'up';
  if (percentageChange < -20) return 'down';
  return 'stable';
}

/**
 * Detect patterns in contributions
 * Only shows patterns with >= MINIMUM_USER_THRESHOLD users
 */
async function detectPatterns(contributions: AnonymousContribution[]): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // For Phase 2 (local-only), we estimate user count from contribution count
  // In production, this would be server-side with actual user IDs
  const estimatedUsers = Math.max(1, Math.floor(contributions.length / 3)); // Conservative estimate

  // PRIVACY GATE: Never show patterns if below threshold
  if (estimatedUsers < MINIMUM_USER_THRESHOLD) {
    return [];
  }

  // 1. Common denial reasons
  const denialReasons = contributions
    .map(c => c.denialReason)
    .filter(Boolean) as string[];

  const denialCounts = countOccurrences(denialReasons);
  Object.entries(denialCounts).forEach(([reason, count]) => {
    if (count >= MINIMUM_PATTERN_FREQUENCY) {
      const percentage = Math.round((count / denialReasons.length) * 100);
      const patternId = `denial_${reason.replace(/\s+/g, '_').toLowerCase()}`;

      const patternMatcher = (c: AnonymousContribution) => c.denialReason === reason;

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const regions = extractRegions(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);
      const isEmerging = isEmergingPattern(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'denial_reason',
        title: 'Common Denial Reason',
        insight: reason,
        statistic: `${percentage}% of claims denied for this reason`,
        userCount: estimatedUsers,
        frequency: count,
        denialRate,
        score: 0, // Will be calculated below
        trending,
        severity: calculateSeverity(denialRate, count, estimatedUsers),
        regions,
        conditions,
        solidarityMessage: `You're not alone: ${estimatedUsers} users experienced similar denials`,
        metadata: {
          reason,
          count,
          percentage,
          isEmerging,
          timeToDecisionDays: calculateAvgTimeToDecision(contributions, patternMatcher),
        },
      };

      // Calculate score
      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 2. Timeline delays by insurance type
  const delaysByInsurance: Record<string, number[]> = {};
  contributions.forEach(c => {
    if (c.timelineDelayDays && c.insuranceType) {
      if (!delaysByInsurance[c.insuranceType]) delaysByInsurance[c.insuranceType] = [];
      delaysByInsurance[c.insuranceType].push(c.timelineDelayDays);
    }
  });

  Object.entries(delaysByInsurance).forEach(([insurance, delays]) => {
    if (delays.length >= MINIMUM_PATTERN_FREQUENCY) {
      const avgDelay = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
      const patternId = `delay_${insurance.toLowerCase()}`;

      const patternMatcher = (c: AnonymousContribution) =>
        c.insuranceType === insurance && c.timelineDelayDays !== undefined;

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const regions = extractRegions(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'timeline_delay',
        title: `${insurance} Timeline Delays`,
        insight: `Average ${avgDelay} days from submission to decision`,
        statistic: `${insurance} claims: ${avgDelay} days average`,
        userCount: estimatedUsers,
        frequency: delays.length,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, delays.length, estimatedUsers),
        regions,
        conditions,
        solidarityMessage: `${delays.length} users reported similar delays`,
        metadata: { insurance, avgDelay, count: delays.length },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 3. Missing documentation requests
  const allMissingDocs = contributions
    .flatMap(c => c.missingDocs || []);

  const missingDocCounts = countOccurrences(allMissingDocs);
  Object.entries(missingDocCounts).forEach(([doc, count]) => {
    if (count >= MINIMUM_PATTERN_FREQUENCY) {
      const percentage = Math.round((count / contributions.length) * 100);
      const patternId = `missing_${doc.replace(/\s+/g, '_').toLowerCase()}`;

      const patternMatcher = (c: AnonymousContribution) => c.missingDocs?.includes(doc) ?? false;

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const regions = extractRegions(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'missing_docs',
        title: 'Common Documentation Request',
        insight: doc,
        statistic: `Requested in ${percentage}% of cases`,
        userCount: estimatedUsers,
        frequency: count,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, count, estimatedUsers),
        regions,
        conditions,
        solidarityMessage: `${count} users asked for this documentation`,
        metadata: { doc, count, percentage },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 4. Condition-specific patterns
  const conditionDenials: Record<string, number> = {};
  const conditionTotals: Record<string, number> = {};

  contributions.forEach(c => {
    if (c.conditionCategory) {
      conditionTotals[c.conditionCategory] = (conditionTotals[c.conditionCategory] || 0) + 1;
      if (c.denialReason) {
        conditionDenials[c.conditionCategory] = (conditionDenials[c.conditionCategory] || 0) + 1;
      }
    }
  });

  Object.entries(conditionDenials).forEach(([condition, denials]) => {
    const total = conditionTotals[condition];
    if (total >= MINIMUM_PATTERN_FREQUENCY) {
      const percentage = Math.round((denials / total) * 100);
      const patternId = `condition_${condition.replace(/\s+/g, '_').toLowerCase()}`;

      const patternMatcher = (c: AnonymousContribution) => c.conditionCategory === condition;

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = percentage; // Already calculated as denial rate for this pattern
      const regions = extractRegions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'condition_pattern',
        title: `${condition} Claims`,
        insight: `${percentage}% denial rate for ${condition}`,
        statistic: `${denials} of ${total} claims denied`,
        userCount: estimatedUsers,
        frequency: total,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, total, estimatedUsers),
        regions,
        conditions: [condition], // Single condition for this pattern
        solidarityMessage: `${total} users with ${condition} shared their experience`,
        metadata: { condition, denials, total, percentage },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 5. Geographic trends (region level only)
  const regionCounts: Record<string, number> = {};
  contributions.forEach(c => {
    if (c.region) {
      regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
    }
  });

  Object.entries(regionCounts).forEach(([region, count]) => {
    if (count >= MINIMUM_PATTERN_FREQUENCY) {
      const percentage = Math.round((count / contributions.length) * 100);
      const patternId = `region_${region.replace(/\s+/g, '_').toLowerCase()}`;

      const patternMatcher = (c: AnonymousContribution) => c.region === region;

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'geographic_trend',
        title: `${region} Activity`,
        insight: `${count} contributions from ${region}`,
        statistic: `${percentage}% of total contributions`,
        userCount: estimatedUsers,
        frequency: count,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, count, estimatedUsers),
        regions: [region], // Single region for this pattern
        conditions,
        solidarityMessage: `${count} users in ${region} contributed`,
        metadata: { region, count, percentage },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 6. Insurance company patterns (specific insurer trends)
  const insurerThemes = [
    'insurer_unitedhealthcare',
    'insurer_bluecross',
    'insurer_aetna',
    'insurer_cigna',
    'insurer_humana',
    'insurer_kaiser',
  ];

  insurerThemes.forEach((insurerTheme) => {
    const insurerContributions = contributions.filter(c => c.themes.includes(insurerTheme));
    if (insurerContributions.length >= MINIMUM_PATTERN_FREQUENCY) {
      const insurerName = insurerTheme.replace('insurer_', '').replace(/_/g, ' ');
      const patternId = `insurer_pattern_${insurerTheme}`;

      const patternMatcher = (c: AnonymousContribution) => c.themes.includes(insurerTheme);

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const regions = extractRegions(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'insurance_pattern',
        title: `${insurerName.charAt(0).toUpperCase() + insurerName.slice(1)} Patterns`,
        insight: `${insurerContributions.length} reports involving this insurer`,
        statistic: `${denialRate}% denial rate`,
        userCount: estimatedUsers,
        frequency: insurerContributions.length,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, insurerContributions.length, estimatedUsers),
        regions,
        conditions,
        solidarityMessage: `${insurerContributions.length} users reported experiences with this insurer`,
        metadata: { insurer: insurerName, count: insurerContributions.length },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // 7. Medication-specific patterns (biologics, opioids, etc.)
  const medicationThemes = [
    { theme: 'medication_biologic', name: 'Biologic Medications' },
    { theme: 'medication_opioid', name: 'Opioid Medications' },
    { theme: 'medication_antidepressant', name: 'Antidepressants' },
    { theme: 'medication_stimulant', name: 'Stimulant Medications' },
  ];

  medicationThemes.forEach(({ theme, name }) => {
    const medContributions = contributions.filter(c => c.themes.includes(theme));
    if (medContributions.length >= MINIMUM_PATTERN_FREQUENCY) {
      const patternId = `medication_pattern_${theme}`;

      const patternMatcher = (c: AnonymousContribution) => c.themes.includes(theme);

      // Calculate enriched metrics
      const trending = calculateTrend(patternId, contributions, patternMatcher);
      const denialRate = calculateDenialRate(contributions, patternMatcher);
      const regions = extractRegions(contributions, patternMatcher);
      const conditions = extractConditions(contributions, patternMatcher);

      const pattern: DetectedPattern = {
        id: patternId,
        type: 'insurance_pattern',
        title: `${name} Access Issues`,
        insight: `${medContributions.length} reports about ${name.toLowerCase()}`,
        statistic: `${denialRate}% denial rate for this medication type`,
        userCount: estimatedUsers,
        frequency: medContributions.length,
        denialRate,
        score: 0,
        trending,
        severity: calculateSeverity(denialRate, medContributions.length, estimatedUsers),
        regions,
        conditions,
        solidarityMessage: `${medContributions.length} users reported similar medication access challenges`,
        metadata: { medication_type: name, count: medContributions.length },
      };

      pattern.score = scorePattern(pattern, contributions);
      patterns.push(pattern);
    }
  });

  // Sort by score (highest impact first), then by frequency
  return patterns.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.frequency - a.frequency;
  });
}

/**
 * Count occurrences of items in array
 */
function countOccurrences<T>(items: T[]): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const key = String(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

/**
 * Check if pattern should be shown (meets privacy threshold)
 */
function shouldShowPattern(pattern: DetectedPattern): boolean {
  return pattern.userCount >= MINIMUM_USER_THRESHOLD;
}

// ============================================================================
// INSIGHTS DASHBOARD
// ============================================================================

/**
 * Get collective insights (cached if recent)
 */
export async function getCollectiveInsights(forceRefresh = false): Promise<CollectiveInsights | null> {
  try {
    // Check if we need to reanalyze
    const lastAnalysisRaw = await AsyncStorage.getItem(LAST_ANALYSIS_KEY);
    const lastAnalysis = lastAnalysisRaw ? parseInt(lastAnalysisRaw) : 0;
    const needsRefresh = forceRefresh || (Date.now() - lastAnalysis) > REANALYSIS_INTERVAL_MS;

    if (!needsRefresh) {
      // Return cached insights
      const cachedRaw = await AsyncStorage.getItem(PATTERNS_CACHE_KEY);
      if (cachedRaw) {
        return JSON.parse(cachedRaw) as CollectiveInsights;
      }
    }

    // Get contributions
    const contributions = await getContributions();

    if (contributions.length === 0) {
      return null;
    }

    // Detect patterns
    const allPatterns = await detectPatterns(contributions);

    // Filter patterns by privacy threshold
    const patterns = allPatterns.filter(shouldShowPattern);

    // Estimate unique users (conservative)
    const uniqueUsers = Math.max(1, Math.floor(contributions.length / 3));

    const insights: CollectiveInsights = {
      totalContributions: contributions.length,
      uniqueUsers,
      lastUpdated: Date.now(),
      patterns,
      privacyNote: `Based on ${contributions.length} anonymous contributions from an estimated ${uniqueUsers} users. Patterns shown only when ${MINIMUM_USER_THRESHOLD}+ users contribute.`,
    };

    // Cache insights
    await AsyncStorage.setItem(PATTERNS_CACHE_KEY, JSON.stringify(insights));
    await AsyncStorage.setItem(LAST_ANALYSIS_KEY, String(Date.now()));

    return insights;
  } catch {
    return null;
  }
}

/**
 * Check if insights are available (privacy threshold met)
 */
export async function hasInsightsAvailable(): Promise<boolean> {
  const insights = await getCollectiveInsights();
  return insights !== null && insights.patterns.length > 0;
}

/**
 * Get user's contribution stats
 */
export async function getUserContributionStats(): Promise<{
  optedIn: boolean;
  contributionCount: number;
  lastContribution?: number;
}> {
  const optInState = await getOptInState();
  return {
    optedIn: optInState.optedIn,
    contributionCount: optInState.contributionCount,
    lastContribution: optInState.lastContribution,
  };
}
