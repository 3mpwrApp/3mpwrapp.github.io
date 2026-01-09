/**
 * Validation Tests
 * Comprehensive test suite for Zod schemas and form validation
 */

import { describe, expect, it } from '@jest/globals';

import {
    CampaignSchema,
    EventSchema,
    LetterSchema,
    MedicationSchema,
    ProfileSchema,
    SettingsSchema,
    UserSchema,
    validateData
} from '../types/validation';
import {
    isAllowedFileSize,
    isAllowedFileType,
    normalizeWhitespace,
    preventInjection,
    sanitizeEmail,
    sanitizeInput,
    sanitizePhoneNumber,
} from '../utils/sanitization';

// ============================================================================
// Sanitization Tests
// ============================================================================

describe('Sanitization Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      expect(sanitizeInput(input)).toBe('Hello World');
    });

    it('removes script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      expect(sanitizeInput(input)).toBe('Hello  World');
    });

    it('removes event handlers', () => {
      const input = '<div onclick="alert(1)">Click me</div>';
      expect(sanitizeInput(input)).toBe('Click me');
    });

    it('removes javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      expect(sanitizeInput(input)).toBe('Click');
    });

    it('handles null/undefined', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
    });
  });

  describe('normalizeWhitespace', () => {
    it('removes extra spaces', () => {
      expect(normalizeWhitespace('Hello    World')).toBe('Hello World');
    });

    it('trims start and end', () => {
      expect(normalizeWhitespace('  Hello  ')).toBe('Hello');
    });
  });

  describe('sanitizeEmail', () => {
    it('lowercases email', () => {
      expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
    });

    it('removes whitespace', () => {
      expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
    });
  });

  describe('sanitizePhoneNumber', () => {
    it('keeps only valid characters', () => {
      expect(sanitizePhoneNumber('123-456-7890')).toBe('123-456-7890');
      expect(sanitizePhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
      expect(sanitizePhoneNumber('+1 (123) 456-7890')).toBe('+1 (123) 456-7890');
    });

    it('removes invalid characters', () => {
      expect(sanitizePhoneNumber('123-abc-7890')).toBe('123-7890');
    });
  });

  describe('preventInjection', () => {
    it('prevents HTML injection', () => {
      const input = '<img src=x onerror="alert(1)">';
      const result = preventInjection(input);
      expect(result).not.toContain('onerror');
    });

    it('prevents eval injection', () => {
      const input = 'eval("dangerous code")';
      const result = preventInjection(input);
      expect(result).not.toContain('eval');
    });
  });

  describe('File validation', () => {
    it('validates file types', () => {
      expect(isAllowedFileType('application/pdf', 'documents')).toBe(true);
      expect(isAllowedFileType('image/png', 'images')).toBe(true);
      expect(isAllowedFileType('application/exe', 'documents')).toBe(false);
    });

    it('validates file size', () => {
      expect(isAllowedFileSize(1024 * 1024 * 10, 25)).toBe(true); // 10MB <= 25MB
      expect(isAllowedFileSize(1024 * 1024 * 30, 25)).toBe(false); // 30MB > 25MB
    });
  });
});

// ============================================================================
// User Schema Tests
// ============================================================================

describe('UserSchema', () => {
  it('validates valid user', () => {
    const valid = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'John Doe',
      email: 'john@example.com',
      province: 'ON',
    };
    const result = validateData(UserSchema, valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid name (too short)', () => {
    const invalid = {
      name: 'J',
      email: 'john@example.com',
      province: 'ON',
    };
    const result = validateData(UserSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['name']).toBeDefined();
  });

  it('rejects invalid email', () => {
    const invalid = {
      name: 'John Doe',
      email: 'not-an-email',
      province: 'ON',
    };
    const result = validateData(UserSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['email']).toBeDefined();
  });

  it('rejects invalid province', () => {
    const invalid = {
      name: 'John Doe',
      email: 'john@example.com',
      province: 'XYZ',
    };
    const result = validateData(UserSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['province']).toBeDefined();
  });

  it('sanitizes and normalizes names', () => {
    const input = {
      name: '  John    Doe  ',
      email: 'john@example.com',
      province: 'ON',
    };
    const result = validateData(UserSchema, input);
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('John Doe');
  });
});

// ============================================================================
// Campaign Schema Tests
// ============================================================================

