// app/(tabs)/community.tsx
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useAnnounceScreen from "../../hooks/useAnnounceScreen";

export default function CommunityScreen() {
  useAnnounceScreen("Community screen");

  return (
    <SafeAreaView style={styles.container}>
      <Header title="🤝 Community" subtitle="Connect • Share • Support" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.body}>
          Connect with fellow Persons with Disabilities (PWDs), share experiences, and support each other.
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
