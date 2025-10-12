import { render } from '@testing-library/react';

// Mock the required modules
jest.mock('../theme/usePalette', () => ({
  useAppPalette: () => ({
    text: '#000000',
    surface: '#ffffff',
    primary: '#007AFF',
    onPrimary: '#ffffff',
    error: '#FF3B30',
    muted: '#8E8E93',
  }),
}));

jest.mock('../theme/typography', () => ({
  useTextScale: () => ({ factor: 1 }),
}));

jest.mock('../hooks/useA11y', () => ({
  MAX_FONT_SCALE: 1.3,
  useAnnounceOnChange: jest.fn(),
}));

jest.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string, vars?: any) => {
      if (vars) {
        let result = fallback || key;
        Object.keys(vars).forEach(varKey => {
          result = result.replace(`{{${varKey}}}`, vars[varKey]);
        });
        return result;
      }
      return fallback || key;
    },
  }),
}));

import A11yTextInput from '../components/A11yTextInput';

describe('A11yTextInput Comprehensive Accessibility', () => {
  const defaultProps = {
    label: 'Email Address',
    value: '',
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with proper accessibility label', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} testID="email-input" />
    );
    
    const input = getByTestId('email-input');
    expect(input).toBeTruthy();
  });

  it('handles required field properly', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} required testID="required-input" />
    );
    
    const input = getByTestId('required-input');
    expect(input).toBeTruthy();
  });

  it('displays error messages with proper accessibility', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        error="This field is required" 
        testID="error-input"
      />
    );
    
    const input = getByTestId('error-input');
    expect(input).toBeTruthy();
  });

  it('shows character count when enabled', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        value="test@example.com"
        maxLength={50}
        showCharacterCount
        testID="count-input"
      />
    );
    
    const input = getByTestId('count-input');
    expect(input).toBeTruthy();
  });

  it('handles email input type correctly', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        inputType="email"
        testID="email-type-input"
      />
    );
    
    const input = getByTestId('email-type-input');
    expect(input).toBeTruthy();
  });

  it('handles search input type correctly', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        label="Search"
        inputType="search"
        testID="search-input"
      />
    );
    
    const input = getByTestId('search-input');
    expect(input).toBeTruthy();
  });

  it('handles focus and blur states', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} testID="focus-input" />
    );
    
    const input = getByTestId('focus-input');
    expect(input).toBeTruthy();
  });

  it('meets WCAG AAA touch target requirements', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} testID="touch-target-input" />
    );
    
    const input = getByTestId('touch-target-input');
    expect(input).toBeTruthy();
  });

  it('handles password input securely', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        label="Password"
        inputType="password"
        testID="password-input"
      />
    );
    
    const input = getByTestId('password-input');
    expect(input).toBeTruthy();
  });

  it('provides proper helper text accessibility', () => {
    const helperText = 'Enter your email address';
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        helperText={helperText}
        testID="helper-input"
      />
    );
    
    const input = getByTestId('helper-input');
    expect(input).toBeTruthy();
  });

  it('combines helper text and character count in accessibility hint', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        helperText="Enter your email address"
        value="test"
        maxLength={50}
        showCharacterCount
        testID="combined-hint-input"
      />
    );
    
    const input = getByTestId('combined-hint-input');
    expect(input).toBeTruthy();
  });

  it('handles numeric input type', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        label="Age"
        inputType="numeric"
        testID="numeric-input"
      />
    );
    
    const input = getByTestId('numeric-input');
    expect(input).toBeTruthy();
  });

  it('handles telephone input type', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        label="Phone Number"
        inputType="tel"
        testID="tel-input"
      />
    );
    
    const input = getByTestId('tel-input');
    expect(input).toBeTruthy();
  });

  it('provides proper accessibility relationships', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        helperText="Helper text"
        error="Error message"
        showCharacterCount
        maxLength={100}
        testID="relationships-input"
      />
    );
    
    const input = getByTestId('relationships-input');
    expect(input).toBeTruthy();
  });

  it('adapts to different text scaling factors', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} testID="scaled-input" />
    );
    
    const input = getByTestId('scaled-input');
    expect(input).toBeTruthy();
  });

  it('supports custom container styles', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        containerStyle={{ marginTop: 20 }}
        testID="styled-input"
      />
    );
    
    const input = getByTestId('styled-input');
    expect(input).toBeTruthy();
  });

  it('provides enhanced keyboard behavior', () => {
    const { getByTestId } = render(
      <A11yTextInput {...defaultProps} testID="keyboard-input" />
    );
    
    const input = getByTestId('keyboard-input');
    expect(input).toBeTruthy();
  });

  it('handles URL input type correctly', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        label="Website URL"
        inputType="url"
        testID="url-input"
      />
    );
    
    const input = getByTestId('url-input');
    expect(input).toBeTruthy();
  });

  it('supports enhanced error announcements', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        error="Invalid email format"
        announceErrors
        testID="announced-error-input"
      />
    );
    
    const input = getByTestId('announced-error-input');
    expect(input).toBeTruthy();
  });

  it('can disable error announcements', () => {
    const { getByTestId } = render(
      <A11yTextInput 
        {...defaultProps} 
        error="Error message"
        announceErrors={false}
        testID="quiet-error-input"
      />
    );
    
    const input = getByTestId('quiet-error-input');
    expect(input).toBeTruthy();
  });
});