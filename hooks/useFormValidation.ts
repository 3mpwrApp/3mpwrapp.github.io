/**
 * Form Validation Hook
 * Provides form state management with Zod validation
 * 
 * Features:
 * - Real-time field validation with debouncing
 * - Field-level error handling
 * - Touched state tracking
 * - Form submission validation
 * - Reset functionality
 * - Performance optimized
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { z } from 'zod';

import { validateData, validateField } from '../types/validation';

interface UseFormValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  
  // Methods
  handleChange: (field: keyof T) => (value: string | number | boolean) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => () => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string | string[]) => void;
  setValues: (values: Partial<T>) => void;
  reset: (nextValues?: Partial<T>) => void;
  
  // Derived state
  isValid: boolean;
  hasErrors: boolean;
}

/**
 * Form validation hook using Zod
 */
export function useFormValidation<T extends Record<string, any>>(
  schema: z.ZodSchema<T>,
  initialValues: T,
  options: UseFormValidationOptions = {}
): UseFormValidationReturn<T> {
  const {
    debounceMs = 500,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Debounce timer refs
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const validationAbortRef = useRef<AbortController | null>(null);

  // ========================================================================
  // Validation Functions
  // ========================================================================

  /**
   * Validate entire form
   */
  const validateForm = useCallback(
    async (valuesToValidate: T): Promise<boolean> => {
      setIsValidating(true);
      try {
        const result = validateData(schema, valuesToValidate);
        setErrors(result.errors);
        return result.success;
      } finally {
        setIsValidating(false);
      }
    },
    [schema]
  );

  /**
   * Validate a single field with schema field validation
   */
  const validateSingleField = useCallback(
    async (fieldName: keyof T, value: any): Promise<string[]> => {
      try {
        // Try to extract and validate individual field schema
        if (schema instanceof z.ZodObject) {
          const fieldSchema = (schema as z.ZodObject<any>).shape[fieldName as string];
          if (fieldSchema) {
            const fieldResult = validateField(fieldSchema, value);
            return fieldResult.valid ? [] : [fieldResult.error || 'Invalid field'];
          }
        }
        return [];
      } catch {
        return [];
      }
    },
    [schema]
  );

  /**
   * Handle field change with debounced validation
   */
  const handleChange = useCallback(
    (field: keyof T) => (newValue: string | number | boolean) => {
      // Update values immediately
      setValues((prev) => ({
        ...prev,
        [field]: newValue,
      }));

      // Mark form as dirty
      setDirty(true);

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!validateOnChange) return;

      // Debounce validation
      debounceTimerRef.current = (setTimeout(async () => {
        setIsValidating(true);
        try {
          const fieldErrors = await validateSingleField(field, newValue);
          setErrors((prev) => {
            const updated = { ...prev };
            if (fieldErrors.length > 0) {
              updated[field as string] = fieldErrors;
            } else {
              delete updated[field as string];
            }
            return updated;
          });
        } finally {
          setIsValidating(false);
        }
      }, debounceMs)) as unknown as NodeJS.Timeout;
    },
    [validateOnChange, debounceMs, validateSingleField]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (field: keyof T) => async () => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      if (!validateOnBlur) return;

      setIsValidating(true);
      try {
        const fieldErrors = await validateSingleField(field, values[field]);
        setErrors((prev) => {
          const updated = { ...prev };
          if (fieldErrors.length > 0) {
            updated[field as string] = fieldErrors;
          } else {
            delete updated[field as string];
          }
          return updated;
        });
      } finally {
        setIsValidating(false);
      }
    },
    [validateOnBlur, validateSingleField, values]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) =>
      async () => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
          // Validate entire form before submission
          if (validateOnSubmit) {
            const isValid = await validateForm(values);
            if (!isValid) {
              // Mark all fields as touched to show errors
              const allFields = (Object.keys(values) as (keyof T)[]).reduce(
                (acc, field) => ({
                  ...acc,
                  [field]: true,
                }),
                {}
              );
              setTouched(allFields);
              return;
            }
          }

          // Call user's submit handler
          await onSubmit(values);

          // Reset form on successful submission
          setDirty(false);
          setErrors({});
        } catch (error) {
          // Handle submission errors
          console.error('Form submission error:', error);
          if (error instanceof Error) {
            setErrors({
              _submit: [error.message],
            });
          }
        } finally {
          setIsSubmitting(false);
        }
      },
    [values, validateOnSubmit, validateForm, isSubmitting]
  );

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
    setDirty(true);
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((field: keyof T, error: string | string[]) => {
    const errorArray = Array.isArray(error) ? error : [error];
    setErrors((prev) => ({
      ...prev,
      [field as string]: errorArray,
    }));
  }, []);

  /**
   * Set multiple values at once
   */
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
    setDirty(true);
  }, []);

  /**
   * Reset form to initial or provided values
   */
  const reset = useCallback((nextValues?: Partial<T>) => {
    setValues(nextValues ? { ...initialValues, ...nextValues } : initialValues);
    setErrors({});
    setTouched({});
    setDirty(false);
  }, [initialValues]);

  // ========================================================================
  // Derived State
  // ========================================================================

  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && dirty;

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      validationAbortRef.current?.abort();
    };
  }, []);

  return {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues: setFormValues,
    reset,
    isValid,
    hasErrors,
  };
}

/**
 * Get error message for a field (only if field was touched)
 */
export function getFieldError(
  errors: Record<string, string[]>,
  touched: Record<string, boolean>,
  field: string
): string | null {
  if (!touched[field] || !errors[field]) {
    return null;
  }
  return errors[field][0] || null;
}

/**
 * Check if field has error
 */
export function hasFieldError(
  errors: Record<string, string[]>,
  field: string
): boolean {
  return !!(errors[field] && errors[field].length > 0);
}

/**
 * Get all field errors as array
 */
export function getFieldErrors(
  errors: Record<string, string[]>,
  field: string
): string[] {
  return errors[field] || [];
}

/**
 * Create a form field helper
 */
export function createFieldHelper(field: string, form: any) {
  return {
    field,
    value: form.values[field] ?? '',
    error: getFieldError(form.errors, form.touched, field),
    hasError: hasFieldError(form.errors, field),
    isTouched: form.touched[field] ?? false,
    onChange: form.handleChange(field),
    onBlur: form.handleBlur(field),
    setError: (error: string) => form.setFieldError(field, error),
  };
}
