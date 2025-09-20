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

const EMAIL = "empowrapp08162025@gmail.com";

export default function AboutScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("About & Contact");
  useFocusOnRefOnMount(titleRef);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const sendEmail = async () => {
    const params = new URLSearchParams({ subject, body: message });
    const url = `mailto:${EMAIL}?${params.toString()}`;
    const supported = await Linking.canOpenURL(url);
    if (!supported)
      {return Alert.alert("Email not configured", `Please email ${EMAIL}`);}
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
        About & Contact
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.text}>
        Empowr supports injured workers, the disability community, advocates and
        allies with tools, resources, and updates.
      </Text>
      <Text style={styles.text}>
        Vision: a full lifecycle empowerment hub - starting with Health (tracking, medical resources), moving into Claims/Appeals (legal + advocacy tools), into Recovery (wellness + return to work), and ending in Collective Action (campaigns, systemic change). One home for both survival and transformation.
      </Text>
      <Text style={styles.text}>
        Questions, suggestions, or requests? Reach out anytime.
      </Text>
      <Text style={styles.text}>Email: {EMAIL}</Text>
      <TextInput
        style={styles.input}
        value={subject}
        onChangeText={setSubject}
        placeholder="Subject"
        placeholderTextColor={palette.text}
        accessibilityLabel="Subject"
      />
      <TextInput
        style={[styles.input, { minHeight: 120 }]}
        value={message}
        onChangeText={setMessage}
        placeholder="Your message"
        placeholderTextColor={palette.text}
        accessibilityLabel="Message"
        multiline
      />
      <Pressable
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.9 }]}
        onPress={sendEmail}
        accessibilityRole="button"
        accessibilityLabel="Send email"
        hitSlop={HIT_SLOP_8}
      >
        <Text style={styles.buttonText}>Send</Text>
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

