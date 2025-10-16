/**
 * Legal Process Automation Route
 * 
 * Lazy-loaded route wrapper for legal automation workflows.
 * The heavy component logic is split into LegalAutomationContent for better bundle optimization.
 */

import React from "react";

import LazyLoadWrapper from "../../../components/LazyLoadWrapper";

// Lazy load the actual legal automation content (54.5KB)
const LegalAutomationContent = React.lazy(() => import("../../../components/LegalAutomationContent"));

/**
 * Legal Automation Route Component
 */
export default function LegalAutomationRoute() {
  return (
    <LazyLoadWrapper 
      component={LegalAutomationContent}
      loadingMessage="Loading Legal Automation..."
    />
  );
}

