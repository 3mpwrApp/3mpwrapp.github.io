import React from "react";
import type { GestureResponderEvent } from "react-native";
import { Pressable } from "react-native";

import { HIT_SLOP_12 } from "../constants/A11Y";

type Props = React.ComponentProps<typeof Pressable>;

export default function HapticTab(props: Props) {
  return (
    <Pressable
      {...props}
      hitSlop={HIT_SLOP_12}
      onPressIn={(ev: GestureResponderEvent) => {
        // Haptic feedback could go here if you use expo-haptics
        if (props.onPress) props.onPress(ev);
      }}
    />
  );
}
