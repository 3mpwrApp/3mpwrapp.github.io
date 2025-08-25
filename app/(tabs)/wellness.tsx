import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Wellness() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h2, { color: Colors.primary }]}>Wellness</Text>
      <Text style={[Typography.body, styles.subtitle]}>
        Access wellness tips, self-care strategies, and mental health support.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  subtitle: { marginTop: 8, textAlign: "center", color: Colors.textDark },
});
