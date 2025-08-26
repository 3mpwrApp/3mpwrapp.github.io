// app/(tabs)/campaigns.tsx
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAnnounceScreen from "../../hooks/useAnnounceScreen";

export default function CampaignsScreen() {
  useAnnounceScreen("Campaigns screen");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="📢 Campaigns" subtitle="Advocacy & petitions" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Stay updated with advocacy efforts, petitions, and initiatives for disability rights.
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
