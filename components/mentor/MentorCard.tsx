/**
 * MentorCard Component
 * Compact mentor preview card for list/grid display
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Image,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';
import type { MentorProfile } from '../../types/mentor';
import A11yPressable from '../A11yPressable';
import GapView from '../GapView';

interface MentorCardProps {
    mentor: MentorProfile;
    /** Called when card is pressed */
    onPress?: () => void;
    /** Called when message button is pressed */
    onMessage?: () => void;
    /** Called when request button is pressed */
    onRequest?: () => void;
    /** Show action buttons */
    showActions?: boolean;
    /** Is loading actions */
    isLoadingActions?: boolean;
}

export const MentorCard: React.FC<MentorCardProps> = ({
    mentor,
    onPress,
    onMessage,
    onRequest,
    showActions = true,
    isLoadingActions,
}) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const styles = createStyles(palette);

    // Determine availability status
    const getAvailabilityStatus = () => {
        if (!mentor.acceptingMentees) {
            return { label: t('mentor.unavailable', 'Not accepting mentees'), color: palette.danger };
        }
        if (mentor.lastActive && Date.now() - mentor.lastActive < 5 * 60 * 1000) {
            return { label: t('mentor.online', 'Online now'), color: palette.success };
        }
        return { label: t('mentor.available', 'Available'), color: palette.primary };
    };

    const availability = getAvailabilityStatus();

    return (
        <A11yPressable
            onPress={onPress}
            style={[styles.card, { backgroundColor: palette.card }]}
            accessibilityLabel={`${mentor.displayName}, ${mentor.rating} stars`}
            accessible
        >
            {/* Header: Photo + Basic Info */}
            <View style={styles.header}>
                {/* Photo */}
                <View style={styles.photoContainer}>
                    {mentor.photoUrl ? (
                        <Image
                            source={{ uri: mentor.photoUrl }}
                            style={styles.photo}
                            defaultSource={require('../../../assets/images/default-avatar.png')}
                        />
                    ) : (
                        <View style={[styles.photo, { backgroundColor: palette.border }]}>
                            <Ionicons
                                name="person-circle"
                                size={48}
                                color={palette.secondaryText}
                            />
                        </View>
                    )}

                    {/* Availability Badge */}
                    <View
                        style={[
                            styles.availabilityBadge,
                            { backgroundColor: availability.color },
                        ]}
                    >
                        <Text
                            style={[
                                styles.availabilityBadgeText,
                                { fontSize: 10 },
                            ]}
                            numberOfLines={1}
                        >
                            {availability.label}
                        </Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoContainer}>
                    <Text
                        style={[styles.name, { color: palette.text }]}
                        numberOfLines={2}
                    >
                        {mentor.displayName}
                    </Text>

                    {/* Rating */}
                    <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#FFC107" />
                        <Text style={[styles.rating, { color: palette.text }]}>
                            {mentor.rating.toFixed(1)}
                        </Text>
                        <Text
                            style={[
                                styles.ratingCount,
                                { color: palette.secondaryText },
                            ]}
                        >
                            ({mentor.ratingCount})
                        </Text>
                    </View>

                    {/* Primary Expertise */}
                    {mentor.expertises.length > 0 && (
                        <Text
                            style={[
                                styles.expertise,
                                { color: palette.secondaryText },
                            ]}
                            numberOfLines={1}
                        >
                            {mentor.expertises[0].category}
                        </Text>
                    )}
                </View>
            </View>

            <GapView style={{ height: 8 }} />

            {/* Bio Preview */}
            {mentor.bio && (
                <>
                    <Text
                        style={[styles.bio, { color: palette.secondaryText }]}
                        numberOfLines={2}
                    >
                        {mentor.bio}
                    </Text>
                    <GapView style={{ height: 8 }} />
                </>
            )}

            {/* Tags */}
            {(mentor.disabilities.length > 0 ||
                mentor.languages.length > 0) && (
                <>
                    <View style={styles.tagsContainer}>
                        {mentor.disabilities.slice(0, 2).map((disability) => (
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
                                    numberOfLines={1}
                                >
                                    {disability}
                                </Text>
                            </View>
                        ))}
                        {mentor.languages.slice(0, 1).map((language) => (
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
                                    numberOfLines={1}
                                >
                                    {language}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <GapView style={{ height: 8 }} />
                </>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={palette.success}
                    />
                    <Text
                        style={[
                            styles.statText,
                            { color: palette.secondaryText },
                        ]}
                    >
                        {mentor.totalMatches}
                        {t('mentor.matches', ' matches')}
                    </Text>
                </View>

                {mentor.averageResponseTime && (
                    <View style={styles.statItem}>
                        <Ionicons
                            name="time"
                            size={14}
                            color={palette.primary}
                        />
                        <Text
                            style={[
                                styles.statText,
                                { color: palette.secondaryText },
                            ]}
                        >
                            {mentor.averageResponseTime}
                            {t('mentor.responseTime', ' min')}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            {showActions && (
                <>
                    <GapView style={{ height: 10 }} />
                    <View style={styles.actionButtonsContainer}>
                        <A11yPressable
                            onPress={onRequest}
                            disabled={isLoadingActions || !mentor.acceptingMentees}
                            style={[
                                styles.actionButton,
                                styles.primaryButton,
                                {
                                    backgroundColor: mentor.acceptingMentees
                                        ? palette.primary
                                        : palette.border,
                                },
                            ]}
                            accessibilityLabel={t(
                                'mentor.requestMentorship',
                                'Request Mentorship'
                            )}
                            hitSlop={HIT_SLOP_8}
                        >
                            {isLoadingActions ? (
                                <ActivityIndicator size="small" color={palette.cardText} />
                            ) : (
                                <>
                                    <Ionicons
                                        name="person-add"
                                        size={16}
                                        color={palette.cardText}
                                    />
                                    <Text
                                        style={[
                                            styles.actionButtonText,
                                            { color: palette.cardText },
                                        ]}
                                    >
                                        {t('mentor.request', 'Request')}
                                    </Text>
                                </>
                            )}
                        </A11yPressable>

                        <A11yPressable
                            onPress={onMessage}
                            style={[
                                styles.actionButton,
                                styles.secondaryButton,
                                { borderColor: palette.primary },
                            ]}
                            accessibilityLabel={t('mentor.message', 'Send Message')}
                            hitSlop={HIT_SLOP_8}
                        >
                            <Ionicons
                                name="chatbubble-outline"
                                size={16}
                                color={palette.primary}
                            />
                            <Text
                                style={[
                                    styles.actionButtonText,
                                    { color: palette.primary },
                                ]}
                            >
                                {t('common.message', 'Message')}
                            </Text>
                        </A11yPressable>
                    </View>
                </>
            )}
        </A11yPressable>
    );
};

function createStyles(palette: any) {
    return StyleSheet.create({
        card: {
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: palette.border,
        },
        header: {
            flexDirection: 'row',
            gap: 12,
        },
        photoContainer: {
            position: 'relative',
        },
        photo: {
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
        },
        availabilityBadge: {
            position: 'absolute',
            bottom: -2,
            right: -2,
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
        },
        availabilityBadgeText: {
            fontSize: 10,
            color: 'white',
            fontWeight: '600',
        },
        infoContainer: {
            flex: 1,
            justifyContent: 'flex-start',
        },
        name: {
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4,
        },
        ratingContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            marginBottom: 4,
        },
        rating: {
            fontSize: 14,
            fontWeight: '600',
        },
        ratingCount: {
            fontSize: 12,
        },
        expertise: {
            fontSize: 12,
            fontStyle: 'italic',
        },
        bio: {
            fontSize: 13,
            lineHeight: 18,
        },
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
        },
        tag: {
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 12,
        },
        tagText: {
            fontSize: 11,
            fontWeight: '500',
        },
        statsContainer: {
            flexDirection: 'row',
            gap: 16,
        },
        statItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        statText: {
            fontSize: 12,
        },
        actionButtonsContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            borderRadius: 8,
            gap: 6,
        },
        primaryButton: {
            backgroundColor: 'primary',
        },
        secondaryButton: {
            borderWidth: 1,
            backgroundColor: 'transparent',
        },
        actionButtonText: {
            fontSize: 12,
            fontWeight: '600',
        },
    });
}
