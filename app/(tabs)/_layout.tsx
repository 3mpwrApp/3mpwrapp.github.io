import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { colors } from "../../theme/colors";
import { useTranslation } from "../../i18n";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarItemStyle: { minHeight: 48, paddingVertical: 6 },
        tabBarLabelStyle: { fontSize: 12, fontFamily: "Poppins" },
        tabBarAllowFontScaling: true,
      }}
    >
      {/* Hide all non-tab routes to avoid auto-adding them as tabs */}
      <Tabs.Screen name="archive/index" options={{ href: null }} />
      <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-accommodation" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-appeal" options={{ href: null }} />
      <Tabs.Screen name="events/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/stories/[id]" options={{ href: null }} />
      <Tabs.Screen name="community/[slug]" options={{ href: null }} />
      <Tabs.Screen name="community/threads/[id]" options={{ href: null }} />
      {/* Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarLabel: t("nav.home"),
          tabBarAccessibilityLabel: t("nav.home") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size + 2} />
          ),
        }}
      />

      {/* Main tabs */}
      <Tabs.Screen
        name="campaigns/index"
        options={{
          title: t("nav.campaigns"),
          tabBarLabel: t("nav.campaigns"),
          tabBarAccessibilityLabel: t("nav.campaigns") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "megaphone" : "megaphone-outline"} color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen
        name="community/index"
        options={{
          title: "Community Hub",
          tabBarLabel: "Community",
          tabBarAccessibilityLabel: "Community Hub tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen name="advocacy/index" options={{ href: null }} />

      <Tabs.Screen
        name="podcasts/index"
        options={{
          title: "Podcasts & Stories",
          tabBarLabel: "Podcasts",
          tabBarAccessibilityLabel: "Podcasts and Stories tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "mic" : "mic-outline"} color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen name="resources/index" options={{ href: null }} />


      <Tabs.Screen
        name="events/index"
        options={{
          title: t("nav.events"),
          tabBarLabel: t("nav.events"),
          tabBarAccessibilityLabel: t("nav.events") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size + 2} />
          ),
        }}
      />

      <Tabs.Screen name="research/index" options={{ href: null }} />


      <Tabs.Screen name="whatsnew/index" options={{ href: null }} />


      {/* Simple pages */}
      <Tabs.Screen name="faqs" options={{ href: null }} />

      <Tabs.Screen name="wellness" options={{ href: null }} />

      {/* Saved is now accessible from the header menu, not as a tab */}
      <Tabs.Screen name="saved" options={{ href: null }} />

      {/* Settings is accessible from header, not as a tab */}
      <Tabs.Screen name="settings" options={{ href: null }} />

      <Tabs.Screen name="about" options={{ href: null }} />
    </Tabs>
  );
}
