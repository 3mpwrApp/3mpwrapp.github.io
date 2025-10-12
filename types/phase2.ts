// Phase 2 Type Definitions
// Basic type definitions for Phase 2 features to resolve TypeScript compilation errors

// Workflow Engine Types
export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  description?: string;
  validations: StepValidation[];
  documents: DocumentAction[];
  notifications: NotificationAction[];
  deadlines: DeadlineAction[];
  alternativePaths: AlternativePath[];
  culturalProtocols?: CulturalStepProtocol[];
  accessibilitySupport: AccessibilitySupport[];
  userInput?: UserInputSpec[];
  validation?: ValidationRule[];
  errorHandling: ErrorHandling;
  retryLogic?: RetryConfig;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  requiredDocuments: DocumentRequirement[];
  legalStandards: LegalStandard[];
  triggers: WorkflowTrigger[];
  conditions: WorkflowCondition[];
  outcomes: WorkflowOutcome[];
  culturalProtocols?: CulturalStepProtocol[];
  accessibilitySupport: AccessibilitySupport[];
}

export interface DocumentRequirement {
  id: string;
  name: string;
  type: string;
  required: boolean;
  culturalSensitive: boolean;
}

export interface LegalStandard {
  id: string;
  name: string;
  jurisdiction: string;
  requirements: string[];
}

export interface WorkflowTrigger {
  id: string;
  type: string;
  conditions: string[];
}

export interface WorkflowCondition {
  id: string;
  type: string;
  criteria: string;
}

export interface WorkflowOutcome {
  id: string;
  type: string;
  description: string;
}

export interface AccessibilityConfig {
  features: AccessibilityFeature[];
  requirements: string[];
}

export interface WorkflowAnalytics {
  completionRate: number;
  averageTime: number;
  successRate: number;
}

export interface StepValidation {
  id: string;
  type: string;
  rules: ValidationRule[];
}

export interface DocumentAction {
  id: string;
  type: string;
  document: string;
}

export interface NotificationAction {
  id: string;
  type: string;
  message: string;
}

export interface DeadlineAction {
  id: string;
  type: string;
  deadline: string;
}

export interface AlternativePath {
  id: string;
  condition: string;
  steps: string[];
}

export interface CulturalStepProtocol {
  id: string;
  type: string;
  requirements: string[];
}

export interface AccessibilitySupport {
  id: string;
  type: string;
  description: string;
}

export interface UserInputSpec {
  id: string;
  type: string;
  required: boolean;
}

export interface ValidationRule {
  id: string;
  type: string;
  criteria: string;
}

export interface ErrorHandling {
  strategy: string;
  fallbacks: string[];
}

export interface RetryConfig {
  maxAttempts: number;
  backoffStrategy: string;
}

export interface FailedStep {
  stepId: string;
  error: string;
  timestamp: string;
}

