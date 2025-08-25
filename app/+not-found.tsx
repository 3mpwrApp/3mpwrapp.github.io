import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Oops! Page not found.</Text>
      <Button title="Go Home" onPress={() => router.push("/")} />
    </View>
  );
}
