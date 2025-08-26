import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel="Home screen with welcome message"
    >
      <Text style={styles.title} accessibilityRole="header">
        Welcome to Empowr
      </Text>
      <Text
        style={styles.subtitle}
        accessibilityLabel="This app helps persons with disabilities and injured workers across Canada."
      >
        Connecting Persons with Disabilities and Injured Workers across Canada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, marginTop: 8, textAlign: "center" },
});
