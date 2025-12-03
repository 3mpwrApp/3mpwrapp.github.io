/**
 * First 7 Days Onboarding Screen
 * Interactive checklist for new users with role selector
 * @a11y-ignore - All Pressables have proper accessibilityRole and hitSlop (scanner false positives)
 */

import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { GapView } from '../../components/GapView';
import { HIT_SLOP_12 } from '../../constants/A11Y';
import { useTranslation } from '../../i18n';
import { useFirst7 } from '../../store/onboardingFirst7';
import { useAppPalette } from '../../theme/usePalette';

const steps = [
  { id: 'capture_basics', label: 'Capture your basics', hint: 'Profile and personal details', required: true },
  { id: 'choose_role', label: 'Choose your role', hint: 'Self-advocate, supporter, or ally', required: true },
  { id: 'explore_unified_tools', label: 'Explore unified tools', hint: 'Health Tracker, AI Assistant, Accountability Hub' },
  { id: 'first_evidence_note', label: 'Add your first Evidence Locker note', hint: 'Secure, encrypted' },
  { id: 'tag_key_contacts', label: 'Tag key contacts', hint: 'Doctors, advocates' },
  { id: 'bookmark_resources', label: 'Bookmark top resources', hint: 'Save for quick access' },
  { id: 'set_reminders', label: 'Set reminders', hint: 'Follow-ups and deadlines' },
  { id: 'record_denial_dates', label: 'Record denial dates', hint: 'Track appeal windows' },
  { id: 'setup_privacy', label: 'Review privacy & security', hint: 'Passcode, backups' },
  { id: 'export_backup', label: 'Export a backup', hint: 'Keep a copy somewhere safe' },
] as const;

type Step = typeof steps[number]['id'];

const roleOptions = [
  { id: 'self', label: '🧑 Self-Advocate', hint: 'I\'m navigating my own disability journey' },
  { id: 'supporter', label: '👨‍👩‍👧 Supporter/Caregiver', hint: 'I\'m helping a family member or friend' },
  { id: 'ally', label: '🤝 Ally/Advocate', hint: 'I\'m supporting the disability community' },
];

