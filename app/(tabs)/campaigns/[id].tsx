import { Stack, router, useLocalSearchParams } from "expo-router";
import {
    Pressable,
    Share,
    StyleSheet,
    Text,
    View,
    useColorScheme,
} from "react-native";

import SettingsLink from "../../../components/SettingsLink";
import { campaigns } from "../../../data/campaigns";
import { logEvent } from "../../../services/analytics";
import { fsJoinCampaign, fsLeaveCampaign } from "../../../services/firestore";
import {
    CampaignsLocalProvider,
    useCampaignsLocal,
} from "../../../store/campaignsLocal";
import { useFavorites } from "../../../store/favorites";
import { colors, type Palette } from "../../../theme/colors";
import { useTextScale } from "../../../theme/typography";

function CampaignDetailInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const campaign = campaigns.find((c) => c.id === id);
  const { has, toggle } = useFavorites();
  const saved = campaign ? has("campaign", campaign.id) : false;
  const { isJoined, join, leave } = useCampaignsLocal();
  const joined = campaign ? isJoined(campaign.id) : false;

  return (
    <>
      <Stack.Screen options={{ title: campaign?.title ?? "Campaign" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />

        <Text style={styles.title}>{campaign?.title ?? "Campaign"}</Text>
        <Text style={styles.text}>
          {campaign?.summary ?? "Details unavailable."}
        </Text>

        {!!campaign && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => toggle("campaign", campaign.id)}
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from favorites" : "Save to favorites"
            }
            focusable
          >
            <Text style={styles.buttonText}>
              {saved ? "Remove from Favorites" : "Save to Favorites"}
            </Text>
          </Pressable>
        )}

        {!!campaign && <View style={{ height: 8 }} />}

        {!!campaign && (
          <Pressable
            style={({ pressed }) => [
              styles.secondary,
              pressed && { opacity: 0.8 },
            ]}
            onPress={async () => {
              if (joined) {
                // optimistic leave
                leave(campaign.id);
                const ok = await fsLeaveCampaign(campaign.id, 'self');
                if (!ok) {
                  join(campaign.id); // rollback
                } else {
                  logEvent("campaign_leave", { id: campaign.id });
                }
              } else {
                join(campaign.id);
                const ok = await fsJoinCampaign(campaign.id, 'self');
                if (!ok) {
                  leave(campaign.id);
                } else {
                  logEvent("campaign_join", { id: campaign.id });
                }
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={joined ? "Leave campaign" : "Join campaign"}
            focusable
          >
            <Text style={styles.secondaryText}>
              {joined ? "Leave Campaign" : "Join Campaign"}
            </Text>
          </Pressable>
        )}

        {!!campaign && <View style={{ height: 8 }} />}

        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
            onPress={() => {
              // open campaign room
              router.push(`/(tabs)/campaigns/room/${campaign.id}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open campaign room"
            focusable
          >
            <Text style={styles.linkText}>Open Campaign Room</Text>
          </Pressable>
        )}

        {!!campaign && (
          <Pressable
            style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
            onPress={async () => {
              try {
                const deepLink = `https://empowr.app/campaigns/${campaign.id}`;
                const message = `${campaign.title} - ${campaign.summary}\nJoin: ${deepLink}`;
                await Share.share({ title: campaign.title, message, url: deepLink });
                logEvent("campaign_share", { id: campaign.id });
              } catch {}
            }}
            accessibilityRole="button"
            accessibilityLabel="Share campaign"
            focusable
          >
            <Text style={styles.linkText}>Share</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

export const options = { href: null };

export default function CampaignDetail() {
  return (
    <CampaignsLocalProvider>
      <CampaignDetailInner />
    </CampaignsLocalProvider>
  );
}

function createStyles(palette: Palette, factor: number) {
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
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
    },
    secondaryText: { color: palette.text, fontSize: 16, fontWeight: "700" },
    ghost: {
      backgroundColor: "transparent",
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    linkText: { color: palette.primary, fontWeight: "700", fontSize: 16 },
  });
}
