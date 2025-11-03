import { Link } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../../components/A11yPressable';
import GapView from '../../../components/GapView';
import { HIT_SLOP_8 } from '../../../constants/A11Y';
import { useAuth } from '../../../context/AuthContext';
import { MAX_FONT_SCALE, useAnnounceOnMount, useFocusOnRefOnMount } from '../../../hooks/useA11y';
import { flagItem } from '../../../services/moderation';
import { addAidPost, listAidPosts, respondToPost, softDeletePost } from '../../../services/mutual';
import { useAppPalette } from '../../../theme/usePalette';

const CATEGORIES = [
  { id: 'rides', label: 'Rides & Transportation', icon: '🚗' },
  { id: 'groceries', label: 'Groceries & Shopping', icon: '🛒' },
  { id: 'meals', label: 'Meals & Food', icon: '🍽️' },
  { id: 'childcare', label: 'Childcare', icon: '👶' },
  { id: 'tutoring', label: 'Tutoring & Education', icon: '📚' },
  { id: 'tech', label: 'Tech Support', icon: '💻' },
  { id: 'housing', label: 'Housing & Shelter', icon: '🏠' },
  { id: 'medical', label: 'Medical Support', icon: '🏥' },
  { id: 'emotional', label: 'Emotional Support', icon: '💚' },
  { id: 'other', label: 'Other', icon: '❓' },
];

