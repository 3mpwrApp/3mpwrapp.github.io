import * as FileSystem from "expo-file-system";
import React from "react";
import {
  AccessibilityInfo,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useAppPalette } from "../../../theme/usePalette";

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
  const listRef = React.useRef<FlatList<Msg>>(null);
  const inputRef = React.useRef<TextInput>(null);
  const { t } = useTranslation();

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
    setTimeout(() => {
      AccessibilityInfo.announceForAccessibility?.(t("appealCoach.newResponse", "New coach response ready"));
      // auto scroll after layout paint
      setTimeout(() => (listRef.current as any)?.scrollToEnd?.({ animated: true }), 30);
    }, 40);
    setInput("");
  }, [input, respond]);

  const shareTranscript = async () => {
    if (!msgs.length) return;
    const transcript = msgs
      .map((m) => `${m.role === "user" ? "You" : "Coach"}: ${m.text}`)
      .join("\n\n");
    try {
      // Write to temp file for better share compatibility
      const path = FileSystem.cacheDirectory + `appeal_coach_${Date.now()}.txt`;
      await FileSystem.writeAsStringAsync(path, transcript, { encoding: FileSystem.EncodingType.UTF8 });
      await Share.share({ url: path, message: transcript, title: t("appealCoach.transcriptTitle", "Appeal Coach Transcript") });
    } catch {
      Alert.alert("Share failed", "Could not open the share sheet.");
    }
  };

  const clearConversation = () => {
    setMsgs(SEED);
    AccessibilityInfo.announceForAccessibility?.(t("appealCoach.reset", "Conversation reset."));
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <View style={styles.container} accessibilityLabel={t("appealCoach.screenLabel", "Appeal Coach screen")} accessible>
        <View
          style={{
            margin: 16,
            marginBottom: 4,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: palette.muted,
            backgroundColor: palette.surface,
            padding: 12,
            borderRadius: 10,
          }}
          accessibilityRole="summary"
          accessibilityLabel={t("appealCoach.howToUse", "How to use Appeal Coach")}
        >
          <Text style={{ color: palette.primary, fontWeight: "700", fontSize: 16, marginBottom: 4 }}>
            {t("appealCoach.howToUseTitle", "How to Use Appeal Coach")}
          </Text>
          <Text style={{ color: palette.text }}>
            {t(
              "appealCoach.instructions",
              "Ask about hearings, rehearsal prompts, stress tips, evidence, or statements. Use the Copy buttons to reuse guidance, Share to export a transcript file, or Reset to start over."
            )}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            <Pressable
              onPress={shareTranscript}
              style={[styles.sendBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
              accessibilityRole="button"
              accessibilityLabel={t("appealCoach.share", "Share conversation transcript")}
              accessibilityHint={t("appealCoach.shareHint", "Opens the system share sheet with the transcript file.")}
            >
              <Text style={[styles.sendText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.shareBtn", "Share")}</Text>
            </Pressable>
            <Pressable
              onPress={clearConversation}
              style={[styles.sendBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
              accessibilityRole="button"
              accessibilityLabel={t("appealCoach.resetLabel", "Reset conversation")}
              accessibilityHint={t("appealCoach.resetHint", "Clears chat messages and restores the intro message.")}
            >
              <Text style={[styles.sendText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.resetBtn", "Reset")}</Text>
            </Pressable>
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={[styles.sendBtn, { backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}
              accessibilityRole="button"
              accessibilityLabel={t("appealCoach.skipToInput", "Skip to input")}
              accessibilityHint={t("appealCoach.skipToInputHint", "Moves focus to the message input field.")}
            >
              <Text style={[styles.sendText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.skip", "Skip to Input")}</Text>
            </Pressable>
          </View>
        </View>
        <Text
          ref={titleRef}
          accessibilityRole="header"
          style={styles.title}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t("appealCoach.title", "Appeal Coach")}
        </Text>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
              accessibilityLabel={`${item.role === "user" ? t("appealCoach.you", "You") : t("appealCoach.coach", "Coach")}: ${item.text}`}
            >
              <Text
                style={item.role === "user" ? styles.userText : styles.botText}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {item.text}
              </Text>
            </View>
          )}
          accessibilityLabel={t("appealCoach.messages", "Conversation messages")}
        />
        <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16 }}>
          <Pressable
            onPress={async () => {
              const lastBot = [...msgs].reverse().find((m) => m.role === "bot");
              if (!lastBot) return;
              try {
                const mod = await import("expo-clipboard");
                await mod.setStringAsync(lastBot.text);
                Alert.alert(t("appealCoach.copied", "Copied"), t("appealCoach.lastResponseCopied", "Last response copied to clipboard."));
              } catch {
                Alert.alert(
                  t("appealCoach.clipboardMissingTitle", "Clipboard not available"),
                  t("appealCoach.clipboardMissingMsg", "Install expo-clipboard in a dev build to enable copy."),
                );
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t("appealCoach.copyLast", "Copy last response")}
            accessibilityHint={t("appealCoach.copyLastHint", "Copies the most recent coach message to the clipboard.")}
            style={[styles.sendBtn, { alignSelf: "flex-start" }]}
          >
            <Text style={styles.sendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.copyLastBtn", "Copy last")}</Text>
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
                Alert.alert(t("appealCoach.copied", "Copied"), t("appealCoach.conversationCopied", "Conversation copied to clipboard."));
              } catch {
                Alert.alert(
                  t("appealCoach.clipboardMissingTitle", "Clipboard not available"),
                  t("appealCoach.clipboardMissingMsg", "Install expo-clipboard in a dev build to enable copy."),
                );
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t("appealCoach.copyConversation", "Copy conversation")}
            accessibilityHint={t("appealCoach.copyConversationHint", "Copies the entire conversation transcript to the clipboard.")}
            style={[styles.sendBtn, { alignSelf: "flex-start" }]}
          >
            <Text style={styles.sendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.copyChatBtn", "Copy chat")}</Text>
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
            accessibilityLabel="Message input"
            accessibilityHint="Enter a question about appeals, hearings, rehearsal, stress tips, evidence, or statements."
            ref={inputRef}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          />
          <Pressable
            onPress={send}
            style={styles.sendBtn}
            accessibilityRole="button"
            accessibilityLabel="Send"
            accessibilityHint="Sends your message to the coach."
          >
            <Text style={styles.sendText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t("appealCoach.sendBtn", "Send")}</Text>
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
