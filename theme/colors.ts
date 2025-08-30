export const colors = {
  // Brand palette
  // Deep Teal (#00796B), Cyan (#00BFA5), Coral (#FF7043),
  // Charcoal (#212121), Soft Gray (#F5F5F5)
  light: {
    primary: "#00796B", // Deep Teal
    background: "#F5F5F5", // Soft Gray
    text: "#212121", // Charcoal
    // Muted text with stronger contrast for WCAG AA on Soft Gray
    muted: "#424242",
    onPrimary: "#FFFFFF",
    surface: "#FFFFFF",
  },
  dark: {
    primary: "#00BFA5", // Cyan for better pop on dark
    background: "#212121", // Charcoal
    text: "#F5F5F5", // Soft Gray
    // Higher-contrast muted on dark backgrounds
    muted: "#E0E0E0",
    onPrimary: "#000000",
    surface: "#1A1A1A",
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
