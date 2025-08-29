import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarItemStyle: { minHeight: 48, paddingVertical: 6 },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarAllowFontScaling: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarAccessibilityLabel: "Home tab",
          tabBarTestID: "tab-home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{
          title: "Campaigns",
          tabBarLabel: "Campaigns",
          tabBarAccessibilityLabel: "Campaigns tab",
          tabBarTestID: "tab-campaigns",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "megaphone" : "megaphone-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resources"
        options={{
          title: "Resources",
          tabBarLabel: "Resources",
          tabBarAccessibilityLabel: "Resources tab",
          tabBarTestID: "tab-resources",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: "Wellness",
          tabBarLabel: "Wellness",
          tabBarAccessibilityLabel: "Wellness tab",
          tabBarTestID: "tab-wellness",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="advocates"
        options={{
          title: "Advocates",
          tabBarLabel: "Advocates",
          tabBarAccessibilityLabel: "Advocates tab",
          tabBarTestID: "tab-advocates",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Community",
          tabBarLabel: "Community",
          tabBarAccessibilityLabel: "Community tab",
          tabBarTestID: "tab-community",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="podcasts"
        options={{
          title: "Podcasts",
          tabBarLabel: "Podcasts",
          tabBarAccessibilityLabel: "Podcasts tab",
          tabBarTestID: "tab-podcasts",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "mic" : "mic-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
