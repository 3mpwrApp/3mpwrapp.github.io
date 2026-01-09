/* eslint-disable no-restricted-syntax -- Wizard UI requires inline colors for step indicators */
/**
 * Letter Wizard Form Validation Wrapper
 * Integrates Zod validation with LetterWizardContent
 * 
 * Before: No validation, accepts any input
 * After: Full validation with error messages
 */

import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { getFieldError, useFormValidation } from '../../hooks/useFormValidation';
import { useAppPalette } from '../../theme/usePalette';
import {
    LetterFormSchema,
    validateData,
    type LetterForm
} from '../../types/validation';

interface LetterWizardFormProps {
  initialValues?: Partial<LetterForm>;
  onSubmit: (values: LetterForm) => Promise<void> | void;
  onCancel?: () => void;
}

/**
 * Letter Wizard Form with Validation
 * 
 * BEFORE (no validation):
 * - Text fields accept any input
 * - No character limits enforced
 * - HTML/scripts allowed
 * - No error feedback
 * 
 * AFTER (with validation):
 * - Real-time validation with debouncing
 * - Field-level error messages
 * - HTML/script sanitization
 * - Character count display
 * - Submit validation
 */
export default function LetterWizardForm({
  initialValues,
  onSubmit,
  onCancel,
}: LetterWizardFormProps) {
  const palette = useAppPalette();

  const defaultValues: LetterForm = {
    letterType: initialValues?.letterType || '',
    title: initialValues?.title || '',
    subject: initialValues?.subject || '',
    body: initialValues?.body || '',
    recipient: initialValues?.recipient || '',
    formData: initialValues?.formData || {},
  };

  const form = useFormValidation(LetterFormSchema, defaultValues, {
    debounceMs: 500,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleFormSubmit = form.handleSubmit(async (values) => {
    try {
      // Validate before submission
      const result = validateData(LetterFormSchema, values);
      if (!result.success) {
        Alert.alert('Validation Error', 'Please fix the errors and try again');
        return;
      }

      await onSubmit(values);
      form.reset();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save letter');
    }
  });

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: palette.background,
        padding: 16,
      }}
      scrollEnabled={true}
    >
      {/* Letter Type Selection */}
      <FormSection title="Letter Type">
        <TextInput
          style={[styles.input, { borderColor: palette.muted, color: palette.text }]}
          placeholder="Select letter type..."
          placeholderTextColor={palette.muted}
          value={form.values.letterType}
          onChangeText={form.handleChange('letterType')}
          onBlur={form.handleBlur('letterType')}
          accessibilityLabel="Letter type"
          accessibilityHint="Choose the type of letter to create"
        />
        {getFieldError(form.errors, form.touched, 'letterType') && (
          <ErrorText
            text={getFieldError(form.errors, form.touched, 'letterType')!}
            palette={palette}
          />
        )}
      </FormSection>

      {/* Title Field */}
      <FormSection title="Title">
        <TextInput
          style={[styles.input, { borderColor: palette.muted, color: palette.text }]}
          placeholder="Give your letter a title..."
          placeholderTextColor={palette.muted}
          value={form.values.title}
          onChangeText={form.handleChange('title')}
          onBlur={form.handleBlur('title')}
          maxLength={200}
          accessibilityLabel="Letter title"
        />
        <CharacterCount
          current={form.values.title.length}
          max={200}
          palette={palette}
        />
        {getFieldError(form.errors, form.touched, 'title') && (
          <ErrorText
            text={getFieldError(form.errors, form.touched, 'title')!}
            palette={palette}
          />
        )}
      </FormSection>

      {/* Recipient Field (Optional) */}
      <FormSection title="Recipient (Optional)">
        <TextInput
          style={[styles.input, { borderColor: palette.muted, color: palette.text }]}
          placeholder="Who is this letter to?"
          placeholderTextColor={palette.muted}
          value={form.values.recipient || ''}
          onChangeText={form.handleChange('recipient')}
          onBlur={form.handleBlur('recipient')}
          maxLength={200}
          accessibilityLabel="Letter recipient"
        />
        {getFieldError(form.errors, form.touched, 'recipient') && (
          <ErrorText
            text={getFieldError(form.errors, form.touched, 'recipient')!}
            palette={palette}
          />
        )}
      </FormSection>

      {/* Subject Line */}
      <FormSection title="Subject Line">
        <TextInput
          style={[styles.input, { borderColor: palette.muted, color: palette.text }]}
          placeholder="Letter subject..."
          placeholderTextColor={palette.muted}
          value={form.values.subject}
          onChangeText={form.handleChange('subject')}
          onBlur={form.handleBlur('subject')}
          maxLength={500}
          accessibilityLabel="Letter subject"
        />
        <CharacterCount
          current={form.values.subject.length}
          max={500}
          palette={palette}
        />
        {getFieldError(form.errors, form.touched, 'subject') && (
          <ErrorText
            text={getFieldError(form.errors, form.touched, 'subject')!}
            palette={palette}
          />
        )}
      </FormSection>

      {/* Body (Main Content) */}
      <FormSection title="Letter Body *">
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            { borderColor: palette.muted, color: palette.text },
          ]}
          placeholder="Write your letter here... (minimum 50 characters)"
          placeholderTextColor={palette.muted}
          value={form.values.body}
          onChangeText={form.handleChange('body')}
          onBlur={form.handleBlur('body')}
          multiline
          numberOfLines={10}
          maxLength={50000}
          accessibilityLabel="Letter body"
          accessibilityHint="Main content of the letter"
        />
        <CharacterCount
          current={form.values.body.length}
          max={50000}
          palette={palette}
        />
        {getFieldError(form.errors, form.touched, 'body') && (
          <ErrorText
            text={getFieldError(form.errors, form.touched, 'body')!}
            palette={palette}
          />
        )}
      </FormSection>

      {/* Validation Status */}
      {form.dirty && (
        <View
          style={{
            padding: 12,
            marginVertical: 8,
            borderRadius: 8,
            backgroundColor: form.hasErrors ? palette.error + '20' : palette.success + '20',
            borderLeftWidth: 4,
            borderLeftColor: form.hasErrors ? palette.error : palette.success,
          }}
        >
          <Text
            style={{
              color: form.hasErrors ? palette.error : palette.success,
              fontWeight: '600',
            }}
          >
            {form.hasErrors
              ? `${Object.keys(form.errors).length} error(s) to fix`
              : '✓ Form is valid'}
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
            accessibilityLabel="Cancel"
          >
            <Text style={{ color: palette.text, fontWeight: '600' }}>Cancel</Text>
          </A11yPressable>
        )}

        <A11yPressable
          onPress={handleFormSubmit}
          disabled={!form.dirty || form.hasErrors || form.isSubmitting}
          style={[
            styles.button,
            {
              backgroundColor: form.hasErrors ? palette.muted : palette.primary,
              opacity: !form.dirty || form.hasErrors || form.isSubmitting ? 0.5 : 1,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={form.isSubmitting ? 'Saving letter' : 'Save letter'}
          accessibilityState={{ disabled: !form.dirty || form.hasErrors }}
        >
          <Text
            style={{
              color: palette.onPrimary,
              fontWeight: '700',
            }}
          >
            {form.isSubmitting ? 'Saving...' : 'Save Letter'}
          </Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 8,
          color: '#333',
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

function CharacterCount({
  current,
  max,
  palette,
}: {
  current: number;
  max: number;
  palette: any;
}) {
  const percentage = (current / max) * 100;
  const isWarning = percentage > 80;

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          color: isWarning ? palette.warning : palette.muted,
        }}
      >
        {current} / {max} characters
      </Text>
      <View
        style={{
          flex: 1,
          height: 4,
          backgroundColor: palette.muted + '40',
          borderRadius: 2,
          marginLeft: 12,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: isWarning
              ? percentage > 95
                ? palette.error
                : palette.warning
              : palette.primary,
          }}
        />
      </View>
    </View>
  );
}

function ErrorText({ text, palette }: { text: string; palette: any }) {
  return (
    <Text
      style={{
        color: palette.error,
        fontSize: 12,
        marginTop: 6,
        fontWeight: '500',
      }}
      role="alert"
    >
      ⚠️ {text}
    </Text>
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
    minHeight: 120,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
});
