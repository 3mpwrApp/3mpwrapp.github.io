import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { useAppPalette } from '../../../theme/usePalette';

export const options = { href: null };

export default function EmergencyWalletCardRedirect() {
  const router = useRouter();
  const palette = useAppPalette();

  useEffect(() => {
    // Redirect to Settings with the emergency card section open
    router.replace('/(tabs)/settings?open=emergencyCard' as any);
  }, [router]);

  return (
    <View style={{ flex:1, backgroundColor: palette.background, padding:16, alignItems:'flex-start', justifyContent:'center' }}>
      <Text style={{ color: palette.text, fontSize: 18, fontWeight: '600' }}>Moving…</Text>
      <Text style={{ color: palette.text, opacity: 0.8, marginTop: 6 }}>Emergency Wallet Card now lives in Settings.</Text>
    </View>
  );
}
