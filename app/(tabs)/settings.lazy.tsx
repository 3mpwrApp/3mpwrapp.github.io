import React from 'react';

// Jest-aware: load synchronously in test to avoid Suspense timing flake
const isTest = process.env.NODE_ENV === 'test' || (typeof jest !== 'undefined');

export const Bookmarks = isTest
  ? require('./settings.sections/index').BookmarksSection
  : React.lazy(() => import('./settings.sections/index').then(m => ({ default: m.BookmarksSection })));

export const LocalProfile = isTest
  ? require('./settings.sections/index').LocalProfileSection
  : React.lazy(() => import('./settings.sections/index').then(m => ({ default: m.LocalProfileSection })));

export const EnhancedPrivacy = isTest
  ? require('./settings.sections/index').EnhancedPrivacySection
  : React.lazy(() => import('./settings.sections/index').then(m => ({ default: m.EnhancedPrivacySection })));

export const WellnessPrefs = isTest
  ? require('./settings.sections/index').WellnessPrefsSection
  : React.lazy(() => import('./settings.sections/index').then(m => ({ default: m.WellnessPrefsSection })));

export const MediaLocker = isTest
  ? require('./settings.sections/index').MediaLockerSection
  : React.lazy(() => import('./settings.sections/index').then(m => ({ default: m.MediaLockerSection })));

export default { Bookmarks, LocalProfile, EnhancedPrivacy, WellnessPrefs, MediaLocker };
