import { Text, TextProps } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
};
export function ThemedText({
  style,
  lightColor,
  darkColor,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  // Default to brand body font with platform fallback
  return <Text style={[{ color, fontFamily: "Roboto" }, style]} {...rest} />;
}
