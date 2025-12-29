/**
 * Legal Acceptance Banner (Post-Value)
 *
 * STRATEGIC CHANGE: Instead of 9-step gatekeeping BEFORE app access,
 * show a dismissible banner AFTER users experience value.
 *
 * Crisis-first principle: Let users use the app when they need it,
 * explain legal boundaries AFTER they've seen it helps.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";
import { useAppPalette } from "../theme/usePalette";
import { createShadow } from "../utils/shadow";
import { trackLegalBannerShown, trackLegalTermsAccepted, trackLegalBannerDismissed } from "../services/onboardingTracking";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (err) {
  console.error('[LegalAcceptanceBanner] AsyncStorage not available:', err);
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
  };
}

const STORAGE_KEY = "empowr.legal.acceptance.v3";
const BANNER_DISMISSED_KEY = "empowr.legal.banner.dismissed.v1";
const CURRENT_TERMS_VERSION = "3.0";
const CURRENT_PRIVACY_VERSION = "2.0";

type AcceptanceState = {
  termsVersion: string | null;
  privacyVersion: string | null;
  medicalDisclaimer: boolean;
  legalDisclaimer: boolean;
  financialDisclaimer: boolean;
  aiDisclaimer: boolean;
  crisisDisclaimer: boolean;
  emergencyDisclaimer: boolean;
  userResponsibility: boolean;
  dataOwnership: boolean;
};

/**
 * Legal Acceptance Banner - Shows AFTER first value delivery
 *
 * UX Flow:
 * 1. User opens app → No gate, direct access
 * 2. User captures evidence / generates letter → Sees immediate value
 * 3. Banner appears (dismissible): "Quick heads-up about what this app does and doesn't do"
 * 4. User can:
 *    - Accept terms (2-minute quick flow)
 *    - Dismiss banner (remind later)
 *    - Never dismiss → Banner persists until accepted
 */
