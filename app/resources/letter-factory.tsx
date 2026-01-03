/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function LetterFactoryRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="letters"
      reason="letter_factory_legacy_redirect"
    />
  );
}
