import { useLocalSearchParams } from 'expo-router';
import React from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import AIDisclaimer from '../../../components/AIDisclaimer';
import { DyslexiaText } from '../../../components/DyslexiaText';
import GapView from '../../../components/GapView';
import OnlineStatusBadge from '../../../components/OnlineStatusBadge';
import {
    MAX_FONT_SCALE,
    useAnnounceOnMount,
    useFocusOnRefOnMount,
} from "../../../hooks/useA11y";
import { useTranslation } from '../../../i18n';
import { logActivity } from '../../../services/activity';
import { llmSimplify } from "../../../services/llm";
import { usage } from '../../../services/usage';
import { useAppPalette } from "../../../theme/usePalette";
import { extractTranslatorSections, getTranslatorConfigForLocale } from "../../../utils/translatorExtract";


function simplify(text: string): string {
  const rules: [RegExp, string][] = [
    [/herewith|herein|thereof|aforementioned/gi, ""],
    [/pursuant to/gi, "under"],
    [/notwithstanding/gi, "despite"],
    [/shall/gi, "will"],
    [/in the event that/gi, "if"],
  ];
  let out = text;
  rules.forEach(([re, rep]) => {
    out = out.replace(re, rep);
  });
  // short sentences
  out = out.replace(/([.;:])(\s+)/g, "$1\n");
  return out.trim();
}

