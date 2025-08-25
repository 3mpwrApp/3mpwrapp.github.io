import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.content}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#0077b6",
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="campaigns"
            options={{
              title: "Campaigns",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="megaphone" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="community"
            options={{
              title: "Community",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="people" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="resources"
            options={{
              title: "Resources",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="book" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="wellness"
            options={{
              title: "Wellness",
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="leaf" size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
