/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function DeadlinesRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="deadlines"
      reason="deadlines_legacy_redirect"
    />
  );
}
