import React from "react";
import { View, Text, StyleSheet, useColorScheme, ScrollView } from "react-native";
import { colors } from "../../theme/colors";
import { useFavorites } from "../../store/favorites";
import { campaigns } from "../../data/campaigns";
import { resources } from "../../data/resources";
import { advocates } from "../../data/advocates";
import { podcasts } from "../../data/podcasts";
import Card from "../../components/Card";
import { useRouter } from "expo-router";

export default function FavoritesScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const { has, toggle } = useFavorites();
  const router = useRouter();

  const favCampaigns = React.useMemo(() => campaigns.filter((c) => has("campaign", c.id)), [has]);
  const favResources = React.useMemo(() => resources.filter((r) => has("resource", r.id)), [has]);
  const favAdvocates = React.useMemo(() => advocates.filter((a) => has("advocate", a.id)), [has]);
  const favPodcasts = React.useMemo(() => podcasts.filter((p) => has("podcast", p.id)), [has]);

  const isEmpty = !favCampaigns.length && !favResources.length && !favAdvocates.length && !favPodcasts.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} accessibilityLabel="Favorites screen" accessible>
      <Text accessibilityRole="header" style={styles.title}>Favorites</Text>
      {isEmpty && <Text style={styles.empty}>You haven't saved any items yet.</Text>}

      {!!favCampaigns.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campaigns</Text>
          {favCampaigns.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.summary}
              onPress={() => router.push({ pathname: "/(tabs)/campaigns/[id]", params: { id: item.id } })}
              rightIcon="trash-outline"
              onPressRight={() => toggle("campaign", item.id)}
              rightA11yLabel={`Remove ${item.title} from favorites`}
            />
          ))}
        </View>
      )}

      {!!favResources.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {favResources.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={item.description}
              onPress={() => router.push({ pathname: "/(tabs)/resources/[id]", params: { id: item.id } })}
              rightIcon="trash-outline"
              onPressRight={() => toggle("resource", item.id)}
              rightA11yLabel={`Remove ${item.title} from favorites`}
            />
          ))}
        </View>
      )}

      {!!favAdvocates.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advocates</Text>
          {favAdvocates.map((item) => (
            <Card
              key={item.id}
              title={item.name}
              subtitle={item.bio}
              onPress={() => router.push({ pathname: "/(tabs)/advocates/[id]", params: { id: item.id } })}
              rightIcon="trash-outline"
              onPressRight={() => toggle("advocate", item.id)}
              rightA11yLabel={`Remove ${item.name} from favorites`}
            />
          ))}
        </View>
      )}

      {!!favPodcasts.length && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Podcasts</Text>
          {favPodcasts.map((item) => (
            <Card
              key={item.id}
              title={item.title}
              subtitle={`${item.description} • ${item.duration}`}
              onPress={() => router.push({ pathname: "/(tabs)/podcasts/[id]", params: { id: item.id } })}
              rightIcon="trash-outline"
              onPressRight={() => toggle("podcast", item.id)}
              rightA11yLabel={`Remove ${item.title} from favorites`}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function createStyles(palette: typeof colors.light) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    content: { padding: 20 },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    empty: { color: palette.muted, marginBottom: 8 },
    section: { marginTop: 12 },
    sectionTitle: { color: palette.muted, fontSize: 14, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6 },
  });
}

