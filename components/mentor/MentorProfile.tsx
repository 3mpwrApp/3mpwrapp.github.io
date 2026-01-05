/**
 * MentorProfile Component
 * Detailed mentor profile view (modal/full-screen)
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';
import type { MentorProfile as MentorProfileType } from '../../types/mentor';
import A11yPressable from '../A11yPressable';
import GapView from '../GapView';

interface MentorProfileProps {
    mentor: MentorProfileType | null;
    /** Called when close button is pressed */
    onClose?: () => void;
    /** Called when request button is pressed */
    onRequest?: (mentor: MentorProfileType) => void;
    /** Called when message button is pressed */
    onMessage?: (mentor: MentorProfileType) => void;
    /** Is loading actions */
    isLoading?: boolean;
}

export const MentorProfile: React.FC<MentorProfileProps> = ({
    mentor,
    onClose,
    onRequest,
    onMessage,
    isLoading,
}) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const styles = createStyles(palette);
    const [_reportError, setReportError] = useState(false);

    const isVisible = mentor !== null;

    // Determine availability (must be outside conditional block)
    const availabilityText = useMemo(() => {
        if (!mentor) return '';
        if (!mentor.acceptingMentees) {
            return t('mentor.notAcceptingMentees', 'Not accepting new mentees');
        }
        if (mentor.availability.length === 0) {
            return t('mentor.flexibleAvailability', 'Flexible availability');
        }
        const slot = mentor.availability[0];
        return `${slot.startTime} - ${slot.endTime} ${slot.timezone}`;
    }, [mentor, t]);

    const handleReport = useCallback(() => {
        Alert.alert(
            t('mentor.report.title', 'Report Mentor'),
            t(
                'mentor.report.message',
                'This mentors behavior will be reviewed by our team.'
            ),
            [
                { text: t('common.cancel', 'Cancel'), onPress: () => {} },
                {
                    text: t('mentor.report.confirm', 'Report'),
                    onPress: () => setReportError(true),
                },
            ]
        );
    }, [t]);

    if (!mentor) return null;

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            onRequestClose={onClose}
            transparent={false}
        >
            <View style={[styles.container, { backgroundColor: palette.background }]}>
                {/* Header */}
                <View
                    style={[
                        styles.header,
                        { backgroundColor: palette.card, borderBottomColor: palette.border },
                    ]}
                >
                    <A11yPressable
                        onPress={onClose}
                        style={styles.closeButton}
                        accessibilityLabel={t('common.close', 'Close')}
                        hitSlop={HIT_SLOP_8}
                    >
                        <Ionicons
                            name="chevron-down"
                            size={28}
                            color={palette.text}
                        />
                    </A11yPressable>
                    <Text
                        style={[styles.headerTitle, { color: palette.text }]}
                    >
                        {t('mentor.profile', 'Mentor Profile')}
                    </Text>
                    <View style={{ width: 44 }} />
                </View>

                {/* Scrollable Content */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Profile Photo & Info */}
                    <View style={styles.profileHeader}>
                        {mentor.photoUrl ? (
                            <Image
                                source={{ uri: mentor.photoUrl }}
                                style={styles.profilePhoto}
                            />
                        ) : (
                            <View
                                style={[
                                    styles.profilePhoto,
                                    { backgroundColor: palette.border },
                                ]}
                            >
                                <Ionicons
                                    name="person-circle"
                                    size={80}
                                    color={palette.secondaryText}
                                />
                            </View>
                        )}

                        {/* Verification Badge */}
                        {mentor.verificationStatus !== 'unverified' && (
                            <View
                                style={[
                                    styles.verificationBadge,
                                    {
                                        backgroundColor:
                                            mentor.verificationStatus === 'certified'
                                                ? '#4CAF50' // eslint-disable-line no-restricted-syntax
                                                : palette.primary,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name="checkmark-circle"
                                    size={20}
                                    color="white"
                                />
                            </View>
                        )}
                    </View>

                    <GapView style={{ height: 16 }} />

                    {/* Name & Stats */}
                    <View style={styles.section}>
                        <Text
                            style={[styles.profileName, { color: palette.text }]}
                        >
                            {mentor.displayName}
                        </Text>

                        {mentor.pronouns && (
                            <Text
                                style={[
                                    styles.pronouns,
                                    { color: palette.secondaryText },
                                ]}
                            >
                                {mentor.pronouns}
                            </Text>
                        )}

                        <GapView style={{ height: 12 }} />

                        {/* Rating & Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <View style={styles.statContent}>
                                    <Ionicons
                                        name="star"
                                        size={20}
                                        color="#FFC107" // eslint-disable-line no-restricted-syntax
                                    />
                                    <Text
                                        style={[
                                            styles.statValue,
                                            { color: palette.text },
                                        ]}
                                    >
                                        {mentor.rating.toFixed(1)}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.statLabel,
                                        { color: palette.secondaryText },
                                    ]}
                                >
                                    {t('mentor.rating', 'Rating')}
                                </Text>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statContent}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={20}
                                        color={palette.success}
                                    />
                                    <Text
                                        style={[
                                            styles.statValue,
                                            { color: palette.text },
                                        ]}
                                    >
                                        {mentor.totalMatches}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.statLabel,
                                        { color: palette.secondaryText },
                                    ]}
                                >
                                    {t('mentor.matches', 'Matches')}
                                </Text>
                            </View>

                            {mentor.averageResponseTime && (
                                <View style={styles.statBox}>
                                    <View style={styles.statContent}>
                                        <Ionicons
                                            name="time"
                                            size={20}
                                            color={palette.primary}
                                        />
                                        <Text
                                            style={[
                                                styles.statValue,
                                                { color: palette.text },
                                            ]}
                                        >
                                            {mentor.averageResponseTime}
                                            m
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.statLabel,
                                            { color: palette.secondaryText },
                                        ]}
                                    >
                                        {t('mentor.response', 'Response')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <GapView style={{ height: 20 }} />

                    {/* Bio */}
                    {mentor.bio && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t('mentor.about', 'About')}
                                </Text>
                                <Text
                                    style={[
                                        styles.bioText,
                                        { color: palette.secondaryText },
                                    ]}
                                >
                                    {mentor.bio}
                                </Text>
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Expertise */}
                    {mentor.expertises.length > 0 && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t('mentor.expertise', 'Expertise')}
                                </Text>
                                {mentor.expertises.map((exp, idx) => (
                                    <View key={idx} style={styles.expertiseItem}>
                                        <View
                                            style={[
                                                styles.expertiseMarker,
                                                { backgroundColor: palette.primary },
                                            ]}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={[
                                                    styles.expertiseCategory,
                                                    { color: palette.text },
                                                ]}
                                            >
                                                {exp.category}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.expertiseYears,
                                                    { color: palette.secondaryText },
                                                ]}
                                            >
                                                {exp.yearsOfExperience}
                                                {t('mentor.years', ' years')}
                                            </Text>
                                            {exp.description && (
                                                <Text
                                                    style={[
                                                        styles.expertiseDescription,
                                                        { color: palette.secondaryText },
                                                    ]}
                                                >
                                                    {exp.description}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Disabilities & Experiences */}
                    {mentor.disabilities.length > 0 && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t(
                                        'mentor.disabilities',
                                        'Disabilities & Conditions'
                                    )}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {mentor.disabilities.map((disability) => (
                                        <View
                                            key={disability}
                                            style={[
                                                styles.tag,
                                                { backgroundColor: palette.primary + '20' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.tagText,
                                                    { color: palette.primary },
                                                ]}
                                            >
                                                {disability}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Languages */}
                    {mentor.languages.length > 0 && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t('mentor.languages', 'Languages')}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {mentor.languages.map((language) => (
                                        <View
                                            key={language}
                                            style={[
                                                styles.tag,
                                                { backgroundColor: palette.success + '20' },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.tagText,
                                                    { color: palette.success },
                                                ]}
                                            >
                                                {language}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Availability */}
                    <View style={styles.section}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                { color: palette.text },
                            ]}
                        >
                            {t('mentor.availability', 'Availability')}
                        </Text>
                        <View
                            style={[
                                styles.availabilityBox,
                                { backgroundColor: palette.card, borderColor: palette.border },
                            ]}
                        >
                            <Ionicons
                                name={
                                    mentor.acceptingMentees
                                        ? 'checkmark-circle'
                                        : 'close-circle'
                                }
                                size={20}
                                color={
                                    mentor.acceptingMentees
                                        ? palette.success
                                        : palette.danger
                                }
                            />
                            <Text
                                style={[
                                    styles.availabilityText,
                                    {
                                        color: mentor.acceptingMentees
                                            ? palette.success
                                            : palette.danger,
                                    },
                                ]}
                            >
                                {availabilityText}
                            </Text>
                        </View>
                    </View>

                    <GapView style={{ height: 20 }} />

                    {/* Communication Methods */}
                    {mentor.communicationMethods.length > 0 && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t('mentor.communication', 'Communication Methods')}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {mentor.communicationMethods.map((method) => (
                                        <View
                                            key={method}
                                            style={[
                                                styles.tag,
                                                { backgroundColor: palette.border },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.tagText,
                                                    { color: palette.text },
                                                ]}
                                            >
                                                {method}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Badges */}
                    {mentor.badges && mentor.badges.length > 0 && (
                        <>
                            <View style={styles.section}>
                                <Text
                                    style={[
                                        styles.sectionTitle,
                                        { color: palette.text },
                                    ]}
                                >
                                    {t('mentor.badges', 'Badges')}
                                </Text>
                                <View style={styles.tagsContainer}>
                                    {mentor.badges.map((badge) => (
                                        <View
                                            key={badge}
                                            style={[
                                                styles.badgeTag,
                                                {
                                                    backgroundColor:
                                                        palette.primary + '20',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name="ribbon"
                                                size={14}
                                                color={palette.primary}
                                            />
                                            <Text
                                                style={[
                                                    styles.tagText,
                                                    { color: palette.primary },
                                                ]}
                                            >
                                                {badge}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <GapView style={{ height: 20 }} />
                        </>
                    )}

                    {/* Report Button */}
                    <A11yPressable
                        onPress={handleReport}
                        style={[
                            styles.reportButton,
                            { backgroundColor: palette.danger + '20' },
                        ]}
                        accessibilityLabel={t('mentor.report.label', 'Report Mentor')}
                        hitSlop={HIT_SLOP_8}
                    >
                        <Ionicons
                            name="flag"
                            size={16}
                            color={palette.danger}
                        />
                        <Text
                            style={[
                                styles.reportButtonText,
                                { color: palette.danger },
                            ]}
                        >
                            {t('mentor.report.button', 'Report Mentor')}
                        </Text>
                    </A11yPressable>

                    <GapView style={{ height: 24 }} />
                </ScrollView>

                {/* Action Buttons */}
                {mentor.acceptingMentees && (
                    <View
                        style={[
                            styles.actionBar,
                            {
                                backgroundColor: palette.card,
                                borderTopColor: palette.border,
                            },
                        ]}
                    >
                        <A11yPressable
                            onPress={() => onMessage?.(mentor)}
                            disabled={isLoading}
                            style={[
                                styles.actionButtonLarge,
                                {
                                    backgroundColor: palette.primary,
                                    opacity: isLoading ? 0.5 : 1,
                                },
                            ]}
                            accessibilityLabel={t(
                                'mentor.message',
                                'Send Message'
                            )}
                            hitSlop={HIT_SLOP_8}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={palette.cardText}
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="chatbubble"
                                        size={18}
                                        color={palette.cardText}
                                    />
                                    <Text
                                        style={[
                                            styles.actionButtonTextLarge,
                                            { color: palette.cardText },
                                        ]}
                                    >
                                        {t('common.message', 'Message')}
                                    </Text>
                                </>
                            )}
                        </A11yPressable>

                        <A11yPressable
                            onPress={() => onRequest?.(mentor)}
                            disabled={isLoading}
                            style={[
                                styles.actionButtonLarge,
                                {
                                    backgroundColor: palette.success,
                                    opacity: isLoading ? 0.5 : 1,
                                },
                            ]}
                            accessibilityLabel={t(
                                'mentor.requestMentorship',
                                'Request Mentorship'
                            )}
                            hitSlop={HIT_SLOP_8}
                        >
                            {isLoading ? (
                                <ActivityIndicator
                                    size="small"
                                    color={palette.cardText}
                                />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={18}
                                        color={palette.cardText}
                                    />
                                    <Text
                                        style={[
                                            styles.actionButtonTextLarge,
                                            { color: palette.cardText },
                                        ]}
                                    >
                                        {t('mentor.request', 'Request')}
                                    </Text>
                                </>
                            )}
                        </A11yPressable>
                    </View>
                )}
            </View>
        </Modal>
    );
};

function createStyles(palette: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
        },
        closeButton: {
            width: 44,
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '600',
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: 16,
        },
        profileHeader: {
            alignItems: 'center',
            paddingVertical: 24,
            position: 'relative',
        },
        profilePhoto: {
            width: 120,
            height: 120,
            borderRadius: 60,
            justifyContent: 'center',
            alignItems: 'center',
        },
        verificationBadge: {
            position: 'absolute',
            bottom: 0,
            right: -8,
            borderRadius: 12,
            padding: 4,
        },
        section: {
            marginBottom: 8,
        },
        profileName: {
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
        },
        pronouns: {
            fontSize: 14,
            textAlign: 'center',
            fontStyle: 'italic',
        },
        statsRow: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            gap: 8,
        },
        statBox: {
            flex: 1,
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            backgroundColor: palette.card,
        },
        statContent: {
            alignItems: 'center',
            gap: 4,
            marginBottom: 4,
        },
        statValue: {
            fontSize: 18,
            fontWeight: '700',
        },
        statLabel: {
            fontSize: 12,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
        },
        bioText: {
            fontSize: 14,
            lineHeight: 20,
        },
        expertiseItem: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
        },
        expertiseMarker: {
            width: 4,
            borderRadius: 2,
            marginTop: 4,
        },
        expertiseCategory: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 4,
        },
        expertiseYears: {
            fontSize: 12,
            marginBottom: 4,
        },
        expertiseDescription: {
            fontSize: 12,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        tag: {
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 14,
        },
        tagText: {
            fontSize: 12,
            fontWeight: '500',
        },
        badgeTag: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 14,
        },
        availabilityBox: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
        },
        availabilityText: {
            fontSize: 14,
            fontWeight: '500',
            flex: 1,
        },
        reportButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 12,
            borderRadius: 8,
            marginBottom: 8,
        },
        reportButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        actionBar: {
            flexDirection: 'row',
            gap: 12,
            padding: 16,
            borderTopWidth: 1,
        },
        actionButtonLarge: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            borderRadius: 8,
            gap: 8,
        },
        actionButtonTextLarge: {
            fontSize: 14,
            fontWeight: '600',
        },
    });
}
