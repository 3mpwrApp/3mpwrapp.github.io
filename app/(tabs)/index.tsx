import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import CelebrationToast from '../../components/CelebrationToast';
import { CopilotSuggestionBanner } from '../../components/CopilotSuggestionBanner';
import DisabilityWizard from '../../components/DisabilityWizard';
import DisclaimerBanner from '../../components/DisclaimerBanner';
import GapView from '../../components/GapView';
import { HomeGuide } from '../../components/HomeGuide';
import ResponsiveScreenWrapper from '../../components/ResponsiveScreenWrapper';
import { RevolutionaryFeaturesSpotlight } from '../../components/RevolutionaryFeaturesSpotlight';
import SimpleModeWelcome from '../../components/SimpleModeWelcome';
import SOSButton from '../../components/SOSButton';
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useAuth } from '../../context/AuthContext';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import type { Celebration } from '../../services/celebrations';
import { checkCelebrations, markCelebrationSeen } from '../../services/celebrations';
import { getActiveSuggestions, type ProactiveSuggestion } from '../../services/copilotProactive';
import { useComplexityMode } from '../../store/complexityMode';
import { useTextScale } from '../../theme/typography';
import { createTextStyles } from '../../theme/typography.enhanced';
import { useAppPalette } from '../../theme/usePalette';
import { logError } from '../../utils/errorLogger';
import { logger } from '../../utils/logger';
import { createShadow } from '../../utils/shadow';

// Welcome Modal Component
const WelcomeModal = React.memo(({ visible, onDismiss, router }: { visible: boolean; onDismiss: () => void; router: ReturnType<typeof useRouter> }) => {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  
  if (!visible) return null;
  
  return (
    <View style={{
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
    }}>
      <View style={{
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
      }}>
        <Text style={{
          fontSize: Math.round(24 * factor),
          fontWeight: '700',
          color: palette.text,
          textAlign: 'center',
          marginBottom: 16,
        }}>
          🎉 {t('welcome.title', 'Welcome to 3mpwr!')}
        </Text>
        
        <Text style={{
          fontSize: Math.round(16 * factor),
          color: palette.text,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: Math.round(24 * factor),
        }}>
          {t('welcome.message', 'Let\'s get you set up with personalized tools and resources for your disability advocacy journey.')}
        </Text>
        
        <GapView style={{ flexDirection: 'column' }} gap={12}>
          <A11yPressable
            style={{
              backgroundColor: palette.primary,
              paddingVertical: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => { onDismiss(); router.push('/onboarding/first7' as any); }}
            accessibilityRole="button"
            accessibilityLabel={t('welcome.startOnboarding', 'Start onboarding')}
          >
            <Text style={{
              color: palette.onPrimary,
              fontSize: Math.round(16 * factor),
              fontWeight: '600',
            }}>
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
            <Text style={{
              color: palette.text,
              fontSize: Math.round(16 * factor),
              fontWeight: '600',
            }}>
              {t('welcome.exploreLater', 'Explore First')}
            </Text>
          </A11yPressable>
        </GapView>
      </View>
    </View>
  );
});
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
    <View style={{
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
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 16, marginRight: 8 }}>👤</Text>
        <Text style={{
          fontSize: Math.round(14 * factor),
          fontWeight: '700',
          color: palette.warning,
        }}>
          {t('guest.banner.title', 'Guest Mode')}
        </Text>
      </View>
      <Text style={{
        fontSize: Math.round(12 * factor),
        lineHeight: Math.round(18 * factor),
        color: palette.text,
        opacity: 0.85,
      }}>
        {t('guest.banner.message', 'You\'re using guest mode. Your data isn\'t saved and some features are limited. Create an account to save your progress and access all features.')}
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
          <Text style={{
            color: palette.onPrimary,
            fontSize: Math.round(12 * factor),
            fontWeight: '600',
          }}>
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
          <Text style={{
            color: palette.text,
            fontSize: Math.round(12 * factor),
            fontWeight: '600',
          }}>
            {t('guest.banner.signIn', 'Sign In')}
          </Text>
        </A11yPressable>
      </GapView>
    </View>
  );
});
GuestModeBanner.displayName = 'GuestModeBanner';

