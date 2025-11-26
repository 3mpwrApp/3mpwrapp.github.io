import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import DisclaimerBanner from "../../../components/DisclaimerBanner";
import GapView from "../../../components/GapView";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { useJurisdiction } from "../../../store/jurisdiction";
import { useAppPalette } from "../../../theme/usePalette";
import { announce } from '../../../utils/announce';

type Answer = "yes" | "no" | null;

export const options = { href: null };

export default function RightsChecker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t } = useTranslation();
  const { data: jurisdictionData } = useJurisdiction();
  useAnnounceOnMount("Automated Rights Checker");
  useFocusOnRefOnMount(titleRef);
  const [showInfo, setShowInfo] = React.useState(true);

  const [q1, setQ1] = React.useState<Answer>(null); // employed
  const [q2, setQ2] = React.useState<Answer>(null); // union
  const [q3, setQ3] = React.useState<Answer>(null); // disability
  const [q4, setQ4] = React.useState<Answer>(null); // denied benefits
  const [q5, setQ5] = React.useState<Answer>(null); // harassment
  const [q6, setQ6] = React.useState<Answer>(null); // fired/disciplined
  const [q7, setQ7] = React.useState<Answer>(null); // accommodation requested
  const [q8, setQ8] = React.useState<Answer>(null); // workplace injury

  const ready = [q1, q2, q3, q4, q5, q6, q7, q8].every((x) => x !== null);

  // Count answered to show progress
  const answeredCount = [q1, q2, q3, q4, q5, q6, q7, q8].filter(x => x !== null).length;

  const summary = React.useMemo(() => {
    if (!ready) return null;
    const lines: string[] = [];
    const rights: string[] = [];
    const actions: string[] = [];
    
    // Human Rights Protection
    if (q3 === "yes") {
      rights.push('✅ Protected under human rights law (duty to accommodate)');
      lines.push(
        t('rightsChecker.protected','You are protected under human rights law, including the duty to accommodate.')
      );
      if (q7 === "yes") {
        actions.push('📋 Your accommodation request triggers legal duty - employer must explore options to point of undue hardship');
      } else if (q7 === "no") {
        actions.push('✍️ RECOMMENDED: Submit formal written accommodation request to trigger legal protections');
      }
    }
    
    // Workplace Rights
    if (q1 === "yes") {
      rights.push('✅ Workplace safety rights & protection from discrimination');
      lines.push(
        t('rightsChecker.workplaceRights','You have workplace rights: safety, accommodation, and protection from discrimination.')
      );
      
      // Union support
      if (q2 === "yes") {
        rights.push('✅ Union representation available');
        lines.push(t('rightsChecker.union','Contact your union for representation.'));
        if (q6 === "yes") {
          actions.push('📞 URGENT: Contact union rep immediately about discipline/termination - file grievance before deadline');
        }
      } else {
        lines.push(
          t('rightsChecker.noUnion','If no union, consider contacting a legal clinic or advocacy group.')
        );
        if (q6 === "yes") {
          actions.push('⚖️ No union: Seek legal advice immediately - may have wrongful dismissal or human rights claim');
        }
      }
      
      // Termination/discipline rights
      if (q6 === "yes") {
        rights.push('⚠️ Termination/discipline rights active');
        actions.push('📄 Request written reasons for termination/discipline');
        actions.push('💼 Obtain copy of personnel file and any investigation records');
        if (q3 === "yes") {
          actions.push('🚩 Discipline after accommodation request may be reprisal - consult human rights lawyer');
        }
      }
    }
    
    // Workplace Injury
    if (q8 === "yes") {
      rights.push('✅ Workers compensation rights');
      actions.push('📋 File WSIB claim immediately if not done (injury must be reported)');
      actions.push('🩺 Get all medical documentation from treating doctors');
      actions.push('📝 Document how injury occurred and any witnesses');
      if (q4 === "yes") {
        actions.push('⚖️ WSIB denial can be appealed - usually 6 month deadline from decision');
      }
    }
    
    // Benefits Appeal Rights
    if (q4 === "yes") {
      rights.push('✅ Right to appeal denied benefits');
      lines.push(
        t('rightsChecker.appeal','You may be eligible to appeal denied benefits. Gather medical evidence and file within deadlines.')
      );
      
      // Add jurisdiction-specific deadline warnings
      if (jurisdictionData) {
        const deadlines: string[] = [];
        
        // Workplace injury appeal deadlines
        if (jurisdictionData.workplaceInjury?.appealLevels) {
          const levels = jurisdictionData.workplaceInjury.appealLevels;
          const firstLevel = levels[0];
          if (firstLevel && firstLevel.typicalDeadlineDays) {
            deadlines.push(
              t('rightsChecker.workplaceDeadline', 
                `⚠️ DEADLINE: ${jurisdictionData.workplaceInjury.name} - File within ${firstLevel.typicalDeadlineDays} days for most decisions.`,
                { board: jurisdictionData.workplaceInjury.name, days: firstLevel.typicalDeadlineDays.toString() }
              )
            );
            actions.push(`🚨 Appeal deadline: ${firstLevel.typicalDeadlineDays} days from denial date`);
          } else if (firstLevel?.notes) {
            deadlines.push(
              t('rightsChecker.workplaceNotes',
                `⚠️ ${jurisdictionData.workplaceInjury.name}: ${firstLevel.notes}`,
                { board: jurisdictionData.workplaceInjury.name, notes: firstLevel.notes }
              )
            );
          }
        }
        
        // Human rights complaint deadlines
        if (jurisdictionData.humanRights?.complaintDeadlineMonths && q5 === "yes") {
          deadlines.push(
            t('rightsChecker.humanRightsDeadline',
              `⚠️ DEADLINE: ${jurisdictionData.humanRights.name} - File complaint within ${jurisdictionData.humanRights.complaintDeadlineMonths} months from last incident.`,
              { body: jurisdictionData.humanRights.name, months: jurisdictionData.humanRights.complaintDeadlineMonths.toString() }
            )
          );
          actions.push(`📅 Human rights complaint: ${jurisdictionData.humanRights.complaintDeadlineMonths} month deadline from last incident`);
        }
        
        // Add limitation notes
        if (jurisdictionData.limitationNotes && jurisdictionData.limitationNotes.length > 0) {
          deadlines.push(
            t('rightsChecker.limitationNotes',
              `📌 Note: ${jurisdictionData.limitationNotes.join(' ')}`,
              { notes: jurisdictionData.limitationNotes.join(' ') }
            )
          );
        }
        
        if (deadlines.length > 0) {
          lines.push(deadlines.join('\n\n'));
        }
      }
      
      actions.push('📋 Request complete claim file from insurer/board');
      actions.push('🔍 Use Denial Decoder tool to analyze denial reasons');
      actions.push('✍️ Use Appeal Coach to build step-by-step appeal');
      lines.push(
        t('rightsChecker.templates','Use our letter templates in Resources to request reconsideration or appeal.')
      );
    }
    
    // Harassment/Discrimination
    if (q5 === "yes") {
      rights.push('✅ Protection from harassment & discrimination');
      lines.push(
        t('rightsChecker.harassment','Harassment is prohibited. Document incidents and report via proper channels.')
      );
      actions.push('📝 Document all incidents: date, time, witnesses, what happened');
      actions.push('📧 Keep copies of all emails, texts, and communications');
      if (q1 === "yes") {
        actions.push('📢 Report to HR/management in writing (creates paper trail)');
        if (q2 === "yes") {
          actions.push('🤝 File union grievance if harassment violates collective agreement');
        }
      }
      actions.push('📞 Consider filing human rights complaint if employer doesn\'t address it');
    }
    
    // No issues identified
    if (lines.length === 0) {
      lines.push(
        t('rightsChecker.general','Based on your answers, you still maintain general human rights. Consider browsing Resources for guidance.')
      );
    }
    
    return { text: lines.join("\n\n"), rights, actions };
  }, [ready, q1, q2, q3, q4, q5, q6, q7, q8, jurisdictionData]);

  React.useEffect(()=>{ if(summary) announce(t('rightsChecker.summaryReady','Rights summary ready')); }, [summary, t]);

  const Choice = ({ label, value, selected, onPress }: { label: string; value: Answer; selected: Answer; onPress: () => void }) => (
    <A11yPressable
      hitSlop={HIT_SLOP_8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('rightsChecker.choiceLabel', `${label} answer option`)}
      accessibilityState={{ selected: selected === value }}
      style={[styles.choice, selected === value && styles.choiceActive]}
    >
      <MaterialCommunityIcons 
        name={selected === value ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'} 
        size={20} 
        color={selected === value ? palette.onPrimary : palette.text} 
      />
      <Text style={[styles.choiceText, selected === value && styles.choiceTextActive]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
    </A11yPressable>
  );

  const reset = () => {
    setQ1(null); setQ2(null); setQ3(null); setQ4(null); setQ5(null); setQ6(null); setQ7(null); setQ8(null);
    announce(t('rightsChecker.resetAnnounce','Answers cleared'));
  };

  const copySummary = async () => {
    if(!summary) return;
    try { const mod = await import('expo-clipboard'); await mod.setStringAsync(summary.text); Alert.alert(t('rightsChecker.copied','Copied'), t('rightsChecker.copiedBody','Summary copied to clipboard.')); }
    catch { Alert.alert(t('rightsChecker.clipboardMissingTitle','Clipboard not available'), t('rightsChecker.clipboardMissingMsg','Install expo-clipboard in a dev build to enable copy.')); }
  };

  const exportSummary = async () => {
    if(!summary) return;
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      const fullText = `YOUR RIGHTS SUMMARY\n\n${summary.rights.join('\n')}\n\nRECOMMENDED ACTIONS\n\n${summary.actions.join('\n')}\n\nDETAILS\n\n${summary.text}`;
      const path = FS.cacheDirectory + `rights_summary_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, fullText);
      if(await Share.isAvailableAsync()) await Share.shareAsync(path); else Alert.alert(t('rightsChecker.shareUnavailable','Share unavailable'), t('rightsChecker.shareUnavailableBody','System share sheet not available.'));
    } catch { Alert.alert(t('rightsChecker.shareError','Share failed'), t('rightsChecker.shareErrorBody','Could not share summary file.')); }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding:16 }} accessibilityLabel={t('rightsChecker.screenLabel','Automated Rights Checker screen')}>
      <View style={styles.infoCard} accessibilityRole="summary" accessibilityLabel={t('rightsChecker.howToUse','How to use Rights Checker')}>
        <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setShowInfo(s=>!s)} accessibilityRole="button" accessibilityLabel={t('rightsChecker.toggleInfo', showInfo? 'Hide instructions':'Show instructions')} style={styles.infoHeader}>
          <Text style={styles.infoTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.infoTitle','How to Use')}</Text>
          <Text style={styles.infoToggle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{showInfo? t('rightsChecker.hide','Hide'): t('rightsChecker.show','Show')}</Text>
        </A11yPressable>
        {showInfo && (
          <View>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.infoLine1','Answer each question. A plain-language summary appears when all are answered.')}</Text>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.infoLine2','Use Copy to reuse the summary, Export to generate a text file, and Reset to clear answers.')}</Text>
            <Text style={styles.infoText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.infoLine3','This tool does not give legal advice; consult official sources.')}</Text>
          </View>
        )}
        <GapView style={styles.actionRow} gap={8}>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={reset} accessibilityRole="button" accessibilityLabel={t('rightsChecker.resetAnswers','Reset answers')} accessibilityHint={t('rightsChecker.resetHint','Clears all selected answers.')} style={[styles.smallBtn,{ backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }]}>
            <Text style={[styles.smallBtnText,{ color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.reset','Reset')}</Text>
          </A11yPressable>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={copySummary} disabled={!summary} accessibilityRole="button" accessibilityLabel={t('rightsChecker.copySummary','Copy rights summary')} accessibilityHint={t('rightsChecker.copySummaryHint','Copies the current rights summary to the clipboard.')} style={[styles.smallBtn,{ opacity: summary?1:0.5 }]}>
            <Text style={styles.smallBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.copy','Copy')}</Text>
          </A11yPressable>
          <A11yPressable hitSlop={HIT_SLOP_8} onPress={exportSummary} disabled={!summary} accessibilityRole="button" accessibilityLabel={t('rightsChecker.exportSummary','Share or export summary file')} accessibilityHint={t('rightsChecker.exportSummaryHint','Opens system share sheet with a text file of your rights summary.')} style={[styles.smallBtn,{ opacity: summary?1:0.5 }]}>
            <Text style={styles.smallBtnText} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.export','Export')}</Text>
          </A11yPressable>
        </GapView>
      </View>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={styles.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t('rightsChecker.title','Automated Rights Checker')}
      </Text>
      <DisclaimerBanner type="legal" compact={true} />
      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.subtitle','Answer 8 questions to get personalized rights analysis with actionable next steps.')}</Text>

      {/* Progress Indicator */}
      <View style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.muted, borderRadius: 12, padding: 12, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: palette.text, fontWeight: '700' }}>Progress</Text>
          <Text style={{ color: palette.text, fontWeight: '700' }}>{answeredCount}/8</Text>
        </View>
        <View style={{ height: 8, backgroundColor: palette.background, borderRadius: 4 }}>
          <View style={{ width: `${(answeredCount / 8) * 100}%`, height: '100%', backgroundColor: palette.primary, borderRadius: 4 }} />
        </View>
      </View>

      <Question title={t('rightsChecker.q1','1. Are you currently employed or recently terminated?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q1}
          onPress={() => setQ1("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q1}
          onPress={() => setQ1("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q2','2. Are you a union member?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q2}
          onPress={() => setQ2("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q2}
          onPress={() => setQ2("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q3','3. Do you have a disability or health condition requiring accommodations?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q3}
          onPress={() => setQ3("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q3}
          onPress={() => setQ3("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q4','4. Have you been denied benefits (WSIB, LTD, CPP-D, EI)?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q4}
          onPress={() => setQ4("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q4}
          onPress={() => setQ4("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q5','5. Are you experiencing harassment or discrimination?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q5}
          onPress={() => setQ5("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q5}
          onPress={() => setQ5("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q6','6. Have you been fired or disciplined?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q6}
          onPress={() => setQ6("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q6}
          onPress={() => setQ6("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q7','7. Have you requested workplace accommodation?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q7}
          onPress={() => setQ7("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q7}
          onPress={() => setQ7("no")}
        />
      </Question>
      <Question title={t('rightsChecker.q8','8. Have you experienced a workplace injury?')}>
        <Choice
          label="Yes"
          value="yes"
          selected={q8}
          onPress={() => setQ8("yes")}
        />
        <Choice
          label="No"
          value="no"
          selected={q8}
          onPress={() => setQ8("no")}
        />
      </Question>
      {summary && (
        <>
          {/* Rights Summary */}
          <View style={{ backgroundColor: palette.success + '15', borderWidth: 1, borderColor: palette.success, borderRadius: 12, padding: 16, marginTop: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 }}>
              ✅ Your Rights ({summary.rights.length})
            </Text>
            {summary.rights.map((right, idx) => (
              <Text key={idx} style={{ color: palette.text, marginBottom: 6, lineHeight: 20 }}>{right}</Text>
            ))}
          </View>

          {/* Action Items */}
          {summary.actions.length > 0 && (
            <View style={{ backgroundColor: palette.info + '15', borderWidth: 1, borderColor: palette.info, borderRadius: 12, padding: 16, marginTop: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.text, marginBottom: 12 }}>
                🎯 Recommended Actions ({summary.actions.length})
              </Text>
              {summary.actions.map((action, idx) => (
                <Text key={idx} style={{ color: palette.text, marginBottom: 8, lineHeight: 20 }}>{action}</Text>
              ))}
            </View>
          )}

          {/* Detailed Summary */}
          <View style={styles.box} accessibilityLabel={t('rightsChecker.summaryRegion','Rights summary')} accessible={true}>
            <Text style={styles.resultTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.yourSummary','Detailed Analysis')}</Text>
            <Text style={styles.result} maxFontSizeMultiplier={MAX_FONT_SCALE}>{summary.text}</Text>
          </View>

          {/* Export Actions */}
          <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
            <Pressable onPress={copySummary} style={styles.actionButton}>
              <MaterialCommunityIcons name="content-copy" size={18} color={palette.onPrimary} />
              <Text style={{ color: palette.onPrimary, fontWeight: '700', marginLeft: 6 }}>Copy</Text>
            </Pressable>
            <Pressable onPress={exportSummary} style={styles.actionButton}>
              <MaterialCommunityIcons name="share-variant" size={18} color={palette.onPrimary} />
              <Text style={{ color: palette.onPrimary, fontWeight: '700', marginLeft: 6 }}>Export</Text>
            </Pressable>
            <Pressable onPress={() => Alert.alert('Coming Soon', 'Save to Evidence Locker')} style={[styles.actionButton, { backgroundColor: palette.surface, borderWidth: 1, borderColor: palette.muted }]}>
              <MaterialCommunityIcons name="safe-square" size={18} color={palette.text} />
              <Text style={{ color: palette.text, fontWeight: '700', marginLeft: 6 }}>Save</Text>
            </Pressable>
          </GapView>
        </>
      )}
    </ScrollView>
  );
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  const palette = useAppPalette();
  const s = StyleSheet.create({
    title: {
      color: palette.text,
      fontWeight: "700",
      marginTop: 10,
      marginBottom: 6,
    },
    row: { flexDirection: "row", marginBottom: 6, flexWrap: "wrap" },
  });
  return (
    <View>
      <Text style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>{title}</Text>
      <GapView style={s.row} gap={8}>{children}</GapView>
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 12, lineHeight: 20 },
    choice: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: palette.surface,
    },
    choiceActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    choiceText: { color: palette.text, fontSize: 15 },
    choiceTextActive: { color: palette.onPrimary, fontWeight: "700" },
    box: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
      backgroundColor: palette.card,
    },
    resultTitle: { color: palette.text, fontWeight: "700", marginBottom: 8, fontSize: 18 },
    result: { color: palette.text, opacity: 0.95, lineHeight: 22 },
    infoCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding:12, borderRadius:10, marginBottom:12, marginTop:16 },
    infoHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
    infoTitle: { color: palette.primary, fontWeight:'700', fontSize:16 },
    infoToggle: { color: palette.text, fontSize:12 },
    infoText: { color: palette.text, marginTop:4 },
    actionRow: { flexDirection:'row', flexWrap:'wrap', marginTop:8 },
    smallBtn: { backgroundColor: palette.primary, paddingHorizontal:14, paddingVertical:10, borderRadius:8 },
    smallBtnText: { color: palette.onPrimary, fontWeight:'700' },
    actionButton: {
      backgroundColor: palette.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 12,
    },
  });
}
