/**
 * DEPRECATED: Use /resources/evidence-command-center instead
 * 
 * This file is kept for backward compatibility and redirects to the new consolidated
 * Evidence Command Center PowerTool.
 * 
 * Migration: Upload queue functionality has been consolidated into Evidence Command Center:
 * - Monitor uploads → Evidence Command Center (Locker tab)
 */

import RedirectScreen from '../../components/RedirectScreen';

export default function EvidenceQueueRedirect() {
  return (
    <RedirectScreen
      to="/resources/evidence-command-center"
      tab="locker"
      reason="evidence_queue_legacy_redirect"
    />
  );
}
