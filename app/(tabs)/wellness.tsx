import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Wellness() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Wellness screen">
      <Text
        style={[Typography.h2, styles.title, { color: Colors.primary }]}
        accessibilityRole="header"
        allowFontScaling
      >
        Wellness
      </Text>
      <Text style={[Typography.body, styles.subtitle]} allowFontScaling>
        Access wellness tips, self-care strategies, and mental health support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textDark, lineHeight: 22 },
});
