import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
} from "react-native";

import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { faqs as defaultFaqs } from "../../data/faqs";
import { getLocalFaqs, addLocalFaq } from "../../services/localContent";
import SettingsLink from "../../components/SettingsLink";
import ContrastToggle from "../../components/ContrastToggle";

export default function FaqsScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("FAQs");
  useFocusOnRefOnMount(titleRef);
  const [query, setQuery] = React.useState("");
  const [items, setItems] = React.useState(defaultFaqs);
  const [qText, setQText] = React.useState("");
  const [aText, setAText] = React.useState("");
  React.useEffect(() => {
    (async () => {
      const local = await getLocalFaqs();
      if (local.length) setItems([...local, ...defaultFaqs]);
    })();
  }, []);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
    );
  }, [query, items]);

  return (
    <View style={styles.container}>
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        FAQs
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Search FAQs"
        placeholderTextColor={palette.text}
        accessibilityLabel="Search FAQs"
      />
      <View style={{ marginBottom: 8 }}>
        <TextInput
          style={styles.input}
          value={qText}
          onChangeText={setQText}
          placeholder="Question"
          placeholderTextColor={palette.text}
        />
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={aText}
          onChangeText={setAText}
          placeholder="Answer"
          placeholderTextColor={palette.text}
          multiline
        />
        <Pressable
          disabled={!qText.trim() || !aText.trim()}
          onPress={async () => {
            const item = {
              id: `faq-${Date.now()}`,
              q: qText.trim(),
              a: aText.trim(),
            };
            await addLocalFaq(item);
            setItems((prev) => [item, ...prev]);
            setQText("");
            setAText("");
          }}
          accessibilityRole="button"
          accessibilityLabel="Add FAQ"
          style={({ pressed }) => [
            styles.button,
            (!qText.trim() || !aText.trim() || pressed) && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.q}>{item.q}</Text>
            <Text style={styles.a}>{item.a}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.a}>No FAQs found</Text>}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
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
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginBottom: 6,
    },
    item: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    q: { color: palette.text, fontWeight: "700" },
    a: { color: palette.text, opacity: 1, marginTop: 4 },
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
