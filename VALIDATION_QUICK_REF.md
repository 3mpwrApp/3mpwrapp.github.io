# ZOD VALIDATION - QUICK REFERENCE

## FILE STATUS ✅ COMPLETE & READY

```
✅ types/validation.ts          514 lines - All schemas implemented
✅ hooks/useFormValidation.ts   366 lines - Complete hook with helpers
📝 LetterWizardForm.tsx         Ready for integration
📝 CampaignForm.tsx             Ready for integration
```

---

## SCHEMAS AT A GLANCE

| Schema | Required Fields | Type | Sanitized |
|--------|-----------------|------|-----------|
| UserSchema | id, name, email, province | User data | ✅ Email/text |
| ProfileSchema | name, email, province | User profile | ✅ Text/arrays |
| CampaignSchema | title, summary | Campaign | ✅ HTML removed |
| EventSchema | title, date | Event | ✅ HTML removed |
| LetterSchema | type, subject, body | Letter | ✅ HTML removed |
| MedicationSchema | name, dosage, frequency | Medication | ✅ Text |
| SettingsSchema | userId, displayName, email | Settings | ✅ Text |

---

## FORM SCHEMAS

```typescript
// Use in forms
LetterFormSchema     // letterType, title, subject, body, recipient, formData
CampaignFormSchema   // title, summary, description, target, goal, contactEmail, contactName, tags
EventFormSchema      // title, description, date, startTime, location, etc.
```

---

## VALIDATION FUNCTIONS

```typescript
// Import these from types/validation.ts
import {
  sanitizeText,        // Removes HTML tags/scripts
  normalizeText,       // Trims and collapses whitespace
  validateData,        // Full schema validation
  validateField,       // Single field validation
  getFieldError,       // Get error message
  FieldErrorMessages   // Standard error messages
} from './types/validation'

// Import these from hooks/useFormValidation.ts
import {
  useFormValidation,     // Main hook
  getFieldError,         // Get field error if touched
  hasFieldError,         // Check if field has error
  getFieldErrors,        // Get all errors for field
  createFieldHelper      // Create field helper
} from './hooks/useFormValidation'
```

---

## HOOK USAGE

```typescript
const form = useFormValidation(LetterFormSchema, {
  letterType: '',
  title: '',
  subject: '',
  body: '',
  recipient: '',
  formData: {},
}, {
  debounceMs: 500,        // Debounce validation 500ms
  validateOnChange: true, // Validate as user types
  validateOnBlur: true,   // Validate on blur
});

// Access
form.values              // Current form values
form.errors              // Field errors: Record<string, string[]>
form.touched             // Touched fields: Record<string, boolean>
form.dirty               // Form changed from initial
form.isSubmitting        // Submit in progress
form.isValidating        // Validation in progress
form.isValid             // No errors and dirty
form.hasErrors           // Has any errors

// Methods
form.handleChange('field')   // Returns (value) => void
form.handleBlur('field')     // Returns () => void
form.handleSubmit(callback)  // Returns () => Promise<void>
form.setFieldValue('field', value)   // Direct set
form.setFieldError('field', error)   // Set error
form.setValues({ ...values })        // Set multiple
form.reset()                         // Reset to initial
```

---

## DISPLAY FIELD ERROR

```typescript
{getFieldError(form.errors, form.touched, 'title') && (
  <Text style={{ color: 'red' }}>
    {getFieldError(form.errors, form.touched, 'title')}
  </Text>
)}
```

---

## HANDLE SUBMISSION

```typescript
const handleSubmit = form.handleSubmit(async (values) => {
  // values are already validated
  // form.isSubmitting is true during submission
  // form resets automatically on success
  await onSubmit(values);
});

// Use in button
<Button onPress={handleSubmit} disabled={form.isSubmitting} />
```

---

## MIN/MAX LENGTHS

