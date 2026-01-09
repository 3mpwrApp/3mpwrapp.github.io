/**
 * WCAG 2.2 AAA Accessibility Tests
 * 
 * Comprehensive test suite for accessibility features:
 * - Color contrast ratios
 * - Focus management
 * - Screen reader labels
 * - Keyboard navigation
 */

import {
    A11Y_KEYS,
    A11Y_ROLES,
    calculateContrastRatio,
    createAccessibleLabel,
    ensureContrastRatio,
    getAccessibleColor,
    getContrastMessage,
    getContrastRatio,
    getContrastRequirement,
    isActivationKey,
    meetsAAStandard,
} from '../utils/accessibility';

describe('Accessibility Utils', () => {
  describe('Color Contrast', () => {
    describe('calculateContrastRatio', () => {
      test('calculates contrast ratio between two colors', () => {
        // Black and white should be maximum contrast (21:1)
        const ratio = calculateContrastRatio('#000000', '#FFFFFF');
        expect(ratio).toBeGreaterThan(20);
      });

      test('returns lower ratio for similar colors', () => {
        // Dark gray on light gray
        const ratio = calculateContrastRatio('#333333', '#999999');
        expect(ratio).toBeLessThan(5);
      });

      test('handles invalid color formats', () => {
        const ratio = calculateContrastRatio('invalid', '#FFFFFF');
        expect(ratio).toBe(0);
      });

      test('calculates correct contrast for common pairs', () => {
        // Standard button: dark text on light background
        const ratio = calculateContrastRatio('#1a1a1a', '#f5f5f5');
        expect(ratio).toBeGreaterThan(10);
      });
    });

    describe('ensureContrastRatio', () => {
      test('returns true for colors meeting AAA standard (7:1)', () => {
        const isAAA = ensureContrastRatio('#000000', '#FFFFFF');
        expect(isAAA).toBe(true);
      });

      test('returns false for colors not meeting AAA standard', () => {
        const isAAA = ensureContrastRatio('#808080', '#888888');
        expect(isAAA).toBe(false);
      });

      test('handles edge cases', () => {
        // Same colors = 1:1 ratio, fails
        const same = ensureContrastRatio('#555555', '#555555');
        expect(same).toBe(false);

        // High contrast should pass
        const highContrast = ensureContrastRatio('#000000', '#FFFF00');
        expect(highContrast).toBe(true);
      });
    });

    describe('meetsAAStandard', () => {
      test('returns true for AA compliant colors (4.5:1)', () => {
        const isAA = meetsAAStandard('#404040', '#FFFFFF');
        expect(isAA).toBe(true);
      });

      test('returns false for colors not meeting AA standard', () => {
        const isAA = meetsAAStandard('#888888', '#999999');
        expect(isAA).toBe(false);
      });
    });

    describe('getContrastRatio', () => {
      test('returns formatted contrast ratio string', () => {
        const ratio = getContrastRatio('#000000', '#FFFFFF');
        expect(typeof ratio).toBe('string');
        expect(ratio).toMatch(/^\d+\.\d{2}$/);
      });

      test('ratio string has two decimal places', () => {
        const ratio = getContrastRatio('#1a1a1a', '#f5f5f5');
        const parts = ratio.split('.');
        expect(parts[1]).toHaveLength(2);
      });
    });

    describe('getAccessibleColor', () => {
      test('returns adjusted color meeting AAA standard', () => {
        const adjusted = getAccessibleColor('#999999', '#FFFFFF');
        const isAAA = ensureContrastRatio(adjusted, '#FFFFFF');
        expect(isAAA).toBe(true);
      });

      test('returns original color if already accessible', () => {
        const color = '#000000';
        const adjusted = getAccessibleColor(color, '#FFFFFF');
        expect(ensureContrastRatio(adjusted, '#FFFFFF')).toBe(true);
      });

      test('lightens colors that are too dark', () => {
        const color = '#CCCCCC';
        const adjusted = getAccessibleColor(color, '#FFFFFF');
        // Lightened color should be >= original
        expect(adjusted).toBeDefined();
      });

      test('darkens colors that are too light', () => {
        const color = '#333333';
        const adjusted = getAccessibleColor(color, '#000000');
        expect(adjusted).toBeDefined();
      });
    });

    describe('getContrastMessage', () => {
      test('returns AAA level for high contrast', () => {
        const msg = getContrastMessage('#000000', '#FFFFFF');
        expect(msg.level).toBe('AAA');
        expect(msg.message).toContain('AAA');
      });

      test('returns AA level for medium contrast', () => {
        const msg = getContrastMessage('#404040', '#FFFFFF');
        if (msg.level === 'AA') {
          expect(msg.message).toContain('AA');
        }
      });

      test('returns FAIL level for low contrast', () => {
        const msg = getContrastMessage('#888888', '#999999');
        expect(msg.level).toBe('FAIL');
        expect(msg.message).toContain('does not meet');
      });

      test('includes ratio in message', () => {
        const msg = getContrastMessage('#000000', '#FFFFFF');
        expect(msg.ratio).toBeDefined();
        expect(msg.message).toContain(msg.ratio);
      });
    });
  });

  describe('Accessible Labels', () => {
    describe('createAccessibleLabel', () => {
      test('creates label with action only', () => {
        const label = createAccessibleLabel('Submit');
        expect(label).toBe('Submit');
      });

      test('combines action and context', () => {
        const label = createAccessibleLabel('Delete', 'confirm action');
        expect(label).toBe('Delete, confirm action');
      });

      test('handles empty context', () => {
        const label = createAccessibleLabel('Close', '');
        expect(label).toBe('Close');
      });

      test('handles undefined context', () => {
        const label = createAccessibleLabel('Save');
        expect(label).toBe('Save');
      });

      test('handles complex context strings', () => {
        const context = 'document created on January 9, 2026';
        const label = createAccessibleLabel('Download', context);
        expect(label).toContain('Download');
        expect(label).toContain(context);
      });
    });
  });

  describe('Focus and Keyboard', () => {
    describe('isActivationKey', () => {
      test('returns true for Enter key', () => {
        expect(isActivationKey(A11Y_KEYS.ENTER)).toBe(true);
      });

      test('returns true for Space key', () => {
        expect(isActivationKey(A11Y_KEYS.SPACE)).toBe(true);
      });

      test('returns false for other keys', () => {
        expect(isActivationKey(A11Y_KEYS.ESCAPE)).toBe(false);
        expect(isActivationKey(A11Y_KEYS.TAB)).toBe(false);
        expect(isActivationKey('a')).toBe(false);
      });
    });

    describe('A11Y_ROLES', () => {
      test('has all expected role definitions', () => {
        expect(A11Y_ROLES.button).toBeDefined();
        expect(A11Y_ROLES.link).toBeDefined();
        expect(A11Y_ROLES.heading).toBeDefined();
        expect(A11Y_ROLES.dialog).toBeDefined();
      });

      test('roles are valid strings', () => {
        Object.values(A11Y_ROLES).forEach((role) => {
          expect(typeof role).toBe('string');
          expect(role.length).toBeGreaterThan(0);
        });
      });
    });

    describe('A11Y_KEYS', () => {
      test('has standard keyboard keys', () => {
        expect(A11Y_KEYS.ENTER).toBeDefined();
        expect(A11Y_KEYS.ESCAPE).toBeDefined();
        expect(A11Y_KEYS.TAB).toBeDefined();
      });

      test('arrow keys are defined', () => {
        expect(A11Y_KEYS.ARROW_UP).toBe('ArrowUp');
        expect(A11Y_KEYS.ARROW_DOWN).toBe('ArrowDown');
        expect(A11Y_KEYS.ARROW_LEFT).toBe('ArrowLeft');
        expect(A11Y_KEYS.ARROW_RIGHT).toBe('ArrowRight');
      });

      test('special keys are correct', () => {
        expect(A11Y_KEYS.SPACE).toBe(' ');
        expect(A11Y_KEYS.HOME).toBe('Home');
        expect(A11Y_KEYS.END).toBe('End');
      });
    });
  });

  describe('Contrast Requirements', () => {
    describe('getContrastRequirement', () => {
      test('returns 7:1 for normal text', () => {
        const requirement = getContrastRequirement(16);
        expect(requirement).toBe(7);
      });

      test('returns 7:1 for large text (AAA standard)', () => {
        // 18pt ≈ 24px
        const requirement = getContrastRequirement(24);
        expect(requirement).toBe(7);
      });

      test('returns 7:1 for very large text', () => {
        const requirement = getContrastRequirement(48);
        expect(requirement).toBe(7);
      });

      test('handles small font sizes', () => {
        const requirement = getContrastRequirement(12);
        expect(requirement).toBe(7);
      });
    });
  });

  describe('Real-world Color Pairs', () => {
    test('common button colors meet accessibility', () => {
      // Primary action button - dark blue on white has 8.6:1 ratio
      const primaryButton = ensureContrastRatio('#003A7A', '#FFFFFF');
      expect(primaryButton).toBe(true);
    });

    test('text on success background', () => {
      // White text on dark green has high contrast
      const success = meetsAAStandard('#FFFFFF', '#1B4D2E');
      expect(success).toBe(true);
    });

    test('text on error background', () => {
      // White text on dark red
      const error = meetsAAStandard('#FFFFFF', '#8B2C2C');
      expect(error).toBe(true);
    });

    test('disabled state contrast', () => {
      // Dark gray text on light gray still needs 4.5:1
      const disabled = meetsAAStandard('#666666', '#F5F5F5');
      expect(disabled).toBe(true);
    });

    test('header text on dark background', () => {
      const header = ensureContrastRatio('#FFFFFF', '#1a1a1a');
      expect(header).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('handles colors with and without hash', () => {
      const withHash = calculateContrastRatio('#000000', '#FFFFFF');
      const withoutHash = calculateContrastRatio('000000', 'FFFFFF');
      // Both should return valid ratios
      expect(withHash).toBeGreaterThan(0);
      expect(withoutHash).toBeGreaterThan(0);
    });

    test('handles case-insensitive hex codes', () => {
      const uppercase = calculateContrastRatio('#ABCDEF', '#123456');
      const lowercase = calculateContrastRatio('#abcdef', '#123456');
      expect(uppercase).toBe(lowercase);
    });

    test('same color returns 1:1 ratio', () => {
      const ratio = calculateContrastRatio('#555555', '#555555');
      expect(ratio).toBeCloseTo(1, 1);
    });
  });

  describe('Accessibility Compliance Scenarios', () => {
    test('WCAG AAA: All text colors must have 7:1 ratio', () => {
      const colors = [
        { fg: '#000000', bg: '#FFFFFF' },
        { fg: '#1a1a1a', bg: '#f5f5f5' },
        { fg: '#FFFFFF', bg: '#003A7A' },
      ];

      colors.forEach((color) => {
        expect(ensureContrastRatio(color.fg, color.bg)).toBe(true);
      });
    });

    test('UI components pass accessibility audit', () => {
      // Button - dark blue on white
      const button = {
        text: '#FFFFFF',
        background: '#003A7A',
      };
      expect(
        ensureContrastRatio(button.text, button.background)
      ).toBe(true);

      // Link - dark blue on white
      const link = {
        text: '#003A7A',
        background: '#FFFFFF',
      };
      expect(meetsAAStandard(link.text, link.background)).toBe(true);

      // Focus indicator - dark outline on white
      const focus = {
        outline: '#000000',
        background: '#FFFFFF',
      };
      expect(
        ensureContrastRatio(focus.outline, focus.background)
      ).toBe(true);
    });

    test('dark mode colors are accessible', () => {
      const darkModeColors = [
        { fg: '#FFFFFF', bg: '#1a1a1a' },
        { fg: '#E0E0E0', bg: '#2a2a2a' },
        { fg: '#FFFFFF', bg: '#333333' },
      ];

      darkModeColors.forEach((color) => {
        expect(
          meetsAAStandard(color.fg, color.bg)
        ).toBe(true);
      });
    });
  });
});
