import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import ThemedHeader from '../../components/ThemedHeader';
import { useAppPalette } from '../../theme/usePalette';

export default function TabsLayout() {
  const palette = useAppPalette();
  
  if (__DEV__) console.warn('[TabsLayout] Rendering full tabs layout...');
  
  return (
    <Tabs
      screenOptions={{
        header: () => <ThemedHeader />,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textSecondary,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen 
        name="campaigns" 
        options={{
          title: 'Campaigns',
          tabBarIcon: ({ color, size }) => <Ionicons name="megaphone" size={size} color={color} />,
        }}
      />
      <Tabs.Screen 
        name="community" 
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="resources" 
        options={{
          title: 'Resources',
          tabBarIcon: ({ color, size }) => <Ionicons name="library" size={size} color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen 
        name="wellness" 
        options={{
          title: 'Wellness',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size} color={color} />,
          headerShown: false,
        }}
      />
      
      {/* Hidden tabs */}
      <Tabs.Screen name="settings" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="advocacy" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="events" options={{ href: null }} />
      <Tabs.Screen name="inbox" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="saved.impl" options={{ href: null }} />
      <Tabs.Screen name="research" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="faqs" options={{ href: null }} />
      <Tabs.Screen name="archive" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="admin" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="diagnostics" options={{ href: null }} />
      <Tabs.Screen name="voice-help" options={{ href: null }} />
      <Tabs.Screen name="wellness.mood" options={{ href: null }} />
    </Tabs>
  );
}
