import { View, Text, StyleSheet, FlatList } from "react-native";

const campaigns = [
  { id: "1", title: "Workplace Safety Awareness" },
  { id: "2", title: "Fair Compensation Advocacy" },
  { id: "3", title: "Mental Health Support" },
];

export default function CampaignsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📢 Campaigns</Text>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: { backgroundColor: "#f2f2f2", padding: 15, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 16 },
});
