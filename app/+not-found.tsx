import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { Link, Stack, useRouter } from "expo-router";

import { colors, type Palette } from "../theme/colors";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../hooks/useA11y";

export default function NotFoundScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Page not found");
  useFocusOnRefOnMount(titleRef);

  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View style={styles.container}>
        <Text
          ref={titleRef}
          nativeID="notfound-title"
          accessibilityRole="header"
          style={styles.text}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          404 - Page Not Found
        </Text>

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
        >
          <Text
            style={styles.buttonText}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            Go Back
          </Text>
        </Pressable>

        <Link
          href={"/" as any}
          replace
          asChild
          accessibilityRole="link"
          accessibilityLabel="Go to home"
          accessibilityHint="Navigates to the home tab"
        >
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.button,
              { marginTop: 12 },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Text
              style={styles.buttonText}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              Go Home
            </Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
      backgroundColor: palette.background,
      minHeight: 44,
      minWidth: 44,
    },
    text: { fontSize: 20, marginBottom: 16, color: palette.text },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      backgroundColor: palette.primary,
      borderRadius: 6,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
