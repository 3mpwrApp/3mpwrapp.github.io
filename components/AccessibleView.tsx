import { View, ViewProps, AccessibilityProps } from "react-native";

type AccessibleViewProps = ViewProps &
  AccessibilityProps & {
    accessibilityLabel?: string;
    accessibilityRole?: "button" | "header" | "link" | "image" | "text";
  };

export default function AccessibleView(props: AccessibleViewProps) {
  return <View {...props} />;
}
