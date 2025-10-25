export { default as BookmarksSection } from './BookmarksSection';
export { default as EnhancedPrivacySection } from './EnhancedPrivacySection';
export { default as LocalProfileSection } from './LocalProfileSection';
export { default as MediaLockerSection } from './MediaLockerSection';
export { default as WellnessPrefsSection } from './WellnessPrefsSection';

// Expo Router treats this file as a route because it lives under app/. Provide a
// no-op default export to silence the "missing the required default export" warning.
export default function SettingsSectionsIndexPlaceholder() {
	return null;
}

