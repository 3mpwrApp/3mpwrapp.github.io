import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";
import { useAppPalette } from "../theme/usePalette";
export default function Collapsible({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const palette = useAppPalette();
  const [open, setOpen] = useState(false);

  return (
    <View style={[styles.wrapper, { borderColor: palette.muted, backgroundColor: palette.card }]}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityLabel={`${open ? "Collapse" : "Expand"} ${title}`}
        accessibilityRole="button"
        hitSlop={HIT_SLOP_12}
        style={({ pressed }) => [styles.header, { backgroundColor: palette.surface }, pressed && { opacity: 0.8 }]}
      >
        <Text style={[styles.headerText, { color: palette.text }]}>
          {open ? "▾ " : "▸ "} {title}
        </Text>
      </Pressable>

      {open && <View style={[styles.content, { backgroundColor: palette.card }]}>{children}</View>}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerText: { fontSize: 16, fontWeight: "600" },
  content: {
    padding: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
});
