/**
 * Peer Support Matching Route
 * 
 * Lazy-loaded route wrapper for peer support matching.
 * The heavy component logic is split into PeerSupportContent for better bundle optimization.
 */

import React from "react";

import LazyLoadWrapper from "../../../components/LazyLoadWrapper";

// Lazy load the actual peer support content (43.4KB)
const PeerSupportContent = React.lazy(() => import("../../../components/PeerSupportContent"));

/**
 * Peer Support Route Component
 */
export default function PeerSupportRoute() {
  return (
    <LazyLoadWrapper 
      component={PeerSupportContent}
      loadingMessage="Loading Peer Support..."
    />
  );
}

