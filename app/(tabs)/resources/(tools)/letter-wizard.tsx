/**
 * Letter Wizard Route - Redirects to Document Factory
 * 
 * This route now redirects to the unified Document Factory which includes
 * all letter generation functionality in the "Letters" tab.
 */

import { Redirect } from "expo-router";

// Export options for Expo Router
export const options = { href: null };

/**
 * Letter Wizard Route - Redirects to Document Factory
 */
export default function LetterWizardRoute() {
  return <Redirect href="/(tabs)/resources/document-factory" />;
}

