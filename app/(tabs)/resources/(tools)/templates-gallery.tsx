/**
 * DEPRECATED: Template Gallery has been merged into Letter Wizard.
 * This file redirects to the unified letter tool.
 */
import { useRouter } from 'expo-router';
import React from "react";

export const options = { href: null };

export default function TemplatesGallery() {
  const router = useRouter();
  
  React.useEffect(() => {
    router.replace('/(tabs)/resources/letter-wizard');
  }, [router]);
  
  return null;
}
