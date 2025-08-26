import { View, Text, StyleSheet } from "react-native";

export default function CampaignsScreen() {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Campaigns screen with advocacy and action information"
    >
      <Text style={styles.title} accessibilityRole="header">
        Campaigns
      </Text>
      <Text
        style={styles.subtitle}
        accessibilityLabel="Explore campaigns to raise awareness, promote advocacy, and create change for disability and injured worker rights."
      >
        Explore campaigns to raise awareness, promote advocacy, and create change.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 8, textAlign: "center" },
});
