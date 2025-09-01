import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { colors } from "../../theme/colors";
import { SettingsProvider } from "../../store/settings";
import { useCounts } from "../../store/counts";
import { useTranslation } from "../../i18n";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;
  const { counts } = useCounts();
  const { t } = useTranslation();

  return (
    <SettingsProvider>
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
      {/* Ensure initial route is index and show Home tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarLabel: t("nav.home"),
          tabBarAccessibilityLabel: t("nav.home") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />

      {/* Hide detail routes from the tab bar to avoid duplicates */}
      <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/[id]" options={{ href: null }} />
      <Tabs.Screen name="events/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/stories/[id]" options={{ href: null }} />
      <Tabs.Screen name="community/[slug]" options={{ href: null }} />
      <Tabs.Screen name="community/threads/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="campaigns/index"
        options={{
          title: t("nav.campaigns"),
          tabBarLabel: t("nav.campaigns"),
          tabBarAccessibilityLabel: t("nav.campaigns") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "megaphone" : "megaphone-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="community/index"
        options={{
          title: t("nav.community"),
          tabBarLabel: t("nav.community"),
          tabBarAccessibilityLabel: t("nav.community") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} color={color} size={size} />
          ),
        }}
      />
      {/* Removed Campaigns and Community Hub tabs per request */}
      <Tabs.Screen
        name="advocacy/index"
        options={{
          title: t("nav.advocacy"),
          tabBarLabel: t("nav.advocacy"),
          tabBarAccessibilityLabel: t("nav.advocacy") + " tab",
          // no badge
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? "people" : "people-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="podcasts/index"
        options={{
          title: t("nav.podcasts"),
          tabBarLabel: t("nav.podcasts"),
          tabBarAccessibilityLabel: t("nav.podcasts") + " tab",
          // no badge
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "mic" : "mic-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="resources/index"
        options={{
          title: t("nav.resources"),
          tabBarLabel: t("nav.resources"),
          tabBarAccessibilityLabel: t("nav.resources") + " tab",
          // no badge
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="events/index"
        options={{
          title: t("nav.events"),
          tabBarLabel: t("nav.events"),
          tabBarAccessibilityLabel: t("nav.events") + " tab",
          // no badge
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="research/index"
        options={{
          title: "Research",
          tabBarLabel: "Research",
          tabBarAccessibilityLabel: "Research tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="whatsnew/index"
        options={{
          title: "What's New",
          tabBarLabel: "What's New",
          tabBarAccessibilityLabel: "What's New tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "sparkles" : "sparkles-outline" as any} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive/index"
        options={{
          title: "Archive",
          tabBarLabel: "Archive",
          tabBarAccessibilityLabel: "Archive tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "time" : "time-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="faqs"
        options={{
          title: "FAQs",
          tabBarLabel: "FAQs",
          tabBarAccessibilityLabel: "FAQs tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "help-circle" : "help-circle-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: "About & Contact",
          tabBarLabel: "About",
          tabBarAccessibilityLabel: "About tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="wellness"
        options={{
          title: t("nav.wellness"),
          tabBarLabel: t("nav.wellness"),
          tabBarAccessibilityLabel: t("nav.wellness") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.profile") + " • Settings",
          tabBarLabel: "Settings",
          tabBarAccessibilityLabel: "Settings tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t("nav.saved") ?? "Saved",
          tabBarLabel: t("nav.saved") ?? "Saved",
          tabBarAccessibilityLabel: (t("nav.saved") ?? "Saved") + " tab",
          tabBarIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <Ionicons name={focused ? "bookmark" : "bookmark-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
    </SettingsProvider>
  );
}
