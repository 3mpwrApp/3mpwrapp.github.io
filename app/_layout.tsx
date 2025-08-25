import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Main tabs navigator */}
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false }}
      />

      {/* Modal (global, not inside tabs) */}
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", headerShown: false }}
      />

      {/* Catch-all for 404 */}
      <Stack.Screen
        name="+not-found"
        options={{ title: "Not Found" }}
      />
    </Stack>
  );
}
