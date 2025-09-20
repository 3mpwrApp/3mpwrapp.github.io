import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";

import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { CommunityProvider, useCommunity } from "../../../store/community";
import { channels as seedChannels } from "../../../data/community";

function Inner() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Ask an Advocate");
  useFocusOnRefOnMount(titleRef);
  const { createThread } = useCommunity();

  const [title, setTitle] = React.useState("");
  const [details, setDetails] = React.useState("");
  const topicChannels = seedChannels.filter((c) => c.type === "topic");
  const [channelId, setChannelId] = React.useState<string>("ch_topic_ask");

  const submit = () => {
    const ok = createThread(
      channelId,
      `${title} Ã¢â‚¬â€ ${details.slice(0, 120)}`,
      null,
    );
    if (ok) {
      Alert.alert(
        "Submitted",
        "Your request has been posted. Community advocates may respond.",
      );
      router.push("/(tabs)/community/topic-ask-advocate");
    } else {
      Alert.alert(
        "Slow down",
        "Please wait a few seconds before posting again.",
      );
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel="Ask an Advocate form"
      accessible
    >
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Ask an Advocate
      </Text>
      <Text style={styles.subtitle}>
        Briefly describe your issue. Do not include personal identifiers.
      </Text>

      <Text style={styles.label}>Category</Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        {topicChannels.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setChannelId(c.id)}
            style={[styles.chip, channelId === c.id && styles.chipActive]}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.chipText,
                channelId === c.id && styles.chipTextActive,
              ]}
            >
              {c.title}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Short title"
      />
      <Text style={styles.label}>Details</Text>
      <TextInput
        style={[styles.input, { minHeight: 100 }]}
        value={details}
        onChangeText={setDetails}
        multiline
        placeholder="What happened? What help do you need?"
      />

      <Pressable
        onPress={submit}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
}

export const options = { href: null };

export default function AskAdvocate() {
  return (
    <CommunityProvider>
      <Inner />
    </CommunityProvider>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background, padding: 16 },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    label: {
      color: palette.text,
      opacity: 0.95,
      marginTop: 8,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
    },
    button: {
      marginTop: 12,
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
  });
}
