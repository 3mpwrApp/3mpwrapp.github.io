import { Redirect } from 'expo-router';

export const options = { href: null };

export default function PainForecastRedirect() {
  return <Redirect href="/(tabs)/wellness/energy-command-center" />;
}

