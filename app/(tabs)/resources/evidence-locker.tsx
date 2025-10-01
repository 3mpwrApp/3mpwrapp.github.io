import { router } from "expo-router";
import React from "react";
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, View } from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import ProgressBar from "../../../components/ProgressBar"; // retained for some inline uses
import UploadProgress from "../../../components/UploadProgress";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { useAuth } from "../../../context/AuthContext";
import { addEvidenceNote, deleteEvidenceDoc, listEvidencePage, uploadEvidenceFileWithProgress, type EvidenceFile } from "../../../services/evidence";
import {
    ENCRYPTED_NOTES_KEY,
    exportNotesEncrypted,
    importNotesEncrypted,
    loadEncryptedNotes,
    migrateLegacyNotes,
    rotateDeviceKeyAndReencrypt,
    saveEncryptedNotes,
    type EvidenceLocalNote,
} from '../../../services/evidenceCrypto';
import { announce } from "../../../utils/announce";
// Linking added when preview links are active; safe to lazy import when needed
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from "../../../hooks/useA11y";
import { useTranslation } from "../../../i18n";
import { s } from '../../../theme/spacing';
import { useAppPalette } from "../../../theme/usePalette";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type Attachment = { name: string; uri: string };
type Note = EvidenceLocalNote;
type QueueItem = { text: string; tags?: string[]; files?: Attachment[] };
const QUEUE_KEY = "evidence:uploadQueue:v1";

export const options = { href: null };

