// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SafeAreaView, StyleSheet, View } from "react-native";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Colors from "../../constants/Colors";

export default function TabsLayout() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <Header />

        <View style={styles.content}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: Colors.primary,
              tabBarInactiveTintColor: "#8e8e93",
              tabBarStyle: { backgroundColor: "#fff" },
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarLabel: "Home",
                tabBarAccessibilityLabel:
                  "Home tab. Welcome and overview.",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="home-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="campaigns"
              options={{
                title: "Campaigns",
                tabBarLabel: "Campaigns",
                tabBarAccessibilityLabel:
                  "Campaigns tab. Advocacy and actions.",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="megaphone-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="community"
              options={{
                title: "Community",
                tabBarLabel: "Community",
                tabBarAccessibilityLabel:
                  "Community tab. Connect with Persons with Disabilities.",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="people-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="resources"
              options={{
                title: "Resources",
                tabBarLabel: "Resources",
                tabBarAccessibilityLabel:
                  "Resources tab. Guides and helpful links.",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="book-outline" size={size} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="wellness"
              options={{
                title: "Wellness",
                tabBarLabel: "Wellness",
                tabBarAccessibilityLabel:
                  "Wellness tab. Self-care and mental health support.",
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="heart-outline" size={size} color={color} />
                ),
              }}
            />
          </Tabs>
        </View>

        <Footer />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary }, // keeps status bar area branded
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
});
