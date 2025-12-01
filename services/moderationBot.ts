/**
 * Automated Moderation Bot
 * 
 * Filters community chat messages for:
 * - Inappropriate content
 * - Spam and scams
 * - Hate speech and harassment
 * - Personal information (PII)
 * - Crisis/self-harm language (for appropriate intervention)
 * 
 * Used across all community features: chat, mutual aid, forums, etc.
 */

import { logError } from '../utils/errorLogger';

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  category?: 'spam' | 'hate' | 'pii' | 'crisis' | 'inappropriate' | 'scam';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  flagForReview?: boolean;
  suggestedAction?: 'warn' | 'block' | 'remove' | 'alert_admin' | 'crisis_intervention';
}

// Regex patterns for different violation types
const PATTERNS = {
  // Spam & Scams
  spam: [
    /\b(buy now|click here|limited time|act now|free money|earn \$\d+|make money fast)\b/i,
    /\b(viagra|cialis|pharmacy|pills)\b/i,
    /\b(weight loss|lose \d+ pounds|fat burner)\b/i,
    /\b(crypto|bitcoin|investment opportunity|trading signals)\b/i,
    /\b(winner|you've won|claim your prize|congratulations you)\b/i,
    /(http|www)\S+\s+(http|www)/i, // Multiple URLs
  ],
  
  // Hate Speech & Harassment
  hate: [
    /\b(n[i1]gg[ae]r|f[a4]gg[o0]t|tr[a4]nny|ret[a4]rd)\b/i,
    /\b(k[i1]ke|ch[i1]nk|sp[i1]c|wet?back)\b/i,
    /\b(kill yourself|kys|end it|worthless)\b/i,
    /\b(you should die|hope you die)\b/i,
  ],
  
  // Personal Information (PII)
  pii: [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN
    /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln)\b/i, // Street addresses
    /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s*\d[A-Z]{2}\b/, // UK postcodes
    /\b\d{5}(-\d{4})?\b.*\b(street|st|avenue|ave|road|rd)\b/i, // US ZIP + street
  ],
  
  // Crisis/Self-Harm (for intervention, not blocking)
  crisis: [
    /\b(want to die|going to kill myself|planning to end|suicide plan)\b/i,
    /\b(cutting myself|self harm|hurt myself)\b/i,
    /\b(overdose|take all the pills)\b/i,
  ],
  
  // Inappropriate/Sexual Content
  inappropriate: [
    /\b(porn|xxx|sex tape|nudes|dick pic)\b/i,
    /\b(f[u*]ck|sh[i1]t|b[i1]tch|[a4]ss ?hole|c[u*]nt)\b/i,
    /\b(cocaine|heroin|meth|ecstasy|molly)\b/i,
  ],
  
  // Scams & Fraud
  scam: [
    /\b(send me \$|cash ?app|venmo|zelle|paypal\.me)\b/i,
    /\b(nigerian prince|inheritance|lottery|sweepstakes)\b/i,
    /\b(your account|security alert|verify your|confirm your)\b/i,
    /\b(western union|wire transfer|gift cards?)\b/i,
  ],
};

// Keywords that require human review but aren't auto-blocked
const FLAG_FOR_REVIEW = [
  'meet up',
  'in person',
  'my address',
  'discord',
  'telegram',
  'whatsapp',
  'follow me on',
  'check out my',
];

// Disability-specific allowed terms (don't flag these)
const ALLOWED_DISABILITY_TERMS = [
  'retard',
  'spastic',
  'lame',
  'crazy',
  'insane',
  'blind',
  'deaf',
  'dumb',
];

/**
 * Check if message contains allowed disability-related reclaimed language
 */
function isReclaimedLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  // Allow disability community members to use certain terms in context
  // e.g., "as a retard myself", "we're all crazy here"
  const reclaimContext = /\b(as a|i'm|we're|our|reclaim|proud)\b/i;
  if (reclaimContext.test(lower)) {
    return ALLOWED_DISABILITY_TERMS.some(term => lower.includes(term));
  }
  return false;
}

/**
 * Moderate a message and return whether it should be allowed
 */
