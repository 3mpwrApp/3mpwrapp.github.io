import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Home() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Home screen">
      <Text
        style={[Typography.h2, styles.title, { color: Colors.primary }]}
        accessibilityRole="header"
        allowFontScaling
      >
        Welcome to Empowr
      </Text>
      <Text style={[Typography.body, styles.subtitle]} allowFontScaling>
        Empowering Injured Workers & Persons with Disabilities across Canada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textDark, lineHeight: 22 },
});
