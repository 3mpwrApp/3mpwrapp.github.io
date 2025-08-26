// components/Header.tsx
import { View, Text, StyleSheet } from "react-native";

type Props = { title: string; subtitle?: string };

export default function Header({ title, subtitle }: Props) {
  return (
    <View style={styles.container} accessible accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e5e5",
    backgroundColor: "#ffffff",
  },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { marginTop: 2, fontSize: 14, color: "#666" },
});
