import { Redirect } from 'expo-router';

export const options = { href: null };

export default function DistressToleranceRedirect() {
  return <Redirect href="/(tabs)/wellness/mental-wellness-toolkit" />;
}

