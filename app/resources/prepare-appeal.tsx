/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function PrepareAppealRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="appeals"
      reason="prepare_appeal_legacy_redirect"
    />
  );
}
