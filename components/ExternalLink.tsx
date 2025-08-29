import React from "react";
import { Linking, Pressable, Text, StyleSheet } from "react-native";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
}

export default function ExternalLink({ href, children }: ExternalLinkProps) {
  const handlePress = async () => {
    const supported = await Linking.canOpenURL(href);
    if (supported) {
      await Linking.openURL(href);
    } else {
      console.warn(`Don't know how to open URI: ${href}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`Open external link: ${href}`}
      style={({ pressed }) => [
        styles.link,
        pressed && styles.linkPressed
      ]}
    >
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    paddingVertical: 4,
  },
  linkPressed: {
    opacity: 0.6,
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
