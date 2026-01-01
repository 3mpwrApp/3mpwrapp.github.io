/**
 * REDIRECT: AI Gov Navigator -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Navigator" tab in the suite replaces the standalone Gov Navigator.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AIGovNavigatorRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=navigator" />;
}
