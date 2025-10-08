import type { Href } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc, where } from "firebase/firestore";
import React from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from "react-native";

import A11yPressable from '../../../components/A11yPressable';
import { HIT_SLOP_8, touchTarget } from "../../../constants/a11y";
import { useAuth } from "../../../context/AuthContext";
import { channels as seedChannels } from "../../../data/community";
import { db } from "../../../firebase/config";
import { useBlocks } from "../../../store/blocks";
import { CommunityProvider } from "../../../store/community";
import { colors, type Palette } from "../../../theme/colors";

function ChannelInner() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const scheme = useColorScheme();
	const palette = scheme === "dark" ? colors.dark : colors.light;
	const styles = createStyles(palette);
	const [title, setTitle] = React.useState("");
	const { isAdmin } = useAuth();
	const [items, setItems] = React.useState<any[]>([]);
	const [cursor, setCursor] = React.useState<any>(null);
	const [refreshing, setRefreshing] = React.useState(false);
	const pageSize = 10;
	const { blockUser, isBlocked } = useBlocks();

	// Resolve the channel by slug to get the stable channelId
	const channel = React.useMemo(() => seedChannels.find(c => c.slug === String(slug)), [slug]);

	const loadPage = React.useCallback(async (reset = false) => {
		if (!slug || !channel) return;
		try {
			const col = collection(db, 'threads');
			// Threads are stored with channelId not channel slug
			let q = query(col, where('channelId','==', String(channel.id)), orderBy('createdAt','desc'), limit(pageSize));
			if (!reset && cursor) q = query(col, where('channelId','==', String(channel.id)), orderBy('createdAt','desc'), startAfter(cursor), limit(pageSize));
			const snap = await getDocs(q);
			const newItems = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
			setItems(reset ? newItems : [...items, ...newItems]);
			setCursor(snap.docs[snap.docs.length-1] || null);
		} catch {}
	}, [slug, channel, cursor, items]);

	React.useEffect(() => { setItems([]); setCursor(null); loadPage(true); }, [slug, channel]);

	const onRefresh = React.useCallback(async () => { setRefreshing(true); await loadPage(true); setRefreshing(false); }, [loadPage]);

	return (
		<View
			style={styles.container}
			accessibilityLabel={`Channel ${channel?.title ?? slug}`}
			accessible
		>
			<Text style={styles.title}>{channel?.title ?? String(slug)}</Text>

			<View
				style={styles.newBox}
				accessible
				accessibilityLabel="Create a new thread"
			>
				<TextInput
					style={styles.input}
					placeholder="Start a new thread"
					placeholderTextColor={palette.muted}
					value={title}
					onChangeText={setTitle}
				/>
				<A11yPressable
					onPress={() => {
						if (!title.trim()) return;
						// Compose navigates to composer with channel slug context
						router.push((`/(tabs)/community/compose?slug=${encodeURIComponent(String(slug))}`) as Href);
					}}
					accessibilityRole="button"
					accessibilityLabel="Create thread"
					hitSlop={HIT_SLOP_8}
					style={({ pressed }) => [
						styles.cta,
						touchTarget.min,
						{ opacity: pressed ? 0.7 : 1 },
					]}
				>
					<Text style={styles.ctaText}>Post</Text>
				</A11yPressable>
			</View>

			<FlatList
				data={items}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<A11yPressable
						onPress={() =>
							router.push(`/(tabs)/community/threads/${item.id}` as Href)
						}
						accessibilityRole="button"
						accessibilityLabel={`Open thread ${item.title}`}
						hitSlop={HIT_SLOP_8}
						style={({ pressed }) => [
							styles.threadRow,
							touchTarget.min,
							{ opacity: pressed ? 0.7 : 1 },
						]}
					>
						<Text style={styles.threadTitle}>{item.title}</Text>
						<Text style={styles.threadMeta}>
							{(() => {
								const ts: any = item.createdAt;
								const ms = typeof ts === 'number' ? ts : ts?.toDate?.()?.getTime?.() ?? Date.now();
								return new Date(ms).toLocaleString();
							})()}
						</Text>
						<View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
							{!!item.authorUid && item.authorUid !== (require('../../../firebase/config').auth.currentUser?.uid || 'anon') && !isBlocked(item.authorUid) && (
								<A11yPressable onPress={() => { const me = require('../../../firebase/config').auth.currentUser?.uid || 'anon'; const parts = [String(me), String(item.authorUid)].sort(); const threadId = parts.join('__'); router.push(`/(tabs)/community/dms/${threadId}` as Href); }} style={({pressed})=>[{ borderWidth:StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:6, borderRadius:6 }, pressed && {opacity:0.8}]}> 
									<Text style={{ color: palette.text, fontWeight:'700' }}>Start DM</Text>
								</A11yPressable>
							)}
							{!!item.authorUid && item.authorUid !== (require('../../../firebase/config').auth.currentUser?.uid || 'anon') && (
								<A11yPressable onPress={() => blockUser(String(item.authorUid))} style={({pressed})=>[{ borderWidth:StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:6, borderRadius:6 }, pressed && {opacity:0.8}]}> 
									<Text style={{ color: palette.text, fontWeight:'700' }}>Block</Text>
								</A11yPressable>
							)}
						</View>
						{isAdmin && (
							<View style={{ flexDirection:'row', gap:8, marginTop:6 }}>
								<A11yPressable onPress={async () => { try { await updateDoc(doc(db,'threads', item.id), { flagged: !(item.flagged===true) }); } catch {} }} style={({pressed})=>[{ borderWidth:StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:6, borderRadius:6 }, pressed && {opacity:0.8}]}>
									<Text style={{ color: palette.text }}>{item.flagged ? 'Unflag' : 'Flag'}</Text>
								</A11yPressable>
								<A11yPressable onPress={async () => { try { await updateDoc(doc(db,'threads', item.id), { hidden: !(item.hidden===true) }); } catch {} }} style={({pressed})=>[{ borderWidth:StyleSheet.hairlineWidth, borderColor: palette.muted, paddingHorizontal:10, paddingVertical:6, borderRadius:6 }, pressed && {opacity:0.8}]}>
									<Text style={{ color: palette.text }}>{item.hidden ? 'Unhide' : 'Hide'}</Text>
								</A11yPressable>
							</View>
						)}
					</A11yPressable>
				)}
				onEndReached={() => loadPage(false)}
				onEndReachedThreshold={0.6}
				refreshing={refreshing}
				onRefresh={onRefresh}
				ListEmptyComponent={
					<Text style={styles.threadMeta}>No threads yet.</Text>
				}
				contentContainerStyle={{ paddingTop: 8 }}
			/>
		</View>
	);
}

