/* eslint-disable no-restricted-syntax */
import { Platform, Text, View } from 'react-native';

/**
 * Emergency diagnostic screen - shows if main app fails to render
 * WCAG 2.2 AAA: Using #595959 for textSecondary (7:1 contrast ratio on white)
 */
export default function EmergencyDiagnostic() {
  // WCAG 2.2 AAA: #595959 provides 7:1 contrast ratio on white background
  const palette = { background: '#fff', primary: '#DC143C', text: '#000', textSecondary: '#595959' };
  
  return (
    <View style={{ 
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: palette.background,
      padding: 20 
    }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: palette.primary, marginBottom: 20 }}>
        🚨 Emergency Diagnostic
      </Text>
      <Text style={{ fontSize: 16, color: palette.text, marginBottom: 10 }}>
        Platform: {Platform.OS}
      </Text>
      <Text style={{ fontSize: 16, color: palette.text, marginBottom: 10 }}>
        React Native: {Platform.constants?.reactNativeVersion?.major || 'unknown'}
      </Text>
      <Text style={{ fontSize: 14, color: palette.textSecondary, textAlign: 'center', marginTop: 20 }}>
        If you see this screen, the minimal renderer works.
      </Text>
      {/* WCAG 2.2 AAA: Using palette.textSecondary (#595959) for 7:1 contrast */}
      <Text style={{ fontSize: 14, color: palette.textSecondary, textAlign: 'center', marginTop: 10 }}>
        Main app failed to load. Check browser console (F12).
      </Text>
    </View>
  );
}

