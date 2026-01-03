/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function AppealCoachRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="appeals"
      reason="appeal_coach_legacy_redirect"
    />
  );
}
