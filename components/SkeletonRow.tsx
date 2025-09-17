import React from "react";
import { View, StyleSheet, useColorScheme } from "react-native";
import { colors, type Palette } from "../theme/colors";

export default function SkeletonRow({ testID }: { testID?: string }) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityLabel="Loading item"
      accessible
    >
      <View style={styles.title} />
      <View style={styles.subtitle} />
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    title: {
      height: 14,
      backgroundColor: palette.muted,
      opacity: 0.35,
      borderRadius: 4,
      marginBottom: 8,
      width: "60%",
    },
    subtitle: {
      height: 12,
      backgroundColor: palette.muted,
      opacity: 0.25,
      borderRadius: 4,
      width: "40%",
    },
  });
}
