/**
 * Beta Tester Badge Service
 * 
 * Manages beta tester status and badge display.
 * Includes Firestore sync for cross-device persistence.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const BETA_TESTER_KEY = 'user:beta_tester_status';
const BETA_BADGE_SEEN_KEY = 'beta:badge_welcome_seen';
const BETA_EARNED_DATE_KEY = 'beta:earned_date';

export interface BetaTesterStatus {
  isBetaTester: boolean;
  earnedDate: string | null;
  badgeUnlocked: boolean;
  welcomeSeen: boolean;
}

/**
 * Get the current beta tester status
 */
export async function getBetaTesterStatus(): Promise<BetaTesterStatus> {
  try {
    const statusStr = await AsyncStorage.getItem(BETA_TESTER_KEY);
    if (statusStr) {
      return JSON.parse(statusStr);
    }
  } catch (error) {
    console.error('[BetaBadge] Failed to get status:', error);
  }

  // Default status
  return {
    isBetaTester: false,
    earnedDate: null,
    badgeUnlocked: false,
    welcomeSeen: false,
  };
}

/**
 * Grant beta tester status to a user
 */
export async function grantBetaTesterStatus(): Promise<BetaTesterStatus> {
  try {
    const now = new Date().toISOString();
    const status: BetaTesterStatus = {
      isBetaTester: true,
      earnedDate: now,
      badgeUnlocked: true,
      welcomeSeen: false,
    };

    await AsyncStorage.setItem(BETA_TESTER_KEY, JSON.stringify(status));
    await AsyncStorage.setItem(BETA_EARNED_DATE_KEY, now);

    // Sync to Firestore if user is logged in
    await syncBetaStatusToFirestore(status);

    return status;
  } catch (error) {
    console.error('[BetaBadge] Failed to grant status:', error);
    throw error;
  }
}

/**
 * Revoke beta tester status
 */
export async function revokeBetaTesterStatus(): Promise<void> {
  try {
    const status: BetaTesterStatus = {
      isBetaTester: false,
      earnedDate: null,
      badgeUnlocked: false,
      welcomeSeen: false,
    };

    await AsyncStorage.setItem(BETA_TESTER_KEY, JSON.stringify(status));
    await AsyncStorage.removeItem(BETA_EARNED_DATE_KEY);

    // Sync to Firestore
    await syncBetaStatusToFirestore(status);
  } catch (error) {
    console.error('[BetaBadge] Failed to revoke status:', error);
  }
}

/**
 * Mark the beta badge welcome message as seen
 */
export async function markBetaBadgeWelcomeSeen(): Promise<void> {
  try {
    const status = await getBetaTesterStatus();
    status.welcomeSeen = true;
    await AsyncStorage.setItem(BETA_TESTER_KEY, JSON.stringify(status));
    await AsyncStorage.setItem(BETA_BADGE_SEEN_KEY, 'true');
  } catch (error) {
    console.error('[BetaBadge] Failed to mark welcome seen:', error);
  }
}

/**
 * Check if user should see the beta badge welcome
 */
export async function shouldShowBetaBadgeWelcome(): Promise<boolean> {
  try {
    const status = await getBetaTesterStatus();
    return status.isBetaTester && status.badgeUnlocked && !status.welcomeSeen;
  } catch {
    return false;
  }
}

/**
 * Sync beta status to Firestore (cross-device persistence)
 */
async function syncBetaStatusToFirestore(status: BetaTesterStatus): Promise<void> {
  try {
    // Check if user is logged in
    const { getAuth } = await import('firebase/auth');
    const { doc, setDoc } = await import('firebase/firestore');
    const { getDB } = await import('./firestore');

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      // Not logged in, skip sync
      return;
    }

    const db = await getDB();
    const userRef = doc(db, 'users', user.uid);

    await setDoc(
      userRef,
      {
        betaTester: status.isBetaTester,
        betaEarnedDate: status.earnedDate,
        betaBadgeUnlocked: status.badgeUnlocked,
      },
      { merge: true }
    );
  } catch (error) {
    // Sync failure is not critical
    console.warn('[BetaBadge] Failed to sync to Firestore:', error);
  }
}

/**
 * Load beta status from Firestore (on login)
 */
export async function loadBetaStatusFromFirestore(userId: string): Promise<void> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { getDB } = await import('./firestore');

    const db = await getDB();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      
      if (data.betaTester) {
        const status: BetaTesterStatus = {
          isBetaTester: data.betaTester === true,
          earnedDate: data.betaEarnedDate || null,
          badgeUnlocked: data.betaBadgeUnlocked === true,
          welcomeSeen: false, // Don't sync welcome seen status
        };

        await AsyncStorage.setItem(BETA_TESTER_KEY, JSON.stringify(status));
        
        if (status.earnedDate) {
          await AsyncStorage.setItem(BETA_EARNED_DATE_KEY, status.earnedDate);
        }
      }
    }
  } catch (error) {
    console.warn('[BetaBadge] Failed to load from Firestore:', error);
  }
}

/**
 * Check if user is a beta tester (quick check)
 */
export async function isBetaTester(): Promise<boolean> {
  const status = await getBetaTesterStatus();
  return status.isBetaTester;
}

/**
 * Get beta tester badge display data
 */
export interface BetaBadgeDisplay {
  show: boolean;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
}

export async function getBetaBadgeDisplay(): Promise<BetaBadgeDisplay> {
  const status = await getBetaTesterStatus();

  if (!status.isBetaTester || !status.badgeUnlocked) {
    return {
      show: false,
      title: '',
      subtitle: '',
      icon: '',
      color: '',
    };
  }

  const earnedDate = status.earnedDate 
    ? new Date(status.earnedDate).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      })
    : 'Beta Tester';

  return {
    show: true,
    title: '🚀 Beta Tester',
    subtitle: `Joined ${earnedDate}`,
    icon: 'shield-star',
    color: '#6366f1', // Indigo color for beta badge
  };
}

/**
 * Grant beta status to all current users (admin function)
 */
export async function grantBetaToAllUsers(): Promise<{ success: number; failed: number }> {
  try {
    const { collection, getDocs, doc, updateDoc } = await import('firebase/firestore');
    const { getDB } = await import('./firestore');

    const db = await getDB();
    const usersSnapshot = await getDocs(collection(db, 'users'));

    let success = 0;
    let failed = 0;

    const now = new Date().toISOString();

    for (const userDoc of usersSnapshot.docs) {
      try {
        await updateDoc(doc(db, 'users', userDoc.id), {
          betaTester: true,
          betaEarnedDate: now,
          betaBadgeUnlocked: true,
        });
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    console.error('[BetaBadge] Failed to grant beta to all users:', error);
    return { success: 0, failed: 0 };
  }
}
