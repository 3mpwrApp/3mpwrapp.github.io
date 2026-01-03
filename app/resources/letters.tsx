/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function LettersRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="letters"
      reason="letters_legacy_redirect"
    />
  );
}
