/**
 * REDIRECT: Assistant Hub -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The suite replaces the standalone Assistant Hub with a better organized interface.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AssistantHubRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite" />;
}
