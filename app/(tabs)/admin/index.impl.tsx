// pii-scan-ignore-file - Contains example/contact email addresses for admin display
/* eslint-disable no-restricted-syntax */
// import { useLocalSearchParams } from "expo-router";
import {
    collection,
    doc,
    getCountFromServer,
    getDocs,
    limit,
    query,
    startAfter,
    updateDoc,
    where
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
import GapView from "../../../components/GapView";
import { HIT_SLOP_8 } from "../../../constants/A11Y";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../firebase/config";
import { MAX_FONT_SCALE } from "../../../hooks/useA11y";
import { computeActivityStats, logActivity, subscribeToActivityFeed } from "../../../services/activity";
import { isFirestoreEnabledForUser } from "../../../services/dataPolicy";
import { useAppPalette } from "../../../theme/usePalette";

import * as AdminLazy from "./_lazy";

export const options = { href: null };

// review kind managed within lazy subpanel

export default function AdminPanel() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { user } = useAuth();
  const firestoreEnabled = isFirestoreEnabledForUser(user?.email);

  // const params = useLocalSearchParams<{ tab?: ReviewKind }>();

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

  // Content review tab state managed inside lazy panel
  const [activityStats, setActivityStats] = React.useState<{ total:number; since24h:number; byType: Record<string,number>; }>({ total:0, since24h:0, byType:{} });

  const [broadcastTitle, setBroadcastTitle] = React.useState('');
  const [broadcastBody, setBroadcastBody] = React.useState('');
  // Heavy subpanels are now lazy-loaded components

  // Activity subscription
  React.useEffect(()=> {
    const unsub = subscribeToActivityFeed(evts => {
      setActivityStats(computeActivityStats(evts));
    }, { limit: 200 });
    return () => unsub();
  }, []);

  // Admin audit subscription moved inside AuditPanel component

  React.useEffect(() => {
    if (!db || !firestoreEnabled) return; // Skip if Firestore not enabled for this user
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
  }, [firestoreEnabled]);

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

  // Content review moved to lazy-loaded panel

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
        {/* Header */}
        <View style={s.headerCard}>
          <Text accessibilityRole="header" style={s.title} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            🛠️ Admin Panel
          </Text>
          <Text style={s.subtitle}>Manage users, content, and system configuration</Text>
          {user?.email && (
            <View style={s.adminBadge}>
              <Text style={s.adminBadgeText}>👤 {user.email}</Text>
              <Text style={s.adminBadgeLabel}>Administrator</Text>
            </View>
          )}
        </View>

        {!firestoreEnabled ? (
          <View style={s.warningCard}>
            <Text style={s.warningTitle}>⚠️ Limited Access</Text>
            <Text style={s.warningText}>
              Firestore features are not available. Only activity logs and broadcast tools accessible.
              {user?.email !== 'empowrapp08162025@gmail.com' && ' (Admin-only features require authorized account)'}
            </Text>
          </View>
        ) : (
          <View style={s.successCard}>
            <Text style={s.successTitle}>✅ Full Admin Access</Text>
            <Text style={s.successText}>Firestore enabled • All admin features available</Text>
          </View>
        )}

        {firestoreEnabled && (
          <View style={s.statsCard}>
            <Text style={s.cardTitle}>📊 System Overview</Text>
            <GapView style={{ flexDirection:'row', flexWrap:'wrap', marginTop:8 }} gap={12}>
              <StatBox title="Users" value={counts.users ?? "-"} palette={palette} />
              <StatBox title="Campaigns" value={counts.campaigns ?? "-"} palette={palette} />
              <StatBox title="Resources" value={counts.resources ?? "-"} palette={palette} />
            </GapView>
          </View>
        )}

        <React.Suspense fallback={<LoadingCard title="Admin Audit" />}>
          <AdminLazy.AuditPanel />
        </React.Suspense>

        {/* Activity Metrics */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📈 Activity Metrics</Text>
          <View style={{ marginTop:8, marginBottom:12 }}>
            <Text style={s.statLabel}>Recent Activity (24h / Total)</Text>
            <Text style={s.statValue}>{activityStats.since24h} / {activityStats.total} events</Text>
          </View>
          <Text style={[s.text, { marginBottom:8, fontWeight:'600' }]}>By Type:</Text>
          <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={6}>
            {Object.entries(activityStats.byType).slice(0,12).map(([k,v])=> (
              <View key={k} style={s.badge}>
                <Text style={s.badgeText}>{k}: {v}</Text>
              </View>
            ))}
          </GapView>
        </View>

        {/* Broadcast Tool */}
        <View style={s.card}>
          <Text style={s.cardTitle}>📢 Broadcast Announcement</Text>
          <Text style={[s.text, { marginBottom:12 }]}>Send system-wide notifications to all users</Text>
          <TextInput
            value={broadcastTitle}
            onChangeText={setBroadcastTitle}
            placeholder="Announcement title"
            placeholderTextColor={palette.text + '66'}
            style={s.input}
          />
          <TextInput
            value={broadcastBody}
            onChangeText={setBroadcastBody}
            placeholder="Message body (optional)"
            placeholderTextColor={palette.text + '66'}
            multiline={true}
            style={[s.input, { minHeight:70, textAlignVertical:'top' }]}
          />
          <GapView style={{ flexDirection:'row' }} gap={8}>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Send broadcast announcement"
              disabled={!broadcastTitle.trim()}
              onPress={async ()=> {
                try {
                  await logActivity({ type:'broadcast', payload:{ title: broadcastTitle.trim(), body: broadcastBody.trim()||undefined, importance:'info' }, summaryKey:'broadcast.generic' });
                  setBroadcastTitle(''); setBroadcastBody(''); Alert.alert('✅ Success', 'Broadcast sent to all users');
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                  Alert.alert('❌ Error', `Could not send broadcast: ${errorMessage}`);
                }
              }}
              style={[s.primaryButton, { opacity: broadcastTitle.trim()?1:0.5 }]}
            >
              <Text style={s.primaryButtonText}>Send Broadcast</Text>
            </A11yPressable>
            <A11yPressable
              accessibilityRole="button"
              accessibilityLabel="Clear broadcast form"
              onPress={()=> { setBroadcastTitle(''); setBroadcastBody(''); }}
              style={s.secondaryButton}
            >
              <Text style={s.secondaryButtonText}>Clear</Text>
            </A11yPressable>
          </GapView>
        </View>

        <React.Suspense fallback={<LoadingCard title="FAQ Editor" />}>
          <AdminLazy.FaqEditor />
        </React.Suspense>

        {firestoreEnabled && (
          <>
            {/* User Lookup */}
            <View style={s.card}>
              <Text style={s.cardTitle}>🔍 User Lookup</Text>
              <Text style={[s.text, { marginBottom:12 }]}>Search for users by email address</Text>
              <GapView style={{ flexDirection: "row", alignItems: "center" }} gap={8}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="user@example.com"
                  placeholderTextColor={palette.text + '66'}
                  style={[s.input, { flex: 1, marginBottom:0 }]}
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
                      Alert.alert("Search failed", e?.message || "Error");
                    }
                  }}
                  hitSlop={HIT_SLOP_8}
                  style={s.primaryButton}
                >
                  <Text style={s.primaryButtonText}>Search</Text>
                </A11yPressable>
              </GapView>
              {!!result && (
                <View style={s.resultCard}>
                  <Text style={[s.text, { fontWeight:'600', marginBottom:6 }]}>User Details:</Text>
                  <Text style={s.text}>UID: {result.id}</Text>
                  <Text style={s.text}>Email: {result.email || "-"}</Text>
                  <Text style={s.text}>Name: {result.displayName || "-"}</Text>
                  <Text style={s.text}>Status: {result.banned ? '🚫 Banned' : result.verified ? '✅ Verified' : '⏳ Unverified'}</Text>
                  <GapView style={{ flexDirection: "row", marginTop: 12 }} gap={8}>
                    <A11yPressable
                      onPress={async () => {
                        try {
                          await updateDoc(doc(db, "users", result.id), { banned: !(result.banned === true) });
                          setResult({ ...result, banned: !(result.banned === true) });
                          Alert.alert('✅ Success', result.banned ? 'User unbanned' : 'User banned');
                        } catch (e: any) { Alert.alert("Update failed", e?.message || "Error"); }
                      }}
                      hitSlop={HIT_SLOP_8}
                      style={s.secondaryButton}
                    >
                      <Text style={s.secondaryButtonText}>{result.banned ? "Unban User" : "Ban User"}</Text>
                    </A11yPressable>
                    <A11yPressable
                      onPress={async () => {
                        try {
                          await updateDoc(doc(db, "users", result.id), { verified: !(result.verified === true) });
                          setResult({ ...result, verified: !(result.verified === true) });
                          Alert.alert('✅ Success', result.verified ? 'User unverified' : 'User verified');
                        } catch (e: any) { Alert.alert("Update failed", e?.message || "Error"); }
                      }}
                      hitSlop={HIT_SLOP_8}
                      style={s.secondaryButton}
                    >
                      <Text style={s.secondaryButtonText}>{result.verified ? "Unverify" : "Verify User"}</Text>
                    </A11yPressable>
                  </GapView>
                </View>
              )}
            </View>

        {/* Users list */}
        <View style={s.card}>
          <Text style={s.cardTitle}>👥 User Management</Text>
          <Text style={[s.text, { marginBottom:12 }]}>Browse all registered users</Text>
          <GapView style={{ flexDirection: "row", flexWrap: "wrap" }} gap={8}>
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
              style={s.primaryButton}
            >
              <Text style={s.primaryButtonText}>Load / Next 20</Text>
            </A11yPressable>
            <A11yPressable
              onPress={() => { setCursor(null); setUsers([]); }}
              hitSlop={HIT_SLOP_8}
              style={s.secondaryButton}
            >
              <Text style={s.secondaryButtonText}>Reset</Text>
            </A11yPressable>
          </GapView>
          {sortedUsers.length > 0 && (
            <View style={{ marginTop:12 }}>
              {sortedUsers.map((u) => (
                <View key={u.id} style={s.userRow}>
                  <Text style={s.text}>{u.email || u.id}</Text>
                  <Text style={[s.text, { fontSize:12, color: palette.textSecondary }]}>{u.displayName || 'No name'}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Moderation Flags */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🚩 Moderation Flags</Text>
          <Text style={[s.text, { marginBottom:12 }]}>Review user-reported content</Text>
          {flags.length === 0 ? (
            <Text style={[s.text, { fontStyle:'italic', color: palette.textSecondary }]}>No active flags</Text>
          ) : (
            <>
              <GapView style={{ flexDirection: 'row', marginBottom: 12, flexWrap: 'wrap' }} gap={8}>
                <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSelectedFlags(Object.fromEntries(flags.map((f: any) => [f.id, true])))} style={s.secondaryButton}><Text style={s.secondaryButtonText}>Select All</Text></A11yPressable>
                <A11yPressable hitSlop={HIT_SLOP_8} onPress={() => setSelectedFlags({})} style={s.secondaryButton}><Text style={s.secondaryButtonText}>Clear Selection</Text></A11yPressable>
                <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(Object.keys(selectedFlags).filter(id=>selectedFlags[id]).map(id=> resolveFlag(id))); setSelectedFlags({}); loadFlags(); Alert.alert('✅ Success','Selected flags resolved'); } catch {} }} style={s.primaryButton}><Text style={s.primaryButtonText}>Resolve Selected</Text></A11yPressable>
                <A11yPressable hitSlop={HIT_SLOP_8} onPress={async()=>{ try { const sel = flags.filter((f: any)=> selectedFlags[f.id]); for (const f of sel) { if (f.type === 'mutual') { const { softDeletePost } = await import('../../../services/mutual'); await softDeletePost(f.targetId); } if (f.type === 'rating') { await updateDoc(doc(db,'ratings', f.targetId), { deleted: true }); } } const { resolveFlag } = await import('../../../services/moderation'); await Promise.all(sel.map((f: any)=> resolveFlag(f.id))); setSelectedFlags({}); loadFlags(); Alert.alert('✅ Success','Items deleted'); } catch {} }} style={[s.primaryButton, { backgroundColor: palette.error || '#B91C1C' }]}><Text style={s.primaryButtonText}>Delete Items</Text></A11yPressable>
              </GapView>
              {flags.map((f: any) => (
                <View key={f.id} style={s.flagCard}>
                  <GapView style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }} gap={8}>
                    <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=> setSelectedFlags(prev=> ({ ...prev, [f.id]: !prev[f.id] }))} style={s.checkbox}>
                      {selectedFlags[f.id] ? <View style={s.checkboxChecked} /> : null}
                    </A11yPressable>
                    <View style={{ flex:1 }}>
                      <Text style={[s.text, { fontWeight:'600' }]}>{f.type.toUpperCase()} • ID: {f.targetId.slice(0,8)}...</Text>
                      <Text style={s.text}>Reason: {f.reason}</Text>
                    </View>
                  </GapView>
                  <View style={{ marginLeft: 26, marginBottom:8 }}>
                    {f.type === 'mutual' ? (
                      <FlagPreviewMutual targetId={f.targetId} />
                    ) : f.type === 'rating' ? (
                      <FlagPreviewRating targetId={f.targetId} />
                    ) : null}
                  </View>
                  <GapView style={{ flexDirection: 'row', marginLeft:26 }} gap={8}>
                    <A11yPressable
                      accessibilityLabel={`Resolve flag ${f.id}`}
                      hitSlop={HIT_SLOP_8}
                      onPress={async()=>{ try { const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); Alert.alert('✅ Done','Flag resolved'); loadFlags(); } catch {} }}
                      style={s.secondaryButton}>
                      <Text style={s.secondaryButtonText}>Resolve</Text>
                    </A11yPressable>
                    <A11yPressable
                      accessibilityLabel="Delete flagged item"
                      hitSlop={HIT_SLOP_8}
                      onPress={async()=>{ try { if (f.type === 'mutual') { const { softDeletePost } = await import('../../../services/mutual'); await softDeletePost(f.targetId); } if (f.type === 'rating') { await updateDoc(doc(db,'ratings', f.targetId), { deleted: true }); } const { resolveFlag } = await import('../../../services/moderation'); await resolveFlag(f.id); Alert.alert('✅ Done','Item deleted'); loadFlags(); } catch {} }}
                      style={[s.secondaryButton, { borderColor: palette.error || '#B91C1C' }]}>
                      <Text style={[s.secondaryButtonText, { color: palette.error || '#B91C1C' }]}>Delete Item</Text>
                    </A11yPressable>
                  </GapView>
                </View>
              ))}
            </>
          )}
        </View>
        </>
        )}

        <React.Suspense fallback={<LoadingCard title="Content Review" />}>
          <AdminLazy.ContentReview />
        </React.Suspense>
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
    <Text style={{ color: palette.textSecondary, fontSize:13 }}>
      Post: {p.type} • {p.city || '-'} - {p.description}
    </Text>
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
    <Text style={{ color: palette.textSecondary, fontSize:13 }}>
      Rating: {r.target} • {r.score}★ - {r.comment || '-'}
    </Text>
  );
}

