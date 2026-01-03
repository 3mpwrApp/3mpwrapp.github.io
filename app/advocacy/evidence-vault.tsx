/**
 * DEPRECATED: Use /resources/evidence-command-center instead
 * 
 * This file is kept for backward compatibility and redirects to the new consolidated
 * Evidence Command Center PowerTool.
 */

import RedirectScreen from '../../components/RedirectScreen';

export default function EvidenceVaultRedirect() {
  return (
    <RedirectScreen
      to="/resources/evidence-command-center"
      tab="locker"
    />
  );
}