export const options = { href: null };
export default function AiAdvocateTranslator() {
  // Router params (must be top-most hooks to avoid any conditional order concerns)
  const { q } = useLocalSearchParams<{ q?: string }>();
  const palette = useAppPalette();
  const s = styles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t, lang: language } = useTranslation();
  useAnnounceOnMount(t('advocacy.tools.ai_translator','AI Advocate Translator'));
  useFocusOnRefOnMount(titleRef);
  // moved earlier
  const [input, setInput] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [sections, setSections] = React.useState<{summary:string; keyTerms:string[]; deadlines:string[]; actions:string[]}|null>(null);
  React.useEffect(()=>{ usage.view('translator','/translator'); },[]);
  // Accept initial prompt via route param 'q'
  React.useEffect(() => {
    if (q && !input) setInput(String(q));
  }, [q, input]);
  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text
        ref={titleRef}
        accessibilityRole="header"
        style={s.title}
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
  {t('advocacy.tools.ai_translator','AI Advocate Translator')}
      </Text>
      <Text style={[s.subtitle, { fontStyle: 'italic' }]} accessibilityLabel={t('assistant.hub.quickPrompts','Quick prompts')}>
        {t('translator.subtitle','Paste a bureaucratic letter to simplify into plain language. ASL video summary requires server integration.')} · Hint: you can prefill this from Assistant quick prompts or links with ?q=...
      </Text>
      <OnlineStatusBadge />
      
      <TextInput
        style={[s.input, { minHeight: 120 }]}
        value={input}
        onChangeText={setInput}
  placeholder={t('translator.placeholder','Paste text here')}
        multiline={true}
      />
      <Pressable
        accessibilityRole="button"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={async () => {
          if(!input.trim()) return;
          const start = Date.now();
          const remote = await llmSimplify(input);
          const simplified = remote ?? simplify(input);
          const duration = Date.now() - start;
          setOutput(simplified);
          const cfg = getTranslatorConfigForLocale(language);
          const extracted = extractTranslatorSections(simplified, cfg);
          setSections(extracted);
          usage.complete('translator','/translator', duration,{ chars: input.length, hasRemote: !!remote, locale: language, actions: extracted.actions.length, deadlines: extracted.deadlines.length, keyTerms: extracted.keyTerms.length });
          try { await logActivity({ type:'translator.simplify', payload:{ chars: input.length, hasRemote: !!remote, locale: language, ms: duration, actions: extracted.actions.length, deadlines: extracted.deadlines.length, keyTerms: extracted.keyTerms.length } } as any); } catch {}
        }}
        style={s.button}
      >
        <Text style={s.buttonText}>{t('translator.simplify','Simplify')}</Text>
      </Pressable>
      {!!output && (
  <View style={s.card} accessibilityLabel={t('translator.summary','Plain Summary')}>
          {sections && (
            <View>
              <Text style={[s.sectionHeader]}>{t('translator.summary','Plain Summary')}</Text>
              <DyslexiaText style={{ color: palette.text, marginBottom:8 }}>{sections.summary}</DyslexiaText>
              {!!sections.keyTerms.length && (
                <View style={{ marginBottom:8 }}>
                  <Text style={s.sectionHeader}>{t('translator.keyTerms','Key Terms')}</Text>
                  <DyslexiaText style={{ color: palette.text }}>{sections.keyTerms.join(', ')}</DyslexiaText>
                </View>
              )}
              {!!sections.deadlines.length && (
                <View style={{ marginBottom:8 }}>
                  <Text style={s.sectionHeader}>{t('translator.deadlines','Deadlines')}</Text>
                  {sections.deadlines.map((d,i)=>(<DyslexiaText key={i} style={{ color: palette.text }}>• {d}</DyslexiaText>))}
                </View>
              )}
              {!!sections.actions.length && (
                <View style={{ marginBottom:8 }}>
                  <Text style={s.sectionHeader}>{t('translator.actions','Actions')}</Text>
                  {sections.actions.map((a,i)=>(<DyslexiaText key={i} style={{ color: palette.text }}>• {a}</DyslexiaText>))}
                </View>
              )}
              <Text style={s.sectionHeader}>{t('translator.fullText','Full Simplified Text')}</Text>
            </View>
          )}
          <DyslexiaText style={{ color: palette.text }}>{output}</DyslexiaText>
          <GapView
            style={{
              flexDirection: "row",
              marginTop: 8,
              flexWrap: "wrap",
            }}
            gap={8}
          >
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={async () => {
                try {
                  const mod = await import("expo-clipboard");
                  await mod.setStringAsync(output);
                  Alert.alert(t('translator.copiedTitle','Copied'), t('translator.copiedBody','Summary copied.'));
                } catch {}
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>{t('common.copy','Copy')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() =>
                Share.share({
                  message: output,
                  title: t('translator.shareTitle','Plain-language Summary'),
                }).catch(() => {})
              }
              style={s.button}
            >
              <Text style={s.buttonText}>{t('common.share','Share')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={async () => {
                try {
                  const mod = await import("expo-print");
                  const html = `<pre style=\"font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; white-space: pre-wrap;\">${output.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
                  const { uri } = await mod.printToFileAsync({ html });
                  await Share.share({
                    url: uri,
                    title: t('translator.shareTitle','Plain-language Summary'),
                  });
                } catch {
                  Alert.alert(
                    t('translator.pdfUnavailableTitle','PDF not available'),
                    t('translator.pdfUnavailableBody','Install expo-print in a dev build.'),
                  );
                }
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>{t('translator.pdf','PDF')}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={async () => {
                try {
                  const FS = await import("expo-file-system");
                  const html = `<html><meta charset=\"utf-8\"/><body><pre style=\"font-family: Arial; white-space: pre-wrap;\">${output.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre></body></html>`;
                  const path =
                    FS.cacheDirectory + `translator_${Date.now()}.doc`;
                  await FS.writeAsStringAsync(path, html, {
                    encoding: FS.EncodingType.UTF8,
                  });
                  await Share.share({
                    url: path,
                    title: t('translator.shareTitleDoc','Plain-language Summary (.doc)'),
                  });
                } catch {
                  Alert.alert(t('translator.exportFailedTitle','Export failed'), t('translator.exportFailedBody','Could not create .doc file.'));
                }
              }}
              style={s.button}
            >
              <Text style={s.buttonText}>{t('translator.doc','DOC')}</Text>
            </Pressable>
          </GapView>
        </View>
      )}
      <AIDisclaimer />
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    subtitle: { color: palette.text, opacity: 0.9, marginBottom: 8 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 10,
      color: palette.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 8,
      padding: 12,
      backgroundColor: palette.surface,
      marginTop: 8,
    },
    sectionHeader: { color: palette.text, fontWeight:'700', marginBottom:4, marginTop:4 },
  });
}
