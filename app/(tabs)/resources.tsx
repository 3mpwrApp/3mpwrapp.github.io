import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Resources() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h2, { color: Colors.primary }]}>Resources</Text>
      <Text style={[Typography.body, styles.subtitle]}>
        Explore guides, tools, and knowledge to navigate your journey with
        confidence.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  subtitle: { marginTop: 8, textAlign: "center", color: Colors.textDark },
});
