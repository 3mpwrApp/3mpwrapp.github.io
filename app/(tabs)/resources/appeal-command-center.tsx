import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function AppealCommandCenter() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('resources.appealCommand.title', '⚖️ Appeal Command Center')}
      subtitle={t('resources.appealCommand.comingSoonDesc', 'Military-grade deadline tracking, AI denial decoder, evidence strength meter, precedent finder, appeals tribunal prep, and success rate estimator. Never lose an appeal due to missed deadlines or weak evidence.')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Appeal Command Center feedback' })} 
    />
  );
}
