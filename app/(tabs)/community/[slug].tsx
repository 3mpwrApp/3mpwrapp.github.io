import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, Pressable, TextInput } from "react-native";
import { colors, type Palette } from "../../../theme/colors";
import { useLocalSearchParams, router } from "expo-router";
import { useCommunity, CommunityProvider } from "../../../store/community";
import { HIT_SLOP_8, touchTarget } from "../../../constants/a11y";
import { useAuth } from "../../../store/auth";

function ChannelInner() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { state, createThread } = useCommunity();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const channel = state.channels.find((c) => c.slug === slug);
  const threads = state.threads.filter((t) => t.channelId === channel?.id);
  const [title, setTitle] = React.useState("");
  const { state: auth } = useAuth();

  if (!channel) return <View style={styles.container}><Text style={styles.title}>Channel not found</Text></View>;

  return (
    <View style={styles.container} accessibilityLabel={`Channel ${channel.title}`} accessible>
      <Text style={styles.title}>{channel.title}</Text>

      <View style={styles.newBox} accessible accessibilityLabel="Create a new thread">
        <TextInput
          style={styles.input}
          placeholder="Start a new thread"
          placeholderTextColor={palette.muted}
          value={title}
          onChangeText={setTitle}
        />
        <Pressable
          onPress={() => { if (!title.trim()) return; const ok = createThread(channel.id, title.trim(), auth.user?.name ?? null); if (ok) setTitle(""); }}
          accessibilityRole="button"
          accessibilityLabel="Create thread"
          hitSlop={HIT_SLOP_8}
          style={({ pressed }) => [styles.cta, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.ctaText}>Post</Text>
        </Pressable>
      </View>

      <FlatList
        data={[...threads].sort((a,b)=> (b.pinned?1:0)-(a.pinned?1:0) || b.createdAt-a.createdAt)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/ (tabs)/community/threads/${item.id}`.replace(/\s/g, ""))}
            accessibilityRole="button"
            accessibilityLabel={`Open thread ${item.title}`}
            hitSlop={HIT_SLOP_8}
            style={({ pressed }) => [styles.threadRow, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.threadTitle}>{item.title}</Text>
            <Text style={styles.threadMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.threadMeta}>No threads yet.</Text>}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

export default function ChannelScreen() {
  return (
    <CommunityProvider>
      <ChannelInner />
    </CommunityProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    newBox: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 12, paddingVertical: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: palette.text },
    cta: { backgroundColor: palette.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
    threadRow: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    threadTitle: { color: palette.text, fontSize: 16, fontWeight: "600" },
    threadMeta: { color: palette.muted, marginTop: 2 },
  });
}
