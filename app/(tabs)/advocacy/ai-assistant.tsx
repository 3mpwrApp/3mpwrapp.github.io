/**
 * REDIRECT: AI Assistant -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Assistant" tab in the suite replaces the standalone AI Assistant.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AIAssistantRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=assistant" />;
}
