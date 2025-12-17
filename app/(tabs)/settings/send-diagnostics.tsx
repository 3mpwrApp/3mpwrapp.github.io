import { Stack } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../../../components/A11yPressable';
import { HIT_SLOP_12 } from '../../../../constants/A11Y';
import { addConsoleCapture, collectAndShareDiagnostics } from '../../../../services/diagnostics';
import { useAppPalette } from '../../../../theme/usePalette';

export default function SendDiagnosticsScreen() {
  const palette = useAppPalette();
  React.useEffect(() => {
    // Start capturing console logs for diagnostics
    try { addConsoleCapture(1000); } catch {}
  }, []);

  const send = async () => {
    try {
      await collectAndShareDiagnostics();
    } catch (e) {
      console.error('Send diagnostics failed', e);
      Alert.alert('Diagnostics', 'Unable to gather diagnostics.');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Send Diagnostics' }} />
      <ScrollView contentContainerStyle={{ padding: 16 }} style={{ backgroundColor: palette.background }}>
        <View style={[styles.card, { backgroundColor: palette.surface }]}>
          <Text style={[styles.title, { color: palette.text }]}>Share Diagnostics</Text>
          <Text style={[styles.desc, { color: palette.textSecondary }]}>
            Collect device info, local storage and recent logs to help debugging. This data may include usage information and non-sensitive app state. Do not share private data you do not want to send.
          </Text>
          <A11yPressable onPress={send} style={styles.button} hitSlop={HIT_SLOP_12} accessibilityRole="button">
            <Text style={styles.buttonText}>Collect & Share Diagnostics</Text>
          </A11yPressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, marginBottom: 16 },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
