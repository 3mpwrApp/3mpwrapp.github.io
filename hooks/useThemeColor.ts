/* eslint import/no-named-as-default: off */
import type { Scheme } from "./useColorScheme";
import useColorScheme from "./useColorScheme";
type ThemeColors = {
  text: { light: string; dark: string };
  background: { light: string; dark: string };
};
const Colors: ThemeColors = {
  text: { light: "#11181C", dark: "#ECEDEE" },
  background: { light: "#FFFFFF", dark: "#000000" },
};
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof ThemeColors,
) {
  const theme: Scheme = useColorScheme();
  const colorFromProps = props[theme];
  if (colorFromProps) return colorFromProps;
  return Colors[colorName][theme];
}
