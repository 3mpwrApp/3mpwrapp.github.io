import React from 'react';

import { I18nProvider } from '../i18n';
import { SettingsProvider } from '../store/settings';

export function TestProviders({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </I18nProvider>
  );
}
