const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    tint: "#007AFF",
    tabIconDefault: "#687076",
  // Adjusted from #007AFF to #0056B3 for WCAG AA contrast (>4.5:1) against white
  tabIconSelected: "#0056B3",
  },
  dark: {
    text: "#ECEDEE",
    background: "#000000",
    tint: "#0A84FF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#0A84FF",
  },
} as const;
export default Colors;
