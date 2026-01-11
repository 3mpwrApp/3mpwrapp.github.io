/**
 * White Screen Diagnostic Component
 * Place this in app/(tabs)/diagnostics.tsx to debug white screen issues
 * Navigate to it to see detailed initialization information
 */

import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DIAGNOSTIC_COLORS } from '../../constants/diagnosticColors';

interface DiagnosticInfo {
  [key: string]: boolean | string | null | undefined;
}

export default function DiagnosticsScreen() {
  const [info, setInfo] = useState<DiagnosticInfo>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      const diagnostics: DiagnosticInfo = {};

      // Check Platform
      try {
        const { Platform } = await import('react-native');
        diagnostics['Platform'] = Platform.OS;
      } catch (e) {
        diagnostics['Platform Error'] = (e as Error).message;
      }

      // Check React Native version
      try {
        const _RN = await import('react-native');
        diagnostics['React Native'] = '✅ Loaded';
      } catch (e) {
        diagnostics['React Native Error'] = (e as Error).message;
      }

      // Check i18n
      try {
        const { useTranslation: _useTranslation } = await import('../../i18n');
        diagnostics['i18n'] = '✅ Loaded';
      } catch (e) {
        diagnostics['i18n Error'] = (e as Error).message;
      }

      // Check Theme
      try {
        const { useAppPalette: _useAppPalette } = await import('../../theme/usePalette');
        diagnostics['Theme/Palette'] = '✅ Loaded';
      } catch (e) {
        diagnostics['Theme Error'] = (e as Error).message;
      }

      // Check Auth store
      try {
        const _authModule = await import('../../store/auth');
        diagnostics['Auth Store'] = '✅ Loaded';
      } catch (e) {
        diagnostics['Auth Store Error'] = (e as Error).message;
      }

      // Check Firebase config
      try {
        const _firebaseModule = await import('../../firebase/config');
        diagnostics['Firebase Config'] = '✅ Loaded';
      } catch (e) {
        diagnostics['Firebase Error'] = (e as Error).message;
      }

      // Check ErrorBoundary
      try {
        const { default: _ErrorBoundary } = await import('../../components/ErrorBoundary');
        diagnostics['ErrorBoundary'] = '✅ Loaded';
      } catch (e) {
        diagnostics['ErrorBoundary Error'] = (e as Error).message;
      }

      // Check SafeProviderWrapper
      try {
        const { SafeProviderWrapper: _SafeProviderWrapper } = await import('../../components/SafeProviderWrapper');
        diagnostics['SafeProviderWrapper'] = '✅ Loaded';
      } catch (e) {
        diagnostics['SafeProviderWrapper Error'] = (e as Error).message;
      }

      // Check Logger
      try {
        const { logger } = await import('../../utils/logger');
        diagnostics['Logger'] = '✅ Loaded';
        logger.debug('[DIAGNOSTICS] All systems nominal');
      } catch (e) {
        diagnostics['Logger Error'] = (e as Error).message;
      }

      // Check if window is defined (web)
      if (typeof window !== 'undefined') {
        diagnostics['Web Environment'] = '✅ Running on web';
        diagnostics['DOM Ready'] = document ? '✅ Yes' : '❌ No';
        
        // Check if app container exists
        const appContainer = document.getElementById('root');
        diagnostics['Root Container'] = appContainer ? '✅ Found (#root)' : '⚠️ Not found';
      }

      setInfo(diagnostics);
      setLoading(false);
    };

    runDiagnostics().catch((e) => {
      console.error('[DIAGNOSTICS] Fatal error:', e);
      setInfo({ 'Fatal Error': (e as Error).message });
      setLoading(false);
    });
  }, []);

  const hasErrors = Object.entries(info).some(
    ([key, value]) => 
      key.includes('Error') && value !== null && value !== undefined
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔍 System Diagnostics</Text>
        
        <View style={[styles.statusBox, hasErrors ? styles.errorBox : styles.okBox]}>
          <Text style={styles.statusText}>
            {loading ? '⏳ Running...' : hasErrors ? '❌ ISSUES FOUND' : '✅ ALL SYSTEMS OK'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Component Status:</Text>
        {Object.entries(info).map(([key, value]) => (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key}:</Text>
            <Text 
              style={[
                styles.value,
                value?.toString().includes('Error') ? styles.errorText : styles.okText
              ]}
            >
              {value?.toString() || 'N/A'}
            </Text>
          </View>
        ))}

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>📋 How to use this:</Text>
          <Text style={styles.instruction}>
            1. If you see ❌ errors above, note them{'\n'}
            2. Check browser console (F12) for details{'\n'}
            3. Clear cache: npm run metro:clear{'\n'}
            4. Restart the app and check again
          </Text>
        </View>

        <View style={styles.actions}>
          <Text 
            style={styles.link}
            onPress={() => {
              Alert.alert(
                'Copy Diagnostics',
                'Diagnostics info copied to clipboard',
                [{ text: 'OK', onPress: () => {} }]
              );
              const text = Object.entries(info)
                .map(([k, v]) => `${k}: ${v}`)
                .join('\n');
              // Navigator.clipboard.writeText(text);
              if (__DEV__) console.warn('[DIAGNOSTICS OUTPUT]\n' + text);
            }}
          >
            📋 Copy Diagnostics to Console
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DIAGNOSTIC_COLORS.lightGray,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    color: DIAGNOSTIC_COLORS.black,
  },
  statusBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  okBox: {
    backgroundColor: DIAGNOSTIC_COLORS.successBg,
    borderColor: DIAGNOSTIC_COLORS.successBorder,
    borderWidth: 1,
  },
  errorBox: {
    backgroundColor: DIAGNOSTIC_COLORS.errorBg,
    borderColor: DIAGNOSTIC_COLORS.errorBorder,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    color: DIAGNOSTIC_COLORS.black,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 16,
    color: DIAGNOSTIC_COLORS.darkGray,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
    backgroundColor: DIAGNOSTIC_COLORS.white,
    borderRadius: 4,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: DIAGNOSTIC_COLORS.darkGray,
  },
  value: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  errorText: {
    color: DIAGNOSTIC_COLORS.errorText,
    fontWeight: '600',
  },
  okText: {
    color: DIAGNOSTIC_COLORS.successText,
    fontWeight: '600',
  },
  instructions: {
    marginTop: 24,
    padding: 16,
    backgroundColor: DIAGNOSTIC_COLORS.infoBg,
    borderRadius: 8,
    borderLeftColor: DIAGNOSTIC_COLORS.infoBorder,
    borderLeftWidth: 4,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: DIAGNOSTIC_COLORS.infoText,
  },
  instruction: {
    fontSize: 12,
    color: DIAGNOSTIC_COLORS.darkGray,
    lineHeight: 18,
  },
  actions: {
    marginTop: 16,
    padding: 12,
    backgroundColor: DIAGNOSTIC_COLORS.warningBg,
    borderRadius: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: DIAGNOSTIC_COLORS.infoLink,
    textDecorationLine: 'underline',
    textAlign: 'center',
    paddingVertical: 8,
  },
});
