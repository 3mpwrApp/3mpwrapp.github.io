import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function NotFound() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>404 - Page Not Found</Text>
      <Text style={styles.subtitle}>
        The page you’re looking for doesn’t exist.
      </Text>

      <Button title="Go Home" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20, textAlign: "center" },
});
