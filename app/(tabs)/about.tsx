import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Linking,
  Alert,
} from "react-native";

import { HIT_SLOP_8 } from "../../constants/a11y";
import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import SettingsLink from "../../components/SettingsLink";
import ContrastToggle from "../../components/ContrastToggle";
import { useTranslation } from "../../i18n";

const EMAIL = "empowrapp08162025@gmail.com";

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
    const params = new URLSearchParams({ subject, body: message });
    const url = `mailto:${EMAIL}?${params.toString()}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return Alert.alert(
        t("about.emailNotConfiguredTitle","Email not configured"),
        t("about.emailNotConfiguredBody","Please email {{email}}", { email: EMAIL } as any)
      );
    }
    await Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("about.title","About & Contact")}
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.text}>{t("about.intro1")}</Text>
      <Text style={styles.text}>{t("about.intro2")}</Text>
      <Text style={styles.text}>{t("about.intro3")}</Text>
      <Text style={styles.text}>{t("about.emailLabel","Email")}: {EMAIL}</Text>
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
      {error ? <Text style={[styles.text,{color: palette.danger || '#c00'}]} accessibilityLiveRegion="polite">{error}</Text> : null}
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
        onPress={sendEmail}
        accessibilityRole="button"
        accessibilityLabel={t("about.sendLabel","Send email")}
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>{t("about.send","Send")}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
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

