import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Share,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, Stack } from "expo-router";
import { useAppPalette } from "../../../theme/usePalette";
import { useTextScale } from "../../../theme/typography";
import { resources } from "../../../data/resources";
import { useFavorites } from "../../../store/favorites";
import SettingsLink from "../../../components/SettingsLink";

export const options = { href: null };

export default function ResourceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const resource = resources.find((r) => r.id === id);

  const catLabel = React.useMemo(() => {
    switch (resource?.category) {
      case "work_financial":
        return "Work & Financial";
      case "tools_downloads":
        return "Tools & Downloads";
      case "emergency_crisis":
        return "Emergency & Crisis";
      default:
        return null;
    }
  }, [resource]);

  const regionLabel = React.useMemo(() => {
    if (!resource) return null;
    if (resource.scope === "canada") return "Canada";
    if (resource.scope === "province" && resource.province)
      return resource.province;
    return null;
  }, [resource]);

  const { has, toggle } = useFavorites();
  const saved = resource ? has("resource", resource.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: resource?.title ?? "Resource" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
        <Text style={styles.title}>{resource?.title ?? "Resource"}</Text>

        {/* Meta chips */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          {!!catLabel && (
            <View
              style={styles.metaChip}
              accessibilityLabel={`Category ${catLabel}`}
              accessible
            >
              <MaterialCommunityIcons
                name="briefcase-outline"
                size={12}
                color={palette.onPrimary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>{catLabel}</Text>
            </View>
          )}

          {!!regionLabel && (
            <View
              style={styles.metaChip}
              accessibilityLabel={`Region ${regionLabel}`}
              accessible
            >
              <MaterialCommunityIcons
                name={
                  regionLabel === "Canada" ? "flag-variant" : "map-marker-outline"
                }
                size={12}
                color={palette.onPrimary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>{regionLabel}</Text>
            </View>
          )}
        </View>

        <Text style={styles.text}>
          {resource?.description ?? "Details unavailable."}
        </Text>

        {!!resource && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("resource", resource.id)}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from favorites" : "Save to favorites"
            }
          >
            <Text style={styles.buttonText}>
              {saved ? "Remove from Favorites" : "Save to Favorites"}
            </Text>
          </Pressable>
        )}

        {!!resource?.url && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { marginTop: 8 },
              pressed && { opacity: 0.8 },
            ]}
            onPress={() =>
              resource?.url && Linking.openURL(resource.url).catch(() => {})
            }
            accessibilityRole="button"
            accessibilityLabel="Open website"
          >
            <Text style={styles.buttonText}>Open Website</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            { marginTop: 8 },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() =>
            Share.share({
              title: resource?.title ?? "Resource",
              message: resource?.url || resource?.title || "",
            }).catch(() => {})
          }
          accessibilityRole="button"
          accessibilityLabel="Share"
        >
          <Text style={styles.buttonText}>Share</Text>
        </Pressable>
      </View>
    </>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(22 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.95,
      marginBottom: 16,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
    metaChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.primary,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 12,
    },
    metaChipText: { color: palette.onPrimary, fontSize: 12 },
  });
}
