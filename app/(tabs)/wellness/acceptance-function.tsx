import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AcceptanceFunctionRedirect() {
  return <Redirect href="/(tabs)/wellness/mental-wellness-toolkit" />;
}

