export const colors = {
  // Brand palette
  // Deep Teal (#00796B), Cyan (#00BFA5), Coral (#FF7043),
  // Charcoal (#212121), Soft Gray (#F5F5F5)
  light: {
    primary: "#00695C", // Slightly darker for better contrast
    background: "#FFFFFF", // Pure white for max contrast
    text: "#111111", // Near-black for high readability
    // Muted with strong contrast against white
    muted: "#333333",
    onPrimary: "#FFFFFF",
    surface: "#FFFFFF",
  },
  dark: {
    primary: "#00E5CF", // Brighter accent for dark
    background: "#000000", // Pure black
    text: "#FFFFFF", // White text
    // High-contrast muted on black
    muted: "#CCCCCC",
    onPrimary: "#000000",
    surface: "#0A0A0A",
  },
} as const;

export type Palette = {
  primary: string;
  background: string;
  text: string;
  muted: string;
  onPrimary: string;
  surface: string;
};
