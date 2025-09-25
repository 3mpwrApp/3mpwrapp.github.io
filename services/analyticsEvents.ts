// Central registry of analytics event names to prevent typos and enable automated validation.
// Add new event identifiers here and update category comments as needed.

export const ANALYTICS_EVENTS = {
  // Advocacy / Campaigns
  CAMPAIGN_CREATE: "campaign_create",
  CAMPAIGN_JOIN: "campaign_join",
  CAMPAIGN_LEAVE: "campaign_leave",
  CAMPAIGN_SHARE: "campaign_share",
  ADVOCACY_COLLECTIVE_SUBMIT: "advocacy.collective.submit",
  ADVOCACY_ASK_SUBMITTED: "advocacy.ask.submitted",
  ADVOCACY_WORLD_VIEW: "advocacy.world.view",

  // Bookmarks
  BOOKMARK_ADD: "bookmark_add",
  BOOKMARK_REMOVE: "bookmark_remove",
  BOOKMARK_CLEAR_ALL: "bookmark_clear_all",

  // Trackers (Wellness)
  TRACKER_ADD_ENTRY: "tracker_add_entry",
  TRACKER_SHARE: "tracker_share",

  // Letters / Evidence insertion
  LETTER_INSERT_FROM_TRACKERS: "letter_insert_from_trackers",

  // Media / Podcasts
  PODCAST_SHARE: "podcast_share",

  // Account / Auth
  ACCOUNT_DELETE: "account_delete",
  ACCOUNT_DELETE_FAILED: "account_delete_failed",

  // Energy / Wellness utilities
  ENERGY_SET_DAILY: "energy_set_daily",
  ENERGY_SPEND: "energy_spend",
  ENERGY_RESET_DAY: "energy_reset_day",

  // Opposite action (mental health feature)
  WELLNESS_OPPOSITE_NEXT_STEP: "wellness_opposite_next_step",

  // Notifications
  NOTIFICATION_DELIVERED: "notification.delivered",
  NOTIFICATION_QUIET_SUPPRESSED: "notification.quiet_suppressed",
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Utility: constant-time lookup set for validation
export const ANALYTICS_EVENT_SET: Record<string, true> = Object.values(ANALYTICS_EVENTS).reduce(
  (acc, name) => { acc[name] = true; return acc; },
  {} as Record<string, true>,
);
