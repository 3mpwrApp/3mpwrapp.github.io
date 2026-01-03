import { Redirect } from 'expo-router';

export const options = { href: null };

export default function DoctorVisitPrepRedirect() {
  return <Redirect href="/(tabs)/wellness/health-tracker-pro" />;
}

