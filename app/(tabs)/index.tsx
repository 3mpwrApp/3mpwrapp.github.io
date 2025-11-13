import { Link } from 'expo-router';
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
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../hooks/useA11y';
import { useTranslation } from '../../i18n';
import type { Celebration } from '../../services/celebrations';
import { checkCelebrations, markCelebrationSeen } from '../../services/celebrations';
import { getActiveSuggestions, type ProactiveSuggestion } from '../../services/copilotProactive';
import { useTextScale } from '../../theme/typography';
import { createTextStyles } from '../../theme/typography.enhanced';
import { useAppPalette } from '../../theme/usePalette';
import { logError } from '../../utils/errorLogger';
import { logger } from '../../utils/logger';

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
  const [items, setItems] = React.useState<{ label: string; route?: string; ts: number }[]>([]);
  
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
          <Link key={it.label} href={(it.route as any) || '/(tabs)/advocacy/assistant-hub'} asChild={true}>
            <A11yPressable
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
          </Link>
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
      <Link href={'/(tabs)/community/testers-chat' as any} asChild={true}>
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
      </Link>
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
  
  // Celebration state
  const [celebration, setCelebration] = React.useState<Celebration | null>(null);
  
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
  
  const handleCelebrationDismiss = async () => {
    if (celebration) {
      await markCelebrationSeen(celebration.id);
      setCelebration(null);
    }
  };
  
  // Debug logging to track mount and re-renders (only on mount and unmount)
  React.useEffect(() => {
    logger.log('[HomeScreen] Mounted successfully');
    return () => logger.log('[HomeScreen] Unmounted');
  }, []);
  
  // Track palette and factor changes separately
  React.useEffect(() => {
    logger.log('[HomeScreen] Theme changed - Palette:', palette);
  }, [palette]);
  
  React.useEffect(() => {
    logger.log('[HomeScreen] TextScale changed - factor:', factor);
  }, [factor]);
  
  // Announce page load and focus title for screen readers
  useAnnounceOnMount(t('home.announcement', 'Home screen loaded. Beta features available.'));
  useFocusOnRefOnMount(titleRef);
  
  // Error handling is done by ErrorBoundaryWrapper and SafeOptionalComponent
  
  return (
    <ResponsiveScreenWrapper 
      testID="home-screen"
    >
      {/* Celebration Toast */}
      <CelebrationToast 
        celebration={celebration}
        onDismiss={handleCelebrationDismiss}
      />
      
      <Text 
        ref={titleRef}
        accessibilityRole="header" 
        style={[textStyles.h3, { marginBottom: 16 }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.title','Home')} <Text style={[textStyles.bodySmall, { opacity: 0.8 }]}>(Beta)</Text>
      </Text>
      
      <DisclaimerBanner type="general" compact={true} />
      
      {/* AI Co-Pilot Proactive Suggestions */}
      <SafeOptionalComponent>
        <CopilotSuggestions />
      </SafeOptionalComponent>
      
      {/* Ask 3mpwr - Quick Access to Ask an Advocate */}
      <Link href={'/(tabs)/advocacy/ask' as any} asChild={true}>
        <A11yPressable
          style={[
            styles.askButton,
            { backgroundColor: palette.primary }
          ]}
          accessibilityLabel={t('home.ask.label', 'Ask 3mpwr - Get help from advocates')}
          accessibilityHint={t('home.ask.hint', 'Opens the Ask an Advocate form')}
          hitSlop={HIT_SLOP_8}
        >
          <Text
            style={[
              textStyles.button,
              { fontSize: Math.round(16 * factor) }
            ]}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            💬 {t('home.ask.button', 'Ask 3mpwr')}
          </Text>
        </A11yPressable>
      </Link>
      
      {/* 7-Day Onboarding Wizard - Quick Access */}
      <Link href={'/onboarding/first7' as any} asChild={true}>
        <A11yPressable
          style={[
            styles.wizardButton,
            { backgroundColor: palette.card, borderColor: palette.primary, borderWidth: 2 }
          ]}
          accessibilityLabel={t('home.wizard.label', 'Your First 7 Days - Onboarding wizard')}
          accessibilityHint={t('home.wizard.hint', 'Opens interactive onboarding checklist')}
          hitSlop={HIT_SLOP_8}
        >
          <GapView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} gap={8}>
            <Text style={{ fontSize: 24 }}>🧙‍♀️</Text>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  { fontSize: Math.round(16 * factor), color: palette.text, fontWeight: '600' }
                ]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('home.wizard.button', 'Your First 7 Days')}
              </Text>
              <Text
                style={[
                  textStyles.caption,
                  { fontSize: Math.round(12 * factor), color: palette.text, opacity: 0.7 }
                ]}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              >
                {t('home.wizard.subtitle', 'Quick wins to get started')}
              </Text>
            </View>
          </GapView>
        </A11yPressable>
      </Link>
      
      {/* Disability Wizard - Personalized Recommendations (optional feature) */}
      <SafeOptionalComponent>
        <DisabilityWizard 
          maxSuggestions={3}
          title={t('wizard.homeTitle', 'Recommended For You')}
          subtitle={t('wizard.homeSubtitle', 'Based on your needs and energy level')}
          showReasons={true}
        />
      </SafeOptionalComponent>
      
      <RecentPrompts />
      <BetaTestersQuickLink />
      
      {/* Home Guide - optional feature */}
      <SafeOptionalComponent>
        <HomeGuide />
      </SafeOptionalComponent>
      
      <Text 
        style={[textStyles.caption, { opacity: 0.7, marginTop: 12 }]}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('home.personalization.note','Suggestions powered by the Disability Wizard (beta).')}
      </Text>
    </ResponsiveScreenWrapper>
  );
});
HomeScreen.displayName = 'HomeScreen';

export default HomeScreen;

const styles = StyleSheet.create({
  askButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Accessibility tap target
  },
  wizardButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60, // Slightly taller for the two-line content
  },
});