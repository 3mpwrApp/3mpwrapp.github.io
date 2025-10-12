/**
 * Tamper Detection - Runtime application integrity monitoring
 * Implements: anti-debugging, hook detection, signature verification
 */

interface TamperEvent {
  type: 'debug' | 'hook' | 'modification' | 'signature' | 'environment' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: number;
  evidence?: any;
}

interface IntegrityCheck {
  id: string;
  name: string;
  lastCheck: number;
  passed: boolean;
  details?: string;
}

/**
 * Anti-tampering and integrity monitoring service
 */
export class TamperDetector {
  private events: TamperEvent[] = [];
  private checks: Map<string, IntegrityCheck> = new Map();
  private monitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    // Initialize integrity checks
    this.initializeChecks();
  }

  /**
   * Start continuous tampering monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoring) {
      return;
    }

    this.monitoring = true;
    
    // Perform initial check
    this.performAllChecks();

    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performAllChecks();
    }, intervalMs);

    console.log('Tamper detection monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    this.monitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('Tamper detection monitoring stopped');
  }

  /**
   * Initialize integrity checks
   */
  private initializeChecks(): void {
    const checks: Array<{ id: string; name: string }> = [
      { id: 'debugger', name: 'Debugger Detection' },
      { id: 'hooks', name: 'Function Hook Detection' },
      { id: 'signature', name: 'Application Signature' },
      { id: 'environment', name: 'Runtime Environment' },
      { id: 'memory', name: 'Memory Integrity' },
      { id: 'timing', name: 'Timing Attack Detection' }
    ];

    checks.forEach(check => {
      this.checks.set(check.id, {
        id: check.id,
        name: check.name,
        lastCheck: 0,
        passed: true
      });
    });
  }

  /**
   * Perform all integrity checks
   */
  async performAllChecks(): Promise<TamperEvent[]> {
    const events: TamperEvent[] = [];

    try {
      // Check for debugger attachment
      const debuggerEvent = await this.checkDebuggerAttachment();
      if (debuggerEvent) events.push(debuggerEvent);

      // Check for function hooks
      const hooksEvent = await this.checkFunctionHooks();
      if (hooksEvent) events.push(hooksEvent);

      // Check application signature
      const signatureEvent = await this.checkApplicationSignature();
      if (signatureEvent) events.push(signatureEvent);

      // Check runtime environment
      const environmentEvent = await this.checkRuntimeEnvironment();
      if (environmentEvent) events.push(environmentEvent);

      // Check memory integrity
      const memoryEvent = await this.checkMemoryIntegrity();
      if (memoryEvent) events.push(memoryEvent);

      // Check for timing attacks
      const timingEvent = await this.checkTimingAttacks();
      if (timingEvent) events.push(timingEvent);

      // Store events
      this.events.push(...events);

      // Keep only last 1000 events
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }

    } catch (error) {
      console.error('Integrity check failed:', error);
      
      const errorEvent: TamperEvent = {
        type: 'modification',
        severity: 'medium',
        description: 'Integrity check system compromised',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
      
      events.push(errorEvent);
    }

    return events;
  }

  /**
   * Check for debugger attachment
   */
  private async checkDebuggerAttachment(): Promise<TamperEvent | null> {
    try {
      const checkId = 'debugger';
      const now = Date.now();

      // Method 1: Check dev tools
      if (typeof window !== 'undefined') {
        // Web environment - check for dev tools
        const devtools = window.outerHeight - window.innerHeight > 200 || 
                        window.outerWidth - window.innerWidth > 200;
        
        if (devtools && !__DEV__) {
          this.updateCheck(checkId, false, 'Developer tools detected');
          return {
            type: 'debug',
            severity: 'medium',
            description: 'Developer tools may be open',
            timestamp: now
          };
        }
      }

      // Method 2: Timing-based detection
      const start = performance.now();
      debugger; // This will pause if debugger is attached
      const end = performance.now();

      if ((end - start) > 100 && !__DEV__) {
        this.updateCheck(checkId, false, 'Debugger pause detected');
        return {
          type: 'debug',
          severity: 'high',
          description: 'Debugger attachment detected via timing',
          timestamp: now,
          evidence: { timingDelay: end - start }
        };
      }

      // Method 3: Console detection (web only)
      if (typeof console !== 'undefined') {
        let consoleModified = false;
        try {
          const originalLog = console.log;
          console.log = () => { consoleModified = true; };
          console.log();
          console.log = originalLog;
        } catch {
          consoleModified = true;
        }

        if (consoleModified && !__DEV__) {
          this.updateCheck(checkId, false, 'Console modification detected');
          return {
            type: 'debug',
            severity: 'medium',
            description: 'Console object has been modified',
            timestamp: now
          };
        }
      }

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('debugger', false, 'Check failed');
      return {
        type: 'debug',
        severity: 'medium',
        description: 'Debugger detection check failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Check for function hooks/patches
   */
  private async checkFunctionHooks(): Promise<TamperEvent | null> {
    try {
      const checkId = 'hooks';
      const now = Date.now();

      // Check critical functions for modifications
      const criticalFunctions = [
        { obj: Date as any, name: 'now', original: Date.now },
        { obj: JSON as any, name: 'parse', original: JSON.parse },
        { obj: JSON as any, name: 'stringify', original: JSON.stringify },
        { obj: Array.prototype as any, name: 'push', original: Array.prototype.push }
      ];

      for (const func of criticalFunctions) {
        if (func.obj[func.name] !== func.original) {
          this.updateCheck(checkId, false, `${func.name} function hooked`);
          return {
            type: 'hook',
            severity: 'high',
            description: `Critical function ${func.name} has been hooked/modified`,
            timestamp: now,
            evidence: { function: func.name }
          };
        }
      }

      // Check for prototype pollution
      if ('__proto__' in Object.prototype && (Object.prototype as any).__proto__ !== Object.prototype) {
        this.updateCheck(checkId, false, 'Prototype pollution detected');
        return {
          type: 'hook',
          severity: 'critical',
          description: 'Prototype pollution attack detected',
          timestamp: now
        };
      }

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('hooks', false, 'Check failed');
      return {
        type: 'hook',
        severity: 'medium',
        description: 'Function hook detection failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Check application signature integrity
   */
  private async checkApplicationSignature(): Promise<TamperEvent | null> {
    try {
      const checkId = 'signature';
      const now = Date.now();

      // In a real implementation, this would:
      // 1. Calculate current app bundle hash
      // 2. Compare with stored/expected signature
      // 3. Verify certificate chain
      // 4. Check for code injection

      // For now, perform basic checks
      
      // Check if running in expected environment
      const expectedUserAgent = /EmpowrApp/;
      if (typeof navigator !== 'undefined' && !expectedUserAgent.test(navigator.userAgent) && !__DEV__) {
        this.updateCheck(checkId, false, 'Unexpected user agent');
        return {
          type: 'signature',
          severity: 'medium',
          description: 'Application running in unexpected environment',
          timestamp: now,
          evidence: { userAgent: navigator.userAgent }
        };
      }

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('signature', false, 'Check failed');
      return {
        type: 'signature',
        severity: 'medium',
        description: 'Signature verification failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Check runtime environment integrity
   */
  private async checkRuntimeEnvironment(): Promise<TamperEvent | null> {
    try {
      const checkId = 'environment';
      const now = Date.now();

      // Check for suspicious global variables
      const suspiciousGlobals = [
        'webpackJsonp',
        '__REACT_DEVTOOLS_GLOBAL_HOOK__',
        '__REDUX_DEVTOOLS_EXTENSION__',
        'Frida',
        'Java',
        'send',
        'recv'
      ];

      for (const globalVar of suspiciousGlobals) {
        if (typeof window !== 'undefined' && (window as any)[globalVar] && !__DEV__) {
          this.updateCheck(checkId, false, `Suspicious global: ${globalVar}`);
          return {
            type: 'environment',
            severity: 'medium',
            description: `Suspicious global variable detected: ${globalVar}`,
            timestamp: now,
            evidence: { global: globalVar }
          };
        }
      }

      // Check for unexpected properties on critical objects
      const expectedPropertyCount = {
        Object: Object.getOwnPropertyNames(Object).length,
        Function: Object.getOwnPropertyNames(Function).length,
        Array: Object.getOwnPropertyNames(Array).length
      };

      // This would compare with known good values in production
      // For now, just log the counts
      console.log('Critical object property counts:', expectedPropertyCount);

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('environment', false, 'Check failed');
      return {
        type: 'environment',
        severity: 'medium',
        description: 'Environment check failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Check memory integrity
   */
  private async checkMemoryIntegrity(): Promise<TamperEvent | null> {
    try {
      const checkId = 'memory';
      const now = Date.now();

      // Check for memory pressure (potential attack)
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        
        if (memoryUsage > 0.9) {
          this.updateCheck(checkId, false, 'High memory usage');
          return {
            type: 'memory',
            severity: 'medium',
            description: 'Unusual memory pressure detected',
            timestamp: now,
            evidence: { memoryUsage: memoryUsage }
          };
        }
      }

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('memory', false, 'Check failed');
      return {
        type: 'memory',
        severity: 'low',
        description: 'Memory integrity check failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Check for timing attacks
   */
  private async checkTimingAttacks(): Promise<TamperEvent | null> {
    try {
      const checkId = 'timing';
      const now = Date.now();

      // Perform timing check
      const start = performance.now();
      
      // Simple computation that should have predictable timing
      let result = 0;
      for (let i = 0; i < 10000; i++) {
        result += Math.random();
      }
      
      const end = performance.now();
      const duration = end - start;

      // Check for unusual timing (may indicate analysis/debugging)
      if (duration > 100) {
        this.updateCheck(checkId, false, 'Unusual timing detected');
        return {
          type: 'debug',
          severity: 'low',
          description: 'Timing anomaly detected - possible analysis',
          timestamp: now,
          evidence: { duration: duration, expected: '<50ms' }
        };
      }

      this.updateCheck(checkId, true);
      return null;

    } catch (error) {
      this.updateCheck('timing', false, 'Check failed');
      return {
        type: 'debug',
        severity: 'low',
        description: 'Timing attack detection failed',
        timestamp: Date.now(),
        evidence: { error: error instanceof Error ? error.message : 'Unknown' }
      };
    }
  }

  /**
   * Update check status
   */
  private updateCheck(id: string, passed: boolean, details?: string): void {
    const check = this.checks.get(id);
    if (check) {
      check.lastCheck = Date.now();
      check.passed = passed;
      check.details = details;
      this.checks.set(id, check);
    }
  }

  /**
   * Get all tamper events
   */
  getTamperEvents(): TamperEvent[] {
    return [...this.events];
  }

  /**
   * Get critical tamper events only
   */
  getCriticalEvents(): TamperEvent[] {
    return this.events.filter(event => 
      event.severity === 'critical' || event.severity === 'high'
    );
  }

  /**
   * Get integrity check status
   */
  getIntegrityStatus(): IntegrityCheck[] {
    return Array.from(this.checks.values());
  }

  /**
   * Check if system is compromised
   */
  isCompromised(): { compromised: boolean; reasons: string[] } {
    const criticalEvents = this.getCriticalEvents();
    const failedChecks = Array.from(this.checks.values()).filter(check => !check.passed);

    const compromised = criticalEvents.length > 0 || failedChecks.length > 2;
    const reasons: string[] = [
      ...criticalEvents.map(event => event.description),
      ...failedChecks.map(check => check.details || check.name)
    ];

    return { compromised, reasons };
  }

  /**
   * Clear events and reset checks
   */
  reset(): void {
    this.events = [];
    this.checks.forEach(check => {
      check.passed = true;
      check.lastCheck = 0;
      check.details = undefined;
    });
  }
}

// Global tamper detector
export const tamperDetector = new TamperDetector();

// Auto-start monitoring in production
if (!__DEV__) {
  tamperDetector.startMonitoring(60000); // Check every minute
}

export { type IntegrityCheck, type TamperEvent };
