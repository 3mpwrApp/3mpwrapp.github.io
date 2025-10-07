import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function AppealCoach() {
  const { t } = useTranslation();
  return <ComingSoon title={t('resources.appeal_coach','Appeal Coach (Coming soon)')} onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Appeal Coach feedback' })} />;
}
