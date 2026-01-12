import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdvocacyScreen from './app/(tabs)/advocacy/index';
import CampaignsScreen from './app/(tabs)/campaigns';
import CommunityScreen from './app/(tabs)/community/index';
import HomeScreen from './app/(tabs)/index';
import ResourcesScreen from './app/(tabs)/resources/index';
import SettingsScreen from './app/(tabs)/settings/index';
import WellnessScreen from './app/(tabs)/wellness/index';
import { RootProviders } from './components/RootProviders';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  
  if (__DEV__) console.warn('[App] Rendering with tab:', activeTab);
  
  // Tab configuration
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠', component: HomeScreen },
    { id: 'campaigns', label: 'Campaigns', icon: '🎯', component: CampaignsScreen },
    { id: 'community', label: 'Community', icon: '💬', component: CommunityScreen },
    { id: 'resources', label: 'Resources', icon: '📚', component: ResourcesScreen },
    { id: 'wellness', label: 'Wellness', icon: '🧘', component: WellnessScreen },
    { id: 'advocacy', label: 'Advocacy', icon: '⚖️', component: AdvocacyScreen },
    { id: 'settings', label: 'Settings', icon: '⚙️', component: SettingsScreen },
  ];
  
  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || HomeScreen;
  
  return (
    <RootProviders>
      <View style={styles.container}>
        {/* Simple Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>3mpwr</Text>
          <Text style={styles.headerSubtitle}>Empowerment & Advocacy</Text>
        </View>
        
        {/* Active Tab Content */}
        <View style={styles.content}>
          <ActiveComponent />
        </View>
        
        {/* Bottom Tab Bar */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabBar}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map(tab => (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                styles.tab,
                activeTab === tab.id && styles.tabActive,
                pressed && styles.tabPressed
              ]}
              onPress={() => {
                if (__DEV__) console.warn('[App] Tab changed to:', tab.id);
                setActiveTab(tab.id);
              }}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </RootProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexGrow: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tabBarContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabPressed: {
    opacity: 0.6,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
