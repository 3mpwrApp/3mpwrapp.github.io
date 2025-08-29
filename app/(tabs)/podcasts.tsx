import { View, Text, StyleSheet } from "react-native";import Footer from "../../components/Footer";
export default function PodcastsScreen() {
  return (
    <View style={styles.container} accessibilityLabel="Podcasts and Videos screen" accessible>
      <Text style={styles.title}>Podcasts & Videos</Text>
      <Text style={styles.subtitle}>
        Explore podcasts and videos featuring community voices, education, and advocacy.
      </Text>
      <Footer />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#444" },
});