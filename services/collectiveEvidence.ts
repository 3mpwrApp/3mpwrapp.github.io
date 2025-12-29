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
 * @module services/collectiveEvidence
 */

import type { EvidenceLocalNote } from './evidenceCrypto';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
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

  // Remove zip codes
  cleaned = cleaned.replace(/\b\d{5}(-\d{4})?\b/g, '[ZIP REDACTED]');

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

  // US Regions (broad geographic areas only)
  if (/(wa|or|id|mt|wy|washington|oregon|idaho|montana|wyoming|seattle|portland|spokane)/i.test(locationLower)) {
    return 'Pacific Northwest';
  }
  if (/(ca|nv|california|nevada|los angeles|san francisco|san diego)/i.test(locationLower)) {
    return 'West Coast';
  }
  if (/(az|nm|ut|co|arizona|new mexico|utah|colorado|phoenix|denver)/i.test(locationLower)) {
    return 'Southwest';
  }
  if (/(tx|ok|ar|la|texas|oklahoma|arkansas|louisiana|houston|dallas|austin)/i.test(locationLower)) {
    return 'South Central';
  }
  if (/(mn|wi|ia|mo|nd|sd|ne|ks|minnesota|wisconsin|iowa|missouri|chicago|minneapolis)/i.test(locationLower)) {
    return 'Midwest';
  }
  if (/(il|in|oh|mi|illinois|indiana|ohio|michigan|detroit|cleveland)/i.test(locationLower)) {
    return 'Great Lakes';
  }
  if (/(ny|pa|nj|ct|ri|ma|vt|nh|me|new york|pennsylvania|boston|philadelphia)/i.test(locationLower)) {
    return 'Northeast';
  }
  if (/(va|wv|md|de|dc|virginia|maryland|delaware)/i.test(locationLower)) {
    return 'Mid-Atlantic';
  }
  if (/(nc|sc|ga|fl|al|ms|tn|ky|north carolina|south carolina|georgia|florida|atlanta|miami)/i.test(locationLower)) {
    return 'Southeast';
  }

  // International (very broad)
  if (/(canada|canadian)/i.test(locationLower)) return 'Canada';
  if (/(uk|england|scotland|wales|britain|british)/i.test(locationLower)) return 'United Kingdom';
  if (/(australia|australian)/i.test(locationLower)) return 'Australia';

  return 'Other'; // Default for unrecognized locations
}

/**
 * Extract themes from evidence text
 * Identifies common patterns: denial reasons, delays, missing docs
 */