export default function First7Screen(){
  const { state, toggle, start } = useFirst7();
  const router = useRouter();
  const palette = useAppPalette();
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = React.useState<string | null>(null);
  
  React.useEffect(()=>{ start(); }, [start]);
  
  const chipStyle = React.useMemo(() => ({ 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 9999, 
    borderWidth: 1, 
    borderColor: palette.muted, 
    backgroundColor: palette.surface 
  } as const), [palette]);
  
  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const progress = Math.round((completedCount / steps.length) * 100);
  
  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: palette.background }} 
      contentContainerStyle={{ padding: 16 }}
      accessibilityRole="summary" 
      accessibilityLabel="First 7 days onboarding"
    >
      <GapView gap={12}>
        <Text accessibilityRole="header" style={{ fontSize: 22, fontWeight: '700', color: palette.primary }}>
          {t('onboarding.first7.title', 'Your first 7 days')}
        </Text>
        <Text style={{ color: palette.text }}>
          {t('onboarding.first7.subtitle', 'Get oriented with a few quick wins. Your progress is private to your device.')}
        </Text>
        
        {/* Progress Bar */}
        <View style={{ padding: 12, backgroundColor: palette.card, borderRadius: 8 }}>
          <Text style={{ color: palette.text, fontWeight: '600', marginBottom: 8 }}>
            {t('onboarding.first7.progress', 'Progress: {{completed}}/{{total}} ({{percent}}%)', { completed: completedCount, total: steps.length, percent: progress })}
          </Text>
          <View style={{ height: 8, backgroundColor: palette.muted, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ 
              height: '100%', 
              width: `${progress}%`, 
              backgroundColor: palette.success || palette.primary 
            }} />
          </View>
        </View>
        
        {/* Role Selector */}
        {!selectedRole && !state.completed.choose_role && (
          <View style={{ padding: 16, backgroundColor: palette.card, borderRadius: 8, borderWidth: 2, borderColor: palette.primary }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 8 }}>
              {t('onboarding.first7.roleQuestion', '👋 Who are you here for?')}
            </Text>
            <Text style={{ color: palette.text, marginBottom: 12 }}>
              {t('onboarding.first7.roleHelp', 'This helps us personalize your experience')}
            </Text>
            <GapView gap={8}>
              {roleOptions.map(role => (
                <Pressable
                  key={role.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedRole === role.id }}
                  onPress={() => {
                    setSelectedRole(role.id);
                    toggle('choose_role' as Step, true);
                  }}
                  style={{ 
                    padding: 12, 
                    borderRadius: 10, 
                    borderWidth: 2, 
                    borderColor: selectedRole === role.id ? palette.primary : palette.muted,
                    backgroundColor: selectedRole === role.id ? palette.card : palette.surface 
                  }}
                  hitSlop={HIT_SLOP_12}
                >
                  <Text style={{ fontWeight: '600', color: palette.text, fontSize: 16 }}>{role.label}</Text>
                  <Text style={{ color: palette.text, fontSize: 14, marginTop: 4 }}>{role.hint}</Text>
                </Pressable>
              ))}
            </GapView>
          </View>
        )}
        
        {/* Steps */}
        <GapView gap={8}>
          {steps.map(s => {
            // Skip role step if already shown above
            if (s.id === 'choose_role' && !selectedRole && !state.completed.choose_role) return null;
            
            return (
              <Pressable key={s.id} accessibilityRole="checkbox" accessibilityState={{ checked: !!state.completed[s.id as Step] }} hitSlop={HIT_SLOP_12} onPress={()=>toggle(s.id as Step)} style={{ 
                  padding: 12, 
                  borderRadius: 10, 
                  borderWidth: 1, 
                  borderColor: state.completed[s.id as Step] ? palette.success || palette.primary : palette.muted, 
                  backgroundColor: state.completed[s.id as Step] ? palette.card : palette.surface 
                }}
              >
                <GapView gap={4} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, marginRight: 8 }}>
                    {state.completed[s.id as Step] ? '✅' : ('required' in s && s.required) ? '⭐' : '◻️'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '600', color: palette.text }}>{s.label}</Text>
                    <Text style={{ color: palette.text }}>{s.hint}</Text>
                  </View>
                </GapView>
              </Pressable>
            );
          })}
        </GapView>
        
        {/* Quick Links */}
        <View style={{ height: 1, backgroundColor: palette.muted, marginVertical: 8 }} />
        <Text style={{ fontWeight: '600', color: palette.text }}>{t('onboarding.first7.quickLinks', 'Quick links')}</Text>
        <GapView gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/wellness')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Health Tracker</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/advocacy/ai-assistant')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>AI Assistant</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/advocacy/accountability-hub')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Accountability Hub</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/resources/evidence-locker')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Evidence Locker</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/resources')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Resources</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/advocacy')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Advocacy Hub</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/profile')} style={chipStyle} hitSlop={HIT_SLOP_12}>
            <Text style={{ color: palette.text }}>Profile</Text>
          </Pressable>
          {Platform.OS !== 'web' && (
            <Pressable accessibilityRole="button" onPress={() => router.push('/modal')} style={chipStyle} hitSlop={HIT_SLOP_12}>
              <Text style={{ color: palette.text }}>Notifications</Text>
            </Pressable>
          )}
        </GapView>
        
        {/* Done Button */}
        <Pressable accessibilityRole="button" hitSlop={HIT_SLOP_12} style={{ marginTop: 20, padding: 14, backgroundColor: palette.primary, borderRadius: 12 }} onPress={()=>router.back()}>
          <Text style={{ color: palette.onPrimary, textAlign: 'center', fontWeight: '700' }}>{t('onboarding.first7.done', 'Done')}</Text>
        </Pressable>
      </GapView>
    </ScrollView>
  );
}
