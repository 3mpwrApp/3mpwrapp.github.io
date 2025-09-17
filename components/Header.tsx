import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { colors, type Palette } from "../theme/colors";
import { openExternalUrl } from "../utils/linking";

export default function Header() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  // Helper to open external links safely
  const openLink = openExternalUrl;

  return (
    <SafeAreaView style={styles.container} accessibilityRole="header">
      <Text
        style={styles.title}
        accessibilityRole="header"
        accessibilityLabel="Empowr App Header"
      >
        Empowr App
      </Text>

      <View style={styles.icons}>
        {/* Facebook */}
        <Pressable
          onPress={() =>
            openLink("https://www.facebook.com/profile.php?id=61579428783083")
          }
          accessibilityRole="link"
          accessibilityLabel="Visit Empowr on Facebook"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-facebook" size={22} color="#1877F2" />
        </Pressable>

        {/* Instagram */}
        <Pressable
          onPress={() =>
            openLink(
              "https://www.instagram.com/empowrapp/?fbclid=IwY2xjawMcTXBleHRuA2FlbQIxMABicmlkETFrQ2NrdUVNRkkyZEwyQzl3AR4lSOSuKqDtqxWcYKFa_3oOsmQyl7LNaTzPYefvej5zbV6OLIiocWi2g-jWJg_aem_czDWuUGxec3CmgrTZCy1Ng#",
            )
          }
          accessibilityRole="link"
          accessibilityLabel="Visit Empowr on Instagram"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-instagram" size={22} color="#E1306C" />
        </Pressable>

        {/* X / Twitter */}
        <Pressable
          onPress={() =>
            openLink(
              "https://x.com/empowrapp0816?fbclid=IwY2xjawMcTXZleHRuA2FlbQIxMABicmlkETFrQ2NrdUVNRkkyZEwyQzl3AR61C332JUq1rDfsHDqrSzlKvJCynRvFEsD3UkM5ChPwJnRrPC6ChjgkAmqKGQ_aem_zrX0dQO1QeE3I6yquzlCeA",
            )
          }
          accessibilityRole="link"
          accessibilityLabel="Visit Empowr on X"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-x" size={22} color="#000000" />
        </Pressable>

        {/* Email */}
        <Pressable
          onPress={() => openLink("mailto:empowrapp08162025@gmail.com")}
          accessibilityRole="link"
          accessibilityLabel="Email Empowr at empowrapp08162025@gmail.com"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="mail" size={22} color="#D44638" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      paddingTop: 8,
      paddingBottom: 10,
      paddingHorizontal: 20,
      backgroundColor: palette.background,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: palette.text,
    },
    icons: {
      flexDirection: "row",
      gap: 15,
    },
  });
}
