import { Redirect } from 'expo-router';

export const options = { href: null };

export default function CaseTimelineRedirect() {
  return <Redirect href="/(tabs)/resources/case-tracker-pro" />;
}