export interface ExecutionData {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface ExecutionMetadata {
  startTime: string;
  endTime?: string;
  userId: string;
}

export interface ExecutionAnalytics {
  stepTimes: Record<string, number>;
  errors: ExecutionError[];
}

export interface AppliedCulturalProtocol {
  protocolId: string;
  appliedAt: string;
  result: string;
}

export interface UserInteraction {
  stepId: string;
  type: string;
  timestamp: string;
}

export interface ExecutionError {
  stepId: string;
  message: string;
  timestamp: string;
}

export interface StepPerformance {
  executionTime: number;
  memoryUsage: number;
}

export interface AccessibilityFeature {
  id: string;
  type: string;
  enabled: boolean;
}

export interface GenerationRule {
  id: string;
  type: string;
  criteria: string;
}

export interface ApprovalWorkflow {
  id: string;
  steps: string[];
  approvers: string[];
}

export interface AutomationTrigger {
  id: string;
  type: string;
  conditions: string[];
}

export interface AutomationCondition {
  id: string;
  type: string;
  criteria: string;
}

export interface AutomationAction {
  id: string;
  type: string;
  action: string;
}

export interface CulturalSafeguard {
  id: string;
  type: string;
  protection: string;
}

export interface AccessibilityCheck {
  id: string;
  type: string;
  criteria: string;
}

export interface CeremonialConsideration {
  id: string;
  type: string;
  requirements: string[];
}

export interface ConsultationRequirement {
  id: string;
  type: string;
  stakeholders: string[];
}

export interface DocumentAdaptation {
  id: string;
  type: string;
  modifications: string[];
}

export interface TimeConsideration {
  id: string;
  type: string;
  requirements: string[];
}

export interface RespectProtocol {
  id: string;
  type: string;
  guidelines: string[];
}

export interface ElderInvolvementProtocol {
  required: boolean;
  consultationSteps: string[];
}

export interface TraditionalLawConsideration {
  id: string;
  type: string;
  principles: string[];
}

export interface AICapability {
  id: string;
  name: string;
  description: string;
}

export interface CulturalCompetency {
  level: string;
  certifications: string[];
}

export interface AISafeguard {
  id: string;
  type: string;
  protection: string;
}

export interface AIDecision {
  id: string;
  decision: string;
  reasoning: string;
}

export interface AIPerformance {
  accuracy: number;
  speed: number;
}

export interface ReviewFinding {
  id: string;
  type: string;
  description: string;
}

export interface ReviewRecommendation {
  id: string;
  type: string;
  action: string;
}

export interface CulturalReview {
  reviewerId: string;
  findings: string[];
}

export interface AccessibilityReview {
  reviewerId: string;
  findings: string[];
}

export interface LegalAccuracyReview {
  reviewerId: string;
  findings: string[];
}

export interface LegalReference {
  id: string;
  title: string;
  source: string;
}

export interface RegulationReference {
  id: string;
  title: string;
  jurisdiction: string;
}

export interface PrecedentCase {
  id: string;
  title: string;
  outcome: string;
}

export interface LegalProcedure {
  id: string;
  name: string;
  steps: string[];
}

export interface StandardForm {
  id: string;
  name: string;
  template: string;
}

export interface StandardDeadline {
  id: string;
  name: string;
  timeframe: string;
}

export interface LegalContact {
  id: string;
  name: string;
  role: string;
}

export interface LegalResource {
  id: string;
  name: string;
  type: string;
}

export interface LegalUpdate {
  id: string;
  title: string;
  date: string;
}

// Missing types for advanced-security.tsx
export interface MitigationStep {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CulturalImpactAssessment {
  id: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
}

export interface AccessibilityImpactAssessment {
  id: string;
  impact: 'low' | 'medium' | 'high';
  mitigation: string[];
  affected: boolean;
}

export interface SecurityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  evidence: string[];
  type: 'vulnerability' | 'configuration' | 'policy' | 'compliance';
}

export interface SecurityRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  timeline: string;
  description: string;
}

export interface ComplianceResult {
  standard: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  findings: string[];
  score: number;
}

export interface CulturalComplianceResult {
  protocol: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  findings: string[];
  notes: string;
}

export interface AccessibilityComplianceResult {
  feature: string;
  status: 'compliant' | 'non_compliant' | 'partial';
  findings: string[];
  score: number;
}

// Security Configuration Types
export interface TrustedDevice {
  id: string;
  name: string;
  lastAccess: Date;
  trusted: boolean;
}

export interface AuthenticationEvent {
  id: string;
  timestamp: Date;
  method: string;
  success: boolean;
  location?: string;
}

export interface CulturalAuthenticationMethod {
  id: string;
  name: string;
  isEnabled: boolean;
  description: string;
}

export interface EncryptionKey {
  id: string;
  algorithm: string;
  strength: number;
  createdAt: Date;
}

export interface ThirdPartySharing {
  enabled: boolean;
  allowedDomains: string[];
  restrictions: string[];
}

export interface LocationTrackingConfig {
  enabled: boolean;
  precision: 'high' | 'medium' | 'low';
  frequency: number;
  purpose: string;
}

export interface CulturalDataProtection {
  sacredDataProtection: boolean;
  elderAccess: boolean;
  communityConsent: boolean;
  communityConsentRequired: boolean;
}

