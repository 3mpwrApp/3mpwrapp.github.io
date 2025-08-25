import { View, Text, StyleSheet } from "react-native";

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>👥 Community</Text>
      <Text style={styles.subtitle}>Connect with fellow Persons with Disabilities (PWDs) Community, share experiences, and support each other.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#555", textAlign: "center" },
});