export default function MutualAidImpl() {
  const palette = useAppPalette();
  const s = styles(palette);
  const { isAdmin } = useAuth();
  const titleRef = React.useRef<Text>(null);
  useAnnounceOnMount('Mutual Aid Engine');
  useFocusOnRefOnMount(titleRef);
  
  const [type, setType] = React.useState('rides');
  const [desc, setDesc] = React.useState('');
  const [city, setCity] = React.useState('');
  const [contact, setContact] = React.useState('');
  const [items, setItems] = React.useState<any[]>([]);
  const [reply, setReply] = React.useState('');
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all'|'approved'|'pending'|'trash'>(isAdmin? 'all':'approved');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isPosting, setIsPosting] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
  
  const load = React.useCallback(async()=>{ 
    try { 
      setIsLoading(true);
      setItems(await listAidPosts()); 
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  },[]);
  
  React.useEffect(()=>{ load(); },[load]);

  const handlePost = async () => {
    if (!desc.trim()) {
      Alert.alert('Missing Description', 'Please provide a description of your need.');
      return;
    }

    setIsPosting(true);
    try { 
      await addAidPost({ type, description: desc, city, contact }); 
      setDesc(''); 
      setCity(''); 
      setContact(''); 
      await load();
      Alert.alert('Posted!', 'Your mutual aid request has been posted.');
    } catch (err) { 
      console.error('Error posting:', err);
      Alert.alert('Failed','Could not post. Please try again.'); 
    } finally {
      setIsPosting(false);
    }
  };

  const handleReply = async (postId: string) => {
    if (!reply.trim()) return;
    
    try {
      await respondToPost(postId, reply);
      setReply('');
      setReplyingTo(null);
      Alert.alert('Sent', 'Your response was sent.');
    } catch (err) {
      console.error('Error sending reply:', err);
      Alert.alert('Error', 'Failed to send response.');
    }
  };

  const handleDelete = async (postId: string) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await softDeletePost(postId);
              setItems(prev => prev.map(x => x.id === postId ? { ...x, deleted: true } : x));
            } catch (err) {
              console.error('Error deleting:', err);
              Alert.alert('Error', 'Failed to delete post.');
            }
          },
        },
      ]
    );
  };

  const handleFlag = async (postId: string) => {
    Alert.alert(
      'Flag Content',
      'Report this post for inappropriate content?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report',
          style: 'destructive',
          onPress: async () => {
            try {
              await flagItem('mutual', postId, 'inappropriate');
              Alert.alert('Reported', 'Thanks for helping keep our community safe.');
            } catch (err) {
              console.error('Error flagging:', err);
              Alert.alert('Error', 'Failed to report post.');
            }
          },
        },
      ]
    );
  };

  const filteredItems = items.filter(p => {
    const approved = p.approved === true;
    const pending = p.approved === false && p.deleted !== true;
    const trash = p.deleted === true;
    
    // Admin filter
    let passesAdminFilter = false;
    if (!isAdmin) {
      passesAdminFilter = approved;
    } else {
      if (filter === 'approved') passesAdminFilter = approved && !trash;
      else if (filter === 'pending') passesAdminFilter = pending;
      else if (filter === 'trash') passesAdminFilter = trash;
      else passesAdminFilter = !trash;
    }
    
    // Category filter
    const passesCategoryFilter = !categoryFilter || p.type === categoryFilter;
    
    return passesAdminFilter && passesCategoryFilter;
  });

  const getCategoryIcon = (type: string) => {
    return CATEGORIES.find(c => c.id === type)?.icon || '❓';
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16 }}>
      <Text 
        ref={titleRef}
        style={s.title}
        accessibilityRole="header"
        maxFontSizeMultiplier={MAX_FONT_SCALE}
      >
        Mutual Aid Engine
      </Text>
      <View style={s.betaBadge}>
        <Text style={s.betaBadgeText}>BETA</Text>
      </View>
      
      {/* Info Card */}
      <View style={[s.card, { backgroundColor: palette.info + '22' }]}>
        <Text style={s.infoText}>
          💚 Connect with community members for mutual support. Post needs or offer help with rides, groceries, childcare, and more.
        </Text>
      </View>

      {/* Admin Filters */}
      {isAdmin && (
        <View style={s.card}>
          <Text style={s.sectionTitle}>Admin Filters</Text>
          <GapView style={{ flexDirection:'row', flexWrap:'wrap' }} gap={8}>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('all')} style={[s.chip, filter==='all'&&s.chipActive]}>
              <Text style={[s.chipText, filter==='all'&&s.chipTextActive]}>All</Text>
            </A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('approved')} style={[s.chip, filter==='approved'&&s.chipActive]}>
              <Text style={[s.chipText, filter==='approved'&&s.chipTextActive]}>Approved</Text>
            </A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('pending')} style={[s.chip, filter==='pending'&&s.chipActive]}>
              <Text style={[s.chipText, filter==='pending'&&s.chipTextActive]}>Pending</Text>
            </A11yPressable>
            <A11yPressable hitSlop={HIT_SLOP_8} onPress={()=>setFilter('trash')} style={[s.chip, filter==='trash'&&s.chipActive]}>
              <Text style={[s.chipText, filter==='trash'&&s.chipTextActive]}>Trash</Text>
            </A11yPressable>
          </GapView>
        </View>
      )}

      {/* Post Form */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Post a Need</Text>
        
        <Text style={s.label}>Category</Text>
        <View style={s.categoryGrid}>
          {CATEGORIES.map((cat) => (
            <A11yPressable
              key={cat.id}
              hitSlop={HIT_SLOP_8}
              onPress={() => setType(cat.id)}
              style={[s.categoryChip, type === cat.id && s.categoryChipActive]}
              accessibilityRole="button"
              accessibilityLabel={cat.label}
            >
              <Text style={{ fontSize: 18, marginBottom: 4 }}>{cat.icon}</Text>
              <Text style={[s.categoryText, type === cat.id && s.categoryTextActive]} numberOfLines={2}>
                {cat.label.split('&')[0].trim()}
              </Text>
            </A11yPressable>
          ))}
        </View>

        <Text style={s.label}>Description *</Text>
        <TextInput 
          placeholder="Describe what you need help with..." 
          placeholderTextColor={palette.text+'77'} 
          value={desc} 
          onChangeText={setDesc} 
          style={s.textArea}
          multiline
          numberOfLines={4}
          accessibilityLabel="Description input"
        />
        
        <Text style={s.label}>City (optional)</Text>
        <TextInput 
          placeholder="e.g., Toronto, Vancouver..." 
          placeholderTextColor={palette.text+'77'} 
          value={city} 
          onChangeText={setCity} 
          style={s.input}
          accessibilityLabel="City input"
        />
        
        <Text style={s.label}>Contact (optional)</Text>
        <TextInput 
          placeholder="Email or phone (visible to responders)" 
          placeholderTextColor={palette.text+'77'} 
          value={contact} 
          onChangeText={setContact} 
          style={s.input}
          accessibilityLabel="Contact input"
        />
        
        <A11yPressable 
          hitSlop={HIT_SLOP_8} 
          onPress={handlePost} 
          style={s.button}
          disabled={isPosting || !desc.trim()}
          accessibilityRole="button"
          accessibilityLabel="Post need"
        >
          {isPosting ? (
            <ActivityIndicator size="small" color={palette.onPrimary} />
          ) : (
            <Text style={s.buttonText}>📤 Post Need</Text>
          )}
        </A11yPressable>
      </View>

      {/* Category Filter */}
      <View style={s.card}>
        <Text style={s.sectionTitle}>Filter by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <GapView style={{ flexDirection: 'row' }} gap={8}>
            <A11yPressable 
              hitSlop={HIT_SLOP_8} 
              onPress={() => setCategoryFilter(null)} 
              style={[s.filterChip, !categoryFilter && s.filterChipActive]}
            >
              <Text style={[s.filterChipText, !categoryFilter && s.filterChipTextActive]}>All</Text>
            </A11yPressable>
            {CATEGORIES.map((cat) => (
              <A11yPressable
                key={cat.id}
                hitSlop={HIT_SLOP_8}
                onPress={() => setCategoryFilter(cat.id)}
                style={[s.filterChip, categoryFilter === cat.id && s.filterChipActive]}
              >
                <Text style={s.filterIcon}>{cat.icon}</Text>
                <Text style={[s.filterChipText, categoryFilter === cat.id && s.filterChipTextActive]}>
                  {cat.label.split(' ')[0]}
                </Text>
              </A11yPressable>
            ))}
          </GapView>
        </ScrollView>
      </View>

      {/* Posts List */}
      <Text style={s.sectionTitle}>Recent Posts ({filteredItems.length})</Text>
      
      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={s.loadingText}>Loading posts...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={s.emptyState}>
          <Text style={s.emptyIcon}>🤝</Text>
          <Text style={s.emptyText}>No posts yet. Be the first to post a need!</Text>
        </View>
      ) : (
        filteredItems.map(p => (
          <View key={p.id} style={s.postCard}>
            <View style={s.postHeader}>
              <Text style={s.postIcon}>{getCategoryIcon(p.type)}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.postTitle}>
                  {CATEGORIES.find(c => c.id === p.type)?.label || p.type}
                  {p.city && ` • ${p.city}`}
                </Text>
                <Text style={s.postMeta}>
                  {new Date(p.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}
                </Text>
              </View>
              {p.approved === false && (
                <View style={s.pendingBadge}>
                  <Text style={s.pendingText}>Pending</Text>
                </View>
              )}
            </View>
            
            <Text style={s.postDescription}>{p.description}</Text>
            
            {p.contact && (
              <View style={s.contactBadge}>
                <Text style={s.contactText}>📞 {p.contact}</Text>
              </View>
            )}
            
            <GapView style={{ marginTop: 12 }} gap={8}>
              {replyingTo === p.id ? (
                <View>
                  <TextInput 
                    placeholder="Type your response..." 
                    placeholderTextColor={palette.text+'77'} 
                    value={reply} 
                    onChangeText={setReply} 
                    style={s.input}
                    multiline
                    autoFocus
                  />
                  <GapView style={{ flexDirection: 'row' }} gap={8}>
                    <A11yPressable 
                      hitSlop={HIT_SLOP_8} 
                      onPress={() => handleReply(p.id)} 
                      style={[s.actionBtn, { backgroundColor: palette.primary }]}
                    >
                      <Text style={[s.actionBtnText, { color: palette.onPrimary }]}>Send</Text>
                    </A11yPressable>
                    <A11yPressable 
                      hitSlop={HIT_SLOP_8} 
                      onPress={() => { setReplyingTo(null); setReply(''); }} 
                      style={s.actionBtn}
                    >
                      <Text style={s.actionBtnText}>Cancel</Text>
                    </A11yPressable>
                  </GapView>
                </View>
              ) : (
                <GapView style={{ flexDirection: 'row', flexWrap: 'wrap' }} gap={8}>
                  <A11yPressable 
                    hitSlop={HIT_SLOP_8} 
                    onPress={() => setReplyingTo(p.id)} 
                    style={s.actionBtn}
                  >
                    <Text style={s.actionBtnText}>💬 Reply</Text>
                  </A11yPressable>
                  <Link href={{ pathname: '/(tabs)/community/mutual-chat', params: { id: p.id } }} asChild={true}>
                    <A11yPressable hitSlop={HIT_SLOP_8} style={s.actionBtn}>
                      <Text style={s.actionBtnText}>💭 Chat</Text>
                    </A11yPressable>
                  </Link>
                  <A11yPressable 
                    hitSlop={HIT_SLOP_8} 
                    onPress={() => handleDelete(p.id)} 
                    style={s.actionBtn}
                  >
                    <Text style={s.actionBtnText}>🗑️ Delete</Text>
                  </A11yPressable>
                  <A11yPressable 
                    hitSlop={HIT_SLOP_8} 
                    onPress={() => handleFlag(p.id)} 
                    style={s.actionBtn}
                  >
                    <Text style={s.actionBtnText}>🚩 Report</Text>
                  </A11yPressable>
                </GapView>
              )}
            </GapView>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function styles(palette: ReturnType<typeof useAppPalette>) {
  return StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: palette.background 
    },
    title: { 
      fontSize: 24, 
      fontWeight: '700', 
      color: palette.text,
      marginBottom: 8,
    },
    betaBadge: {
      alignSelf: 'flex-start',
      backgroundColor: palette.warning,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 6,
      marginBottom: 12,
    },
    betaBadgeText: {
      color: palette.onPrimary,
      fontSize: 11,
      fontWeight: '700',
    },
    card: {
      backgroundColor: palette.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    infoText: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 6,
      marginTop: 8,
    },
    input: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      color: palette.text, 
      padding: 12, 
      borderRadius: 8, 
      marginBottom: 8,
      fontSize: 14,
    },
    textArea: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      color: palette.text,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      fontSize: 14,
      minHeight: 100,
      textAlignVertical: 'top',
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    categoryChip: {
      width: '18%',
      minWidth: 70,
      aspectRatio: 1,
      borderWidth: 2,
      borderColor: palette.muted,
      borderRadius: 12,
      padding: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    categoryChipActive: {
      borderColor: palette.primary,
      backgroundColor: palette.primary + '22',
    },
    categoryText: {
      color: palette.text,
      fontSize: 10,
      textAlign: 'center',
      fontWeight: '600',
    },
    categoryTextActive: {
      color: palette.primary,
      fontWeight: '700',
    },
    button: { 
      backgroundColor: palette.primary, 
      paddingVertical: 14, 
      borderRadius: 10, 
      alignItems:'center',
      marginTop: 8,
    },
    buttonText: { 
      color: palette.onPrimary, 
      fontWeight:'700',
      fontSize: 15,
    },
    chip: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 8, 
      paddingHorizontal: 12, 
      paddingVertical: 8,
    },
    chipActive: { 
      backgroundColor: palette.primary, 
      borderColor: palette.primary,
    },
    chipText: {
      color: palette.text,
      fontWeight: '600',
    },
    chipTextActive: {
      color: palette.onPrimary,
      fontWeight: '700',
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: palette.surface,
    },
    filterChipActive: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    filterIcon: {
      marginRight: 4,
      fontSize: 14,
    },
    filterChipText: {
      color: palette.text,
      fontWeight: '600',
      fontSize: 13,
    },
    filterChipTextActive: {
      color: palette.onPrimary,
      fontWeight: '700',
    },
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
    },
    loadingText: {
      color: palette.text,
      marginTop: 12,
      fontSize: 14,
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
      backgroundColor: palette.surface,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.muted,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyText: {
      color: palette.text,
      fontSize: 14,
      textAlign: 'center',
    },
    postCard: { 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 12, 
      padding: 16, 
      marginBottom: 12, 
      backgroundColor: palette.surface,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    postIcon: {
      fontSize: 28,
      marginRight: 12,
    },
    postTitle: { 
      color: palette.text, 
      fontWeight:'700',
      fontSize: 15,
      marginBottom: 4,
    },
    postMeta: {
      color: palette.text,
      opacity: 0.6,
      fontSize: 12,
    },
    pendingBadge: {
      backgroundColor: palette.warning + '33',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    pendingText: {
      color: palette.warning,
      fontSize: 11,
      fontWeight: '700',
    },
    postDescription: { 
      color: palette.text, 
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 8,
    },
    contactBadge: {
      backgroundColor: palette.primary + '22',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    contactText: {
      color: palette.primary,
      fontSize: 13,
      fontWeight: '600',
    },
    actionBtn: { 
      backgroundColor: palette.surface, 
      borderWidth: StyleSheet.hairlineWidth, 
      borderColor: palette.muted, 
      borderRadius: 8, 
      paddingHorizontal: 12, 
      paddingVertical: 8,
    },
    actionBtnText: { 
      color: palette.text, 
      fontWeight:'600',
      fontSize: 13,
    },
  });
}
