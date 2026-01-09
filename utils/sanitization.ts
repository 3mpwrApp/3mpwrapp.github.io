/**
 * Form Sanitization Utilities
 * Provides secure input sanitization for form data
 */

import { z } from 'zod';

/**
 * File type whitelist for uploads
 */
export const ALLOWED_FILE_TYPES = {
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  all: [] as string[],
};

// Populate 'all' with all allowed types
Object.entries(ALLOWED_FILE_TYPES).forEach(([key, types]) => {
  if (key !== 'all' && Array.isArray(types)) {
    ALLOWED_FILE_TYPES.all.push(...types);
  }
});

/**
 * Validate file type
 */
export function isAllowedFileType(
  mimeType: string,
  allowedTypes: 'documents' | 'images' | 'spreadsheets' | 'all' = 'documents'
): boolean {
  const types = ALLOWED_FILE_TYPES[allowedTypes];
  return types.includes(mimeType);
}

/**
 * Get file extension from mime type
 */
export function getFileExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  };
  return mimeToExt[mimeType] || 'unknown';
}

/**
 * Validate file size (in bytes)
 */
export function isAllowedFileSize(
  fileSizeBytes: number,
  maxSizeMB: number = 25
): boolean {
  return fileSizeBytes <= maxSizeMB * 1024 * 1024;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(sizeInBytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = sizeInBytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Sanitize form input - remove HTML, scripts, and dangerous content
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input) return '';

  return input
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove onclick and other event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Remove HTML tags but preserve text
    .replace(/<[^>]*>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Allow specific safe HTML tags while stripping dangerous ones
 */
export function sanitizeHtmlPreserveFormatting(html: string): string {
  // Create a temporary container (if in browser environment)
  if (typeof window === 'undefined') {
    return sanitizeInput(html);
  }

  try {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove script tags
    const scripts = temp.querySelectorAll('script');
    scripts.forEach((script) => script.remove());

    // Remove event handlers
    const allElements = temp.querySelectorAll('*');
    allElements.forEach((el) => {
      // Remove all attributes starting with 'on'
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith('on')) {
          el.removeAttribute(attr.name);
        }
      });
    });

    return temp.innerHTML;
  } catch {
    return sanitizeInput(html);
  }
}

/**
 * Trim and normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/^\s+|\s+$/g, '') // Trim start and end
    .trim();
}

/**
 * Normalize URLs to prevent XSS
 */
export function normalizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '');
}

/**
 * Sanitize phone number - keep only digits, +, -, (), and spaces, collapse consecutive dashes
 */
export function sanitizePhoneNumber(phone: string): string {
  return phone
    .replace(/[^\d+\-()\s]/g, '')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Validate and sanitize postal code
 */
export function sanitizePostalCode(code: string): string {
  return code
    .toUpperCase()
    .replace(/[^A-Z0-9\s-]/g, '')
    .trim();
}

/**
 * Create a Zod transformer for form sanitization
 */
export function createSanitizationTransformer(sanitizer: (val: string) => string) {
  return z.string().transform(sanitizer);
}

/**
 * Sanitization presets for common fields
 */
export const SanitizationPresets = {
  text: (val: string) => sanitizeInput(val),
  email: sanitizeEmail,
  phone: sanitizePhoneNumber,
  postalCode: sanitizePostalCode,
  url: (val: string) => normalizeUrl(val) || '',
  whitespace: normalizeWhitespace,
};

/**
 * Multi-field sanitization utility
 */
export function sanitizeFormData<T extends Record<string, any>>(
  data: T,
  sanitizers: Partial<Record<keyof T, (val: any) => any>>
): T {
  const sanitized = { ...data };

  for (const [field, sanitizer] of Object.entries(sanitizers)) {
    if (field in sanitized && typeof sanitizer === 'function') {
      sanitized[field as keyof T] = sanitizer(sanitized[field as keyof T]);
    }
  }

  return sanitized;
}

/**
 * Batch sanitize array of objects
 */
export function sanitizeFormDataArray<T extends Record<string, any>>(
  dataArray: T[],
  sanitizers: Partial<Record<keyof T, (val: any) => any>>
): T[] {
  return dataArray.map((item) => sanitizeFormData(item, sanitizers));
}

/**
 * Content Security Policy helper - get safe content
 */
export function getSafeContent(content: string): string {
  return sanitizeInput(content);
}

/**
 * Prevent injection attacks in form values
 */
export function preventInjection(value: string): string {
  const dangerousPatterns = [
    /<[^>]*>/g, // HTML tags
    /javascript:/gi, // javascript protocol
    /on\w+\s*=/gi, // Event handlers
    /eval\s*\(/gi, // eval
    /expression\s*\(/gi, // CSS expressions
    /vbscript:/gi, // VBScript protocol
  ];

  let result = value;
  dangerousPatterns.forEach((pattern) => {
    result = result.replace(pattern, '');
  });

  return result.trim();
}
