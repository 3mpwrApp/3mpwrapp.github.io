/**
 * Master Letter Generator Wizard Route
 * 
 * Lazy-loaded route wrapper for the letter wizard.
 * The heavy component logic is split into LetterWizardContent for better bundle optimization.
 */

import React from "react";

import LazyLoadWrapper from "../../../../components/LazyLoadWrapper";

// Export options for Expo Router
export const options = { href: null };

// Lazy load the actual wizard content (66.5KB)
const LetterWizardContent = React.lazy(() => import("../../../../components/LetterWizardContent"));

/**
 * Letter Wizard Route Component
 */
export default function LetterWizardRoute() {
  return (
    <LazyLoadWrapper 
      component={LetterWizardContent}
      loadingMessage="Loading Letter Wizard..."
    />
  );
}

