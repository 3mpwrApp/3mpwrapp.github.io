/**
 * Skip Links Component for WCAG 2.2 AAA Compliance
 * 
 * Provides keyboard-accessible skip links for screen reader users.
 * Links are hidden by default and visible on focus.
 */

import { useRouter } from 'expo-router';
import React, { useRef } from 'react';
import {
    AccessibilityInfo,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface SkipLink {
  id: string;
  label: string;
  target: string; // Route or element ID
}

interface SkipLinksProps {
  links?: SkipLink[];
  onSkip?: (target: string) => void;
}

const defaultLinks: SkipLink[] = [
  {
    id: 'skip-main',
    label: 'Skip to main content',
    target: 'main',
  },
  {
    id: 'skip-nav',
    label: 'Skip to navigation',
    target: 'navigation',
  },
];

const styles = StyleSheet.create({
  skipLinksContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  skipLink: {
    padding: 8,
    backgroundColor: '#000',
  },
  skipLinkText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  skipLinkWeb: {
    padding: 8,
    backgroundColor: '#000',
  },
  skipLinkFocused: {
    opacity: 1,
  },
});

/**
 * Skip Links Component
 * Provides keyboard-accessible navigation for screen reader users
 */
export function SkipLinks({ links = defaultLinks, onSkip }: SkipLinksProps) {
  const router = useRouter();
  const skipLinksRef = useRef<View>(null);

  const handleSkipLink = (target: string) => {
    if (onSkip) {
      onSkip(target);
      return;
    }

    // Try to focus element by ID
    if (Platform.OS === 'web') {
      const element = document.getElementById(target);
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth' });
        AccessibilityInfo.announceForAccessibility(
          `Navigated to ${target}`
        );
        return;
      }
    }

    // Otherwise navigate to route
    try {
      router.push(target as any);
    } catch (error) {
      console.warn(`Unable to navigate to ${target}:`, error);
    }
  };

  if (Platform.OS !== 'web') {
    // On native platforms, use a different approach with Pressable
    return (
      <View
        style={styles.skipLinksContainer}
        accessible={true}
        accessibilityLabel="Skip navigation"
      >
        {links.map((link) => (
          <Pressable
            key={link.id}
            onPress={() => handleSkipLink(link.target)}
            accessibilityRole="button"
            accessibilityLabel={link.label}
            accessibilityHint="Double tap to navigate"
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: '#000',
              marginVertical: 2,
            }}
          >
            <Text
              style={{
                color: '#FFF',
                fontWeight: '600',
              }}
            >
              {typeof link.label === 'string' && link.label}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  // Web platform implementation
  return (
    <nav
      ref={skipLinksRef as any}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10000,
      }}
      aria-label="Skip links"
    >
      {links.map((link) => (
        <a
          key={link.id}
          href={`#${link.target}`}
          onClick={(e) => {
            e.preventDefault();
            handleSkipLink(link.target);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleSkipLink(link.target);
            }
          }}
          style={{
            position: 'absolute',
            top: -40,
            left: 0,
            padding: '8px 12px',
            backgroundColor: '#000',
            color: '#FFF',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
            outline: 'none',
            transition: 'top 0.2s ease',
          }}
          onFocus={(e) => {
            const target = e.currentTarget;
            target.style.top = '0';
            target.style.outline = '3px solid #FFD700';
            target.style.outlineOffset = '-3px';
          }}
          onBlur={(e) => {
            const target = e.currentTarget;
            target.style.top = '-40px';
            target.style.outline = 'none';
          }}
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

/**
 * Skip Links Wrapper - Use with main layout
 * Provides default skip links for common navigation targets
 */
export function SkipLinksWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View>
      <SkipLinks />
      {children}
    </View>
  );
}

export default SkipLinks;
