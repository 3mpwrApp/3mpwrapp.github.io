import { Pressable, PressableProps, Insets } from "react-native";

type Props = PressableProps & { role?: "button" | "link" | "menu" };

const DEFAULT_HITSLOP: Insets = { top: 10, bottom: 10, left: 10, right: 10 };

export default function A11yPressable({ role = "button", hitSlop, ...rest }: Props) {
  return <Pressable accessibilityRole={role} hitSlop={hitSlop ?? DEFAULT_HITSLOP} {...rest} />;
}
