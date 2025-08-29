import { useState } from "react";import { View, Text, Pressable, StyleSheet } from "react-native";
export default function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityLabel={`${open ? "Collapse" : "Expand"} ${title}`}
        accessibilityRole="button"
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.headerText}>
          {open ? "▾ " : "▸ "} {title}
        </Text>
      </Pressable>

      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: { borderWidth: StyleSheet.hairlineWidth, borderColor: "#ddd", borderRadius: 8, marginVertical: 8 },
  header: { padding: 12, backgroundColor: "#F7F8FA", borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerText: { fontSize: 16, fontWeight: "600" },
  content: { padding: 12, backgroundColor: "#fff", borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
});