import React from "react";
import { useAuth } from "./context/AuthContext";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AuthStack() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="(auth)/onboarding" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/register" />
        </>
      ) : (
        // ✅ Point directly to tabs/index (Home tab)
        <Stack.Screen name="(tabs)/index" />
      )}
    </Stack>
  );
}