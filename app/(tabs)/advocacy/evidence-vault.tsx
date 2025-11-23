import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function EvidenceVault() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('advocacy.evidenceVault.title', '🔒 Evidence Vault')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Evidence Vault feedback' })} 
    />
  );
}
