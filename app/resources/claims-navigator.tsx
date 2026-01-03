/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function ClaimsNavigatorRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="claims"
      reason="claims_navigator_legacy_redirect"
    />
  );
}
