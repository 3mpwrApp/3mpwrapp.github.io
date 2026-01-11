import { Tabs } from "expo-router";

export default function TabsLayout() {
  if (__DEV__) console.warn('[TabsLayout] Rendering ULTRA MINIMAL...');
  
  return (
    <Tabs>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
