/**
 * MentorList Component
 * List/grid layout for mentor cards with infinite scroll
 */

import React, { useCallback, useMemo } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';
import type { MentorProfile } from '../../types/mentor';
import GapView from '../GapView';

import { MentorCard } from './MentorCard';

interface MentorListProps {
    mentors: MentorProfile[];
    /** Called when mentor card is pressed */
    onMentorPress?: (mentor: MentorProfile) => void;
    /** Called when request button is pressed */
    onMentorshipRequest?: (mentor: MentorProfile) => void;
    /** Called when message button is pressed */
    onMessage?: (mentor: MentorProfile) => void;
    /** Is loading more mentors */
    isLoadingMore?: boolean;
    /** Called when end of list is reached */
    onLoadMore?: () => void;
    /** Has more results available */
    hasMore?: boolean;
    /** Is empty state */
    isEmpty?: boolean;
    /** Loading initial data */
    isLoading?: boolean;
}

export const MentorList: React.FC<MentorListProps> = ({
    mentors,
    onMentorPress,
    onMentorshipRequest,
    onMessage,
    isLoadingMore,
    onLoadMore,
    hasMore,
    isEmpty,
    isLoading,
}) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const styles = createStyles(palette);

    const handleEndReached = useCallback(() => {
        if (!isLoadingMore && hasMore && onLoadMore) {
            onLoadMore();
        }
    }, [isLoadingMore, hasMore, onLoadMore]);

    const renderMentorCard = useCallback(
        ({ item }: { item: MentorProfile }) => (
            <MentorCard
                mentor={item}
                onPress={() => onMentorPress?.(item)}
                onRequest={() => onMentorshipRequest?.(item)}
                onMessage={() => onMessage?.(item)}
                showActions
            />
        ),
        [onMentorPress, onMentorshipRequest, onMessage]
    );

    const renderFooter = useMemo(() => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="large" color={palette.primary} />
                <GapView style={{ height: 12 }} />
                <Text style={[styles.loadingText, { color: palette.secondaryText }]}>
                    {t('common.loadingMore', 'Loading more mentors...')}
                </Text>
            </View>
        );
    }, [isLoadingMore, palette.primary, palette.secondaryText, t]);

    const renderEmptyState = useMemo(() => {
        if (!isEmpty) return null;
        return (
            <View style={styles.emptyStateContainer}>
                <Text
                    style={[styles.emptyStateTitle, { color: palette.text }]}
                >
                    {t('mentor.noResults.title', 'No mentors found')}
                </Text>
                <Text
                    style={[
                        styles.emptyStateDescription,
                        { color: palette.secondaryText },
                    ]}
                >
                    {t(
                        'mentor.noResults.description',
                        'Try adjusting your filters or search terms'
                    )}
                </Text>
            </View>
        );
    }, [isEmpty, palette.text, palette.secondaryText, t]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={palette.primary} />
                <GapView style={{ height: 12 }} />
                <Text style={[styles.loadingText, { color: palette.secondaryText }]}>
                    {t('mentor.searching', 'Searching for mentors...')}
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={mentors}
            renderItem={renderMentorCard}
            keyExtractor={(item) => item.id}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyState}
            scrollEnabled={mentors.length > 0}
            contentContainerStyle={styles.listContent}
            accessibilityLabel={t('mentor.list', 'List of mentors')}
            accessible
        />
    );
};

function createStyles(palette: any) {
    return StyleSheet.create({
        listContent: {
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 24,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 48,
        },
        loadingFooter: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 24,
        },
        loadingText: {
            fontSize: 14,
        },
        emptyStateContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 48,
            paddingHorizontal: 24,
        },
        emptyStateTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 8,
        },
        emptyStateDescription: {
            fontSize: 14,
            textAlign: 'center',
        },
    });
}
