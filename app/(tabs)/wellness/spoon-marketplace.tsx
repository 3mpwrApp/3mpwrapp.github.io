/**
 * Spoon Marketplace
 * 
 * Energy trading community where users can offer or request help
 * based on their available "spoons" (energy units)
 */

/* eslint-disable no-restricted-syntax */

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { MAX_FONT_SCALE } from '../../../constants/A11Y';
import { useTranslation } from '../../../i18n';
import {
    getBalance,
    getOffers,
    getRequests,
    postOffer,
    postRequest,
    type SpoonOffer,
    type SpoonRequest
} from '../../../services/spoonMarketplace';
import { useAppPalette } from '../../../theme/usePalette';

export default function SpoonMarketplace() {
  const palette = useAppPalette();
  const { t: _t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'offers' | 'requests'>('offers');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form state
  type UISpoonType = 'emotional-support' | 'task-help' | 'errands' | 'companionship' | 'skill-share';
  const [formType, setFormType] = useState<UISpoonType>('emotional-support');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpoons, setFormSpoons] = useState('1');

  // Live data
  const [offers, setOffers] = useState<SpoonOffer[]>([]);
  const [requests, setRequests] = useState<SpoonRequest[]>([]);

  const [userStats, setUserStats] = useState({
    balance: 0,
    earned: 0,
    spent: 0,
    reputation: 50,
  });

  // Load data on mount and when switching tabs (light refresh)
  const loadData = React.useCallback(async () => {
    try {
      setRefreshing(true);
      const [o, r, bal] = await Promise.all([
        getOffers(),
        getRequests(),
        getBalance('me'),
      ]);
      setOffers(Array.isArray(o) ? o : []);
      setRequests(Array.isArray(r) ? r : []);
      setUserStats({
        balance: bal.balance,
        earned: bal.earned,
        spent: bal.spent,
        reputation: bal.reputation,
      });
    } catch (e) {
      console.warn('[Spoons] Failed loading data', e);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateListing = async () => {
    if (!formTitle.trim() || !formDescription.trim()) return;

    setLoading(true);
    try {
      const spoons = parseInt(formSpoons) || 1;
      
      if (activeTab === 'offers') {
        const offerType = ((): SpoonOffer['offerType'] => {
          switch (formType) {
            case 'emotional-support': return 'listening';
            case 'task-help': return 'call';
            case 'errands': return 'other';
            case 'companionship': return 'listening';
            case 'skill-share': return 'writing';
            default: return 'other';
          }
        })();
        await postOffer({
          userId: 'me',
          userName: 'You',
          offerType,
          description: formDescription || formTitle,
          energyCost: 'low',
          skills: [],
          availability: 'This week',
          spoonsOffered: spoons,
        });
      } else {
        const requestType = ((): SpoonRequest['requestType'] => {
          switch (formType) {
            case 'emotional-support': return 'listening';
            case 'task-help': return 'research';
            case 'errands': return 'other';
            case 'companionship': return 'listening';
            case 'skill-share': return 'writing';
            default: return 'other';
          }
        })();
        await postRequest({
          userId: 'me',
          userName: 'You',
          requestType,
          description: formDescription || formTitle,
          urgency: 'medium',
          spoonsOffered: spoons,
        });
      }

  // Refresh lists and reset form
  await loadData();
      setFormTitle('');
      setFormDescription('');
      setFormSpoons('1');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: UISpoonType) => {
    switch (type) {
      case 'emotional-support': return 'heart';
      case 'task-help': return 'checkmark-circle';
      case 'errands': return 'car';
      case 'companionship': return 'people';
      case 'skill-share': return 'school';
      default: return 'help-circle';
    }
  };

  const getTypeColor = (type: UISpoonType) => {
    switch (type) {
      case 'emotional-support': return '#ec4899';
      case 'task-help': return '#8b5cf6';
      case 'errands': return '#3b82f6';
      case 'companionship': return '#10b981';
      case 'skill-share': return '#f59e0b';
      default: return palette.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header with Stats */}
      <View style={[styles.header, { backgroundColor: palette.surface, borderBottomColor: palette.muted }]}>
        <View style={styles.headerTop}>
          <Text style={[styles.title, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Spoon Marketplace
          </Text>
          <View style={[styles.balanceBadge, { backgroundColor: palette.primary }]}>
            <Ionicons name="cafe" size={16} color="#fff" />
            <Text style={styles.balanceText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {userStats.balance}
            </Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {userStats.earned}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Earned
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: palette.primary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {userStats.spent}
            </Text>
            <Text style={[styles.statLabel, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              Spent
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={[styles.statValue, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {userStats.reputation.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: palette.surface }]}>
        <Pressable
          style={[styles.tab, activeTab === 'offers' && { borderBottomColor: palette.primary }]}
          onPress={() => setActiveTab('offers')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'offers' }}
        >
          <Ionicons name="gift" size={20} color={activeTab === 'offers' ? palette.primary : palette.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'offers' ? palette.primary : palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Offers
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'requests' && { borderBottomColor: palette.primary }]}
          onPress={() => setActiveTab('requests')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'requests' }}
        >
          <Ionicons name="hand-left" size={20} color={activeTab === 'requests' ? palette.primary : palette.textSecondary} />
          <Text style={[styles.tabText, { color: activeTab === 'requests' ? palette.primary : palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            Requests
          </Text>
        </Pressable>
      </View>

      {/* Listings */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.listingsContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} />}
      >
        {activeTab === 'offers' ? (
          offers.length > 0 ? (
            offers.map((offer) => (
              <View key={offer.id} style={[styles.listingCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeIcon, { backgroundColor: palette.success || palette.primary }]}>
                    <Ionicons name={'gift'} size={20} color={palette.onPrimary} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {offer.userName} can help ({offer.offerType})
                    </Text>
                    <Text style={[styles.cardMeta, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {Math.round((Date.now() - offer.createdAt) / 60000)} minutes ago
                    </Text>
                  </View>
                  <View style={[styles.spoonsBadge, { backgroundColor: palette.primary }]}>
                    <Ionicons name="cafe" size={14} color={palette.onPrimary} />
                    <Text style={styles.spoonsText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {offer.spoonsOffered}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {offer.description}
                </Text>
                <Pressable
                  style={[styles.acceptButton, { backgroundColor: palette.primary }]}
                  onPress={() => {
                    // eslint-disable-next-line no-console
                    console.log('Accept offer not yet implemented:', offer.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Accept offer from ${offer.userName}`}
                >
                  <Text style={styles.acceptButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    Accept Offer
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="gift-outline" size={64} color={palette.muted} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                No offers available right now
              </Text>
            </View>
          )
        ) : (
          requests.length > 0 ? (
            requests.map((request) => (
              <View key={request.id} style={[styles.listingCard, { backgroundColor: palette.surface, borderColor: palette.muted }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.typeIcon, { backgroundColor: palette.warning || palette.primary }]}>
                    <Ionicons name={'hand-left'} size={20} color={palette.onPrimary} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={[styles.cardTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {request.userName} needs help ({request.requestType})
                    </Text>
                    <View style={styles.urgencyRow}>
                      <Text style={[styles.cardMeta, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                        {Math.round((Date.now() - request.createdAt) / 60000)} minutes ago
                      </Text>
                      {request.urgency === 'high' && (
                        <View style={styles.urgentBadge}>
                          <Text style={styles.urgentText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                            Urgent
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={[styles.spoonsBadge, { backgroundColor: palette.warning || palette.primary }]}>
                    <Ionicons name="cafe" size={14} color={palette.onPrimary} />
                    <Text style={styles.spoonsText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                      {request.spoonsOffered}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {request.description}
                </Text>
                <Pressable
                  style={[styles.acceptButton, { backgroundColor: palette.success || palette.primary }]}
                  onPress={() => {
                    // eslint-disable-next-line no-console
                    console.log('Help with request not yet implemented:', request.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Help ${request.userName}`}
                >
                  <Text style={styles.acceptButtonText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    Offer Help
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="hand-left-outline" size={64} color={palette.muted} />
              <Text style={[styles.emptyText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                No help requests at the moment
              </Text>
            </View>
          )
        )}
      </ScrollView>

      {/* Create Button */}
      <Pressable
        style={[styles.createButton, { backgroundColor: palette.primary }]}
        onPress={() => setShowCreateModal(true)}
        accessibilityRole="button"
        accessibilityLabel={`Create new ${activeTab === 'offers' ? 'offer' : 'request'}`}
      >
        <Ionicons name="add" size={24} color={palette.onPrimary} />
      </Pressable>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Create {activeTab === 'offers' ? 'Offer' : 'Request'}
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)} accessibilityRole="button" accessibilityLabel="Close modal">
                <Ionicons name="close" size={24} color={palette.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={[styles.fieldLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Type
              </Text>
              <View style={styles.typeGrid}>
                {(['emotional-support', 'task-help', 'errands', 'companionship', 'skill-share'] as UISpoonType[]).map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeOption,
                      { backgroundColor: formType === type ? getTypeColor(type) : palette.background, borderColor: palette.muted }
                    ]}
                    onPress={() => setFormType(type)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: formType === type }}
                  >
                    <Ionicons
                      name={getTypeIcon(type) as any}
                      size={20}
                      color={formType === type ? palette.onPrimary : palette.textSecondary}
                    />
                    <Text
                      style={[styles.typeOptionText, { color: formType === type ? palette.onPrimary : palette.textSecondary }]}
                      maxFontSizeMultiplier={MAX_FONT_SCALE}
                    >
                      {type.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Title
              </Text>
              <TextInput
                style={[styles.input, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="Brief, clear title..."
                placeholderTextColor={palette.textSecondary}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              />

              <Text style={[styles.fieldLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Description
              </Text>
              <TextInput
                style={[styles.textArea, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Add more details..."
                placeholderTextColor={palette.textSecondary}
                multiline
                numberOfLines={4}
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              />

              <Text style={[styles.fieldLabel, { color: palette.text }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                Spoons {activeTab === 'offers' ? 'Offered' : 'Needed'}
              </Text>
              <TextInput
                style={[styles.input, { color: palette.text, backgroundColor: palette.background, borderColor: palette.muted }]}
                value={formSpoons}
                onChangeText={setFormSpoons}
                keyboardType="number-pad"
                maxFontSizeMultiplier={MAX_FONT_SCALE}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { borderColor: palette.muted }]}
                onPress={() => setShowCreateModal(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalButtonText, { color: palette.textSecondary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: palette.primary }]}
                onPress={handleCreateListing}
                disabled={loading || !formTitle.trim() || !formDescription.trim()}
                accessibilityRole="button"
                accessibilityLabel="Post listing"
              >
                {loading ? (
                  <ActivityIndicator color={palette.onPrimary} />
                ) : (
                  <Text style={[styles.modalButtonText, { color: palette.onPrimary }]} maxFontSizeMultiplier={MAX_FONT_SCALE}>
                    Post
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listingsContainer: {
    padding: 16,
    gap: 12,
  },
  listingCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
  },
  urgencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgentBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  spoonsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  spoonsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  acceptButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '500',
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
