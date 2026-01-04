/**
 * REDIRECT: accountability-hub → Legal Action Hub
 * This screen has been consolidated into the Legal Action Hub PowerTool
 * Maintaining backward compatibility for deep links and navigation
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export const options = { href: null };

export default function AccountabilityHub() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/advocacy/legal-action-hub');
  }, [router]);

  return null;
}