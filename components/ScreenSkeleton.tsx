import { StyleSheet } from "react-native";

import { useAnnounceOnMount } from "../hooks/useA11y";
import { useTranslation } from "../i18n";

import SkeletonRow from "./SkeletonRow";
import { ThemedView } from "./ThemedView";

type Props = {
  rows?: number;
  testID?: string;
  style?: any;
  /** i18n key for a more specific loading label e.g. `loading.community` */
  labelKey?: string;
  /** disable auto announce (rare) */
  announce?: boolean;
};

export default function ScreenSkeleton({
  rows = 6,
  testID = "screen-skeleton",
  style,
  labelKey = 'loading.generic',
  announce = true,
}: Props) {
  const { t } = useTranslation();
  const label = t(labelKey, t('loading.generic', 'Loading…'));
  // Announce once when fallback appears (respect disable flag)
  useAnnounceOnMount(announce ? label : undefined as any);
  return (
    <ThemedView
      style={[styles.container, style]}
      testID={testID}
      accessible
      accessibilityLabel={label}
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
