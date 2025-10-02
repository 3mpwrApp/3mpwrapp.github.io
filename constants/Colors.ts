const Colors = {
  light: {
    text: "#11181C",
    background: "#FFFFFF",
    // Adjusted for WCAG AAA against white background
    tint: "#004A99",
    tabIconDefault: "#5A6268",
    // Adjusted from #007AFF to a deeper shade to reach >=7:1 on white
    tabIconSelected: "#003E80",
  },
  dark: {
    text: "#ECEDEE",
    background: "#000000",
    // For AAA on black, slightly increase luminance while keeping contrast high
    tint: "#4DA3FF",
    tabIconDefault: "#B0B6BB",
    tabIconSelected: "#4DA3FF",
  },
} as const;
export default Colors;
