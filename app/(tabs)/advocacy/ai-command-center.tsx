/**
 * REDIRECT: AI Command Center -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Command" tab in the suite replaces the standalone AI Command Center.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AICommandCenterRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=command" />;
}
