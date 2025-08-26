import { View, Text, StyleSheet } from "react-native";

export default function CommunityScreen() {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Community screen for connecting with fellow persons with disabilities"
    >
      <Text style={styles.title} accessibilityRole="header">
        Community
      </Text>
      <Text
        style={styles.subtitle}
        accessibilityLabel="Connect with fellow persons with disabilities community, share experiences, and support each other."
      >
        Connect with fellow Persons with Disabilities (PWDs), share experiences, and support each other.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 8, textAlign: "center" },
});
