import { View, Text, StyleSheet, useColorScheme, Pressable, Share } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { colors, type Palette } from "../../../theme/colors";
import { campaigns } from "../../../data/campaigns";
import { useFavorites } from "../../../store/favorites";
import { useCampaignsLocal, CampaignsLocalProvider } from "../../../store/campaignsLocal";
import { logEvent } from "../../../services/analytics";

function CampaignDetailInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);

  const campaign = campaigns.find((c) => c.id === id);
  const { has, toggle } = useFavorites();
  const saved = campaign ? has("campaign", campaign.id) : false;
  const { isJoined, join, leave } = useCampaignsLocal();
  const joined = campaign ? isJoined(campaign.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: campaign?.title ?? "Campaign" }} />
      <View style={styles.container}>
        <Text style={styles.title}>{campaign?.title ?? "Campaign"}</Text>
        <Text style={styles.text}>{campaign?.summary ?? "Details unavailable."}</Text>
        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => toggle("campaign", campaign.id)}
            accessibilityRole="button"
            accessibilityLabel={saved ? "Remove from favorites" : "Save to favorites"}
          >
            <Text style={styles.buttonText}>{saved ? "Remove from Favorites" : "Save to Favorites"}</Text>
          </Pressable>
        )}
        {!!campaign && (
          <View style={{ height: 8 }} />
        )}
        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.8 }]}
            onPress={() => {
              if (joined) { leave(campaign.id); logEvent("campaign_leave", { id: campaign.id }); }
              else { join(campaign.id); logEvent("campaign_join", { id: campaign.id }); }
            }}
            accessibilityRole="button"
            accessibilityLabel={joined ? "Leave campaign" : "Join campaign"}
          >
            <Text style={styles.secondaryText}>{joined ? "Leave Campaign" : "Join Campaign"}</Text>
          </Pressable>
        )}
        {!!campaign && (
          <View style={{ height: 8 }} />
        )}
        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
            onPress={async () => {
              try {
                const msg = `${campaign.title} — ${campaign.summary}`;
                await Share.share({ title: campaign.title, message: msg, url: `https://empowr.app/campaigns/${campaign.id}` });
                logEvent("campaign_share", { id: campaign.id });
              } catch {}
            }}
            accessibilityRole="button"
            accessibilityLabel="Share campaign"
          >
            <Text style={styles.linkText}>Share</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

export default function CampaignDetail() {
  const scheme = useColorScheme();
  // reuse theme but just wrap in provider
  return (
    <>
      <CampaignsLocalProvider>
        <CampaignDetailInner />
      </CampaignsLocalProvider>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", marginBottom: 8, color: palette.text },
    text: { fontSize: 16, color: palette.muted, marginBottom: 16 },
    button: { backgroundColor: palette.primary, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44, minWidth: 44 },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
    secondary: { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, minHeight: 44 },
    secondaryText: { color: palette.text, fontSize: 16, fontWeight: "700" },
    ghost: { backgroundColor: "transparent", paddingVertical: 8, paddingHorizontal: 12 },
    linkText: { color: palette.primary, fontWeight: "700", fontSize: 16 },
  });
}
