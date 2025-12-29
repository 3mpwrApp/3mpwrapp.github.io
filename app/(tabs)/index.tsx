/**
 * Home Screen - Evidence-First Redesign (Phase 2)
 *
 * PRODUCT POSITIONING: "Evidence vault for disability rights"
 * - Evidence collection is the unmistakable center of the app
 * - Hero CTA: 80px tall, green, "Document What Happened"
 * - Evidence Timeline shows progress and next steps
 * - Next Best Action provides one obvious path forward
 * - Remove wellness promotion entirely
 */

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import CelebrationToast from '../../components/CelebrationToast';
import CollectiveEvidenceOptIn from '../../components/CollectiveEvidenceOptIn';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import EvidenceTimeline, { type EvidenceEntry } from '../../components/EvidenceTimeline';
import GapView from '../../components/GapView';
import LegalAcceptanceBanner from '../../components/LegalAcceptanceBanner';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import SimpleModeWelcome from '../../components/SimpleModeWelcome';
import SOSButton from '../../components/SOSButton';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useAuth } from '../../context/AuthContext';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import type { Celebration } from '../../services/celebrations';
import { checkCelebrations, markCelebrationSeen } from '../../services/celebrations';
import {
  checkShouldShowOptIn,
  hasUserOptedInToCollectiveEvidence,
  optInToCollectiveEvidence,
} from '../../services/collectiveEvidence';
import { useComplexityMode } from '../../store/complexityMode';
import { useTextScale } from '../../theme/typography';
import { createTextStyles } from '../../theme/typography.enhanced';
import { useAppPalette } from '../../theme/usePalette';
import { logError } from '../../utils/errorLogger';
import { logger } from '../../utils/logger';
import { createShadow } from '../../utils/shadow';

