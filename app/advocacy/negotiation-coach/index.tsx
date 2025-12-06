/**
 * Negotiation Coach
 * 
 * Step-by-step wizard for workplace accommodation negotiations
 */

/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import { HIT_SLOP_12, MAX_FONT_SCALE } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import {
    addLiveNote,
    generateFollowUpEmail,
    getScriptTemplates,
    startSession,
    type NegotiationSession
} from '../../../services/negotiationCoach';
import { useAppPalette } from '../../../theme/usePalette';

export default function NegotiationCoach() {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [step, setStep] = useState<'setup' | 'coach' | 'debrief'>('setup');
  const [session, setSession] = useState<NegotiationSession | null>(null);

  // Setup state
  const [meetingType, setMeetingType] = useState<NegotiationSession['type']>('accommodation-request');
  const [meetingDate, setMeetingDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [notes, setNotes] = useState('');

  // Coach state
  const [selectedScript, setSelectedScript] = useState<string | null>(null);
  const [redFlags, setRedFlags] = useState<string[]>([]);

  // Debrief state
  const [outcome, setOutcome] = useState<'agreed' | 'partial' | 'denied' | 'deferred'>('agreed');
  const [outcomeNotes, setOutcomeNotes] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [followUpEmail, setFollowUpEmail] = useState('');

  const handleStartSession = async () => {
    // startSession requires type, employer, accommodationsRequested
    const employer = 'Employer';
    const accommodations = [] as string[];
    const newSession = await startSession(meetingType, employer, accommodations);
    setSession(newSession);
    setStep('coach');
  };

  const handleSelectScript = (scriptKey: string) => {
    setSelectedScript(scriptKey);
  };

  const handleTrackRedFlag = async (flag: string) => {
    if (!session) return;
    await addLiveNote(session.id, 'red-flag', flag);
    setRedFlags([...redFlags, flag]);
  };

  const handleGenerateEmail = async () => {
    if (!session) return;
    setGeneratingEmail(true);
    try {
      // Use current session snapshot to generate the email
      const email = await generateFollowUpEmail(session);
      setFollowUpEmail(email);
    } catch (error) {
      console.error('Failed to generate email:', error);
    } finally {
      setGeneratingEmail(false);
    }
  };

  const getMeetingTypeIcon = (type: NegotiationSession['type']) => {
    switch (type) {
      case 'accommodation-request': return 'briefcase';
      case 'appeal-hearing': return 'podium';
      case 'disability-disclosure': return 'information-circle';
      case 'performance-review': return 'stats-chart';
      default: return 'document-text';
    }
  };
  const scriptTemplates = getScriptTemplates();

  // Setup Step
  if (step === 'setup') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="school" size={32} color={palette.primary} />
            <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Negotiation Coach
            </Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Prepare for your workplace meeting with guidance and scripts
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Meeting Type
            </Text>
            <View style={styles.typeGrid}>
              {(['accommodation-request', 'appeal-hearing', 'disability-disclosure', 'performance-review'] as NegotiationSession['type'][]).map((type) => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeCard,
                    { backgroundColor: meetingType === type ? palette.primary : palette.background, borderColor: palette.muted }
                  ]}
                  onPress={() => setMeetingType(type)}
                  hitSlop={HIT_SLOP_12}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: meetingType === type }}
                >
                  <Ionicons
                    name={getMeetingTypeIcon(type) as any}
                    size={24}
                    color={meetingType === type ? palette.onPrimary : palette.textSecondary}
                  />
                  <Text
                    style={[styles.typeText, { color: meetingType === type ? palette.onPrimary : palette.text }]}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Meeting Date (Optional)
            </Text>
            <TextInput
              style={[styles.input, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
              value={meetingDate}
              onChangeText={setMeetingDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.textSecondary}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Participants (Optional)
            </Text>
            <TextInput
              style={[styles.input, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
              value={participants}
              onChangeText={setParticipants}
              placeholder="Manager, HR Rep, etc. (comma-separated)"
              placeholderTextColor={palette.textSecondary}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Notes
            </Text>
            <TextInput
              style={[styles.textArea, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any specific concerns or goals for this meeting..."
              placeholderTextColor={palette.textSecondary}
              multiline
              numberOfLines={4}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            />
          </View>

          <Pressable
            style={[styles.startButton, { backgroundColor: palette.primary }]}
            onPress={handleStartSession}
            hitSlop={HIT_SLOP_12}
            accessibilityRole="button"
            accessibilityLabel="Start coaching session"
          >
            <Text style={[styles.startButtonText, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Start Session
            </Text>
            <Ionicons name="arrow-forward" size={20} color={palette.onPrimary} />
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  // Coach Step
  if (step === 'coach') {
    return (
      <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={styles.content}>
          <View style={styles.coachHeader}>
            <Pressable onPress={() => setStep('setup')} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
              <Ionicons name="arrow-back" size={24} color={palette.text} />
            </Pressable>
            <Text style={[styles.coachTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Live Coaching
            </Text>
            <Pressable onPress={() => setStep('debrief')} accessibilityRole="button" accessibilityLabel="End session" hitSlop={8}>
              <Text style={[styles.doneText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Done
              </Text>
            </Pressable>
          </View>

          <View style={[styles.infoCard, { backgroundColor: palette.surface }]}>
            <Ionicons name="information-circle" size={20} color={palette.primary} />
            <Text style={[styles.infoText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Use these scripts and tips during your meeting. Track any red flags you notice.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Script Templates
            </Text>
            {(Object.entries(scriptTemplates) as Array<[string, string]>).map(([key, template]) => (
              <Pressable
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                key={key}
                style={[
                  styles.scriptCard,
                  { backgroundColor: selectedScript === key ? palette.background : 'transparent', borderColor: palette.muted }
                ]}
                onPress={() => handleSelectScript(key)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${key} script`}
              >
                <View style={styles.scriptHeader}>
                  <Text style={[styles.scriptTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {key.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </Text>
                  <Ionicons
                    name={selectedScript === key ? 'checkmark-circle' : 'chevron-down'}
                    size={20}
                    color={selectedScript === key ? palette.primary : palette.textSecondary}
                  />
                </View>
                {selectedScript === key && (
                  <Text style={[styles.scriptContent, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {template}
                  </Text>
                )}
              </Pressable>
            ))}
          </View>

          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Red Flags Detected
            </Text>
            {redFlags.length > 0 ? (
              redFlags.map((flag, index) => (
                <View key={index} style={[styles.redFlagCard, { borderColor: palette.error || '#991B1B' }]}>
                  <Ionicons name="warning" size={20} color={palette.error || '#991B1B'} />
                  <Text style={[styles.redFlagText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    {flag}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                No red flags yet. Tap below if you notice concerning behavior.
              </Text>
            )}
            <View style={styles.redFlagButtons}>
              <Pressable
                style={[styles.redFlagButton, { borderColor: palette.error || '#991B1B' }]}
                onPress={() => handleTrackRedFlag('Dismissive language about disability')}
                hitSlop={HIT_SLOP_12}
                accessibilityRole="button"
                accessibilityLabel="Mark as dismissive behavior"
              >
                <Text style={[styles.redFlagButtonText, { color: palette.error || '#991B1B' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Dismissive
                </Text>
              </Pressable>
              <Pressable
                style={[styles.redFlagButton, { borderColor: palette.error || '#991B1B' }]}
                onPress={() => handleTrackRedFlag('Threat of retaliation')}
                hitSlop={HIT_SLOP_12}
                accessibilityRole="button"
                accessibilityLabel="Mark as threatening behavior"
              >
                <Text style={[styles.redFlagButtonText, { color: palette.error || '#991B1B' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Threatening
                </Text>
              </Pressable>
              <Pressable
                style={[styles.redFlagButton, { borderColor: palette.error || '#991B1B' }]}
                onPress={() => handleTrackRedFlag('Denying legal rights')}
                hitSlop={HIT_SLOP_12}
                accessibilityRole="button"
                accessibilityLabel="Mark as rights denied"
              >
                <Text style={[styles.redFlagButtonText, { color: palette.error || '#991B1B' }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Rights Denied
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Debrief Step
  return (
    <ScrollView style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={32} color={palette.primary} />
          <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Session Complete
          </Text>
          <Text style={[styles.subtitle, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Document the outcome and generate a follow-up email
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Meeting Outcome
          </Text>
          <View style={styles.outcomeGrid}>
            {(['agreed', 'partial', 'denied', 'deferred'] as const).map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.outcomeCard,
                  { backgroundColor: outcome === opt ? palette.primary : palette.background, borderColor: palette.muted }
                ]}
                onPress={() => setOutcome(opt)}
                hitSlop={HIT_SLOP_12}
                accessibilityRole="radio"
                accessibilityState={{ checked: outcome === opt }}
              >
                <Text
                  style={[styles.outcomeText, { color: outcome === opt ? palette.onPrimary : palette.text }]}
                  maxFontSizeMultiplier={MAX_FONT_SCALE}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: palette.surface }]}>
          <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Outcome Notes
          </Text>
          <TextInput
            style={[styles.textArea, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
            value={outcomeNotes}
            onChangeText={setOutcomeNotes}
            placeholder="What was agreed upon? Next steps?"
            placeholderTextColor={palette.textSecondary}
            multiline
            numberOfLines={6}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          />
        </View>

        <Pressable
          style={[styles.emailButton, { backgroundColor: palette.primary }]}
          onPress={handleGenerateEmail}
          disabled={generatingEmail || !outcomeNotes.trim()}
          hitSlop={HIT_SLOP_12}
          accessibilityRole="button"
          accessibilityLabel="Generate follow-up email"
        >
          {generatingEmail ? (
            <ActivityIndicator color={palette.onPrimary} />
          ) : (
            <>
              <Ionicons name="mail" size={20} color={palette.onPrimary} />
              <Text style={[styles.emailButtonText, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Generate Follow-Up Email
              </Text>
            </>
          )}
        </Pressable>

        {followUpEmail && (
          <View style={[styles.section, { backgroundColor: palette.surface }]}>
            <Text style={[styles.sectionTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Generated Email
            </Text>
            <View style={[styles.emailPreview, { backgroundColor: palette.background, borderColor: palette.muted }]}>
              <Text style={[styles.emailText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                {followUpEmail}
              </Text>
            </View>
            <Pressable
              style={[styles.copyButton, { borderColor: palette.primary }]}
              onPress={() => console.warn('Copy email not yet implemented')}
              hitSlop={HIT_SLOP_12}
              accessibilityRole="button"
              accessibilityLabel="Copy email to clipboard"
            >
              <Ionicons name="copy-outline" size={16} color={palette.primary} />
              <Text style={[styles.copyButtonText, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Copy Email
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          style={[styles.doneButton, { backgroundColor: palette.muted }]}
          onPress={() => router.back()}
          hitSlop={HIT_SLOP_12}
          accessibilityRole="button"
          accessibilityLabel="Close session"
        >
          <Text style={[styles.doneButtonText, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Done
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: '48%',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  coachTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  doneText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    flex: 1,
  },
  scriptCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scriptTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  scriptContent: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  redFlagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    marginBottom: 8,
  },
  redFlagText: {
    fontSize: 12,
    flex: 1,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  redFlagButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  redFlagButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  redFlagButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
  outcomeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  outcomeCard: {
    flexBasis: '48%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  outcomeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emailPreview: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  emailText: {
    fontSize: 12,
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  doneButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
