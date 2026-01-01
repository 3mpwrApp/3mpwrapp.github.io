/**
 * REDIRECT: AI Case Interpreter -> AI Advocacy Suite
 *
 * This file redirects to the unified AI Advocacy Suite.
 * The "Interpreter" tab in the suite replaces the standalone Case Interpreter.
 */

import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AICaseInterpreterRedirect() {
  return <Redirect href="/(tabs)/advocacy/ai-advocacy-suite?tab=interpreter" />;
}
