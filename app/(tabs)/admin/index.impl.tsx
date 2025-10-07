import { useLocalSearchParams } from "expo-router";
import {
    collection,
    deleteDoc,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    query,
    startAfter,
    updateDoc,
    where,
} from "firebase/firestore";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

import A11yPressable from "../../../components/A11yPressable";
import AdminGuard from "../../../components/AdminGuard";
import { HIT_SLOP_8 } from "../../../constants/a11y";
import { db } from "../../../firebase/config";
import { MAX_FONT_SCALE } from "../../../hooks/useA11y";
import { computeActivityStats, logActivity, subscribeToActivityFeed } from "../../../services/activity";
import { listAdminAudit, listAdminAuditAll, subscribeAdminAudit } from "../../../services/adminAudit";
import { createFaq, deleteFaq, subscribeFaqs, updateFaq } from "../../../services/faqs";
import { useAppPalette } from "../../../theme/usePalette";

export const options = { href: null };

type ReviewKind = "pending" | "approved" | "trash";
type ReviewItem = { id: string; type: "mutual" | "rating" } & Record<string, any>;

export default function AdminPanel() {
  const palette = useAppPalette();
  const s = styles(palette);

  const params = useLocalSearchParams<{ tab?: ReviewKind }>();

  const [counts, setCounts] = React.useState<{
    users?: number;
    campaigns?: number;
    resources?: number;
  }>({});

  const [email, setEmail] = React.useState("");
  const [result, setResult] = React.useState<any | null>(null);

  const [users, setUsers] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<any | null>(null);
  const [contains] = React.useState("");
  const [onlyVerified] = React.useState(false);
  const [onlyBanned] = React.useState(false);
  const [sortKey] = React.useState<"email" | "name" | "id">("email");
  const [sortDir] = React.useState<"asc" | "desc">("asc");

  const [flags, setFlags] = React.useState<any[]>([]);
  const [selectedFlags, setSelectedFlags] = React.useState<Record<string, boolean>>(
    {},
  );

  const [reviewTab, setReviewTab] = React.useState<ReviewKind>(
    (params?.tab as ReviewKind) || "pending",
  );
  const [reviewItems, setReviewItems] = React.useState<ReviewItem[]>([]);
  const [activityStats, setActivityStats] = React.useState<{ total:number; since24h:number; byType: Record<string,number>; }>({ total:0, since24h:0, byType:{} });
  const [auditEvents, setAuditEvents] = React.useState<any[]>([]);

  const [broadcastTitle, setBroadcastTitle] = React.useState('');
  const [broadcastBody, setBroadcastBody] = React.useState('');
  // FAQs management
  const [faqs, setFaqs] = React.useState<any[]>([]);
  const [faqQ, setFaqQ] = React.useState('');
  const [faqA, setFaqA] = React.useState('');
  const [editingFaqId, setEditingFaqId] = React.useState<string | null>(null);

  React.useEffect(()=> {
    const unsub = subscribeFaqs(rows => setFaqs(rows));
    return () => unsub();
  }, []);

  // Activity subscription
  React.useEffect(()=> {
    const unsub = subscribeToActivityFeed(evts => {
      setActivityStats(computeActivityStats(evts));
    }, { limit: 200 });
    return () => unsub();
  }, []);

  // Admin audit subscription (latest 50)
  React.useEffect(() => {
    let unsub: (() => void) | null = null;
    try {
      unsub = subscribeAdminAudit((rows) => setAuditEvents(rows.slice(0, 50)), { limit: 50 });
    } catch {
      setAuditEvents([]);
    }
    return () => { try { if (unsub) unsub(); } catch {} };
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const usersCol = collection(db, "users");
        const campaignsCol = collection(db, "campaigns");
        const resourcesCol = collection(db, "resources");
        const [uc, cc, rc] = await Promise.all([
          getCountFromServer(usersCol)
            .then((s) => s.data().count)
            .catch(() => undefined),
          getCountFromServer(campaignsCol)
            .then((s) => s.data().count)
            .catch(() => undefined),
          getCountFromServer(resourcesCol)
            .then((s) => s.data().count)
            .catch(() => undefined),
        ]);
        setCounts({ users: uc, campaigns: cc, resources: rc });
      } catch {}
    })();
  }, []);

  const loadFlags = React.useCallback(async () => {
    try {
      const { listFlags } = await import("../../../services/moderation");
      const rows = await listFlags(100);
      setFlags(rows);
    } catch {}
  }, []);
  React.useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  React.useEffect(() => {
    const t = String(params?.tab || "").toLowerCase();
    if (t === "pending" || t === "approved" || t === "trash") {
      setReviewTab(t as ReviewKind);
    }
  }, [params?.tab]);

  const loadReview = React.useCallback(async () => {
    try {
      const condPending = where("approved", "!=", true);
      const condApproved = where("approved", "==", true);
      const condTrash = where("deleted", "==", true);
      const cond =
        reviewTab === "approved"
          ? condApproved
          : reviewTab === "trash"
          ? condTrash
          : condPending;

      const qMut = query(collection(db, "mutual_aid_posts"), cond, limit(50));
      const qRat = query(collection(db, "ratings"), cond, limit(50));
      const [mutSnap, ratSnap] = await Promise.all([
        getDocs(qMut),
        getDocs(qRat),
      ]);
      const items: ReviewItem[] = [
        ...mutSnap.docs.map((d) => ({
          id: d.id,
          type: "mutual",
          ...(d.data() as any),
        })),
        ...ratSnap.docs.map((d) => ({
          id: d.id,
          type: "rating",
          ...(d.data() as any),
        })),
      ];
      setReviewItems(items);
    } catch {}
  }, [reviewTab]);
  React.useEffect(() => {
    loadReview();
  }, [loadReview]);

  const filteredUsers = React.useMemo(() => {
    const term = (contains || "").toLowerCase().trim();
    const match = (u: any) =>
      (onlyVerified ? u.verified === true : true) &&
      (onlyBanned ? u.banned === true : true) &&
      (!term || `${u.email || ""} ${u.displayName || ""}`.toLowerCase().includes(term));
    return users.filter(match);
  }, [users, contains, onlyVerified, onlyBanned]);
  const sortedUsers = React.useMemo(() => {
    const arr = [...filteredUsers];
    const keyFn = (u: any) =>
      sortKey === "email"
        ? u.email || ""
        : sortKey === "name"
        ? u.displayName || ""
        : u.id || "";
    arr.sort((a, b) => String(keyFn(a)).localeCompare(String(keyFn(b))));
    if (sortDir === "desc") arr.reverse();
    return arr;
  }, [filteredUsers, sortKey, sortDir]);

  return (
    <AdminGuard>
      <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
        <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
          Admin Panel
        </Text>
        <Text style={s.text}>Use this area for admin-only tools and metrics.</Text>
        <Text style={s.text}>To grant admin: set Firebase custom claim admin=true for your UID.</Text>

        <View style={{ marginTop: 8 }}>
          <Text style={s.text}>Counts — Users: {counts.users ?? "-"} | Campaigns: {counts.campaigns ?? "-"} | Resources: {counts.resources ?? "-"}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Admin Audit (latest)</Text>
          <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Export admin audit events as CSV"
              hitSlop={HIT_SLOP_8}
              onPress={async()=>{
                try {
                  const rows = await listAdminAudit({ limit: 1000 });
                  const header = ['ts','actorUid','action','target','details','client_platform','client_version'];
                  const esc = (v: any) => `"${String(v ?? '').replace(/"/g,'""')}"`;
                  const data = rows.map(r => [
                    new Date(r.ts).toISOString(),
                    r.actorUid ?? '',
                    r.action ?? '',
                    r.target ?? '',
                    (r.details ? JSON.stringify(r.details) : ''),
                    r.client?.platform ?? '',
                    r.client?.version ?? ''
                  ].map(esc).join(',')).join('\n');
                  const csv = [header.map(esc).join(','), data].filter(Boolean).join('\n');
                  const FileSystem = await import('expo-file-system');
                  const Sharing = await import('expo-sharing');
                  const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
                  const path = `${baseDir}admin_audit_${Date.now()}.csv`;
                  await (FileSystem as any).writeAsStringAsync(path, csv, { encoding: (FileSystem as any).EncodingType?.UTF8 });
                  try { if (await (Sharing as any).isAvailableAsync?.()) await (Sharing as any).shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Admin Audit CSV' }); }
                  catch {}
                  Alert.alert('Export ready','CSV saved to cache directory.');
                } catch { Alert.alert('Export failed','Could not create CSV.'); }
              }}
              style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
            >
              <Text style={{ color: palette.text, fontWeight:'700' }}>Export CSV</Text>
            </A11yPressable>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Export admin audit events as JSON (paged)"
              hitSlop={HIT_SLOP_8}
              onPress={async()=>{
                try {
                  // Fetch in batches to go beyond Firestore 1000 row practical limits
                  const rows = await listAdminAuditAll({ batchSize: 500, maxDocs: 5000 });
                  const payload = rows.map(r => ({
                    id: (r as any).id || undefined,
                    ts: r.ts,
                    iso: new Date(r.ts).toISOString(),
                    actorUid: r.actorUid ?? null,
                    action: r.action ?? null,
                    target: r.target ?? null,
                    details: r.details ?? null,
                    client: r.client ?? null,
                  }));
                  const json = JSON.stringify({
                    exportedAt: new Date().toISOString(),
                    count: payload.length,
                    items: payload,
                  }, null, 2);
                  const FileSystem = await import('expo-file-system');
                  const Sharing = await import('expo-sharing');
                  const baseDir: any = (FileSystem as any).default?.cacheDirectory || (FileSystem as any).cacheDirectory || (FileSystem as any).default?.documentDirectory;
                  const path = `${baseDir}admin_audit_${Date.now()}.json`;
                  await (FileSystem as any).writeAsStringAsync(path, json, { encoding: (FileSystem as any).EncodingType?.UTF8 });
                  try { if (await (Sharing as any).isAvailableAsync?.()) await (Sharing as any).shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Admin Audit JSON' }); }
                  catch {}
                  Alert.alert('Export ready',`JSON saved to cache (${payload.length} events).`);
                } catch {
                  Alert.alert('Export failed','Could not create JSON export.');
                }
              }}
              style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
            >
              <Text style={{ color: palette.text, fontWeight:'700' }}>Export JSON (All)</Text>
            </A11yPressable>
          </View>
          {auditEvents.length === 0 ? (
            <Text style={s.text}>No recent admin actions.</Text>
          ) : (
            auditEvents.slice(0, 10).map((e) => (
              <View key={e.id} style={{ paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
                <Text style={s.text}>
                  {new Date(e.ts).toLocaleString()} — {e.action}
                  {e.target ? ` · ${e.target}` : ''}
                </Text>
                {e.actorUid ? <Text style={[s.text,{opacity:0.7}]}>by {e.actorUid}</Text> : null}
              </View>
            ))
          )}
        </View>

        {/* Activity Metrics */}
        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Activity Metrics</Text>
        <Text style={s.text}>Events (last 24h / total): {activityStats.since24h} / {activityStats.total}</Text>
        <View style={{ flexDirection:'row', flexWrap:'wrap', gap:6 }}>
          {Object.entries(activityStats.byType).slice(0,12).map(([k,v])=> (
            <View key={k} style={{ backgroundColor: palette.surface, paddingHorizontal:8, paddingVertical:4, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
              <Text style={{ color: palette.text, fontSize:12 }}>{k}: {v}</Text>
            </View>
          ))}
        </View>

        {/* Broadcast Tool */}
        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Broadcast Announcement</Text>
        <TextInput
          value={broadcastTitle}
          onChangeText={setBroadcastTitle}
          placeholder="Title"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
        />
        <TextInput
          value={broadcastBody}
          onChangeText={setBroadcastBody}
          placeholder="Body (optional)"
          multiline
          style={{ borderWidth: StyleSheet.hairlineWidth, minHeight:70, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
        />
        <View style={{ flexDirection:'row', gap:8 }}>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel="Send broadcast announcement"
            disabled={!broadcastTitle.trim()}
            onPress={async ()=> {
              try {
                await logActivity({ type:'broadcast', payload:{ title: broadcastTitle.trim(), body: broadcastBody.trim()||undefined, importance:'info' }, summaryKey:'broadcast.generic' });
                setBroadcastTitle(''); setBroadcastBody(''); Alert.alert('Broadcast sent');
              } catch { Alert.alert('Failed','Could not send broadcast'); }
            }}
            style={{ paddingHorizontal: 14, paddingVertical:10, backgroundColor: palette.primary, borderRadius:6, opacity: broadcastTitle.trim()?1:0.6 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>Send</Text>
          </A11yPressable>
          <A11yPressable
            accessibilityRole="button"
            accessibilityLabel="Clear broadcast form"
            onPress={()=> { setBroadcastTitle(''); setBroadcastBody(''); }}
            style={{ paddingHorizontal: 14, paddingVertical:10, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight:'700' }}>Clear</Text>
          </A11yPressable>
        </View>

        {/* FAQ Management */}
        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>FAQs</Text>
        <Text style={s.text}>Create or edit FAQ entries (remote collection).</Text>
        <TextInput
          value={faqQ}
          onChangeText={setFaqQ}
          placeholder="Question"
          style={{ borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
        />
        <TextInput
          value={faqA}
          onChangeText={setFaqA}
          placeholder="Answer"
          multiline
          style={{ borderWidth: StyleSheet.hairlineWidth, minHeight:70, borderColor: palette.muted, color: palette.text, padding:8, borderRadius:6, marginBottom:6 }}
        />
        <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
          <A11yPressable
            accessibilityLabel={editingFaqId? 'Update FAQ' : 'Create FAQ'}
            disabled={!faqQ.trim() || !faqA.trim()}
            onPress={async ()=> {
              try {
                if (editingFaqId) {
                  await updateFaq(editingFaqId, { q: faqQ.trim(), a: faqA.trim() });
                } else {
                  await createFaq({ q: faqQ.trim(), a: faqA.trim(), source: 'admin' });
                }
                setFaqQ(''); setFaqA(''); setEditingFaqId(null);
              } catch { Alert.alert('Failed','Could not save FAQ'); }
            }}
            style={{ paddingHorizontal:14, paddingVertical:10, backgroundColor: palette.primary, borderRadius:6, opacity: (!faqQ.trim() || !faqA.trim())?0.6:1 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight:'700' }}>{editingFaqId? 'Update' : 'Create'}</Text>
          </A11yPressable>
          {editingFaqId && (
            <A11yPressable
              accessibilityLabel="Cancel editing"
              onPress={()=> { setEditingFaqId(null); setFaqQ(''); setFaqA(''); }}
              style={{ paddingHorizontal:14, paddingVertical:10, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
            >
              <Text style={{ color: palette.text, fontWeight:'700' }}>Cancel</Text>
            </A11yPressable>
          )}
        </View>
        {faqs.map(f => (
          <View key={f.id} style={{ marginBottom:6, paddingBottom:6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
            <Text style={[s.text,{ fontWeight:'700', marginBottom:2 }]}>{f.q}</Text>
            <Text style={[s.text,{ opacity:0.9 }]}>{f.a}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop:4 }}>
              <A11yPressable
                accessibilityLabel="Edit FAQ"
                onPress={()=> { setEditingFaqId(f.id); setFaqQ(f.q); setFaqA(f.a); }}
                style={{ paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
              >
                <Text style={{ color: palette.text, fontWeight:'700' }}>Edit</Text>
              </A11yPressable>
              <A11yPressable
                accessibilityLabel="Delete FAQ"
                onPress={()=> Alert.alert('Delete','Remove this FAQ?', [ { text:'Cancel' }, { text:'Delete', style:'destructive', onPress: async()=> { try { await deleteFaq(f.id); } catch { Alert.alert('Failed','Could not delete'); } } } ]) }
                style={{ paddingHorizontal:10, paddingVertical:6, backgroundColor: palette.surface, borderRadius:6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
              >
                <Text style={{ color: palette.text, fontWeight:'700' }}>Delete</Text>
              </A11yPressable>
            </View>
          </View>
        ))}

        {/* User Lookup */}
        <Text style={[s.text, { marginTop: 16, fontWeight: "700" }]}>User Lookup</Text>
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="email@example.com"
            style={{ flex: 1, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, color: palette.text, padding: 8, borderRadius: 6 }}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <A11yPressable
            onPress={async () => {
              try {
                const col = collection(db, "users");
                const q = query(col, where("email", "==", email.trim()), limit(1));
                const snap = await getDocs(q);
                setResult(snap.docs[0] ? { id: snap.docs[0].id, ...(snap.docs[0].data() as any) } : null);
                if (!snap.docs[0]) Alert.alert("Not found", "No user with that email.");
              } catch (e: any) {
                Alert.alert("Lookup failed", e?.message || "Error");
              }
            }}
            hitSlop={HIT_SLOP_8}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 6 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>Search</Text>
          </A11yPressable>
        </View>
        {!!result && (
          <View style={{ marginTop: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 10 }}>
            <Text style={s.text}>UID: {result.id}</Text>
            <Text style={s.text}>Email: {result.email || "-"}</Text>
            <Text style={s.text}>Name: {result.displayName || "-"}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <A11yPressable
                onPress={async () => {
                  try {
                    await updateDoc(doc(db, "users", result.id), { banned: !(result.banned === true) });
                    setResult({ ...result, banned: !(result.banned === true) });
                  } catch (e: any) { Alert.alert("Update failed", e?.message || "Error"); }
                }}
                hitSlop={HIT_SLOP_8}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>{result.banned ? "Unban" : "Ban"}</Text>
              </A11yPressable>
              <A11yPressable
                onPress={async () => {
                  try {
                    await updateDoc(doc(db, "users", result.id), { verified: !(result.verified === true) });
                    setResult({ ...result, verified: !(result.verified === true) });
                  } catch (e: any) { Alert.alert("Update failed", e?.message || "Error"); }
                }}
                hitSlop={HIT_SLOP_8}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}
              >
                <Text style={{ color: palette.text, fontWeight: "700" }}>{result.verified ? "Unverify" : "Verify"}</Text>
              </A11yPressable>
            </View>
          </View>
        )}

        {/* Users list */}
        <Text style={[s.text, { marginTop: 16, fontWeight: "700" }]}>Users</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <A11yPressable
            onPress={async () => {
              try {
                const col = collection(db, "users");
                const q = cursor ? query(col, limit(20), startAfter(cursor)) : query(col, limit(20));
                const snap = await getDocs(q);
                setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
                setCursor(snap.docs[snap.docs.length - 1] || null);
              } catch (e: any) { Alert.alert("Load failed", e?.message || "Error"); }
            }}
            hitSlop={HIT_SLOP_8}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.primary, borderRadius: 6 }}
          >
            <Text style={{ color: palette.onPrimary, fontWeight: "700" }}>Load / Next</Text>
          </A11yPressable>
          <A11yPressable
            onPress={() => { setCursor(null); setUsers([]); }}
            hitSlop={HIT_SLOP_8}
            style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}
          >
            <Text style={{ color: palette.text, fontWeight: "700" }}>Reset</Text>
          </A11yPressable>
        </View>
        {sortedUsers.map((u) => (
          <View key={u.id} style={{ marginBottom: 6 }}>
            <Text style={s.text}>{u.email || u.id} - {u.displayName || '-'}</Text>
          </View>
        ))}

        {/* Moderation Flags */}
        <Text style={[s.text, { marginTop: 16, fontWeight: "700" }]}>Moderation Flags</Text>
        {flags.length === 0 ? (
          <Text style={s.text}>No flags.</Text>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSelectedFlags(Object.fromEntries(flags.map((f: any) => [f.id, true])))} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Select all</Text></A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSelectedFlags({})} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Clear</Text></A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(Object.keys(selectedFlags).filter(id=>selectedFlags[id]).map(id=> resolveFlag(id))); setSelectedFlags({}); loadFlags(); } catch {} }} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Resolve selected</Text></A11yPressable>
              <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { const sel = flags.filter((f: any)=> selectedFlags[f.id]); for (const f of sel) { if (f.type === 'mutual') { const { softDeletePost } = await import('../../../services/mutual'); await softDeletePost(f.targetId); } if (f.type === 'rating') { await updateDoc(doc(db,'ratings', f.targetId), { deleted: true }); } } const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(sel.map((f: any)=> resolveFlag(f.id))); setSelectedFlags({}); loadFlags(); } catch {} }} style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}><Text style={{ color: palette.text, fontWeight:'700' }}>Delete items</Text></A11yPressable>
            </View>
            {flags.map((f: any) => (
              <View key={f.id} style={{ marginBottom: 6 }}>
                <View style={{ flexDirection:'row', alignItems:'center', gap:8 }}>
                  <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> setSelectedFlags(prev=> ({ ...prev, [f.id]: !prev[f.id] }))} style={{ width: 18, height: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 4, alignItems:'center', justifyContent:'center', backgroundColor: selectedFlags[f.id]? palette.primary: 'transparent' }}>
                    {selectedFlags[f.id] ? <View style={{ width: 10, height: 10, backgroundColor: palette.onPrimary, borderRadius: 2 }} /> : null}
                  </A11yPressable>
                  <Text style={s.text}>[{f.type}] {f.targetId} - {f.reason}</Text>
                </View>
                <View style={{ marginLeft: 26 }}>
                  {f.type === 'mutual' ? (
                    <FlagPreviewMutual targetId={f.targetId} />
                  ) : f.type === 'rating' ? (
                    <FlagPreviewRating targetId={f.targetId} />
                  ) : null}
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <A11yPressable
                    accessibilityLabel={`Resolve flag ${f.id}`}
                    hitSlop={HIT_SLOP_8}
                    onPress={async()=>{ try { const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); Alert.alert('Done','Flag resolved'); loadFlags(); } catch {} }}
                    style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                    <Text style={{ color: palette.text, fontWeight: '700' }}>Resolve</Text>
                  </A11yPressable>
                  <A11yPressable
                    accessibilityLabel="Delete flagged item"
                    hitSlop={HIT_SLOP_8}
                    onPress={async()=>{ try { if (f.type === 'mutual') { const { softDeletePost } = await import('../../../services/mutual'); await softDeletePost(f.targetId); } if (f.type === 'rating') { await updateDoc(doc(db,'ratings', f.targetId), { deleted: true }); } const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); Alert.alert('Done','Item deleted'); loadFlags(); } catch {} }}
                    style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                    <Text style={{ color: palette.text, fontWeight: '700' }}>Delete Item</Text>
                  </A11yPressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Content Review */}
        <Text style={[s.text, { marginTop: 16, fontWeight: '700' }]}>Content Review</Text>
        <View style={{ flexDirection:'row', gap:8, marginBottom: 8 }}>
          {(['pending','approved','trash'] as ReviewKind[]).map(k => (
            <A11yPressable
              key={k}
              accessibilityLabel={`Show ${k} items`}
              hitSlop={HIT_SLOP_8}
              onPress={()=> { setReviewTab(k); loadReview(); }}
              style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: k===reviewTab? palette.primary: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
              <Text style={{ color: k===reviewTab? palette.onPrimary: palette.text, fontWeight: '700' }}>{k}</Text>
            </A11yPressable>
          ))}
          <A11yPressable
            accessibilityLabel="Refresh content review"
            hitSlop={HIT_SLOP_8}
            onPress={loadReview}
            style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: palette.surface, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted }}>
            <Text style={{ color: palette.text, fontWeight: '700' }}>Refresh</Text>
          </A11yPressable>
        </View>
        {reviewItems.map((x) => (
          <View key={`${x.type}:${x.id}`} style={{ marginBottom: 8, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.muted }}>
            <Text style={s.text}>[{x.type}] {x.type==='mutual' ? `${x.type} • ${x.city||''} — ${x.description||''}` : `${x.target||''} • ${x.score||''}★ — ${x.comment||''}`}</Text>
            <View style={{ flexDirection:'row', gap:8, marginTop: 6 }}>
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel="Approve item"
                hitSlop={HIT_SLOP_8}
                onPress={async()=>{ try { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { approved: true, deleted: false }); Alert.alert('Done','Approved'); loadReview(); } catch {} }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                <Text style={{ color: palette.text, fontWeight:'700' }}>Approve</Text>
              </A11yPressable>
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel="Restore item"
                hitSlop={HIT_SLOP_8}
                onPress={async()=>{ try { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { approved: false, deleted: false }); Alert.alert('Done','Restored'); loadReview(); } catch {} }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                <Text style={{ color: palette.text, fontWeight:'700' }}>Restore</Text>
              </A11yPressable>
              <A11yPressable
                accessibilityRole="button"
                accessibilityLabel={reviewTab==='trash' ? 'Purge item' : 'Move item to trash'}
                hitSlop={HIT_SLOP_8}
                onPress={async()=>{ try { if (reviewTab==='trash') { await deleteDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id)); Alert.alert('Done','Purged'); } else { await updateDoc(doc(db, x.type==='mutual'?'mutual_aid_posts':'ratings', x.id), { deleted: true }); Alert.alert('Done','Trashed'); } loadReview(); } catch {} }}
                style={{ paddingHorizontal: 10, paddingVertical: 8, backgroundColor: palette.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 6 }}>
                <Text style={{ color: palette.text, fontWeight:'700' }}>{reviewTab==='trash' ? 'Purge' : 'Trash'}</Text>
              </A11yPressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </AdminGuard>
  );
}

function FlagPreviewMutual({ targetId }: { targetId: string }) {
  const palette = useAppPalette();
  const [p, setP] = React.useState<any | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db,'mutual_aid_posts', targetId));
        setP(snap.data());
      } catch {}
    })();
  }, [targetId]);
  if (!p) return null;
  return (
    <Text style={{ color: palette.text, opacity: 0.8 }}>post: {p.type} • {p.city || '-'} - {p.description}</Text>
  );
}

function FlagPreviewRating({ targetId }: { targetId: string }) {
  const palette = useAppPalette();
  const [r, setR] = React.useState<any | null>(null);
  React.useEffect(() => {
    (async () => {
      try {
        const { getDoc, doc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db,'ratings', targetId));
        setR(snap.data());
      } catch {}
    })();
  }, [targetId]);
  if (!r) return null;
  return (
    <Text style={{ color: palette.text, opacity: 0.8 }}>rating: {r.target} • {r.score}★ - {r.comment || '-'}</Text>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.background },
    title: { fontSize: 22, fontWeight: "700", color: palette.text, marginBottom: 8 },
    text: { color: palette.text, opacity: 0.95, marginBottom: 6 },
    card: { backgroundColor: palette.card, borderWidth: StyleSheet.hairlineWidth, borderColor: palette.muted, borderRadius: 8, padding: 12, marginTop: 10 },
    cardTitle: { color: palette.text, fontWeight: '700', marginBottom: 6 },
  });
}
