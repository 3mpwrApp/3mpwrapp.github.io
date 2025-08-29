import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { GestureResponderEvent } from "react-native";

export default function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        // Haptic feedback could go here if you use expo-haptics
        if (props.onPress) {
          props.onPress(ev);
        }
      }}
    />
  );
}
