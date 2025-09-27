// NetInfo is optional; in web or if native module isn't installed, we fallback to 'online'.
type NetInfoState = { isConnected?: boolean; isInternetReachable?: boolean };
let NetInfo: any = null;
try { NetInfo = require('@react-native-community/netinfo').default; } catch {}
import React from 'react';
import type { AccessibilityRole } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../i18n';
import { useAppPalette } from '../theme/usePalette';

export default function OnlineStatusBadge() {
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [online, setOnline] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    if (!NetInfo) { setOnline(true); return; }
    const handler = (state: NetInfoState) => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    };
    const sub = NetInfo.addEventListener?.(handler);
    NetInfo.fetch?.().then(handler).catch(() => setOnline(false));
    return () => { try { sub && sub(); } catch {} };
  }, []);
  const s = styles(palette, online);
  const label = online === null ? t('network.checking','Checking...') : online ? t('network.online','Online') : t('network.offline','Offline (local only)');
  return (
    <View style={s.container} accessibilityRole={"text" as AccessibilityRole} accessibilityLabel={label}>
      <View style={s.dot} />
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, online: boolean | null) {
  const dot = online == null ? palette.muted : online ? palette.success : palette.warning;
  const text = palette.text;
  const bg = palette.card;
  return StyleSheet.create({
    container: { flexDirection:'row', alignItems:'center', paddingHorizontal:8, paddingVertical:4, borderRadius:16, backgroundColor:bg, alignSelf:'flex-start', marginBottom:8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted },
    dot: { width:8, height:8, borderRadius:4, backgroundColor:dot, marginRight:6 },
    text: { fontSize:12, fontWeight:'600', color:text }
  });
}
