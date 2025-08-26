import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Resources() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Resources screen">
      <Text
        style={[Typography.h2, styles.title, { color: Colors.primary }]}
        accessibilityRole="header"
        allowFontScaling
      >
        Resources
      </Text>
      <Text style={[Typography.body, styles.subtitle]} allowFontScaling>
        Explore guides, tools, and knowledge to navigate your journey with confidence.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textDark, lineHeight: 22 },
});
