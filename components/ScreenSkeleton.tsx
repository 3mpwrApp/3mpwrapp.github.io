import { StyleSheet } from "react-native";

import { useAnnounceOnMount } from "../hooks/useA11y";
import { useTranslation } from "../i18n";

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
  const { t } = useTranslation();
  // Announce once when fallback appears
  useAnnounceOnMount(t("common.loading"));
  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel={t("common.loading")}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      importantForAccessibility="no-hide-descendants"
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
