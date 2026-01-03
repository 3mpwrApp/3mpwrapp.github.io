/**
 * DEPRECATED: Use /wellness/health-tracker-pro instead
 */
import { Redirect } from 'expo-router';

export const options = { href: null };

export default function HealthTrackerRedirect() {
  return <Redirect href="/(tabs)/wellness/health-tracker-pro" />;
}

