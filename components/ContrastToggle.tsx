import { Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../store/settings";
import { useAppPalette } from "../theme/usePalette";

export default function ContrastToggle({ style }: { style?: ViewStyle }) {
  const { highContrast, setHighContrast } = useSettings();
  const palette = useAppPalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={highContrast ? "Disable high contrast" : "Enable high contrast"}
      onPress={() => setHighContrast(!highContrast)}
      style={({ pressed }) => [style, pressed && { opacity: 0.8 }]}
    >
      <Ionicons name="contrast-outline" size={20} color={palette.text} />
    </Pressable>
  );
}
