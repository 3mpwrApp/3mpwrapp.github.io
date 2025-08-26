import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Campaigns() {
  return (
    <View style={styles.container} accessible accessibilityLabel="Campaigns screen">
      <Text
        style={[Typography.h2, styles.title, { color: Colors.primary }]}
        accessibilityRole="header"
        allowFontScaling
      >
        Campaigns
      </Text>
      <Text style={[Typography.body, styles.subtitle]} allowFontScaling>
        Explore and participate in advocacy campaigns that drive awareness and change.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { marginBottom: 8 },
  subtitle: { textAlign: "center", color: Colors.textDark, lineHeight: 22 },
});