function extractThemes(text: string): string[] {
  const themes: string[] = [];

  // Denial reasons
  if (/denied|rejection|rejected/i.test(text)) {
    if (/insufficient (medical )?evidence/i.test(text)) themes.push('denied_insufficient_evidence');
    if (/not medically necessary/i.test(text)) themes.push('denied_not_medically_necessary');
    if (/experimental|investigational/i.test(text)) themes.push('denied_experimental');
    if (/pre-?existing condition/i.test(text)) themes.push('denied_preexisting_condition');
    if (/documentation|paperwork|forms/i.test(text)) themes.push('denied_documentation_issue');
  }

  // Timeline delays
  if (/delay|waiting|wait|pending/i.test(text)) {
    if (/weeks?/i.test(text)) themes.push('delay_weeks');
    if (/months?/i.test(text)) themes.push('delay_months');
    if (/years?/i.test(text)) themes.push('delay_years');
  }

  // Missing documentation
  if (/request|need|require|ask|missing/i.test(text)) {
    if (/medical records?/i.test(text)) themes.push('missing_medical_records');
    if (/doctor('s)? note/i.test(text)) themes.push('missing_doctor_note');
    if (/test results?/i.test(text)) themes.push('missing_test_results');
    if (/prescription/i.test(text)) themes.push('missing_prescription');
    if (/imaging|x-?ray|mri|ct scan/i.test(text)) themes.push('missing_imaging');
  }

  // Condition mentions
  if (/fibromyalgia/i.test(text)) themes.push('condition_fibromyalgia');
  if (/chronic pain/i.test(text)) themes.push('condition_chronic_pain');
  if (/arthritis/i.test(text)) themes.push('condition_arthritis');
  if (/depression|anxiety|mental health/i.test(text)) themes.push('condition_mental_health');
  if (/autism|autistic/i.test(text)) themes.push('condition_autism');
  if (/adhd|add/i.test(text)) themes.push('condition_adhd');
  if (/(chronic fatigue|cfs|me\/cfs)/i.test(text)) themes.push('condition_chronic_fatigue');

  // Insurance type mentions
  if (/medicare/i.test(text)) themes.push('insurance_medicare');
  if (/medicaid/i.test(text)) themes.push('insurance_medicaid');
  if (/private insurance|employer insurance/i.test(text)) themes.push('insurance_private');
  if (/marketplace|aca|obamacare/i.test(text)) themes.push('insurance_marketplace');

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

  // Determine condition category from themes
  let conditionCategory: string | undefined;
  if (themes.some(t => t.startsWith('condition_fibromyalgia'))) conditionCategory = 'Fibromyalgia';
  else if (themes.some(t => t.startsWith('condition_chronic_pain'))) conditionCategory = 'Chronic Pain';
  else if (themes.some(t => t.startsWith('condition_arthritis'))) conditionCategory = 'Arthritis';
  else if (themes.some(t => t.startsWith('condition_mental_health'))) conditionCategory = 'Mental Health';
  else if (themes.some(t => t.startsWith('condition_autism'))) conditionCategory = 'Autism';
  else if (themes.some(t => t.startsWith('condition_adhd'))) conditionCategory = 'ADHD';
  else if (themes.some(t => t.startsWith('condition_chronic_fatigue'))) conditionCategory = 'Chronic Fatigue';

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
      patterns.push({
        id: `denial_${reason.replace(/\s+/g, '_').toLowerCase()}`,
        type: 'denial_reason',
        title: 'Common Denial Reason',
        insight: reason,
        statistic: `${percentage}% of claims denied for this reason`,
        userCount: estimatedUsers,
        frequency: count,
        solidarityMessage: `You're not alone: ${estimatedUsers} users experienced similar denials`,
        metadata: { reason, count, percentage },
      });
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
      patterns.push({
        id: `delay_${insurance.toLowerCase()}`,
        type: 'timeline_delay',
        title: `${insurance} Timeline Delays`,
        insight: `Average ${avgDelay} days from submission to decision`,
        statistic: `${insurance} claims: ${avgDelay} days average`,
        userCount: estimatedUsers,
        frequency: delays.length,
        solidarityMessage: `${delays.length} users reported similar delays`,
        metadata: { insurance, avgDelay, count: delays.length },
      });
    }
  });

  // 3. Missing documentation requests
  const allMissingDocs = contributions
    .flatMap(c => c.missingDocs || []);

  const missingDocCounts = countOccurrences(allMissingDocs);
  Object.entries(missingDocCounts).forEach(([doc, count]) => {
    if (count >= MINIMUM_PATTERN_FREQUENCY) {
      const percentage = Math.round((count / contributions.length) * 100);
      patterns.push({
        id: `missing_${doc.replace(/\s+/g, '_').toLowerCase()}`,
        type: 'missing_docs',
        title: 'Common Documentation Request',
        insight: doc,
        statistic: `Requested in ${percentage}% of cases`,
        userCount: estimatedUsers,
        frequency: count,
        solidarityMessage: `${count} users asked for this documentation`,
        metadata: { doc, count, percentage },
      });
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
      patterns.push({
        id: `condition_${condition.replace(/\s+/g, '_').toLowerCase()}`,
        type: 'condition_pattern',
        title: `${condition} Claims`,
        insight: `${percentage}% denial rate for ${condition}`,
        statistic: `${denials} of ${total} claims denied`,
        userCount: estimatedUsers,
        frequency: total,
        solidarityMessage: `${total} users with ${condition} shared their experience`,
        metadata: { condition, denials, total, percentage },
      });
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
      patterns.push({
        id: `region_${region.replace(/\s+/g, '_').toLowerCase()}`,
        type: 'geographic_trend',
        title: `${region} Activity`,
        insight: `${count} contributions from ${region}`,
        statistic: `${percentage}% of total contributions`,
        userCount: estimatedUsers,
        frequency: count,
        solidarityMessage: `${count} users in ${region} contributed`,
        metadata: { region, count, percentage },
      });
    }
  });

  // Sort by frequency (most common first)
  return patterns.sort((a, b) => b.frequency - a.frequency);
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
