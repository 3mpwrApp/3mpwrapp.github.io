import { View, Text, StyleSheet } from "react-native";

export default function ResourcesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 Resources</Text>
      <Text style={styles.subtitle}>Find guides, articles, and helpful links.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666" },
});
