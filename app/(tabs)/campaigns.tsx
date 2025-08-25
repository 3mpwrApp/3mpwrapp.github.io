import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Campaigns() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h2, { color: Colors.primary }]}>Campaigns</Text>
      <Text style={[Typography.body, styles.subtitle]}>
        Stay updated on advocacy campaigns and join movements for change.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  subtitle: { marginTop: 8, textAlign: "center", color: Colors.textDark },
});
