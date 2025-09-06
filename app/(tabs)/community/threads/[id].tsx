import React from "react";
import { View, Text, StyleSheet, useColorScheme, FlatList, TextInput, Pressable } from "react-native";
import { colors, type Palette } from "../../../../theme/colors";
import { useLocalSearchParams } from "expo-router";
import { useCommunity, CommunityProvider } from "../../../../store/community";
import { HIT_SLOP_8, touchTarget } from "../../../../constants/a11y";
import { useAuth } from "../../../../store/auth";

export const options = { href: null };

function ThreadInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addComment, reportComment, deleteComment } = useCommunity();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const thread = state.threads.find((t) => t.id === id);
  const comments = state.comments.filter((c) => c.threadId === id).sort((a,b)=>a.createdAt-b.createdAt);
  const [text, setText] = React.useState("");
  const { state: auth } = useAuth();

  if (!thread) return <View style={styles.container}><Text style={styles.title}>Thread not found</Text></View>;

  return (
    <View style={styles.container} accessibilityLabel={`Thread ${thread.title}`} accessible>
      <Text style={styles.title}>{thread.title}</Text>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment} accessibilityLabel={`Comment by ${item.author ?? "Guest"}`} accessible>
            <Text style={styles.commentAuthor}>{item.author ?? "Guest"}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
            <View style={styles.actionsRow}>
              {!item.reported && (
                <Pressable onPress={() => reportComment(item.id)} accessibilityRole="button" accessibilityLabel="Report comment" hitSlop={HIT_SLOP_8} style={({pressed})=>[touchTarget.min,{opacity:pressed?0.7:1}]}> 
                  <Text style={styles.actionLink}>Report</Text>
                </Pressable>
              )}
              {auth.status === "signedIn" && (
                <Pressable onPress={() => deleteComment(item.id)} accessibilityRole="button" accessibilityLabel="Delete comment" hitSlop={HIT_SLOP_8} style={({pressed})=>[touchTarget.min,{opacity:pressed?0.7:1}]}> 
                  <Text style={[styles.actionLink,{color:"#d00"}]}>Delete</Text>
                </Pressable>
              )}
              {item.reported && <Text style={[styles.actionLink,{color:"#aa8800"}]}>Reported</Text>}
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />

      <View style={styles.newBox} accessibilityLabel="Add a comment" accessible>
        <TextInput
          style={styles.input}
          placeholder="Write a comment"
          placeholderTextColor={palette.muted}
          value={text}
          onChangeText={setText}
        />
        <Pressable
          onPress={() => { if (!text.trim()) return; const ok = addComment(thread.id, text.trim(), auth.user?.name ?? null); if (ok) setText(""); }}
          accessibilityRole="button"
          accessibilityLabel="Post comment"
          hitSlop={HIT_SLOP_8}
          style={({ pressed }) => [styles.cta, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Text style={styles.ctaText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ThreadScreen() {
  return (
    <CommunityProvider>
      <ThreadInner />
    </CommunityProvider>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 20, fontWeight: "700", color: palette.text },
    comment: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    commentAuthor: { color: palette.text, fontWeight: "600", marginBottom: 4 },
    commentText: { color: palette.text, opacity: 0.9 },
    actionsRow: { flexDirection: "row", gap: 12, marginTop: 6 },
    actionLink: { color: palette.primary, fontWeight: "700" },
    newBox: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 12, paddingVertical: 8 },
    input: { flex: 1, borderWidth: 1, borderColor: palette.muted, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: palette.text },
    cta: { backgroundColor: palette.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
    ctaText: { color: palette.onPrimary, fontWeight: "700" },
  });
}
