// app/(tabs)/index.tsx
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAnnounceScreen from "../../hooks/useAnnounceScreen";

export default function HomeScreen() {
  useAnnounceScreen("Home screen");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Welcome to Empowr App" subtitle="Inclusive tools for PWDs & Injured Workers" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Explore resources, connect with community members, join campaigns, and access wellness tools.
        </Text>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20 },
  body: { fontSize: 16, color: "#333" },
});