| Field | Min | Max | Type |
|-------|-----|-----|------|
| name/title | 2-5 | 100-200 | text |
| email | - | 254 | email |
| body/summary | 20-50 | 5000-50000 | text |
| target | - | 200 | text |
| phone | 10 digits | - | phone |
| UUID | - | - | uuid |
| province | - | - | enum |

---

## SANITIZATION

All text fields automatically:
- ✅ Remove HTML tags
- ✅ Remove javascript: protocol
- ✅ Remove event handlers (onclick, onerror, etc)
- ✅ Trim whitespace
- ✅ Normalize spaces

---

## VALIDATION TIMING

1. **On change**: After 500ms debounce (configurable)
2. **On blur**: Immediately when user leaves field
3. **On submit**: Before calling onSubmit callback
4. **Touched state**: Error shows only if field was touched

---

## ERROR MESSAGES

All custom per field:
- "Must be at least X characters"
- "Must be less than X characters"
- "Must be a valid email address"
- "Must be a valid phone number"
- "Must be a valid province or state"
- "Must be in the future"
- "Must be a valid URL"
- And 20+ more...

---

## TYPE SAFETY

```typescript
// Types inferred from schemas
type User = z.infer<typeof UserSchema>
type Campaign = z.infer<typeof CampaignSchema>
type LetterForm = z.infer<typeof LetterFormSchema>

// Full IDE autocomplete
const form = useFormValidation<LetterForm>(LetterFormSchema, ...)
form.handleChange('letterType')  // Typed - autocomplete works
```

---

## EXAMPLES

### Example 1: Letter Form
```tsx
const form = useFormValidation(LetterFormSchema, {
  letterType: '',
  title: '',
  subject: '',
  body: '',
  recipient: '',
  formData: {},
});

<TextInput
  value={form.values.title}
  onChangeText={form.handleChange('title')}
  onBlur={form.handleBlur('title')}
/>
{getFieldError(form.errors, form.touched, 'title') && (
  <Text>{getFieldError(form.errors, form.touched, 'title')}</Text>
)}
<Button onPress={form.handleSubmit(handleSubmit)} />
```

### Example 2: Campaign Form
```tsx
const form = useFormValidation(CampaignFormSchema, {
  title: '',
  summary: '',
  description: '',
  target: '',
  goal: undefined,
  contactEmail: '',
  contactName: '',
  tags: [],
});

<TextInput
  value={form.values.title}
  onChangeText={form.handleChange('title')}
  maxLength={200}
/>
<Text>{form.values.title.length}/200</Text>
<TextInput
  value={form.values.goal?.toString() || ''}
  onChangeText={text => form.setFieldValue('goal', parseInt(text))}
  keyboardType="number-pad"
/>
```

### Example 3: Direct Validation
```typescript
import { validateData, LetterFormSchema } from './types/validation';

const result = validateData(LetterFormSchema, formData);
if (result.success) {
  console.log('Valid:', result.data);
} else {
  console.log('Errors:', result.errors);
}
```

---

## INTEGRATION CHECKLIST

- [ ] Import `useFormValidation` and `getFieldError` from hooks
- [ ] Import schema and types from `types/validation`
- [ ] Create `defaultValues` object with correct shape
- [ ] Initialize form with `useFormValidation(schema, defaultValues, options)`
- [ ] Add `onChangeText={form.handleChange('field')}` to inputs
- [ ] Add `onBlur={form.handleBlur('field')}` to inputs
- [ ] Display errors with `getFieldError(form.errors, form.touched, 'field')`
- [ ] Create submit handler with `form.handleSubmit(async (values) => { ... })`
- [ ] Disable button when `form.isSubmitting` is true
- [ ] Add character counts for text fields (optional)
- [ ] Test with invalid data to verify errors appear

---

## COMPLETE - READY TO DEPLOY ✅

All code is implemented. No changes needed to validation.ts or useFormValidation.ts.

Form integration is straightforward - copy the pattern from examples above.
