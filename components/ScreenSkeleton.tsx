import { StyleSheet } from "react-native";

import SkeletonRow from "./SkeletonRow";
import { ThemedView } from "./ThemedView";

type Props = {
  rows?: number;
  testID?: string;
  style?: any;
};

export default function ScreenSkeleton({
  rows = 6,
  testID = "screen-skeleton",
  style,
}: Props) {
  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} testID={`${testID}-row-${i}`} />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
