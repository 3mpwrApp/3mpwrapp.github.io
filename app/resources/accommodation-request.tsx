/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function AccommodationRequestRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="accommodation"
      reason="accommodation_request_legacy_redirect"
    />
  );
}
