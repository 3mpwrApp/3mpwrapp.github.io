import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to the main tabs layout
  return <Redirect href="/(tabs)" />;
}
