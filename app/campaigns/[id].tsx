import { Stack, router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

import A11yPressable from "../../components/A11yPressable";
import { GapView } from "../../components/GapView";
import SettingsLink from "../../components/SettingsLink";
import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useAuth } from "../../context/AuthContext";
import { campaigns } from "../../data/campaigns";
import { useTranslation } from "../../i18n";
import { fsDeleteCampaign, fsGetCampaign, fsJoinCampaign, fsLeaveCampaign, fsUpdateCampaign } from "../../services/firestore";
import {
  CampaignsLocalProvider,
  useCampaignsLocal,
} from "../../store/campaignsLocal";
import { useFavorites } from "../../store/favorites";
import { type Palette } from "../../theme/colors";
import { useTextScale } from "../../theme/typography";
import { useAppPalette } from "../../theme/usePalette";
import { logError } from "../../utils/errorLogger";

 
const { trackEvent } = require("../../services/analyticsClient");

function CampaignDetailInner() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);
  
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const { has, toggle } = useFavorites();
  const { isJoined, join, leave } = useCampaignsLocal();
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  
  // Check if user is creator or admin
  const canEdit = useMemo(() => {
    if (isAdmin) return true;
    if (!campaign || !user) return false;
    return campaign.createdBy === user.uid;
  }, [isAdmin, campaign, user]);

  // Load campaign from Firestore or local data
  useEffect(() => {
    async function loadCampaign() {
      setLoading(true);
      try {
        // Try Firestore first
        const fsCampaign = await fsGetCampaign(id);
        if (fsCampaign) {
          setCampaign(fsCampaign);
        } else {
          // Fall back to local campaigns
          const localCampaign = campaigns.find((c) => c.id === id);
          setCampaign(localCampaign || null);
        }
      } catch (error) {
        logError('CampaignDetail', 'Failed to load campaign', error);
        const localCampaign = campaigns.find((c) => c.id === id);
        setCampaign(localCampaign || null);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [id]);

  const saved = campaign ? has("campaign", campaign.id) : false;
  const joined = campaign ? isJoined(campaign.id) : false;

  const handleEdit = () => {
    setEditData({
      title: campaign.title,
      summary: campaign.summary,
      description: campaign.description,
      goal: campaign.goal || '',
      startDate: campaign.startDate || '',
      endDate: campaign.endDate || '',
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    try {
      const success = await fsUpdateCampaign(id, editData);
      if (success) {
        setCampaign({ ...campaign, ...editData });
        setEditMode(false);
        Alert.alert(t('common.success', 'Success'), 'Campaign updated successfully');
      } else {
        Alert.alert(t('common.error', 'Error'), 'Failed to update campaign');
      }
    } catch (error) {
      logError('CampaignDetail', 'Save failed', error);
      Alert.alert(t('common.error', 'Error'), 'Failed to update campaign');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Campaign',
      'Are you sure you want to delete this campaign? This cannot be undone.',
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await fsDeleteCampaign(id);
              if (success) {
                Alert.alert(
                  t('common.success', 'Success'),
                  'Campaign deleted',
                  [{ text: t('common.ok', 'OK'), onPress: () => router.back() }]
                );
              } else {
                Alert.alert(t('common.error', 'Error'), 'Failed to delete campaign');
              }
            } catch (error) {
              logError('CampaignDetail', 'Delete failed', error);
              Alert.alert(t('common.error', 'Error'), 'Failed to delete campaign');
            }
          },
        },
      ]
    );
  };

  const shareToSocials = async () => {
    if (!campaign) return;
    const message = `📢 ${campaign.title}\n\n${campaign.summary || ''}\n\n🎯 ${campaign.goal || 'Join us!'}\n\nShared from 3mpwr App`;
    
    try {
      await Share.share({
        message,
        title: campaign.title,
      });
      try { trackEvent("campaign_share", { id: campaign.id }); } catch {}
    } catch (error) {
      logError('CampaignDetail', 'Share failed', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: campaign?.title ?? "Campaign" }} />
      <View style={styles.container}>
        <SettingsLink style={{ position: "absolute", right: 20, top: 20 }} />

        {loading && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={palette.primary} />
            <Text style={styles.text}>{t('common.loading', 'Loading...')}</Text>
          </View>
        )}
        
        {!loading && !campaign && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={styles.title}>{t('common.notFound', 'Not Found')}</Text>
            <Text style={styles.text}>This campaign could not be found.</Text>
          </View>
        )}

        {!loading && campaign && !editMode && (
          <ScrollView>
            <Text style={styles.title}>{campaign.title}</Text>
            <Text style={styles.text}>{campaign.summary ?? "Details unavailable."}</Text>
            {campaign.description && (
              <Text style={[styles.text, { marginTop: 12 }]}>{campaign.description}</Text>
            )}
            {campaign.goal && (
              <Text style={[styles.text, { marginTop: 8, fontWeight: '600' }]}>🎯 Goal: {campaign.goal}</Text>
            )}

            {/* Edit/Delete Actions - for creators and admins */}
            {canEdit && (
              <GapView gap={8} style={{ marginTop: 12, marginBottom: 12 }}>
                <A11yPressable
                  style={({ pressed }) => [
                    styles.adminButton,
                    { backgroundColor: palette.warning || palette.primary },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleEdit}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.edit', 'Edit')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.buttonText}>✏️ {t('common.edit', 'Edit')}</Text>
                </A11yPressable>
                <A11yPressable
                  style={({ pressed }) => [
                    styles.adminButton,
                    { backgroundColor: palette.destructive || palette.error },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleDelete}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.delete', 'Delete')}
                  hitSlop={HIT_SLOP_8}
                >
                  <Text style={styles.buttonText}>🗑️ {t('common.delete', 'Delete')}</Text>
                </A11yPressable>
              </GapView>
            )}

            {/* User Actions */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => toggle("campaign", campaign.id)}
              accessibilityRole="button"
              accessibilityLabel={saved ? t('a11y.removeCampaign') : t('a11y.saveCampaign')}
              focusable={true}
            >
              <Text style={styles.buttonText}>
                {saved ? "Remove from Favorites" : "Save to Favorites"}
              </Text>
            </Pressable>

            <View style={{ height: 8 }} />

            <Pressable
              style={({ pressed }) => [
                styles.secondary,
                pressed && { opacity: 0.8 },
              ]}
              onPress={async () => {
                if (joined) {
                  leave(campaign.id);
                  const uid = user?.uid || 'anonymous';
                  const ok = await fsLeaveCampaign(campaign.id, uid);
                  if (!ok) {
                    join(campaign.id);
                  } else {
                    try { trackEvent("campaign_leave", { id: campaign.id }); } catch {}
                  }
                } else {
                  join(campaign.id);
                  const uid = user?.uid || 'anonymous';
                  const ok = await fsJoinCampaign(campaign.id, uid);
                  if (!ok) {
                    leave(campaign.id);
                  } else {
                    try { trackEvent("campaign_join", { id: campaign.id }); } catch {}
                  }
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={joined ? t('a11y.leaveCampaign').replace('{{title}}', campaign.title) : t('a11y.joinCampaign').replace('{{title}}', campaign.title)}
              focusable={true}
            >
              <Text style={styles.secondaryText}>
                {joined ? "Leave Campaign" : "Join Campaign"}
              </Text>
            </Pressable>

            <View style={{ height: 8 }} />

            <Pressable
              style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
              onPress={() => {
                if (campaign) {
                  router.push(`/campaigns/room/${campaign.id}`);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.openCampaignRoom')}
              focusable={true}
            >
              <Text style={styles.linkText}>Open Campaign Room</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.8 }]}
              onPress={shareToSocials}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.shareCampaign').replace('{{title}}', campaign.title)}
              focusable={true}
            >
              <Text style={styles.linkText}>📤 Share to Socials</Text>
            </Pressable>
          </ScrollView>
        )}

        {/* Edit Modal */}
        {editMode && (
          <Modal
            visible={editMode}
            animationType="slide"
            onRequestClose={() => setEditMode(false)}
            transparent={false}
          >
            <View style={[styles.modalContainer, { backgroundColor: palette.background }]}>
              <Text style={styles.modalTitle}>Edit Campaign</Text>
              
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={editData.title}
                  onChangeText={(text) => setEditData({ ...editData, title: text })}
                  placeholder="Campaign title"
                  placeholderTextColor={palette.text + '77'}
                />

                <Text style={styles.label}>Summary</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={editData.summary}
                  onChangeText={(text) => setEditData({ ...editData, summary: text })}
                  placeholder="Short summary"
                  placeholderTextColor={palette.text + '77'}
                  multiline
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 120 }]}
                  value={editData.description}
                  onChangeText={(text) => setEditData({ ...editData, description: text })}
                  placeholder="Full description"
                  placeholderTextColor={palette.text + '77'}
                  multiline
                />

                <Text style={styles.label}>Goal</Text>
                <TextInput
                  style={styles.input}
                  value={editData.goal}
                  onChangeText={(text) => setEditData({ ...editData, goal: text })}
                  placeholder="Campaign goal"
                  placeholderTextColor={palette.text + '77'}
                />

                <GapView gap={12} style={{ marginTop: 20 }}>
                  <A11yPressable
                    style={({ pressed }) => [
                      styles.button,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={handleSaveEdit}
                    accessibilityRole="button"
                    accessibilityLabel="Save changes"
                  >
                    <Text style={styles.buttonText}>💾 Save Changes</Text>
                  </A11yPressable>

                  <A11yPressable
                    style={({ pressed }) => [
                      styles.secondary,
                      pressed && { opacity: 0.8 },
                    ]}
                    onPress={() => setEditMode(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                  >
                    <Text style={styles.secondaryText}>Cancel</Text>
                  </A11yPressable>
                </GapView>
              </ScrollView>
            </View>
          </Modal>
        )}
      </View>
    </>
  );
}

export const options = { href: null };

export default function CampaignDetail() {
  return (
    <CampaignsLocalProvider>
      <CampaignDetailInner />
    </CampaignsLocalProvider>
  );
}

function createStyles(palette: Palette, factor: number) {
  return StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: palette.background },
    title: {
      fontSize: Math.round(22 * factor),
      fontWeight: "700",
      marginBottom: 8,
      color: palette.text,
    },
    text: {
      fontSize: Math.round(16 * factor),
      color: palette.text,
      opacity: 0.95,
      marginBottom: 16,
    },
    button: {
      backgroundColor: palette.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      minWidth: 44,
    },
    buttonText: { color: palette.onPrimary, fontSize: 16, fontWeight: '700' },
    adminButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
      alignItems: 'center',
    },
    secondary: {
      backgroundColor: palette.surface,
      borderWidth: 1,
      borderColor: palette.muted,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 6,
      minHeight: 44,
    },
    secondaryText: { color: palette.text, fontSize: 16, fontWeight: "700" },
    ghost: {
      backgroundColor: "transparent",
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    linkText: { color: palette.primary, fontWeight: "700", fontSize: 16 },
    modalContainer: {
      flex: 1,
      padding: 20,
      paddingTop: 60,
    },
    modalTitle: {
      fontSize: Math.round(24 * factor),
      fontWeight: '700',
      marginBottom: 20,
      color: palette.text,
    },
    modalScroll: {
      flex: 1,
    },
    label: {
      fontSize: Math.round(14 * factor),
      fontWeight: '600',
      marginTop: 12,
      marginBottom: 6,
      color: palette.text,
    },
    input: {
      borderWidth: 1,
      borderColor: palette.muted,
      borderRadius: 6,
      padding: 12,
      fontSize: Math.round(16 * factor),
      color: palette.text,
      backgroundColor: palette.surface,
      minHeight: 44,
    },
  });
}
