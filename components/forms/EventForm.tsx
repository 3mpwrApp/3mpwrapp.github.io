/**
 * Event Creation Form with Validation
 * 
 * Before: No form validation
 * After: Full validation with datetime handling
 */

import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { getFieldError, useFormValidation } from '../../hooks/useFormValidation';
import { useAppPalette } from '../../theme/usePalette';
import {
    EventFormSchema,
    validateData,
    type EventForm
} from '../../types/validation';

interface EventFormProps {
  onSubmit: (values: EventForm) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Partial<EventForm>;
}

/**
 * Event Creation Form
 * 
 * BEFORE:
 * - No validation
 * - No date/time formatting
 * - No capacity validation
 * - No URL validation for virtual links
 * 
 * AFTER (with EventFormSchema):
 * - Full date/time validation
 * - Capacity must be positive integer
 * - Virtual link validation
 * - Required/optional field handling
 * - Real-time validation feedback
 */
export default function EventForm({
  onSubmit,
  onCancel,
  initialValues,
}: EventFormProps) {
  const palette = useAppPalette();

  const defaultValues: EventForm = {
    title: initialValues?.title || '',
    description: initialValues?.description || '',
    date: initialValues?.startDate || new Date(),
    startDate: initialValues?.startDate || new Date(),
    startTime: initialValues?.startTime || '14:00',
    location: initialValues?.location || '',
    isVirtual: initialValues?.isVirtual || false,
    address: initialValues?.address || {
      street: '',
      city: '',
      province: undefined,
      postalCode: '',
      country: 'Canada',
    },
    capacity: initialValues?.capacity || undefined,
    virtualLink: initialValues?.virtualLink || '',
    organizerName: initialValues?.organizerName || '',
    organizerEmail: initialValues?.organizerEmail || '',
    tags: initialValues?.tags || [],
  };

  const form = useFormValidation(EventFormSchema, defaultValues, {
    debounceMs: 500,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const result = validateData(EventFormSchema, values);
      if (!result.success) {
        Alert.alert('Validation Error', 'Please fix the errors and try again');
        return;
      }

      await onSubmit(values);
      form.reset();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create event');
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
        📅 Create an Event
      </Text>

      {/* Event Title */}
      <FormField
        label="Event Title *"
        value={form.values.title}
        onChangeText={form.handleChange('title')}
        onBlur={form.handleBlur('title')}
        maxLength={200}
        error={getFieldError(form.errors, form.touched, 'title')}
        palette={palette}
        accessibilityLabel="Event title"
      />

      {/* Description */}
      <FormField
        label="Description (Optional)"
        value={form.values.description || ''}
        onChangeText={form.handleChange('description')}
        onBlur={form.handleBlur('description')}
        maxLength={5000}
        multiline
        numberOfLines={4}
        error={getFieldError(form.errors, form.touched, 'description')}
        palette={palette}
        accessibilityLabel="Event description"
      />

      {/* Date and Time Section */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 12,
            color: palette.text,
          }}
        >
          Date and Time *
        </Text>

        {/* Date */}
        <FormField
          label="Event Date"
          value={form.values.startDate
            ? form.values.startDate.toISOString().split('T')[0]
            : ''}
          onChangeText={(text) => {
            const date = new Date(text);
            form.setFieldValue('startDate', date);
          }}
          onBlur={form.handleBlur('startDate')}
          error={getFieldError(form.errors, form.touched, 'startDate')}
          palette={palette}
          accessibilityLabel="Event date"
        />

        {/* Time */}
        <FormField
          label="Start Time"
          hint="HH:MM format (e.g., 14:00)"
          value={form.values.startTime}
          onChangeText={form.handleChange('startTime')}
          onBlur={form.handleBlur('startTime')}
          maxLength={5}
          error={getFieldError(form.errors, form.touched, 'startTime')}
          palette={palette}
          accessibilityLabel="Event start time"
        />
      </View>

      {/* Event Type Toggle */}
      <View
        style={{
          padding: 12,
          backgroundColor: palette.surface,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: palette.text,
            }}
          >
            Virtual Event?
          </Text>
          <Switch
            value={form.values.isVirtual}
            onValueChange={form.handleChange('isVirtual')}
            accessible
            accessibilityLabel="Toggle virtual event"
          />
        </View>
      </View>

      {/* Location */}
      {!form.values.isVirtual && (
        <>
          <FormField
            label="Location Name (Optional)"
            value={form.values.location || ''}
            onChangeText={form.handleChange('location')}
            onBlur={form.handleBlur('location')}
            maxLength={300}
            error={getFieldError(form.errors, form.touched, 'location')}
            palette={palette}
            accessibilityLabel="Event location name"
          />

          {/* Address Fields */}
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
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 12,
                color: palette.text,
              }}
            >
              Address
            </Text>

            <FormField
              label="Street"
              value={form.values.address?.street || ''}
              onChangeText={(text) => {
                form.setFieldValue('address', {
                  ...form.values.address,
                  street: text,
                });
              }}
              palette={palette}
            />

            <FormField
              label="City"
              value={form.values.address?.city || ''}
              onChangeText={(text) => {
                form.setFieldValue('address', {
                  ...form.values.address,
                  city: text,
                });
              }}
              palette={palette}
            />

            <FormField
              label="Province"
              value={form.values.address?.province || ''}
              onChangeText={(text) => {
                form.setFieldValue('address', {
                  ...form.values.address,
                  province: text,
                });
              }}
              palette={palette}
            />

            <FormField
              label="Postal Code"
              value={form.values.address?.postalCode || ''}
              onChangeText={(text) => {
                form.setFieldValue('address', {
                  ...form.values.address,
                  postalCode: text,
                });
              }}
              palette={palette}
            />
          </View>
        </>
      )}

      {/* Virtual Link */}
      {form.values.isVirtual && (
        <FormField
          label="Virtual Meeting Link *"
          hint="Enter Zoom, Teams, or Google Meet URL"
          value={form.values.virtualLink || ''}
          onChangeText={form.handleChange('virtualLink')}
          onBlur={form.handleBlur('virtualLink')}
          error={getFieldError(form.errors, form.touched, 'virtualLink')}
          palette={palette}
          accessibilityLabel="Virtual meeting link"
        />
      )}

      {/* Capacity */}
      <FormField
        label="Capacity (Optional)"
        hint="Maximum number of attendees"
        value={form.values.capacity?.toString() || ''}
        onChangeText={(text) =>
          form.setFieldValue('capacity', text ? parseInt(text, 10) : undefined)
        }
        onBlur={form.handleBlur('capacity')}
        keyboardType="number-pad"
        error={getFieldError(form.errors, form.touched, 'capacity')}
        palette={palette}
        accessibilityLabel="Event capacity"
      />

      {/* Organizer Info */}
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
            fontSize: 13,
            fontWeight: '600',
            marginBottom: 12,
            color: palette.text,
          }}
        >
          Organizer Information
        </Text>

        <FormField
          label="Organizer Name (Optional)"
          value={form.values.organizerName || ''}
          onChangeText={form.handleChange('organizerName')}
          onBlur={form.handleBlur('organizerName')}
          maxLength={100}
          palette={palette}
        />

        <FormField
          label="Organizer Email (Optional)"
          value={form.values.organizerEmail || ''}
          onChangeText={form.handleChange('organizerEmail')}
          onBlur={form.handleBlur('organizerEmail')}
          keyboardType="email-address"
          autoCapitalize="none"
          palette={palette}
        />
      </View>

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
              : '✅ Event is ready to create'}
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
            accessibilityLabel="Cancel event creation"
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
            form.isSubmitting ? 'Creating event' : 'Create event'
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
            {form.isSubmitting ? '⏳ Creating...' : '🚀 Create Event'}
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
  onBlur?: () => void;
  error?: string | null;
  palette: any;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: 'default' | 'number-pad' | 'email-address' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  accessibilityLabel?: string;
  accessibilityHint?: string;
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
