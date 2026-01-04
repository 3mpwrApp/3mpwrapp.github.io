/**
 * MentorDiscovery - Main Component
 * Peer mentor discovery and matching system
 * 
 * Features:
 * - Search & filter mentors by expertise, disability, language
 * - View detailed mentor profiles
 * - Send mentorship requests
 * - Direct messaging with mentors
 * - Infinite scroll pagination
 * - Offline-friendly caching
 */

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useDebounce } from 'use-debounce';

import PowerToolTabContent from '../../../components/PowerToolTabContent';
import { auth } from '../../../firebase/config';
import { useTranslation } from '../../../i18n';
import { trackEvent } from '../../../services/analyticsClient';
import { useAppPalette } from '../../../theme/usePalette';
import { logger } from '../../../utils/logger';
import {
    createMentorshipRequest,
    getMentorProfile,
    searchMentors,
} from '../../../services/mentorService';
import type { MentorFilterOptions, MentorProfile } from '../../../types/mentor';

import { MentorList } from './MentorList';
import { MentorSearchBar } from './MentorSearchBar';

interface MentorDiscoveryProps {
    /** Current search query */
    searchQuery?: string;
    /** Is this tab active */
    isActive?: boolean;
}

export const MentorDiscovery: React.FC<MentorDiscoveryProps> = ({
    searchQuery: initialSearch = '',
    isActive = true,
}) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const router = useRouter();
    const styles = createStyles(palette);

    // State management
    const [searchQuery, setSearchQuery] = useState(initialSearch);
    const [debouncedSearch] = useDebounce(searchQuery, 500);
    const [filters, setFilters] = useState<MentorFilterOptions>({});
    const [showFilters, setShowFilters] = useState(false);
    const [mentors, setMentors] = useState<MentorProfile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [cursor, setCursor] = useState<any>(null);
    const [hasMore, setHasMore] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
    const [isRequestingMentorship, setIsRequestingMentorship] = useState(false);

    // Search effect - triggered when search or filters change
    useEffect(() => {
        if (!isActive) return;

        const performSearch = async () => {
            try {
                setIsLoading(true);
                setCursor(null);
                setMentors([]);

                const results = await searchMentors({
                    searchQuery: debouncedSearch,
                    ...filters,
                    pageSize: 20,
                });

                setMentors(results.mentors);
                setCursor(results.cursor);
                setHasMore(results.hasMore);

                trackEvent('mentor.search', {
                    query: debouncedSearch,
                    filters: Object.keys(filters).filter(
                        (key) => filters[key as keyof MentorFilterOptions]
                    ),
                    resultCount: results.mentors.length,
                });
            } catch (error) {
                logger.error('[MentorDiscovery] Search failed:', error);
                Alert.alert(
                    t('mentor.error.searchFailed', 'Search Failed'),
                    t(
                        'mentor.error.tryAgain',
                        'Unable to search mentors. Please try again.'
                    )
                );
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedSearch, filters, isActive, t]);

    // Load more mentors
    const handleLoadMore = useCallback(async () => {
        if (isLoadingMore || !hasMore || !cursor) return;

        try {
            setIsLoadingMore(true);

            const results = await searchMentors(
                {
                    searchQuery: debouncedSearch,
                    ...filters,
                    pageSize: 20,
                },
                cursor
            );

            setMentors((prev) => [...prev, ...results.mentors]);
            setCursor(results.cursor);
            setHasMore(results.hasMore);

            trackEvent('mentor.loadMore', {
                resultCount: results.mentors.length,
            });
        } catch (error) {
            logger.error('[MentorDiscovery] Load more failed:', error);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, cursor, debouncedSearch, filters]);

    // Handle mentor card press
    const handleMentorPress = useCallback(
        async (mentor: MentorProfile) => {
            try {
                // Get fresh data
                const fullProfile = await getMentorProfile(mentor.id);
                if (fullProfile) {
                    setSelectedMentor(fullProfile);
                }
                trackEvent('mentor.profileView', { mentorId: mentor.id });
            } catch (error) {
                logger.error('[MentorDiscovery] Get mentor profile failed:', error);
            }
        },
        []
    );

    // Handle mentorship request
    const handleMentorshipRequest = useCallback(
        async (mentor: MentorProfile) => {
            if (!auth.currentUser) {
                Alert.alert(
                    t('auth.required', 'Sign In Required'),
                    t(
                        'auth.signInToRequest',
                        'Please sign in to request mentorship'
                    )
                );
                return;
            }

            try {
                setIsRequestingMentorship(true);

                const requestId = await createMentorshipRequest(
                    mentor.id,
                    auth.currentUser.uid,
                    undefined,
                    mentor.expertises.map((e) => e.category)
                );

                if (requestId) {
                    Alert.alert(
                        t('mentor.requestSent', 'Request Sent'),
                        t(
                            'mentor.requestSentMessage',
                            'Your mentorship request has been sent. You\'ll be notified when they respond.'
                        ),
                        [
                            {
                                text: t('common.ok', 'OK'),
                                onPress: () => setSelectedMentor(null),
                            },
                        ]
                    );

                    trackEvent('mentor.requestSent', {
                        mentorId: mentor.id,
                    });
                }
            } catch (error) {
                logger.error('[MentorDiscovery] Request mentorship failed:', error);
                Alert.alert(
                    t('mentor.error.requestFailed', 'Request Failed'),
                    t(
                        'mentor.error.tryAgain',
                        'Unable to send request. Please try again.'
                    )
                );
            } finally {
                setIsRequestingMentorship(false);
            }
        },
        [t]
    );

    // Handle message
    const handleMessage = useCallback(
        (mentor: MentorProfile) => {
            if (!auth.currentUser) {
                Alert.alert(
                    t('auth.required', 'Sign In Required'),
                    t('auth.signInToMessage', 'Please sign in to message')
                );
                return;
            }

            // Navigate to direct messaging
            router.push({
                pathname: '/(tabs)/community/mutual-chat',
                params: { targetUserId: mentor.id },
            });

            trackEvent('mentor.messageInitiated', { mentorId: mentor.id });
        },
        [router, t]
    );

    // Determine if list is empty
    const isEmpty = useMemo(() => {
        return !isLoading && mentors.length === 0;
    }, [isLoading, mentors]);

    return (
        <PowerToolTabContent scrollable={false}>
            <View style={styles.container}>
                {/* Search Bar & Filters */}
                <MentorSearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onFiltersChange={(newFilters) => {
                        setFilters((prev) => ({ ...prev, ...newFilters }));
                    }}
                    showFilters={showFilters}
                    onToggleFilters={setShowFilters}
                    isSearching={isLoading}
                />

                {/* Mentor List */}
                <MentorList
                    mentors={mentors}
                    onMentorPress={handleMentorPress}
                    onMentorshipRequest={handleMentorshipRequest}
                    onMessage={handleMessage}
                    isLoadingMore={isLoadingMore}
                    onLoadMore={handleLoadMore}
                    hasMore={hasMore}
                    isEmpty={isEmpty}
                    isLoading={isLoading}
                />

                {/* Mentor Profile Modal */}
                <MentorProfile
                    mentor={selectedMentor}
                    onClose={() => setSelectedMentor(null)}
                    onRequest={handleMentorshipRequest}
                    onMessage={handleMessage}
                    isLoading={isRequestingMentorship}
                />
            </View>
        </PowerToolTabContent>
    );
};

function createStyles(palette: any) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: palette.background,
        },
    });
}
