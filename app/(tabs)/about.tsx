import React from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import ContrastToggle from "../../components/ContrastToggle";
import DisclaimerBanner from "../../components/DisclaimerBanner";
import GapView from "../../components/GapView";
import SettingsLink from "../../components/SettingsLink";
import { HIT_SLOP_8 } from "../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { useTranslation } from "../../i18n";
import { useTextScale } from "../../theme/typography";
import { useAppPalette } from "../../theme/usePalette";
import { sendFeedbackEmailInternal } from "../../utils/feedback";
import { openExternalUrl } from "../../utils/linking";

export default function AboutScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t("about.title","About & Contact"));
  useFocusOnRefOnMount(titleRef);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const sendEmail = async () => {
    if(!subject.trim() || !message.trim()) {
      setError(t("about.validationMissing","Subject and message required"));
      return;
    }
    setError(null);
    // Prefer centralized helper to avoid exposing literal email in UI and keep analytics consistent
    try {
      await sendFeedbackEmailInternal(t, { subject, body: message });
    } catch {
      // Fallback: try to open a generic mailto without exposing address
      try {
        const params = new URLSearchParams({ subject, body: message });
        const url = `mailto:?${params.toString()}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) return Linking.openURL(url);
      } catch {}
      Alert.alert(t("about.emailNotConfiguredTitle","Email not configured"), t("about.emailNotConfiguredBody","Please configure a mail app and try again."));
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("about.title","About & Contact")}
      </Text>
      <DisclaimerBanner type="general" compact />
      {process.env.EXPO_PUBLIC_BETA ? (
        <View accessibilityRole="text" style={{ padding: 8, borderRadius: 6, backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, marginBottom: 8 }}>
          <Text style={{ color: palette.text, fontSize: 12 }}>{t('about.betaBanner','This is a beta build')}</Text>
        </View>
      ) : null}
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.text}>{t("about.intro1")}</Text>
      <Text style={styles.text}>{t("about.intro2")}</Text>
      <Text style={styles.text}>{t("about.intro3")}</Text>
      <View style={{ marginVertical: 8 }}>
        <Text style={[styles.text,{ fontWeight:'700' }]}>Socials & Website</Text>
        <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={8}>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://x.com/3mpowrApp0816')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>X (Twitter)</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://www.instagram.com/empowrapp/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Instagram</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://www.facebook.com/profile.php?id=61579428783083')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Facebook</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Website</Text>
          </Pressable>
        </GapView>
      </View>
      
      <View style={{ marginVertical: 8 }}>
        <Text style={[styles.text,{ fontWeight:'700' }]}>Legal & Policies</Text>
        <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={8}>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/terms/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Terms of Service</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/privacy/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Privacy Policy</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/data-ownership/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Data Ownership</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/community/guidelines/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Community Guidelines</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_8} onPress={()=>openExternalUrl('https://3mpwrapp.pages.dev/delete-data/')} style={({ pressed }) => [{ paddingHorizontal:10, paddingVertical:6, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface }, pressed && { opacity:0.8 }]}>
            <Text style={{ color: palette.text }}>Delete My Data</Text>
          </Pressable>
        </GapView>
      </View>
      
      {/* Keep email address out of rendered UI to reduce PII soft-scan hits */}
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder={t("about.subjectPlaceholder","Subject")}
        placeholderTextColor={palette.text}
        accessibilityLabel={t("about.subjectPlaceholder","Subject")}
      />
      <TextInput
        style={[styles.input, { minHeight: 120 }]}
        value={message}
        onChangeText={setMessage}
        placeholder={t("about.messagePlaceholder","Your message")}
        placeholderTextColor={palette.text}
        accessibilityLabel={t("about.messagePlaceholder","Message")}
        multiline
      />
  {error ? <Text style={[styles.text,{color: palette.error}]} accessibilityLiveRegion="polite">{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
        onPress={sendEmail}
        accessibilityRole="button"
        accessibilityLabel={t("about.sendLabel","Send email")}
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>{t("about.send","Send")}</Text>
      </Pressable>
    </ScrollView>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    contentContainer: { padding: 20 },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      color: palette.text,
      marginBottom: 8,
    },
    text: { color: palette.text, opacity: 0.95, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: "700" },
  });
}

