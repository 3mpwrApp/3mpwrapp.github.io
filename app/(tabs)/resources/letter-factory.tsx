/**
 * DEPRECATED: Letter Factory has been merged into Letter Wizard.
 * This file redirects to the unified letter tool.
 * Use (tools)/letter-wizard.tsx for all letter generation.
 */
import { useRouter } from 'expo-router';
import React from 'react';

export const options = { href: null };

export default function LetterFactoryRedirect() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/resources/letter-wizard');
  }, [router]);
  
  return null;
}
