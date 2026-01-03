/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function DeadlinesListRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="deadlines"
      reason="deadlines_list_legacy_redirect"
    />
  );
}
