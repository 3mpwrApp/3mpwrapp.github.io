// app/(tabs)/wellness.tsx
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAnnounceScreen from "../../hooks/useAnnounceScreen";

export default function WellnessScreen() {
  useAnnounceScreen("Wellness screen");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="🌿 Wellness" subtitle="Mental Health • Self-care" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Explore mental health tools, self-care practices, and resources to support overall well-being.
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
