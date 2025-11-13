/**
 * Accountability Network Service
 * 
 * Crowdsourced database for rating employers, insurers, lawyers, and medical providers.
 * Users can search, rate, and review entities based on their disability advocacy experiences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type EntityType = 'employer' | 'insurer' | 'lawyer' | 'medical_provider' | 'government_agency';
export type IssueType = 
  | 'accommodation_refusal'
  | 'benefit_denial'
  | 'discrimination'
  | 'harassment'
  | 'delay'
  | 'communication'
  | 'medical_gaslighting'
  | 'positive_experience';

export interface AccountabilityReview {
  id: string;
  entityName: string;
  entityType: EntityType;
  jurisdiction: string; // Province/territory code
  issueType: IssueType;
  rating: number; // 1-5 stars
  outcomeType: 'won_appeal' | 'lost_appeal' | 'settled' | 'ongoing' | 'resolved_positively' | 'unresolved';
  timelineDescription: string; // "3 months", "ongoing for 1 year"
  advice: string; // What would you tell others
  detailedReview?: string; // Optional longer review
  wouldRecommend: boolean;
  anonymous: boolean;
  verified: boolean; // Admin-verified
  reportedAt: number;
  userId?: string; // Only if not anonymous
  helpfulCount: number; // Upvotes from other users
  flagCount: number; // Reports for moderation
}

export interface EntitySummary {
  entityName: string;
  entityType: EntityType;
  averageRating: number;
  totalReviews: number;
  recommendationRate: number; // % who would recommend
  successRate: number; // % of won appeals/positive outcomes
  avgTimelineDays: number;
  recentReviews: AccountabilityReview[];
  commonIssues: Array<{ type: IssueType; count: number }>;
  jurisdictions: string[];
}

const REVIEWS_KEY = 'accountability:reviews:v1';
const HELPFUL_KEY = 'accountability:helpful:v1';

/**
 * Submit a new accountability review
 */
export async function submitReview(
  review: Omit<AccountabilityReview, 'id' | 'reportedAt' | 'helpfulCount' | 'flagCount' | 'verified'>
): Promise<AccountabilityReview> {
  const newReview: AccountabilityReview = {
    ...review,
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    reportedAt: Date.now(),
    helpfulCount: 0,
    flagCount: 0,
    verified: false, // Requires admin verification
  };
  
  const reviews = await getReviews();
  reviews.unshift(newReview);
  await saveReviews(reviews);
  
  return newReview;
}

/**
 * Get all reviews
 */
