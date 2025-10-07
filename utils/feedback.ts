import { Alert, Linking } from 'react-native';

// Lightweight helper for sending feedback emails without importing heavy UI modules
export async function sendFeedbackEmailInternal(
  t: (k: string, fb?: string, opts?: any) => string = (k, _fb) => k,
  overrides?: { subject?: string; body?: string }
) {
  const to = 'empowrapp08162025@gmail.com';
  const subject = encodeURIComponent(overrides?.subject || '3mpwr App feedback (beta)');
  const body = overrides?.body ? `&body=${encodeURIComponent(overrides.body)}` : '';
  const url = `mailto:${to}?subject=${subject}${body}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert(
        t('about.emailNotConfiguredTitle', 'Email not configured'),
        t('about.emailNotConfiguredBody', 'Please email {{email}}', { email: to })
      );
      return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    Alert.alert(
      t('about.emailNotConfiguredTitle', 'Email not configured'),
      t('about.emailNotConfiguredBody', 'Please email {{email}}', { email: to })
    );
    return false;
  }
}

export default sendFeedbackEmailInternal;
