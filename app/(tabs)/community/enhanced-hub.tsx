/**
 * Enhanced Community Hub Route
 * 
 * Lazy-loaded route wrapper for the enhanced community hub.
 * The heavy component logic is split into EnhancedHubContent for better bundle optimization.
 */

import React from "react";

import LazyLoadWrapper from "../../../components/LazyLoadWrapper";

// Lazy load the actual enhanced hub content (43.0KB)
const EnhancedHubContent = React.lazy(() => import("../../../components/EnhancedHubContent"));

/**
 * Enhanced Hub Route Component
 */
export default function EnhancedHubRoute() {
  return (
    <LazyLoadWrapper 
      component={EnhancedHubContent}
      loadingMessage="Loading Community Hub..."
    />
  );
}

