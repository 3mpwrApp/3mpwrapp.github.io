/**
 * Input Validation - Comprehensive sanitization and validation framework
 * Implements: XSS prevention, injection protection, data sanitization
 */

interface ValidationRule {
  type: 'string' | 'number' | 'email' | 'url' | 'phone' | 'date' | 'json' | 'html' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
  sanitizer?: (value: string) => string;
  errorMessage?: string;
}

interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: any;
  errors: string[];
}

interface SecurityContext {
  allowHtml: boolean;
  allowUrls: boolean;
  allowScripts: boolean;
  strictMode: boolean;
}

/**
 * Input validation and sanitization service
 */
export class InputValidator {
  private securityContext: SecurityContext;

  constructor(context?: Partial<SecurityContext>) {
    this.securityContext = {
      allowHtml: false,
      allowUrls: true,
      allowScripts: false,
      strictMode: true,
      ...context
    };
  }

  /**
   * Validate and sanitize input value
   */
  validate(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];
    let sanitizedValue = value;

    try {
      // Handle null/undefined
      if (value === null || value === undefined) {
        if (rules.required) {
          errors.push(rules.errorMessage || 'Value is required');
        }
        return { isValid: errors.length === 0, sanitizedValue: null, errors };
      }

      // Convert to string for processing
      const stringValue = String(value);

      // Apply sanitization first
      if (rules.sanitizer) {
        sanitizedValue = rules.sanitizer(stringValue);
      } else {
        sanitizedValue = this.applySanitization(stringValue, rules.type);
      }

      // Type-specific validation
      switch (rules.type) {
        case 'string':
          this.validateString(sanitizedValue, rules, errors);
          break;
        case 'number':
          sanitizedValue = this.validateNumber(sanitizedValue, rules, errors);
          break;
        case 'email':
          this.validateEmail(sanitizedValue, rules, errors);
          break;
        case 'url':
          this.validateUrl(sanitizedValue, rules, errors);
          break;
        case 'phone':
          this.validatePhone(sanitizedValue, rules, errors);
          break;
        case 'date':
          this.validateDate(sanitizedValue, rules, errors);
          break;
        case 'json':
          sanitizedValue = this.validateJson(sanitizedValue, rules, errors);
          break;
        case 'html':
          sanitizedValue = this.validateHtml(sanitizedValue, rules, errors);
          break;
        case 'custom':
          if (rules.customValidator && !rules.customValidator(sanitizedValue)) {
            errors.push(rules.errorMessage || 'Custom validation failed');
          }
          break;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(String(sanitizedValue))) {
        errors.push(rules.errorMessage || 'Value does not match required pattern');
      }

    } catch (error) {
      errors.push('Validation error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors
    };
  }

  /**
   * Apply general sanitization based on type
   */
  private applySanitization(value: string, type: string): string {
    // Always trim whitespace
    let sanitized = value.trim();

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    // Remove control characters (except tab, newline, carriage return)
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Type-specific sanitization
    switch (type) {
      case 'string':
        if (!this.securityContext.allowHtml) {
          sanitized = this.escapeHtml(sanitized);
        }
        break;
      case 'email':
        sanitized = sanitized.toLowerCase();
        break;
      case 'url':
        if (!this.securityContext.allowUrls) {
          // Remove URLs in strict mode
          sanitized = sanitized.replace(/https?:\/\/[^\s]+/gi, '[URL removed]');
        }
        break;
      case 'html':
        if (!this.securityContext.allowHtml) {
          sanitized = this.stripHtml(sanitized);
        } else {
          sanitized = this.sanitizeHtml(sanitized);
        }
        break;
    }

    return sanitized;
  }

  /**
   * Validate string input
   */
  private validateString(value: string, rules: ValidationRule, errors: string[]): void {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    // Check for potential injection attacks
    if (this.securityContext.strictMode) {
      if (this.containsSqlInjection(value)) {
        errors.push('Input contains potentially dangerous SQL patterns');
      }

      if (this.containsScriptInjection(value)) {
        errors.push('Input contains potentially dangerous script patterns');
      }
    }
  }

  /**
   * Validate number input
   */
  private validateNumber(value: string, rules: ValidationRule, errors: string[]): number | string {
    const numValue = Number(value);

    if (isNaN(numValue)) {
      errors.push('Value must be a valid number');
      return value;
    }

    if (rules.min !== undefined && numValue < rules.min) {
      errors.push(`Minimum value is ${rules.min}`);
    }

    if (rules.max !== undefined && numValue > rules.max) {
      errors.push(`Maximum value is ${rules.max}`);
    }

    return numValue;
  }

