export const colors = {
  // Brand palette
  // Deep Teal (#00796B), Cyan (#00BFA5), Coral (#FF7043),
  // Charcoal (#212121), Soft Gray (#F5F5F5)
  light: {
    primary: "#005F54", // Slightly deeper for contrast
    background: "#FFFFFF", // Pure white for max contrast
    text: "#0D0D0D", // Slightly darker
    // Muted with stronger contrast against white
    muted: "#2A2A2A",
    onPrimary: "#FFFFFF",
    surface: "#FFFFFF",
  },
  dark: {
    primary: "#12E8D6", // Slightly brighter accent
    background: "#000000", // Pure black
    text: "#FFFFFF", // White text
    // High-contrast muted on black (slightly lighter)
    muted: "#D6D6D6",
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