export default function ChannelScreen() {
	return (
		<CommunityProvider>
			<ChannelInner />
		</CommunityProvider>
	);
}

function createStyles(palette: Palette) {
	return StyleSheet.create({
		container: { flex: 1, padding: 20, backgroundColor: palette.background },
		title: { fontSize: 22, fontWeight: "700", color: palette.text },
		newBox: {
			flexDirection: "row",
			gap: 8,
			alignItems: "center",
			marginTop: 12,
			paddingVertical: 8,
		},
		input: {
			flex: 1,
			borderWidth: 1,
			borderColor: palette.muted,
			borderRadius: 10,
			paddingHorizontal: 12,
			paddingVertical: 10,
			color: palette.text,
		},
		cta: {
			backgroundColor: palette.primary,
			borderRadius: 10,
			paddingHorizontal: 16,
			paddingVertical: 10,
		},
		ctaText: { color: palette.onPrimary, fontWeight: "700" },
		threadRow: {
			paddingVertical: 12,
			borderBottomWidth: StyleSheet.hairlineWidth,
			borderBottomColor: palette.muted,
		},
		threadTitle: { color: palette.text, fontSize: 16, fontWeight: "600" },
		threadMeta: { color: palette.text, opacity: 0.8, marginTop: 2 },
	});
}