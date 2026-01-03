/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function RTWPlannerRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="rtw"
      reason="rtw_planner_legacy_redirect"
    />
  );
}
