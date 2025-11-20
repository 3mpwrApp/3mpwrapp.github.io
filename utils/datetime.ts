/**
 * Datetime utilities for 3mpwr App
 * 
 * Ensures all dates are handled in EST/EDT (America/Toronto timezone)
 * following Ontario's timezone conventions.
 */

/**
 * Get the user's timezone - defaults to America/Toronto (EST/EDT)
 * This covers Ontario, Canada where most app users are located.
 */
export const APP_TIMEZONE = 'America/Toronto';

/**
 * Format a date to EST/EDT timezone string
 */
export function toLocaleDateString(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

/**
 * Format a date and time to EST/EDT timezone string
 */
export function toLocaleString(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleString('en-CA', { 
    timeZone: APP_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

/**
 * Format a time to EST/EDT timezone string
 */
export function toLocaleTimeString(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-CA', { 
    timeZone: APP_TIMEZONE,
    timeStyle: 'short'
  });
}

/**
 * Get current date in EST/EDT timezone as ISO date string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  const now = new Date();
  const estDateStr = now.toLocaleDateString('en-CA', { 
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return estDateStr;
}

/**
 * Get current hour in EST/EDT timezone (0-23)
 */
export function getCurrentHourEST(): number {
  const now = new Date();
  const estTimeStr = now.toLocaleTimeString('en-CA', { 
    timeZone: APP_TIMEZONE,
    hour12: false,
    hour: '2-digit'
  });
  return parseInt(estTimeStr, 10);
}

/**
 * Convert UTC timestamp to EST/EDT Date object
 */
export function fromUTCTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Format an event date/time for display (EST/EDT)
 */
export function formatEventDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-CA', {
    timeZone: APP_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