// Welcome Modal Component
const WelcomeModal = React.memo(
  ({
    visible,
    onDismiss,
    router,
  }: {
    visible: boolean;
    onDismiss: () => void;
    router: ReturnType<typeof useRouter>;
  }) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const { factor } = useTextScale();

    if (!visible) return null;

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: palette.card,
            borderRadius: 16,
            padding: 24,
            maxWidth: 400,
            width: '100%',
            ...createShadow({
              shadowColor: palette.text,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }),
          }}
        >
          <Text
            style={{
              fontSize: Math.round(24 * factor),
              fontWeight: '700',
              color: palette.text,
              textAlign: 'center',
              marginBottom: 16,
            }}
          >
            🎉 {t('welcome.title', 'Welcome to 3mpwr!')}
          </Text>

          <Text
            style={{
              fontSize: Math.round(16 * factor),
              color: palette.text,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: Math.round(24 * factor),
            }}
          >
            {t(
              'welcome.message',
              "Let's get you set up with personalized tools and resources for your disability advocacy journey."
            )}
          </Text>

          <GapView style={{ flexDirection: 'column' }} gap={12}>
            <A11yPressable
              style={{
                backgroundColor: palette.primary,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => {
                onDismiss();
                router.push('/onboarding/first7' as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('welcome.startOnboarding', 'Start onboarding')}
            >
              <Text
                style={{
                  color: palette.onPrimary,
                  fontSize: Math.round(16 * factor),
                  fontWeight: '600',
                }}
              >
                🚀 {t('welcome.startOnboarding', 'Get Started')}
              </Text>
            </A11yPressable>

            <A11yPressable
              style={{
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.muted,
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel={t('welcome.exploreLater', 'Explore the app first')}
            >
              <Text
                style={{
                  color: palette.text,
                  fontSize: Math.round(16 * factor),
                  fontWeight: '600',
                }}
              >
                {t('welcome.exploreLater', 'Explore First')}
              </Text>
            </A11yPressable>
          </GapView>
        </View>
      </View>
    );
  }
);
WelcomeModal.displayName = 'WelcomeModal';

// Guest Mode Banner Component
const GuestModeBanner = React.memo(() => {
  const { isGuest } = useAuth();
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const router = useRouter();

  if (!isGuest) return null;

  return (
    <View
      style={{
        backgroundColor: palette.surface,
        borderLeftWidth: 4,
        borderLeftColor: palette.warning,
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        ...createShadow({
          shadowColor: palette.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }),
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>👤</Text>
        <Text
          style={{
            fontSize: Math.round(14 * factor),
            fontWeight: '700',
            color: palette.warning,
          }}
        >
          {t('guest.banner.title', 'Guest Mode')}
        </Text>
      </View>
      <Text
        style={{
          fontSize: Math.round(12 * factor),
          lineHeight: Math.round(18 * factor),
          color: palette.text,
          opacity: 0.85,
        }}
      >
        {t(
          'guest.banner.message',
          "You're using guest mode. Your data isn't saved and some features are limited. Create an account to save your progress and access all features."
        )}
      </Text>
      <GapView style={{ flexDirection: 'row', marginTop: 8 }} gap={8}>
        <A11yPressable
          style={{
            backgroundColor: palette.primary,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            alignItems: 'center',
            flex: 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('guest.banner.createAccount', 'Create account')}
          onPress={() => router.push('/(auth)/signup' as any)}
        >
          <Text
            style={{
              color: palette.onPrimary,
              fontSize: Math.round(12 * factor),
              fontWeight: '600',
            }}
          >
            {t('guest.banner.createAccount', 'Create Account')}
          </Text>
        </A11yPressable>
        <A11yPressable
          style={{
            backgroundColor: palette.surface,
            borderWidth: 1,
            borderColor: palette.muted,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 6,
            alignItems: 'center',
            flex: 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('guest.banner.signIn', 'Sign in')}
          onPress={() => router.push('/(auth)/signin' as any)}
        >
          <Text
            style={{
              color: palette.text,
              fontSize: Math.round(12 * factor),
              fontWeight: '600',
            }}
          >
            {t('guest.banner.signIn', 'Sign In')}
          </Text>
        </A11yPressable>
      </GapView>
    </View>
  );
});
GuestModeBanner.displayName = 'GuestModeBanner';

// Safe wrapper for optional components
const SafeOptionalComponent = ({
  children,
  fallback = null,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const [error, setError] = React.useState(false);

  if (error) return <>{fallback}</>;

  return <ErrorBoundaryWrapper onError={() => setError(true)}>{children}</ErrorBoundaryWrapper>;
};

class ErrorBoundaryWrapper extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logError('Home', 'Optional component render', error);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// Next Best Action Component - Contextual guidance based on user state
const NextBestAction = React.memo(({ evidenceCount }: { evidenceCount: number }) => {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const router = useRouter();

  const getNextAction = () => {
    if (evidenceCount === 0) {
      return {
        icon: '📝',
        title: t('home.nextAction.firstEvidence.title', 'Start collecting evidence'),
        subtitle: t('home.nextAction.firstEvidence.subtitle', 'Document what happened in your own words'),
        cta: t('home.nextAction.firstEvidence.cta', 'Add First Note'),
        route: '/(tabs)/advocacy/evidence-locker',
      };
    }
    if (evidenceCount <= 2) {
      return {
        icon: '📋',
        title: t('home.nextAction.moreEvidence.title', 'Keep building your case'),
        subtitle: t('home.nextAction.moreEvidence.subtitle', 'Add 2-3 more notes for a strong foundation'),
        cta: t('home.nextAction.moreEvidence.cta', 'Add More Evidence'),
        route: '/(tabs)/advocacy/evidence-locker',
      };
    }
    return {
      icon: '✉️',
      title: t('home.nextAction.generateLetter.title', 'Generate your first letter'),
      subtitle: t('home.nextAction.generateLetter.subtitle', 'Turn your evidence into a professional appeal'),
      cta: t('home.nextAction.generateLetter.cta', 'Generate Letter'),
      route: '/(tabs)/advocacy/letter-wizard',
    };
  };

  const action = getNextAction();

  return (
    <A11yPressable
      onPress={() => router.push(action.route as any)}
      style={[styles.nextActionCard, { backgroundColor: palette.info + '10', borderColor: palette.info }]}
      accessibilityLabel={`${action.title}. ${action.subtitle}`}
      accessibilityHint={t('home.nextAction.hint', 'Double tap to continue')}
      hitSlop={HIT_SLOP_8}
    >
      <View style={styles.nextActionHeader}>
        <Text style={{ fontSize: 32 }}>{action.icon}</Text>
        <Text
          style={[styles.nextActionBadge, { fontSize: Math.round(10 * factor), color: palette.info }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {t('home.nextAction.badge', 'NEXT STEP')}
        </Text>
      </View>
      <Text
        style={[styles.nextActionTitle, { fontSize: Math.round(16 * factor), color: palette.text }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {action.title}
      </Text>
      <Text
        style={[styles.nextActionSubtitle, { fontSize: Math.round(13 * factor), color: palette.textSecondary }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {action.subtitle}
      </Text>
      <View style={[styles.nextActionButton, { backgroundColor: palette.info }]}>
        <Text
          style={[styles.nextActionButtonText, { fontSize: Math.round(14 * factor), color: '#FFFFFF' }]}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          {action.cta} →
        </Text>
      </View>
    </A11yPressable>
  );
});
NextBestAction.displayName = 'NextBestAction';

// Main home screen component
const HomeScreen = React.memo(() => {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const textStyles = createTextStyles(palette);
  const { factor } = useTextScale();
  const titleRef = React.useRef<Text>(null);
  const router = useRouter();
  const { isFeatureVisible } = useComplexityMode();

  // State
  const [celebration, setCelebration] = React.useState<Celebration | null>(null);
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [evidenceCount, setEvidenceCount] = React.useState(0);
  const [recentEvidence, setRecentEvidence] = React.useState<EvidenceEntry[]>([]);
  const [isLoadingEvidence, setIsLoadingEvidence] = React.useState(true);
  const [showCollectiveOptIn, setShowCollectiveOptIn] = React.useState(false);

  // Load evidence from Evidence Locker
  React.useEffect(() => {
    const loadEvidence = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const evidenceData = await AsyncStorage.getItem('evidenceLocker:entries:v1');

        if (evidenceData) {
          const entries = JSON.parse(evidenceData);
          setEvidenceCount(entries.length);

          // Get 3 most recent entries
          const sorted = entries.sort((a: any, b: any) => {
            const aTime =
              a.createdAt instanceof Date ? a.createdAt.getTime() : a.createdAt.seconds * 1000;
            const bTime =
              b.createdAt instanceof Date ? b.createdAt.getTime() : b.createdAt.seconds * 1000;
            return bTime - aTime;
          });
          setRecentEvidence(sorted.slice(0, 3));
        } else {
          setEvidenceCount(0);
          setRecentEvidence([]);
        }
      } catch (error) {
        logError('HomeScreen', 'Load evidence', error as Error);
      } finally {
        setIsLoadingEvidence(false);
      }
    };

    loadEvidence();

    // Refresh evidence when screen comes into focus
    const interval = setInterval(loadEvidence, 5000);
    return () => clearInterval(interval);
  }, []);

  // Check if should show collective evidence opt-in
  React.useEffect(() => {
    const checkOptIn = async () => {
      try {
        const hasOptedIn = await hasUserOptedInToCollectiveEvidence();
        if (!hasOptedIn) {
          const shouldShow = await checkShouldShowOptIn();
          setShowCollectiveOptIn(shouldShow);
        }
      } catch (error) {
        logError('HomeScreen', 'Check collective opt-in', error as Error);
      }
    };

    // Only check if user has evidence
    if (evidenceCount >= 3) {
      checkOptIn();
    }
  }, [evidenceCount]);

  // Check for celebrations
  React.useEffect(() => {
    const checkForCelebrations = async () => {
      try {
        const newCelebrations = await checkCelebrations();
        if (newCelebrations.length > 0) {
          setCelebration(newCelebrations[0]);
        }
      } catch (error) {
        logError('HomeScreen', 'Check celebrations', error as Error);
      }
    };

    checkForCelebrations();
    const interval = setInterval(checkForCelebrations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is new
  React.useEffect(() => {
    const checkNewUser = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const onboardingData = await AsyncStorage.getItem('onboarding:first7:v1');
        const disabilityProfile = await AsyncStorage.getItem('disabilityWizard:profile:v1');

        if (!onboardingData && !disabilityProfile) {
          setShowWelcome(true);
        }
      } catch (error) {
        logError('HomeScreen', 'Check new user', error as Error);
      }
    };

    const timer = setTimeout(checkNewUser, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Debug logging
  React.useEffect(() => {
    logger.log('[HomeScreen] ===== COMPONENT MOUNTED (Evidence-First) =====');
    return () => {
      logger.log('[HomeScreen] ===== COMPONENT UNMOUNTED =====');
    };
  }, []);

  // Announce page load
  useAnnounceOnMount(t('home.announcement', 'Home screen loaded. Evidence-first design.'));
  useFocusOnRefOnMount(titleRef);

  // Handlers
  const handleCelebrationDismiss = async () => {
    if (celebration) {
      await markCelebrationSeen(celebration.id);
      setCelebration(null);
    }
  };

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  const handleCollectiveOptIn = async () => {
    try {
      await optInToCollectiveEvidence();
      setShowCollectiveOptIn(false);
    } catch (error) {
      logError('HomeScreen', 'Collective opt-in', error as Error);
    }
  };

  const handleCollectiveOptInDismiss = () => {
    setShowCollectiveOptIn(false);
  };

  const handleViewAllEvidence = () => {
    router.push('/(tabs)/advocacy/evidence-locker' as any);
  };

  return (
    <ResponsiveScreenWrapper testID="home-screen">
      {/* Welcome Modal */}
      <WelcomeModal visible={showWelcome} onDismiss={handleWelcomeDismiss} router={router} />

      {/* Celebration Toast */}
      <SafeOptionalComponent>
        {celebration && <CelebrationToast celebration={celebration} onDismiss={handleCelebrationDismiss} />}
      </SafeOptionalComponent>

      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={[textStyles.h3, { marginBottom: 16 }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.title', 'Home')}{' '}
        <Text style={[textStyles.bodySmall, { opacity: 0.8 }]}>(Beta)</Text>
      </Text>

      <DisclaimerBanner type="general" compact={true} />
      <LegalAcceptanceBanner />
      <GuestModeBanner />

      {/* Simple Mode Welcome */}
      <SimpleModeWelcome
        tabName="Home"
        availableFeatures={['Evidence Command Center', 'Letter Wizard', 'Crisis Resources', 'Quick Search']}
        hiddenCount={10}
      />

      {/* HERO CTA - Evidence Collection (80px tall, green, unmissable) */}
      <A11yPressable
        onPress={() => router.push('/(tabs)/advocacy/evidence-locker' as any)}
        style={[styles.heroCTA, { backgroundColor: palette.success }]}
        accessibilityRole="button"
        accessibilityLabel={t('home.hero.label', 'Document what happened - Add evidence')}
        accessibilityHint={t('home.hero.hint', 'Navigate to Evidence Command Center')}
        hitSlop={HIT_SLOP_8}
      >
        <View style={styles.heroIconContainer}>
          <Ionicons name="folder-open" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.heroTextContainer}>
          <Text
            style={[styles.heroTitle, { fontSize: Math.round(18 * factor), color: '#FFFFFF' }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.hero.title', 'Document What Happened')}
          </Text>
          <Text
            style={[styles.heroSubtitle, { fontSize: Math.round(13 * factor), color: '#FFFFFF' }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.hero.subtitle', 'Save evidence in your own words')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={28} color="#FFFFFF" />
      </A11yPressable>

      {/* Evidence Timeline Widget */}
      <EvidenceTimeline
        evidenceCount={evidenceCount}
        recentEvidence={recentEvidence}
        onViewAll={handleViewAllEvidence}
        isLoading={isLoadingEvidence}
      />

      {/* Collective Evidence Opt-In Banner */}
      {showCollectiveOptIn && (
        <SafeOptionalComponent>
          <CollectiveEvidenceOptIn
            onOptIn={handleCollectiveOptIn}
            onDismiss={handleCollectiveOptInDismiss}
            evidenceCount={evidenceCount}
          />
        </SafeOptionalComponent>
      )}

      {/* Next Best Action */}
      <NextBestAction evidenceCount={evidenceCount} />

      {/* Quick Actions Row */}
      <GapView style={styles.quickActionsRow} gap={12}>
        <A11yPressable
          onPress={() => router.push('/search' as any)}
          style={[styles.quickActionButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
          accessibilityLabel={t('home.quickAction.search', 'Search resources')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="search" size={20} color={palette.text} />
          <Text
            style={[styles.quickActionText, { fontSize: Math.round(13 * factor), color: palette.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.quickAction.search', 'Search')}
          </Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/(tabs)/advocacy/ask' as any)}
          style={[styles.quickActionButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
          accessibilityLabel={t('home.quickAction.ask', 'Ask 3mpwr AI')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="chatbubble-ellipses" size={20} color={palette.text} />
          <Text
            style={[styles.quickActionText, { fontSize: Math.round(13 * factor), color: palette.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.quickAction.ask', 'Ask AI')}
          </Text>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/onboarding/first7' as any)}
          style={[styles.quickActionButton, { backgroundColor: palette.surface, borderColor: palette.muted }]}
          accessibilityLabel={t('home.quickAction.first7', 'First 7 days guide')}
          hitSlop={HIT_SLOP_8}
        >
          <Ionicons name="rocket" size={20} color={palette.text} />
          <Text
            style={[styles.quickActionText, { fontSize: Math.round(13 * factor), color: palette.text }]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {t('home.quickAction.first7', 'First 7')}
          </Text>
        </A11yPressable>
      </GapView>

      {/* SOS Button (Always visible) */}
      <SafeOptionalComponent>
        <SOSButton />
      </SafeOptionalComponent>

      {/* Footer note */}
      <Text
        style={[textStyles.caption, { color: palette.textSecondary, marginTop: 12 }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.footer.note', 'Evidence-first design. Your notes are private and encrypted.')}
      </Text>
    </ResponsiveScreenWrapper>
  );
});
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;

const styles = StyleSheet.create({
  heroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    minHeight: 80,
    ...createShadow({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    }),
  },
  heroIconContainer: {
    marginRight: 12,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  heroSubtitle: {
    fontWeight: '500',
    opacity: 0.9,
    lineHeight: 18,
  },
  nextActionCard: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
    ...createShadow({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  nextActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nextActionBadge: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  nextActionTitle: {
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 22,
  },
  nextActionSubtitle: {
    marginBottom: 12,
    lineHeight: 20,
  },
  nextActionButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  nextActionButtonText: {
    fontWeight: '600',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    minHeight: 72,
  },
  quickActionText: {
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
