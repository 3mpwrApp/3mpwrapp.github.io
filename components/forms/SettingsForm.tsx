/**
 * Settings Form with Validation
 * 
 * Before: No centralized settings validation
 * After: Full validation with preferences
 */

import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import A11yPressable from '../../components/A11yPressable';
import { useFormValidation } from '../../hooks/useFormValidation';
import { useAppPalette } from '../../theme/usePalette';
import {
    SettingsSchema,
    validateData,
    type Settings
} from '../../types/validation';

interface SettingsFormProps {
  onSubmit: (values: Settings) => Promise<void> | void;
  onCancel?: () => void;
  initialValues?: Partial<Settings>;
  userId: string;
}

/**
 * Settings Form
 * 
 * BEFORE:
 * - Scattered settings across different screens
 * - No validation
 * - No persistent error handling
 * 
 * AFTER (with SettingsSchema):
 * - Centralized settings validation
 * - Full notification preference validation
 * - Privacy and data settings with validation
 * - Accessibility options with validation
 */
export default function SettingsForm({
  onSubmit,
  onCancel,
  initialValues,
  userId,
}: SettingsFormProps) {
  const palette = useAppPalette();

  const defaultValues: Settings = {
    userId: initialValues?.userId || userId,
    displayName: initialValues?.displayName || '',
    email: initialValues?.email || '',
    language: initialValues?.language || 'en',
    theme: initialValues?.theme || 'auto',
    fontSize: initialValues?.fontSize || 'normal',
    accessibility: initialValues?.accessibility || {
      highContrast: false,
      reduceMotion: false,
      screenReader: false,
      simplerLanguage: false,
      largerText: false,
    },
    notifications: initialValues?.notifications || {
      push: true,
      email: false,
      sms: false,
      inApp: true,
      frequency: 'weekly',
      campaigns: true,
      events: true,
      community: true,
      wellness: true,
      resources: true,
    },
    privacy: initialValues?.privacy || {
      profilePublic: false,
      showInDirectory: false,
      allowAnalytics: true,
      allowMarketing: false,
    },
    data: initialValues?.data || {
      autoBackup: true,
      cloudSync: false,
      deleteInactiveData: false,
    },
  };

  const form = useFormValidation(SettingsSchema, defaultValues, {
    debounceMs: 500,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      const result = validateData(SettingsSchema, values);
      if (!result.success) {
        Alert.alert('Validation Error', 'Please fix the errors and try again');
        return;
      }

      await onSubmit(values);
      form.reset();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update settings'
      );
    }
  });

  const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
  ];

  const THEMES = [
    { value: 'light', label: '☀️ Light' },
    { value: 'dark', label: '🌙 Dark' },
    { value: 'auto', label: '🔄 Auto' },
  ];

  const FONT_SIZES = [
    { value: 'small', label: 'Small (12px)' },
    { value: 'normal', label: 'Normal (14px)' },
    { value: 'large', label: 'Large (16px)' },
    { value: 'xlarge', label: 'Extra Large (18px)' },
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
        ⚙️ Settings
      </Text>

      {/* Display Settings Section */}
      <SectionHeader title="Display & Accessibility" palette={palette} />

      {/* Theme Selection */}
      <OptionSelector
        label="Theme"
        value={form.values.theme}
        onChange={form.handleChange('theme')}
        options={THEMES}
        palette={palette}
      />

      {/* Font Size */}
      <OptionSelector
        label="Font Size"
        value={form.values.fontSize}
        onChange={form.handleChange('fontSize')}
        options={FONT_SIZES}
        palette={palette}
      />

      {/* Language */}
      <OptionSelector
        label="Language"
        value={form.values.language}
        onChange={form.handleChange('language')}
        options={LANGUAGES}
        palette={palette}
      />

      {/* Accessibility Options */}
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
          Accessibility Options
        </Text>

        <ToggleSetting
          label="High Contrast"
          value={form.values.accessibility?.highContrast || false}
          onValueChange={(val) => {
            form.setFieldValue('accessibility', {
              ...form.values.accessibility,
              highContrast: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Reduce Motion"
          value={form.values.accessibility?.reduceMotion || false}
          onValueChange={(val) => {
            form.setFieldValue('accessibility', {
              ...form.values.accessibility,
              reduceMotion: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Screen Reader Mode"
          value={form.values.accessibility?.screenReader || false}
          onValueChange={(val) => {
            form.setFieldValue('accessibility', {
              ...form.values.accessibility,
              screenReader: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Simpler Language"
          value={form.values.accessibility?.simplerLanguage || false}
          onValueChange={(val) => {
            form.setFieldValue('accessibility', {
              ...form.values.accessibility,
              simplerLanguage: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Larger Text"
          value={form.values.accessibility?.largerText || false}
          onValueChange={(val) => {
            form.setFieldValue('accessibility', {
              ...form.values.accessibility,
              largerText: val,
            });
          }}
          palette={palette}
        />
      </View>

      {/* Notification Settings Section */}
      <SectionHeader title="Notifications" palette={palette} />

      <View
        style={{
          padding: 12,
          backgroundColor: palette.surface,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <ToggleSetting
          label="Push Notifications"
          value={form.values.notifications?.push || false}
          onValueChange={(val) => {
            form.setFieldValue('notifications', {
              ...form.values.notifications,
              push: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Email Notifications"
          value={form.values.notifications?.email || false}
          onValueChange={(val) => {
            form.setFieldValue('notifications', {
              ...form.values.notifications,
              email: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="SMS Notifications"
          value={form.values.notifications?.sms || false}
          onValueChange={(val) => {
            form.setFieldValue('notifications', {
              ...form.values.notifications,
              sms: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="In-App Notifications"
          value={form.values.notifications?.inApp || false}
          onValueChange={(val) => {
            form.setFieldValue('notifications', {
              ...form.values.notifications,
              inApp: val,
            });
          }}
          palette={palette}
        />

        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              marginBottom: 8,
              color: palette.text,
            }}
          >
            Content Preferences
          </Text>

          <ToggleSetting
            label="Campaign Updates"
            value={form.values.notifications?.campaigns || false}
            onValueChange={(val) => {
              form.setFieldValue('notifications', {
                ...form.values.notifications,
                campaigns: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Event Invitations"
            value={form.values.notifications?.events || false}
            onValueChange={(val) => {
              form.setFieldValue('notifications', {
                ...form.values.notifications,
                events: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Community Messages"
            value={form.values.notifications?.community || false}
            onValueChange={(val) => {
              form.setFieldValue('notifications', {
                ...form.values.notifications,
                community: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Wellness Tips"
            value={form.values.notifications?.wellness || false}
            onValueChange={(val) => {
              form.setFieldValue('notifications', {
                ...form.values.notifications,
                wellness: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Resource Updates"
            value={form.values.notifications?.resources || false}
            onValueChange={(val) => {
              form.setFieldValue('notifications', {
                ...form.values.notifications,
                resources: val,
              });
            }}
            palette={palette}
            indent
          />
        </View>
      </View>

      {/* Privacy Settings Section */}
      <SectionHeader title="Privacy & Data" palette={palette} />

      <View
        style={{
          padding: 12,
          backgroundColor: palette.surface,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <ToggleSetting
          label="Public Profile"
          hint="Allow others to see your profile"
          value={form.values.privacy?.profilePublic || false}
          onValueChange={(val) => {
            form.setFieldValue('privacy', {
              ...form.values.privacy,
              profilePublic: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Show in Directory"
          hint="Appear in disability advocate directory"
          value={form.values.privacy?.showInDirectory || false}
          onValueChange={(val) => {
            form.setFieldValue('privacy', {
              ...form.values.privacy,
              showInDirectory: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Allow Analytics"
          hint="Help improve the app with usage data"
          value={form.values.privacy?.allowAnalytics || false}
          onValueChange={(val) => {
            form.setFieldValue('privacy', {
              ...form.values.privacy,
              allowAnalytics: val,
            });
          }}
          palette={palette}
        />

        <ToggleSetting
          label="Allow Marketing"
          hint="Receive news and special offers"
          value={form.values.privacy?.allowMarketing || false}
          onValueChange={(val) => {
            form.setFieldValue('privacy', {
              ...form.values.privacy,
              allowMarketing: val,
            });
          }}
          palette={palette}
        />

        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 12,
              fontWeight: '600',
              marginBottom: 8,
              color: palette.text,
            }}
          >
            Data Settings
          </Text>

          <ToggleSetting
            label="Auto Backup"
            hint="Automatically backup your data"
            value={form.values.data?.autoBackup || false}
            onValueChange={(val) => {
              form.setFieldValue('data', {
                ...form.values.data,
                autoBackup: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Cloud Sync"
            hint="Sync data across devices (encrypted)"
            value={form.values.data?.cloudSync || false}
            onValueChange={(val) => {
              form.setFieldValue('data', {
                ...form.values.data,
                cloudSync: val,
              });
            }}
            palette={palette}
            indent
          />

          <ToggleSetting
            label="Delete Inactive Data"
            hint="Automatically delete data after 1 year of inactivity"
            value={form.values.data?.deleteInactiveData || false}
            onValueChange={(val) => {
              form.setFieldValue('data', {
                ...form.values.data,
                deleteInactiveData: val,
              });
            }}
            palette={palette}
            indent
          />
        </View>
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
              : '✅ Settings are valid'}
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
            accessibilityLabel="Cancel settings changes"
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
          accessibilityLabel={form.isSubmitting ? 'Saving settings' : 'Save settings'}
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
            {form.isSubmitting ? '⏳ Saving...' : '💾 Save Settings'}
          </Text>
        </A11yPressable>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function SectionHeader({ title, palette }: { title: string; palette: any }) {
  return (
    <Text
      style={{
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 12,
        color: palette.text,
      }}
    >
      {title}
    </Text>
  );
}

function ToggleSetting({
  label,
  hint,
  value,
  onValueChange,
  palette,
  indent = false,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  palette: any;
  indent?: boolean;
}) {
  return (
    <View
      style={{
        paddingVertical: 8,
        paddingLeft: indent ? 20 : 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '500',
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
              marginTop: 2,
            }}
          >
            {hint}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: palette.muted, true: palette.primary }}
        thumbColor={value ? palette.onPrimary : palette.muted}
      />
    </View>
  );
}

function OptionSelector({
  label,
  value,
  onChange,
  options,
  palette,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  palette: any;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          marginBottom: 8,
          color: palette.text,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {options.map((option) => (
          <A11yPressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              borderWidth: 2,
              borderColor:
                value === option.value ? palette.primary : palette.muted,
              backgroundColor:
                value === option.value
                  ? palette.primary + '20'
                  : palette.background,
            }}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected: value === option.value }}
          >
            <Text
              style={{
                color:
                  value === option.value ? palette.primary : palette.text,
                fontWeight: value === option.value ? '700' : '500',
                fontSize: 13,
              }}
            >
              {option.label}
            </Text>
          </A11yPressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
