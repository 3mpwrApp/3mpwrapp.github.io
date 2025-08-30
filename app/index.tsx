import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../store/auth";

export default function Index() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (state.status === "needsOnboarding") return <Redirect href="/(auth)/onboarding" />;
  if (state.status === "signedOut") return <Redirect href="/(auth)/login" />;
  // anonymous and signedIn both land in tabs
  return <Redirect href="/(tabs)" />;
}

