/**
 * DEPRECATED: Use /resources/evidence-command-center instead
 * 
 * This file is kept for backward compatibility and redirects to the new consolidated
 * Evidence Command Center PowerTool.
 * 
 * Migration: This feature has been consolidated into Evidence Command Center:
 * - Upload/Queue → Evidence Command Center (Locker tab)
 * - Browse Evidence → Evidence Command Center (Locker tab)
 */

import RedirectScreen from '../../components/RedirectScreen';

export default function EvidenceLockerRedirect() {
  return (
    <RedirectScreen
      to="/resources/evidence-command-center"
      tab="locker"
      reason="evidence_locker_legacy_redirect"
    />
  );
}
