import { Tabs } from "expo-router";

export default function TabsLayout() {
  console.log('[TabsLayout] Rendering ULTRA MINIMAL...');
  
  return (
    <Tabs>
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
