import React from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

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

  const ready = [q1, q2, q3, q4, q5].every((x) => x !== null);

  const summary = React.useMemo(() => {
    if (!ready) return null;
    const lines: string[] = [];
    if (q3 === "yes") {
      lines.push(
        t('rightsChecker.protected','You are protected under human rights law, including the duty to accommodate.')
      );
    }
    if (q1 === "yes") {
      lines.push(
        t('rightsChecker.workplaceRights','You have workplace rights: safety, accommodation, and protection from discrimination.')
      );
      if (q2 === "yes") lines.push(t('rightsChecker.union','Contact your union for representation.'));
      else
        {lines.push(
          t('rightsChecker.noUnion','If no union, consider contacting a legal clinic or advocacy group.')
        );}
    }
    if (q4 === "yes") {
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
        if (jurisdictionData.humanRights?.complaintDeadlineMonths) {
          deadlines.push(
            t('rightsChecker.humanRightsDeadline',
              `⚠️ DEADLINE: ${jurisdictionData.humanRights.name} - File complaint within ${jurisdictionData.humanRights.complaintDeadlineMonths} months from last incident.`,
              { body: jurisdictionData.humanRights.name, months: jurisdictionData.humanRights.complaintDeadlineMonths.toString() }
            )
          );
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
      
      lines.push(
        t('rightsChecker.templates','Use our letter templates in Resources to request reconsideration or appeal.')
      );
    }
    if (q5 === "yes") {
      lines.push(
        t('rightsChecker.harassment','Harassment is prohibited. Document incidents and report via proper channels.')
      );
    }
    if (lines.length === 0) {
      lines.push(
        t('rightsChecker.general','Based on your answers, you still maintain general human rights. Consider browsing Resources for guidance.')
      );
    }
    return lines.join("\n\n");
  }, [ready, q1, q2, q3, q4, q5, jurisdictionData]);

  React.useEffect(()=>{ if(summary) announce(t('rightsChecker.summaryReady','Rights summary ready')); }, [summary]);

  const Choice = ({ label, value, selected, onPress }: { label: string; value: Answer; selected: Answer; onPress: () => void }) => (
    <A11yPressable
      hitSlop={HIT_SLOP_8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('rightsChecker.choiceLabel', `${label} answer option`)}
      accessibilityState={{ selected: selected === value }}
      style={[styles.choice, selected === value && styles.choiceActive]}
    >
      <Text style={[styles.choiceText, selected === value && styles.choiceTextActive]} maxFontSizeMultiplier={MAX_FONT_SCALE}>{label}</Text>
    </A11yPressable>
  );

  const reset = () => {
    setQ1(null); setQ2(null); setQ3(null); setQ4(null); setQ5(null);
  announce(t('rightsChecker.resetAnnounce','Answers cleared'));
  };

  const copySummary = async () => {
    if(!summary) return;
    try { const mod = await import('expo-clipboard'); await mod.setStringAsync(summary); Alert.alert(t('rightsChecker.copied','Copied'), t('rightsChecker.copiedBody','Summary copied to clipboard.')); }
    catch { Alert.alert(t('rightsChecker.clipboardMissingTitle','Clipboard not available'), t('rightsChecker.clipboardMissingMsg','Install expo-clipboard in a dev build to enable copy.')); }
  };

  const exportSummary = async () => {
    if(!summary) return;
    try {
      const FS = await import('expo-file-system');
      const Share = await import('expo-sharing');
      const path = FS.cacheDirectory + `rights_summary_${Date.now()}.txt`;
      await FS.writeAsStringAsync(path, summary);
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
      <DisclaimerBanner type="legal" compact />
      <Text style={styles.subtitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.subtitle','Answer a few questions to get a plain-language overview of your rights and options.')}</Text>

      <Question title={t('rightsChecker.q1','Are you currently employed?')}>
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
      <Question title={t('rightsChecker.q2','Are you a union member?')}>
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
      <Question title={t('rightsChecker.q3','Do you have a disability or health condition requiring accommodations?')}>
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
      <Question title={t('rightsChecker.q4','Have you been denied benefits (e.g., workers\' compensation, LTD)?')}>
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
      <Question title={t('rightsChecker.q5','Are you experiencing harassment or discrimination?')}>
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
      {summary && (
        <View style={styles.box} accessibilityLabel={t('rightsChecker.summaryRegion','Rights summary')} accessible>
          <Text style={styles.resultTitle} maxFontSizeMultiplier={MAX_FONT_SCALE}>{t('rightsChecker.yourSummary','Your summary')}</Text>
          <Text style={styles.result} maxFontSizeMultiplier={MAX_FONT_SCALE}>{summary}</Text>
        </View>
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
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 10 },
    choice: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    choiceActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    choiceText: { color: palette.text },
    choiceTextActive: { color: palette.onPrimary, fontWeight: "700" },
    box: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 10,
      padding: 12,
      marginTop: 12,
    },
    resultTitle: { color: palette.text, fontWeight: "700", marginBottom: 6 },
    result: { color: palette.text, opacity: 0.95 },
    infoCard: { borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, backgroundColor: palette.surface, padding:12, borderRadius:10, marginBottom:12, marginTop:16 },
    infoHeader: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:4 },
    infoTitle: { color: palette.primary, fontWeight:'700', fontSize:16 },
    infoToggle: { color: palette.text, fontSize:12 },
    infoText: { color: palette.text, marginTop:4 },
    actionRow: { flexDirection:'row', flexWrap:'wrap', marginTop:8 },
    smallBtn: { backgroundColor: palette.primary, paddingHorizontal:14, paddingVertical:10, borderRadius:8 },
    smallBtnText: { color: palette.onPrimary, fontWeight:'700' },
  });
}
