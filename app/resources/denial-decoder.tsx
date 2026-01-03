/**
 * DEPRECATED: Use /resources/case-tracker-pro instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function DenialDecoderRedirect() {
  return (
    <RedirectScreen
      to="/resources/case-tracker-pro"
      tab="denial"
      reason="denial_decoder_legacy_redirect"
    />
  );
}
