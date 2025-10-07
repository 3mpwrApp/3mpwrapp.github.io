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
          name="whatsnew/index"
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
          name="faqs"
          options={{
            title: t("nav.faqs", "FAQs"),
            tabBarLabel: t("nav.faqs", "FAQs"),
            tabBarAccessibilityLabel: `${t("nav.faqs", "FAQs")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "help-circle" : "help-circle-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="about"
          options={{
            title: t("nav.about", "About / Contact"),
            tabBarLabel: t("nav.about", "About"),
            tabBarAccessibilityLabel: `${t("nav.about", "About / Contact")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "information-circle" : "information-circle-outline"} color={color} size={size + 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="wellness/index"
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
          name="resources/index"
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
          name="research/index"
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
          name="podcasts/index"
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
          name="events/index"
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
          name="community/index"
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
          name="campaigns/index"
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
          name="advocacy/index"
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
        <Tabs.Screen name="settings" options={{ href: null }} />
        <Tabs.Screen name="saved" options={{ href: null }} />
        <Tabs.Screen name="saved-original" options={{ href: null }} />
        <Tabs.Screen name="voice-help" options={{ href: null }} />
  <Tabs.Screen name="admin/index" options={{ href: null }} />
  <Tabs.Screen name="archive/index" options={{ href: null }} />

        {/* Keep resource tools hidden under Resources */}
  {/* User-requested hidden tools under Resources */}
  <Tabs.Screen name="resources/body-mechanics-advisor" options={{ href: null }} />
  <Tabs.Screen name="resources/accommodation-request" options={{ href: null }} />
  <Tabs.Screen name="resources/evidence-locker" options={{ href: null }} />
  <Tabs.Screen name="resources/allyship-playbook" options={{ href: null }} />
  <Tabs.Screen name="resources/accessibility-log" options={{ href: null }} />
  <Tabs.Screen name="resources/rights-explainer" options={{ href: null }} />
  <Tabs.Screen name="resources/policy-simulator" options={{ href: null }} />
        <Tabs.Screen name="resources/letter-reconsideration" options={{ href: null }} />
        <Tabs.Screen name="resources/letter-rtw-plan" options={{ href: null }} />
        <Tabs.Screen name="resources/letter-union-request" options={{ href: null }} />
        <Tabs.Screen name="resources/claims-navigator" options={{ href: null }} />
        <Tabs.Screen name="resources/evidence-queue" options={{ href: null }} />
  <Tabs.Screen name="resources/support-directory" options={{ href: null }} />
  <Tabs.Screen name="resources/doctor-visit-prep" options={{ href: null }} />
  <Tabs.Screen name="resources/denial-decoder" options={{ href: null }} />
  <Tabs.Screen name="resources/letter-accommodation" options={{ href: null }} />
  <Tabs.Screen name="resources/letter-appeal" options={{ href: null }} />
        <Tabs.Screen name="resources/rights-checker" options={{ href: null }} />
        <Tabs.Screen name="resources/appeal-coach" options={{ href: null }} />
        <Tabs.Screen name="resources/deadlines" options={{ href: null }} />
        <Tabs.Screen name="resources/deadlines-list" options={{ href: null }} />
        <Tabs.Screen name="resources/evidence-checklist" options={{ href: null }} />
        <Tabs.Screen name="resources/voice-notes" options={{ href: null }} />
        <Tabs.Screen name="resources/templates-gallery" options={{ href: null }} />
        <Tabs.Screen name="resources/financial-safety-net" options={{ href: null }} />
        <Tabs.Screen name="resources/adaptive-tech-library" options={{ href: null }} />
  <Tabs.Screen name="resources/justice-as-a-service" options={{ href: null }} />
  <Tabs.Screen name="resources/impact-simulator" options={{ href: null }} />
        <Tabs.Screen name="resources/myth-busting-hub" options={{ href: null }} />
        <Tabs.Screen name="resources/case-timeline" options={{ href: null }} />
  <Tabs.Screen name="resources/ai-decision-simplifier" options={{ href: null }} />
  <Tabs.Screen name="resources/chronic-tracker" options={{ href: null }} />
  <Tabs.Screen name="resources/meds-tracker" options={{ href: null }} />
  <Tabs.Screen name="resources/rehab-tracker" options={{ href: null }} />
  <Tabs.Screen name="resources/solidarity-toolkit" options={{ href: null }} />
  <Tabs.Screen name="resources/rtw-planner" options={{ href: null }} />
        <Tabs.Screen name="resources/[id]" options={{ href: null }} />

    {/* (additional routes grouped below) */}

        {/* Advocacy */}
        <Tabs.Screen name="advocacy/[id]" options={{ href: null }} />
  <Tabs.Screen name="advocacy/assistant-hub" options={{ href: null }} />
        <Tabs.Screen name="advocacy/self-advocacy-coach" options={{ href: null }} />
        <Tabs.Screen name="advocacy/policy-simple" options={{ href: null }} />
        <Tabs.Screen name="advocacy/ai-advocate-translator" options={{ href: null }} />
        <Tabs.Screen name="advocacy/ai-case-interpreter" options={{ href: null }} />
        <Tabs.Screen name="advocacy/collective-legal" options={{ href: null }} />
        <Tabs.Screen name="advocacy/ai-gov-navigator" options={{ href: null }} />
        <Tabs.Screen name="advocacy/ask" options={{ href: null }} />

        {/* Campaigns */}
        <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
        <Tabs.Screen name="campaigns/room/[id]" options={{ href: null }} />

        {/* Community */}
        <Tabs.Screen name="community/[slug]" options={{ href: null }} />
        <Tabs.Screen name="community/compose" options={{ href: null }} />
        <Tabs.Screen name="community/threads/[id]" options={{ href: null }} />
  <Tabs.Screen name="community/dms/index" options={{ href: null }} />
  <Tabs.Screen name="community/dms/[id]" options={{ href: null }} />
  <Tabs.Screen name="community/safety" options={{ href: null }} />
        <Tabs.Screen name="community/media-studio" options={{ href: null }} />
        <Tabs.Screen name="community/mutual-aid" options={{ href: null }} />
        <Tabs.Screen name="community/mutual-chat" options={{ href: null }} />
  <Tabs.Screen name="community/testers-chat" options={{ href: null }} />
  <Tabs.Screen name="community/my-posts" options={{ href: null }} />

  {/* Wellness special routes */}
  <Tabs.Screen name="wellness.mood" options={{ href: null }} />
  {/* User-requested hidden tools under Wellness */}
  <Tabs.Screen name="wellness/nutrition-guides" options={{ href: null }} />
  <Tabs.Screen name="wellness/symptom-tracker" options={{ href: null }} />
  <Tabs.Screen name="wellness/pain-forecast" options={{ href: null }} />

        {/* Misc */}
  <Tabs.Screen name="events/[id]" options={{ href: null }} />
  <Tabs.Screen name="events/finder" options={{ href: null }} />
        <Tabs.Screen name="podcasts/[id]" options={{ href: null }} />
        <Tabs.Screen name="podcasts/stories/[id]" options={{ href: null }} />
    {/* Research routes hide themselves; no need to list here */}
      </Tabs>
      <VoiceController />
    </>
  );
}

