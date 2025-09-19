import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  SectionList, 
  TextInput, 
  Pressable,
  FlatList,
} from "react-native";
import { useAppPalette } from "../../theme/usePalette";
import { useTextScale } from "../../theme/typography";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../hooks/useA11y";
import { useFavorites } from "../../store/favorites";
import { fetchPodcasts } from "../../services/podcasts";
import { fetchResources } from "../../services/resources";
import { fetchCampaigns } from "../../services/campaigns";
import { Link } from "expo-router";
import Card from "../../components/Card";
import type { Podcast } from "../../data/podcasts";
import type { Resource, Campaign } from "../../types/models";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import SettingsLink from "../../components/SettingsLink";
import ContrastToggle from "../../components/ContrastToggle";
import { useTranslation } from "../../i18n";

type SectionItem =
  | (Podcast & { kind: "podcast" })
  | (Resource & { kind: "resource" })
  | (Campaign & { kind: "campaign" });

type FilterType = "all" | "podcast" | "resource" | "campaign";
type SortType = "date" | "title" | "type";

export default function SavedScreen() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  
  useAnnounceOnMount(t("nav.saved", "Saved"));
  useFocusOnRefOnMount(titleRef);

  const { state } = useFavorites();
  const [pods, setPods] = React.useState<Podcast[]>([]);
  const [res, setRes] = React.useState<Resource[]>([]);
  const [camps, setCamps] = React.useState<Campaign[]>([]);
  
  // Enhanced filtering and search
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<FilterType>("all");
  const [sortBy, setSortBy] = React.useState<SortType>("date");
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list");

  React.useEffect(() => {
    (async () => {
      try {
        const [p, r, c] = await Promise.all([
          fetchPodcasts(),
          fetchResources(),
          fetchCampaigns(),
        ]);
        setPods(p);
        setRes(r);
        setCamps(c);
      } catch {}
    })();
  }, []);

  const allItems: SectionItem[] = React.useMemo(() => {
    const savedPods = pods
      .filter((p) => state.podcast.has(p.id))
      .map((p) => ({ ...p, kind: "podcast" as const }));
    
    const savedRes = res
      .filter((r) => state.resource.has(r.id))
      .map((r) => ({ ...r, kind: "resource" as const }));
    
    const savedCamps = camps
      .filter((c) => state.campaign.has(c.id))
      .map((c) => ({ ...c, kind: "campaign" as const }));
    
    return [...savedPods, ...savedRes, ...savedCamps];
  }, [pods, res, camps, state]);

  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = allItems;

    // Apply filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(item => item.kind === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.kind === "campaign" && "summary" in item && item.summary?.toLowerCase().includes(query))
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "type":
          return a.kind.localeCompare(b.kind);
        case "date":
        default:
          // Sort by date saved (most recent first) - using item order as proxy
          return 0; // Keep original order for now
      }
    });

    return filtered;
  }, [allItems, activeFilter, searchQuery, sortBy]);

  const sections = React.useMemo(() => {
    if (activeFilter === "all") {
      const groupedByType: Record<string, SectionItem[]> = {};
      filteredAndSortedItems.forEach(item => {
        const type = item.kind;
        if (!groupedByType[type]) groupedByType[type] = [];
        groupedByType[type].push(item);
      });

      return Object.entries(groupedByType).map(([type, items]) => ({
        title: type === "podcast" ? "Podcasts" : 
               type === "resource" ? "Resources" : "Campaigns",
        data: items,
      }));
    } else {
      return [{ title: "", data: filteredAndSortedItems }];
    }
  }, [filteredAndSortedItems, activeFilter]);

  const FilterButton = ({ filter, label, icon }: { 
    filter: FilterType; 
    label: string; 
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <Pressable
      style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]}
      onPress={() => setActiveFilter(filter)}
      accessibilityRole="button"
      accessibilityState={{ selected: activeFilter === filter }}
      accessibilityLabel={`Filter by ${label}`}
    >
      <Ionicons 
        name={icon} 
        size={16} 
        color={activeFilter === filter ? "white" : palette.text} 
      />
      <Text style={[
        styles.filterButtonText,
        activeFilter === filter && styles.filterButtonTextActive
      ]}>
        {label}
      </Text>
    </Pressable>
  );

  const renderItem = ({ item }: { item: SectionItem }) => {
    if (item.kind === "podcast") {
      const yt = String(item.id).startsWith("yt:");
      return (
        <Link
          href={{
            pathname: "/(tabs)/podcasts/[id]",
            params: {
              id: item.id,
              title: item.title,
              description: item.description,
              duration: item.duration,
            },
          } as any}
          asChild
        >
          <Card
            title={item.title}
            subtitle={`${item.description} - ${item.duration}`}
            rightIcon={yt ? "logo-youtube" : "chevron-forward"}
            left={
              item.thumbnailUrl ? (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 4,
                    overflow: "hidden",
                    backgroundColor: palette.muted,
                  }}
                />
              ) : undefined
            }
          />
        </Link>
      );
    }
    if (item.kind === "campaign") {
      return (
        <Link
          href={{
            pathname: "/(tabs)/campaigns/[id]",
            params: { id: item.id },
          } as any}
          asChild
        >
          <Card
            title={item.title}
            subtitle={item.summary}
            rightIcon="megaphone-outline"
          />
        </Link>
      );
    }
    return (
      <Link
        href={{
          pathname: "/(tabs)/resources/[id]",
          params: { id: item.id },
        } as any}
        asChild
      >
        <Card title={item.title} subtitle={item.description} />
      </Link>
    );
  };

  return (
    <View style={styles.container} accessibilityLabel="Saved items screen" accessible>
      <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
      <ContrastToggle style={{ position: "absolute", right: 56, top: 20 }} />
      
      <Text
        ref={titleRef}
        nativeID="saved-title"
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("nav.saved", "Saved")}
      </Text>

      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        Organize and access your bookmarked content
      </Text>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={palette.text} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search saved items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel="Search saved items"
          accessibilityHint="Search through your saved podcasts, resources, and campaigns"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Ionicons name="close-circle" size={20} color={palette.text} />
          </Pressable>
        )}
      </View>

      {/* Filter and Sort Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.filtersContainer}>
          <FilterButton filter="all" label="All" icon="apps" />
          <FilterButton filter="podcast" label="Podcasts" icon="mic" />
          <FilterButton filter="resource" label="Resources" icon="document-text" />
          <FilterButton filter="campaign" label="Campaigns" icon="megaphone" />
        </View>

        <View style={styles.viewControls}>
          <Pressable
            style={[styles.viewButton, viewMode === "list" && styles.viewButtonActive]}
            onPress={() => setViewMode("list")}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === "list" }}
            accessibilityLabel="List view"
          >
            <Ionicons name="list" size={20} color={viewMode === "list" ? "white" : palette.text} />
          </Pressable>
          <Pressable
            style={[styles.viewButton, viewMode === "grid" && styles.viewButtonActive]}
            onPress={() => setViewMode("grid")}
            accessibilityRole="button"
            accessibilityState={{ selected: viewMode === "grid" }}
            accessibilityLabel="Grid view"
          >
            <Ionicons name="grid" size={20} color={viewMode === "grid" ? "white" : palette.text} />
          </Pressable>
        </View>
      </View>

      {/* Results Count */}
      {searchQuery.trim() && (
        <Text style={styles.resultsCount} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          {filteredAndSortedItems.length} result{filteredAndSortedItems.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Content */}
      {filteredAndSortedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color={palette.text} style={styles.emptyIcon} />
          <Text style={styles.emptyTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {searchQuery.trim() ? "No results found" : "No saved items yet"}
          </Text>
          <Text style={styles.emptyDescription} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {searchQuery.trim() 
              ? "Try adjusting your search or filter criteria"
              : "Start saving podcasts, resources, and campaigns to access them here"
            }
          </Text>
        </View>
      ) : viewMode === "grid" ? (
        <FlatList
          data={filteredAndSortedItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => 
            section.title ? (
              <View style={styles.sectionHeaderRow}>
                <MaterialCommunityIcons
                  name={
                    section.title === "Podcasts" ? "microphone" : 
                    section.title === "Resources" ? "book-outline" : "megaphone"
                  }
                  size={18}
                  color={palette.text}
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.sectionHeader}>{section.title}</Text>
                <Text style={styles.sectionCount}>({section.data.length})</Text>
              </View>
            ) : null
          }
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

type Palette = ReturnType<typeof useAppPalette>;
function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 20, 
      backgroundColor: palette.background 
    },
    title: {
      fontSize: Math.round(24 * factor),
      fontWeight: "700",
      marginBottom: 4,
      color: palette.text,
    },
    subtitle: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.8,
      marginBottom: 16,
      lineHeight: Math.round(22 * factor),
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.muted,
      marginBottom: 16,
      paddingHorizontal: 12,
      minHeight: 44,
    },
    searchIcon: {
      marginRight: 8,
      opacity: 0.6,
    },
    searchInput: {
      flex: 1,
      fontSize: Math.round(16 * factor),
      color: palette.text,
      paddingVertical: 12,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    controlsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    filtersContainer: {
      flexDirection: "row",
      flex: 1,
      marginRight: 16,
    },
    filterButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: 8,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      minHeight: 32,
    },
    filterButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterButtonText: {
      fontSize: Math.round(12 * factor),
      color: palette.text,
      marginLeft: 4,
      fontWeight: "500",
    },
    filterButtonTextActive: {
      color: "white",
    },
    viewControls: {
      flexDirection: "row",
    },
    viewButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: palette.card,
      borderWidth: 1,
      borderColor: palette.muted,
      marginLeft: 4,
      minWidth: 36,
      minHeight: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    viewButtonActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    resultsCount: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.7,
      marginBottom: 12,
      fontStyle: "italic",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    emptyIcon: {
      opacity: 0.3,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: Math.round(18 * factor),
      fontWeight: "600",
      color: palette.text,
      marginBottom: 8,
      textAlign: "center",
    },
    emptyDescription: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.7,
      textAlign: "center",
      lineHeight: Math.round(20 * factor),
      maxWidth: 280,
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
      marginBottom: 6,
    },
    sectionHeader: { 
      fontWeight: "700", 
      color: palette.text,
      fontSize: Math.round(16 * factor),
      marginRight: 8,
    },
    sectionCount: {
      fontSize: Math.round(14 * factor),
      color: palette.text,
      opacity: 0.6,
    },
    gridRow: {
      justifyContent: "space-between",
    },
  });
}