export interface SensitiveDataHandling {
  encryption: boolean;
  anonymization: boolean;
  accessLogging: boolean;
  extraProtection: boolean;
}

export interface DataExportControl {
  format: string;
  restrictions: string[];
  approvalRequired: boolean;
}

export interface DataSharingConfig {
  internal: boolean;
  external: boolean;
  anonymous: boolean;
}

export interface DataBreachProtection {
  autoResponse: boolean;
  notificationTime: number;
  escalationPath: string[];
}

export interface ComplianceStandard {
  name: string;
  version: string;
  compliance: boolean;
}

export interface DataClassification {
  level: 'public' | 'internal' | 'confidential' | 'sacred';
  category: string;
  handling: string[];
}

export interface RetentionPolicy {
  dataType: string;
  retentionPeriod: number;
  deletionMethod: string;
}

export interface DataDisposalMethod {
  method: string;
  secure: boolean;
  verified: boolean;
}

// Access Control Types
export interface FeaturePermission {
  feature: string;
  granted: boolean;
  conditions?: string[];
}

export interface DataAccessRestriction {
  dataType: string;
  restrictions: string[];
  exceptions?: string[];
}

export interface TemporaryAccessConfig {
  feature: string;
  duration: number;
  autoRevoke: boolean;
}

export interface DelegatedAccessConfig {
  delegateTo: string;
  permissions: string[];
  expiry: Date;
}

export interface EmergencyOverrideConfig {
  enabled: boolean;
  contacts: string[];
  autoActivation: boolean;
  requiresJustification: boolean;
}

export interface AccessReview {
  id: string;
  reviewDate: Date;
  approver: string;
  status: 'approved' | 'denied' | 'pending';
}

export interface PrivilegedOperation {
  operation: string;
  requiresApproval: boolean;
  auditRequired: boolean;
}

export interface CulturalAccessControl {
  requirement: string;
  elderApproval: boolean;
  communityConsent: boolean;
  type: string;
  restrictions: string[];
  culturalGuidelines: string;
}

// Audit Types
export interface AlertThreshold {
  metric: string;
  threshold: number;
  action: string;
}

export interface LogExportControl {
  format: string;
  encryptionRequired: boolean;
  approvalRequired: boolean;
}

// Emergency Types
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface EmergencyDataAccess {
  dataType: string;
  accessLevel: string;
  conditions: string[];
}

export interface EmergencyAuthMethod {
  method: string;
  enabled: boolean;
  fallback: boolean;
}

export interface EmergencyNotification {
  type: string;
  recipients: string[];
  message: string;
}

export interface RecoveryMethod {
  method: string;
  enabled: boolean;
  secure: boolean;
}

// Cultural Security Types
export interface SacredDataProtection {
  enabled: boolean;
  protocols: string[];
  restrictions: string[];
  accessRestrictions: string[];
  specialHandling: boolean;
}

export interface ElderAccessRights {
  fullAccess: boolean;
  restrictions: string[];
  specialPrivileges: string[];
  enabled: boolean;
  accessLevel: string;
}

export interface CeremonyPrivacyConfig {
  restrictAccess: boolean;
  allowedUsers: string[];
  timeRestrictions: boolean;
  enabled: boolean;
  privacyLevel: string;
  participantConsent: boolean;
}

export interface TraditionalKnowledgeProtection {
  enabled: boolean;
  shareRestrictions: string[];
  accessRequirements: string[];
  attributionRequired: boolean;
}

export interface CommunityConsentConfig {
  required: boolean;
  minimumConsent: number;
  elderApproval: boolean;
  collectiveDecisionMaking: boolean;
  consensusThreshold: number;
}

export interface CulturalAuditRequirement {
  requirement: string;
  frequency: string;
  approver: string;
  type: 'elder_review' | 'community_feedback' | 'cultural_assessment' | 'protocol_review';
}

export interface IndigenousDataSovereignty {
  enabled: boolean;
  dataOwnership: string;
  governanceRules: string[];
  communityOwnership: boolean;
  culturalProtocolCompliance: boolean;
}

