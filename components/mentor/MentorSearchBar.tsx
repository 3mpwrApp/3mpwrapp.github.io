/**
 * MentorSearchBar Component
 * Search and filter controls for mentor discovery
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { HIT_SLOP_8 } from '../../constants/A11Y';
import { useTranslation } from '../../i18n';
import { useAppPalette } from '../../theme/usePalette';
import type { MentorFilterOptions } from '../../types/mentor';
import A11yPressable from '../A11yPressable';
import GapView from '../GapView';

interface MentorSearchBarProps {
    /** Current search query */
    searchQuery: string;
    /** Called when search query changes */
    onSearchChange: (query: string) => void;
    /** Called when filters change */
    onFiltersChange: (filters: Partial<MentorFilterOptions>) => void;
    /** Show filter panel */
    showFilters: boolean;
    /** Called to toggle filter panel */
    onToggleFilters: (show: boolean) => void;
    /** Is searching */
    isSearching?: boolean;
}

const DISABILITY_OPTIONS = [
    'Physical Disability',
    'Neurodivergent (ADHD, Autism)',
    'Mental Health Condition',
    'Chronic Illness',
    'Invisible Disability',
    'Deaf/Hard of Hearing',
    'Blind/Low Vision',
];

const EXPERIENCE_OPTIONS = [
    'Newly Diagnosed',
    'Workplace Advocacy',
    'Healthcare Navigation',
    'Benefits & Financial',
    'Legal & Rights',
    'Education & School',
    'Family & Relationships',
];

const LANGUAGE_OPTIONS = [
    'English',
    'French',
    'Spanish',
    'Mandarin',
    'Punjabi',
    'Vietnamese',
];

const SORT_OPTIONS = [
    { value: 'rating', label: 'Highest Rating' },
    { value: 'responseTime', label: 'Fastest Response' },
    { value: 'recentlyActive', label: 'Recently Active' },
    { value: 'mostMatches', label: 'Most Experienced' },
];

