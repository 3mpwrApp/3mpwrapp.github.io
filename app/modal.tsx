// app/modal.tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.overlay} accessibilityRole="dialog" accessibilityLabel="Information modal">
      <View style={styles.card}>
        <Text style={styles.title}>Information</Text>
        <Text style={styles.body}>
          This is a global modal. It’s keyboard and screen-reader friendly and uses large touch targets.
        </Text>

        <Pressable
          onPress={() => router.back()}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Close modal and return to previous screen"
        >
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 20 },
  card: { width: "100%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  title: { fontSize: 22, fontWeight: "700", color: "#007AFF", marginBottom: 8 },
  body: { fontSize: 16, color: "#333", lineHeight: 22, marginBottom: 20 },
  button: { backgroundColor: "#007AFF", paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
