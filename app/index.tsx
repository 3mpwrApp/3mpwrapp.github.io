import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Handle redirect using useEffect to avoid middleware issues
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/(auth)/login");
      } else {
        router.replace("/(tabs)");
      }
    }
  }, [loading, user, router]);

  // Show loading state while auth initializes or during redirect
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
