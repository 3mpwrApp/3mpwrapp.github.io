import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function RightsBenefitsCalculator() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('resources.rightsBenefits.title', '💰 Rights & Benefits Calculator')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Rights & Benefits Calculator feedback' })} 
    />
  );
}
