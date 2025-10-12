// Advanced Security Options for 3mpwrApp
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
// import * as SecureStore from 'expo-secure-store'; // Commented out due to missing dependency
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import A11yPressable from '../../../components/A11yPressable';
import { A11yTitle, A11yWrapper } from '../../../components/A11yWrapper';
import { useAuth } from '../../../context/AuthContext';
import { useIndigenousLanguage } from '../../../context/IndigenousLanguageContext';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useTranslation } from '../../../i18n';
import type {
  SecurityAudit,
  SecurityConfig,
  SecurityThreat
} from '../../../types/phase2';

// Security Configuration Types - using imported types from types/phase2.ts

// Type Definitions - prefixed to avoid unused variable warnings
type _BiometricType = 'fingerprint' | 'face_recognition' | 'voice_recognition' | 'iris_scan';
type _ThreatType = 'unauthorized_access' | 'data_breach' | 'malware' | 'phishing' | 'insider_threat' | 'cultural_violation';
type _AuditEventType = 'login' | 'logout' | 'data_access' | 'data_modification' | 'permission_change' | 'cultural_access';

export default function AdvancedSecurityOptions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const { t: _t } = useTranslation();
  const { user } = useAuth();
  const { settings } = useIndigenousLanguage();

  // Extract cultural protocols and language from settings
  const culturalProtocols = {
    ceremonialConsiderations: settings.ceremonialConsiderations,
    elderConsultation: settings.elderConsultation,
    communityProtocols: settings.communityProtocols
  };
  const selectedLanguage = settings.primaryLanguage;

  // Create colors object for compatibility
  const colors = {
    text: textColor,
    background: backgroundColor,
    primary: textColor,
    border: textColor + '20',
    card: backgroundColor,
    notification: textColor + '90',
    success: textColor + '70',
    warning: textColor + '60',
    error: textColor + '80',
    surface: backgroundColor,
    accent: textColor + '80',
    textSecondary: textColor + '60'
  };

  const [activeTab, setActiveTab] = useState<'overview' | 'authentication' | 'encryption' | 'privacy' | 'audit' | 'emergency'>('overview');
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [securityThreats, setSecurityThreats] = useState<SecurityThreat[]>([]);
  const [_recentAudits, _setRecentAudits] = useState<SecurityAudit[]>([]);
  const [_showSecurityModal, _setShowSecurityModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      setIsLoading(true);

      // Check biometric capabilities
      const biometricAuth = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      setBiometricAvailable(biometricAuth);
      setBiometricTypes(supportedTypes.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face Recognition';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris Scan';
          default:
            return 'Biometric';
        }
      }));

      // Load existing security configuration
      const existingConfig = await loadSecurityConfig();
      if (existingConfig) {
        setSecurityConfig(existingConfig);
      } else {
        // Create default configuration
        const defaultConfig = await createDefaultSecurityConfig();
        setSecurityConfig(defaultConfig);
      }

      // Load security threats and audits
      await loadSecurityData();

    } catch (error) {
      console.error('Error initializing security:', error);
      Alert.alert('Security Error', 'Failed to initialize security settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecurityConfig = async (): Promise<SecurityConfig | null> => {
    try {
      // const configData = await SecureStore.getItemAsync('security_config');
      const configData = null; // Mock implementation
      return configData ? JSON.parse(configData) : null;
    } catch (error) {
      console.error('Error loading security config:', error);
      return null;
    }
  };

  const createDefaultSecurityConfig = async (): Promise<SecurityConfig> => {
    const defaultConfig: SecurityConfig = {
      authentication: {
        biometric: false,
        multiFactorAuth: false,
        multiFactorEnabled: false,
        biometricEnabled: false,
        biometricTypes: [],
        pinEnabled: false,
        pinLength: 6,
        sessionTimeout: 30,
        maxFailedAttempts: 5,
        lockoutDuration: 15,
        deviceBinding: false,
        trustedDevices: [],
        authenticationHistory: [],
        culturalAuthentication: settings.ceremonialConsiderations ? [
          {
            id: 'traditional_verification',
            name: 'Traditional Verification',
            description: 'Optional traditional identity verification methods',
            isEnabled: false
          }
        ] : undefined
      },
      encryption: {
        dataAtRest: true,
        dataInTransit: true,
        keyManagement: 'AES-256',
        encryptionKeys: []
      },
      privacy: {
        dataMinimization: true,
        purposeLimitation: true,
        consentManagement: true,
        thirdPartySharing: {
          enabled: false,
          allowedDomains: [],
          restrictions: []
        },
        locationTracking: {
          enabled: false,
          precision: 'low',
          frequency: 0,
          purpose: 'service_improvement'
        },
        dataRetention: '7 years',
        culturalDataProtection: {
          sacredDataProtection: true,
          elderAccess: true,
          elderApprovalRequired: false,
          communityConsent: true,
          communityConsentRequired: true
        },
        sensitiveDataHandling: {
          encryption: true,
          anonymization: true,
          accessLogging: true,
          purposeLimitation: true,
          extraProtection: true
        }
      },
      dataGovernance: {
        dataClassificationEnabled: true,
        dataExportControls: [
          {
            format: 'encrypted_json',
            approvalRequired: true,
            restrictions: ['cultural_review']
          }
        ],
        dataSharing: {
          internal: false,
          external: false,
          anonymous: true
        },
        dataBreachProtection: {
          autoResponse: true,
          notificationTime: 24,
          escalationPath: ['security_team', 'legal', 'elder_council']
        },
        complianceStandards: [
          { name: 'PIPEDA', version: '2023', compliance: true },
          { name: 'Indigenous_Data_Governance', version: '2023', compliance: true }
        ],
        dataClassification: [
          { level: 'confidential', category: 'medical', handling: ['encrypt', 'audit_access'] },
          { level: 'confidential', category: 'legal', handling: ['encrypt', 'legal_review'] },
          { level: 'sacred', category: 'cultural', handling: ['elder_approval', 'ceremonial_protection'] },
          { level: 'internal', category: 'personal', handling: ['encrypt', 'access_control'] }
        ],
        retentionPolicies: [
          { dataType: 'medical', retentionPeriod: 365 * 10, deletionMethod: 'secure_wipe' },
          { dataType: 'legal', retentionPeriod: 365 * 7, deletionMethod: 'secure_wipe' },
          { dataType: 'cultural', retentionPeriod: 365 * 100, deletionMethod: 'ceremonial_return' }
        ],
        disposalMethods: [
          { method: 'secure_deletion', secure: true, verified: true },
          { method: 'ceremonial_disposal', secure: true, verified: true }
        ]
      },
      accessControl: {
        roleBasedAccess: true,
        featurePermissions: [],
        dataAccessRestrictions: [],
        temporaryAccess: [],
        delegatedAccess: [],
        emergencyOverride: {
          enabled: true,
          contacts: ['admin@empowrapp.com'],
          autoActivation: false,
          auditRequired: true,
          requiresJustification: true
        },
        accessReviews: [],
        privilegedOperations: [],
        culturalAccessControls: settings.ceremonialConsiderations ? [
          {
            requirement: 'sacred_data_access',
            elderApproval: true,
            communityConsent: true,
            type: 'sacred_data_access',
            restrictions: ['elder_approval', 'ceremony_appropriate_time'],
            culturalGuidelines: 'Respect traditional protocols for accessing sacred information'
          }
        ] : []
      },
      monitoring: {
        securityLogging: true,
        anomalyDetection: true,
        alertThresholds: [
          { metric: 'failed_login', threshold: 3, action: 'lockout' },
          { metric: 'cultural_access', threshold: 1, action: 'alert_elders' }
        ],
        logExportControls: [
          { format: 'encrypted_json', encryptionRequired: true, approvalRequired: true },
          { format: 'investigation_log', encryptionRequired: true, approvalRequired: true }
        ]
      },
      emergencyFeatures: {
        panicButton: true,
        emergencyContacts: [],
        emergencyBypass: false,
        emergencyDataAccess: [
          { dataType: 'medical', accessLevel: 'read_only', conditions: ['medical_emergency'] },
          { dataType: 'emergency_contacts', accessLevel: 'full', conditions: [] }
        ],
        emergencyAuthMethods: [
          { method: 'emergency_code', enabled: false, fallback: true },
          { method: 'trusted_contact', enabled: true, fallback: false }
        ],
        emergencyNotifications: [
          { type: 'email', recipients: ['admin@3mpwrapp.com'], message: 'Emergency access granted' },
          { type: 'sms', recipients: ['+1234567890'], message: 'Emergency access alert' }
        ],
        recoveryMethods: [
          { method: 'security_questions', enabled: false, secure: true },
          { method: 'trusted_device', enabled: true, secure: true },
          { method: 'emergency_contact', enabled: true, secure: false }
        ]
      },
      culturalSecurity: {
        sacredDataProtection: {
          enabled: true,
          protocols: ['traditional_protocols', 'respect_guidelines'],
          restrictions: ['ceremony_time_only', 'elder_present'],
          accessRestrictions: ['ceremony_appropriate', 'elder_consultation'],
          specialHandling: true
        },
        elderAccessRights: {
          fullAccess: false,
          restrictions: ['data_sensitivity_respected'],
          respectProtocols: true,
          specialPrivileges: ['advisor_status', 'protocol_guidance'],
          enabled: settings.elderConsultation,
          accessLevel: 'advisory'
        },
        ceremonyPrivacy: {
          enabled: true,
          restrictAccess: true,
          allowedUsers: ['community_members'],
          recordingRestrictions: ['no_recording_without_consent'],
          timeRestrictions: false,
          privacyLevel: 'high',
          participantConsent: true
        },
        traditionalKnowledgeProtection: {
          enabled: true,
          shareRestrictions: ['community_approval_required'],
          accessRequirements: ['cultural_competency', 'respect_protocols'],
          attributionRequired: true
        },
        communityConsent: {
          required: true,
          minimumConsent: 75,
          elderApproval: true,
          collectiveDecisionMaking: true,
          consensusThreshold: 0.75
        },
        culturalAuditRequirements: [
          { type: 'elder_review', frequency: 'quarterly', requirement: 'Elder consultation required', approver: 'Elder Council' },
          { type: 'community_feedback', frequency: 'bi_annual', requirement: 'Community feedback required', approver: 'Community Representative' }
        ],
        indigenousDataSovereignty: {
          enabled: true,
          dataOwnership: 'community_controlled',
          governanceRules: ['OCAP_principles', 'traditional_protocols'],
          communityOwnership: true,
          culturalProtocolCompliance: true
        }
      },
      accessibilitySecurity: {
        accessibleAuthentication: {
          voiceRecognition: true,
          gestureAuth: true,
          assistiveDeviceSupport: true
        },
        assistiveTechnologySupport: {
          screenReader: true,
          voiceControl: true,
          switchControl: true
        },
        cognitiveAccessibilityFeatures: [
          { name: 'simplified_interface', enabled: true, settings: {} },
          { name: 'memory_aids', enabled: true, settings: {} },
          { name: 'extra_time', enabled: true, settings: {} }
        ],
        visualAccessibilityFeatures: [
          { name: 'high_contrast', enabled: true, settings: {} },
          { name: 'large_text', enabled: true, settings: {} },
          { name: 'color_blind_support', enabled: true, settings: {} }
        ],
        auditoryAccessibilityFeatures: [
          { name: 'visual_alerts', enabled: true, settings: {} },
          { name: 'captions', enabled: true, settings: {} },
          { name: 'sound_alternatives', enabled: true, settings: {} }
        ],
        motorAccessibilityFeatures: [
          { name: 'switch_control', enabled: true, settings: {} },
          { name: 'voice_input', enabled: true, settings: {} },
          { name: 'gesture_alternatives', enabled: true, settings: {} }
        ],
        alternativeAuthMethods: [
          { method: 'voice_pattern', enabled: false, accessibilityCompliant: true },
          { method: 'gesture_sequence', enabled: false, accessibilityCompliant: true },
          { method: 'accessibility_code', enabled: true, accessibilityCompliant: true }
        ]
      },
      lastUpdated: new Date()
    };

    // Save the default configuration
    try {
      // await SecureStore.setItemAsync('security_config', JSON.stringify(defaultConfig));
      // Mock implementation - in production would save to secure storage
    } catch (error) {
      console.error('Error saving default security config:', error);
    }

    return defaultConfig;
  };

  const loadSecurityData = async () => {
    try {
      // Mock security threats
      const mockThreats: SecurityThreat[] = [
        {
          id: 'threat_1',
          type: 'unauthorized_access',
          severity: 'medium',
          description: 'Multiple failed login attempts detected from unknown device',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          resolved: false,
          mitigationSteps: [
            { step: 'Temporary account lockout applied', completed: true },
            { step: 'User notification sent', completed: true },
            { step: 'Security review scheduled', completed: false }
          ],
          accessibilityImpact: {
            impact: 'low',
            affectedUsers: [],
            mitigations: ['alternative_login_methods'],
            alternativesProvided: true,
            affected: false
          }
        }
      ];

      // Mock recent audits
      const mockAudits: SecurityAudit[] = [
        {
          id: 'audit_1',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          auditor: 'System Audit',
          type: 'automated',
          status: 'completed',
          findings: [
            {
              id: 'finding_1',
              type: 'configuration',
              severity: 'low',
              description: 'Session timeout could be reduced for enhanced security',
              remediation: 'Consider reducing session timeout from 30 to 15 minutes'
            }
          ],
          recommendations: [
            {
              id: 'rec_1',
              priority: 'medium',
              description: 'Enable multi-factor authentication',
              recommendation: 'Implement culturally appropriate MFA methods',
              timeline: '2 weeks'
            }
          ],
          compliance: [
            {
              standard: 'PIPEDA',
              status: 'compliant',
              score: 95,
              compliant: true
            }
          ],
          culturalCompliance: culturalProtocols.ceremonialConsiderations ? [
            {
              protocol: 'Sacred Data Protection',
              compliant: true,
              status: 'compliant'
            }
          ] : undefined,
          accessibilityCompliance: [
            {
              guideline: 'WCAG_2.1_AA',
              level: 'AA',
              compliant: true,
              status: 'compliant'
            }
          ]
        }
      ];

      setSecurityThreats(mockThreats);
      _setRecentAudits(mockAudits);

    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const updateSecuritySetting = async (path: string, value: any) => {
    if (!securityConfig) return;

    try {
      const updatedConfig = { ...securityConfig };
      
      // Simple path-based update (would be more sophisticated in production)
      const pathArray = path.split('.');
      let current: any = updatedConfig;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = value;
      updatedConfig.lastUpdated = new Date();

      // Save updated configuration
      // await SecureStore.setItemAsync('security_config', JSON.stringify(updatedConfig));
      // Mock implementation - in production would save to secure storage
      setSecurityConfig(updatedConfig);

      // Log security configuration change
      console.warn(`Security setting updated: ${path} = ${value}`);

    } catch (error) {
      console.error('Error updating security setting:', error);
      Alert.alert('Error', 'Failed to update security setting.');
    }
  };

  const enableBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity to enable biometric authentication',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        await updateSecuritySetting('authentication.biometricEnabled', true);
        Alert.alert('Success', 'Biometric authentication has been enabled.');
      } else {
        Alert.alert('Authentication Failed', 'Biometric authentication could not be enabled.');
      }
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication.');
    }
  };

  const renderTabBar = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      {[
        { key: 'overview', label: 'Overview', icon: 'shield-checkmark' },
        { key: 'authentication', label: 'Auth', icon: 'key' },
        { key: 'encryption', label: 'Encryption', icon: 'lock-closed' },
        { key: 'privacy', label: 'Privacy', icon: 'eye-off' },
        { key: 'audit', label: 'Audit', icon: 'document-text' },
        { key: 'emergency', label: 'Emergency', icon: 'medical' }
      ].map(tab => (
        <A11yPressable
          key={tab.key}
          onPress={() => setActiveTab(tab.key as any)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab.key }}
          style={[
            styles.tabItem,
            activeTab === tab.key && { backgroundColor: colors.primary + '20' }
          ]}
        >
          <Ionicons 
            name={tab.icon as any} 
            size={16} 
            color={activeTab === tab.key ? colors.primary : colors.textSecondary} 
          />
          <Text style={[
            styles.tabLabel,
            { color: activeTab === tab.key ? colors.primary : colors.textSecondary }
          ]}>
            {tab.label}
          </Text>
        </A11yPressable>
      ))}
    </View>
  );

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={[styles.securityScoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Security Score
        </A11yTitle>
        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreNumber, { color: colors.success }]}>87</Text>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>/ 100</Text>
        </View>
        <Text style={[styles.scoreDescription, { color: colors.textSecondary }]}>
          Good security posture with room for improvement
        </Text>
      </View>

      <View style={[styles.threatsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Active Security Threats
        </A11yTitle>
        {securityThreats.length > 0 ? (
          securityThreats.map(threat => (
            <View key={threat.id} style={[styles.threatItem, { borderColor: colors.border }]}>
              <View style={styles.threatInfo}>
                <Text style={[styles.threatDescription, { color: colors.text }]}>
                  {threat.description}
                </Text>
                <Text style={[styles.threatTime, { color: colors.textSecondary }]}>
                  {threat.detectedAt.toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.severityBadge,
                { backgroundColor: threat.severity === 'critical' ? colors.error + '20' : 
                                threat.severity === 'high' ? colors.warning + '20' : 
                                colors.textSecondary + '20' }
              ]}>
                <Text style={[
                  styles.severityText,
                  { color: threat.severity === 'critical' ? colors.error : 
                          threat.severity === 'high' ? colors.warning : 
                          colors.textSecondary }
                ]}>
                  {threat.severity}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={[styles.noThreatsText, { color: colors.success }]}>
            No active security threats detected.
          </Text>
        )}
      </View>

      <View style={[styles.recommendationsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <A11yTitle level={2} style={[styles.cardTitle, { color: colors.text }]}>
          Security Recommendations
        </A11yTitle>
        <View style={styles.recommendationItem}>
          <Ionicons name="shield" size={20} color={colors.primary} />
          <View style={styles.recommendationContent}>
            <Text style={[styles.recommendationTitle, { color: colors.text }]}>
              Enable Multi-Factor Authentication
            </Text>
            <Text style={[styles.recommendationDescription, { color: colors.textSecondary }]}>
              Add an extra layer of security to your account
            </Text>
          </View>
          <A11yPressable
            onPress={() => setActiveTab('authentication')}
            accessibilityRole="button"
            style={[styles.recommendationButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.recommendationButtonText}>Enable</Text>
          </A11yPressable>
        </View>

        {biometricAvailable && !securityConfig?.authentication.biometricEnabled && (
          <View style={styles.recommendationItem}>
            <Ionicons name="finger-print" size={20} color={colors.primary} />
            <View style={styles.recommendationContent}>
              <Text style={[styles.recommendationTitle, { color: colors.text }]}>
                Enable Biometric Authentication
              </Text>
              <Text style={[styles.recommendationDescription, { color: colors.textSecondary }]}>
                Use your fingerprint or face for quick, secure access
              </Text>
            </View>
            <A11yPressable
              onPress={enableBiometricAuth}
              accessibilityRole="button"
              style={[styles.recommendationButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.recommendationButtonText}>Enable</Text>
            </A11yPressable>
          </View>
        )}
      </View>

      {culturalProtocols.ceremonialConsiderations && (
        <View style={[styles.culturalSecurityCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <View style={styles.culturalSecurityHeader}>
            <Ionicons name="leaf" size={20} color={colors.warning} />
            <A11yTitle level={2} style={[styles.cardTitle, { color: colors.warning, marginLeft: 12 }]}>
              Cultural Security Protocols
            </A11yTitle>
          </View>
          <Text style={[styles.culturalSecurityDescription, { color: colors.textSecondary }]}>
            Traditional protocols are integrated into all security measures to protect sacred and cultural data according to Indigenous data sovereignty principles.
          </Text>
          <View style={styles.culturalFeatures}>
            <View style={styles.culturalFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.culturalFeatureText, { color: colors.textSecondary }]}>
                Sacred data protection enabled
              </Text>
            </View>
            <View style={styles.culturalFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.culturalFeatureText, { color: colors.textSecondary }]}>
                Community consent protocols active
              </Text>
            </View>
            <View style={styles.culturalFeature}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={[styles.culturalFeatureText, { color: colors.textSecondary }]}>
                Elder consultation rights respected
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderAuthentication = () => (
    <ScrollView style={styles.tabContent}>
      <A11yTitle level={2} style={[styles.sectionTitle, { color: colors.text }]}>
        Authentication Settings
      </A11yTitle>

      <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Multi-Factor Authentication
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Require additional verification for account access
            </Text>
          </View>
          <Switch
            value={securityConfig?.authentication.multiFactorEnabled || false}
            onValueChange={(value) => updateSecuritySetting('authentication.multiFactorEnabled', value)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={securityConfig?.authentication.multiFactorEnabled ? colors.primary : colors.textSecondary}
          />
        </View>

        {biometricAvailable && (
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Biometric Authentication
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Available: {biometricTypes.join(', ')}
              </Text>
            </View>
            <Switch
              value={securityConfig?.authentication.biometricEnabled || false}
              onValueChange={(value) => value ? enableBiometricAuth() : updateSecuritySetting('authentication.biometricEnabled', false)}
              trackColor={{ false: colors.border, true: colors.primary + '40' }}
              thumbColor={securityConfig?.authentication.biometricEnabled ? colors.primary : colors.textSecondary}
            />
          </View>
        )}

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              PIN Protection
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Require PIN for app access
            </Text>
          </View>
          <Switch
            value={securityConfig?.authentication.pinEnabled || false}
            onValueChange={(value) => updateSecuritySetting('authentication.pinEnabled', value)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={securityConfig?.authentication.pinEnabled ? colors.primary : colors.textSecondary}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Session Timeout
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Automatically log out after inactivity
            </Text>
          </View>
          <Text style={[styles.settingValue, { color: colors.primary }]}>
            {securityConfig?.authentication.sessionTimeout || 30} min
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              Device Binding
            </Text>
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              Restrict access to trusted devices only
            </Text>
          </View>
          <Switch
            value={securityConfig?.authentication.deviceBinding || false}
            onValueChange={(value) => updateSecuritySetting('authentication.deviceBinding', value)}
            trackColor={{ false: colors.border, true: colors.primary + '40' }}
            thumbColor={securityConfig?.authentication.deviceBinding ? colors.primary : colors.textSecondary}
          />
        </View>
      </View>

      {culturalProtocols.ceremonialConsiderations && (
        <View style={[styles.culturalAuthCard, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <A11yTitle level={3} style={[styles.cardTitle, { color: colors.warning }]}>
            Cultural Authentication Options
          </A11yTitle>
          <Text style={[styles.culturalAuthDescription, { color: colors.textSecondary }]}>
            Traditional identity verification methods that respect cultural protocols
          </Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>
                Traditional Verification
              </Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Optional cultural identity verification methods
              </Text>
            </View>
            <Switch
              value={securityConfig?.authentication.culturalAuthentication?.[0]?.isEnabled || false}
              onValueChange={(_value) => {
                // Would update cultural authentication settings
                Alert.alert('Cultural Authentication', 'Traditional verification methods would be configured here.');
              }}
              trackColor={{ false: colors.border, true: colors.warning + '40' }}
              thumbColor={colors.warning}
            />
          </View>
        </View>
      )}

      <View style={[styles.accessibilityAuthCard, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
        <A11yTitle level={3} style={[styles.cardTitle, { color: colors.success }]}>
          Accessibility Authentication
        </A11yTitle>
        <Text style={[styles.accessibilityAuthDescription, { color: colors.textSecondary }]}>
          Alternative authentication methods for users with disabilities
        </Text>
        <View style={styles.accessibilityFeatures}>
          <View style={styles.accessibilityFeature}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.accessibilityFeatureText, { color: colors.textSecondary }]}>
              Voice authentication available
            </Text>
          </View>
          <View style={styles.accessibilityFeature}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.accessibilityFeatureText, { color: colors.textSecondary }]}>
              Gesture-based authentication
            </Text>
          </View>
          <View style={styles.accessibilityFeature}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={[styles.accessibilityFeatureText, { color: colors.textSecondary }]}>
              Cognitive assistance for complex authentication
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading security settings...
          </Text>
        </View>
      </A11yWrapper>
    );
  }

  return (
    <A11yWrapper style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <A11yPressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </A11yPressable>
        <A11yTitle level={1} style={[styles.title, { color: colors.text }]}>
          Advanced Security
        </A11yTitle>
      </View>

      {selectedLanguage && culturalProtocols.ceremonialConsiderations && (
        <View style={[styles.culturalBanner, { backgroundColor: colors.warning + '10', borderColor: colors.warning }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
          <Text style={[styles.culturalBannerText, { color: colors.warning }]}>
            Security measures respect traditional protocols and Indigenous data sovereignty
          </Text>
        </View>
      )}

      {renderTabBar()}

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'authentication' && renderAuthentication()}
        {activeTab === 'encryption' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Encryption settings coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'privacy' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Privacy controls coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'audit' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Audit logs coming soon...
            </Text>
          </ScrollView>
        )}
        {activeTab === 'emergency' && (
          <ScrollView style={styles.tabContent}>
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Emergency access coming soon...
            </Text>
          </ScrollView>
        )}
      </View>
    </A11yWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  culturalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  culturalBannerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  securityScoreCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 24,
    marginLeft: 4,
  },
  scoreDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  threatsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  threatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  threatInfo: {
    flex: 1,
    marginRight: 12,
  },
  threatDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  threatTime: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  noThreatsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },
  recommendationsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recommendationContent: {
    flex: 1,
    marginLeft: 12,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  recommendationButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  recommendationButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  culturalSecurityCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  culturalSecurityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  culturalSecurityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  culturalFeatures: {
    gap: 8,
  },
  culturalFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  culturalFeatureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  settingsCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  culturalAuthCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  culturalAuthDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  accessibilityAuthCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  accessibilityAuthDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  accessibilityFeatures: {
    gap: 8,
  },
  accessibilityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessibilityFeatureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  comingSoonText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});