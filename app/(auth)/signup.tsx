import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { auth, db } from '../../firebase/config';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [working, setWorking] = useState(false);

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      setError(t('auth.missingFields', 'All fields required'));
      return;
    }
    
    // Check if Firebase auth and db are available
    if (!auth || !db) {
      const msg = t('auth.unavailable', 'Authentication is not available in this mode');
      setError(msg);
      Alert.alert(t('common.errorTitle', 'Error'), msg);
      return;
    }
    
    try {
      setWorking(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName.trim(),
        createdAt: serverTimestamp(),
      });
      // Route to personalized onboarding wizard
      router.replace('/onboarding');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
      Alert.alert(t('common.errorTitle', 'Error'), err?.message || 'Registration failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel={t('auth.registerScreen', 'Register screen')}>
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('auth.registerTitle', 'Register')}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={t('auth.displayName', 'Display Name')}
        placeholderTextColor={palette.text + '77'}
        autoCapitalize="words"
        value={displayName}
        onChangeText={setDisplayName}
        accessibilityLabel={t('auth.displayName', 'Display Name')}
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder={t('auth.email', 'Email')}
        placeholderTextColor={palette.text + '77'}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel={t('auth.email', 'Email')}
        returnKeyType="next"
      />

      <TextInput
        style={styles.input}
        placeholder={t('auth.password', 'Password')}
        placeholderTextColor={palette.text + '77'}
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
        accessibilityLabel={t('auth.password', 'Password')}
        returnKeyType="done"
        onSubmitEditing={handleRegister}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <A11yPressable
        onPress={handleRegister}
        disabled={working}
        accessibilityRole="button"
        accessibilityLabel={t('auth.createAccount', 'Create Account')}
        style={[styles.button, working && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>{working ? t('common.working', 'Working...') : t('auth.createAccount', 'Create Account')}</Text>
      </A11yPressable>
      
      <A11yPressable
        onPress={() => router.replace('/(auth)/signin' as any)}
        accessibilityRole="button"
        accessibilityLabel={t("auth.backToLogin", "Back to Sign In")}
        style={{ alignItems: 'center', marginTop: 12, marginBottom: 4 }}
      >
        <Text style={[styles.linkText, { color: palette.primary }]}>
          {t("auth.alreadyHaveAccount", "Already have an account? Sign in")}
        </Text>
      </A11yPressable>
      
      <View style={{ height: 10 }} />
      <OAuthButtons styles={styles} tLabel={(k: string, d: string)=> t(k as any, d)} />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: palette.text },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      marginBottom: 12,
      padding: 10,
      borderRadius: 8,
      color: palette.text,
    },
    error: { color: palette.error || 'red', marginBottom: 10 },
    button: { backgroundColor: palette.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
    linkText: { fontSize: 14, textDecorationLine: 'underline' },
  });
}

function OAuthButtons({ styles, tLabel }: { styles: any; tLabel: (k: string, d: string) => string }) {
  const palette = useAppPalette();
  const [busy, setBusy] = useState(false);
  return (
    <View>
      <A11yPressable
        onPress={async ()=> { setBusy(true); const ok = await (await import('../../services/auth/oauth')).signInWithGoogleAsync(); setBusy(false); if (!ok) {} }}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signUpGoogle','Sign up with Google')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signUpGoogle','Sign up with Google')}</Text>
      </A11yPressable>
      <View style={{ height: 8 }} />
      <A11yPressable
        onPress={async ()=> { setBusy(true); const ok = await (await import('../../services/auth/oauth')).signInWithAppleAsync(); setBusy(false); if (!ok) {} }}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signUpApple','Sign up with Apple')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signUpApple','Sign up with Apple')}</Text>
      </A11yPressable>
    </View>
  );
}
