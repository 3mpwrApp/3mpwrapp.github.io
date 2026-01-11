import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  const [activeTab, setActiveTab] = useState('home');
  
  if (__DEV__) console.warn('[Index] Rendering single-screen app, tab:', activeTab);
  
  const handleTabChange = (tab: string) => {
    if (__DEV__) console.warn('[Index] Tab changed to:', tab);
    setActiveTab(tab);
  };

  // Web-optimized button component
  const TabButton = ({ name, icon, label }: { name: string; icon: string; label: string }) => {
    const isActive = activeTab === name;
    
    if (Platform.OS === 'web') {
      return (
        <button
          onClick={() => handleTabChange(name)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px',
            border: 'none',
            background: isActive ? '#f0fdf4' : 'transparent',
            cursor: 'pointer',
            fontSize: '12px',
            color: isActive ? '#22c55e' : '#666',
            fontWeight: isActive ? '600' : 'normal',
          }}
        >
          <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
          <div>{label}</div>
        </button>
      );
    }

    return (
      <Pressable
        style={({ pressed }) => [
          styles.tab,
          isActive && styles.tabActive,
          pressed && styles.tabPressed
        ]}
        onPress={() => handleTabChange(name)}
      >
        <Text style={isActive ? styles.tabTextActive : styles.tabText}>
          {icon}{'\n'}{label}
        </Text>
      </Pressable>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>3mpwr</Text>
        <Text style={styles.headerSubtitle}>Disability Rights Evidence App</Text>
        <Text style={styles.debugInfo}>Active: {activeTab}</Text>
      </View>
      
      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'evidence' && <EvidenceTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'community' && <CommunityTab />}
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.tabBar}>
        <TabButton name="home" icon="🏠" label="Home" />
        <TabButton name="evidence" icon="📸" label="Evidence" />
        <TabButton name="campaigns" icon="🎯" label="Campaigns" />
        <TabButton name="community" icon="💬" label="Community" />
      </View>
    </View>
  );
}

function HomeTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Welcome to 3mpwr</Text>
      <Text style={styles.subtitle}>Your evidence vault for disability rights</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📸 Quick Action: Document Evidence</Text>
        <Text style={styles.cardText}>Capture what happened with photos, audio, and notes</Text>
      </View>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>✓ System Status</Text>
        <Text style={styles.statusItem}>✓ App rendering normally</Text>
        <Text style={styles.statusItem}>✓ Settings provider active</Text>
        <Text style={styles.statusItem}>✓ i18n provider active</Text>
      </View>
    </View>
  );
}

function EvidenceTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Evidence Collection</Text>
      <Text style={styles.subtitle}>Document incidents and track your timeline</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📷 Photo Evidence</Text>
        <Text style={styles.cardText}>Capture visual evidence with timestamps</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎤 Audio Recording</Text>
        <Text style={styles.cardText}>Record conversations and incidents</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📝 Written Notes</Text>
        <Text style={styles.cardText}>Document details and context</Text>
      </View>
    </View>
  );
}

function CampaignsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Advocacy Campaigns</Text>
      <Text style={styles.subtitle}>Join collective action for disability rights</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎯 Active Campaigns</Text>
        <Text style={styles.cardText}>Browse and join ongoing advocacy efforts</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Your Impact</Text>
        <Text style={styles.cardText}>Track your contributions and progress</Text>
      </View>
    </View>
  );
}

function CommunityTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.title}>Community Support</Text>
      <Text style={styles.subtitle}>Connect with others and share experiences</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Discussion Forums</Text>
        <Text style={styles.cardText}>Share stories and get support</Text>
      </View>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🤝 Peer Support</Text>
        <Text style={styles.cardText}>Connect with others who understand</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#22c55e',
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
    color: '#f0f0f0',
    marginTop: 4,
  },
  debugInfo: {
    fontSize: 14,
    color: '#f0f0f0',
    marginTop: 4,
  },
  debugButton: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'center',
  },
  debugButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  navLogBox: {
    marginTop: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 6,
  },
  navLogText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#f0fdf4',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22c55e',
    marginBottom: 8,
  },
  statusItem: {
    fontSize: 12,
    color: '#16a34a',
    marginBottom: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  tabActive: {
    backgroundColor: '#f0fdf4',
  },
  tabPressed: {
    opacity: 0.6,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tabTextActive: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
});
