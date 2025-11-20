/**
 * Service for submitting user-created events and campaigns to 3mpwr App for review
 */


import { logger } from '../utils/logger';

const SUBMISSION_WEBHOOK_URL = 'https://3mpwrapp.pages.dev/api/submissions';

export type EventSubmission = {
  type: 'event';
  data: {
    id: string;
    title: string;
    description: string;
    date: string;
    time?: string;
    duration?: number;
    location?: string;
    isVirtual?: boolean;
    virtualLink?: string;
    asl?: boolean;
    captions?: boolean;
    stepFree?: boolean;
    sensorySpace?: boolean;
    wheelchairAccessible?: boolean;
    quietRoom?: boolean;
    parkingAccessible?: boolean;
    assistiveListening?: boolean;
    braille?: boolean;
    serviceAnimalsWelcome?: boolean;
    energyCost?: 'low' | 'medium' | 'high';
    requiresRSVP?: boolean;
    rsvpDetails?: string;
    organizer?: string;
    organizerContact?: string;
    category?: string;
    tags?: string[];
  };
  submittedBy: {
    uid: string;
    email?: string;
    displayName?: string;
  };
  submittedAt: number;
};

export type CampaignSubmission = {
  type: 'campaign';
  data: {
    id: string;
    title: string;
    summary: string;
    description: string;
    target: string;
    goalCount?: number;
    contactEmail?: string;
    websiteUrl?: string;
    petitionUrl?: string;
    category?: string;
    tags?: string[];
  };
  submittedBy: {
    uid: string;
    email?: string;
    displayName?: string;
  };
  submittedAt: number;
};

/**
 * Submit an event to 3mpwr App for review and publication
 */
