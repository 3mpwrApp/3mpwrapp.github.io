import { StyleSheet, Text, View } from 'react-native';

import { useAppPalette } from '../theme/usePalette';

export default function ComingSoon({ title = 'Coming soon', details }: { title?: string; details?: string }) {
  const palette = useAppPalette();
  return (
    <View style={[styles.box, { borderColor: palette.muted, backgroundColor: palette.surface }]}> 
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      {!!details && <Text style={{ color: palette.text, opacity: 0.85 }}>{details}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 12, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  title: { fontWeight: '700', marginBottom: 4 },
});
