import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import type { Href } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Empowr App</Text>
      <Text style={styles.subtitle}>
        Empowering injured workers & persons with disabilities.
      </Text>

      <Button title="Login" onPress={() => router.push("/(auth)/login" as Href)} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Register" onPress={() => router.push("/(auth)/register" as Href)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 30 },
});
