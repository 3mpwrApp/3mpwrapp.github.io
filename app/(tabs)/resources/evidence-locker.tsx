import React from "react";
import { View, Text, StyleSheet, TextInput, FlatList, Alert, Pressable, Modal } from "react-native";
import A11yPressable from "../../../components/A11yPressable";
import ProgressBar from "../../../components/ProgressBar";
import { useAuth } from "../../../context/AuthContext";
import { router } from "expo-router";
import { addEvidenceNote, uploadEvidenceFileWithProgress, deleteEvidenceDoc, listEvidencePage, type EvidenceFile } from "../../../services/evidence";
// Linking added when preview links are active; safe to lazy import when needed
import { useAppPalette } from "../../../theme/usePalette";
import {
  MAX_FONT_SCALE,
  useAnnounceOnMount,
  useFocusOnRefOnMount,
} from "../../../hooks/useA11y";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type Attachment = { name: string; uri: string };
type Note = { id: string; text: string; date: string; tags?: string[]; files?: Attachment[] };
type QueueItem = { text: string; tags?: string[]; files?: Attachment[] };
const QUEUE_KEY = "evidence:uploadQueue:v1";

export const options = { href: null };

export default function EvidenceLocker() {
  const palette = useAppPalette();
  const styles = createStyles(palette);
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount("Evidence Locker");
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
  // Immediate upload progress (non-queue)
  const [immUploading, setImmUploading] = React.useState(false);
  const [immPct, setImmPct] = React.useState(0);
  const [immLabel, setImmLabel] = React.useState<string>("");
  // Selection for cloud items
  const [selectedCloud, setSelectedCloud] = React.useState<Record<string, boolean>>({});
  // Upload progress state can be surfaced later
  const { user } = useAuth();

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      try {
        const raw = await AsyncStorage.getItem("evidence:notes:v1");
        if (raw) setNotes(JSON.parse(raw));
      } catch {}
    })();
  }, []);
  React.useEffect(() => {
    (async () => {
      if (AsyncStorage)
        await AsyncStorage.setItem("evidence:notes:v1", JSON.stringify(notes));
    })();
  }, [notes]);

  // Offline upload queue helpers
  const enqueueFailed = async (item: QueueItem) => {
    try {
      const raw = (await AsyncStorage?.getItem?.(QUEUE_KEY)) || "[]";
      const arr = JSON.parse(raw);
      arr.push(item);
      await AsyncStorage?.setItem?.(QUEUE_KEY, JSON.stringify(arr));
    } catch {}
  };

  const processQueue = async () => {
    try {
      setProcessing(true);
      setProgressPct(0);
      const raw = (await AsyncStorage?.getItem?.(QUEUE_KEY)) || "[]";
      const arr: QueueItem[] = JSON.parse(raw);
      if (!arr.length) {
        Alert.alert("Queue", "No pending items.");
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
                (pct) => setProgressPct(Math.round(((i + pct / 100) / arr.length) * 100)),
              ),
            );
          }
        }
        await addEvidenceNote({ text: n.text, tags: n.tags, files: uploaded });
        setProgressPct(Math.round(((i + 1) / arr.length) * 100));
      }
      await AsyncStorage?.setItem?.(QUEUE_KEY, JSON.stringify([]));
      Alert.alert("Queue", "Processed all queued items.");
    } catch {
      Alert.alert("Queue", "Some items could not be processed.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel="Evidence Locker screen"
      accessible
    >
      <Text
        ref={titleRef}
        style={styles.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Evidence Locker
      </Text>
      {isAdmin && (
        <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
          <A11yPressable onPress={()=> router.push('/(tabs)/admin' as any)} style={styles.secondary}><Text style={styles.buttonText}>Admin Pending</Text></A11yPressable>
          <A11yPressable onPress={()=> router.push('/(tabs)/admin' as any)} style={styles.secondary}><Text style={styles.buttonText}>Admin Trash</Text></A11yPressable>
        </View>
      )}
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Add a note (date, contact, summary)"
        placeholderTextColor={palette.text + "77"}
        style={styles.input}
      />
      {isAdmin && (
        <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
          <A11yPressable onPress={()=> setShowDeleted(v=>!v)} style={styles.secondary}><Text style={styles.buttonText}>{showDeleted? 'Showing Trash':'Show Trash'}</Text></A11yPressable>
        </View>
      )}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['call','letter','medical','decision','payment','email'].map((t) => (
          <A11yPressable key={t} onPress={() => setTag(t)} style={[styles.chip, tag===t && styles.chipActive]}>
            <Text style={[styles.chipText, tag===t && styles.chipTextActive]}>{t.toUpperCase()}</Text>
          </A11yPressable>
        ))}
      </View>
      {/* Filters */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {['','call','letter','medical','decision','payment','email'].map((t) => (
          <A11yPressable key={`f-${t||'all'}`} onPress={() => setFilter(t)} style={[styles.chip, filter===t && styles.chipActive]}>
            <Text style={[styles.chipText, filter===t && styles.chipTextActive]}>{(t||'all').toUpperCase()}</Text>
          </A11yPressable>
        ))}
      </View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search text"
        placeholderTextColor={palette.text + '77'}
        style={[styles.input, { marginTop: 8 }]}
      />
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <A11yPressable
          accessibilityLabel="Attach file"
          onPress={async () => {
            try {
              const Doc = await import('expo-document-picker');
              const res = await Doc.getDocumentAsync({ multiple: false });
              if (res.canceled || !res.assets?.length) return;
              const file = res.assets[0];
              setNotes([{ id: String(Date.now()), text: text.trim() || file.name || 'Attachment', date: new Date().toISOString(), tags: tag? [tag]: [], files: [{ name: file.name || 'file', uri: file.uri }] }, ...notes]);
              setText(''); setTag('');
            } catch {
              Alert.alert('Attach unavailable', 'Document picker not available in this build.');
            }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>Attach file</Text>
        </A11yPressable>
        <A11yPressable
          accessibilityLabel="Add note"
          onPress={() => {
            if (!text.trim()) return;
            setNotes([{ id: String(Date.now()), text: text.trim(), date: new Date().toISOString(), tags: tag? [tag]: [] }, ...notes]);
            setText(''); setTag('');
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add</Text>
        </A11yPressable>
        {user && (
          <A11yPressable
            accessibilityLabel="Save to Cloud"
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
                      ),
                    );
                    idx++;
                  }
                }
                await addEvidenceNote({ text: current.text, tags: current.tags, files: uploaded });
                Alert.alert('Saved', 'Note saved to your cloud locker.');
              } catch (e: any) {
                if (snapshot) await enqueueFailed({ text: snapshot.text, tags: snapshot.tags, files: snapshot.files });
                Alert.alert('Save failed', 'Queued to upload later.');
              } finally {
                setImmUploading(false); setImmPct(0); setImmLabel("");
              }
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Save to Cloud</Text>
          </A11yPressable>
        )}\n        {immUploading && (<><Text style={{ color: palette.text, marginTop: 6 }}>{immLabel || "Uploading"} {immPct}%</Text><ProgressBar value={immPct} /></>)}
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
                          ),
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
                Alert.alert('Saved', 'Finished saving notes (failures queued).');
              } catch {
                Alert.alert('Save failed', 'Could not save some items.');
              } finally { setImmUploading(false); setImmPct(0); setImmLabel(''); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>Save all to Cloud</Text>
          </A11yPressable>
        )}
        {processing && (
          <View style={{ marginTop: 8 }}>
            <Text style={{ color: palette.text, marginBottom: 4 }}>Processing queue: {progressPct}%</Text>
            <ProgressBar value={progressPct} />
          </View>
        )}
        {user && (
          <A11yPressable
            accessibilityLabel="Process queue"
            onPress={processQueue}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>Process queue</Text>
          </A11yPressable>
        )}
        {user && (
          <A11yPressable
            accessibilityLabel="Load Cloud"
            onPress={async () => {
              try { const { items, cursor } = await listEvidencePage(10, null); setCloudItems(items); setCloudCursor(cursor); Alert.alert('Cloud', `${items.length} items loaded.`); }
              catch { Alert.alert('Load failed', 'Unable to load cloud items'); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>Load Cloud</Text>
          </A11yPressable>
        )}
        {user && cloudCursor && (
          <A11yPressable
            accessibilityLabel="Load more Cloud"
            onPress={async () => {
              try { const { items, cursor } = await listEvidencePage(10, cloudCursor); setCloudItems(prev => prev.concat(items)); setCloudCursor(cursor); }
              catch { Alert.alert('Load failed', 'Unable to load more'); }
            }}
            style={styles.secondary}
          >
            <Text style={styles.buttonText}>Load more</Text>
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
              try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) { await Sharing.shareAsync(path); } else { Alert.alert('Saved','CSV saved to cache.'); } }
              catch { Alert.alert('Saved','CSV saved to cache (sharing unavailable).'); }
            } catch { Alert.alert('Export failed','Could not create CSV.'); }
          }}
          style={styles.secondary}
        >
          <Text style={styles.buttonText}>Export CSV</Text>
        </A11yPressable>
      </View>
      {/* Queue screen */}
      <A11yPressable onPress={() => (require('expo-router').router.push('/(tabs)/resources/evidence-queue'))} style={[styles.button, { marginTop: 8 }]}>
        <Text style={styles.buttonText}>Open Upload Queue</Text>
      </A11yPressable>
      {(immUploading || processing) && (
        <View style={{ marginTop: 6 }}>
          <Text style={{ color: palette.text }}>
            {processing ? `Processing queue: ${progressPct}%` : immLabel ? `Uploading ${immLabel}: ${immPct}%` : `Uploading: ${immPct}%`}
          </Text>
          <View style={{ marginTop: 6 }}>
            <ProgressBar value={processing ? progressPct : immPct} />
          </View>
        </View>
      )}
      <FlatList
        data={notes.filter(n => (!filter || n.tags?.includes(filter)) && (!query || n.text.toLowerCase().includes(query.toLowerCase())))}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <View style={styles.noteRow}>
            <Text style={styles.noteText}>
              {new Date(item.date).toLocaleString()} — {item.text}
            </Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 12 }}
      />
      {!!user && cloudItems.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.title}>Cloud items</Text>
          <A11yPressable
            onPress={async () => {
              try {
                Alert.alert('Delete all?', 'This will delete all cloud items in your Evidence Locker.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                      for (const c of cloudItems) { await deleteEvidenceDoc(c.id); }
                      setCloudItems([]);
                      Alert.alert('Deleted', 'All cloud items deleted.');
                    } catch { Alert.alert('Delete failed','Unable to delete all items.'); }
                  }}
                ]);
              } catch {}
            }}
            style={[styles.secondary, { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10 }]}
          >
            <Text style={styles.buttonText}>Delete all</Text>
          </A11yPressable>
          {Object.values(selectedCloud).some(Boolean) && (
            <A11yPressable
              onPress={async () => {
                try {
                  const ids = Object.keys(selectedCloud).filter((k) => selectedCloud[k]);
                  for (const id of ids) { await deleteEvidenceDoc(id); }
                  setCloudItems((prev) => prev.filter((x) => !selectedCloud[x.id]));
                  setSelectedCloud({});
                  Alert.alert('Deleted', 'Selected items deleted.');
                } catch { Alert.alert('Delete failed','Unable to delete selected items.'); }
              }}
              style={[styles.secondary, { marginTop: 6, alignSelf: 'flex-start', paddingHorizontal: 10 }]}
            >
              <Text style={styles.buttonText}>Delete selected</Text>
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
                      <Pressable onPress={() => setPreview({ url: c.files[0].url, name: c.files[0].name })}>
                        <Image source={{ uri: c.files[0].url }} style={{ width: 100, height: 60, borderRadius: 6 }} />
                      </Pressable>
                    ); } catch { return null; } })()}
                  </View>
                ) : null}
              </View>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityLabel={selectedCloud[c.id] ? 'Unselect item' : 'Select item'}
                accessibilityState={{ checked: !!selectedCloud[c.id] }}
                onPress={() => setSelectedCloud((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                style={{ width: 22, height: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: selectedCloud[c.id] ? palette.primary : 'transparent' }}
              >
                {selectedCloud[c.id] ? (<View style={{ width: 12, height: 12, backgroundColor: palette.onPrimary, borderRadius: 2 }} />) : null}
              </Pressable>
              <A11yPressable
                onPress={async () => {
                  const ok = await deleteEvidenceDoc(c.id);
                  if (ok) setCloudItems((prev) => prev.filter((x) => x.id !== c.id));
                }}
                style={[styles.secondary, { paddingHorizontal: 10 }]}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </A11yPressable>
            </View>
          ))}
        </View>
      )}
      {/* Preview Modal */}
      {preview && (
        <Modal transparent animationType="fade" onRequestClose={() => setPreview(null)}>
          <Pressable style={{ flex:1, backgroundColor:'#000a', alignItems:'center', justifyContent:'center' }} onPress={()=>setPreview(null)}>
            <View style={{ backgroundColor: palette.surface, padding: 10, borderRadius: 8, maxWidth: '90%', maxHeight: '90%' }}>
              {(() => { try { const { Image } = require('expo-image'); return (
                <Image source={{ uri: preview.url }} style={{ width: 320, height: 200, borderRadius: 6 }} contentFit="contain" />
              ); } catch { return (<Text style={{ color: palette.text }}>Preview unavailable</Text>); } })()}
              <View style={{ flexDirection:'row', gap:8, marginTop: 8 }}>
                <A11yPressable onPress={async()=>{ try { const Sharing = await import('expo-sharing'); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(preview.url); } catch {} }} style={styles.secondary}><Text style={styles.buttonText}>Share</Text></A11yPressable>
                <A11yPressable onPress={async()=>{ try { const Web = await import('expo-web-browser'); await Web.openBrowserAsync(preview.url); } catch {} }} style={styles.secondary}><Text style={styles.buttonText}>Open</Text></A11yPressable>
                <A11yPressable onPress={()=> setPreview(null)} style={styles.secondary}><Text style={styles.buttonText}>Close</Text></A11yPressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

function createStyles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: palette.text,
      marginTop: 8,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 8,
    },
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: { color: palette.onPrimary, fontWeight: "700" },
    noteRow: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    noteText: { color: palette.text },
    chip: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    chipText: { color: palette.text },
    chipTextActive: { color: palette.onPrimary, fontWeight: "700" },
  });
}

