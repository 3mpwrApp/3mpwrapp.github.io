import React from "react";
import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { useAppPalette } from "../theme/usePalette";
import { logger } from '../utils/logger';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function ExternalLink({ href, children }: ExternalLinkProps) {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(href);
    if (supported) {
      await Linking.openURL(href);
    } else {
      logger.warn(`Don't know how to open URI: ${href}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`Open external link: ${href}`}
      style={({ pressed }) => [styles.link, pressed && styles.linkPressed]}
    >
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    link: {
      paddingVertical: 4,
    },
    linkPressed: {
      opacity: 0.6,
    },
    linkText: {
      color: palette.primary,
      fontWeight: "500",
      textDecorationLine: "underline",
    },
  });
}

