import ComingSoon from '../../../components/ComingSoon';
import { useTranslation } from '../../../i18n';
import { sendFeedbackEmailInternal } from '../../../utils/feedback';

export const options = { href: null };

export default function LetterFactory() {
  const { t } = useTranslation();
  return (
    <ComingSoon 
      title={t('resources.letterFactory.title', '✍️ Letter & Template Factory')}
      subtitle={t('resources.letterFactory.comingSoonDesc', '22+ templates with AI co-writer, tone adjuster (friendly to legal demand), accommodation wizard, union letter builder, multi-language support, and collaboration mode. Generate perfect advocacy letters in minutes.')}
      onFeedback={() => sendFeedbackEmailInternal(t, { subject: 'Letter Factory feedback' })} 
    />
  );
}
