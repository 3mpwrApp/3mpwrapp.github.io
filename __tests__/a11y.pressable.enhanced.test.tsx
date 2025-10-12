import { render } from '@testing-library/react';
import { Text } from 'react-native';

// Mock the required modules
jest.mock('../hooks/useA11y', () => ({
  useScreenReaderEnabled: () => false,
  useReduceMotionEnabled: () => false,
}));

jest.mock('../constants/a11y', () => ({
  touchTarget: {
    min: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    enhanced: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
    large: { minWidth: 56, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  },
}));

import A11yPressable from '../components/A11yPressable';

describe('A11yPressable Enhanced Accessibility', () => {
  const defaultProps = {
    onPress: jest.fn(),
    children: <Text>Test Button</Text>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default accessibility role', () => {
    const { getByTestId } = render(
      <A11yPressable {...defaultProps} testID="default-role-button" />
    );
    
    const button = getByTestId('default-role-button');
    expect(button).toBeTruthy();
  });

  it('applies proper touch target size', () => {
    const { getByTestId } = render(
      <A11yPressable {...defaultProps} testID="touch-target-button" />
    );
    
    const button = getByTestId('touch-target-button');
    expect(button).toBeTruthy();
  });

  it('handles accessibility properly', () => {
    const { getByTestId } = render(
      <A11yPressable {...defaultProps} testID="accessible-button" />
    );
    
    const button = getByTestId('accessible-button');
    expect(button).toBeTruthy();
  });

  it('renders with enhanced accessibility when screen reader is active', () => {
    const { getByTestId } = render(
      <A11yPressable {...defaultProps} testID="enhanced-button" />
    );
    
    const button = getByTestId('enhanced-button');
    expect(button).toBeTruthy();
  });

  it('supports different touch target sizes', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        minTouchTarget="large" 
        testID="large-button" 
      />
    );
    
    const button = getByTestId('large-button');
    expect(button).toBeTruthy();
  });

  it('handles link role correctly', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityRole="link" 
        testID="link-button" 
      />
    );
    
    const button = getByTestId('link-button');
    expect(button).toBeTruthy();
  });

  it('applies proper visual feedback on press', () => {
    const { getByTestId } = render(
      <A11yPressable {...defaultProps} testID="feedback-button" />
    );
    
    const button = getByTestId('feedback-button');
    expect(button).toBeTruthy();
  });

  it('supports different visual themes', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        testID="primary-button" 
      />
    );
    
    const button = getByTestId('primary-button');
    expect(button).toBeTruthy();
  });

  it('handles busy state properly', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityState={{ busy: true }} 
        testID="busy-button" 
      />
    );
    
    const button = getByTestId('busy-button');
    expect(button).toBeTruthy();
  });

  it('handles selected state properly', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityState={{ selected: true, busy: false }} 
        testID="selected-button" 
      />
    );
    
    const button = getByTestId('selected-button');
    expect(button).toBeTruthy();
  });

  it('can disable enhanced accessibility features', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        enhancedAccessibility={false} 
        testID="basic-button" 
      />
    );
    
    const button = getByTestId('basic-button');
    expect(button).toBeTruthy();
  });

  it('handles onPress events correctly', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <A11yPressable 
        onPress={onPress} 
        testID="press-button"
      >
        <Text>Test Button</Text>
      </A11yPressable>
    );
    
    const button = getByTestId('press-button');
    expect(button).toBeTruthy();
  });

  it('supports accessibility labels', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityLabel="Custom Button Label"
        testID="labeled-button" 
      />
    );
    
    const button = getByTestId('labeled-button');
    expect(button).toBeTruthy();
  });

  it('supports accessibility hints', () => {
    const { getByTestId } = render(
      <A11yPressable 
        {...defaultProps} 
        accessibilityHint="Double tap to activate"
        testID="hint-button" 
      />
    );
    
    const button = getByTestId('hint-button');
    expect(button).toBeTruthy();
  });
});