export async function submitEventTo3mpwr(
  event: EventSubmission['data'],
  user: { uid: string; email?: string; displayName?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const submission: EventSubmission = {
      type: 'event',
      data: event,
      submittedBy: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      submittedAt: Date.now(),
    };

    logger.log('[SubmitTo3mpwr] Submitting event:', event.id);

    // Send to webhook/API endpoint
    const response = await fetch(SUBMISSION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (response.ok) {
      logger.log('[SubmitTo3mpwr] Event submitted successfully:', event.id);
      
      // Also store in local AsyncStorage as backup
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storageKey = 'submissions:events:v1';
        const existing = await AsyncStorage.default.getItem(storageKey);
        const submissions = existing ? JSON.parse(existing) : [];
        submissions.push(submission);
        await AsyncStorage.default.setItem(storageKey, JSON.stringify(submissions));
      } catch (storageErr) {
        logger.warn('[SubmitTo3mpwr] Failed to cache submission:', storageErr);
      }

      return {
        success: true,
        message: `✅ Event "${event.title}" submitted to 3mpwr App for review!\n\nOur team will review your submission and publish it to the main calendar if approved.`,
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('[SubmitTo3mpwr] Event submission failed:', error);
    
    // Store failed submission for retry
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const storageKey = 'submissions:events:pending:v1';
      const existing = await AsyncStorage.default.getItem(storageKey);
      const pending = existing ? JSON.parse(existing) : [];
      pending.push({
        type: 'event',
        data: event,
        submittedBy: user,
        submittedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      await AsyncStorage.default.setItem(storageKey, JSON.stringify(pending));
      
      return {
        success: false,
        message: `📱 Event saved locally for review.\n\n"${event.title}" will be submitted to 3mpwr App when connection is restored.\n\nYou can continue using the app - we'll handle the submission in the background.`,
      };
    } catch {
      return {
        success: false,
        message: `❌ Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`,
      };
    }
  }
}

/**
 * Submit a campaign to 3mpwr App for review and publication
 */
export async function submitCampaignTo3mpwr(
  campaign: CampaignSubmission['data'],
  user: { uid: string; email?: string; displayName?: string }
): Promise<{ success: boolean; message: string }> {
  try {
    const submission: CampaignSubmission = {
      type: 'campaign',
      data: campaign,
      submittedBy: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
      submittedAt: Date.now(),
    };

    logger.log('[SubmitTo3mpwr] Submitting campaign:', campaign.id);

    // Send to webhook/API endpoint
    const response = await fetch(SUBMISSION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (response.ok) {
      logger.log('[SubmitTo3mpwr] Campaign submitted successfully:', campaign.id);
      
      // Also store in local AsyncStorage as backup
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        const storageKey = 'submissions:campaigns:v1';
        const existing = await AsyncStorage.default.getItem(storageKey);
        const submissions = existing ? JSON.parse(existing) : [];
        submissions.push(submission);
        await AsyncStorage.default.setItem(storageKey, JSON.stringify(submissions));
      } catch (storageErr) {
        logger.warn('[SubmitTo3mpwr] Failed to cache submission:', storageErr);
      }

      return {
        success: true,
        message: `✅ Campaign "${campaign.title}" submitted to 3mpwr App for review!\n\nOur team will review your submission and add it to the campaigns list if approved.`,
      };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    logger.error('[SubmitTo3mpwr] Campaign submission failed:', error);
    
    // Store failed submission for retry
    try {
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const storageKey = 'submissions:campaigns:pending:v1';
      const existing = await AsyncStorage.default.getItem(storageKey);
      const pending = existing ? JSON.parse(existing) : [];
      pending.push({
        type: 'campaign',
        data: campaign,
        submittedBy: user,
        submittedAt: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      await AsyncStorage.default.setItem(storageKey, JSON.stringify(pending));
      
      return {
        success: false,
        message: `📱 Campaign saved locally for review.\n\n"${campaign.title}" will be submitted to 3mpwr App when connection is restored.\n\nYou can continue using the app - we'll handle the submission in the background.`,
      };
    } catch {
      return {
        success: false,
        message: `❌ Submission failed: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`,
      };
    }
  }
}

/**
 * Get count of pending submissions
 */
export async function getPendingSubmissionsCount(): Promise<number> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const [eventsPending, campaignsPending] = await Promise.all([
      AsyncStorage.default.getItem('submissions:events:pending:v1'),
      AsyncStorage.default.getItem('submissions:campaigns:pending:v1'),
    ]);
    
    const eventsCount = eventsPending ? JSON.parse(eventsPending).length : 0;
    const campaignsCount = campaignsPending ? JSON.parse(campaignsPending).length : 0;
    
    return eventsCount + campaignsCount;
  } catch {
    return 0;
  }
}

/**
 * Retry all pending submissions
 */
export async function retryPendingSubmissions(): Promise<{ synced: number; pending: number }> {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    let synced = 0;
    let pending = 0;
    
    // Retry events
    const eventsPendingKey = 'submissions:events:pending:v1';
    const eventsPending = await AsyncStorage.default.getItem(eventsPendingKey);
    if (eventsPending) {
      const submissions = JSON.parse(eventsPending);
      const stillPending = [];
      
      for (const sub of submissions) {
        const result = await submitEventTo3mpwr(sub.data, sub.submittedBy);
        if (result.success) {
          synced++;
        } else {
          stillPending.push(sub);
          pending++;
        }
      }
      
      if (stillPending.length > 0) {
        await AsyncStorage.default.setItem(eventsPendingKey, JSON.stringify(stillPending));
      } else {
        await AsyncStorage.default.removeItem(eventsPendingKey);
      }
    }
    
    // Retry campaigns
    const campaignsPendingKey = 'submissions:campaigns:pending:v1';
    const campaignsPending = await AsyncStorage.default.getItem(campaignsPendingKey);
    if (campaignsPending) {
      const submissions = JSON.parse(campaignsPending);
      const stillPending = [];
      
      for (const sub of submissions) {
        const result = await submitCampaignTo3mpwr(sub.data, sub.submittedBy);
        if (result.success) {
          synced++;
        } else {
          stillPending.push(sub);
          pending++;
        }
      }
      
      if (stillPending.length > 0) {
        await AsyncStorage.default.setItem(campaignsPendingKey, JSON.stringify(stillPending));
      } else {
        await AsyncStorage.default.removeItem(campaignsPendingKey);
      }
    }
    
    return { synced, pending };
  } catch (error) {
    logger.error('[SubmitTo3mpwr] Retry failed:', error);
    return { synced: 0, pending: 0 };
  }
}
