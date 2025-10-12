/**
 * Security Framework Type Declarations
 * Helps VS Code TypeScript language server resolve module imports
 */

// Re-export all types from security modules
export * from './appIntegrity';
export * from './deviceSecurity';
export * from './encryption';
export * from './inputValidation';
export * from './networkSecurity';
export * from './permissions';
export { initializeSecurity } from './securityManager';
export * from './tamperDetection';
