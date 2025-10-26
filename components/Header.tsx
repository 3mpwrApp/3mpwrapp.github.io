import { Ionicons } from "@expo/vector-icons";
import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    useColorScheme
} from "react-native";

import { colors, type Palette } from "../theme/colors";
import { openExternalUrl } from "../utils/linking";

import BookmarkToggle from "./BookmarkToggle";
import GapView from "./GapView";

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
      accessibilityLabel="3mpwr App Header"
      >
      3mpwr App
      </Text>

      <GapView style={styles.icons} gap={15}>
        <BookmarkToggle />
        {/* Facebook */}
        <Pressable
          onPress={() =>
            openLink("https://www.facebook.com/profile.php?id=61579428783083")
          }
          accessibilityRole="link"
              accessibilityLabel="Visit 3mpwr on Facebook"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-facebook" size={22} color={palette.primary} />
        </Pressable>

        {/* Instagram */}
        <Pressable
          onPress={() =>
            openLink(
              "https://www.instagram.com/empowrapp/?fbclid=IwY2xjawMcTXBleHRuA2FlbQIxMABicmlkETFrQ2NrdUVNRkkyZEwyQzl3AR4lSOSuKqDtqxWcYKFa_3oOsmQyl7LNaTzPYefvej5zbV6OLIiocWi2g-jWJg_aem_czDWuUGxec3CmgrTZCy1Ng#",
            )
          }
          accessibilityRole="link"
              accessibilityLabel="Visit 3mpwr on Instagram"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-instagram" size={22} color={palette.primary} />
        </Pressable>

        {/* X / Twitter */}
        <Pressable
          onPress={() =>
            openLink(
              "https://x.com/3mpowrApp0816",
            )
          }
          accessibilityRole="link"
              accessibilityLabel="Visit 3mpwr on X"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="logo-twitter" size={22} color={palette.text} />
        </Pressable>

        {/* Email */}
        <Pressable
          onPress={() => openLink("mailto:empowrapp08162025@gmail.com")}
          accessibilityRole="link"
              accessibilityLabel="Email 3mpwr at empowrapp08162025@gmail.com"
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        >
          <Ionicons name="mail" size={22} color={palette.primary} />
        </Pressable>
      </GapView>
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
    },
  });
}
