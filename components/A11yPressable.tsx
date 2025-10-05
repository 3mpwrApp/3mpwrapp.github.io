import type { Insets, PressableProps } from "react-native";
import { Pressable } from "react-native";

// Back-compat: allow passing a simplified `role` while also supporting raw `accessibilityRole`.
type Props = PressableProps & { role?: PressableProps["accessibilityRole"]; accessibilityRole?: PressableProps["accessibilityRole"] };

const DEFAULT_HITSLOP: Insets = { top: 10, bottom: 10, left: 10, right: 10 };

export default function A11yPressable({ role, accessibilityRole, hitSlop, ...rest }: Props) {
  const resolvedRole = accessibilityRole ?? role ?? "button";
  return <Pressable accessibilityRole={resolvedRole} hitSlop={hitSlop ?? DEFAULT_HITSLOP} {...rest} />;
}
