import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import SettingsLink from '../../components/SettingsLink';
import { HIT_SLOP_12, HIT_SLOP_8 } from '../../constants/A11Y';
import type { ResearchSection } from '../../data/research';
import { researchItems } from '../../data/research';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function ResearchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  const item = researchItems.find((r) => r.id === id);
  const scrollRef = useRef<ScrollView | null>(null);
  const [sectionPositions, setSectionPositions] = useState<Record<string, number>>({});
  const [showTop, setShowTop] = useState(false);

  const onScroll = (e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (!showTop && y > 400) setShowTop(true); else if (showTop && y <= 400) setShowTop(false);
  };

  const registerSection = useCallback((id: string, y: number) => {
    setSectionPositions(prev => (prev[id] === y ? prev : { ...prev, [id]: y }));
  }, []);

  const scrollToSection = (sectionId: string) => {
    const y = sectionPositions[sectionId];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
    }
  };

  const renderSection = (section: ResearchSection, depth = 0) => {
    return (
      <View
        key={section.id}
        onLayout={e => registerSection(section.id, e.nativeEvent.layout.y)}
        style={[styles.section, depth > 0 && { paddingLeft: depth * 12 }]}
        accessibilityRole="summary"
      >
        <Text style={[styles.sectionHeading, depth === 0 && styles.sectionHeadingTop]} accessibilityRole="header">
          {section.heading}
        </Text>
        {section.tags && section.tags.length > 0 && (
          <View style={styles.tagRow}>
            {section.tags.map(t => (
              <View key={t} style={styles.tagChip}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}
        {section.paragraphs?.map((p, i) => (
          <Text key={i} style={styles.paragraph}>{p}</Text>
        ))}
        {section.quotes?.map((q, i) => (
          <View key={i} style={styles.quoteBox} accessibilityRole="text">
            <Text style={styles.quoteText}>“{q.text}”</Text>
            {q.attribution && <Text style={styles.quoteAttribution}>— {q.attribution}</Text>}
          </View>
        ))}
        {section.bullets && section.bullets.length > 0 && (
            <View style={styles.list}>
              {section.bullets.map((b, i) => (
                <View key={i} style={styles.listItem} accessibilityRole="text">
                  <Text style={styles.bulletMarker}>•</Text>
                  <Text style={styles.bulletText}>{b}</Text>
                </View>
              ))}
            </View>
        )}
        {section.subsections?.map(ss => renderSection(ss, depth + 1))}
      </View>
    );
  };

  const hasContent = !!item?.content?.length;

  return (
    <>
      <Stack.Screen options={{ title: item?.title ?? "Research" }} />
      <View style={[styles.container]}>
        <ScrollView
          ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            onScroll={onScroll}
            scrollEventThrottle={60}
        >
          <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />
          <Text style={styles.title}>{item?.title ?? "Research"}</Text>
          <Text style={styles.text}>
            {item ? `${item.source} • ${item.year}` : ""}
          </Text>
          <Text style={styles.summary}>
            {item?.summary ?? "Details unavailable."}
          </Text>
          {item?.url ? (
            <A11yPressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.9 },
              ]}
              onPress={() => Linking.openURL(item.url!).catch(() => {})}
              accessibilityRole="button"
              accessibilityLabel="Open research link"
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.buttonText}>Open Link</Text>
            </A11yPressable>
          ) : null}
          {item?.url ? (
            <A11yPressable
              style={({ pressed }) => [
                styles.button,
                { marginTop: 8 },
                pressed && { opacity: 0.9 },
              ]}
              onPress={() =>
                Share.share({ title: item.title, message: item.url }).catch(
                  () => {},
                )
              }
              accessibilityRole="button"
              accessibilityLabel="Share"
              hitSlop={HIT_SLOP_8}
            >
              <Text style={styles.buttonText}>Share</Text>
            </A11yPressable>
          ) : null}
          {hasContent && (
            <View style={styles.toc} accessibilityRole="menu">
              <Text style={styles.tocHeading} accessibilityRole="header">Contents</Text>
              {item!.content!.map(section => (
                <Pressable
                  key={section.id}
                  accessibilityRole="menuitem"
                  accessibilityLabel={`Jump to ${section.heading}`}
                  onPress={() => scrollToSection(section.id)}
                  hitSlop={HIT_SLOP_12}
                  style={({ pressed }) => [styles.tocItem, pressed && { opacity: 0.5 }]}
                >
                  <Text style={styles.tocText}>{section.heading}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {hasContent && item!.content!.map(section => renderSection(section))}
          {item?.references && item.references.length > 0 && (
            <View style={styles.references}>
              <Text style={styles.referencesHeading} accessibilityRole="header">References</Text>
              {item.references.map(ref => (
                <View key={ref.id} style={styles.referenceItem}>
                  <Text style={styles.referenceText}>• {ref.citation}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        {showTop && (
          <Pressable
            onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
            accessibilityRole="button"
            accessibilityLabel="Back to top"
            accessibilityHint="Scrolls to the top of the page"
            hitSlop={HIT_SLOP_12}
            style={styles.backToTop}
          >
            <Text style={styles.backToTopText}>Top</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

function createStyles(
  palette: ReturnType<typeof useAppPalette>,
  factor: number,
) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    scroll: { flex: 1 },
    scrollContent: { padding: 20, paddingBottom: 120 },
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
      marginBottom: 8,
    },
    summary: { fontSize: Math.round(16 * factor), color: palette.text, marginBottom: 20, lineHeight: 22 },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16 },
  toc: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginBottom: 28 },
    tocHeading: { fontWeight: '600', fontSize: 16, marginBottom: 6, color: palette.text },
    tocItem: { paddingVertical: 6 },
    tocText: { color: palette.text, fontSize: 14 },
    section: { marginBottom: 28 },
    sectionHeading: { fontSize: Math.round(18 * factor), fontWeight: '600', color: palette.text, marginBottom: 8 },
    sectionHeadingTop: { marginTop: 8 },
    paragraph: { fontSize: Math.round(15 * factor), lineHeight: 22, color: palette.text, marginBottom: 10 },
    quoteBox: { borderLeftWidth: 4, borderLeftColor: palette.primary, paddingLeft: 12, marginVertical: 12 },
    quoteText: { fontStyle: 'italic', color: palette.text, marginBottom: 4 },
    quoteAttribution: { fontSize: 12, color: palette.textSecondary },
    list: { marginVertical: 8 },
    listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    bulletMarker: { width: 18, color: palette.text },
    bulletText: { flex: 1, color: palette.text, fontSize: Math.round(15 * factor), lineHeight: 20 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tagChip: { backgroundColor: palette.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginRight: 6, marginBottom: 6 },
    tagText: { fontSize: 12, color: palette.text },
  references: { marginTop: 8, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.muted },
    referencesHeading: { fontSize: Math.round(18 * factor), fontWeight: '600', marginBottom: 12, color: palette.text },
    referenceItem: { marginBottom: 6 },
    referenceText: { fontSize: 12, lineHeight: 16, color: palette.text },
  backToTop: { position: 'absolute', right: 16, bottom: 24, backgroundColor: palette.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, elevation: 3, boxShadow: '0 4px 8px rgba(0,0,0,0.25)' },
    backToTopText: { color: palette.onPrimary, fontWeight: '600' },
  });
}
