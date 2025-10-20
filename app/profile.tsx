import type { Href } from "expo-router";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import EmergencyWalletCard from "../components/EmergencyWalletCard";
import { HIT_SLOP_8 } from "../constants/a11y";
import { useAuth } from "../context/AuthContext";
import type { Lang } from "../i18n";
import { useTranslation } from "../i18n";
import { useA11ySettings } from "../store/a11ySettings";
import { type Palette } from "../theme/colors";
import { useAppPalette } from "../theme/usePalette";

export default function Profile() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const { user, signOut } = useAuth();
  const { lang, setLanguage, t } = useTranslation();
  const [name, setName] = React.useState(user?.displayName ?? "");
  const { state: a11y, toggleHighContrast } = useA11ySettings();
  const [showEmergencyCard, setShowEmergencyCard] = React.useState(false);

  return (
    <View
      style={styles.container}
      accessibilityLabel={t("header.openProfile", "Open profile")}
      accessible
    >
      <Text style={styles.title}>{t("nav.profile")}</Text>

      <View style={styles.card}>
        <Row
          label={t("settings.account.title", "Account")}
          value={user?.email ?? user?.displayName ?? t("common.guest", "Guest")}
        />
        <Pressable
          onPress={() => setShowEmergencyCard(v => !v)}
          accessibilityRole="button"
          accessibilityLabel={
            showEmergencyCard
              ? t("settings.emergencyWallet.hide")
              : t("settings.emergencyWallet.show")
          }
          style={[styles.cta, styles.ghost]}
        >
          <Text style={styles.ghostText}>
            {showEmergencyCard
              ? t("settings.emergencyWallet.hide")
              : t("settings.emergency.manage")}
          </Text>
        </Pressable>
        {showEmergencyCard && (
          <View style={{ marginTop: 12 }}>
            <EmergencyWalletCard />
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          {t("settings.accessibility.title")}
        </Text>
        <Pressable
          onPress={toggleHighContrast}
          accessibilityRole="button"
          accessibilityLabel={`${t("settings.accessibility.highContrast")}: ${
            a11y.highContrast ? t("common.on") : t("common.off")
          }`}
          style={({ pressed }) => [
            styles.cta,
            styles.ghost,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.ghostText}>
            {t("settings.accessibility.highContrast")} · {a11y.highContrast ? t("common.on") : t("common.off")}
          </Text>
        </Pressable>
      </View>

      {/* Notifications test removed at user's request */}

      <View style={styles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          {t("settings.language.title")}
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["en", "fr", "es"] as Lang[]).map((code) => (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              style={[styles.langChip, lang === code && styles.langChipActive]}
              accessibilityRole="button"
              accessibilityLabel={t("rightsExplainer.langChip", "Language {{code}}", { code })}
            >
              <Text
                style={[
                  styles.langChipText,
                  lang === code && styles.langChipTextActive,
                ]}
              >
                {code.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={{ fontWeight: "700", marginBottom: 8 }}>
          {t("profile.quickLinks.title", "Quick links")}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap:'wrap', gap:8 }}>
          <QuickLink label={t('profile.quickLinks.evidence','Evidence Locker')} onPress={() => router.push('/(tabs)/resources/evidence-locker' as Href)} palette={palette} />
          <QuickLink label={t('profile.quickLinks.deadlines','Deadlines')} onPress={() => router.push('/(tabs)/resources/deadlines' as Href)} palette={palette} />
          <QuickLink label={t('profile.quickLinks.rightsChecker','Rights Checker')} onPress={() => router.push('/(tabs)/resources/rights-checker' as Href)} palette={palette} />
          <QuickLink label={t('profile.quickLinks.rightsExplainer','Rights Explainer')} onPress={() => router.push('/(tabs)/resources/rights-explainer' as Href)} palette={palette} />
          <QuickLink label={t('profile.quickLinks.translator','Advocate Translator')} onPress={() => router.push('/(tabs)/advocacy/ai-advocate-translator' as Href)} palette={palette} />
          <QuickLink label={t('profile.quickLinks.settings','Settings')} onPress={() => router.push('/(tabs)/settings' as Href)} palette={palette} />
        </View>
      </View>

      {/* DEV ONLY: Sentry Test Button */}
      {__DEV__ && (
        <View style={[styles.card, { backgroundColor: palette.surface, borderWidth: 2, borderColor: palette.primary }]}>
          <Text style={{ fontWeight: "700", marginBottom: 8, color: palette.text }}>
            🐛 DEV ONLY - Sentry Testing
          </Text>
          <Pressable
            style={[styles.cta, { backgroundColor: palette.primary }]}
            onPress={async () => {
              try {
                // Dynamically import Sentry
                const sentryModule = await import('sentry-expo');
                // Get the Native module which has the actual Sentry SDK
                const Sentry = sentryModule.Native;
                
                if (Sentry && Sentry.captureException) {
                  const testError = new Error('🧪 TEST ERROR from Profile screen - Check Sentry dashboard!');
                  Sentry.captureException(testError);
                  alert('✅ Test error sent to Sentry!\n\nCheck your dashboard at:\nsentry.io');
                } else {
                  alert('⚠️ Sentry not initialized.\n\nGo to Settings → Privacy and enable "Error Reporting" first.');
                }
              } catch (error) {
                alert('❌ Sentry error:\n' + (error as Error).message);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Test Sentry error reporting"
          >
            <Text style={[styles.primaryText, { textAlign: 'center' }]}>
              🧪 Send Test Error to Sentry
            </Text>
          </Pressable>
          <Text style={{ fontSize: 12, color: palette.text, marginTop: 8 }}>
            Make sure error reporting is enabled in Settings → Privacy
          </Text>
        </View>
      )}

      {user ? (
        <>
          <Text style={styles.label}>{t("settings.account.displayName")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t("settings.account.displayNamePlaceholder")}
            placeholderTextColor={palette.muted}
            accessibilityLabel={t("settings.account.displayName")}
          />
          <Pressable
            style={[styles.cta, styles.ghost]}
            onPress={signOut}
            accessibilityRole="button"
            accessibilityLabel={t("header.signOut")}
          >
            <Text style={styles.ghostText}>{t("header.signOut")}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={[styles.cta, styles.primary]}
            onPress={() => router.push("/(auth)/login" as Href)}
            accessibilityRole="button"
            accessibilityLabel={t("header.signIn")}
          >
            <Text style={styles.primaryText}>{t("header.signIn")}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <Text style={{ fontWeight: "600" }}>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

function QuickLink({ label, onPress, palette }:{ label: string; onPress: ()=>void; palette: Palette }) {
  return (
    <Pressable hitSlop={HIT_SLOP_8} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={{ borderWidth:1, borderColor: palette.muted, borderRadius:999, paddingHorizontal:12, paddingVertical:8 }}>
      <Text style={{ color: palette.text, fontWeight:'700' }}>{label}</Text>
    </Pressable>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: palette.background },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: palette.text,
      marginBottom: 16,
    },
    card: {
      backgroundColor: palette.surface,
      borderColor: palette.muted,
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    label: { color: palette.muted, marginBottom: 6 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 12,
    },
    cta: {
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      marginTop: 8,
    },
    primary: { backgroundColor: palette.primary },
    primaryText: { color: palette.onPrimary, fontWeight: "700" },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: palette.muted,
    },
    ghostText: { color: palette.text, fontWeight: "700" },
    langChip: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    langChipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    langChipText: { color: palette.text, fontWeight: "700" },
    langChipTextActive: { color: palette.onPrimary },
  });
}
