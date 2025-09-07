import { Pressable, ViewStyle } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppPalette } from "../theme/usePalette";

export default function SettingsLink({ style }: { style?: ViewStyle }) {
  const palette = useAppPalette();
  return (
    <Link href={"/(tabs)/settings" as any} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel="Open settings"
        style={({ pressed }) => [style, pressed && { opacity: 0.8 }]}
      >
        <Ionicons name="settings-outline" size={20} color={palette.text} />
      </Pressable>
    </Link>
  );
}
