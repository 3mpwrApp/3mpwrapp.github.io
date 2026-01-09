/**
 * Comprehensive Zod Validation Schemas
 * Centralized input validation for all forms in the app
 * 
 * Features:
 * - Type-safe form validation
 * - Consistent error messages across the app
 * - User-friendly error feedback
 * - HTML/script sanitization
 * - Field-level validation rules
 */

import { z } from 'zod';

// ============================================================================
// Sanitization Utilities
// ============================================================================

/**
 * Remove HTML tags and scripts from text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize and normalize whitespace
 */
export function normalizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Safe UUID validation with optional format
 */
const UUIDSchema = z.string()
  .uuid('Must be a valid UUID')
  .or(z.string().regex(/^[a-zA-Z0-9_-]{20,}$/, 'Must be a valid identifier'));

/**
 * Email validation
 */
const EmailSchema = z.string()
  .email('Must be a valid email address')
  .toLowerCase()
  .transform(sanitizeText);

/**
 * Province/State validation (Canada + US territories)
 */
const ProvinceValues = [
  'ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU',
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
  'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
  'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const;

const ProvinceSchema = z.enum(ProvinceValues).describe('Province or state code');

/**
 * Phone number validation (North America)
 */
const PhoneSchema = z.string()
  .regex(/^[+]?[0-9\s()-]+$/, 'Must be a valid phone number')
  .refine(
    (val) => val.replace(/\D/g, '').length >= 10,
    'Phone number must have at least 10 digits'
  );

// ============================================================================
// USER & PROFILE SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: UUIDSchema.optional().describe('User ID'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(normalizeText)
    .refine(
      (val) => /^[a-zA-Z\s'-]+$/.test(val),
      'Name can only contain letters, spaces, hyphens, and apostrophes'
    ),
  email: EmailSchema.describe('User email address'),
  province: ProvinceSchema.describe('Province or state'),
  phone: PhoneSchema.optional().describe('Phone number'),
  role: z.enum(['pwd', 'supporter', 'ally', 'family']).optional()
    .describe('User role'),
  avatar: z.string().url().optional().describe('Avatar URL'),
  dateOfBirth: z.coerce.date().optional()
    .refine(
      (date) => date ? date < new Date() && date.getFullYear() >= 1920 : true,
      'Date of birth must be valid'
    ),
});

export type User = z.infer<typeof UserSchema>;

export const ProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .transform(normalizeText),
  email: EmailSchema,
  province: ProvinceSchema,
  phone: PhoneSchema.optional(),
  role: z.enum(['pwd', 'supporter', 'ally', 'family']).optional(),
  disabilityCategories: z.array(z.string()).default([])
    .describe('Selected disability categories'),
  symptomsToTrack: z.array(z.string()).default([])
    .describe('Symptoms user wants to track'),
  accommodations: z.array(z.string()).default([])
    .describe('Required accommodations'),
  energyPatterns: z.object({
    morning: z.enum(['low', 'medium', 'high']).nullable().default(null),
    afternoon: z.enum(['low', 'medium', 'high']).nullable().default(null),
    evening: z.enum(['low', 'medium', 'high']).nullable().default(null),
  }).optional(),
  preferredLanguage: z.string().default('en'),
});

export type Profile = z.infer<typeof ProfileSchema>;

// ============================================================================
// CAMPAIGN & ADVOCACY SCHEMAS
// ============================================================================

