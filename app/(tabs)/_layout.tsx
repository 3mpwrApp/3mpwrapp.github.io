import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";
import { useTranslation } from "../../i18n";
import { useWhatsNewBadge } from "../../hooks/useWhatsNewBadge";
import VoiceController from "../../components/VoiceController";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;
  const { t } = useTranslation();
  const wnBadge = useWhatsNewBadge();

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
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
      {/* Local profile provider can be wrapped at app root in the future */}
      {/* Hide all nested / detail routes to prevent auto-tabs */}
      <Tabs.Screen
        name="resources/letter-reconsideration"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/letter-rtw-plan" options={{ href: null }} />
      <Tabs.Screen
        name="resources/letter-union-request"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/claims-navigator" options={{ href: null }} />
      <Tabs.Screen name="resources/evidence-locker" options={{ href: null }} />
      <Tabs.Screen name="resources/evidence-queue" options={{ href: null }} />
      <Tabs.Screen
        name="resources/support-directory"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/rights-checker" options={{ href: null }} />
      <Tabs.Screen name="resources/appeal-coach" options={{ href: null }} />
      <Tabs.Screen name="resources/deadlines" options={{ href: null }} />
      <Tabs.Screen name="resources/deadlines-list" options={{ href: null }} />
      <Tabs.Screen
        name="resources/evidence-checklist"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/voice-notes" options={{ href: null }} />
      <Tabs.Screen
        name="resources/templates-gallery"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/financial-safety-net" options={{ href: null }} />
      <Tabs.Screen name="resources/adaptive-tech-library" options={{ href: null }} />
      <Tabs.Screen name="resources/justice-as-a-service" options={{ href: null }} />
      <Tabs.Screen name="resources/impact-simulator" options={{ href: null }} />
      <Tabs.Screen name="resources/myth-busting-hub" options={{ href: null }} />
      <Tabs.Screen name="resources/case-timeline" options={{ href: null }} />
      <Tabs.Screen name="resources/ai-decision-simplifier" options={{ href: null }} />
      <Tabs.Screen name="wellness/work-balance-ai" options={{ href: null }} />
      <Tabs.Screen name="wellness/grief-support" options={{ href: null }} />
      <Tabs.Screen
        name="wellness/adaptive-meditation"
        options={{ href: null }}
      />
      <Tabs.Screen name="advocacy/support-directory" options={{ href: null }} />
      <Tabs.Screen name="archive/index" options={{ href: null }} />
      <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
      <Tabs.Screen name="campaigns/room/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/[id]" options={{ href: null }} />
      <Tabs.Screen
        name="resources/letter-accommodation"
        options={{ href: null }}
      />
      <Tabs.Screen name="resources/letter-appeal" options={{ href: null }} />
      <Tabs.Screen name="wellness/symptom-tracker" options={{ href: null }} />
      <Tabs.Screen
        name="wellness/sleep-energy-tracker"
        options={{ href: null }}
      />
      <Tabs.Screen name="wellness/self-care-library" options={{ href: null }} />
      <Tabs.Screen name="wellness/rehab-games" options={{ href: null }} />
      <Tabs.Screen name="wellness/daily-planner" options={{ href: null }} />
      <Tabs.Screen name="wellness/achievements" options={{ href: null }} />
      <Tabs.Screen name="events/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/stories/[id]" options={{ href: null }} />
      <Tabs.Screen name="community/[slug]" options={{ href: null }} />
      <Tabs.Screen name="community/compose" options={{ href: null }} />
      <Tabs.Screen name="community/threads/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/index" options={{ href: null }} />
      <Tabs.Screen
        name="advocacy/self-advocacy-coach"
        options={{ href: null }}
      />
      <Tabs.Screen name="advocacy/policy-simple" options={{ href: null }} />
      <Tabs.Screen
        name="advocacy/ai-advocate-translator"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="advocacy/ai-case-interpreter"
        options={{ href: null }}
      />
      <Tabs.Screen name="advocacy/collective-legal" options={{ href: null }} />
      <Tabs.Screen name="advocacy/ai-gov-navigator" options={{ href: null }} />
      <Tabs.Screen name="advocacy/ask" options={{ href: null }} />
      {/* removed to avoid duplicate with visible tab */}
      <Tabs.Screen name="research/index" options={{ href: null }} />
      <Tabs.Screen name="faqs" options={{ href: null }} />
      {/* removed to avoid duplicate with visible tab */}
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />
      <Tabs.Screen name="admin/index" options={{ href: null }} />

      {/* âœ… Main visible tabs */}

      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: t("nav.home"),
          tabBarLabel: t("nav.home"),
          tabBarAccessibilityLabel: `${t("nav.home")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Campaigns */}
      <Tabs.Screen
        name="campaigns/index"
        options={{
          title: t("nav.campaigns"),
          tabBarLabel: t("nav.campaigns"),
          tabBarAccessibilityLabel: `${t("nav.campaigns")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "megaphone" : "megaphone-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Community */}
      <Tabs.Screen
        name="community/index"
        options={{
          title: t("nav.community"),
          tabBarLabel: t("nav.community"),
          tabBarAccessibilityLabel: `${t("nav.community")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "chatbubbles" : "chatbubbles-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Resources (promote into main tabs) */}
      <Tabs.Screen
        name="resources/index"
        options={{
          title: t("nav.resources"),
          tabBarLabel: t("nav.resources"),
          tabBarAccessibilityLabel: `${t("nav.resources")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Wellness (promote into main tabs) */}
      <Tabs.Screen
        name="wellness"
        options={{
          title: t("nav.wellness"),
          tabBarLabel: t("nav.wellness"),
          tabBarAccessibilityLabel: `${t("nav.wellness")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Advocacy */}
      <Tabs.Screen
        name="advocacy/index"
        options={{
          title: t("nav.advocacy") || "Advocacy",
          tabBarLabel: t("nav.advocacy") || "Advocacy",
          tabBarAccessibilityLabel: `Advocacy tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "ribbon" : "ribbon-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Settings */}
      <Tabs.Screen
        name="settings"
        options={{
          title: t("nav.settings") || "Settings",
          tabBarLabel: t("nav.settings") || "Settings",
          tabBarAccessibilityLabel: `Settings tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* What's New */}
      <Tabs.Screen
        name="whatsnew/index"
        options={{
          title: "What's New",
          tabBarLabel: "What's New",
          tabBarAccessibilityLabel: `What's New tab`,
          tabBarBadge: wnBadge,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "star" : "star-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />
    </Tabs>
    <VoiceController />
    </>
  );
}





