// components/Footer.tsx
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

export default function Footer() {
  return (
    <View
      style={styles.footer}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`Copyright ${new Date().getFullYear()} Empowr App. All rights reserved.`}
    >
      <Text style={styles.text} allowFontScaling>
        © {new Date().getFullYear()} Empowr App · All rights reserved
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: Colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  text: {
    color: Colors.textLight,
    fontSize: 12,
  },
});
