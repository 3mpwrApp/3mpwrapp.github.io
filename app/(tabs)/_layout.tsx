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
      {/* Local profile provider can be wrapped at app root in the future */}
      {/* Hide all nested / detail routes to prevent auto-tabs */}
      <Tabs.Screen name="resources/letter-reconsideration" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-rtw-plan" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-union-request" options={{ href: null }} />
      <Tabs.Screen name="resources/claims-navigator" options={{ href: null }} />
      <Tabs.Screen name="resources/evidence-locker" options={{ href: null }} />
      <Tabs.Screen name="resources/support-directory" options={{ href: null }} />
      <Tabs.Screen name="resources/rights-checker" options={{ href: null }} />
      <Tabs.Screen name="resources/appeal-coach" options={{ href: null }} />
      <Tabs.Screen name="resources/deadlines" options={{ href: null }} />
      <Tabs.Screen name="resources/evidence-checklist" options={{ href: null }} />
      <Tabs.Screen name="resources/templates-gallery" options={{ href: null }} />
      <Tabs.Screen name="advocacy/support-directory" options={{ href: null }} />
      <Tabs.Screen name="archive/index" options={{ href: null }} />
      <Tabs.Screen name="campaigns/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/[id]" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-accommodation" options={{ href: null }} />
      <Tabs.Screen name="resources/letter-appeal" options={{ href: null }} />
      <Tabs.Screen name="wellness/symptom-tracker" options={{ href: null }} />
      <Tabs.Screen name="wellness/sleep-energy-tracker" options={{ href: null }} />
      <Tabs.Screen name="wellness/self-care-library" options={{ href: null }} />
      <Tabs.Screen name="events/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/[id]" options={{ href: null }} />
      <Tabs.Screen name="podcasts/stories/[id]" options={{ href: null }} />
      <Tabs.Screen name="community/[slug]" options={{ href: null }} />
      <Tabs.Screen name="community/threads/[id]" options={{ href: null }} />
      <Tabs.Screen name="advocacy/index" options={{ href: null }} />
      <Tabs.Screen name="advocacy/ask" options={{ href: null }} />
      <Tabs.Screen name="resources/index" options={{ href: null }} />
      <Tabs.Screen name="research/index" options={{ href: null }} />
      <Tabs.Screen name="whatsnew/index" options={{ href: null }} />
      <Tabs.Screen name="faqs" options={{ href: null }} />
      <Tabs.Screen name="wellness" options={{ href: null }} />
      <Tabs.Screen name="saved" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="about" options={{ href: null }} />

      {/* ✅ Main visible tabs */}

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

      {/* Podcasts */}
      <Tabs.Screen
        name="podcasts/index"
        options={{
          title: t("nav.podcasts"),
          tabBarLabel: t("nav.podcasts"),
          tabBarAccessibilityLabel: `${t("nav.podcasts")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "mic" : "mic-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />

      {/* Events */}
      <Tabs.Screen
        name="events/index"
        options={{
          title: t("nav.events"),
          tabBarLabel: t("nav.events"),
          tabBarAccessibilityLabel: `${t("nav.events")} tab`,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              size={size + 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
