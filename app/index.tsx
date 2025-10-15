import type { Href } from "expo-router";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../context/AuthContext";

export default function Index() {
  const { user, loading } = useAuth();

  // Handle loading state
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no user, redirect to login
  // Note: The app uses Firebase Auth now, not local auth store
  // Auth flow: No user → login screen → authenticated → tabs
  if (!user) {
    return <Redirect href={"/(auth)/login" as Href} />;
  }

  // User is authenticated, go to main app
  return <Redirect href={"/(tabs)" as Href} />;
}
