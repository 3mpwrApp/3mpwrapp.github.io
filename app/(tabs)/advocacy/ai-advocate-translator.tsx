/**
 * REDIRECT: AI Advocate Translator -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Translator" tab in the suite replaces the standalone Advocate Translator.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AIAdvocateTranslatorRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=translator" />;
}
