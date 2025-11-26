/* eslint-disable no-restricted-syntax */
import { Platform, Text, View } from 'react-native';

/**
 * Emergency diagnostic screen - shows if main app fails to render
 */
export default function EmergencyDiagnostic() {
  const palette = { background: '#fff', primary: '#DC143C', text: '#000', textSecondary: '#666' };
  
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
      <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 10 }}>
        Main app failed to load. Check browser console (F12).
      </Text>
    </View>
  );
}

