import { View, Text, StyleSheet } from "react-native";
import Colors from "../../constants/Colors";
import Typography from "../../constants/Typography";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={[Typography.h1, { color: Colors.primary }]}>
        Welcome to Empowr
      </Text>
      <Text style={[Typography.body, styles.subtitle]}>
        Empowering Injured Workers & Persons with Disabilities across Canada.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  subtitle: { marginTop: 10, textAlign: "center", color: Colors.textDark },
});
