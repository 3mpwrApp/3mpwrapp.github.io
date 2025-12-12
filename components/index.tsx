/**
 * Components Export Index
 * 
 * Central export point for commonly used components.
 * Import from '@/components' instead of individual files.
 */

// Core UI Components
export { default as A11yPressable } from './A11yPressable';
export { default as Card } from './Card';
export { default as DisclaimerBanner } from './DisclaimerBanner';
export { GapView, default as GapViewDefault } from './GapView';
export { default as ResponsiveScreenWrapper } from './ResponsiveScreenWrapper';
export { default as SearchBar } from './SearchBar';
export { default as SkeletonRow } from './SkeletonRow';

// Complexity Mode Components
export { default as ComplexityModeHint, useComplexityModeHints } from './ComplexityModeHint';
export { default as ComplexityModeIndicator } from './ComplexityModeIndicator';
export { default as ComplexityModeStats } from './ComplexityModeStats';
export { default as SimpleModeWelcome } from './SimpleModeWelcome';

// Referral & Growth Components
export { default as ReferralCard } from './ReferralCard';

// Badge Components
export { default as UserBadge } from './badges/UserBadge';
export type { BadgeType, UserBadgeProps } from './badges/UserBadge';
export { default as UserBadgesDisplay } from './badges/UserBadgesDisplay';

// Accessibility Components
export { default as AccessibilityToggle } from './AccessibilityToggle';
export { default as ContrastToggle } from './ContrastToggle';

// Settings Components
export { default as LanguageSelector } from './LanguageSelector';
export { default as SettingsLink } from './SettingsLink';
export { default as UpdateChecker } from './UpdateChecker';

// Wellness Components
// MoodSelector removed - component no longer exists

// Advocacy Components
export { default as JurisdictionDeadlineCalculator } from './JurisdictionDeadlineCalculator';
export { default as JurisdictionFormHelper } from './JurisdictionFormHelper';
export { JurisdictionPanel } from './JurisdictionPanel';

// Power Tool Components
export { default as PowerTool } from './PowerTool';
export type { PowerToolTab, PowerToolTabProps } from './PowerTool';

