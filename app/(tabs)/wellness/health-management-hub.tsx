/**
 * Health Management Hub - Redirect
 * 
 * This feature has been merged into the Unified Health Hub (health-tracker-pro.tsx).
 * This file redirects users to maintain backwards compatibility with bookmarks/links.
 */

import { Redirect } from 'expo-router';

export default function HealthManagementHubRedirect() {
  // Redirect to the unified health hub with meds tab
  return <Redirect href="/(tabs)/wellness/health-tracker-pro" />;
}


