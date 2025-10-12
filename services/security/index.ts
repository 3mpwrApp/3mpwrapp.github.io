/**
 * Security Framework - Core security services and hardening measures
 * Implements: tamper detection, integrity checks, device security validation
 */

export * from './appIntegrity';
export * from './deviceSecurity';
export * from './encryption';
export * from './inputValidation';
export * from './networkSecurity';
export * from './permissions';
export * from './tamperDetection';

// Initialize security framework
export { initializeSecurity } from './securityManager';
