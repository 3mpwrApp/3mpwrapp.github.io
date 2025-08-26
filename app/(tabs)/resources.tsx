// app/(tabs)/resources.tsx
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAnnounceScreen from "../../hooks/useAnnounceScreen";

export default function ResourcesScreen() {
  useAnnounceScreen("Resources screen");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="📚 Resources" subtitle="Guides • Rights • Services" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Access guides, educational materials, and information on workplace rights and disability services.
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
