// app/+not-found.tsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 — Page Not Found</Text>
      <Text style={styles.subtitle}>The page you’re looking for doesn’t exist.</Text>

      <Pressable
        onPress={() => router.replace("/")}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Go back to Home"
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#444", marginBottom: 20, textAlign: "center" },
  button: { backgroundColor: "#007AFF", paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
