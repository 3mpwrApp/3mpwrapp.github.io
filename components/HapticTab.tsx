import React from "react";
import { Pressable, GestureResponderEvent } from "react-native";

type Props = React.ComponentProps<typeof Pressable>;

export default function HapticTab(props: Props) {
  return (
    <Pressable
      {...props}
      onPressIn={(ev: GestureResponderEvent) => {
        // Haptic feedback could go here if you use expo-haptics
        if (props.onPress) props.onPress(ev);
      }}
    />
  );
}
