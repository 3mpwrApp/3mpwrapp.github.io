import React from "react";
import { ScrollView, View, Text, StyleSheet, useColorScheme, RefreshControl } from "react-native";
import { colors, type Palette } from "../../theme/colors";
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../hooks/useA11y";
import { Link } from "expo-router";
import Card from "../../components/Card";
import { campaigns } from "../../data/campaigns";
import { resources } from "../../data/resources";
import { podcasts } from "../../data/podcasts";
import { useRefresh } from "../../store/refresh";
export default function HomeScreen() {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? colors.dark : colors.light;
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Home");
  useFocusOnRefOnMount(titleRef);
  const { refreshAll, tick } = useRefresh();
  const [refreshing, setRefreshing] = React.useState(false);
  React.useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (refreshing) {
      t = setTimeout(() => setRefreshing(false), 600);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [tick, refreshing]);

  return (
    <ScrollView style={styles.container} accessibilityLabel="Home screen" accessible refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); refreshAll(); }} />}>
      <Text ref={titleRef} nativeID="home-title" accessibilityRole="header" style={styles.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Welcome to Empowr
      </Text>
      <Text style={styles.subtitle}>
        Explore campaigns, resources, wellness tools, advocates, and community voices.
      </Text>
      <View style={{ height: 12 }} />
      <Text style={styles.section}>Explore</Text>
      <Link href="/(tabs)/campaigns" asChild accessibilityRole="link" accessibilityLabel="Go to Campaigns">
        <Card title="Campaigns" subtitle="Support initiatives and get involved" />
      </Link>
      <Link href="/(tabs)/resources" asChild accessibilityRole="link" accessibilityLabel="Go to Resources">
        <Card title="Resources" subtitle="Guides and helpful materials" />
      </Link>
      <Link href="/(tabs)/wellness" asChild accessibilityRole="link" accessibilityLabel="Go to Wellness">
        <Card title="Wellness" subtitle="Daily tips and tools" />
      </Link>
      <Link href="/(tabs)/podcasts" asChild accessibilityRole="link" accessibilityLabel="Go to Podcasts">
        <Card title="Podcasts" subtitle="Listen to Empowr voices" />
      </Link>

      <View style={{ height: 16 }} />
      <Text style={styles.section}>Featured</Text>
      <Link href={{ pathname: "/(tabs)/campaigns/[id]", params: { id: campaigns[0].id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${campaigns[0].title}`}>
        <Card title={campaigns[0].title} subtitle={campaigns[0].summary} />
      </Link>
      <Link href={{ pathname: "/(tabs)/resources/[id]", params: { id: resources[0].id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${resources[0].title}`}>
        <Card title={resources[0].title} subtitle={resources[0].description} />
      </Link>
      <Link href={{ pathname: "/(tabs)/podcasts/[id]", params: { id: podcasts[0].id } }} asChild accessibilityRole="link" accessibilityLabel={`Open ${podcasts[0].title}`}>
        <Card title={podcasts[0].title} subtitle={`${podcasts[0].description} • ${podcasts[0].duration}`} />
      </Link>
    </ScrollView>
  );
}
function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 24, fontWeight: "700", marginBottom: 8, color: palette.text },
    subtitle: { fontSize: 16, color: palette.muted },
    section: { fontSize: 14, color: palette.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.6 },
  });
}