  /**
   * Validate email input
   */
  private validateEmail(value: string, rules: ValidationRule, errors: string[]): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(value)) {
      errors.push('Invalid email format');
    }

    // Additional email security checks
    if (this.securityContext.strictMode) {
      // Check for suspicious patterns
      if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
        errors.push('Email contains suspicious patterns');
      }
    }
  }

  /**
   * Validate URL input
   */
  private validateUrl(value: string, rules: ValidationRule, errors: string[]): void {
    try {
      const url = new URL(value);
      
      // Only allow HTTPS in strict mode
      if (this.securityContext.strictMode && url.protocol !== 'https:') {
        errors.push('Only HTTPS URLs are allowed');
      }

      // Check for suspicious patterns
      if (this.containsSuspiciousUrl(value)) {
        errors.push('URL contains suspicious patterns');
      }

    } catch {
      errors.push('Invalid URL format');
    }
  }

  /**
   * Validate phone input
   */
  private validatePhone(value: string, rules: ValidationRule, errors: string[]): void {
    // Remove common formatting characters
    const cleaned = value.replace(/[\s\-\(\)\+\.]/g, '');
    
    // Basic phone number validation (adjust based on requirements)
    if (!/^\d{10,15}$/.test(cleaned)) {
      errors.push('Invalid phone number format');
    }
  }

  /**
   * Validate date input
   */
  private validateDate(value: string, rules: ValidationRule, errors: string[]): void {
    const date = new Date(value);
    
    if (isNaN(date.getTime())) {
      errors.push('Invalid date format');
    }
  }

  /**
   * Validate JSON input
   */
  private validateJson(value: string, rules: ValidationRule, errors: string[]): any {
    try {
      const parsed = JSON.parse(value);
      
      // Check for dangerous JSON patterns
      if (this.securityContext.strictMode) {
        if (this.containsDangerousJson(parsed)) {
          errors.push('JSON contains potentially dangerous patterns');
        }
      }
      
      return parsed;
    } catch {
      errors.push('Invalid JSON format');
      return value;
    }
  }

  /**
   * Validate HTML input
   */
  private validateHtml(value: string, rules: ValidationRule, errors: string[]): string {
    if (!this.securityContext.allowHtml) {
      errors.push('HTML content not allowed');
      return this.stripHtml(value);
    }

    return this.sanitizeHtml(value);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Strip HTML tags
   */
  private stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, '');
  }

  /**
   * Sanitize HTML content
   */
  private sanitizeHtml(value: string): string {
    // Remove dangerous tags and attributes
    let sanitized = value;

    // Remove script tags
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gis, '');

    // Remove dangerous attributes
    sanitized = sanitized.replace(/\s+(on\w+|javascript:|data:)\s*=\s*["'][^"']*["']/gi, '');

    // Remove dangerous tags
    const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'button'];
    dangerousTags.forEach(tag => {
      const regex = new RegExp(`<${tag}[^>]*>.*?<\/${tag}>`, 'gis');
      sanitized = sanitized.replace(regex, '');
    });

    return sanitized;
  }

  /**
   * Check for SQL injection patterns
   */
  private containsSqlInjection(value: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
      /(\b(UNION|OR|AND)\b.*\b(SELECT|INSERT|UPDATE|DELETE)\b)/i,
      /(--|\#|\/\*|\*\/)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for script injection patterns
   */
  private containsScriptInjection(value: string): boolean {
    const scriptPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i
    ];

    return scriptPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for suspicious URL patterns
   */
  private containsSuspiciousUrl(value: string): boolean {
    const suspiciousPatterns = [
      /[<>]/,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(value));
  }

  /**
   * Check for dangerous JSON patterns
   */
  private containsDangerousJson(obj: any): boolean {
    const jsonString = JSON.stringify(obj);
    
    const dangerousPatterns = [
      /__proto__/,
      /constructor/,
      /prototype/,
      /eval/,
      /function/,
      /script/
    ];

    return dangerousPatterns.some(pattern => pattern.test(jsonString));
  }

  /**
   * Batch validation for multiple inputs
   */
  validateBatch(inputs: Array<{ value: any; rules: ValidationRule; key: string }>): { 
    isValid: boolean; 
    results: Record<string, ValidationResult>; 
    errors: string[] 
  } {
    const results: Record<string, ValidationResult> = {};
    const allErrors: string[] = [];

    for (const input of inputs) {
      const result = this.validate(input.value, input.rules);
      results[input.key] = result;
      
      if (!result.isValid) {
        allErrors.push(...result.errors.map(err => `${input.key}: ${err}`));
      }
    }

    return {
      isValid: allErrors.length === 0,
      results,
      errors: allErrors
    };
  }

  /**
   * Update security context
   */
  updateSecurityContext(updates: Partial<SecurityContext>): void {
    this.securityContext = { ...this.securityContext, ...updates };
  }
}

// Global validator instances
export const strictValidator = new InputValidator({
  allowHtml: false,
  allowUrls: false,
  allowScripts: false,
  strictMode: true
});

export const standardValidator = new InputValidator({
  allowHtml: false,
  allowUrls: true,
  allowScripts: false,
  strictMode: true
});

export const permissiveValidator = new InputValidator({
  allowHtml: true,
  allowUrls: true,
  allowScripts: false,
  strictMode: false
});

// Common validation rules
export const commonRules = {
  username: {
    type: 'string' as const,
    required: true,
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
    errorMessage: 'Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens'
  },
  email: {
    type: 'email' as const,
    required: true,
    maxLength: 254,
    errorMessage: 'Please enter a valid email address'
  },
  password: {
    type: 'string' as const,
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    errorMessage: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
  },
  url: {
    type: 'url' as const,
    required: false,
    maxLength: 2048,
    errorMessage: 'Please enter a valid HTTPS URL'
  },
  phone: {
    type: 'phone' as const,
    required: false,
    errorMessage: 'Please enter a valid phone number'
  }
};

export { type SecurityContext, type ValidationResult, type ValidationRule };
