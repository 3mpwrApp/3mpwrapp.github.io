import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function RightsBenefitsCalculator() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('resources.rightsBenefits.title', '💰 Rights & Benefits Calculator')}
      subtitle={t('resources.rightsBenefits.comingSoonDesc', 'Eligibility scanner, provincial comparator, benefits optimizer, interactive policy explorer, impact simulator, and community intel. Find hidden programs and maximize your support.')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Rights & Benefits Calculator feedback' })} 
    />
  );
}
