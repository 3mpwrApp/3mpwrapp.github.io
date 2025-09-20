import { usePathname } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useTranslation } from '../i18n';
import { useBookmarks } from '../store/bookmarks';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';
import { findRouteEntry } from '../utils/routeRegistry';

export default function BookmarkToggle() {
  const pathname = usePathname();
  const entry = pathname ? findRouteEntry(pathname) : undefined;
  const { t } = useTranslation();
  const { isBookmarked, addBookmark, removeBookmark, findByRoute } = useBookmarks();
  const palette = useAppPalette();
  const { factor } = useTextScale();

  if (!entry) return null;
  const active = isBookmarked(entry.route);
  const existing = findByRoute(entry.route);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={active ? t('bookmark.remove', 'Remove bookmark') : t('bookmark.add', 'Add bookmark')}
      onPress={() => {
        if (active && existing) removeBookmark(existing.id); else addBookmark(entry.route, t(entry.tKey, entry.fallback), entry.tKey);
      }}
      style={{ paddingHorizontal: 12, paddingVertical: 6 }}
    >
      <Text style={{ color: active ? palette.primary : palette.text, fontSize: Math.round(14 * factor), fontWeight: '600' }}>
        {active ? t('bookmark.saved', 'Saved') : t('bookmark.save', 'Save')}
      </Text>
    </Pressable>
  );
}