export async function getReviews(): Promise<AccountabilityReview[]> {
  try {
    const raw = await AsyncStorage.getItem(REVIEWS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save reviews
 */
async function saveReviews(reviews: AccountabilityReview[]): Promise<void> {
  try {
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews:', error);
  }
}

/**
 * Search for entity by name
 */
export async function searchEntity(query: string): Promise<EntitySummary[]> {
  const reviews = await getReviews();
  const lowerQuery = query.toLowerCase();
  
  // Group reviews by entity
  const entityMap = new Map<string, AccountabilityReview[]>();
  
  reviews.forEach(review => {
    if (review.entityName.toLowerCase().includes(lowerQuery)) {
      const key = `${review.entityName.toLowerCase()}_${review.entityType}`;
      const existing = entityMap.get(key) || [];
      existing.push(review);
      entityMap.set(key, existing);
    }
  });
  
  // Generate summaries
  const summaries: EntitySummary[] = [];
  
  entityMap.forEach((entityReviews) => {
    const summary = generateEntitySummary(entityReviews);
    summaries.push(summary);
  });
  
  // Sort by total reviews (most reviewed first)
  return summaries.sort((a, b) => b.totalReviews - a.totalReviews);
}

/**
 * Get reviews for a specific entity
 */
export async function getEntityReviews(
  entityName: string,
  entityType: EntityType
): Promise<EntitySummary | null> {
  const reviews = await getReviews();
  const lowerName = entityName.toLowerCase();
  
  const entityReviews = reviews.filter(
    r => r.entityName.toLowerCase() === lowerName && r.entityType === entityType
  );
  
  if (entityReviews.length === 0) return null;
  
  return generateEntitySummary(entityReviews);
}

/**
 * Generate summary statistics for an entity
 */
function generateEntitySummary(reviews: AccountabilityReview[]): EntitySummary {
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  
  const recommendCount = reviews.filter(r => r.wouldRecommend).length;
  const recommendationRate = (recommendCount / totalReviews) * 100;
  
  const successOutcomes = ['won_appeal', 'resolved_positively'];
  const successCount = reviews.filter(r => successOutcomes.includes(r.outcomeType)).length;
  const completedCases = reviews.filter(r => r.outcomeType !== 'ongoing').length;
  const successRate = completedCases > 0 ? (successCount / completedCases) * 100 : 0;
  
  // Parse timeline descriptions (simplified - assumes format like "3 months", "90 days")
  const timelineDays = reviews
    .map(r => parseTimelineDescription(r.timelineDescription))
    .filter(d => d > 0);
  const avgTimelineDays = timelineDays.length > 0 
    ? timelineDays.reduce((sum, d) => sum + d, 0) / timelineDays.length 
    : 0;
  
  // Count common issues
  const issueMap = new Map<IssueType, number>();
  reviews.forEach(r => {
    issueMap.set(r.issueType, (issueMap.get(r.issueType) || 0) + 1);
  });
  const commonIssues = Array.from(issueMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);
  
  // Get unique jurisdictions
  const jurisdictions = [...new Set(reviews.map(r => r.jurisdiction))];
  
  // Get recent reviews (verified first, then by date)
  const recentReviews = [...reviews]
    .sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      return b.reportedAt - a.reportedAt;
    })
    .slice(0, 10);
  
  return {
    entityName: reviews[0].entityName, // Use original casing
    entityType: reviews[0].entityType,
    averageRating,
    totalReviews,
    recommendationRate,
    successRate,
    avgTimelineDays: Math.round(avgTimelineDays),
    recentReviews,
    commonIssues,
    jurisdictions,
  };
}

/**
 * Parse timeline description to days (simplified)
 */
function parseTimelineDescription(description: string): number {
  const lower = description.toLowerCase();
  
  // Match "X days"
  const daysMatch = lower.match(/(\d+)\s*days?/);
  if (daysMatch) return parseInt(daysMatch[1], 10);
  
  // Match "X weeks"
  const weeksMatch = lower.match(/(\d+)\s*weeks?/);
  if (weeksMatch) return parseInt(weeksMatch[1], 10) * 7;
  
  // Match "X months"
  const monthsMatch = lower.match(/(\d+)\s*months?/);
  if (monthsMatch) return parseInt(monthsMatch[1], 10) * 30;
  
  // Match "X years"
  const yearsMatch = lower.match(/(\d+)\s*years?/);
  if (yearsMatch) return parseInt(yearsMatch[1], 10) * 365;
  
  return 0;
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string): Promise<void> {
  const reviews = await getReviews();
  const updated = reviews.map(r => 
    r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
  );
  await saveReviews(updated);
  
  // Track which reviews user found helpful
  const helpful = await getHelpfulReviews();
  helpful.push(reviewId);
  await AsyncStorage.setItem(HELPFUL_KEY, JSON.stringify(helpful));
}

/**
 * Get reviews user marked as helpful
 */
export async function getHelpfulReviews(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(HELPFUL_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Flag review for moderation
 */
export async function flagReview(reviewId: string, reason: string): Promise<void> {
  const reviews = await getReviews();
  const updated = reviews.map(r => 
    r.id === reviewId ? { ...r, flagCount: r.flagCount + 1 } : r
  );
  await saveReviews(updated);
  
  // In production, send to Firestore moderation queue
   
  console.warn(`Review ${reviewId} flagged: ${reason}`);
}

/**
 * Get top-rated entities by type
 */
export async function getTopRated(
  entityType: EntityType,
  limit: number = 10
): Promise<EntitySummary[]> {
  const reviews = await getReviews();
  const filtered = reviews.filter(r => r.entityType === entityType);
  
  // Group by entity name
  const entityMap = new Map<string, AccountabilityReview[]>();
  filtered.forEach(review => {
    const key = review.entityName.toLowerCase();
    const existing = entityMap.get(key) || [];
    existing.push(review);
    entityMap.set(key, existing);
  });
  
  // Generate summaries and sort
  const summaries: EntitySummary[] = [];
  entityMap.forEach(entityReviews => {
    if (entityReviews.length >= 3) { // Minimum 3 reviews
      summaries.push(generateEntitySummary(entityReviews));
    }
  });
  
  return summaries
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, limit);
}

/**
 * Filter reviews by jurisdiction and issue
 */
export async function filterReviews(filters: {
  entityType?: EntityType;
  jurisdiction?: string;
  issueType?: IssueType;
  minRating?: number;
}): Promise<AccountabilityReview[]> {
  let reviews = await getReviews();
  
  if (filters.entityType) {
    reviews = reviews.filter(r => r.entityType === filters.entityType);
  }
  
  if (filters.jurisdiction) {
    reviews = reviews.filter(r => r.jurisdiction === filters.jurisdiction);
  }
  
  if (filters.issueType) {
    reviews = reviews.filter(r => r.issueType === filters.issueType);
  }
  
  if (filters.minRating !== undefined) {
    reviews = reviews.filter(r => r.rating >= (filters.minRating || 0));
  }
  
  return reviews.sort((a, b) => b.reportedAt - a.reportedAt);
}

/**
 * Get statistics for the entire network
 */
export interface NetworkStats {
  totalReviews: number;
  totalEntities: number;
  avgRating: number;
  topJurisdiction: string;
  mostCommonIssue: IssueType;
  overallSuccessRate: number;
}

export async function getNetworkStats(): Promise<NetworkStats> {
  const reviews = await getReviews();
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      totalEntities: 0,
      avgRating: 0,
      topJurisdiction: 'ON',
      mostCommonIssue: 'benefit_denial',
      overallSuccessRate: 0,
    };
  }
  
  // Count unique entities
  const entities = new Set(reviews.map(r => `${r.entityName}_${r.entityType}`));
  const totalEntities = entities.size;
  
  // Average rating
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
  
  // Top jurisdiction
  const jurisdictionMap = new Map<string, number>();
  reviews.forEach(r => {
    jurisdictionMap.set(r.jurisdiction, (jurisdictionMap.get(r.jurisdiction) || 0) + 1);
  });
  const topJurisdiction = Array.from(jurisdictionMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'ON';
  
  // Most common issue
  const issueMap = new Map<IssueType, number>();
  reviews.forEach(r => {
    issueMap.set(r.issueType, (issueMap.get(r.issueType) || 0) + 1);
  });
  const mostCommonIssue = Array.from(issueMap.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'benefit_denial';
  
  // Overall success rate
  const successOutcomes = ['won_appeal', 'resolved_positively'];
  const successCount = reviews.filter(r => successOutcomes.includes(r.outcomeType)).length;
  const completedCases = reviews.filter(r => r.outcomeType !== 'ongoing').length;
  const overallSuccessRate = completedCases > 0 ? (successCount / completedCases) * 100 : 0;
  
  return {
    totalReviews,
    totalEntities,
    avgRating,
    topJurisdiction,
    mostCommonIssue,
    overallSuccessRate,
  };
}
