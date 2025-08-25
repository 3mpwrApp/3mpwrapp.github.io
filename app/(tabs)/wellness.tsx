import { StyleSheet, Text, View } from "react-native";

export default function WellnessScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🌿 Wellness</Text>
      <Text style={styles.subtitle}>Tips, exercises, and resources to support your recovery journey.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center" },
});