export const MentorSearchBar: React.FC<MentorSearchBarProps> = ({
    searchQuery,
    onSearchChange,
    onFiltersChange,
    showFilters,
    onToggleFilters,
    isSearching,
}) => {
    const { t } = useTranslation();
    const palette = useAppPalette();
    const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([]);
    const [selectedExperiences, setSelectedExperiences] = useState<string[]>([]);
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
    const [selectedSort, setSelectedSort] = useState<string>('rating');

    const styles = createStyles(palette);

    const handleDisabilityToggle = useCallback(
        (disability: string) => {
            const updated = selectedDisabilities.includes(disability)
                ? selectedDisabilities.filter((d) => d !== disability)
                : [...selectedDisabilities, disability];
            setSelectedDisabilities(updated);
            onFiltersChange({ disabilities: updated });
        },
        [selectedDisabilities, onFiltersChange]
    );

    const handleExperienceToggle = useCallback(
        (experience: string) => {
            const updated = selectedExperiences.includes(experience)
                ? selectedExperiences.filter((e) => e !== experience)
                : [...selectedExperiences, experience];
            setSelectedExperiences(updated);
            onFiltersChange({ experiences: updated });
        },
        [selectedExperiences, onFiltersChange]
    );

    const handleLanguageToggle = useCallback(
        (language: string) => {
            const updated = selectedLanguages.includes(language)
                ? selectedLanguages.filter((l) => l !== language)
                : [...selectedLanguages, language];
            setSelectedLanguages(updated);
            onFiltersChange({ languages: updated });
        },
        [selectedLanguages, onFiltersChange]
    );

    const handleSortChange = useCallback(
        (sort: string) => {
            setSelectedSort(sort);
            onFiltersChange({ sortBy: sort as any });
        },
        [onFiltersChange]
    );

    const clearAllFilters = useCallback(() => {
        setSelectedDisabilities([]);
        setSelectedExperiences([]);
        setSelectedLanguages([]);
        setSelectedSort('rating');
        onSearchChange('');
        onFiltersChange({
            disabilities: [],
            experiences: [],
            languages: [],
            sortBy: 'rating',
        });
    }, [onSearchChange, onFiltersChange]);

    const filterCount =
        selectedDisabilities.length +
        selectedExperiences.length +
        selectedLanguages.length +
        (searchQuery ? 1 : 0);

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={[styles.searchInputContainer, { backgroundColor: palette.card }]}>
                <Ionicons
                    name="search"
                    size={20}
                    color={palette.secondaryText}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.searchInput, { color: palette.text }]}
                    placeholder={t('mentor.search.placeholder', 'Search by mentor name...')}
                    placeholderTextColor={palette.secondaryText}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    accessibilityLabel={t('mentor.search.label', 'Search mentors')}
                />
                {isSearching && (
                    <ActivityIndicator size="small" color={palette.primary} />
                )}
            </View>

            {/* Filter Toggle */}
            <View style={styles.filterToggleRow}>
                <A11yPressable
                    onPress={() => onToggleFilters(!showFilters)}
                    style={[
                        styles.filterButton,
                        {
                            backgroundColor: showFilters ? palette.primary : palette.card,
                        },
                    ]}
                    accessibilityLabel={t(
                        'mentor.filter.toggle',
                        `${showFilters ? 'Hide' : 'Show'} filters`
                    )}
                    hitSlop={HIT_SLOP_8}
                >
                    <Ionicons
                        name="funnel"
                        size={18}
                        color={showFilters ? palette.cardText : palette.text}
                    />
                    <Text
                        style={[
                            styles.filterButtonText,
                            {
                                color: showFilters ? palette.cardText : palette.text,
                            },
                        ]}
                    >
                        {t('mentor.filter.label', 'Filters')}
                        {filterCount > 0 && ` (${filterCount})`}
                    </Text>
                </A11yPressable>

                {filterCount > 0 && (
                    <A11yPressable
                        onPress={clearAllFilters}
                        style={styles.clearButton}
                        accessibilityLabel={t('mentor.filter.clear', 'Clear all filters')}
                        hitSlop={HIT_SLOP_8}
                    >
                        <Text style={[styles.clearButtonText, { color: palette.primary }]}>
                            {t('common.clear', 'Clear')}
                        </Text>
                    </A11yPressable>
                )}
            </View>

            {/* Filter Panel */}
            {showFilters && (
                <ScrollView
                    style={[styles.filterPanel, { backgroundColor: palette.card }]}
                    scrollEnabled={false}
                >
                    {/* Sort */}
                    <View style={styles.filterSection}>
                        <Text
                            style={[
                                styles.filterSectionTitle,
                                { color: palette.text },
                            ]}
                        >
                            {t('mentor.filter.sortBy', 'Sort By')}
                        </Text>
                        <View style={styles.optionGrid}>
                            {SORT_OPTIONS.map((option) => (
                                <A11yPressable
                                    key={option.value}
                                    onPress={() => handleSortChange(option.value)}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor:
                                                selectedSort === option.value
                                                    ? palette.primary
                                                    : palette.background,
                                            borderColor: palette.border,
                                        },
                                    ]}
                                    accessibilityLabel={option.label}
                                    hitSlop={HIT_SLOP_8}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            {
                                                color:
                                                    selectedSort === option.value
                                                        ? palette.cardText
                                                        : palette.text,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </A11yPressable>
                            ))}
                        </View>
                    </View>

                    <GapView style={{ height: 16 }} />

                    {/* Disabilities */}
                    <View style={styles.filterSection}>
                        <Text
                            style={[
                                styles.filterSectionTitle,
                                { color: palette.text },
                            ]}
                        >
                            {t('mentor.filter.disabilities', 'Disabilities & Conditions')}
                        </Text>
                        <View style={styles.optionGrid}>
                            {DISABILITY_OPTIONS.map((disability) => (
                                <A11yPressable
                                    key={disability}
                                    onPress={() => handleDisabilityToggle(disability)}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor:
                                                selectedDisabilities.includes(disability)
                                                    ? palette.primary
                                                    : palette.background,
                                            borderColor: palette.border,
                                        },
                                    ]}
                                    accessibilityLabel={disability}
                                    hitSlop={HIT_SLOP_8}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            {
                                                color:
                                                    selectedDisabilities.includes(disability)
                                                        ? palette.cardText
                                                        : palette.text,
                                            },
                                        ]}
                                    >
                                        {disability}
                                    </Text>
                                </A11yPressable>
                            ))}
                        </View>
                    </View>

                    <GapView style={{ height: 16 }} />

                    {/* Experiences */}
                    <View style={styles.filterSection}>
                        <Text
                            style={[
                                styles.filterSectionTitle,
                                { color: palette.text },
                            ]}
                        >
                            {t('mentor.filter.experiences', 'Areas of Experience')}
                        </Text>
                        <View style={styles.optionGrid}>
                            {EXPERIENCE_OPTIONS.map((experience) => (
                                <A11yPressable
                                    key={experience}
                                    onPress={() => handleExperienceToggle(experience)}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor:
                                                selectedExperiences.includes(experience)
                                                    ? palette.primary
                                                    : palette.background,
                                            borderColor: palette.border,
                                        },
                                    ]}
                                    accessibilityLabel={experience}
                                    hitSlop={HIT_SLOP_8}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            {
                                                color:
                                                    selectedExperiences.includes(experience)
                                                        ? palette.cardText
                                                        : palette.text,
                                            },
                                        ]}
                                    >
                                        {experience}
                                    </Text>
                                </A11yPressable>
                            ))}
                        </View>
                    </View>

                    <GapView style={{ height: 16 }} />

                    {/* Languages */}
                    <View style={styles.filterSection}>
                        <Text
                            style={[
                                styles.filterSectionTitle,
                                { color: palette.text },
                            ]}
                        >
                            {t('mentor.filter.languages', 'Languages')}
                        </Text>
                        <View style={styles.optionGrid}>
                            {LANGUAGE_OPTIONS.map((language) => (
                                <A11yPressable
                                    key={language}
                                    onPress={() => handleLanguageToggle(language)}
                                    style={[
                                        styles.optionButton,
                                        {
                                            backgroundColor:
                                                selectedLanguages.includes(language)
                                                    ? palette.primary
                                                    : palette.background,
                                            borderColor: palette.border,
                                        },
                                    ]}
                                    accessibilityLabel={language}
                                    hitSlop={HIT_SLOP_8}
                                >
                                    <Text
                                        style={[
                                            styles.optionButtonText,
                                            {
                                                color:
                                                    selectedLanguages.includes(language)
                                                        ? palette.cardText
                                                        : palette.text,
                                            },
                                        ]}
                                    >
                                        {language}
                                    </Text>
                                </A11yPressable>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

function createStyles(palette: any) {
    return StyleSheet.create({
        container: {
            padding: 16,
            backgroundColor: palette.background,
        },
        searchInputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: palette.border,
        },
        searchIcon: {
            marginRight: 8,
        },
        searchInput: {
            flex: 1,
            paddingVertical: 10,
            fontSize: 16,
        },
        filterToggleRow: {
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
        },
        filterButton: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            gap: 8,
        },
        filterButtonText: {
            fontSize: 14,
            fontWeight: '600',
        },
        clearButton: {
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        clearButtonText: {
            fontSize: 12,
            fontWeight: '600',
        },
        filterPanel: {
            marginTop: 12,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: palette.border,
        },
        filterSection: {
            marginBottom: 8,
        },
        filterSectionTitle: {
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
        },
        optionGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        optionButton: {
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 6,
            borderWidth: 1,
            flexBasis: 'auto',
        },
        optionButtonText: {
            fontSize: 12,
            fontWeight: '500',
        },
    });
}