export default function EvidenceLocker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  const { t, tCount } = useTranslation();
  useAnnounceOnMount(t("templates.evidenceLocker.title", "Evidence Locker"));
  useFocusOnRefOnMount(titleRef);
  const { isAdmin } = useAuth();
  const [text, setText] = React.useState("");
  const [tag, setTag] = React.useState("");
  const [notes, setNotes] = React.useState<Note[]>([]);
  const [cloudItems, setCloudItems] = React.useState<any[]>([]);
  const [cloudCursor, setCloudCursor] = React.useState<any | null>(null);
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("");
  const [query, setQuery] = React.useState<string>("");
  const [processing, setProcessing] = React.useState(false);
  const [progressPct, setProgressPct] = React.useState(0);
  const [preview, setPreview] = React.useState<{ url: string; name?: string } | null>(null);
  const [showInfo, setShowInfo] = React.useState(false);
  // Passphrase modal state
  const [passModal, setPassModal] = React.useState<{ mode: 'export' | 'import' | null; fileUri?: string } | null>(null);
  const [passValue, setPassValue] = React.useState('');
  const [passVisible, setPassVisible] = React.useState(false);
  const [passConfirm, setPassConfirm] = React.useState('');
  const passStrength = React.useMemo(() => {
    const p = passValue || '';
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p) && /[^\w\s]/.test(p)) score++;
    if (score >= 3) return { label: t('security.strong','Strong'), color: palette.success, score } as const;
    if (score === 2) return { label: t('security.medium','Medium'), color: palette.warning, score } as const;
    if (score === 1) return { label: t('security.weak','Weak'), color: palette.error, score } as const;
    return { label: t('security.tooShort','Too short'), color: palette.error, score } as const;
  }, [passValue, t, palette]);
  // Plain-language toggle (per-screen) and micro-coach hint
  const [plainHere, setPlainHere] = React.useState<boolean>(false);
  const [hintSeen, setHintSeen] = React.useState<boolean>(false);
  // summary retained only for potential future export state (unused removed to satisfy TS)
  // Immediate upload progress (non-queue)
  const [immUploading, setImmUploading] = React.useState(false);
  const [immPct, setImmPct] = React.useState(0);
  const [immLabel, setImmLabel] = React.useState<string>("");
  // Selection for cloud items
  const [selectedCloud, setSelectedCloud] = React.useState<Record<string, boolean>>({});
  // Upload progress state can be surfaced later
  const { user } = useAuth();
  // Lightweight toast
  const [toast, setToast] = React.useState<string | null>(null);
  const showToast = React.useCallback((msg: string) => {
    setToast(msg);
    announce(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        // Migrate legacy plaintext notes (if any) to encrypted storage once
        await migrateLegacyNotes();
        const encNotes = await loadEncryptedNotes();
        setNotes(encNotes);
        const plain = await AsyncStorage?.getItem?.('evidence:plain:v1');
        const seen = await AsyncStorage?.getItem?.('evidence:hintSeen:v1');
        setPlainHere(plain === '1');
        setHintSeen(seen === '1');
      } catch {}
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      // Save encrypted copy of notes
      await saveEncryptedNotes(notes);
    })();
  }, [notes]);

  // Offline upload queue helpers
  const enqueueFailed = async (item: QueueItem) => {
    try {
      const raw = (await AsyncStorage?.getItem?.(QUEUE_KEY)) || "[]";
      const arr = JSON.parse(raw);
      arr.push(item);
      await AsyncStorage?.setItem?.(QUEUE_KEY, JSON.stringify(arr));
      try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.queue.enqueued', { count: 1 }); } catch {}
    } catch {}
  };

  const processQueue = async () => {
    try {
      setProcessing(true);
      setProgressPct(0);
      const raw = (await AsyncStorage?.getItem?.(QUEUE_KEY)) || "[]";
      const arr: QueueItem[] = JSON.parse(raw);
      if (!arr.length) {
        Alert.alert(t('templates.evidenceLocker.queueTitle', 'Queue'), t('templates.evidenceLocker.queueNoPending', 'No pending items.'));
        return;
      }

      for (let i = 0; i < arr.length; i++) {
        const n = arr[i];
        let uploaded: EvidenceFile[] = [];
        if (n.files?.length) {
          for (const f of n.files) {
            uploaded.push(
              await uploadEvidenceFileWithProgress(
                f.uri,
                f.name,
                (pct) => setProgressPct(Math.round(((i + pct / 100) / arr.length) * 100))
              )
            );
          }
        }
        await addEvidenceNote({ text: n.text, tags: n.tags, files: uploaded });
        setProgressPct(Math.round(((i + 1) / arr.length) * 100));
      }
      await AsyncStorage?.setItem?.(QUEUE_KEY, JSON.stringify([]));
      Alert.alert(t('templates.evidenceLocker.queueTitle', 'Queue'), t('templates.evidenceLocker.queueProcessed', 'Processed all queued items.'));
      try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.queue.processed', { total: arr.length }); } catch {}
    } catch {
      Alert.alert(t('templates.evidenceLocker.queueTitle', 'Queue'), t('templates.evidenceLocker.queueProcessedSome', 'Some items could not be processed.'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={t('templates.evidenceLocker.screenLabel', 'Evidence Locker screen')}
      accessible
    >
      {/* Micro‑coach contextual hint */}
      {!hintSeen && (
        <View style={styles.hintCard} accessibilityRole="summary">
          <Text style={styles.hintTitle}>{t('microCoach.hint','Tip')}</Text>
          <Text style={styles.hintText}>{t('templates.evidenceLocker.hintTags','Use tags to find notes faster. Try tagging calls, letters, or decisions.')}</Text>
          <View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
            <A11yPressable style={styles.secondary} onPress={async()=>{ setHintSeen(true); try{ await AsyncStorage?.setItem?.('evidence:hintSeen:v1','1'); } catch{} }}>
              <Text style={styles.buttonText}>{t('microCoach.dismiss','Got it')}</Text>
            </A11yPressable>
          </View>
        </View>
      )}
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        {t("templates.evidenceLocker.title", "Evidence Locker")}
      </Text>
      <View style={{ flexDirection:'row', gap:8, marginTop: 6, alignItems:'center' }}>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={async () => { const next = !plainHere; setPlainHere(next); try{ await AsyncStorage?.setItem?.('evidence:plain:v1', next ? '1' : '0'); } catch{} }}
          accessibilityRole="button"
          accessibilityLabel={plainHere ? t('plainMode.toggleOff','Use standard language on this screen') : t('plainMode.toggleOn','Use plain language on this screen')}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{plainHere ? t('plainMode.toggleOff','Use standard language on this screen') : t('plainMode.toggleOn','Use plain language on this screen')}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={async () => {
            try {
              const ok = await rotateDeviceKeyAndReencrypt();
              Alert.alert(
                t('security.keyRotation','Key rotation'),
                ok ? t('security.keyRotationOk','Local encryption key rotated.') : t('security.keyRotationFail','Could not rotate encryption key.'),
              );
            } catch {
              Alert.alert(t('security.keyRotation','Key rotation'), t('security.keyRotationFail','Could not rotate encryption key.'));
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={t('security.rotateKey','Rotate local encryption key')}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{t('security.rotate','Rotate Key')}</Text>
        </A11yPressable>
      </View>
      <Text
        style={styles.countLine}
        accessibilityLabel={tCount('demoPlural.item', notes.length)}
      >
        {tCount('demoPlural.item', notes.length)}
      </Text>
      {/* Actions / Info toggle row */}
      <View style={styles.actionsRow} accessible accessibilityLabel={t("templates.evidenceLocker.screenLabel", "Evidence Locker screen")}>        
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={() => setShowInfo(v=>!v)}
          accessibilityRole="button"
          accessibilityLabel={t("templates.evidenceLocker.toggleInfo", "Toggle instructions")}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{showInfo ? t("common.hide", "Hide") : t("common.show", "Show")}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={async () => {
            try {
              const notesLines = notes.map(n => `- ${new Date(n.date).toISOString()} [${(n.tags||[]).join('|')}] ${n.text}`);
              const filesCount = notes.reduce((s,n)=> s + (n.files?.length||0), 0);
              const header = `Evidence Locker (notes: ${notes.length}, files: ${filesCount})`;
              const full = [header, ...notesLines].join('\n');
              // summary removed
              let Clipboard: any; try { Clipboard = require('expo-clipboard'); } catch {}
              if (Clipboard?.setStringAsync) { await Clipboard.setStringAsync(full); Alert.alert(t("templates.evidenceLocker.copied", "Copied"), t("templates.evidenceLocker.copiedBody", "Notes copied to clipboard.")); announce(t("templates.evidenceLocker.copied", "Copied")); } else {
                Alert.alert(t("templates.evidenceLocker.clipboardMissingTitle"), t("templates.evidenceLocker.clipboardMissingMsg"));
              }
            } catch {}
          }}
          accessibilityRole="button"
          accessibilityLabel={t("templates.evidenceLocker.copyLabel", "Copy notes")}
          accessibilityHint={t("templates.evidenceLocker.copyHint")}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{t("templates.evidenceLocker.copy", "Copy")}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={async () => {
            try {
              const notesLines = notes.map(n => `- ${new Date(n.date).toISOString()} [${(n.tags||[]).join('|')}] ${n.text}`);
              const filesCount = notes.reduce((s,n)=> s + (n.files?.length||0), 0);
              const header = `Evidence Locker (notes: ${notes.length}, files: ${filesCount})`;
              const full = [header, ...notesLines].join('\n');
              // summary removed
              const FS = await import('expo-file-system');
              const path = FS.cacheDirectory + `evidence_summary_${Date.now()}.txt`;
              await FS.writeAsStringAsync(path, full);
              try {
                const Sharing = await import('expo-sharing');
                if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path); else Alert.alert(t("templates.evidenceLocker.shareUnavailable"), t("templates.evidenceLocker.shareUnavailableBody"));
              } catch { Alert.alert(t("templates.evidenceLocker.shareError"), t("templates.evidenceLocker.shareErrorBody")); }
            } catch { Alert.alert(t("templates.evidenceLocker.shareError"), t("templates.evidenceLocker.shareErrorBody")); }
          }}
          accessibilityRole="button"
          accessibilityLabel={t("templates.evidenceLocker.shareLabel", "Share evidence summary")}
          accessibilityHint={t("templates.evidenceLocker.shareHint")}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{t("templates.evidenceLocker.share", "Share")}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={() => {
            Alert.alert(
              t("templates.evidenceLocker.resetLabel", "Reset locker"),
              t("templates.evidenceLocker.resetConfirm", "Clear all locker notes?"),
              [
                { text: t("common.cancel", "Cancel"), style: 'cancel' },
                { text: t("templates.evidenceLocker.reset", "Reset"), style: 'destructive', onPress: async () => { setNotes([]); try { await AsyncStorage?.removeItem?.(ENCRYPTED_NOTES_KEY); } catch {} announce(t("templates.evidenceLocker.resetAnnounce", "Evidence locker cleared")); } }
              ]
            );
          }}
          accessibilityRole="button"
          accessibilityLabel={t("templates.evidenceLocker.resetLabel", "Reset locker")}
          accessibilityHint={t("templates.evidenceLocker.resetHint")}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{t("templates.evidenceLocker.reset", "Reset")}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={() => { setPassValue(''); setPassModal({ mode: 'export' }); }}
          accessibilityRole="button"
          accessibilityLabel={t('templates.evidenceLocker.exportEncrypted','Export encrypted')}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{t('common.export','Export')}</Text>
        </A11yPressable>
        <A11yPressable
          hitSlop={HIT_SLOP_8}
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
              if (res.canceled || !res.assets?.length) return;
              const asset = res.assets[0];
              setPassValue('');
              setPassModal({ mode: 'import', fileUri: asset.uri });
            } catch {
              Alert.alert(t('templates.evidenceLocker.importFailedTitle','Import failed'), t('templates.evidenceLocker.importFailedBody','Could not import encrypted notes.'));
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={t('templates.evidenceLocker.importEncrypted','Import encrypted')}
          style={styles.actionBtn}
        >
          <Text style={styles.actionText}>{t('common.import','Import')}</Text>
        </A11yPressable>
      </View>
      {showInfo && (
        <View style={styles.infoCard} accessibilityRole="summary" accessibilityLabel={t("templates.evidenceLocker.howToUse")}>          
          <Text style={styles.infoTitle}>{t("templates.evidenceLocker.infoTitle", "How to Use")}</Text>
          <Text style={styles.infoLine}>{t("templates.evidenceLocker.infoLine1")}</Text>
          <Text style={styles.infoLine}>{t("templates.evidenceLocker.infoLine2")}</Text>
          <Text style={styles.infoLine}>{t("templates.evidenceLocker.infoLine3")}</Text>
        </View>
      )}
      {isAdmin && (
        <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
          <A11yPressable onPress={()=> router.push('/(tabs)/admin' as any)} style={styles.secondary}><Text style={styles.buttonText}>{t('admin.pending','Admin Pending')}</Text></A11yPressable>
          <A11yPressable onPress={()=> router.push('/(tabs)/admin' as any)} style={styles.secondary}><Text style={styles.buttonText}>{t('admin.trash','Admin Trash')}</Text></A11yPressable>
        </View>
      )}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t("templates.evidenceLocker.addNote", "Add a note (date, contact, summary)")}
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      {isAdmin && (
        <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
          <A11yPressable onPress={()=> setShowDeleted(v=>!v)} style={styles.secondary}><Text style={styles.buttonText}>{showDeleted? t('templates.evidenceLocker.showingTrash','Showing Trash'): t('templates.evidenceLocker.showTrash','Show Trash')}</Text></A11yPressable>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['call','letter','medical','decision','payment','email'].map((tagKey) => (
          <A11yPressable key={tagKey} onPress={() => setTag(tagKey)} style={[styles.chip, tag===tagKey && styles.chipActive]} accessibilityLabel={t(`templates.evidenceLocker.tag.${tagKey}`, tagKey)}>
            <Text style={[styles.chipText, tag===tagKey && styles.chipTextActive]}>{t(`templates.evidenceLocker.tag.${tagKey}`, tagKey).toUpperCase()}</Text>
          </A11yPressable>
        ))}
      </View>
      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['','call','letter','medical','decision','payment','email'].map((f) => (
          <A11yPressable key={`f-${f||'all'}`} onPress={() => setFilter(f)} style={[styles.chip, filter===f && styles.chipActive]} accessibilityLabel={f? t(`templates.evidenceLocker.tag.${f}`, f): t('common.all','All')}>
            <Text style={[styles.chipText, filter===f && styles.chipTextActive]}>{(f? t(`templates.evidenceLocker.tag.${f}`, f): t('common.all','All')).toUpperCase()}</Text>
          </A11yPressable>
        ))}
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t('common.search','Search')}
        placeholderTextColor={palette.text + '77'}
        style={[styles.input, { marginTop: 8 }]}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <A11yPressable
          accessibilityLabel={t('templates.evidenceLocker.attachFile','Attach file')}
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: false });
              if (res.canceled || !res.assets?.length) return;
              const file = res.assets[0];
              setNotes([{ id: String(Date.now()), text: text.trim() || file.name || 'Attachment', date: new Date().toISOString(), tags: tag? [tag]: [], files: [{ name: file.name || 'file', uri: file.uri }] }, ...notes]);
              setText(''); setTag('');
            } catch {
              Alert.alert(t('common.attachUnavailableTitle','Attach unavailable'), t('common.attachUnavailableBody','Document picker not available in this build.'));
            }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{t("templates.evidenceLocker.addFile", "Add File")}</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel={t('templates.evidenceLocker.attachFiles','Attach files')}
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: true });
              if (res.canceled || !res.assets?.length) return;
              const files = res.assets.map((f:any)=> ({ name: f.name || 'file', uri: f.uri }));
              const defaultText = text.trim() || (files[0]?.name || 'Attachments');
              setNotes([{ id: String(Date.now()), text: defaultText, date: new Date().toISOString(), tags: tag? [tag]: [], files }, ...notes]);
              setText(''); setTag('');
            } catch {
              Alert.alert(t('common.attachUnavailableTitle','Attach unavailable'), t('common.attachMultiUnavailable','Multi-file picker not available in this build.'));
            }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{t("templates.evidenceLocker.addFile", "Add File")}</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel={t('templates.evidenceLocker.attachPhotos','Attach photos')}
          onPress={async () => {
            try {
              const P = await import('expo-image-picker');
              const perm = await P.requestMediaLibraryPermissionsAsync();
              if (perm.status !== 'granted') { Alert.alert(t('common.permissionDenied','Permission denied'), t('templates.evidenceLocker.photosPermission','Photos permission required.')); return; }
              const res = await P.launchImageLibraryAsync({ allowsMultipleSelection: true, mediaTypes: P.MediaTypeOptions.Images, selectionLimit: 10, quality: 0.9 });
              if (res.canceled) return;
              const assets: any[] = (res.assets||[]);
              if (!assets.length) return;
              const files = assets.map((a:any)=> ({ name: a.fileName || `photo_${Math.random().toString(36).slice(2)}.jpg`, uri: a.uri }));
              const defaultText = text.trim() || 'Photos';
              setNotes([{ id: String(Date.now()), text: defaultText, date: new Date().toISOString(), tags: tag? [tag]: [], files }, ...notes]);
              setText(''); setTag('');
            } catch {
              Alert.alert(t('common.attachUnavailableTitle','Attach unavailable'), t('templates.evidenceLocker.imagePickerUnavailable','Image picker not available in this build.'));
            }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{t("templates.evidenceLocker.addFile", "Add File")}</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel={t('templates.evidenceLocker.addNote','Add Note')}
          onPress={() => {
            if (!text.trim()) return;
            setNotes([{ id: String(Date.now()), text: text.trim(), date: new Date().toISOString(), tags: tag? [tag]: [] }, ...notes]);
            setText(''); setTag('');
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{t("templates.evidenceLocker.addNote", "Add Note")}</Text>
        </A11yPressable>
        {user && (
          <A11yPressable
            accessibilityLabel={t('templates.evidenceLocker.saveCloud','Save to Cloud')}
            onPress={async () => {
              const snapshot = notes[0];
              try {
                const current = snapshot;
                if (!current) return;
                let uploaded: EvidenceFile[] = [];
                if (current.files?.length) {
                  setImmUploading(true); setImmPct(0);
                  let idx = 0;
                  for (const f of current.files) {
                    setImmLabel(f.name);
                    uploaded.push(
                      await uploadEvidenceFileWithProgress(
                        f.uri,
                        f.name,
                        (pct) => {
                          const total = current.files?.length || 1;
                          setImmPct(Math.round(((idx + pct/100) / total) * 100));
                        },
                      )
                    );
                    idx++;
                  }
                }
                await addEvidenceNote({ text: current.text, tags: current.tags, files: uploaded });
                Alert.alert(t('common.saved','Saved'), t('templates.evidenceLocker.noteSaved','Note saved to your cloud locker.'));
                try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.save.single', { hasFiles: !!(current.files?.length) }); } catch {}
              } catch {
                if (snapshot) await enqueueFailed({ text: snapshot.text, tags: snapshot.tags, files: snapshot.files });
                Alert.alert(t('common.saveFailed','Save failed'), t('templates.evidenceLocker.queuedUpload','Queued to upload later.'));
              } finally {
                setImmUploading(false); setImmPct(0); setImmLabel("");
              }
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{t("common.save", "Save")}</Text>
          </A11yPressable>
        )}
        {immUploading && (
          <>
            <Text style={{ color: palette.text, marginTop: 6 }}>
              {immLabel ? t('common.uploadingItem','Uploading {{name}}',{ name: immLabel }) : t('common.uploading','Uploading')} {immPct}%
            </Text>
            <ProgressBar value={immPct} />
          </>
        )}
        {user && (
          <A11yPressable
            accessibilityLabel="Save all to Cloud"
            onPress={async () => {
              try {
                if (!notes.length) return;
                const totalFiles = notes.reduce((s,n) => s + (n.files?.length || 0), 0) || 1;
                let fileCursor = 0;
                setImmUploading(true); setImmPct(0); setImmLabel('');
                for (let i=0;i<notes.length;i++) {
                  
                  const n = notes[i];
                  let uploaded: EvidenceFile[] = [];
                  if (n.files?.length) {
                    for (const f of n.files) {
                      try {
                        setImmLabel(f.name);
                        uploaded.push(
                          await uploadEvidenceFileWithProgress(
                            f.uri,
                            f.name,
                            (pct) => {
                              const overall = (fileCursor + pct/100) / totalFiles;
                              setImmPct(Math.round(overall * 100));
                            },
                          )
                        );
                        fileCursor++;
                      } catch {
                        await enqueueFailed({ text: n.text, tags: n.tags, files: n.files });
                      }
                    }
                  }
                  try {
                    await addEvidenceNote({ text: n.text, tags: n.tags, files: uploaded });
                  } catch {
                    await enqueueFailed({ text: n.text, tags: n.tags, files: n.files });
                  }
                }
                Alert.alert(t('common.saved','Saved'), t('templates.evidenceLocker.saveAllDone','Finished saving notes (failures queued).'));
                // Provide a lightweight toast for consistent feedback
                showToast(t('common.saved','Saved'));
                try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.save.bulk', { notes: notes.length, files: notes.reduce((s,n)=> s + (n.files?.length||0), 0) }); } catch {}
              } catch {
                Alert.alert(t('common.saveFailed','Save failed'), t('templates.evidenceLocker.saveSomeFailed','Could not save some items.'));
              } finally { setImmUploading(false); setImmPct(0); setImmLabel(''); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>{t("common.saveAll", "Save All")}</Text>
          </A11yPressable>
        )}
        {processing && (
          <UploadProgress type='queue' pct={progressPct} />
        )}
        {user && (
          <A11yPressable
            accessibilityLabel="Process queue"
            onPress={processQueue}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>{t("common.processQueue", "Process Queue")}</Text>
          </A11yPressable>
        )}
        {user && (
          <A11yPressable
            accessibilityLabel="Load Cloud"
            onPress={async () => {
              try { const { items, cursor } = await listEvidencePage(10, null); setCloudItems(items); setCloudCursor(cursor); Alert.alert(t('common.cloud','Cloud'), t('templates.evidenceLocker.loadedCount','{{count}} items loaded.',{ count: items.length })); }
              catch { Alert.alert(t('templates.evidenceLocker.loadCloudFailed','Load failed'), t('templates.evidenceLocker.loadCloudFailedBody','Unable to load cloud items')); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>{t("common.load", "Load")}</Text>
          </A11yPressable>
        )}
        {user && cloudCursor && (
          <A11yPressable
            accessibilityLabel="Load more Cloud"
            onPress={async () => {
              try { const { items, cursor } = await listEvidencePage(10, cloudCursor); setCloudItems(prev => prev.concat(items)); setCloudCursor(cursor); }
              catch { Alert.alert(t('templates.evidenceLocker.loadMoreFailed','Load failed'), t('templates.evidenceLocker.loadMoreFailedBody','Unable to load more')); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>{t("common.loadMore", "Load More")}</Text>
          </A11yPressable>
        )}
        <A11yPressable
          accessibilityLabel="Export CSV"
          onPress={async () => {
            try {
              const rows = [['date','tags','text','files'], ...notes.map(n => [n.date, (n.tags||[]).join('|'), n.text.replace(/\n/g,' '), String((n.files||[]).length)])];
              const csv = rows.map(r=> r.map(x=>`"${(x||'').replace(/"/g,'""')}"`).join(',')).join('\n');
              const FS = await import('expo-file-system');
              const path = FS.cacheDirectory + `evidence_${Date.now()}.csv`;
              await FS.writeAsStringAsync(path, csv, { encoding: FS.EncodingType.UTF8 });
              try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(path); } else { Alert.alert(t('common.saved','Saved'),t('templates.evidenceLocker.csvSavedCache','CSV saved to cache.')); } }
              catch { Alert.alert(t('common.saved','Saved'),t('templates.evidenceLocker.csvSavedCacheNoShare','CSV saved to cache (sharing unavailable).')); }
            } catch { Alert.alert(t('templates.evidenceLocker.exportFailedTitle','Export failed'),t('templates.evidenceLocker.exportFailedBodyCsv','Could not create CSV.')); }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>{t("templates.evidenceLocker.export", "Export")}</Text>
        </A11yPressable>
      </View>
      {/* Queue screen */}
      <A11yPressable onPress={() => (require('expo-router').router.push('/(tabs)/resources/evidence-queue'))} style={[styles.button, { marginTop: 8 }]}>
        <Text style={styles.buttonText}>{t("common.openQueue", "Open Upload Queue")}</Text>
      </A11yPressable>
      {(immUploading && !processing) && (
        <UploadProgress type='upload' pct={immPct} itemName={immLabel || undefined} />
      )}
      <FlatList
        data={notes.filter(n => (!filter || n.tags?.includes(filter)) && (!query || n.text.toLowerCase().includes(query.toLowerCase())))}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              {new Date(item.date).toLocaleString()} - {item.text}
            </Text>
            {Array.isArray(item.files) && item.files[0]?.uri && /(\.png|\.jpe?g|\.gif|\.webp)$/i.test(item.files[0].name || item.files[0].uri) ? (
              <View style={{ marginTop: 6 }}>
                {(() => { try { const { Image } = require('expo-image'); return (
                  <Image source={{ uri: item.files[0].uri }} style={{ width: 100, height: 60, borderRadius: 6 }} />
                ); } catch { return null; } })()}
              </View>
            ) : null}
          </View>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
      {!!user && cloudItems.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.title}>{t("common.cloudItems", "Cloud items")}</Text>
          <A11yPressable
            onPress={async () => {
              try {
                Alert.alert(t('templates.evidenceLocker.deleteAllConfirmTitle','Delete all?'), t('templates.evidenceLocker.deleteAllConfirmBody','This will delete all cloud items in your Evidence Locker.'), [
                  { text: t('common.cancel','Cancel'), style: 'cancel' },
                  { text: t('common.delete','Delete'), style: 'destructive', onPress: async () => {
                    try {
                      for (const c of cloudItems) { await deleteEvidenceDoc(c.id); }
                      setCloudItems([]);
                      Alert.alert(t('common.deleted','Deleted'), t('templates.evidenceLocker.deletedAll','All cloud items deleted.'));
                    } catch { Alert.alert(t('templates.evidenceLocker.deleteAllFailed','Delete failed'),t('templates.evidenceLocker.deleteAllFailedBody','Unable to delete all items.')); }
                  }}
                ]);
              } catch {}
            }}
            style={[styles.secondary, { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10 }]}
          >
            <Text style={styles.buttonText}>{t("common.deleteAll", "Delete All")}</Text>
          </A11yPressable>
          {Object.values(selectedCloud).some(Boolean) && (
            <A11yPressable
              onPress={async () => {
                try {
                  const ids = Object.keys(selectedCloud).filter((k) => selectedCloud[k]);
                  for (const id of ids) { await deleteEvidenceDoc(id); }
                  setCloudItems((prev) => prev.filter((x) => !selectedCloud[x.id]));
                  setSelectedCloud({});
                  Alert.alert(t('common.deleted','Deleted'), t('templates.evidenceLocker.deletedSelected','Selected items deleted.'));
                } catch { Alert.alert(t('templates.evidenceLocker.deleteSelectedFailed','Delete failed'),t('templates.evidenceLocker.deleteSelectedFailedBody','Unable to delete selected items.')); }
              }}
              style={[styles.secondary, { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10 }]}
            >
              <Text style={styles.buttonText}>{t("common.deleteSelected", "Delete Selected")}</Text>
            </A11yPressable>
          )}
          {cloudItems.filter((c:any)=> showDeleted? c?.deleted===true : !c?.deleted).map((c: any) => (
            <View key={c.id} style={[styles.noteRow, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }] }>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noteText, selectedCloud[c.id] ? { fontWeight: '700' } : null]}>
                  {(c.createdAt?.toDate?.() || new Date()).toLocaleString()} - {c.text || '(no text)'}
                </Text>
                {Array.isArray(c.files) && c.files[0]?.url && /\.(png|jpe?g|gif|webp)$/i.test(c.files[0].url) ? (
                  <View style={{ marginTop: 6 }}>
                    {(() => { try { const { Image } = require('expo-image'); return (
                      <A11yPressable hitSlop={HIT_SLOP_8} accessibilityLabel={t("common.previewImage", "Preview image")} onPress={() => setPreview({ url: c.files[0].url, name: c.files[0].name })}>
                        <Image source={{ uri: c.files[0].url }} style={{ width: 100, height: 60, borderRadius: 6 }} />
                      </A11yPressable>
                    ); } catch { return null; } })()}
                  </View>
                ) : null}
              </View>
              <A11yPressable
                accessibilityRole="checkbox"
                accessibilityLabel={selectedCloud[c.id] ? 'Unselect item' : 'Select item'}
                accessibilityState={{ checked: !!selectedCloud[c.id] }}
                onPress={() => setSelectedCloud((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                style={{ width: 22, height: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: selectedCloud[c.id] ? palette.primary : 'transparent' }}
              >
                {selectedCloud[c.id] ? (<View style={{ width: 12, height: 12, backgroundColor: palette.onPrimary, borderRadius: 2 }} />) : null}
              </A11yPressable>
              <A11yPressable
                onPress={async () => {
                  const ok = await deleteEvidenceDoc(c.id);
                  if (ok) setCloudItems((prev) => prev.filter((x) => x.id !== c.id));
                }}
                style={[styles.secondary, { paddingHorizontal: 10 }]}
              >
                <Text style={styles.buttonText}>{t("common.delete", "Delete")}</Text>
              </A11yPressable>
            </View>
          ))}
        </View>
      )}
      {/* Preview Modal */}
      {preview && (
        <Modal transparent animationType="fade" onRequestClose={() => setPreview(null)}>
          <A11yPressable hitSlop={HIT_SLOP_8} accessibilityLabel={t("common.closePreview", "Close preview")} style={{ flex:1, backgroundColor: palette.text + '99', alignItems:'center', justifyContent:'center' }} onPress={()=>setPreview(null)}>
            <View style={{ backgroundColor: palette.surface, padding: 10, borderRadius: 8, maxWidth: '90%', maxHeight: '90%' }}>
              {(() => { try { const { Image } = require('expo-image'); return (
                <Image source={{ uri: preview.url }} style={{ width: 320, height: 200, borderRadius: 6 }} contentFit="contain" />
              ); } catch { return (<Text style={{ color: palette.text }}>{t('templates.evidenceLocker.previewUnavailable','Preview unavailable')}</Text>); } })()}
              <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
                <A11yPressable onPress={async()=>{ try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(preview.url); } catch {} }} style={styles.secondary}><Text style={styles.buttonText}>{t('common.share','Share')}</Text></A11yPressable>
                <A11yPressable onPress={async()=>{ try { const Web = await import('expo-web-browser'); await Web.openBrowserAsync(preview.url); } catch {} }} style={styles.secondary}><Text style={styles.buttonText}>{t('common.open','Open')}</Text></A11yPressable>
                <A11yPressable onPress={()=> setPreview(null)} style={styles.secondary}><Text style={styles.buttonText}>{t('common.close','Close')}</Text></A11yPressable>
              </View>
            </View>
          </A11yPressable>
        </Modal>
      )}
      {/* Passphrase Modal */}
      {passModal && (
        <Modal transparent animationType="fade" onRequestClose={() => setPassModal(null)}>
          <View style={{ flex:1, backgroundColor: palette.text + '99', alignItems:'center', justifyContent:'center' }}>
            <View style={{ backgroundColor: palette.surface, padding: 16, borderRadius: 10, width: '90%', maxWidth: 420 }}>
              <Text style={[styles.title, { marginBottom: 8 }]}>
                {passModal.mode === 'export' ? t('security.exportTitle','Export encrypted') : t('security.importTitle','Import encrypted')}
              </Text>
              <View style={{ flexDirection:'row', alignItems:'center', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    value={passValue}
                    onChangeText={setPassValue}
                    placeholder={t('security.passphrase','Passphrase')}
                    placeholderTextColor={palette.text + '77'}
                    secureTextEntry={!passVisible}
                    style={[styles.input, { marginTop: 6 }]} 
                  />
                </View>
                <A11yPressable onPress={() => setPassVisible(v=>!v)} style={[styles.secondary, { paddingHorizontal: 10, marginTop: 6 }]} accessibilityLabel={passVisible ? t('security.hidePass','Hide passphrase') : t('security.showPass','Show passphrase')}>
                  <Text style={[styles.buttonText, { color: palette.text }]}>{passVisible ? t('common.hide','Hide') : t('common.show','Show')}</Text>
                </A11yPressable>
              </View>
              {!!passValue && (
                <Text style={{ marginTop: 6, color: passStrength.color }}>{t('security.strength','Strength')}: {passStrength.label}</Text>
              )}
              {/* Helper guidance using existing weakPassBody copy as a hint (no new i18n key) */}
              {passModal.mode === 'export' && (
                <Text style={{ marginTop: 6, color: palette.text, opacity: 0.8 }}>
                  {t('security.weakPassBody','Use at least 12 characters with a mix of cases, numbers, and symbols.')}
                </Text>
              )}
              {passModal?.mode === 'export' && (
                <TextInput
                  value={passConfirm}
                  onChangeText={setPassConfirm}
                  placeholder={t('security.confirmPassphrase','Confirm passphrase')}
                  placeholderTextColor={palette.text + '77'}
                  secureTextEntry={!passVisible}
                  style={[styles.input, { marginTop: 6 }]}
                />
              )}
              <View style={{ flexDirection:'row', gap: 8, marginTop: 10, justifyContent:'flex-end' }}>
                <A11yPressable onPress={() => setPassModal(null)} style={styles.secondary}><Text style={styles.buttonText}>{t('common.cancel','Cancel')}</Text></A11yPressable>
                <A11yPressable
                  onPress={async () => {
                    try {
                      if (!passModal) return;
                      const pass = passValue.trim();
                      if (!pass) { setPassModal(null); return; }
                      if (passModal.mode === 'export') {
                        // Enforce minimum strength and confirmation match
                        const strongEnough = passStrength.score >= 2; // at least Medium
                        if (!strongEnough) {
                          Alert.alert(t('security.weakPassTitle','Passphrase too weak'), t('security.weakPassBody','Use at least 12 characters with a mix of cases, numbers, and symbols.'));
                          return;
                        }
                        if (passConfirm.trim() !== pass) {
                          Alert.alert(t('security.confirmMismatch','Passphrases do not match'), t('security.confirmMismatchBody','Please re-enter to confirm.'));
                          return;
                        }
                      }
                      if (passModal.mode === 'export') {
                        const path = await exportNotesEncrypted(notes, pass);
                        try {
                          const Sharing = await import('expo-sharing');
                          if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
                          else Alert.alert(t('common.saved','Saved'), t('templates.evidenceLocker.exportSavedCache','Encrypted export saved to cache.'));
                          showToast(t('common.saved','Saved'));
                          try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.export.encrypted', { count: notes.length }); } catch {}
                        } catch {
                          Alert.alert(t('common.saved','Saved'), t('templates.evidenceLocker.exportSavedCache','Encrypted export saved to cache.'));
                          showToast(t('common.saved','Saved'));
                          try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.export.encrypted', { count: notes.length }); } catch {}
                        }
                      } else if (passModal.mode === 'import' && passModal.fileUri) {
                        const imported = await importNotesEncrypted(passModal.fileUri, pass);
                        setNotes(imported);
                        Alert.alert(t('common.imported','Imported'), t('templates.evidenceLocker.importedNotes','Encrypted notes imported.'));
                        showToast(t('common.imported','Imported'));
                        try { const { trackEvent } = await import('../../../services/analyticsClient'); trackEvent('evidence.import.encrypted', { count: imported.length }); } catch {}
                      }
                    } catch {
                      Alert.alert(t('templates.evidenceLocker.importFailedTitle','Operation failed'), t('templates.evidenceLocker.importFailedBody','Could not complete the operation.'));
                    } finally {
                      setPassModal(null);
                      setPassValue('');
                      setPassConfirm('');
                      setPassVisible(false);
                    }
                  }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{t('common.ok','OK')}</Text>
                </A11yPressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
      {toast && (
        <View style={styles.toast} accessibilityLiveRegion="polite" accessible>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
  container: { flex: 1, padding: s('xl'), backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
  countLine: { marginTop: s('xxs'), color: palette.text, opacity: 0.75, fontSize: 14 },
    hintCard: { backgroundColor: palette.card, borderRadius: s('lg'), padding: s('md'), borderWidth: 1, borderColor: palette.muted, marginBottom: s('sm') },
    hintTitle: { color: palette.text, fontWeight: '700', marginBottom: 2 },
    hintText: { color: palette.text, opacity: 0.9 },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
  borderRadius: s('lg'),
  paddingHorizontal: s('md'),
  paddingVertical: s('sm'),
      color: palette.text,
      marginTop: 8,
    },
    button: {
      backgroundColor: palette.primary,
  paddingVertical: s('sm'),
  borderRadius: s('lg'),
  alignItems: "center",
  marginTop: s('sm'),
    },
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
  paddingVertical: s('sm'),
  borderRadius: s('lg'),
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    noteRow: {
  paddingVertical: s('sm'),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    noteText: { color: palette.text },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
  borderRadius: s('xl'),
  paddingHorizontal: s('md'),
  paddingVertical: s('xs'),
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
  gap: s('sm'),
  marginTop: s('md'),
      alignItems: 'center'
    },
    actionBtn: {
  paddingHorizontal: s('md'),
  paddingVertical: s('sm'),
  backgroundColor: palette.surface,
  borderRadius: s('md'),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    actionText: { color: palette.text, fontWeight: '600', fontSize: 13 },
    infoCard: {
      backgroundColor: palette.card,
  borderRadius: s('lg'),
  padding: s('md'),
  marginTop: s('md'),
      borderWidth: 1,
      borderColor: palette.muted
    },
    infoTitle: { fontWeight: '700', color: palette.text, marginBottom: 4 },
    infoLine: { color: palette.text, opacity: 0.85, marginBottom: 2, fontSize: 13 },
    toast: { position: 'absolute', right: 12, bottom: 24, backgroundColor: palette.surface, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal: 12, paddingVertical: 8 },
    toastText: { color: palette.text, fontWeight: '700' },
  });
}
// Simple passphrase prompt using a modal Alert-like flow.

