import { Redirect } from 'expo-router';

export const options = { href: null };

export default function AccommodationRequestRedirect() {
  return <Redirect href="/(tabs)/resources/document-factory" />;
}
