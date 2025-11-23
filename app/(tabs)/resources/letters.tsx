/**
 * DEPRECATED: This file now redirects to the unified Letter Wizard.
 * All 22 letter templates are available in (tools)/letter-wizard.tsx
 */
import { useRouter } from 'expo-router';
import React from 'react';

export const options = { href: null };

export default function LettersRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/resources/letter-wizard');
  }, [router]);
  
  return null;
}
