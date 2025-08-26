// app/_layout.tsx
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#fff" } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" options={{ presentation: "modal", headerShown: false }} />
      <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
    </Stack>
  );
}
