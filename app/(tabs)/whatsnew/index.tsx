import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TextInput,
  Pressable,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { whatsnew as defaultWN } from "../../../data/whatsnew";
import {
  getLocalWhatsNew,
  addLocalWhatsNew,
} from "../../../services/localContent";
import SettingsLink from "../../../components/SettingsLink";
import ContrastToggle from "../../../components/ContrastToggle";

export default function WhatsNewScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Whatâ€™s New");
  useFocusOnRefOnMount(titleRef);

  const now = React.useMemo(() => new Date(), []);
  // Track last-seen timestamp to badge unread items
  const [lastSeen, setLastSeen] = React.useState<string | null>(null);
  const AsyncStorageRef = React.useRef<any>(null);
  const [items, setItems] = React.useState(defaultWN);
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  React.useEffect(() => {
    (async () => {
      try {
        const mod = await import("@react-native-async-storage/async-storage");
        AsyncStorageRef.current = mod.default;
      } catch {}
      const local = await getLocalWhatsNew();
      if (local.length) setItems([...local, ...defaultWN]);
      const AsyncStorage = AsyncStorageRef.current;
      if (AsyncStorage) {
        try {
          const seen = await AsyncStorage.getItem("whatsnew:lastSeen:v1");
          if (seen) setLastSeen(seen);
        } catch {}
      }
    })();
  }, []);

  // Mark as seen when visiting this tab
  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const mod = await import("@react-native-async-storage/async-storage");
          const AsyncStorage = mod.default;
          await AsyncStorage.setItem("whatsnew:lastSeen:v1", new Date().toISOString());
        } catch {}
      })();
    }, []),
  );
  const isWithin30Days = (d: string) =>
    (now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24) <= 30;
  const isUnread = (d: string) =>
    lastSeen ? new Date(d).getTime() > new Date(lastSeen).getTime() : true;
  const recent = items.filter((i) => isWithin30Days(i.date));
  const older = items.filter((i) => !isWithin30Days(i.date));
  const sections = [
    ...(recent.length ? [{ title: "New", data: recent }] : []),
    ...(older.length ? [{ title: "Archive", data: older }] : []),
  ];

  return (
    <View
      style={styles.container}
      accessibilityLabel="What's New screen"
      accessible
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Whatâ€™s New
      </Text>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      <Text style={styles.subtitle}>
        Latest updates. Items older than 30 days move to Archive.
      </Text>
      <View style={{ marginBottom: 8 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Add title"
          placeholderTextColor={palette.text}
        />
        <TextInput
          value={summary}
          onChangeText={setSummary}
          style={styles.input}
          placeholder="Add summary"
          placeholderTextColor={palette.text}
        />
        <Pressable
          disabled={!title.trim() || !summary.trim()}
          onPress={async () => {
            const item = {
              id: `wn-${Date.now()}`,
              title: title.trim(),
              summary: summary.trim(),
              date: new Date().toISOString(),
            };
            await addLocalWhatsNew(item);
            setItems((prev) => [item, ...prev]);
            setTitle("");
            setSummary("");
          }}
          accessibilityRole="button"
          accessibilityLabel="Add whatâ€™s new"
          style={({ pressed }) => [
            styles.button,
            (!title.trim() || !summary.trim() || pressed) && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mark all as read"
        onPress={async () => {
          const newest = items.reduce(
            (acc, cur) => Math.max(acc, new Date(cur.date).getTime()),
            0,
          );
          const AsyncStorage = AsyncStorageRef.current;
          if (AsyncStorage && newest) {
            await AsyncStorage.setItem(
              "whatsnew:lastSeen:v1",
              new Date(newest).toISOString(),
            );
            setLastSeen(new Date(newest).toISOString());
          }
        }}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>Mark all as read</Text>
      </Pressable>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.section}>{section.title}</Text>
        )}
        renderItem={({ item }) => {
          const unread = isUnread(item.date);
          return (
            <View style={styles.item}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={[styles.itemDate]}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                  {unread && (
                    <Text
                      style={{
                        backgroundColor: palette.primary,
                        color: palette.onPrimary,
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        fontWeight: "700",
                      }}
                    >
                      New
                    </Text>
                  )}
                </View>
              </View>
              <Text style={styles.itemText}>{item.summary}</Text>
            </View>
          );
        }}
        contentContainerStyle={{ paddingTop: 8 }}
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
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 1,
      marginBottom: 8,
    },
    section: {
      color: palette.text,
      fontWeight: "700",
      marginTop: 12,
      marginBottom: 6,
    },
    item: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    itemTitle: { color: palette.text, fontWeight: "600" },
    itemText: { color: palette.text, opacity: 1 },
    itemDate: {
      color: palette.text,
      opacity: 0.7,
      fontSize: Math.round(12 * factor),
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



