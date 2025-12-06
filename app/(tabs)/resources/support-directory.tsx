import React from "react";
import {
    FlatList,
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import DisclaimerBanner from "../../../components/DisclaimerBanner";
import { supportOrgs } from "../../../data/support";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useSettings } from "../../../store/settings";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

export default function SupportDirectory() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  useAnnounceOnMount(t('advocacy.support.title','Support Directory'));
  useFocusOnRefOnMount(titleRef);
  const { province } = useSettings();
  
  // Local filter state (overrides global province setting)
  const [selectedProvince, setSelectedProvince] = React.useState<string | null>(null);
  
  // Available provinces from data
  const provinces = React.useMemo(() => {
    const unique = new Set(supportOrgs.map(o => o.province));
    return Array.from(unique).sort((a, b) => {
      // Sort: CA first, then alphabetically
      if (a === 'CA') return -1;
      if (b === 'CA') return 1;
      return a.localeCompare(b);
    });
  }, []);
  
  const provinceLabels: Record<string, string> = {
    'CA': 'Canada-wide',
    'ON': 'Ontario',
    'QC': 'Quebec',
    'BC': 'British Columbia',
    'AB': 'Alberta',
    'MB': 'Manitoba',
    'SK': 'Saskatchewan',
    'NS': 'Nova Scotia',
    'NB': 'New Brunswick',
    'PE': 'Prince Edward Island',
    'NL': 'Newfoundland',
    'NT': 'Northwest Territories',
    'YT': 'Yukon',
    'NU': 'Nunavut'
  };
  
  const filtered = React.useMemo(
    () => {
      const filterProv = selectedProvince || province;
      return filterProv
        ? supportOrgs.filter((o) => o.province === filterProv)
        : supportOrgs;
    },
    [province, selectedProvince],
  );
  
  const [suggestion, setSuggestion] = React.useState("");
  const AsyncStorageRef = React.useRef<any>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const mod = await import("@react-native-async-storage/async-storage");
        AsyncStorageRef.current = mod.default;
      } catch {}
    })();
  }, []);
  return (
    <View
      style={styles.container}
  accessibilityLabel={t('advocacy.support.screenLabel','Support directory screen')}
      accessible={true}
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('advocacy.support.title','Support Directory')}
      </Text>
      <DisclaimerBanner type="general" compact={true} />
      <Text style={styles.subtitle}>
        {t('advocacy.support.subtitle','Organizations that may help with claims, accommodations, and advocacy.')}
      </Text>
      
      {/* Province Filter Chips */}
      <View style={{ marginVertical: 12 }}>
        <Text style={[styles.subtitle, { marginBottom: 8, fontWeight: '600' }]}>
          {t('advocacy.support.filterByProvince', 'Filter by Province/Territory')}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Pressable
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityRole="button"
            accessibilityLabel={t('advocacy.support.showAll', 'Show all organizations')}
            accessibilityState={{ selected: !selectedProvince }}
            onPress={() => setSelectedProvince(null)}
            style={({ pressed }) => [
              styles.filterChip,
              !selectedProvince && styles.filterChipSelected,
              pressed && { opacity: 0.7 }
            ]}
          >
            <Text style={[
              styles.filterChipText,
              !selectedProvince && styles.filterChipTextSelected
            ]}>
              {t('advocacy.support.all', 'All')} ({supportOrgs.length})
            </Text>
          </Pressable>
          {provinces.map(prov => (
            <Pressable
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              key={prov}
              accessibilityRole="button"
              accessibilityLabel={`${t('advocacy.support.filterBy', 'Filter by')} ${provinceLabels[prov] || prov}`}
              accessibilityState={{ selected: selectedProvince === prov }}
              onPress={() => setSelectedProvince(prov)}
              style={({ pressed }) => [
                styles.filterChip,
                selectedProvince === prov && styles.filterChipSelected,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedProvince === prov && styles.filterChipTextSelected
              ]}>
                {provinceLabels[prov] || prov} ({supportOrgs.filter(o => o.province === prov).length})
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.province}
              {item.accessible ? ` • ${t('advocacy.support.accessible','Accessible')}` : ''}
            </Text>
            {!!item.phone && (
              <Text style={styles.meta}>{t('advocacy.support.phoneIcon','☎')} {item.phone}</Text>
            )}
            {!!item.url && (
              <Pressable
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="link"
                accessibilityLabel={t('advocacy.support.openWebsiteLabel','Open {{name}} website',{ name: item.name })}
                onPress={() => Linking.openURL(item.url!)}
              >
                <Text
                  style={[styles.meta, { textDecorationLine: "underline" }]}
                >
                  {t('advocacy.support.website','Website')}
                </Text>
              </Pressable>
            )}
          </View>
        )}
        contentContainerStyle={{ paddingTop: 8 }}
      />
      <View style={{ marginTop: 12 }}>
        <Text style={styles.subtitle}>{t('advocacy.support.suggestHeader','Suggest a correction')}</Text>
        <TextInput
          value={suggestion}
          onChangeText={setSuggestion}
          placeholder={t('advocacy.support.suggestPlaceholder','Org ID and your suggestion')}
          placeholderTextColor={palette.text + "77"}
          style={styles.input}
        />
        <Pressable
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={t('advocacy.support.submitSuggestion','Submit suggestion')}
          onPress={async () => {
            const AsyncStorage = AsyncStorageRef.current;
            if (!suggestion.trim() || !AsyncStorage) return;
            try {
              const key = "support:suggestions:v1";
              const cur = await AsyncStorage.getItem(key);
              const list = cur ? JSON.parse(cur) : [];
              list.push({
                ts: Date.now(),
                suggestion: suggestion.trim(),
                province,
              });
              await AsyncStorage.setItem(key, JSON.stringify(list));
              setSuggestion("");
            } catch {}
          }}
          style={({ pressed }) => [
            {
              backgroundColor: palette.primary,
              borderRadius: 8,
              paddingVertical: 10,
              alignItems: "center",
            },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>
            {t('common.submit','Submit')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginVertical: 8 },
    row: {
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    name: { color: palette.text, fontWeight: "600" },
    meta: { color: palette.text, opacity: 0.85 },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
    },
    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: palette.muted,
      backgroundColor: palette.surface,
    },
    filterChipSelected: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterChipText: {
      color: palette.text,
      fontSize: 13,
      fontWeight: '500',
    },
    filterChipTextSelected: {
      color: palette.onPrimary,
      fontWeight: '600',
    },
  });
}
