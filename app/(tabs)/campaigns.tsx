import { View, Text, StyleSheet } from "react-native";

export default function CampaignsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📢 Campaigns</Text>
      <Text style={styles.subtitle}>Track and manage your campaigns here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#666" },
});