export const CampaignSchema = z.object({
  id: UUIDSchema.optional(),
  title: z.string()
    .min(5, 'Campaign title must be at least 5 characters')
    .max(200, 'Campaign title must be less than 200 characters')
    .transform((val) => sanitizeText(normalizeText(val)))
    .refine(
      (val) => val.length >= 5,
      'Campaign title is too short after sanitization'
    ),
  summary: z.string()
    .min(20, 'Campaign summary must be at least 20 characters')
    .max(5000, 'Campaign summary must be less than 5000 characters')
    .transform(sanitizeText)
    .refine(
      (val) => val.length >= 20,
      'Campaign summary is too short after sanitization'
    ),
  description: z.string().optional()
    .transform((val) => val ? sanitizeText(val) : undefined),
  target: z.string()
    .max(200, 'Target must be less than 200 characters')
    .optional()
    .transform((val) => val ? sanitizeText(val) : undefined),
  goal: z.coerce.number()
    .int('Goal must be a whole number')
    .min(1, 'Goal must be at least 1')
    .optional(),
  contactEmail: EmailSchema.optional(),
  contactName: z.string()
    .max(100, 'Contact name must be less than 100 characters')
    .optional()
    .transform((val) => val ? normalizeText(val) : undefined),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft'),
  tags: z.array(z.string().max(50)).default([]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const EventSchema = z.object({
  id: UUIDSchema.optional(),
  title: z.string()
    .min(3, 'Event title must be at least 3 characters')
    .max(200, 'Event title must be less than 200 characters')
    .transform((val) => sanitizeText(normalizeText(val))),
  description: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional()
    .transform((val) => val ? sanitizeText(val) : undefined),
  date: z.coerce.date()
    .refine(
      (date) => date > new Date(),
      'Event date must be in the future'
    ),
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in HH:MM format (00:00-23:59)')
    .optional(),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'End time must be in HH:MM format (00:00-23:59)')
    .optional(),
  location: z.string()
    .max(300, 'Location must be less than 300 characters')
    .optional()
    .transform((val) => val ? sanitizeText(val) : undefined),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    province: ProvinceSchema.optional(),
    postalCode: z.string()
      .regex(/^[A-Za-z0-9\s-]{3,10}$/, 'Invalid postal code')
      .optional(),
    country: z.string().default('Canada'),
  }).optional(),
  capacity: z.coerce.number()
    .int('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1')
    .optional(),
  isVirtual: z.boolean().default(false),
  virtualLink: z.string().url('Must be a valid URL').optional()
    .refine(
      (url) => !url || (url.includes('zoom') || url.includes('teams') || url.includes('meet')),
      'Virtual link must be from a recognized video platform'
    ),
  organizerEmail: EmailSchema.optional(),
  organizerName: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).default([]),
  imageUrl: z.string().url().optional(),
});

export type Event = z.infer<typeof EventSchema>;

// ============================================================================
// LETTER & ADVOCACY SCHEMAS
// ============================================================================

export const LetterSchema = z.object({
  id: UUIDSchema.optional(),
  type: z.string()
    .min(1, 'Letter type is required')
    .describe('Letter template type'),
  recipient: z.string()
    .min(3, 'Recipient name must be at least 3 characters')
    .max(200, 'Recipient name must be less than 200 characters')
    .transform(normalizeText)
    .optional(),
  recipientRole: z.string().optional()
    .describe('Recipient role/title'),
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(500, 'Subject must be less than 500 characters')
    .transform((val) => sanitizeText(normalizeText(val))),
  body: z.string()
    .min(50, 'Letter body must be at least 50 characters')
    .max(50000, 'Letter body must be less than 50000 characters')
    .transform(sanitizeText)
    .refine(
      (val) => val.length >= 50,
      'Letter body is too short after sanitization'
    ),
  attachments: z.array(z.object({
    name: z.string(),
    type: z.string(),
    size: z.number(),
    url: z.string().url(),
  })).default([])
    .refine(
      (attachments) => attachments.length <= 10,
      'Maximum 10 attachments allowed'
    )
    .refine(
      (attachments) => attachments.every(a => a.size <= 25 * 1024 * 1024), // 25MB
      'Each attachment must be less than 25MB'
    ),
  formatting: z.object({
    font: z.enum(['Arial', 'Times New Roman', 'Calibri']).default('Arial'),
    fontSize: z.enum(['10', '11', '12', '13', '14']).default('12'),
    spacing: z.enum(['single', '1.5', 'double']).default('1.5'),
  }).optional(),
  draftSavedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date().optional(),
});

export type Letter = z.infer<typeof LetterSchema>;

// ============================================================================
// MEDICATION & HEALTH SCHEMAS
// ============================================================================

