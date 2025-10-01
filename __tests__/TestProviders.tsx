import React from 'react';

import { I18nProvider } from '../i18n';
import { FavoritesProvider } from '../store/favorites';
import { SettingsProvider } from '../store/settings';

export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <SettingsProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </SettingsProvider>
    </I18nProvider>
  );
}
