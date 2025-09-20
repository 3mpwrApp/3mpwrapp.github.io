// Central registry for bookmarkable routes with translation keys for labels.
// Each entry: route (expo-router path), tKey (i18n key), fallback label.
export type RouteEntry = { route: string; tKey: string; fallback: string };

export const BOOKMARKABLE_ROUTES: RouteEntry[] = [
  { route: '/(tabs)/resources/index', tKey: 'nav.resources', fallback: 'Resources' },
  { route: '/(tabs)/campaigns/index', tKey: 'nav.campaigns', fallback: 'Campaigns' },
  { route: '/(tabs)/community/index', tKey: 'nav.community', fallback: 'Community' },
  { route: '/(tabs)/wellness', tKey: 'nav.wellness', fallback: 'Wellness' },
  { route: '/(tabs)/advocacy/index', tKey: 'nav.advocacy', fallback: 'Advocacy' },
  { route: '/(tabs)/settings', tKey: 'nav.settings', fallback: 'Settings' },
  { route: '/(tabs)/whatsnew/index', tKey: 'nav.whatsnew', fallback: "What's New" },
  { route: '/(tabs)/profile', tKey: 'nav.profile', fallback: 'Profile' },
];

export function findRouteEntry(route: string) {
  return BOOKMARKABLE_ROUTES.find(r => r.route === route);
}

export function isRouteBookmarkable(route: string) {
  return Boolean(findRouteEntry(route));
}
