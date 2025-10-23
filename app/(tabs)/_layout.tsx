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
  {/* 
    OPTIMIZED TAB BAR STRUCTURE (Oct 23, 2025)
    - Focus on core user journeys
    - Logical feature grouping
    - Maximum 5-6 visible tabs for usability
  */}
        
        {/* Primary Tab: Home - Central hub and personalized content */}
        <Tabs.Screen
          name="index"
          options={{
            title: t("nav.home", "Home"),
            tabBarLabel: t("nav.home", "Home"),
            tabBarAccessibilityLabel: `${t("nav.home", "Home")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size + 2} />
            ),
          }}
        />

        {/* Core Tab: Wellness - Health & wellbeing tools */}
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
        
        {/* Core Tab: Resources - Tools, letters, evidence */}
        <Tabs.Screen
          name="resources"
          options={{
            title: t("nav.resources"),
            tabBarLabel: t("nav.resources"),
            tabBarAccessibilityLabel: `${t("nav.resources")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "briefcase" : "briefcase-outline"} color={color} size={size + 2} />
            ),
          }}
        />

        {/* Core Tab: Advocacy - Legal help, support, rights */}
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

        {/* Core Tab: Community - Chat, events, campaigns */}
        <Tabs.Screen
          name="community"
          options={{
            title: t("nav.community"),
            tabBarLabel: t("nav.community"),
            tabBarAccessibilityLabel: `${t("nav.community")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "people" : "people-outline"} color={color} size={size + 2} />
            ),
          }}
        />

  {/* Hidden routes - accessible via menu or internal navigation */}
        
        {/* Research & Learning (moved to menu - secondary feature) */}
        <Tabs.Screen name="research" options={{ href: null }} />
        <Tabs.Screen name="podcasts" options={{ href: null }} />
        <Tabs.Screen name="whatsnew" options={{ href: null }} />
        
        {/* Events (now part of Community section) */}
        <Tabs.Screen name="events" options={{ href: null }} />
        
        {/* Campaigns (now part of Community section) */}
        <Tabs.Screen name="campaigns" options={{ href: null }} />
        
        {/* Utility routes */}
    <Tabs.Screen name="inbox" options={{ href: null }} />
    <Tabs.Screen name="settings" options={{ href: null }} />
    <Tabs.Screen name="saved" options={{ href: null }} />
    <Tabs.Screen name="saved.impl" options={{ href: null }} />
    <Tabs.Screen name="voice-help" options={{ href: null }} />
    <Tabs.Screen name="admin" options={{ href: null }} />
    <Tabs.Screen name="archive" options={{ href: null }} />
    <Tabs.Screen name="faqs" options={{ href: null }} />
    <Tabs.Screen name="about" options={{ href: null }} />
    <Tabs.Screen name="wellness.mood" options={{ href: null }} />
    <Tabs.Screen name="onboarding" options={{ href: null }} />
      </Tabs>
      <VoiceController />
    </>
  );
}

