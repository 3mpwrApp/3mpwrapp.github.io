/**
 * REDIRECT: Ask (Quick Q&A) -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Assistant" tab in the suite replaces the standalone Ask feature.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AskRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=assistant" />;
}
