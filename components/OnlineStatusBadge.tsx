import NetInfo from '@react-native-community/netinfo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

export default function OnlineStatusBadge() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [online, setOnline] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    const sub = NetInfo.addEventListener(state => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    });
    NetInfo.fetch().then(state => setOnline(!!state.isConnected && !!state.isInternetReachable));
    return () => sub && sub();
  }, []);
  const s = styles(palette, online);
  const label = online === null ? t('network.checking','Checking...') : online ? t('network.online','Online') : t('network.offline','Offline (local only)');
  return (
    <View style={s.container} accessibilityRole="status" accessibilityLabel={label}>
      <View style={s.dot} />
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, online: boolean | null) {
  const color = online == null ? palette.muted : online ? '#1a7f37' : '#914d04';
  const bg = online == null ? palette.surface : online ? '#d1fae5' : '#fef3c7';
  const text = online == null ? palette.text : online ? '#065f46' : '#92400e';
  return StyleSheet.create({
    container: { flexDirection:'row', alignItems:'center', paddingHorizontal:8, paddingVertical:4, borderRadius:16, backgroundColor:bg, alignSelf:'flex-start', marginBottom:8 },
    dot: { width:8, height:8, borderRadius:4, backgroundColor:color, marginRight:6 },
    text: { fontSize:12, fontWeight:'600', color:text }
  });
}
