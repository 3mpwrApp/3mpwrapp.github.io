// components/Header.tsx
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

export default function Header() {
  return (
    <View
      style={styles.header}
      accessible
      accessibilityRole="header"
      accessibilityLabel="Empowr App. Connecting voices, empowering change."
    >
      <Text style={styles.title} allowFontScaling>
        Empowr App
      </Text>
      <Text style={styles.tagline} allowFontScaling>
        Connecting voices, empowering change
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  title: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  tagline: {
    color: Colors.textLight,
    fontSize: 12,
    marginTop: 2,
  },
});
