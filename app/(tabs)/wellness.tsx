import { StyleSheet, Text, View } from "react-native";

export default function WellnessScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>💖 Wellness</Text>
      <Text style={styles.subtitle}>Tips and tools for mental & physical health.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666" },
});
