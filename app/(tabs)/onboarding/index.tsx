import { Link } from 'expo-router';
import { Text, View } from 'react-native';

import { useAppPalette } from '../../../theme/usePalette';

export default function OnboardingIndex(){
  const palette = useAppPalette();
  return (
    <View style={{ flex: 1, padding: 16 }} accessibilityLabel="Onboarding">
      <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700' }}>Onboarding</Text>
      <Link href="/onboarding/first7" asChild>
        <Text style={{ color: palette.primary, textDecorationLine: 'underline', marginTop: 8 }}>Your First 7 Days</Text>
      </Link>
    </View>
  );
}
