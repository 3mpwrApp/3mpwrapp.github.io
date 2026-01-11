/**
 * Diagnostic Color Palette
 * 
 * These colors are used for diagnostic screens, module health indicators,
 * and debugging visualizations. They are intentionally distinct from the
 * main app palette to provide clear visual feedback for system status.
 */

export const DIAGNOSTIC_COLORS = {
  // Background colors
  white: '#fff',
  lightGray: '#f5f5f5',
  lightestGray: '#f9fafb',
  
  // Text colors
  black: '#000',
  darkGray: '#333',
  mediumGray: '#666',
  lightText: '#f0f0f0',
  
  // Status colors - Success (Green)
  successBg: '#d4edda',
  successBorder: '#28a745',
  successText: '#28a745',
  successDark: '#16a34a',
  successLight: '#f0fdf4',
  successAccent: '#22c55e',
  
  // Status colors - Error (Red)
  errorBg: '#f8d7da',
  errorBorder: '#dc3545',
  errorText: '#dc3545',
  
  // Status colors - Info (Blue)
  infoBg: '#e3f2fd',
  infoBorder: '#1976d2',
  infoText: '#1976d2',
  infoLink: '#0066cc',
  
  // Status colors - Warning (Yellow)
  warningBg: '#fff3cd',
  
  // Border colors
  border: '#e5e7eb',
} as const;

export type DiagnosticColors = typeof DIAGNOSTIC_COLORS;
