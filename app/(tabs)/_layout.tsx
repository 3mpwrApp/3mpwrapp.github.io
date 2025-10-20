import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, useColorScheme } from "react-native";

import VoiceController from "../../components/VoiceController";
import { useWhatsNewBadge } from "../../hooks/useWhatsNewBadge";
import { useTranslation } from "../../i18n";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;
  const { t } = useTranslation();
  const wnBadge = useWhatsNewBadge();
  // Unread badge for Inbox (tab hidden) — not used currently

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          // Lazy render tab screens on first focus to reduce initial bundle work
          lazy: true,
          tabBarActiveTintColor: activeTint,
          tabBarInactiveTintColor: inactiveTint,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.muted,
            borderTopWidth: StyleSheet.hairlineWidth,
            minHeight: 54,
          },
          tabBarItemStyle: { minHeight: 48, paddingVertical: 6 },
          tabBarLabelStyle: { fontSize: 13, fontWeight: "600" },
          tabBarAllowFontScaling: true,
        }}
      >
  {/* Visible tabs (curated) */}
        <Tabs.Screen
          name="whatsnew"
          options={{
            title: "What's New",
            tabBarLabel: "What's New",
            tabBarAccessibilityLabel: `What's New tab`,
            tabBarBadge: wnBadge,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "star" : "star-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="wellness"
          options={{
            title: t("nav.wellness"),
            tabBarLabel: t("nav.wellness"),
            tabBarAccessibilityLabel: `${t("nav.wellness")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "heart" : "heart-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="resources"
          options={{
            title: t("nav.resources"),
            tabBarLabel: t("nav.resources"),
            tabBarAccessibilityLabel: `${t("nav.resources")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "book" : "book-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="research"
          options={{
            title: t("nav.research", "Research"),
            tabBarLabel: t("nav.research", "Research"),
            tabBarAccessibilityLabel: `${t("nav.research", "Research")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "flask" : "flask-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="podcasts"
          options={{
            title: t("nav.podcasts", "Podcasts"),
            tabBarLabel: t("nav.podcasts", "Podcasts"),
            tabBarAccessibilityLabel: `${t("nav.podcasts", "Podcasts")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "mic" : "mic-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            title: t("nav.events", "Events"),
            tabBarLabel: t("nav.events", "Events"),
            tabBarAccessibilityLabel: `${t("nav.events", "Events")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: t("nav.community"),
            tabBarLabel: t("nav.community"),
            tabBarAccessibilityLabel: `${t("nav.community")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="campaigns"
          options={{
            title: t("nav.campaigns"),
            tabBarLabel: t("nav.campaigns"),
            tabBarAccessibilityLabel: `${t("nav.campaigns")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "notifications" : "notifications-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="advocacy"
          options={{
            title: t("nav.advocacy") || "Advocacy",
            tabBarLabel: t("nav.advocacy") || "Advocacy",
            tabBarAccessibilityLabel: `Advocacy tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "ribbon" : "ribbon-outline"} color={color} size={size + 2} />
            ),
          }}
        />

  {/* Hidden routes (resources, advocacy, campaigns, community, misc, and deprioritized tabs) */}
        {/* Hide Home, Inbox, Settings, Saved, Voice Help as tabs but keep routes */}
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="inbox" options={{ href: null }} />
    {/* settings/ folder contains the main settings screen and sub-pages */}
    <Tabs.Screen name="settings" options={{ href: null }} />
    <Tabs.Screen name="saved" options={{ href: null }} />
    <Tabs.Screen name="saved.impl" options={{ href: null }} />
    <Tabs.Screen name="saved-original" options={{ href: null }} />
    <Tabs.Screen name="voice-help" options={{ href: null }} />
    <Tabs.Screen name="admin" options={{ href: null }} />
    <Tabs.Screen name="archive" options={{ href: null }} />
    
    {/* Move FAQs and About to menu (accessible via settings menu) */}
    <Tabs.Screen name="faqs" options={{ href: null }} />
    <Tabs.Screen name="about" options={{ href: null }} />
    
    {/* Hide internal settings sections aggregator and all section files */}
    <Tabs.Screen name="settings.sections" options={{ href: null }} />
    
    {/* Hide onboarding (should only be shown via routing logic) */}
    <Tabs.Screen name="onboarding" options={{ href: null }} />

    {/* Keep nested resource tools managed by resources stack; no need to declare here */}

    {/* (additional routes grouped below) */}

    {/* Advocacy routes are handled by its own stack */}

  {/* Campaigns nested routes handled by campaigns stack */}

    {/* Community nested routes handled by community stack */}

    {/* Wellness top-level helpers (direct children) */}
    <Tabs.Screen name="wellness.mood" options={{ href: null }} />

          {/* Misc nested routes are handled by their respective stacks */}
    {/* Research routes hide themselves; no need to list here */}
      </Tabs>
      <VoiceController />
    </>
  );
}

