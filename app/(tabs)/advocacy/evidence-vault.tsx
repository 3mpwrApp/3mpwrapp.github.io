import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function EvidenceVault() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('advocacy.evidenceVault.title', '🔒 Evidence Vault')}
      subtitle={t('advocacy.evidenceVault.comingSoonDesc', 'Secure document storage with AI categorization, OCR text extraction, timeline builder, redaction tools, and cryptographic chain of custody. Unified evidence management for your case.')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Evidence Vault feedback' })} 
    />
  );
}
