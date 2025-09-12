import React, { useEffect } from 'react';
import { router } from 'expo-router';
export const options = { href: null };
export default function AccommodationRequest() {
  useEffect(() => { try { router.replace('/(tabs)/resources/letter-accommodation' as any); } catch {} }, []);
  return null;
}

