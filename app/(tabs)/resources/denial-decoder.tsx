import { Redirect } from 'expo-router';

export const options = { href: null };

export default function DenialDecoderRedirect() {
  return <Redirect href="/(tabs)/resources/case-tracker-pro" />;
}
