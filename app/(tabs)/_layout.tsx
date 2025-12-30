import { Ionicons } from "@expo/vector-icons";
import { Tabs , useRouter } from "expo-router";
import { Pressable, StyleSheet, useColorScheme , Alert, Linking } from "react-native";

import VoiceController from "../../components/VoiceController";
import { useTranslation } from "../../i18n";
import { colors } from "../../theme/colors";

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const palette = colorScheme === "dark" ? colors.dark : colors.light;
  const activeTint = palette.primary;
  const inactiveTint = palette.muted;
  const { t } = useTranslation();
  const router = useRouter();
  // Unread badge for Inbox (tab hidden) — not used currently

  // SOS Crisis Menu Handler
  const showCrisisMenu = () => {
    Alert.alert(
      '🆘 Crisis Support',
      'Choose immediate support:',
      [
        {
          text: '📞 Call 988 (Suicide & Crisis)',
          onPress: () => Linking.openURL('tel:988'),
        },
        {
          text: '💬 Crisis Text Line',
          onPress: () => Linking.openURL('sms:741741&body=HOME'),
        },
        {
          text: '🛟 Emotional First Aid',
          onPress: () => router.push('/(tabs)/wellness/emotional-first-aid'),
        },
        {
          text: '⚡ Quick Exit',
          onPress: () => {
            // Quick escape to innocuous screen
            Linking.openURL('https://weather.com').catch(() => {});
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  // SOS Header Button Component
  const SOSHeaderButton = () => (
    <Pressable
      onPress={showCrisisMenu}
      style={{
        marginRight: 16,
        backgroundColor: palette.error,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
      }}
      accessibilityRole="button"
      accessibilityLabel="SOS Crisis Support - Tap for emergency resources"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <Ionicons name="warning" size={18} color={palette.onPrimary} />
    </Pressable>
  );

  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          headerRight: () => <SOSHeaderButton />,
          headerStyle: {
            backgroundColor: palette.surface,
          },
          headerTintColor: palette.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
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
    OPTIMIZED TAB BAR STRUCTURE (Oct 29, 2025)
    - 8 primary bottom tabs for core features
    - Wellness, Resources, Advocacy are tabs (not in menu)
    - Community features accessed via Community tab
    - Research, Events, Campaigns are dedicated tabs
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
            href: "/wellness" as any,
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
            href: "/resources" as any,
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
            href: "/advocacy" as any,
          }}
        />

        {/* Core Tab: Community - Chat, mutual aid, peer support */}
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

        {/* Core Tab: Campaigns - Organize and join campaigns */}
        <Tabs.Screen
          name="campaigns"
          options={{
            title: t("nav.campaigns", "Campaigns"),
            tabBarLabel: t("nav.campaigns", "Campaigns"),
            tabBarAccessibilityLabel: `${t("nav.campaigns", "Campaigns")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "megaphone" : "megaphone-outline"} color={color} size={size + 2} />
            ),
            href: "/campaigns" as any,
          }}
        />

        {/* Core Tab: Events - Community events and calendar */}
        <Tabs.Screen
          name="events"
          options={{
            title: t("nav.events", "Events"),
            tabBarLabel: t("nav.events", "Events"),
            tabBarAccessibilityLabel: `${t("nav.events", "Events")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={size + 2} />
            ),
            href: "/events" as any,
          }}
        />

        {/* Core Tab: Research - Studies, articles, and resources */}
        <Tabs.Screen
          name="research"
          options={{
            title: t("nav.research", "Research"),
            tabBarLabel: t("nav.research", "Research"),
            tabBarAccessibilityLabel: `${t("nav.research", "Research")} tab`,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? "flask" : "flask-outline"} color={color} size={size + 2} />
            ),
            href: "/research" as any,
          }}
        />

  {/* Hidden utility routes - accessible via menu */}
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
      </Tabs>
      <VoiceController />
    </>
  );
}

