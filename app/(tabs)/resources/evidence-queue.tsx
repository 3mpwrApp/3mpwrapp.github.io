import { Redirect } from 'expo-router';

export const options = { href: null };

export default function EvidenceQueueRedirect() {
  return <Redirect href="/(tabs)/advocacy/evidence-command-center" />;
}

