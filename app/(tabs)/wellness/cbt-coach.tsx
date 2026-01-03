import { Redirect } from 'expo-router';

export const options = { href: null };

export default function CbtCoachRedirect() {
  return <Redirect href="/(tabs)/wellness/mental-wellness-toolkit" />;
}

