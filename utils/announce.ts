import { AccessibilityInfo } from 'react-native';

let pending: string[] = [];
let timer: any = null;

/** Queue short messages to avoid flooding screen readers. */
export function announce(msg: string, delayMs = 120) {
  if (!msg) return;
  pending.push(msg);
  if (timer) return;
  timer = setTimeout(() => {
    const text = pending.join('. ');
    pending = [];
    timer = null;
    AccessibilityInfo.announceForAccessibility?.(text);
  }, delayMs);
}

/** Immediate single announcement (bypasses queue) */
export function announceNow(msg: string) {
  pending = [];
  if (timer) { clearTimeout(timer); timer = null; }
  AccessibilityInfo.announceForAccessibility?.(msg);
}

export function flushAnnouncements() {
  if (pending.length) announceNow(pending.join('. '));
}

export function isScreenReaderEnabled(): Promise<boolean> {
  return AccessibilityInfo.isScreenReaderEnabled?.() || Promise.resolve(false);
}
