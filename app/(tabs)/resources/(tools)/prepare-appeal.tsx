import ComingSoon from '../../../../components/ComingSoon';
import { useTranslation } from '../../../../i18n';
import { sendFeedbackEmailInternal } from '../../../../utils/feedback';

export const options = { href: null };

export default function PrepareAppeal() {
  const { t } = useTranslation();
  return <ComingSoon title={t('resources.prepare_appeal','Prepare to Appeal (Coming soon)')} onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Prepare Appeal feedback' })} />;
}