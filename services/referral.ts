/**
 * Referral System - Viral Loop for User Growth
 * 
 * Features:
 * - Unique referral codes per user
 * - Track referral conversions
 * - Reward both referrer and referee
 * - Deep link support for app install tracking
 * - Analytics integration
 * 
 * Rewards:
 * - Referrer: Beta Tester Badge upgrade, early feature access
 * - Referee: Skip onboarding tips, personalized welcome
 */

import { logEvent } from './analytics';

let AsyncStorage: any;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {}

const REFERRAL_CODE_KEY = 'referral:myCode';
const REFERRED_BY_KEY = 'referral:referredBy';
const REFERRAL_COUNT_KEY = 'referral:count';
const REFERRAL_REWARDS_KEY = 'referral:rewards';

export interface ReferralStats {
  myCode: string;
  referralCount: number;
  successfulReferrals: number;
  rewards: ReferralReward[];
  referredBy?: string;
}

export interface ReferralReward {
  id: string;
  type: 'badge' | 'feature' | 'recognition';
  name: string;
  description: string;
  unlockedAt: string;
  tier: number;
}

// Reward tiers based on successful referrals
const REWARD_TIERS: { threshold: number; reward: Omit<ReferralReward, 'id' | 'unlockedAt'> }[] = [
  {
    threshold: 1,
    reward: {
      type: 'badge',
      name: 'Community Builder',
      description: 'Invited your first friend to 3mpwr',
      tier: 1,
    },
  },
  {
    threshold: 3,
    reward: {
      type: 'feature',
      name: 'Early Access',
      description: 'Get new features before everyone else',
      tier: 2,
    },
  },
  {
    threshold: 5,
    reward: {
      type: 'badge',
      name: 'Advocate Ambassador',
      description: 'Helped grow the disability advocacy community',
      tier: 3,
    },
  },
  {
    threshold: 10,
    reward: {
      type: 'recognition',
      name: 'Founding Member',
      description: 'Listed in app credits as a founding community member',
      tier: 4,
    },
  },
];

/**
 * Generate a unique referral code for the user
 */
export function generateReferralCode(userId?: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const userPart = userId ? userId.substring(0, 4).toUpperCase() : 'ANON';
  return `3MPWR-${userPart}-${random}${timestamp.slice(-2)}`;
}

/**
 * Get or create the user's referral code
 */
export async function getMyReferralCode(): Promise<string> {
  if (!AsyncStorage) return generateReferralCode();
  
  try {
    let code = await AsyncStorage.getItem(REFERRAL_CODE_KEY);
    if (!code) {
      code = generateReferralCode();
      await AsyncStorage.setItem(REFERRAL_CODE_KEY, code);
      logEvent('referral_code_generated', { code });
    }
    return code;
  } catch {
    return generateReferralCode();
  }
}

/**
 * Record that this user was referred by someone
 */
export async function recordReferral(referrerCode: string): Promise<boolean> {
  if (!AsyncStorage) return false;
  
  try {
    // Check if already referred
    const existing = await AsyncStorage.getItem(REFERRED_BY_KEY);
    if (existing) {
      return false; // Already referred
    }
    
    // Validate code format
    if (!referrerCode.startsWith('3MPWR-')) {
      return false;
    }
    
    await AsyncStorage.setItem(REFERRED_BY_KEY, referrerCode);
    logEvent('referral_recorded', { referrerCode });
    
    // TODO: Notify referrer via backend/push notification
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Increment referral count when a referred user completes onboarding
 */
export async function confirmReferralConversion(): Promise<void> {
  if (!AsyncStorage) return;
  
  try {
    const countStr = await AsyncStorage.getItem(REFERRAL_COUNT_KEY);
    const count = parseInt(countStr || '0', 10) + 1;
    await AsyncStorage.setItem(REFERRAL_COUNT_KEY, count.toString());
    
    // Check for new rewards
    await checkAndUnlockRewards(count);
    
    logEvent('referral_converted', { totalReferrals: count });
  } catch {
    // Ignore errors
  }
}

/**
 * Check if user has unlocked new rewards
 */
async function checkAndUnlockRewards(referralCount: number): Promise<ReferralReward[]> {
  if (!AsyncStorage) return [];
  
  try {
    const rewardsStr = await AsyncStorage.getItem(REFERRAL_REWARDS_KEY);
    const existingRewards: ReferralReward[] = rewardsStr ? JSON.parse(rewardsStr) : [];
    const unlockedTiers = new Set(existingRewards.map(r => r.tier));
    
    const newRewards: ReferralReward[] = [];
    
    for (const tier of REWARD_TIERS) {
      if (referralCount >= tier.threshold && !unlockedTiers.has(tier.reward.tier)) {
        const reward: ReferralReward = {
          ...tier.reward,
          id: `reward-${tier.reward.tier}-${Date.now()}`,
          unlockedAt: new Date().toISOString(),
        };
        newRewards.push(reward);
        logEvent('referral_reward_unlocked', { 
          rewardName: reward.name, 
          tier: reward.tier,
          referralCount,
        });
      }
    }
    
    if (newRewards.length > 0) {
      const allRewards = [...existingRewards, ...newRewards];
      await AsyncStorage.setItem(REFERRAL_REWARDS_KEY, JSON.stringify(allRewards));
    }
    
    return newRewards;
  } catch {
    return [];
  }
}

/**
 * Get full referral stats for the user
 */
export async function getReferralStats(): Promise<ReferralStats> {
  const myCode = await getMyReferralCode();
  
  if (!AsyncStorage) {
    return {
      myCode,
      referralCount: 0,
      successfulReferrals: 0,
      rewards: [],
    };
  }
  
  try {
    const [countStr, rewardsStr, referredBy] = await Promise.all([
      AsyncStorage.getItem(REFERRAL_COUNT_KEY),
      AsyncStorage.getItem(REFERRAL_REWARDS_KEY),
      AsyncStorage.getItem(REFERRED_BY_KEY),
    ]);
    
    return {
      myCode,
      referralCount: parseInt(countStr || '0', 10),
      successfulReferrals: parseInt(countStr || '0', 10),
      rewards: rewardsStr ? JSON.parse(rewardsStr) : [],
      referredBy: referredBy || undefined,
    };
  } catch {
    return {
      myCode,
      referralCount: 0,
      successfulReferrals: 0,
      rewards: [],
    };
  }
}

/**
 * Get the share message for referrals
 */
export function getReferralShareMessage(code: string): { title: string; message: string; url: string } {
  return {
    title: 'Join me on 3mpwr App',
    message: `I'm using 3mpwr App to manage my disability advocacy and wellness. It's been really helpful! Use my referral code ${code} when you sign up. 💪♿`,
    url: `https://3mpwrapp.pages.dev/invite?ref=${code}`,
  };
}

/**
 * Parse referral code from deep link URL
 */
export function parseReferralFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
}

/**
 * Get next reward milestone
 */
export function getNextRewardMilestone(currentCount: number): { threshold: number; reward: string } | null {
  for (const tier of REWARD_TIERS) {
    if (currentCount < tier.threshold) {
      return {
        threshold: tier.threshold,
        reward: tier.reward.name,
      };
    }
  }
  return null; // All rewards unlocked
}
