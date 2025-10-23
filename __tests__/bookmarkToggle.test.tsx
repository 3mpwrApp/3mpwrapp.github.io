import { fireEvent, render } from '@testing-library/react';

import BookmarkToggle from '../components/BookmarkToggle';
import { BookmarksProvider } from '../store/bookmarks';
import { NotificationsProvider } from '../store/notifications';

// Mock translation
jest.mock('../i18n', () => ({ useTranslation: () => ({ t: (k:string, f?:string)=> f || k }) }));
// Mock palette hooks
jest.mock('../theme/usePalette', () => ({ useAppPalette: () => ({ text:'#000', primary:'#06f' }) }));
jest.mock('../theme/typography', () => ({ useTextScale: () => ({ factor:1 }) }));
// Mock router path
jest.mock('expo-router', () => ({ usePathname: () => '/test/route' }));
// Mock route registry
jest.mock('../utils/routeRegistry', () => ({ findRouteEntry: (r:string) => ({ route:r, tKey:'test.key', fallback:'Test Route' }) }));

// silence analytics & notifications side-effects
jest.mock('../services/analytics', () => ({ logEvent: () => {} }));
jest.mock('../services/notifications', () => ({
  ensureNotificationPermission: jest.fn().mockResolvedValue(false),
  scheduleLocal: jest.fn().mockResolvedValue(false)
}));

describe('BookmarkToggle', () => {
  test('renders and can be pressed', () => {
    const { getByText } = render(
      <NotificationsProvider>
        <BookmarksProvider>
          <BookmarkToggle />
        </BookmarksProvider>
      </NotificationsProvider>
    );
    const addBtn = getByText(/Save|Saved/);
  // @ts-ignore react-native testing library press alias
  fireEvent.press(addBtn);
  });
});