export default function LegalAcceptanceBanner() {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const [accepted, setAccepted] = React.useState(true); // Default true = hide banner
  const [dismissed, setDismissed] = React.useState(false);
  const [showFullTerms, setShowFullTerms] = React.useState(false);

  // All disclaimers combined into single checkbox (quick mode)
  const [allAccepted, setAllAccepted] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const state: AcceptanceState = JSON.parse(raw);
          // Check if already accepted current versions
          if (
            state.termsVersion === CURRENT_TERMS_VERSION &&
            state.privacyVersion === CURRENT_PRIVACY_VERSION &&
            state.medicalDisclaimer &&
            state.legalDisclaimer &&
            state.financialDisclaimer &&
            state.aiDisclaimer &&
            state.crisisDisclaimer &&
            state.emergencyDisclaimer &&
            state.userResponsibility &&
            state.dataOwnership
          ) {
            setAccepted(true);
            return;
          }
        }

        // Check if banner was dismissed
        const dismissedRaw = await AsyncStorage.getItem(BANNER_DISMISSED_KEY);
        if (dismissedRaw) {
          const dismissedData = JSON.parse(dismissedRaw);
          // Show banner again after 24 hours
          const daysSinceDismiss = (Date.now() - dismissedData.timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceDismiss < 1) {
            setDismissed(true);
            return;
          }
        }

        // Not accepted and not recently dismissed → Show banner
        setAccepted(false);
      } catch (err) {
        console.error('[LegalAcceptanceBanner] Init error:', err);
      }
    })();
  }, []);

  // Track legal banner shown (onboarding analytics)
  React.useEffect(() => {
    if (!accepted && !dismissed) {
      trackLegalBannerShown();
    }
  }, [accepted, dismissed]);

  const saveAcceptance = async () => {
    const state: AcceptanceState = {
      termsVersion: CURRENT_TERMS_VERSION,
      privacyVersion: CURRENT_PRIVACY_VERSION,
      medicalDisclaimer: true,
      legalDisclaimer: true,
      financialDisclaimer: true,
      aiDisclaimer: true,
      crisisDisclaimer: true,
      emergencyDisclaimer: true,
      userResponsibility: true,
      dataOwnership: true,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      await AsyncStorage.removeItem(BANNER_DISMISSED_KEY);
      await trackLegalTermsAccepted();
      setAccepted(true);
    } catch {
      // Handle error
    }
  };

  const dismissBanner = async () => {
    try {
      await AsyncStorage.setItem(BANNER_DISMISSED_KEY, JSON.stringify({ timestamp: Date.now() }));
      await trackLegalBannerDismissed();
      setDismissed(true);
    } catch {}
  };

  if (accepted || dismissed) return null;

  if (showFullTerms) {
    // Full terms modal
    return (
      <View style={styles.overlay} accessibilityLabel="Legal Terms Review">
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            📋 Quick Legal Review
          </Text>

          <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={styles.text}>
              <Text style={{ fontWeight: "700" }}>🏥 Medical:</Text> This app doesn't provide medical advice. Always see real doctors for health decisions.{'\n\n'}

              <Text style={{ fontWeight: "700" }}>⚖️ Legal:</Text> This app isn't a lawyer. Get professional legal help for legal matters.{'\n\n'}

              <Text style={{ fontWeight: "700" }}>💰 Financial:</Text> This app can't give financial advice. Consult professionals for money decisions.{'\n\n'}

              <Text style={{ fontWeight: "700" }}>🤖 AI Content:</Text> AI can make mistakes. Always double-check AI-generated content.{'\n\n'}

              <Text style={{ fontWeight: "700" }}>🚨 Emergencies:</Text> In any emergency, call 911 immediately. This app cannot help in emergencies.{'\n\n'}

              <Text style={{ fontWeight: "700" }}>🔐 Your Data:</Text> You own 100% of your data. It stays on your device unless you choose to sync.
            </Text>

            <View style={styles.linksRow}>
              <Pressable
                onPress={() => Linking.openURL("https://3mpwrapp.pages.dev/terms/")}
                style={styles.link}
                accessibilityRole="link"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.linkText}>📄 Full Terms</Text>
              </Pressable>
              <Pressable
                onPress={() => Linking.openURL("https://3mpwrapp.pages.dev/privacy/")}
                style={styles.link}
                accessibilityRole="link"
                hitSlop={HIT_SLOP_12}
              >
                <Text style={styles.linkText}>🔐 Privacy Policy</Text>
              </Pressable>
            </View>
          </ScrollView>

          <Pressable
            onPress={() => setAllAccepted(!allAccepted)}
            style={styles.checkboxRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: allAccepted }}
            hitSlop={HIT_SLOP_12}
          >
            <View style={[styles.checkbox, allAccepted && styles.checkboxChecked]}>
              {allAccepted && <Ionicons name="checkmark" size={24} color={palette.onPrimary} />}
            </View>
            <Text style={styles.checkboxLabel}>
              I understand this app does NOT provide medical, legal, or financial advice. I'll consult qualified professionals. In emergencies, I'll call 911.
            </Text>
          </Pressable>

          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowFullTerms(false)}
              style={[styles.button, styles.buttonSecondary]}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={styles.buttonTextSecondary}>Back</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={saveAcceptance}
              style={[styles.button, !allAccepted && styles.buttonDisabled]}
              disabled={!allAccepted}
              hitSlop={HIT_SLOP_12}
            >
              <Text style={[styles.buttonText, !allAccepted && styles.buttonTextDisabled]}>
                {allAccepted ? '✓ I Understand' : 'I Understand'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // Compact banner (default view)
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>💡</Text>
        <Text style={styles.bannerTitle}>Quick heads-up</Text>
      </View>

      <Text style={styles.bannerText}>
        This app is a <Text style={{ fontWeight: '700' }}>tool</Text> to help you, not a replacement for doctors, lawyers, or emergency services. Quick 2-minute review?
      </Text>

      <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
        <Pressable
          onPress={() => setShowFullTerms(true)}
          style={styles.bannerButton}
          accessibilityRole="button"
          accessibilityLabel="Review terms (2 minutes)"
          hitSlop={HIT_SLOP_12}
        >
          <Text style={styles.bannerButtonText}>✓ Review (2 min)</Text>
        </Pressable>
        <Pressable
          onPress={dismissBanner}
          style={[styles.bannerButton, styles.bannerButtonSecondary]}
          accessibilityRole="button"
          accessibilityLabel="Remind me later"
          hitSlop={HIT_SLOP_12}
        >
          <Text style={styles.bannerButtonTextSecondary}>Later</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    banner: {
      backgroundColor: palette.surface,
      borderLeftWidth: 4,
      borderLeftColor: palette.primary,
      borderRadius: 8,
      padding: 14,
      marginBottom: 16,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }),
    },
    bannerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      flex: 1,
    },
    bannerText: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.text,
      opacity: 0.9,
    },
    bannerButton: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      minHeight: 44,
      justifyContent: 'center',
    },
    bannerButtonText: {
      color: palette.onPrimary,
      fontSize: 14,
      fontWeight: '600',
    },
    bannerButtonSecondary: {
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
    },
    bannerButtonTextSecondary: {
      color: palette.text,
      fontSize: 14,
      fontWeight: '600',
    },

    // Full modal styles
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      zIndex: 9999,
    },
    card: {
      width: "100%",
      maxWidth: 560,
      maxHeight: "90%",
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 20,
      ...createShadow({
        shadowColor: palette.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    scrollView: {
      flexGrow: 0,
      flexShrink: 1,
      maxHeight: 300,
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
      color: palette.text,
      textAlign: "center"
    },
    text: {
      color: palette.text,
      opacity: 0.9,
      lineHeight: 22,
      fontSize: 14
    },
    linksRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
    },
    link: {
      marginTop: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 44,
      alignItems: "center",
      justifyContent: "center"
    },
    linkText: {
      color: palette.primary,
      fontWeight: "700",
      textDecorationLine: "underline",
      fontSize: 13,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 16,
      paddingVertical: 8,
      minHeight: 44,
    },
    checkbox: {
      width: 44,
      height: 44,
      borderWidth: 2,
      borderColor: palette.text,
      backgroundColor: palette.surface,
      borderRadius: 6,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    checkboxChecked: {
      backgroundColor: palette.primary,
    },
    checkboxLabel: {
      flex: 1,
      color: palette.text,
      fontSize: 15,
      lineHeight: 22,
    },
    buttonRow: {
      flexDirection: "row",
      gap: 12,
    },
    button: {
      backgroundColor: palette.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    buttonText: {
      color: palette.onPrimary,
      fontWeight: "700",
      fontSize: 16
    },
    buttonSecondary: {
      backgroundColor: palette.card,
      borderWidth: 2,
      borderColor: palette.primary,
    },
    buttonTextSecondary: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 16
    },
    buttonDisabled: {
      backgroundColor: palette.muted,
    },
    buttonTextDisabled: {
      color: palette.textSecondary,
      fontWeight: "700",
      fontSize: 16,
      opacity: 0.7,
    },
  });
}
