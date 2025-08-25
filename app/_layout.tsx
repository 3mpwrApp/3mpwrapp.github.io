import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="campaigns" options={{ title: 'Campaigns' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="resources" options={{ title: 'Resources' }} />
      <Tabs.Screen name="wellness" options={{ title: 'Wellness' }} />
    </Tabs>
  );
}
