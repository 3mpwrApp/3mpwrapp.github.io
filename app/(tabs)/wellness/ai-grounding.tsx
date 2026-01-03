import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AiGroundingRedirect() {
  return <Redirect href="/(tabs)/wellness/mental-wellness-toolkit" />;
}

