/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function CaseTimelineRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="master"
      reason="case_timeline_legacy_redirect"
    />
  );
}
