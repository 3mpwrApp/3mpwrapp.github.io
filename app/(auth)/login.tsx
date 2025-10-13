import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../components/A11yPressable";
import { auth } from "../../firebase/config";
import { MAX_FONT_SCALE } from "../../hooks/useA11y";
import { useTranslation } from "../../i18n";
import { useAppPalette } from "../../theme/usePalette";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [working, setWorking] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError(t("auth.missingFields", "All fields required"));
      return;
    }
    
    // Check if Firebase auth is available
    if (!auth) {
      const msg = t("auth.unavailable", "Authentication is not available in this mode");
      setError(msg);
      Alert.alert(t("common.errorTitle", "Error"), msg);
      return;
    }
    
    try {
      setWorking(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)" as Href);
    } catch (err: any) {
      const msg = err?.message || "Login failed";
      setError(msg);
      Alert.alert(t("common.errorTitle", "Error"), msg);
    } finally {
      setWorking(false);
    }
  };

  return (
    <View style={styles.container} accessibilityLabel={t("auth.loginScreen", "Login screen")}>      
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t("auth.loginTitle", "Login")}
      </Text>
      <TextInput
        style={styles.input}
        placeholder={t("auth.email", "Email")}
        placeholderTextColor={palette.text + '77'}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        accessibilityLabel={t("auth.email", "Email")}
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        placeholder={t("auth.password", "Password")}
        placeholderTextColor={palette.text + '77'}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        accessibilityLabel={t("auth.password", "Password")}
        returnKeyType="done"
        onSubmitEditing={handleLogin}
      />
      {!!error && (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      <A11yPressable
        onPress={handleLogin}
        disabled={working}
        accessibilityRole="button"
        accessibilityLabel={t("auth.login", "Login")}
        style={[styles.button, working && { opacity: 0.6 }]}
      >
        <Text style={styles.buttonText}>
          {working ? t("common.working", "Working...") : t("auth.login", "Login")}
        </Text>
      </A11yPressable>
      <View style={{ height: 10 }} />
      <OAuthButtons styles={styles} tLabel={(k: string, d: string)=> t(k as any, d)} />
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: palette.text },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      marginBottom: 12,
      padding: 10,
      borderRadius: 8,
      color: palette.text,
    },
    error: { color: palette.error || 'red', marginBottom: 10 },
    button: { backgroundColor: palette.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
    buttonText: { color: palette.onPrimary, fontWeight: '700' },
  });
}

function OAuthButtons({ styles, tLabel }: { styles: any; tLabel: (k: string, d: string) => string }) {
  const palette = useAppPalette();
  const [busy, setBusy] = React.useState(false);
  return (
    <View>
      <A11yPressable
        onPress={async ()=> { setBusy(true); const ok = await (await import('../../services/auth/oauth')).signInWithGoogleAsync(); setBusy(false); if (!ok) {} }}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signInGoogle','Sign in with Google')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signInGoogle','Sign in with Google')}</Text>
      </A11yPressable>
      <View style={{ height: 8 }} />
      <A11yPressable
        onPress={async ()=> { setBusy(true); const ok = await (await import('../../services/auth/oauth')).signInWithAppleAsync(); setBusy(false); if (!ok) {} }}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signInApple','Sign in with Apple')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signInApple','Sign in with Apple')}</Text>
      </A11yPressable>
    </View>
  );
}
