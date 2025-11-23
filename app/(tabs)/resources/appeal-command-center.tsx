import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function AppealCommandCenter() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('resources.appealCommand.title', '⚖️ Appeal Command Center')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Appeal Command Center feedback' })} 
    />
  );
}
