import { router, type Href } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import GapView from '../../components/GapView';
import { MAX_FONT_SCALE } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import { useNotifications } from '../../store/notifications';
import { useTextScale } from '../../theme/typography';
import { useAppPalette } from '../../theme/usePalette';

export default function InboxScreen() {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const s = styles(palette, factor);
  const { inbox, unread, markAllRead, markRead } = useNotifications();

  return (
    <ResponsiveScreenWrapper scrollable>
      <View style={s.container} accessibilityLabel={t('nav.inbox','Inbox screen')}>
        <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('nav.inbox','Inbox')}</Text>
        <GapView style={{ flexDirection:'row' }} gap={8}>
          <Text style={s.subtitle}>{unread} {t('common.unread','unread')}</Text>
          {unread > 0 && (
            <A11yPressable onPress={markAllRead} style={s.markAll} accessibilityRole="button" accessibilityLabel={t('inbox.markAll','Mark all read')}>
              <Text style={s.markAllText}>{t('inbox.markAll','Mark all read')}</Text>
            </A11yPressable>
          )}
        </GapView>
        <FlatList
          data={inbox}
          keyExtractor={(n) => n.id}
          renderItem={({ item }) => (
            <A11yPressable
              onPress={() => {
                markRead(item.id);
                if (item.route) {
                  try { router.push(item.route as Href); } catch {}
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={item.read ? t('inbox.itemRead','Notification (read)') : t('inbox.itemUnread','Notification (unread)')}
              style={[s.row, !item.read && { backgroundColor: palette.card }]}
            >
              <View style={{ flex:1 }}>
                <Text style={s.rowTitle}>{item.title}</Text>
                <Text style={s.rowBody}>{item.body}</Text>
                <Text style={s.rowMeta}>{new Date(item.createdAt).toLocaleString()} • {item.channel}</Text>
              </View>
            </A11yPressable>
          )}
          contentContainerStyle={{ paddingTop: 10 }}
        />
      </View>
    </ResponsiveScreenWrapper>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>, factor: number) {
  return StyleSheet.create({
    container: { flex:1, backgroundColor: palette.background, padding: 16 },
    title: { color: palette.text, fontSize: Math.round(22*factor), fontWeight:'700' },
    subtitle: { color: palette.text, opacity:0.8 },
    markAll: { marginLeft: 'auto', paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 },
    markAllText: { color: palette.text, fontWeight:'700' },
    row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted, flexDirection:'row', paddingRight: 8 },
    rowTitle: { color: palette.text, fontWeight:'700' },
    rowBody: { color: palette.text, opacity:0.9 },
    rowMeta: { color: palette.text, opacity:0.6, fontSize: 12 },
  });
}