// Safe wrapper for optional components - prevents crashes from non-critical features
const SafeOptionalComponent = ({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) => {
  const [error, setError] = React.useState(false);
  
  if (error) return <>{fallback}</>;
  
  return (
    <ErrorBoundaryWrapper onError={() => setError(true)}>
      {children}
    </ErrorBoundaryWrapper>
  );
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

// Memoize subcomponents for better performance
const RecentPrompts = React.memo(() => {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { t } = useTranslation();
  const router = useRouter();
  const [items, setItems] = React.useState<{label:string;route?:string;ts:number}[]>([]);
  
  React.useEffect(()=>{
    try{
      const mod = require('../../services/usage') as any;
      const buf = mod.usage?.getBuffer?.() || [];
      const recent = buf.filter((e: any) => ['usage.view','usage.complete'].includes(e.type) && e.meta?.quickPrompt)
        .slice(-200).reverse();
      const seen = new Set<string>();
      const uniq: { label: string; route?: string; ts: number }[] = [];
      for(const e of recent){
        if(seen.has(e.meta.quickPrompt)) continue; seen.add(e.meta.quickPrompt);
        uniq.push({ label: e.meta.quickPrompt, route: e.route, ts: e.ts });
        if(uniq.length>=3) break;
      }
      setItems(uniq);
    }catch{}
  },[]);
  
  if(!items.length) return null;
  
  return (
    <View 
      style={{ marginBottom: 12 }}
      accessibilityLabel={t('assistant.home.recentPromptsRegion', 'Recent prompts section')}
      accessible={true}
    >
      <Text 
        style={{ 
          color: palette.text, 
          fontWeight: '700', 
          marginBottom: 6,
          fontSize: Math.round(16 * factor)
        }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {t('assistant.home.recentPrompts','Recently used prompts')}
      </Text>
      <GapView 
        style={{ flexDirection:'row', flexWrap:'wrap' }}
        gap={8}
        accessibilityLabel={t('assistant.home.promptsList', 'List of recent prompts')}
      >
        {items.map((it, _index) => (
          <A11yPressable
            key={it.label}
            style={{
              backgroundColor: palette.card,
              borderWidth: 1,
              borderColor: palette.muted,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 999,
            }}
            accessibilityLabel={t('assistant.home.promptAccessibilityLabel', 'Recent prompt: {{prompt}}', { prompt: it.label })}
            accessibilityHint={t('assistant.home.promptHint', 'Double tap to use this prompt again')}
            hitSlop={HIT_SLOP_8}
            onPress={() => router.push((it.route as any) || '/(tabs)/advocacy/assistant-hub')}
          >
            <Text 
              style={{ 
                color: palette.text, 
                fontSize: Math.round(12 * factor)
              }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {it.label}
            </Text>
          </A11yPressable>
        ))}
      </GapView>
    </View>
  );
});
RecentPrompts.displayName = 'RecentPrompts';

const CopilotSuggestions = React.memo(() => {
  const [suggestions, setSuggestions] = React.useState<ProactiveSuggestion[]>([]);
  
  React.useEffect(() => {
    getActiveSuggestions().then(setSuggestions).catch(() => {});
  }, []);
  
  if (!suggestions.length) return null;
  
  return (
    <>
      {suggestions.map(suggestion => (
        <CopilotSuggestionBanner
          key={suggestion.id}
          suggestion={suggestion}
          onDismiss={() => {
            setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
          }}
          onAction={() => {
            // Navigate based on suggestion type
            // TODO: Implement navigation with router.push()
            logger.log('[CopilotSuggestions] Navigate to:', suggestion.type);
          }}
        />
      ))}
    </>
  );
});
CopilotSuggestions.displayName = 'CopilotSuggestions';

const BetaTestersQuickLink = React.memo(() => {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const { t } = useTranslation();
  const router = useRouter();
  
  return (
    <View 
      style={{ marginBottom: 12 }}
      accessibilityLabel={t('home.quick.betaChat.section', 'Beta testers section')}
      accessible={true}
    >
      <Text 
        style={{ 
          color: palette.text, 
          fontWeight: '700', 
          marginBottom: 6,
          fontSize: Math.round(16 * factor)
        }}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
        accessibilityRole="header"
      >
        {t('home.quick.betaChat.title','Beta Testers Chat')}
      </Text>
      <A11yPressable 
        accessibilityLabel={t('home.quick.betaChat.label','Join the Beta Testers Chat')} 
        accessibilityHint={t('home.quick.betaChat.hint', 'Opens the beta testers community chat')}
        style={{ 
          backgroundColor: palette.surface, 
          borderWidth: 1, 
          borderColor: palette.muted, 
          paddingHorizontal: 12, 
          paddingVertical: 10, 
          borderRadius: 8 
        }}
        hitSlop={HIT_SLOP_8}
        onPress={() => router.push('/(tabs)/community/testers-chat' as any)}
      >
        <Text 
          style={{ 
            color: palette.text,
            fontSize: Math.round(16 * factor)
          }}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
        >
          🧪 {t('home.quick.betaChat.cta','Join the Beta Testers Chat')}
        </Text>
      </A11yPressable>
    </View>
  );
});
BetaTestersQuickLink.displayName = 'BetaTestersQuickLink';

// Main home screen component (memoized for performance)
const HomeScreen = React.memo(() => {
  const { t } = useTranslation();
  const palette = useAppPalette();
  const textStyles = createTextStyles(palette);
  const { factor } = useTextScale();
  const titleRef = React.useRef<Text>(null);
  const { user } = useAuth();
  const { isFeatureVisible } = useComplexityMode();
  
  // Celebration state
  const [celebration, setCelebration] = React.useState<Celebration | null>(null);
  
  // Welcome modal for new users
  const [showWelcome, setShowWelcome] = React.useState(false);
  
  // Error state for debugging
  const [_renderError, setRenderError] = React.useState<Error | null>(null);
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  
  // Catch any errors during rendering (web only)
  React.useEffect(() => {
    // Only set up error listener on web platform
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      const handleError = (event: ErrorEvent) => {
        if (__DEV__) {
          console.error('[HomeScreen] Global error caught:', event.error);
        }
        setRenderError(event.error);
      };
      
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
    return undefined;
  }, []);
  
  // Check for celebrations on mount and periodically
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
    const interval = setInterval(checkForCelebrations, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);
  
  // Check if user is new (no onboarding started)
  React.useEffect(() => {
    const checkNewUser = async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const onboardingData = await AsyncStorage.getItem('onboarding:first7:v1');
        const disabilityProfile = await AsyncStorage.getItem('disabilityWizard:profile:v1');
        
        // Show welcome if no onboarding data exists
        if (!onboardingData && !disabilityProfile) {
          setShowWelcome(true);
        }
      } catch (error) {
        // If we can't check, assume they're not new
        logError('HomeScreen', 'Check new user', error as Error);
      }
    };
    
    // Delay check to avoid interfering with initial load
    const timer = setTimeout(checkNewUser, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  // Debug logging to track mount and re-renders (only on mount and unmount)
  React.useEffect(() => {
    logger.log('[HomeScreen] ===== COMPONENT MOUNTED =====');
    logger.log('[HomeScreen] User:', user?.uid || 'none');
    logger.log('[HomeScreen] Palette:', palette ? 'loaded' : 'missing');
    
    return () => {
      logger.log('[HomeScreen] ===== COMPONENT UNMOUNTED =====');
    };
  }, []);
  
  // Track palette and factor changes separately (dev only)
  React.useEffect(() => {
    if (__DEV__) {
      logger.log('[HomeScreen] Theme updated');
    }
  }, [palette]);
  
  React.useEffect(() => {
    if (__DEV__) {
      logger.log('[HomeScreen] TextScale updated:', factor);
    }
  }, [factor]);
  
  // Announce page load and focus title for screen readers
  useAnnounceOnMount(t('home.announcement', 'Home screen loaded. Beta features available.'));
  useFocusOnRefOnMount(titleRef);
  
  // Handler functions
  const handleCelebrationDismiss = async () => {
    if (celebration) {
      await markCelebrationSeen(celebration.id);
      setCelebration(null);
    }
  };
  
  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  // NOW SAFE TO HAVE CONDITIONAL RETURNS AFTER ALL HOOKS

  // RESTORED VERSION - Components fixed to use router.push instead of Link asChild
  const router = useRouter();
  
  return (
    <ResponsiveScreenWrapper testID="home-screen">
      {/* Welcome Modal for new users */}
      <WelcomeModal visible={showWelcome} onDismiss={handleWelcomeDismiss} router={router} />
      
      {/* Celebration Toast */}
      <SafeOptionalComponent>
        {celebration && (
          <CelebrationToast celebration={celebration} onDismiss={handleCelebrationDismiss} />
        )}
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
      <GuestModeBanner />

      {/* Simple Mode Welcome - shows when user is in Simple mode */}
      <SimpleModeWelcome 
        tabName="Home"
        availableFeatures={['Ask 3mpwr', 'Search', 'First 7 Days', 'SOS Button']}
        hiddenCount={10}
      />

      {/* Main Action Buttons */}
      <GapView style={{ flexDirection: 'row', marginBottom: 16 }} gap={12}>
        <A11yPressable
          onPress={() => router.push('/search')}
          style={[styles.searchButton, { backgroundColor: palette.surface, borderColor: palette.muted, flex: 1 }]}
          accessibilityLabel={t('home.search.label', 'Search the app')}
          hitSlop={HIT_SLOP_8}
        >
          <GapView style={{ flexDirection: 'row', alignItems: 'center' }} gap={10}>
            <Text style={{ fontSize: 20 }}>🔍</Text>
            <Text style={{ fontSize: Math.round(15 * factor), color: palette.muted, flexShrink: 1 }} numberOfLines={1}>
              {t('home.search.placeholder', 'Search...')}
            </Text>
          </GapView>
        </A11yPressable>

        <A11yPressable
          onPress={() => router.push('/(tabs)/advocacy/ask')}
          style={[styles.askButton, { backgroundColor: palette.primary, flex: 1 }]}
          accessibilityLabel={t('home.ask.label', 'Ask 3mpwr')}
          hitSlop={HIT_SLOP_8}
        >
          <Text style={[textStyles.button, { fontSize: Math.round(16 * factor) }]}>
            💬 {t('home.ask.button', 'Ask 3mpwr')}
          </Text>
        </A11yPressable>
      </GapView>

      {/* 7-Day Onboarding Wizard */}
      <A11yPressable
        onPress={() => router.push('/onboarding/first7')}
        style={[styles.wizardButton, { backgroundColor: palette.card, borderColor: palette.primary, borderWidth: 2 }]}
        accessibilityLabel={t('home.wizard.label', 'Your First 7 Days')}
        hitSlop={HIT_SLOP_8}
      >
        <GapView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} gap={8}>
          <Text style={{ fontSize: 24 }}>🧙‍♀️</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: Math.round(16 * factor), color: palette.text, fontWeight: '600' }}>
              {t('home.wizard.button', 'Your First 7 Days')}
            </Text>
            <Text style={[textStyles.caption, { fontSize: Math.round(12 * factor), color: palette.text, opacity: 0.7 }]}>
              {t('home.wizard.subtitle', 'Quick wins to get started')}
            </Text>
          </View>
        </GapView>
      </A11yPressable>

      {/* Revolutionary Features Spotlight - Standard+ only */}
      {isFeatureVisible('standard') && (
        <SafeOptionalComponent>
          <RevolutionaryFeaturesSpotlight />
        </SafeOptionalComponent>
      )}

      {/* Disability Wizard - Standard+ only */}
      {isFeatureVisible('standard') && (
        <SafeOptionalComponent>
          <DisabilityWizard maxSuggestions={3} showReasons={true} />
        </SafeOptionalComponent>
      )}

      {/* Home Guide - Standard+ only */}
      {isFeatureVisible('standard') && (
        <SafeOptionalComponent>
          <HomeGuide />
        </SafeOptionalComponent>
      )}

      {/* Recent Prompts - Power User only */}
      {isFeatureVisible('power_user') && <RecentPrompts />}
      
      {/* Beta Testers Chat - Standard+ only */}
      {isFeatureVisible('standard') && <BetaTestersQuickLink />}

      {/* SOS Button */}
      <SafeOptionalComponent>
        <SOSButton />
      </SafeOptionalComponent>

      <Text style={[textStyles.caption, { opacity: 0.7, marginTop: 12 }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
        {t('home.personalization.note', 'Suggestions powered by the Disability Wizard (beta).')}
      </Text>
    </ResponsiveScreenWrapper>
  );
});
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;

const styles = StyleSheet.create({
  searchButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    minHeight: 50,
    justifyContent: 'center',
  },
  askButton: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  wizardButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
});