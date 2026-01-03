/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function MasterTrackerHubRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="master"
      reason="master_tracker_hub_legacy_redirect"
    />
  );
}
