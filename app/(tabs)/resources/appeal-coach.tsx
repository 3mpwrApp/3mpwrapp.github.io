import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

type Msg = { id: string; role: "bot" | "user"; text: string };

const SEED: Msg[] = [
  {
    id: "m0",
    role: "bot",
    text: "I'm your Appeal Coach. I can:\n\n- Explain what to expect at hearings\n- Help rehearse testimony with prompts\n- Share stress-management tips\n\nAsk a question, or try: 'what to expect', 'rehearse', or 'stress tips'.",
  },
];

export const options = { href: null };

export default function AppealCoach() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Appeal Coach");
  useFocusOnRefOnMount(titleRef);

  const [msgs, setMsgs] = React.useState<Msg[]>(SEED);
  const [input, setInput] = React.useState("");

  const respond = React.useCallback((q: string): string => {
    const s = q.toLowerCase();
    if (/(expect|hearing|tribunal|board)/.test(s)) {
      return (
        "What to expect at hearings:\n\n" +
        "- Check-in: confirm identity, logistics, and documents.\n" +
        "- Roles: adjudicator(s), clerk, you, representative (and sometimes the other party).\n" +
        "- Flow: introductions -> your evidence/testimony -> questions -> closing remarks.\n" +
        "- Evidence: factual timeline, medical/work records, policies. Keep answers specific.\n" +
        "- Tips: speak slowly, ask for breaks, and clarify questions you don't understand."
      );
    }
    if (/(rehearse|practice|testimony|questions?)/.test(s)) {
      return (
        "Rehearsal prompts:\n\n" +
        "1) What happened? Give a short timeline with dates.\n" +
        "2) How did this affect your ability to work/study/live?\n" +
        "3) What accommodations or supports did you request, and what was the response?\n" +
        "4) What evidence supports your position (medical notes, emails, policies)?\n" +
        "5) If denied: why do you disagree with the decision?\n\n" +
        "Answer these out loud. I can ask followÃ¢â‚¬â€˜ups if you paste your draft."
      );
    }
    if (/(stress|anx|nervous|panic|calm|breath)/.test(s)) {
      return (
        "Stress-management tips:\n\n" +
        "- Box breathing: inhale 4, hold 4, exhale 4, hold 4 (repeat x4).\n" +
        "- Grounding: name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.\n" +
        "- Logistics: prepare documents, test audio/video, plan water and breaks.\n" +
        "- Pacing: pause before answering; it's okay to ask for clarification or time."
      );
    }
    if (/(open|statement|closing)/.test(s)) {
      return (
        "Structure for statements:\n\n" +
        "- Opening: who you are and what you're asking for.\n" +
        "- Key points: 2-3 reasons supported by evidence.\n" +
        "- Closing: the remedy you seek and any accommodations needed during the process."
      );
    }
    if (/(evidence|docs|documents|records)/.test(s)) {
      return (
        "Evidence checklist:\n\n" +
        "- Timeline with dates and participants.\n" +
        "- Medical letters/notes with functional limits, not just diagnoses.\n" +
        "- Emails or forms showing requests for accommodations and responses.\n" +
        "- Policy excerpts (workplace, benefits plan, statute).\n" +
        "- Any prior decisions and reasons for denial."
      );
    }
    return "I didn't fully catch that. Try keywords like 'what to expect', 'rehearse', 'stress tips', 'evidence', or 'opening statement'.";
  }, []);

  const send = React.useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const u: Msg = { id: String(Date.now()), role: "user", text: trimmed };
    const a: Msg = {
      id: String(Date.now() + 1),
      role: "bot",
      text: respond(trimmed),
    };
    setMsgs((m) => [...m, u, a]);
    setInput("");
  }, [input, respond]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <View style={styles.container}>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          Appeal Coach
        </Text>
        <FlatList
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={item.role === "user" ? styles.userText : styles.botText}
              >
                {item.text}
              </Text>
            </View>
          )}
        />
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
          <Pressable
            onPress={async () => {
              const lastBot = [...msgs].reverse().find((m) => m.role === "bot");
              if (!lastBot) return;
              try {
                const mod = await import("expo-clipboard");
                await mod.setStringAsync(lastBot.text);
                Alert.alert("Copied", "Last response copied to clipboard.");
              } catch {
                Alert.alert(
                  "Clipboard not available",
                  "Install expo-clipboard in a dev build to enable copy.",
                );
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Copy last response"
            style={[styles.sendBtn, { alignSelf: "flex-start" }]}
          >
            <Text style={styles.sendText}>Copy last</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              if (!msgs.length) return;
              const transcript = msgs
                .map((m) => `${m.role === "user" ? "You" : "Coach"}: ${m.text}`)
                .join("\n\n");
              try {
                const mod = await import("expo-clipboard");
                await mod.setStringAsync(transcript);
                Alert.alert("Copied", "Conversation copied to clipboard.");
              } catch {
                Alert.alert(
                  "Clipboard not available",
                  "Install expo-clipboard in a dev build to enable copy.",
                );
              }
            }}
            accessibilityRole="button"
            accessibilityLabel="Copy conversation"
            style={[styles.sendBtn, { alignSelf: "flex-start" }]}
          >
            <Text style={styles.sendText}>Copy chat</Text>
          </Pressable>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about hearings, rehearsal, or stress tips"
            placeholderTextColor={palette.text + "66"}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable
            onPress={send}
            style={styles.sendBtn}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: palette.text,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    bubble: {
      borderRadius: 12,
      padding: 10,
      marginVertical: 6,
      maxWidth: "92%",
    },
    userBubble: { alignSelf: "flex-end", backgroundColor: palette.primary },
    botBubble: {
      alignSelf: "flex-start",
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    userText: { color: palette.onPrimary },
    botText: { color: palette.text },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 8,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
    },
    sendBtn: {
      backgroundColor: palette.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
    },
    sendText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