describe('CampaignSchema', () => {
  const validCampaign = {
    title: 'Improve Workplace Accessibility',
    summary: 'This campaign aims to improve workplace accessibility standards',
  };

  it('validates valid campaign', () => {
    const result = validateData(CampaignSchema, validCampaign);
    expect(result.success).toBe(true);
  });

  it('rejects title too short', () => {
    const invalid = { ...validCampaign, title: 'Hi' };
    const result = validateData(CampaignSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['title']).toBeDefined();
  });

  it('rejects summary too short', () => {
    const invalid = { ...validCampaign, summary: 'Short' };
    const result = validateData(CampaignSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['summary']).toBeDefined();
  });

  it('rejects HTML in summary', () => {
    const invalid = {
      ...validCampaign,
      summary: '<script>alert("xss")</script>' + validCampaign.summary,
    };
    const result = validateData(CampaignSchema, invalid);
    expect(result.success).toBe(true); // Should still pass, but HTML stripped
    if (result.data) {
      expect(result.data.summary).not.toContain('<script>');
    }
  });

  it('validates email if provided', () => {
    const invalid = { ...validCampaign, contactEmail: 'invalid-email' };
    const result = validateData(CampaignSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['contactEmail']).toBeDefined();
  });

  it('validates goal as positive integer', () => {
    const invalid = { ...validCampaign, goal: -5 };
    const result = validateData(CampaignSchema, invalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Event Schema Tests
// ============================================================================

describe('EventSchema', () => {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);

  const validEvent = {
    title: 'Accessibility Workshop',
    date: futureDate,
    startTime: '14:00',
  };

  it('validates valid event', () => {
    const result = validateData(EventSchema, validEvent);
    expect(result.success).toBe(true);
  });

  it('rejects past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const invalid = { ...validEvent, date: pastDate };
    const result = validateData(EventSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['date']).toBeDefined();
  });

  it('rejects invalid time format', () => {
    const invalid = { ...validEvent, startTime: '25:00' };
    const result = validateData(EventSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['startTime']).toBeDefined();
  });

  it('validates capacity as positive integer', () => {
    const invalid = { ...validEvent, capacity: 0 };
    const result = validateData(EventSchema, invalid);
    expect(result.success).toBe(false);
  });

  it('validates virtual link URL format', () => {
    const invalid = {
      ...validEvent,
      isVirtual: true,
      virtualLink: 'not-a-url',
    };
    const result = validateData(EventSchema, invalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Letter Schema Tests
// ============================================================================

describe('LetterSchema', () => {
  const validLetter = {
    type: 'workplace-accommodation',
    subject: 'Request for Workplace Accommodations',
    body: 'This is a comprehensive letter requesting workplace accommodations for my disability.',
  };

  it('validates valid letter', () => {
    const result = validateData(LetterSchema, validLetter);
    expect(result.success).toBe(true);
  });

  it('rejects body too short', () => {
    const invalid = { ...validLetter, body: 'Short' };
    const result = validateData(LetterSchema, invalid);
    expect(result.success).toBe(false);
    expect(result.errors['body']).toBeDefined();
  });

  it('rejects HTML in body', () => {
    const invalid = {
      ...validLetter,
      body: '<script>alert("xss")</script>' + validLetter.body,
    };
    const result = validateData(LetterSchema, invalid);
    expect(result.success).toBe(true);
    if (result.data) {
      expect(result.data.body).not.toContain('<script>');
    }
  });

  it('validates attachment count', () => {
    const invalid = {
      ...validLetter,
      attachments: Array(15).fill({
        name: 'file.pdf',
        type: 'application/pdf',
        size: 1024,
        url: 'http://example.com/file.pdf',
      }),
    };
    const result = validateData(LetterSchema, invalid);
    expect(result.success).toBe(false);
  });

  it('validates attachment sizes', () => {
    const invalid = {
      ...validLetter,
      attachments: [
        {
          name: 'large.pdf',
          type: 'application/pdf',
          size: 30 * 1024 * 1024, // 30MB, too large
          url: 'http://example.com/large.pdf',
        },
      ],
    };
    const result = validateData(LetterSchema, invalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Medication Schema Tests
// ============================================================================

describe('MedicationSchema', () => {
  const validMedication = {
    name: 'Ibuprofen',
    dosage: '200mg',
    frequency: 'Twice daily',
    times: ['08:00', '20:00'],
  };

  it('validates valid medication', () => {
    const result = validateData(MedicationSchema, validMedication);
    expect(result.success).toBe(true);
  });

  it('rejects invalid time format', () => {
    const invalid = { ...validMedication, times: ['25:00'] };
    const result = validateData(MedicationSchema, invalid);
    expect(result.success).toBe(false);
  });

  it('rejects end date before start date', () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1);
    const invalid = { ...validMedication, startDate, endDate };
    const result = validateData(MedicationSchema, invalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Settings Schema Tests
// ============================================================================

describe('SettingsSchema', () => {
  const validSettings = {
    userId: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'John Doe',
    email: 'john@example.com',
  };

  it('validates valid settings', () => {
    const result = validateData(SettingsSchema, validSettings);
    expect(result.success).toBe(true);
  });

  it('validates language enum', () => {
    const invalid = { ...validSettings, language: 'invalid' };
    const result = validateData(SettingsSchema, invalid);
    expect(result.success).toBe(false);
  });

  it('validates theme enum', () => {
    const invalid = { ...validSettings, theme: 'invalid' };
    const result = validateData(SettingsSchema, invalid);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Profile Schema Tests
// ============================================================================

describe('ProfileSchema', () => {
  const validProfile = {
    name: 'Jane Smith',
    email: 'jane@example.com',
    province: 'BC',
  };

  it('validates valid profile', () => {
    const result = validateData(ProfileSchema, validProfile);
    expect(result.success).toBe(true);
  });

  it('validates energy patterns', () => {
    const valid = {
      ...validProfile,
      energyPatterns: {
        morning: 'high',
        afternoon: 'medium',
        evening: 'low',
      },
    };
    const result = validateData(ProfileSchema, valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid energy levels', () => {
    const invalid = {
      ...validProfile,
      energyPatterns: {
        morning: 'invalid',
        afternoon: 'medium',
        evening: 'low',
      },
    };
    const result = validateData(ProfileSchema, invalid);
    expect(result.success).toBe(false);
  });
});