function StatBox({ title, value, palette }: { title: string; value: number | string; palette: ReturnType<typeof useAppPalette> }) {
  return (
    <View style={{ 
      flex:1, 
      minWidth:100, 
      backgroundColor: palette.surface, 
      padding:12, 
      borderRadius:8, 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted,
      alignItems:'center'
    }}>
      <Text style={{ color: palette.text, fontSize:24, fontWeight:'700', marginBottom:4 }}>{value}</Text>
      <Text style={{ color: palette.textSecondary, fontSize:12 }}>{title}</Text>
    </View>
  );
}

function LoadingCard({ title }: { title: string }) {
  const palette = useAppPalette();
  return (
    <View style={{ 
      backgroundColor: palette.card, 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16, 
      marginTop: 16 
    }}>
      <Text style={{ color: palette.text, fontWeight: '700', marginBottom: 8 }}>{title}</Text>
      <Text style={{ color: palette.textSecondary }}>Loading…</Text>
    </View>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: palette.background 
    },
    headerCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    title: { 
      fontSize: 28, 
      fontWeight: "800", 
      color: palette.text, 
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: palette.textSecondary,
      marginBottom: 12,
    },
    adminBadge: {
      backgroundColor: palette.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: palette.primary + '40',
      marginTop: 8,
    },
    adminBadgeText: {
      color: palette.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    adminBadgeLabel: {
      color: palette.primary,
      fontSize: 11,
      opacity: 0.8,
      marginTop: 2,
    },
    warningCard: {
      backgroundColor: palette.warning || palette.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    warningTitle: {
      color: palette.onPrimary,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 6,
    },
    warningText: {
      color: palette.onPrimary,
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.95,
    },
    successCard: {
      backgroundColor: palette.success || '#0F766E', // WCAG AAA teal
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    successTitle: {
      color: palette.onPrimary,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 6,
    },
    successText: {
      color: palette.onPrimary,
      fontSize: 14,
      opacity: 0.95,
    },
    statsCard: {
      backgroundColor: palette.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    card: {
      backgroundColor: palette.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 16,
      marginTop: 16,
    },
    cardTitle: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 18,
      marginBottom: 8,
    },
    text: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
    statLabel: {
      color: palette.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 4,
    },
    badge: {
      backgroundColor: palette.surface,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    badgeText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '500',
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      color: palette.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      fontSize: 14,
      backgroundColor: palette.surface,
    },
    primaryButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontWeight: '700',
      fontSize: 14,
    },
    secondaryButton: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    secondaryButtonText: {
      color: palette.text,
      fontWeight: '700',
      fontSize: 14,
    },
    resultCard: {
      marginTop: 12,
      padding: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    userRow: {
      paddingVertical: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: palette.muted,
    },
    flagCard: {
      marginBottom: 12,
      padding: 12,
      backgroundColor: palette.surface,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: palette.muted,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      width: 12,
      height: 12,
      backgroundColor: palette.primary,
      borderRadius: 2,
    },
  });
}
