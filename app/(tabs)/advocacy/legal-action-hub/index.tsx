/**
 * Legal Action Hub - Main Entry Point
 * Consolidates 12+ legal screens into unified Power Tool
 */

import { useTheme } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTranslation } from '../../../../i18n';

import AccountabilityTab from './tabs/accountability';
import AutomationTab from './tabs/automation';
import CoachTab from './tabs/coach';
import LegalHelpTab from './tabs/legal-help';
import PolicyTab from './tabs/policy';


type TabType = 'accountability' | 'coach' | 'legal-help' | 'automation' | 'policy';

interface LegalActionHubProps {
  initialTab?: TabType;
}

const LegalActionHub: React.FC<LegalActionHubProps> = ({ initialTab = 'accountability' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const tabs: Array<{ id: TabType; label: string; icon: string; description: string }> = [
    {
      id: 'accountability',
      label: t('legal.tabs.accountability'),
      icon: '📋',
      description: t('legal.tabs.accountability_desc'),
    },
    {
      id: 'coach',
      label: t('legal.tabs.coach'),
      icon: '🎓',
      description: t('legal.tabs.coach_desc'),
    },
    {
      id: 'legal-help',
      label: t('legal.tabs.legal_help'),
      icon: '⚖️',
      description: t('legal.tabs.legal_help_desc'),
    },
    {
      id: 'automation',
      label: t('legal.tabs.automation'),
      icon: '⚡',
      description: t('legal.tabs.automation_desc'),
    },
    {
      id: 'policy',
      label: t('legal.tabs.policy'),
      icon: '📢',
      description: t('legal.tabs.policy_desc'),
    },
  ];

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'accountability':
        return <AccountabilityTab />;
      case 'coach':
        return <CoachTab />;
      case 'legal-help':
        return <LegalHelpTab />;
      case 'automation':
        return <AutomationTab />;
      case 'policy':
        return <PolicyTab />;
      default:
        return <AccountabilityTab />;
    }
  }, [activeTab]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            isActive={activeTab === tab.id}
            tab={tab}
            onPress={() => setActiveTab(tab.id)}
            theme={theme}
          />
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

interface TabButtonProps {
  isActive: boolean;
  tab: { id: TabType; label: string; icon: string };
  onPress: () => void;
  theme: any;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, tab, onPress, theme }) => (
  <View
    style={[
      styles.tabButton,
      isActive && [
        styles.tabButtonActive,
        { borderBottomColor: theme.colors.primary },
      ],
    ]}
  >
    <Text
      style={[
        styles.tabButtonText,
        { color: isActive ? theme.colors.primary : theme.colors.text },
      ]}
      onPress={onPress}
    >
      {tab.icon} {tab.label}
    </Text>
  </View>
);

// Placeholder component imports (to be replaced with actual components)
const Text = (props: any) => <View {...props} />;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBarContent: {
    paddingHorizontal: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});

export default LegalActionHub;
