import { Ionicons } from '@expo/vector-icons';
import type { ComponentPropsWithoutRef } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { useAppPalette } from '../../theme/usePalette';

import { createStyles } from './DataOwnershipStatement.styles';

interface DataOwnershipStatementProps extends ComponentPropsWithoutRef<typeof View> {
  showHeader?: boolean;
  compact?: boolean;
}

export default function DataOwnershipStatement({ 
  showHeader = true, 
  compact = false,
  style,
  ...props 
}: DataOwnershipStatementProps) {
  const palette = useAppPalette();
  const styles = createStyles(palette);

  const openFullStatement = () => {
    const url = "https://3mpwrapp.pages.dev/data-ownership";
    Linking.openURL(url).catch(() => {});
  };

  const principles = [
    {
      title: "100% User Ownership",
      description: "All data created in 3mpwr App belongs entirely to you. We never own, claim, or retain your personal information.",
      icon: "person-outline" as const
    },
    {
      title: "Local-First & Air-Gapped", 
      description: "All processing happens on your device. Data stays in your possession unless you choose to sync to your own cloud.",
      icon: "phone-portrait-outline" as const
    },
    {
      title: "Your Cloud, Your Control",
      description: "Optional sync connects only to your chosen services (Google Drive, iCloud, WebDAV). No data passes through our servers.",
      icon: "cloud-outline" as const
    },
    {
      title: "No Tracking",
      description: "Zero embedded analytics, trackers, or third-party data collection. No hidden network calls.",
      icon: "shield-outline" as const
    },
    {
      title: "Encryption & Privacy",
      description: "Local data encrypted using your device security. Cloud encryption handled by your chosen provider.",
      icon: "lock-closed-outline" as const
    },
    {
      title: "Open & Transparent",
      description: "Our codebase contains no data-logging functions. You can inspect and verify our privacy claims.",
      icon: "eye-outline" as const
    }
  ];

  return (
    <View style={[styles.container, style]} {...props}>
      {showHeader && (
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color={palette.primary} />
          <Text style={styles.title}>Data Ownership Statement</Text>
        </View>
      )}
      
      <View style={styles.statementBox}>
        <Text style={styles.tagline}>
          <Text style={styles.bold}>Your data belongs 100% to you.</Text>
          {' '}3mpwr App is built on the fundamental principle of complete user data sovereignty.
        </Text>
      </View>

      <ScrollView 
        style={compact ? styles.compactScrollView : styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {principles.map((principle, index) => (
          <View key={index} style={styles.principleItem}>
            <View style={styles.principleHeader}>
              <Ionicons name={principle.icon} size={20} color={palette.primary} />
              <Text style={styles.principleTitle}>{principle.title}</Text>
            </View>
            {!compact && (
              <Text style={styles.principleDescription}>{principle.description}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={openFullStatement}
          accessibilityRole="link"
          style={({ pressed }) => [
            styles.linkButton,
            pressed && { opacity: 0.8 }
          ]}
        >
          <Ionicons name="document-text-outline" size={16} color={palette.primary} />
          <Text style={styles.linkText}>Read Full Statement</Text>
          <Ionicons name="open-outline" size={14} color={palette.primary} />
        </Pressable>
        
        <Text style={styles.verification}>
          You can inspect and verify our privacy claims in our open codebase.
        </Text>
      </View>
    </View>
  );
}