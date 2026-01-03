/**
 * DEPRECATED: Use /resources/document-factory instead
 */
import RedirectScreen from '../../components/RedirectScreen';

export default function TemplatesGalleryRedirect() {
  return (
    <RedirectScreen
      to="/resources/document-factory"
      tab="templates"
      reason="templates_gallery_legacy_redirect"
    />
  );
}
