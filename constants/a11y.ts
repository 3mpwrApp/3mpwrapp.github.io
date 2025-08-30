import { StyleSheet } from "react-native";

export const HIT_SLOP_8 = { top: 8, bottom: 8, left: 8, right: 8 } as const;

export const touchTarget = StyleSheet.create({
  min: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
});

