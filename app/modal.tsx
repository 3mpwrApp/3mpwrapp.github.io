import { Stack, useRouter } from "expo-router";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from "react-native";

import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../hooks/useA11y";
import { colors, type Palette } from "../theme/colors";
import { maxFontScale } from '../utils/platform';

export default function Modal() {
  const router = useRouter();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);

  useAnnounceOnMount("Modal opened");
  useFocusOnRefOnMount(titleRef);

  return (
    <>
      <Stack.Screen options={{ title: "Modal" }} />
      <View style={styles.container} accessibilityViewIsModal>
        <Text
          ref={titleRef}
          nativeID="modal-title"
          accessibilityRole="header"
          style={styles.text}
          {...maxFontScale(MAX_FONT_SCALE)}
        >
          This is a modal screen
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
          accessibilityHint="Dismisses the modal and returns to the previous screen"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
        >
          <Text
            style={styles.buttonText}
            {...maxFontScale(MAX_FONT_SCALE)}
          >
            Close
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    text: { fontSize: 20, marginBottom: 16, color: palette.text },
    button: {
      padding: 10,
      backgroundColor: palette.primary,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  });
}
