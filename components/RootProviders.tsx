import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import essential providers
import { I18nProvider } from '../i18n';
import { AuthProvider } from '../store/auth';
import { BookmarksProvider } from '../store/bookmarks';
import { CampaignsLocalProvider } from '../store/campaignsLocal';
import { CommunityProvider } from '../store/community';
import { ComplexityModeProvider } from '../store/complexityMode';
import { CountsProvider } from '../store/counts';
import { FavoritesProvider } from '../store/favorites';
import { JurisdictionProvider } from '../store/jurisdiction';
import { NetworkProvider } from '../store/network';
import { NotificationsProvider } from '../store/notifications';
import { PrivacyProvider } from '../store/privacy';
import { ProfileLocalProvider } from '../store/profileLocal';
import { RefreshProvider } from '../store/refresh';
import { SettingsProvider } from '../store/settings';

/**
 * RootProviders - Wraps app with context providers
 * 
 * Provider order:
 * 1. SafeAreaProvider (required for SafeAreaView)
 * 2. Settings (app configuration)
 * 3. Auth (user authentication - needed by many providers)
 * 4. Privacy (privacy settings)
 * 5. Bookmarks (saved resources)
 * 6. Notifications (push notifications)
 * 7. ProfileLocal (local profile data - needs Auth)
 * 8. Refresh (pull to refresh)
 * 9. i18n (localization)
 * 10. Network (connectivity state)
 * 11. Jurisdiction (location-based features)
 * 12. ComplexityMode (feature visibility)
 * 13. Counts (badge counts)
 * 14. Favorites (favorited items)
 * 15. CampaignsLocal (local campaign data - needs Auth)
 * 16. Community (community features - needs Auth)
 */
export function RootProviders({ children }: { children: ReactNode }) {
  console.log('[RootProviders] Rendering with core providers');
  
  try {
    return (
      <SafeAreaProvider>
        <SettingsProvider>
          <AuthProvider>
            <PrivacyProvider>
              <BookmarksProvider>
                <NotificationsProvider>
                  <ProfileLocalProvider>
                    <RefreshProvider>
                      <I18nProvider>
                        <NetworkProvider>
                          <JurisdictionProvider>
                            <ComplexityModeProvider>
                              <CountsProvider>
                                <FavoritesProvider>
                                  <CampaignsLocalProvider>
                                    <CommunityProvider>
                                      {children}
                                    </CommunityProvider>
                                  </CampaignsLocalProvider>
                                </FavoritesProvider>
                              </CountsProvider>
                            </ComplexityModeProvider>
                          </JurisdictionProvider>
                        </NetworkProvider>
                      </I18nProvider>
                    </RefreshProvider>
                  </ProfileLocalProvider>
                </NotificationsProvider>
              </BookmarksProvider>
            </PrivacyProvider>
          </AuthProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    );
  } catch (err) {
    console.error('[RootProviders] Provider rendering failed, using bare children:', err);
    return <>{children}</>;
  }
}
