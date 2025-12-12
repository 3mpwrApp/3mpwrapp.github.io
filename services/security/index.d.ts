/**
 * Security Framework Type Declarations - MAXIMUM PROTECTION
 * Helps VS Code TypeScript language server resolve module imports
 */

// Core security modules
export * from './appIntegrity';
export * from './deviceSecurity';
export * from './encryption';
export * from './inputValidation';
export * from './networkSecurity';
export * from './permissions';
export * from './securityCore';
export * from './tamperDetection';
export * from './threatDetection';

// Advanced protection modules
export * from './antiReverseEngineering';
export * from './biometricAuth';
export * from './memoryProtection';
export * from './raspEngine';

// Central security manager
export {
    getSecurityStatus, initializeSecurity,
    performSecurityCheck, type SecurityConfig,
    type SecurityStatus
} from './securityManager';