// Accessibility Types
export interface AccessibleAuthConfig {
  voiceRecognition: boolean;
  gestureAuth: boolean;
  assistiveDeviceSupport: boolean;
}

export interface AssistiveTechSupport {
  screenReader: boolean;
  voiceControl: boolean;
  switchControl: boolean;
}

export interface CognitiveAccessibilityFeature {
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface VisualAccessibilityFeature {
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface AuditoryAccessibilityFeature {
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface MotorAccessibilityFeature {
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface AlternativeAuthMethod {
  method: string;
  enabled: boolean;
  accessibilityCompliant: boolean;
}

// Security Threat Types
export interface SecurityThreat {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  detectedAt: Date;
  resolved: boolean;
  mitigationSteps: ThreatMitigationStep[];
  culturalImpact?: ThreatCulturalImpactAssessment;
  accessibilityImpact?: ThreatAccessibilityImpactAssessment;
}

export interface ThreatMitigationStep {
  step: string;
  completed: boolean;
  timestamp?: Date;
}

export interface ThreatCulturalImpactAssessment {
  impact: 'low' | 'medium' | 'high';
  affectedCommunities: string[];
  recommendations: string[];
}

export interface ThreatAccessibilityImpactAssessment {
  impact: 'low' | 'medium' | 'high';
  affectedUsers: string[];
  mitigations: string[];
  affected: boolean;
}

// Security Audit Types
export interface SecurityAudit {
  id: string;
  date: Date;
  auditor: string;
  type: string;
  status: 'passed' | 'failed' | 'warning' | 'completed';
  findings: AuditSecurityFinding[];
  recommendations: AuditSecurityRecommendation[];
  compliance: AuditComplianceResult[];
  culturalCompliance?: AuditCulturalComplianceResult[];
  accessibilityCompliance?: AuditAccessibilityComplianceResult[];
}

export interface AuditSecurityFinding {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
  type: string;
}

export interface AuditSecurityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  timeline: string;
  id: string;
}

export interface AuditComplianceResult {
  standard: string;
  compliant: boolean;
  issues?: string[];
  status: string;
}

export interface AuditCulturalComplianceResult {
  protocol: string;
  compliant: boolean;
  issues?: string[];
  status: string;
}

export interface AuditAccessibilityComplianceResult {
  guideline: string;
  compliant: boolean;
  issues?: string[];
  status: string;
}

// Workflow Engine Types
export interface WorkflowTemplateSummary {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface AccessibilityConfigBasic {
  screenReaderOptimized: boolean;
  highContrast: boolean;
  largeText: boolean;
}

export interface WorkflowAnalyticsSummary {
  totalExecutions: number;
  successRate: number;
  averageCompletion: number;
}

export interface DocumentRequirementLite {
  id: string;
  name: string;
  required: boolean;
  format: string[];
}

export interface LegalStandardLite {
  id: string;
  name: string;
  jurisdiction: string;
  requirements: string[];
}

export interface WorkflowTriggerConfig {
  id: string;
  type: string;
  triggerConditions: Record<string, any>;
}

export interface WorkflowConditionExpression {
  id: string;
  type: string;
  operator: string;
  value: any;
}

export interface WorkflowOutcomeResult {
  id: string;
  type: string;
  result: any;
}

// And many more types as placeholders...
// These are basic definitions to resolve compilation errors
// In a production environment, these would be properly defined with full interfaces

export interface SecurityConfig {
  authentication: {
    biometric: boolean;
    multiFactorAuth: boolean;
    biometricEnabled: boolean;
    multiFactorEnabled: boolean;
    pinEnabled: boolean;
    sessionTimeout: number;
    deviceBinding: boolean;
    biometricTypes: string[];
    culturalAuthentication?: CulturalAuthenticationMethod[];
    trustedDevices: TrustedDevice[];
    authenticationHistory: AuthenticationEvent[];
  };
  encryption: {
    dataAtRest: boolean;
    dataInTransit: boolean;
    keyManagement: string;
    encryptionKeys: EncryptionKey[];
  };
  privacy: {
    dataMinimization: boolean;
    purposeLimitation: boolean;
    consentManagement: boolean;
    thirdPartySharing: ThirdPartySharing;
    locationTracking: LocationTrackingConfig;
    dataRetention: string;
    culturalDataProtection: CulturalDataProtection;
    sensitiveDataHandling: SensitiveDataHandling;
  };
  dataGovernance: {
    dataClassificationEnabled: boolean;
    dataExportControls: DataExportControl[];
    dataSharing: DataSharingConfig;
    dataBreachProtection: DataBreachProtection;
    complianceStandards: ComplianceStandard[];
    dataClassification: DataClassification[];
    retentionPolicies: RetentionPolicy[];
    disposalMethods: DataDisposalMethod[];
  };
  accessControl: {
    roleBasedAccess: boolean;
    featurePermissions: FeaturePermission[];
    dataAccessRestrictions: DataAccessRestriction[];
    temporaryAccess: TemporaryAccessConfig[];
    delegatedAccess: DelegatedAccessConfig[];
    emergencyOverride: EmergencyOverrideConfig;
    accessReviews: AccessReview[];
    privilegedOperations: PrivilegedOperation[];
    culturalAccessControls: CulturalAccessControl[];
  };
  monitoring: {
    securityLogging: boolean;
    anomalyDetection: boolean;
    alertThresholds: AlertThreshold[];
    logExportControls: LogExportControl[];
  };
  emergencyFeatures: {
    panicButton: boolean;
    emergencyContacts: EmergencyContact[];
    emergencyBypass: boolean;
    emergencyDataAccess: EmergencyDataAccess[];
    emergencyAuthMethods: EmergencyAuthMethod[];
    emergencyNotifications: EmergencyNotification[];
    recoveryMethods: RecoveryMethod[];
  };
  culturalSecurity: {
    sacredDataProtection: SacredDataProtection;
    elderAccessRights: ElderAccessRights;
    ceremonyPrivacy: CeremonyPrivacyConfig;
    traditionalKnowledgeProtection: TraditionalKnowledgeProtection;
    communityConsent: CommunityConsentConfig;
    culturalAuditRequirements: CulturalAuditRequirement[];
    indigenousDataSovereignty: IndigenousDataSovereignty;
  };
  accessibilitySecurity: {
    accessibleAuthentication: AccessibleAuthConfig;
    assistiveTechnologySupport: AssistiveTechSupport;
    cognitiveAccessibilityFeatures: CognitiveAccessibilityFeature[];
    visualAccessibilityFeatures: VisualAccessibilityFeature[];
    auditoryAccessibilityFeatures: AuditoryAccessibilityFeature[];
    motorAccessibilityFeatures: MotorAccessibilityFeature[];
    alternativeAuthMethods: AlternativeAuthMethod[];
  };
  lastUpdated?: Date;
}

// Workflow Engine Interfaces
export interface WorkflowTemplate {
  id: string;
  name: string;
  version: string;
  steps: WorkflowStep[];
}

export interface AccessibilityConfig {
  enabled: boolean;
  features: string[];
}

export interface WorkflowAnalytics {
  executionCount: number;
  successRate: number;
  averageDuration: number;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  required: boolean;
}

export interface LegalStandard {
  id: string;
  jurisdiction: string;
  requirement: string;
}

export interface WorkflowTrigger {
  id: string;
  condition: string;
  action: string;
}

export interface WorkflowCondition {
  id: string;
  expression: string;
  operator: string;
}

export interface WorkflowOutcome {
  id: string;
  result: string;
  nextStep?: string;
}

export interface StepValidation {
  id: string;
  rule: string;
  message: string;
}

export interface DocumentAction {
  id: string;
  action: string;
  template: string;
}

export interface NotificationAction {
  id: string;
  type: string;
  recipients: string[];
}

export interface DeadlineAction {
  id: string;
  date: Date;
  reminder: boolean;
}

export interface AlternativePath {
  id: string;
  condition: string;
  steps: string[];
}

export interface CulturalStepProtocol {
  id: string;
  protocol: string;
  required: boolean;
}

export interface AccessibilitySupport {
  id: string;
  feature: string;
  enabled: boolean;
}

export interface UserInputSpec {
  id: string;
  field: string;
  type: string;
}

export interface ValidationRule {
  id: string;
  field: string;
  rule: string;
}

export interface ErrorHandling {
  strategy: string;
  fallback: string;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
}

export interface FailedStep {
  stepId: string;
  error: string;
  timestamp: Date;
}

export interface ExecutionData {
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface ExecutionMetadata {
  executionId: string;
  startTime: Date;
  endTime?: Date;
}

export interface ExecutionAnalytics {
  duration: number;
  stepCount: number;
  errorCount: number;
}

export interface AppliedCulturalProtocol {
  protocolId: string;
  applied: boolean;
  notes?: string;
}

export interface UserInteraction {
  stepId: string;
  action: string;
  timestamp: Date;
}

export interface ExecutionError {
  stepId: string;
  error: string;
  resolved: boolean;
}

export interface StepPerformance {
  stepId: string;
  duration: number;
  success: boolean;
}

export interface AccessibilityFeature {
  id: string;
  feature: string;
  enabled: boolean;
}

export interface GenerationRule {
  id: string;
  condition: string;
  template: string;
}

export interface ApprovalWorkflow {
  required: boolean;
  approvers: string[];
}

export interface AutomationTrigger {
  id: string;
  event: string;
  condition: string;
}

export interface AutomationCondition {
  id: string;
  expression: string;
  result: boolean;
}

export interface AutomationAction {
  id: string;
  action: string;
  parameters: Record<string, any>;
}

export interface CulturalSafeguard {
  id: string;
  safeguard: string;
  active: boolean;
}

export interface AccessibilityCheck {
  id: string;
  check: string;
  passed: boolean;
}

export interface CeremonialConsideration {
  id: string;
  consideration: string;
  required: boolean;
}

export interface ConsultationRequirement {
  id: string;
  type: string;
  required: boolean;
}

export interface DocumentAdaptation {
  id: string;
  adaptation: string;
  language: string;
}

export interface TimeConsideration {
  id: string;
  consideration: string;
  timeframe: string;
}

export interface RespectProtocol {
  id: string;
  protocol: string;
  mandatory: boolean;
}

export interface ElderInvolvementProtocol {
  required: boolean;
  level: string;
}

export interface TraditionalLawConsideration {
  id: string;
  law: string;
  jurisdiction: string;
}

export interface AICapability {
  id: string;
  capability: string;
  enabled: boolean;
}

export interface CulturalCompetency {
  level: string;
  certified: boolean;
}

export interface AISafeguard {
  id: string;
  safeguard: string;
  active: boolean;
}

export interface AIDecision {
  id: string;
  decision: string;
  reasoning: string;
}

export interface AIPerformance {
  accuracy: number;
  responseTime: number;
}

export interface ReviewFinding {
  id: string;
  finding: string;
  severity: string;
}

export interface ReviewRecommendation {
  id: string;
  recommendation: string;
  priority: string;
}

export interface CulturalReview {
  status: string;
  reviewer: string;
}

export interface AccessibilityReview {
  status: string;
  guidelines: string[];
}

export interface LegalAccuracyReview {
  status: string;
  accuracy: number;
}

export interface LegalReference {
  id: string;
  title: string;
  jurisdiction: string;
}

export interface RegulationReference {
  id: string;
  regulation: string;
  section: string;
}

export interface PrecedentCase {
  id: string;
  case: string;
  citation: string;
}

export interface LegalProcedure {
  id: string;
  procedure: string;
  steps: string[];
}

export interface StandardForm {
  id: string;
  form: string;
  version: string;
}

export interface StandardDeadline {
  id: string;
  deadline: string;
  timeframe: string;
}

export interface LegalContact {
  id: string;
  name: string;
  role: string;
}

export interface LegalResource {
  id: string;
  resource: string;
  type: string;
}

export interface LegalUpdate {
  id: string;
  update: string;
  date: Date;
}