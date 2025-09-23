import { usePathname } from 'expo-router';
import { Text } from 'react-native';

import { useTranslation } from '../i18n';
import { logActivity } from '../services/activity';
import { useNotificationDispatcher } from '../services/notifications.dispatcher';
import { useBookmarks } from '../store/bookmarks';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { findRouteEntry } from '../utils/routeRegistry';

import A11yPressable from './A11yPressable';
const HIT_SLOP = { top:8, bottom:8, left:8, right:8 };

export default function BookmarkToggle() {
  const pathname = usePathname();
  const entry = pathname ? findRouteEntry(pathname) : undefined;
  const { t } = useTranslation();
  const { isBookmarked, addBookmark, removeBookmark, findByRoute } = useBookmarks();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { dispatchDomainEvent } = useNotificationDispatcher();

  if (!entry) return null;
  const active = isBookmarked(entry.route);
  const existing = findByRoute(entry.route);

  return (
    <A11yPressable
      role="button"
      accessibilityLabel={active ? t('bookmark.remove', 'Remove bookmark') : t('bookmark.add', 'Add bookmark')}
      onPress={async () => {
        if (active && existing) {
          removeBookmark(existing.id);
          logActivity({ type: 'bookmark.remove', payload: { targetId: existing.id } });
        } else {
          addBookmark(entry.route, t(entry.tKey, entry.fallback), entry.tKey);
          logActivity({ type: 'bookmark.add', payload: { targetId: entry.route } });
          try { await dispatchDomainEvent({ event:'resource.bookmark.add', payload:{ resourceTitle: t(entry.tKey, entry.fallback) } }); } catch {}
        }
      }}
      hitSlop={HIT_SLOP}
      style={{ paddingHorizontal: 12, paddingVertical: 6, minHeight:44, justifyContent:'center' }}
      accessibilityState={{ selected: active }}
    >
      <Text style={{ color: active ? palette.primary : palette.text, fontSize: Math.round(14 * factor), fontWeight: '600' }}>
        {active ? t('bookmark.saved', 'Saved') : t('bookmark.save', 'Save')}
      </Text>
    </A11yPressable>
  );
}
