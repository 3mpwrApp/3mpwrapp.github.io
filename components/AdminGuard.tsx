import React from "react";
import { View, Text } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useAppPalette } from "../theme/usePalette";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin } = useAuth();
  const palette = useAppPalette();
  if (!isAdmin) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: palette.text, fontWeight: "700", marginBottom: 6 }}>
          Admin Only
        </Text>
        <Text style={{ color: palette.text }}>
          You must be an admin to access this area.
        </Text>
      </View>
    );
  }
  return <>{children}</>;
}

