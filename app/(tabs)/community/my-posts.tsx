import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import React from 'react';
import { FlatList, StyleSheet, Text, useColorScheme, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import DisclaimerBanner from '../../../components/DisclaimerBanner';
import { HIT_SLOP_8, touchTarget } from '../../../constants/A11Y';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase/config';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { useTranslation } from '../../../i18n';
import { colors, type Palette } from '../../../theme/colors';

export const options = { href: null };

export default function MyPostsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const scheme = useColorScheme();
  const palette = scheme === 'dark' ? colors.dark : colors.light;
  const s = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount(t('community.myPosts.title','My Posts'));
  useFocusOnRefOnMount(titleRef);
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      if (!user) return;
      try {
        const col = collection(db, 'threads');
        const q = query(col, where('authorUid','==', user.uid), orderBy('createdAt','desc'));
        const snap = await getDocs(q);
        setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch {}
    })();
  }, [user?.uid]);

  return (
    <View style={s.container} accessibilityLabel={t('community.myPosts.title','My Posts')} accessible>
      <Text ref={titleRef} style={s.title} accessibilityRole='header' maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('community.myPosts.title','My Posts')}</Text>
      <DisclaimerBanner type="general" compact />
      <FlatList
        data={items}
        keyExtractor={(it)=> it.id}
        renderItem={({ item }) => (
          <A11yPressable
            onPress={() => router.push((`/(tabs)/community/threads/${item.id}`) as Href)}
            accessibilityRole='button'
            accessibilityLabel={t('community.myPosts.open','Open thread')}
            hitSlop={HIT_SLOP_8}
            style={({ pressed }) => [s.row, touchTarget.min, { opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={s.threadTitle}>{item.title}</Text>
            <Text style={s.threadMeta}>{new Date(item.createdAt?.toDate?.() || Date.now()).toLocaleString()}</Text>
          </A11yPressable>
        )}
        ListEmptyComponent={<Text style={s.threadMeta}>{t('community.myPosts.empty','No posts yet.')}</Text>}
        contentContainerStyle={{ paddingTop: 8 }}
      />
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: { flex:1, padding:20, backgroundColor: palette.background },
    title: { fontSize:22, fontWeight:'700', color: palette.text },
    row: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted },
    threadTitle: { color: palette.text, fontSize: 16, fontWeight: '600' },
    threadMeta: { color: palette.text, opacity: 0.8, marginTop: 2 },
  });
}
