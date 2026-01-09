/**
 * Campaign Creation Form with Validation
 * 
 * Before: No validation, accepts any input
 * After: Full validation with real-time feedback
 */

import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { getFieldError, useFormValidation } from '../../hooks/useFormValidation';
import { useAppPalette } from '../../theme/usePalette';
import {
    CampaignFormSchema,
    validateData,
    type CampaignForm,
} from '../../types/validation';

interface CampaignFormProps {
  onSubmit: (values: CampaignForm) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Partial<CampaignForm>;
}

/**
 * Campaign Creation Form
 * 
 * BEFORE (CreateCampaignBox):
 * - Basic text validation only (title > 2, summary > 4)
 * - No validation on email, target, goal
 * - No HTML/XSS protection
 * - No character limits displayed
 * 
 * AFTER (with CampaignFormSchema):
 * - Full validation on all fields
 * - Email validation with sanitization
 * - HTML stripping from text fields
 * - Character counters
 * - Real-time field validation
 * - Better error messages
 */
function CampaignFormComponent({
  onSubmit,
  onCancel,
  initialValues,
}: CampaignFormProps) {
  const palette = useAppPalette();

  const defaultValues: CampaignForm = {
    title: initialValues?.title || '',
    summary: initialValues?.summary || '',
    description: initialValues?.description || '',
    target: initialValues?.target || '',
    goal: initialValues?.goal || undefined,
    contactEmail: initialValues?.contactEmail || '',
    contactName: initialValues?.contactName || '',
    tags: initialValues?.tags || [],
  };

  const form = useFormValidation(CampaignFormSchema, defaultValues, {
    debounceMs: 500,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const result = validateData(CampaignFormSchema, values);
      if (!result.success) {
        Alert.alert(
          'Validation Error',
          'Please fix the errors and try again'
        );
        return;
      }

      await onSubmit(values);
      form.reset();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create campaign');
    }
  });

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
        📢 Create a Campaign
      </Text>

      {/* Campaign Title */}
      <FormField
        label="Campaign Title *"
        hint="What is your campaign about?"
        value={form.values.title}
        onChangeText={form.handleChange('title')}
        onBlur={form.handleBlur('title')}
        maxLength={200}
        error={getFieldError(form.errors, form.touched, 'title')}
        characterCount={form.values.title.length}
        maxCharacters={200}
        palette={palette}
        accessibilityLabel="Campaign title"
      />

      {/* Campaign Summary */}
      <FormField
        label="Campaign Summary *"
        hint="Describe your campaign (20-5000 characters)"
        value={form.values.summary}
        onChangeText={form.handleChange('summary')}
        onBlur={form.handleBlur('summary')}
        maxLength={5000}
        multiline
        numberOfLines={6}
        error={getFieldError(form.errors, form.touched, 'summary')}
        characterCount={form.values.summary.length}
        maxCharacters={5000}
        palette={palette}
        accessibilityLabel="Campaign summary"
        accessibilityHint="Minimum 20 characters, HTML tags will be removed"
      />

      {/* Campaign Description */}
      <FormField
        label="Description (Optional)"
        hint="Additional details about your campaign"
        value={form.values.description || ''}
        onChangeText={form.handleChange('description')}
        onBlur={form.handleBlur('description')}
        maxLength={5000}
        multiline
        numberOfLines={4}
        error={getFieldError(form.errors, form.touched, 'description')}
        palette={palette}
        accessibilityLabel="Campaign description"
      />

      {/* Target */}
      <FormField
        label="Target (Optional)"
        hint="e.g., Ministry of Labour, Local Municipality"
        value={form.values.target || ''}
        onChangeText={form.handleChange('target')}
        onBlur={form.handleBlur('target')}
        maxLength={200}
        error={getFieldError(form.errors, form.touched, 'target')}
        palette={palette}
        accessibilityLabel="Campaign target"
      />

      {/* Goal */}
      <FormField
        label="Goal (Optional)"
        hint="Number of supporters needed"
        value={form.values.goal?.toString() || ''}
        onChangeText={(text) =>
          form.setFieldValue('goal', text ? parseInt(text, 10) : undefined)
        }
        onBlur={form.handleBlur('goal')}
        keyboardType="number-pad"
        error={getFieldError(form.errors, form.touched, 'goal')}
        palette={palette}
        accessibilityLabel="Campaign goal"
      />

      {/* Contact Name */}
      <FormField
        label="Contact Name (Optional)"
        hint="Your name"
        value={form.values.contactName || ''}
        onChangeText={form.handleChange('contactName')}
        onBlur={form.handleBlur('contactName')}
        maxLength={100}
        error={getFieldError(form.errors, form.touched, 'contactName')}
        palette={palette}
        accessibilityLabel="Contact name"
      />

      {/* Contact Email */}
      <FormField
        label="Contact Email (Optional)"
        hint="Your email for campaign updates"
        value={form.values.contactEmail || ''}
        onChangeText={form.handleChange('contactEmail')}
        onBlur={form.handleBlur('contactEmail')}
        keyboardType="email-address"
        autoCapitalize="none"
        error={getFieldError(form.errors, form.touched, 'contactEmail')}
        palette={palette}
        accessibilityLabel="Contact email"
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
              : '✅ Campaign is ready to submit'}
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
            accessibilityLabel="Cancel campaign creation"
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
          accessibilityLabel={
            form.isSubmitting ? 'Creating campaign' : 'Create campaign'
          }
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
            {form.isSubmitting ? '⏳ Creating...' : '🚀 Create Campaign'}
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
  hint?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur: () => void;
  error?: string | null;
  palette: any;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  characterCount?: number;
  maxCharacters?: number;
}

function FormField({
  label,
  hint,
  value,
  onChangeText,
  onBlur,
  error,
  palette,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  accessibilityLabel,
  accessibilityHint,
  characterCount,
  maxCharacters,
}: FormFieldProps) {
  // Check if field is required from label
  const _isRequired = label.endsWith('*');
  const isError = !!error;
  const isWarning =
    characterCount && maxCharacters
      ? (characterCount / maxCharacters) * 100 > 80
      : false;

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

      {hint && (
        <Text
          style={{
            fontSize: 12,
            color: palette.muted,
            marginBottom: 6,
          }}
        >
          {hint}
        </Text>
      )}

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
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={palette.muted}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      />

      {characterCount !== undefined && maxCharacters !== undefined && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 6,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: isWarning ? palette.warning : palette.muted,
            }}
          >
            {characterCount} / {maxCharacters}
          </Text>

          <View
            style={{
              flex: 1,
              height: 3,
              backgroundColor: palette.muted + '30',
              borderRadius: 2,
              marginLeft: 8,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.min((characterCount / maxCharacters) * 100, 100)}%`,
                backgroundColor:
                  (characterCount / maxCharacters) * 100 > 95
                    ? palette.error
                    : isWarning
                      ? palette.warning
                      : palette.primary,
              }}
            />
          </View>
        </View>
      )}

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

export default CampaignFormComponent;
