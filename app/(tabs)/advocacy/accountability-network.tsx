import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function AccountabilityNetwork() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('advocacy.accountabilityNetwork.title', '🔍 Accountability Network')}
      subtitle={t('advocacy.accountabilityNetwork.comingSoonDesc', 'Community-powered lawyer ratings, advocate finder, case tracker, and coalition builder. Your network for accountability and collective action.')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Accountability Network feedback' })} 
    />
  );
}
