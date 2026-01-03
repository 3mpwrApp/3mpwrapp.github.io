import { Redirect } from 'expo-router';

export const options = { href: null };

export default function PrepareAppealRedirect() {
  return <Redirect href="/(tabs)/resources/document-factory" />;
}
