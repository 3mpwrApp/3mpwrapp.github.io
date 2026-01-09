/**
 * User Profile Form with Validation
 * Replaces manual form handling in profile-editor.tsx
 * 
 * Before: No validation, manual state management
 * After: Zod validation with real-time feedback
 */

import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { getFieldError, useFormValidation } from '../../hooks/useFormValidation';
import { useAppPalette } from '../../theme/usePalette';
import {
    ProfileSchema,
    validateData,
    type Profile,
} from '../../types/validation';

interface ProfileFormProps {
  onSubmit: (values: Profile) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Partial<Profile>;
}

/**
 * Profile Form
 * 
 * BEFORE (profile-editor.tsx):
 * - Manual state for 20+ fields
 * - No field-level validation
 * - No error display
 * - Complex checkbox arrays
 * 
 * AFTER (with ProfileSchema):
 * - Single schema validation
 * - Field-level errors
 * - Consistent error messages
 * - Real-time validation
 */
export default function ProfileForm({
  onSubmit,
  onCancel,
  initialValues,
}: ProfileFormProps) {
  const palette = useAppPalette();

  const defaultValues: Profile = {
    name: initialValues?.name || '',
    email: initialValues?.email || '',
    province: initialValues?.province || 'ON',
    phone: initialValues?.phone || '',
    role: initialValues?.role || 'pwd',
    disabilityCategories: initialValues?.disabilityCategories || [],
    symptomsToTrack: initialValues?.symptomsToTrack || [],
    accommodations: initialValues?.accommodations || [],
    energyPatterns: initialValues?.energyPatterns || {
      morning: null,
      afternoon: null,
      evening: null,
    },
    preferredLanguage: initialValues?.preferredLanguage || 'en',
  };

  const form = useFormValidation(ProfileSchema, defaultValues, {
    debounceMs: 500,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const result = validateData(ProfileSchema, values);
      if (!result.success) {
        Alert.alert('Validation Error', 'Please fix the errors and try again');
        return;
      }

      await onSubmit(values);
      form.reset();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    }
  });

  const ENERGY_LEVELS = ['low', 'medium', 'high'] as const;
  const ROLES = [
    { value: 'pwd', label: 'Person with Disability' },
    { value: 'supporter', label: 'Supporter' },
    { value: 'ally', label: 'Ally' },
    { value: 'family', label: 'Family Member' },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: palette.background,
        padding: 16,
      }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: '700',
          marginBottom: 16,
          color: palette.text,
        }}
      >
        👤 Edit Profile
      </Text>

      {/* Name */}
      <FormField
        label="Full Name *"
        value={form.values.name}
        onChangeText={form.handleChange('name')}
        onBlur={form.handleBlur('name')}
        maxLength={100}
        error={getFieldError(form.errors, form.touched, 'name')}
        palette={palette}
        accessibilityLabel="Full name"
      />

      {/* Email */}
      <FormField
        label="Email *"
        value={form.values.email}
        onChangeText={form.handleChange('email')}
        onBlur={form.handleBlur('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={getFieldError(form.errors, form.touched, 'email')}
        palette={palette}
        accessibilityLabel="Email address"
      />

      {/* Phone */}
      <FormField
        label="Phone (Optional)"
        value={form.values.phone || ''}
        onChangeText={form.handleChange('phone')}
        onBlur={form.handleBlur('phone')}
        keyboardType="phone-pad"
        error={getFieldError(form.errors, form.touched, 'phone')}
        palette={palette}
        accessibilityLabel="Phone number"
      />

      {/* Province */}
      <FormField
        label="Province/State *"
        value={form.values.province}
        onChangeText={form.handleChange('province')}
        onBlur={form.handleBlur('province')}
        error={getFieldError(form.errors, form.touched, 'province')}
        palette={palette}
        accessibilityLabel="Province or state"
      />

      {/* Role Selection */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 8,
            color: palette.text,
          }}
        >
          Role
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: palette.muted,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          {ROLES.map((roleOption, idx) => (
            <A11yPressable
              key={roleOption.value}
              onPress={() => form.setFieldValue('role', roleOption.value)}
              style={{
                padding: 12,
                backgroundColor:
                  form.values.role === roleOption.value
                    ? palette.primary + '20'
                    : palette.surface,
                borderBottomWidth: idx < ROLES.length - 1 ? 1 : 0,
                borderBottomColor: palette.muted,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              accessibilityRole="radio"
              accessibilityLabel={roleOption.label}
              accessibilityState={{ selected: form.values.role === roleOption.value }}
            >
              <Text
                style={{
                  color: palette.text,
                  fontWeight:
                    form.values.role === roleOption.value ? '700' : '400',
                }}
              >
                {roleOption.label}
              </Text>
              {form.values.role === roleOption.value && (
                <Text style={{ fontSize: 18, color: palette.primary }}>✓</Text>
              )}
            </A11yPressable>
          ))}
        </View>
      </View>

      {/* Energy Patterns */}
      <View
        style={{
          padding: 12,
          backgroundColor: palette.surface,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 12,
            color: palette.text,
          }}
        >
          Energy Patterns
        </Text>

        {['morning', 'afternoon', 'evening'].map((period) => (
          <View key={period} style={{ marginBottom: 12 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: '500',
                marginBottom: 6,
                color: palette.text,
                textTransform: 'capitalize',
              }}
            >
              {period}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
              }}
            >
              {ENERGY_LEVELS.map((level) => (
                <A11yPressable
                  key={level}
                  onPress={() => {
                    form.setFieldValue('energyPatterns', {
                      ...form.values.energyPatterns,
                      [period]: level,
                    });
                  }}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 6,
                    borderWidth: 2,
                    borderColor:
                      form.values.energyPatterns?.[
                        period as 'morning' | 'afternoon' | 'evening'
                      ] === level
                        ? palette.primary
                        : palette.muted,
                    backgroundColor:
                      form.values.energyPatterns?.[
                        period as 'morning' | 'afternoon' | 'evening'
                      ] === level
                        ? palette.primary + '20'
                        : palette.background,
                    alignItems: 'center',
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={`${period} energy ${level}`}
                  accessibilityState={{
                    selected:
                      form.values.energyPatterns?.[
                        period as 'morning' | 'afternoon' | 'evening'
                      ] === level,
                  }}
                >
                  <Text
                    style={{
                      color:
                        form.values.energyPatterns?.[
                          period as 'morning' | 'afternoon' | 'evening'
                        ] === level
                          ? palette.primary
                          : palette.text,
                      fontWeight:
                        form.values.energyPatterns?.[
                          period as 'morning' | 'afternoon' | 'evening'
                        ] === level
                          ? '700'
                          : '500',
                      textTransform: 'capitalize',
                    }}
                  >
                    {level}
                  </Text>
                </A11yPressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Language */}
      <FormField
        label="Preferred Language"
        value={form.values.preferredLanguage}
        onChangeText={form.handleChange('preferredLanguage')}
        onBlur={form.handleBlur('preferredLanguage')}
        palette={palette}
        accessibilityLabel="Preferred language"
      />

      {/* Validation Status */}
      {form.dirty && (
        <View
          style={{
            padding: 12,
            marginVertical: 16,
            borderRadius: 8,
            backgroundColor: form.hasErrors
              ? palette.error + '20'
              : palette.success + '20',
            borderLeftWidth: 4,
            borderLeftColor: form.hasErrors ? palette.error : palette.success,
          }}
        >
          <Text
            style={{
              color: form.hasErrors ? palette.error : palette.success,
              fontWeight: '600',
              fontSize: 14,
            }}
          >
            {form.hasErrors
              ? `❌ ${Object.keys(form.errors).length} error(s) to fix`
              : '✅ Profile is valid'}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {onCancel && (
          <A11yPressable
            onPress={onCancel}
            style={[styles.button, { backgroundColor: palette.muted + '40' }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel profile editing"
          >
            <Text style={{ color: palette.text, fontWeight: '600', fontSize: 16 }}>
              Cancel
            </Text>
          </A11yPressable>
        )}

        <A11yPressable
          onPress={handleSubmit}
          disabled={!form.dirty || form.hasErrors || form.isSubmitting}
          style={[
            styles.button,
            {
              backgroundColor:
                !form.dirty || form.hasErrors
                  ? palette.muted + '60'
                  : palette.primary,
              opacity: form.isSubmitting ? 0.7 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={form.isSubmitting ? 'Saving profile' : 'Save profile'}
          accessibilityState={{
            disabled: !form.dirty || form.hasErrors,
          }}
        >
          <Text
            style={{
              color: palette.onPrimary,
              fontWeight: '700',
              fontSize: 16,
            }}
          >
            {form.isSubmitting ? '⏳ Saving...' : '💾 Save Profile'}
          </Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Reusable Form Field Component
// ============================================================================

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string | null;
  palette: any;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  accessibilityLabel?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  palette,
  multiline = false,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  accessibilityLabel,
}: FormFieldProps) {
  const isError = !!error;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 4,
          color: palette.text,
        }}
      >
        {label}
      </Text>

      <TextInput
        style={[
          styles.input,
          multiline && styles.multilineInput,
          {
            borderColor: isError ? palette.error : palette.muted,
            color: palette.text,
            backgroundColor: palette.surface,
            borderWidth: isError ? 2 : 1,
          },
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        multiline={multiline}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={palette.muted}
        accessible
        accessibilityLabel={accessibilityLabel}
      />

      {error && (
        <Text
          style={{
            color: palette.error,
            fontSize: 12,
            marginTop: 6,
            fontWeight: '500',
          }}
          role="alert"
        >
          ⚠️ {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
