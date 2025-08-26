import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Community() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Community screen">
      <Text
        style={[Typography.h2, styles.title, { color: Colors.primary }]}
        accessibilityRole="header"
        allowFontScaling
      >
        Community
      </Text>
      <Text style={[Typography.body, styles.subtitle]} allowFontScaling>
        Connect with fellow Persons with Disabilities (PWDs), share experiences, and support each other.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textDark, lineHeight: 22 },
});
