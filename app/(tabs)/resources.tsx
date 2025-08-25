import { View, Text, StyleSheet, FlatList, Linking, Pressable } from "react-native";

const resources = [
  { id: "1", title: "Workers Compensation Guide", url: "https://example.com/guide" },
  { id: "2", title: "Mental Health Services", url: "https://example.com/mental-health" },
  { id: "3", title: "Legal Aid Directory", url: "https://example.com/legal-aid" },
];

export default function ResourcesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Resources</Text>
      <FlatList
        data={resources}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => Linking.openURL(item.url)}>
            <Text style={styles.title}>{item.title}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  card: { backgroundColor: "#e6f0ff", padding: 15, borderRadius: 8, marginBottom: 10 },
  title: { fontSize: 16, color: "#007AFF" },
});
