/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function LetterWizardRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="letters"
      reason="letter_wizard_legacy_redirect"
    />
  );
}
