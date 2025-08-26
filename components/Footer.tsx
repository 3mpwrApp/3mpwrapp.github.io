// components/Footer.tsx
import { View, Text, StyleSheet } from "react-native";

export default function Footer() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Footer. Empowr App. Accessibility first.">
      <Text style={styles.text}>Empowr App • Accessibility First</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e5e5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  text: { fontSize: 12, color: "#888", textAlign: "center" },
});