export function moderateMessage(text: string, _authorUid?: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { allowed: false, reason: 'Empty message' };
  }
  
  const lower = text.toLowerCase();
  
  // Check for reclaimed language first
  if (isReclaimedLanguage(text)) {
    return { allowed: true };
  }
  
  // Check spam
  for (const pattern of PATTERNS.spam) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'Message contains spam or promotional content',
        category: 'spam',
        severity: 'medium',
        suggestedAction: 'remove',
      };
    }
  }
  
  // Check hate speech
  for (const pattern of PATTERNS.hate) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'Message contains hate speech or harassment',
        category: 'hate',
        severity: 'high',
        suggestedAction: 'block',
      };
    }
  }
  
  // Check PII
  for (const pattern of PATTERNS.pii) {
    if (pattern.test(text)) { // Don't lowercase for PII patterns
      return {
        allowed: false,
        reason: 'Message contains personal information (phone, address, SSN)',
        category: 'pii',
        severity: 'high',
        suggestedAction: 'remove',
      };
    }
  }
  
  // Check scams
  for (const pattern of PATTERNS.scam) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'Message appears to be a scam or phishing attempt',
        category: 'scam',
        severity: 'high',
        suggestedAction: 'block',
      };
    }
  }
  
  // Check crisis language (allow but flag for intervention)
  for (const pattern of PATTERNS.crisis) {
    if (pattern.test(lower)) {
      return {
        allowed: true, // Don't block - they need support
        reason: 'Message contains crisis/self-harm language',
        category: 'crisis',
        severity: 'critical',
        flagForReview: true,
        suggestedAction: 'crisis_intervention',
      };
    }
  }
  
  // Check inappropriate content (softer block)
  for (const pattern of PATTERNS.inappropriate) {
    if (pattern.test(lower)) {
      return {
        allowed: false,
        reason: 'Message contains inappropriate or offensive content',
        category: 'inappropriate',
        severity: 'medium',
        suggestedAction: 'warn',
      };
    }
  }
  
  // Check for review flags
  for (const keyword of FLAG_FOR_REVIEW) {
    if (lower.includes(keyword)) {
      return {
        allowed: true,
        flagForReview: true,
        reason: `Message contains "${keyword}" - flagged for manual review`,
        severity: 'low',
        suggestedAction: 'alert_admin',
      };
    }
  }
  
  // Message is clean
  return { allowed: true };
}

/**
 * Get a user-friendly message for why their message was blocked
 */
export function getModerationMessage(result: ModerationResult): string {
  if (result.allowed) {
    return '';
  }
  
  switch (result.category) {
    case 'spam':
      return '🚫 This message looks like spam or advertising. Please keep conversations focused on peer support.';
    case 'hate':
      return '🚫 This message violates our community guidelines on respect and kindness. Hate speech is not allowed.';
    case 'pii':
      return '🚫 For your safety, please don\'t share personal information like phone numbers, addresses, or SSNs in public chat.';
    case 'scam':
      return '🚫 This message appears to be a scam or phishing attempt. Please don\'t request money or personal information.';
    case 'inappropriate':
      return '🚫 This message contains inappropriate content. Let\'s keep our community welcoming and safe for everyone.';
    default:
      return '🚫 This message violates our community guidelines. Please review the rules and try again.';
  }
}

/**
 * Get crisis intervention message for user
 */
export function getCrisisInterventionMessage(): string {
  return `
🆘 **Crisis Support Resources**

If you're in immediate danger:
• **Call 911** (US/Canada) or your local emergency number
• **988 Suicide & Crisis Lifeline**: Call or text 988
• **Crisis Text Line**: Text HOME to 741741

You're not alone. Our community is here to support you, but professional help is important for immediate safety.
  `.trim();
}

/**
 * Rate limit checking (prevent spam flooding)
 */
const messageHistory = new Map<string, number[]>();

export function checkRateLimit(authorUid: string, maxMessages = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const userHistory = messageHistory.get(authorUid) || [];
  
  // Remove old timestamps outside window
  const recent = userHistory.filter(ts => now - ts < windowMs);
  
  if (recent.length >= maxMessages) {
    return false; // Rate limit exceeded
  }
  
  // Add current message
  recent.push(now);
  messageHistory.set(authorUid, recent);
  
  // Cleanup old entries periodically
  if (Math.random() < 0.1) {
    for (const [uid, timestamps] of messageHistory.entries()) {
      const valid = timestamps.filter(ts => now - ts < windowMs);
      if (valid.length === 0) {
        messageHistory.delete(uid);
      } else {
        messageHistory.set(uid, valid);
      }
    }
  }
  
  return true; // Within rate limit
}

/**
 * Log moderation action to Firestore (for admin review)
 */
export async function logModerationAction(
  messageId: string,
  authorUid: string,
  text: string,
  result: ModerationResult,
  chatId: string
): Promise<void> {
  try {
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    if (!db) return;
    
    await addDoc(collection(db, 'moderation_logs'), {
      messageId,
      authorUid,
      text: text.substring(0, 200), // Truncate for storage
      chatId,
      result: {
        allowed: result.allowed,
        category: result.category,
        severity: result.severity,
        reason: result.reason,
      },
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    logError('ModerationBot', 'Failed to log moderation action', error);
  }
}

/**
 * Check if user is banned from community features
 */
export async function isUserBanned(uid: string): Promise<boolean> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    if (!db) return false;
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    const userData = userDoc.data();
    
    return userData?.banned === true;
  } catch (error) {
    logError('ModerationBot', 'Failed to check ban status', error);
    return false;
  }
}

export default {
  moderateMessage,
  getModerationMessage,
  getCrisisInterventionMessage,
  checkRateLimit,
  logModerationAction,
  isUserBanned,
};
