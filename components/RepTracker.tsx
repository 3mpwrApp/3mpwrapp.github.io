/* eslint-disable no-console, no-restricted-syntax */
import * as Location from 'expo-location';
import React from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import A11yPressable from '../components/A11yPressable';
import { GapView } from '../components/GapView';
import { HIT_SLOP_8 } from '../constants/A11Y';
import { useTextScale } from '../theme/typography';
import { useAppPalette } from '../theme/usePalette';

interface Representative {
  name: string;
  role: 'MP' | 'MPP' | 'Councillor';
  party?: string;
  riding?: string;
  email?: string;
  phone?: string;
  website?: string;
  officeAddress?: string;
  twitter?: string;
  facebook?: string;
  votingRecord?: {
    issue: string;
    vote: 'for' | 'against' | 'abstain';
    date: string;
  }[];
  responseRate?: number; // 0-100
}

export default function RepTracker() {
  const palette = useAppPalette();
  const { factor } = useTextScale();
  const styles = createStyles(palette, factor);

  const [location, setLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [representatives, setRepresentatives] = React.useState<Representative[]>([]);
  const [selectedRep, setSelectedRep] = React.useState<Representative | null>(null);

  const requestLocation = async () => {
    try {
      setLoading(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to find your representatives. Please enable it in your device settings.'
        );
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000,
        distanceInterval: 0,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      // TODO: Call API to get representatives based on location
      // For now, using mock data
      setRepresentatives(getMockRepresentatives());
    } catch (error) {
      console.error('[RepTracker] Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = (rep: Representative, templateType: 'disability' | 'workers') => {
    if (!rep.email) {
      Alert.alert('No Email', 'This representative has no email address on file.');
      return;
    }

    const templates = {
      disability: {
        subject: 'Support for Disability Rights Legislation',
        body: `Dear ${rep.name},\n\nI am writing to urge you to support stronger disability rights protections in our community.\n\nAs your constituent, I believe it's crucial that we:\n- Strengthen accessibility standards\n- Improve disability benefits\n- Protect against discrimination\n- Ensure equal access to employment\n\nI would appreciate hearing your position on these issues.\n\nThank you for your time and consideration.\n\nSincerely,`,
      },
      workers: {
        subject: 'Support for Workers\' Rights and Workplace Safety',
        body: `Dear ${rep.name},\n\nI am writing to urge you to support stronger workers' rights protections, particularly for injured workers.\n\nAs your constituent, I believe it's crucial that we:\n- Improve workplace safety standards\n- Protect injured workers' rights\n- Ensure fair compensation for workplace injuries\n- Prevent employer retaliation\n\nI would appreciate hearing your position on these issues.\n\nThank you for your time and consideration.\n\nSincerely,`,
      },
    };

    const template = templates[templateType];
    const mailto = `mailto:${rep.email}?subject=${encodeURIComponent(template.subject)}&body=${encodeURIComponent(template.body)}`;

    Linking.openURL(mailto).catch(() => {
      Alert.alert('Error', 'Failed to open email client. Please copy the email address manually.');
    });
  };

  const callRepresentative = (rep: Representative) => {
    if (!rep.phone) {
      Alert.alert('No Phone', 'This representative has no phone number on file.');
      return;
    }

    Alert.alert(
      'Call Representative',
      `Would you like to call ${rep.name}?\n\nPhone: ${rep.phone}\n\nScript: Introduce yourself as a constituent, mention your concern (disability rights, workers' rights, accessibility, etc.), and ask for their position on the issue.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${rep.phone}`).catch(() => {
              Alert.alert('Error', 'Failed to open phone app.');
            });
          },
        },
      ]
    );
  };

  const openSocialMedia = (url: string, platform: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', `Failed to open ${platform}.`);
    });
  };

  const trackResponse = (rep: Representative, responded: boolean) => {
    Alert.alert(
      'Track Response',
      responded
        ? `Did ${rep.name} respond supportively, neutrally, or negatively?`
        : 'We\'ll track this as no response.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Supportive', onPress: () => console.log('Supportive response') },
        { text: 'Neutral', onPress: () => console.log('Neutral response') },
        { text: 'Negative', onPress: () => console.log('Negative response') },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🗳️ Rep Tracker</Text>
        <Text style={styles.subtitle}>
          Find your representatives and hold them accountable on disability and workers' rights issues.
        </Text>
      </View>

      {!location && (
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Find Your Representatives</Text>
          <Text style={styles.cardText}>
            We'll use your location to find your federal MP, provincial MPP, and municipal councillor.
          </Text>
          <A11yPressable
            onPress={requestLocation}
            accessibilityRole="button"
            accessibilityLabel="Get my location"
            style={styles.primaryButton}
            hitSlop={HIT_SLOP_8}
          >
            {loading ? (
              <ActivityIndicator color={palette.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonText}>📍 Get My Location</Text>
            )}
          </A11yPressable>
        </View>
      )}

      {location && representatives.length > 0 && (
        <>
          <View style={styles.locationCard}>
            <Text style={styles.cardTitle}>✓ Location Found</Text>
            <Text style={styles.cardText}>
              {representatives.length} representative{representatives.length !== 1 ? 's' : ''} found
            </Text>
          </View>

          {representatives.map((rep, index) => (
            <View key={index} style={styles.repCard}>
              <Pressable 
                onPress={() => setSelectedRep(selectedRep?.name === rep.name ? null : rep)}
                accessibilityRole="button"
                accessibilityLabel={`${selectedRep?.name === rep.name ? 'Collapse' : 'Expand'} details for ${rep.name}, ${rep.role}`}
                accessibilityState={{ expanded: selectedRep?.name === rep.name }}
              >
                <View style={styles.repHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.repName}>{rep.name}</Text>
                    <Text style={styles.repRole}>
                      {rep.role} {rep.party && `• ${rep.party}`}
                    </Text>
                    {rep.riding && <Text style={styles.repRiding}>{rep.riding}</Text>}
                  </View>
                  {rep.responseRate !== undefined && (
                    <View style={styles.responseRateBadge}>
                      <Text style={styles.responseRateText}>{rep.responseRate}%</Text>
                      <Text style={styles.responseRateLabel}>Response</Text>
                    </View>
                  )}
                </View>
              </Pressable>

              {selectedRep?.name === rep.name && (
                <View style={styles.repDetails}>
                  {/* Voting Record */}
                  {rep.votingRecord && rep.votingRecord.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Voting Record</Text>
                      {rep.votingRecord.map((vote, vIdx) => (
                        <View key={vIdx} style={styles.voteItem}>
                          <Text style={styles.voteIssue}>{vote.issue}</Text>
                          <View style={styles.voteRow}>
                            <Text
                              style={[
                                styles.voteTag,
                                vote.vote === 'for' && styles.voteFor,
                                vote.vote === 'against' && styles.voteAgainst,
                                vote.vote === 'abstain' && styles.voteAbstain,
                              ]}
                            >
                              {vote.vote.toUpperCase()}
                            </Text>
                            <Text style={styles.voteDate}>{vote.date}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Contact Actions */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <GapView gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                      {rep.email && (
                        <>
                          <A11yPressable
                            onPress={() => sendEmail(rep, 'disability')}
                            style={styles.actionButton}
                            hitSlop={HIT_SLOP_8}
                          >
                            <Text style={styles.actionButtonText}>📧 Email (Disability)</Text>
                          </A11yPressable>
                          <A11yPressable
                            onPress={() => sendEmail(rep, 'workers')}
                            style={styles.actionButton}
                            hitSlop={HIT_SLOP_8}
                          >
                            <Text style={styles.actionButtonText}>📧 Email (Workers)</Text>
                          </A11yPressable>
                        </>
                      )}
                      {rep.phone && (
                        <A11yPressable
                          onPress={() => callRepresentative(rep)}
                          style={styles.actionButton}
                          hitSlop={HIT_SLOP_8}
                        >
                          <Text style={styles.actionButtonText}>📞 Call</Text>
                        </A11yPressable>
                      )}
                      {rep.website && (
                        <A11yPressable
                          onPress={() => Linking.openURL(rep.website!)}
                          style={styles.actionButton}
                          hitSlop={HIT_SLOP_8}
                        >
                          <Text style={styles.actionButtonText}>🌐 Website</Text>
                        </A11yPressable>
                      )}
                    </GapView>
                  </View>

                  {/* Social Media */}
                  {(rep.twitter || rep.facebook) && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>Social Media</Text>
                      <GapView gap={8} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {rep.twitter && (
                          <A11yPressable
                            onPress={() => openSocialMedia(rep.twitter!, 'Twitter')}
                            style={styles.socialButton}
                            hitSlop={HIT_SLOP_8}
                          >
                            <Text style={styles.actionButtonText}>𝕏 Twitter</Text>
                          </A11yPressable>
                        )}
                        {rep.facebook && (
                          <A11yPressable
                            onPress={() => openSocialMedia(rep.facebook!, 'Facebook')}
                            style={styles.socialButton}
                            hitSlop={HIT_SLOP_8}
                          >
                            <Text style={styles.actionButtonText}>👥 Facebook</Text>
                          </A11yPressable>
                        )}
                      </GapView>
                    </View>
                  )}

                  {/* Track Response */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Track Response</Text>
                    <A11yPressable
                      onPress={() => trackResponse(rep, true)}
                      style={styles.trackButton}
                      hitSlop={HIT_SLOP_8}
                    >
                      <Text style={styles.actionButtonText}>✓ Mark as Responded</Text>
                    </A11yPressable>
                  </View>
                </View>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// Mock data for testing
function getMockRepresentatives(): Representative[] {
  return [
    {
      name: 'Jane Smith',
      role: 'MP',
      party: 'Liberal',
      riding: 'Toronto Centre',
      email: 'jane.smith@parl.gc.ca',
      phone: '613-555-0100',
      website: 'https://example.com/janesmith',
      twitter: 'https://twitter.com/janesmith',
      facebook: 'https://facebook.com/janesmith',
      officeAddress: '123 Parliament Hill, Ottawa, ON',
      responseRate: 75,
      votingRecord: [
        {
          issue: 'Bill C-81 (Accessible Canada Act)',
          vote: 'for',
          date: '2019-05-16',
        },
        {
          issue: 'Disability Benefits Increase',
          vote: 'for',
          date: '2023-03-10',
        },
        {
          issue: 'Workplace Safety Standards',
          vote: 'for',
          date: '2024-01-15',
        },
      ],
    },
    {
      name: 'John Doe',
      role: 'MPP',
      party: 'NDP',
      riding: 'Toronto-St. Paul\'s',
      email: 'john.doe@ola.org',
      phone: '416-555-0200',
      website: 'https://example.com/johndoe',
      responseRate: 90,
      votingRecord: [
        {
          issue: 'AODA Enhancement Act',
          vote: 'for',
          date: '2022-11-20',
        },
        {
          issue: 'WSIB Reform Bill',
          vote: 'for',
          date: '2023-06-05',
        },
      ],
    },
    {
      name: 'Maria Garcia',
      role: 'Councillor',
      riding: 'Ward 27 - Toronto Centre-Rosedale',
      email: 'maria.garcia@toronto.ca',
      phone: '416-555-0300',
      website: 'https://example.com/mariagarcia',
      responseRate: 60,
      votingRecord: [
        {
          issue: 'Accessible Transit Expansion',
          vote: 'for',
          date: '2024-02-10',
        },
        {
          issue: 'Accessible Housing Development',
          vote: 'abstain',
          date: '2024-05-15',
        },
      ],
    },
  ];
}

const createStyles = (palette: ReturnType<typeof useAppPalette>, factor: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    header: {
      padding: 20 * factor,
      paddingBottom: 12 * factor,
    },
    title: {
      fontSize: 28 * factor,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 8 * factor,
    },
    subtitle: {
      fontSize: 15 * factor,
      color: palette.textMuted,
      lineHeight: 22 * factor,
    },
    locationCard: {
      marginHorizontal: 20 * factor,
      marginBottom: 16 * factor,
      padding: 16 * factor,
    },
    cardTitle: {
      fontSize: 18 * factor,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 8 * factor,
    },
    cardText: {
      fontSize: 14 * factor,
      color: palette.textMuted,
      marginBottom: 16 * factor,
      lineHeight: 20 * factor,
    },
    primaryButton: {
      backgroundColor: palette.primary,
      paddingVertical: 12 * factor,
      paddingHorizontal: 20 * factor,
      borderRadius: 8 * factor,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44 * factor,
    },
    primaryButtonText: {
      color: palette.onPrimary,
      fontSize: 16 * factor,
      fontWeight: '600',
    },
    repCard: {
      marginHorizontal: 20 * factor,
      marginBottom: 16 * factor,
      padding: 16 * factor,
    },
    repHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    repName: {
      fontSize: 20 * factor,
      fontWeight: '700',
      color: palette.text,
      marginBottom: 4 * factor,
    },
    repRole: {
      fontSize: 14 * factor,
      color: palette.textMuted,
      marginBottom: 2 * factor,
    },
    repRiding: {
      fontSize: 13 * factor,
      color: palette.textMuted,
      fontStyle: 'italic',
    },
    responseRateBadge: {
      backgroundColor: palette.primary,
      borderRadius: 8 * factor,
      paddingHorizontal: 12 * factor,
      paddingVertical: 8 * factor,
      alignItems: 'center',
    },
    responseRateText: {
      fontSize: 20 * factor,
      fontWeight: '700',
      color: palette.onPrimary,
    },
    responseRateLabel: {
      fontSize: 10 * factor,
      color: palette.onPrimary,
      opacity: 0.9,
    },
    repDetails: {
      marginTop: 16 * factor,
      paddingTop: 16 * factor,
      borderTopWidth: 1,
      borderTopColor: palette.border,
    },
    section: {
      marginBottom: 16 * factor,
    },
    sectionTitle: {
      fontSize: 16 * factor,
      fontWeight: '600',
      color: palette.text,
      marginBottom: 12 * factor,
    },
    voteItem: {
      backgroundColor: palette.cardAlt,
      padding: 12 * factor,
      borderRadius: 8 * factor,
      marginBottom: 8 * factor,
    },
    voteIssue: {
      fontSize: 14 * factor,
      fontWeight: '500',
      color: palette.text,
      marginBottom: 6 * factor,
    },
    voteRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    voteTag: {
      fontSize: 11 * factor,
      fontWeight: '700',
      paddingHorizontal: 8 * factor,
      paddingVertical: 4 * factor,
      borderRadius: 4 * factor,
    },
    voteFor: {
      backgroundColor: '#22c55e',
      color: '#ffffff',
    },
    voteAgainst: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
    voteAbstain: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
    },
    voteDate: {
      fontSize: 12 * factor,
      color: palette.textMuted,
    },
    actionButton: {
      backgroundColor: palette.primary,
      paddingVertical: 8 * factor,
      paddingHorizontal: 12 * factor,
      borderRadius: 6 * factor,
    },
    socialButton: {
      backgroundColor: palette.cardAlt,
      paddingVertical: 8 * factor,
      paddingHorizontal: 12 * factor,
      borderRadius: 6 * factor,
    },
    trackButton: {
      backgroundColor: palette.success || palette.primary,
      paddingVertical: 10 * factor,
      paddingHorizontal: 16 * factor,
      borderRadius: 6 * factor,
      alignItems: 'center',
    },
    actionButtonText: {
      fontSize: 13 * factor,
      fontWeight: '600',
      color: palette.text,
    },
  });
