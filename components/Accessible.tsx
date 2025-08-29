import { View, ViewProps } from "react-native";

interface AccessibleProps extends ViewProps {
  accessibilityLabel?: string;
  accessibilityRole?: "button" | "header" | "link" | "image" | "text";
}

export default function Accessible(props: AccessibleProps) {
  return <View {...props} />;
}
