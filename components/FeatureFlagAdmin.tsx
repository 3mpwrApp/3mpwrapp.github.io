import { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useThemeColor } from '../hooks/useThemeColor';
import type {
    FeatureFlag,
    FeatureFlagConfig} from '../services/featureFlags';
import {
    clearAllOverrides,
    getAllFeatureFlags,
    getOverrides,
    isFeatureEnabled,
    overrideFeatureFlag,
    resetToDefaults,
    setFeatureFlagEnabled,
    setFeatureFlagRolloutPercentage,
} from '../services/featureFlags';

interface FeatureFlagAdminProps {
  adminOnly?: boolean;
  isAdmin?: boolean;
}

export function FeatureFlagAdmin({ adminOnly = true, isAdmin = false }: FeatureFlagAdminProps) {
  const [flags, setFlags] = useState<FeatureFlagConfig[]>(getAllFeatureFlags());
  const [overrides, setOverrides] = useState(getOverrides());
  const [testUserId, setTestUserId] = useState('');
  const [testResults, setTestResults] = useState<{ [key in FeatureFlag]?: boolean }>({});
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const secondaryText = useThemeColor({}, 'text');

  if (adminOnly && !isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.message, { color: textColor }]}>
          Admin access required
        </Text>
      </View>
    );
  }

  const handleToggleFlag = (flag: FeatureFlag) => {
    const flagIndex = flags.findIndex((f) => f.name === flag);
    if (flagIndex !== -1) {
      const updated = [...flags];
      updated[flagIndex].enabled = !updated[flagIndex].enabled;
      setFlags(updated);
      setFeatureFlagEnabled(flag, updated[flagIndex].enabled);
    }
  };

  const handleSetRollout = (flag: FeatureFlag, percentage: string) => {
    const num = parseInt(percentage, 10);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const flagIndex = flags.findIndex((f) => f.name === flag);
      if (flagIndex !== -1) {
        const updated = [...flags];
        updated[flagIndex].rolloutPercentage = num;
        setFlags(updated);
        setFeatureFlagRolloutPercentage(flag, num);
      }
    }
  };

  const handleOverride = (flag: FeatureFlag, enabled: boolean | null) => {
    overrideFeatureFlag(flag, enabled);
    const newOverrides = { ...overrides };
    if (enabled === null) {
      delete newOverrides[flag];
    } else {
      newOverrides[flag] = enabled;
    }
    setOverrides(newOverrides);
  };

  const handleTestUser = () => {
    if (!testUserId.trim()) {
      Alert.alert('Error', 'Please enter a user ID');
      return;
    }

    const results: { [key in FeatureFlag]?: boolean } = {};
    const allFlags = getAllFeatureFlags();

    allFlags.forEach((flagConfig) => {
      results[flagConfig.name] = isFeatureEnabled(
        flagConfig.name,
        testUserId,
        false
      );
    });

    setTestResults(results);
  };

  const handleClearOverrides = () => {
    Alert.alert('Clear All Overrides', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Clear',
        onPress: () => {
          clearAllOverrides();
          setOverrides({});
        },
      },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset to Defaults', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Reset',
        onPress: () => {
          resetToDefaults();
          setFlags(getAllFeatureFlags());
          setOverrides({});
          setTestResults({});
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: textColor }]}>Feature Flag Admin</Text>

      {/* Feature Flags */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Feature Flags</Text>

        {flags.map((flag) => (
          <View key={flag.name} style={[styles.flagCard, { borderColor: secondaryText }]}>
            <View style={styles.flagHeader}>
              <View style={styles.flagName}>
                <Text style={[styles.flagTitle, { color: textColor }]}>
                  {flag.name}
                </Text>
                {flag.description && (
                  <Text style={[styles.flagDescription, { color: secondaryText }]}>
                    {flag.description}
                  </Text>
                )}
              </View>
              <Switch
                value={flag.enabled}
                onValueChange={() => handleToggleFlag(flag.name)}
              />
            </View>

            {flag.betaOnly && (
              <Text style={[styles.badge, { color: '#FF9500' }]}>Beta Only</Text>
            )}

            <View style={styles.rolloutSection}>
              <Text style={[styles.rolloutLabel, { color: secondaryText }]}>
                Rollout: {flag.rolloutPercentage ?? 100}%
              </Text>
              <TextInput
                style={[
                  styles.rolloutInput,
                  {
                    borderColor: secondaryText,
                    color: textColor,
                  },
                ]}
                placeholder="0-100"
                placeholderTextColor={secondaryText}
                keyboardType="number-pad"
                defaultValue={String(flag.rolloutPercentage ?? 100)}
                onBlur={(e: any) => {
                  const value = e.nativeEvent?.text || '';
                  handleSetRollout(flag.name, value);
                }}
              />
            </View>

            <View style={styles.overrideSection}>
              <Text style={[styles.overrideLabel, { color: secondaryText }]}>
                Override:
              </Text>
              <View style={styles.overrideButtons}>
                <Pressable
                  style={[
                    styles.overrideButton,
                    overrides[flag.name] === true && styles.overrideButtonActive,
                  ]}
                  onPress={() => handleOverride(flag.name, true)}
                >
                  <Text style={[styles.overrideButtonText, { color: textColor }]}>
                    ON
                  </Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.overrideButton,
                    overrides[flag.name] === false && styles.overrideButtonActive,
                  ]}
                  onPress={() => handleOverride(flag.name, false)}
                >
                  <Text style={[styles.overrideButtonText, { color: textColor }]}>
                    OFF
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.overrideButton}
                  onPress={() => handleOverride(flag.name, null)}
                >
                  <Text style={[styles.overrideButtonText, { color: textColor }]}>
                    NONE
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Test User */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Test with User ID</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: secondaryText,
              color: textColor,
            },
          ]}
          placeholder="Enter user ID"
          placeholderTextColor={secondaryText}
          value={testUserId}
          onChangeText={setTestUserId}
        />
        <Pressable
          style={[styles.button, { backgroundColor: '#007AFF' }]}
          onPress={handleTestUser}
        >
          <Text style={styles.buttonText}>Test Flags</Text>
        </Pressable>

        {Object.keys(testResults).length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={[styles.resultsTitle, { color: textColor }]}>Results:</Text>
            {Object.entries(testResults).map(([flag, enabled]) => (
              <View key={flag} style={styles.resultItem}>
                <Text style={[styles.resultFlag, { color: textColor }]}>{flag}</Text>
                <Text
                  style={[
                    styles.resultValue,
                    { color: enabled ? '#34C759' : '#FF3B30' },
                  ]}
                >
                  {enabled ? 'ENABLED' : 'DISABLED'}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Pressable
          style={[styles.button, { backgroundColor: '#FF9500' }]}
          onPress={handleClearOverrides}
        >
          <Text style={styles.buttonText}>Clear All Overrides</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: '#FF3B30', marginTop: 12 }]}
          onPress={handleReset}
        >
          <Text style={styles.buttonText}>Reset to Defaults</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  flagCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  flagName: {
    flex: 1,
    marginRight: 12,
  },
  flagTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  flagDescription: {
    fontSize: 12,
  },
  badge: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 8,
  },
  rolloutSection: {
    marginBottom: 8,
  },
  rolloutLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  rolloutInput: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
  },
  overrideSection: {
    marginTop: 8,
  },
  overrideLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  overrideButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  overrideButton: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    alignItems: 'center',
  },
  overrideButtonActive: {
    backgroundColor: '#007AFF',
  },
  overrideButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultFlag: {
    fontSize: 12,
    flex: 1,
  },
  resultValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
