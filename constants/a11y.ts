import { StyleSheet } from "react-native";

// Hit slop constants for different interaction requirements
export const HIT_SLOP_8 = { top: 8, bottom: 8, left: 8, right: 8 } as const;
export const HIT_SLOP_12 = { top: 12, bottom: 12, left: 12, right: 12 } as const;
export const HIT_SLOP_16 = { top: 16, bottom: 16, left: 16, right: 16 } as const;

// WCAG-compliant touch target styles
export const touchTarget = StyleSheet.create({
  min: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  enhanced: {
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  large: {
    minWidth: 56,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Accessibility roles for common elements
export const A11Y_ROLES = {
  header: "header" as const,
  button: "button" as const,
  link: "link" as const,
  textbox: "text" as const,
  search: "search" as const,
  list: "list" as const,
  listitem: "listitem" as const,
  tab: "tab" as const,
  tablist: "tablist" as const,
  alert: "alert" as const,
  dialog: "dialog" as const,
  progressbar: "progressbar" as const,
  menu: "menu" as const,
  menuitem: "menuitem" as const,
  radiogroup: "radiogroup" as const,
  radio: "radio" as const,
  checkbox: "checkbox" as const,
  switch: "switch" as const,
  slider: "adjustable" as const,
  image: "image" as const,
} as const;

// Common accessibility labels and hints
export const A11Y_LABELS = {
  close: "Close",
  back: "Go back",
  menu: "Open menu",
  settings: "Open settings",
  search: "Search",
  filter: "Filter results",
  sort: "Sort options",
  refresh: "Refresh content",
  loading: "Loading",
  error: "Error occurred",
  retry: "Retry",
  save: "Save",
  cancel: "Cancel",
  edit: "Edit",
  delete: "Delete",
  share: "Share",
  favorite: "Add to favorites",
  unfavorite: "Remove from favorites",
} as const;

// Focus management constants
export const FOCUS_DELAY = {
  short: 100,
  medium: 200,
  long: 300,
} as const;

// Announcement priorities for screen readers
export const ANNOUNCEMENT_PRIORITY = {
  low: "polite" as const,
  high: "assertive" as const,
} as const;
