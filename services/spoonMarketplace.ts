/**
 * Spoon Theory Marketplace Service
 * 
 * Community marketplace for trading energy and help.
 * Users can offer help on high-energy days and request help on low-energy days.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SpoonOffer {
  id: string;
  userId: string;
  userName: string;
  offerType: 'call' | 'research' | 'writing' | 'proofreading' | 'listening' | 'advocacy' | 'other';
  description: string;
  energyCost: 'low' | 'medium' | 'high'; // How much energy this requires
  skills: string[];
  availability: string; // "Today 2-5pm", "This week"
  spoonsOffered: number; // Energy coins offered
  status: 'active' | 'claimed' | 'completed';
  createdAt: number;
  expiresAt: number;
}

export interface SpoonRequest {
  id: string;
  userId: string;
  userName: string;
  requestType: 'call' | 'research' | 'writing' | 'proofreading' | 'listening' | 'advocacy' | 'other';
  description: string;
  urgency: 'low' | 'medium' | 'high';
  spoonsOffered: number; // Energy coins offered in return
  status: 'open' | 'matched' | 'completed';
  createdAt: number;
  matchedWith?: string; // User ID of helper
}

export interface SpoonBalance {
  earned: number;
  spent: number;
  balance: number; // earned - spent
  helpedCount: number;
  receivedHelpCount: number;
  reputation: number; // 0-100
}

const OFFERS_KEY = 'spoons:offers:v1';
const REQUESTS_KEY = 'spoons:requests:v1';
const BALANCE_KEY = 'spoons:balance:v1';

/**
 * Post an offer to help
 */
export async function postOffer(
  offer: Omit<SpoonOffer, 'id' | 'status' | 'createdAt' | 'expiresAt'>
): Promise<SpoonOffer> {
  const newOffer: SpoonOffer = {
    ...offer,
    id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'active',
    createdAt: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
  };
  
  const offers = await getOffers();
  offers.unshift(newOffer);
  await saveOffers(offers);
  
  return newOffer;
}

/**
 * Post a request for help
 */
export async function postRequest(
  request: Omit<SpoonRequest, 'id' | 'status' | 'createdAt'>
): Promise<SpoonRequest> {
  const newRequest: SpoonRequest = {
    ...request,
    id: `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'open',
    createdAt: Date.now(),
  };
  
  const requests = await getRequests();
  requests.unshift(newRequest);
  await saveRequests(requests);
  
  return newRequest;
}

/**
 * Get all active offers
 */
export async function getOffers(): Promise<SpoonOffer[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFERS_KEY);
    if (!raw) return [];
    const offers: SpoonOffer[] = JSON.parse(raw);
    // Filter out expired
    return offers.filter(o => o.expiresAt > Date.now());
  } catch {
    return [];
  }
}

/**
 * Get all open requests
 */
export async function getRequests(): Promise<SpoonRequest[]> {
  try {
    const raw = await AsyncStorage.getItem(REQUESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save offers
 */
async function saveOffers(offers: SpoonOffer[]): Promise<void> {
  await AsyncStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}

/**
 * Save requests
 */
async function saveRequests(requests: SpoonRequest[]): Promise<void> {
  await AsyncStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
}

/**
 * Claim an offer (respond to someone's offer)
 */
export async function claimOffer(offerId: string, userId: string): Promise<void> {
  const offers = await getOffers();
  const updated = offers.map(o => 
    o.id === offerId ? { ...o, status: 'claimed' as const } : o
  );
  await saveOffers(updated);
  
  // Award spoons to both parties
  await awardSpoons(userId, 10, 'claimed_offer');
}

/**
 * Match a request with a helper
 */
export async function matchRequest(requestId: string, helperId: string): Promise<void> {
  const requests = await getRequests();
  const updated = requests.map(r => 
    r.id === requestId ? { ...r, status: 'matched' as const, matchedWith: helperId } : r
  );
  await saveRequests(updated);
}

/**
 * Complete a help exchange
 */
export async function completeExchange(
  offerId: string,
  helperId: string,
  receiverId: string
): Promise<void> {
  // Update offer status
  const offers = await getOffers();
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return;
  
  const updated = offers.map(o => 
    o.id === offerId ? { ...o, status: 'completed' as const } : o
  );
  await saveOffers(updated);
  
  // Award spoons
  await awardSpoons(helperId, offer.spoonsOffered, 'helped');
  await awardSpoons(receiverId, 5, 'received_help'); // Small bonus for receiving
  
  // Update reputation
  await updateReputation(helperId, 5);
}

/**
 * Get user's spoon balance
 */
export async function getBalance(userId: string): Promise<SpoonBalance> {
  try {
    const raw = await AsyncStorage.getItem(`${BALANCE_KEY}_${userId}`);
    if (!raw) {
      return { earned: 0, spent: 0, balance: 0, helpedCount: 0, receivedHelpCount: 0, reputation: 50 };
    }
    return JSON.parse(raw);
  } catch {
    return { earned: 0, spent: 0, balance: 0, helpedCount: 0, receivedHelpCount: 0, reputation: 50 };
  }
}

/**
 * Award spoons to user
 */
async function awardSpoons(
  userId: string,
  amount: number,
  reason: 'helped' | 'received_help' | 'claimed_offer'
): Promise<void> {
  const balance = await getBalance(userId);
  
  balance.earned += amount;
  balance.balance += amount;
  
  if (reason === 'helped') {
    balance.helpedCount += 1;
  } else if (reason === 'received_help') {
    balance.receivedHelpCount += 1;
  }
  
  await AsyncStorage.setItem(`${BALANCE_KEY}_${userId}`, JSON.stringify(balance));
}

/**
 * Update user reputation
 */
async function updateReputation(userId: string, delta: number): Promise<void> {
  const balance = await getBalance(userId);
  balance.reputation = Math.max(0, Math.min(100, balance.reputation + delta));
  await AsyncStorage.setItem(`${BALANCE_KEY}_${userId}`, JSON.stringify(balance));
}

/**
 * Match offers with requests
 */
export function matchOffersAndRequests(
  offers: SpoonOffer[],
  requests: SpoonRequest[]
): Array<{ offer: SpoonOffer; request: SpoonRequest; matchScore: number }> {
  const matches: Array<{ offer: SpoonOffer; request: SpoonRequest; matchScore: number }> = [];
  
  for (const request of requests) {
    if (request.status !== 'open') continue;
    
    for (const offer of offers) {
      if (offer.status !== 'active') continue;
      
      let score = 0;
      
      // Type match
      if (offer.offerType === request.requestType) {
        score += 50;
      }
      
      // Skills match
      if (offer.skills.length > 0) {
        score += 20;
      }
      
      // Urgency/energy alignment
      if (request.urgency === 'high' && offer.energyCost === 'low') {
        score += 15;
      }
      
      // Spoon balance
      if (offer.spoonsOffered >= request.spoonsOffered) {
        score += 15;
      }
      
      if (score >= 50) {
        matches.push({ offer, request, matchScore: score });
      }
    }
  }
  
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Get top helpers (leaderboard)
 */
export async function getTopHelpers(limit: number = 10): Promise<Array<{ userId: string; userName: string; balance: SpoonBalance }>> {
  // In production, this would query Firestore for all users' balances
  // For now, return empty array
  return [];
}
