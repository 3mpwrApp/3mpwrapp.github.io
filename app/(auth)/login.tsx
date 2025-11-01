import type { Href } from "expo-router";
import { useRouter } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../components/A11yPressable";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebase/config";
import { MAX_FONT_SCALE } from "../../hooks/useA11y";
import { useTranslation } from "../../i18n";
import { useAppPalette } from "../../theme/usePalette";

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const { signInGuest } = useAuth();
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
      const msg = t("auth.firebaseUnavailable", "Firebase authentication is not configured. Try guest mode instead.");
      setError(msg);
      Alert.alert(t("common.errorTitle", "Error"), msg);
      return;
    }
    
    try {
      setWorking(true);
      setError("");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/(tabs)" as Href);
    } catch (err: any) {
      let msg = err?.message || "Login failed";
      
      // Handle specific Firebase errors
      if (err?.code === 'auth/network-request-failed') {
        msg = t("auth.networkError", "Network error. Check your connection or try guest mode.");
      } else if (err?.code === 'auth/invalid-credential' || err?.code === 'auth/wrong-password') {
        msg = t("auth.invalidCredentials", "Invalid email or password");
      } else if (err?.code === 'auth/user-not-found') {
        msg = t("auth.userNotFound", "No account found with this email");
      } else if (err?.code === 'auth/too-many-requests') {
        msg = t("auth.tooManyAttempts", "Too many failed attempts. Try again later.");
      }
      
      setError(msg);
      Alert.alert(t("common.errorTitle", "Error"), msg);
    } finally {
      setWorking(false);
    }
  };

  const handleGuestMode = async () => {
    try {
      setWorking(true);
      await signInGuest();
      router.replace("/(tabs)" as Href);
    } catch {
      Alert.alert(t("common.errorTitle", "Error"), t("auth.guestModeFailed", "Failed to enter guest mode"));
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
        secureTextEntry={true}
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
      
      <A11yPressable
        onPress={handleGuestMode}
        disabled={working}
        accessibilityRole="button"
        accessibilityLabel={t("auth.continueAsGuest", "Continue as Guest")}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }, working && { opacity: 0.6 }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>
          {t("auth.continueAsGuest", "Continue as Guest")}
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
  
  const handleGoogleSignIn = async () => {
    setBusy(true);
    try {
      const oauth = await import('../../services/auth/oauth');
      const ok = await oauth.signInWithGoogleAsync();
      if (!ok) {
        // Error already shown by oauth module
      }
    } catch {
      Alert.alert(
        tLabel('auth.oauthError', 'Sign-in unavailable'),
        tLabel('auth.oauthErrorMsg', 'OAuth sign-in is not available in this build. Use email/password or guest mode.')
      );
    } finally {
      setBusy(false);
    }
  };
  
  const handleAppleSignIn = async () => {
    setBusy(true);
    try {
      const oauth = await import('../../services/auth/oauth');
      const ok = await oauth.signInWithAppleAsync();
      if (!ok) {
        // Error already shown by oauth module
      }
    } catch {
      Alert.alert(
        tLabel('auth.oauthError', 'Sign-in unavailable'),
        tLabel('auth.oauthErrorMsg', 'OAuth sign-in is not available in this build. Use email/password or guest mode.')
      );
    } finally {
      setBusy(false);
    }
  };
  
  return (
    <View>
      <Text style={{ color: palette.text, opacity: 0.7, fontSize: 12, textAlign: 'center', marginBottom: 8 }}>
        {tLabel('auth.orSignInWith', 'Or sign in with')}
      </Text>
      <A11yPressable
        onPress={handleGoogleSignIn}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signInGoogle','Sign in with Google')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }, busy && { opacity: 0.6 }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signInGoogle','Sign in with Google')}</Text>
      </A11yPressable>
      <View style={{ height: 8 }} />
      <A11yPressable
        onPress={handleAppleSignIn}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel={tLabel('auth.signInApple','Sign in with Apple')}
        style={[styles.button, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }, busy && { opacity: 0.6 }]}
      >
        <Text style={[styles.buttonText, { color: palette.text }]}>{busy? tLabel('common.working','Working...') : tLabel('auth.signInApple','Sign in with Apple')}</Text>
      </A11yPressable>
    </View>
  );
}