export const MedicationSchema = z.object({
  id: UUIDSchema.optional(),
  name: z.string()
    .min(2, 'Medication name must be at least 2 characters')
    .max(200, 'Medication name must be less than 200 characters')
    .transform(normalizeText),
  dosage: z.string()
    .min(1, 'Dosage is required')
    .max(100, 'Dosage must be less than 100 characters')
    .transform(normalizeText)
    .describe('e.g., 10mg, 5ml'),
  frequency: z.string()
    .min(1, 'Frequency is required')
    .max(200, 'Frequency must be less than 200 characters')
    .describe('e.g., Twice daily, Every 6 hours'),
  times: z.array(z.string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Times must be in HH:MM format with valid hours (00-23) and minutes (00-59)')
  )
    .default([])
    .describe('Specific times to take medication'),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .transform((val) => val ? sanitizeText(val) : undefined),
  prescribedBy: z.string()
    .max(200, 'Prescriber name must be less than 200 characters')
    .optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sideEffects: z.array(z.string()).default([]),
  enabled: z.boolean().default(true),
}).refine(
  (data) => !data.endDate || !data.startDate || data.endDate > data.startDate,
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type Medication = z.infer<typeof MedicationSchema>;

// ============================================================================
// SETTINGS & PREFERENCES SCHEMAS
// ============================================================================

export const NotificationPreferencesSchema = z.object({
  push: z.boolean().default(true),
  email: z.boolean().default(true),
  sms: z.boolean().default(false),
  inApp: z.boolean().default(true),
  frequency: z.enum(['instant', 'daily', 'weekly', 'never']).default('weekly'),
  campaigns: z.boolean().default(true),
  events: z.boolean().default(true),
  community: z.boolean().default(true),
  wellness: z.boolean().default(true),
  resources: z.boolean().default(true),
  quietHours: z.object({
    enabled: z.boolean().default(false),
    start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  }).optional(),
});

export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

export const SettingsSchema = z.object({
  userId: UUIDSchema,
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(100, 'Display name must be less than 100 characters')
    .transform(normalizeText),
  email: EmailSchema,
  language: z.enum(['en', 'fr', 'es', 'de', 'it']).default('en'),
  theme: z.enum(['light', 'dark', 'auto']).default('auto'),
  fontSize: z.enum(['small', 'normal', 'large', 'xlarge']).default('normal'),
  accessibility: z.object({
    highContrast: z.boolean().default(false),
    reduceMotion: z.boolean().default(false),
    screenReader: z.boolean().default(false),
    simplerLanguage: z.boolean().default(false),
    largerText: z.boolean().default(false),
  }).optional(),
  notifications: NotificationPreferencesSchema.optional(),
  privacy: z.object({
    profilePublic: z.boolean().default(false),
    showInDirectory: z.boolean().default(false),
    allowAnalytics: z.boolean().default(true),
    allowMarketing: z.boolean().default(false),
  }).optional(),
  data: z.object({
    autoBackup: z.boolean().default(true),
    cloudSync: z.boolean().default(false),
    deleteInactiveData: z.boolean().default(false),
  }).optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

// ============================================================================
// COMPOUND/FORM GROUP SCHEMAS
// ============================================================================

/**
 * Combined form for letter creation with all fields
 */
export const LetterFormSchema = z.object({
  letterType: z.string().min(1, 'Please select a letter type'),
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .transform(normalizeText),
  recipient: z.string()
    .min(2, 'Recipient must be specified')
    .max(200)
    .optional(),
  subject: z.string()
    .min(3, 'Subject must be at least 3 characters')
    .max(500)
    .transform(sanitizeText),
  body: z.string()
    .min(50, 'Letter body must be at least 50 characters')
    .max(50000)
    .transform(sanitizeText),
  formData: z.record(z.string(), z.any()).optional(),
});

export type LetterForm = z.infer<typeof LetterFormSchema>;

/**
 * Event creation form with validation
 */
export const EventFormSchema = EventSchema.extend({
  startDate: z.coerce.date().describe('Event date'),
  startTime: z.string()
    .regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
});

export type EventForm = z.infer<typeof EventFormSchema>;

/**
 * Campaign creation form
 */
export const CampaignFormSchema = CampaignSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export type CampaignForm = z.infer<typeof CampaignFormSchema>;

// ============================================================================
// VALIDATION RESULT TYPES
// ============================================================================

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: Record<string, string[]>;
}

/**
 * Validates data against a schema and returns user-friendly error messages
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: {},
    };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.');
    if (!errors[path]) {
      errors[path] = [];
    }
    errors[path].push(issue.message);
  }

  return {
    success: false,
    errors,
  };
}

/**
 * Validate a single field
 */
export function validateField<T extends z.ZodSchema>(
  schema: T,
  value: unknown
): { valid: boolean; error?: string } {
  const result = schema.safeParse(value);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Invalid value',
  };
}

// ============================================================================
// FORM FIELD ERROR MESSAGES
// ============================================================================

export const FieldErrorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  province: 'Please select a valid province or state',
  minLength: (length: number) => `Must be at least ${length} characters`,
  maxLength: (length: number) => `Must be less than ${length} characters`,
  url: 'Must be a valid URL',
  date: 'Must be a valid date',
  number: 'Must be a valid number',
  html: 'HTML tags are not allowed',
  fileSize: (sizeMB: number) => `File must be less than ${sizeMB}MB`,
  fileType: (types: string) => `File must be one of: ${types}`,
};
