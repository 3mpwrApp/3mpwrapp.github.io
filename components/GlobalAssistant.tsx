
import { usePathname } from 'expo-router';

import { useSettings } from '../store/settings';


/**
 * Floating global AI assistant entry point.
 * - Always available above tabs (root layout)
 * - Smart routing: routes to different destinations based on context
 *   - If user has disability wizard suggestions: goes to home
 *   - If user has recent tools: goes to assistant hub
 *   - Default: goes to assistant hub
 */
export default function GlobalAssistant() {
  const pathname = usePathname();
  const { showAssistantPill = true } = useSettings();
  
  // Hide on auth routes or modal overlays
  if (pathname?.startsWith('/(auth)')) return null;
  if (!showAssistantPill) return null;
  
  // Hide global assistant pill since Ask button is now in header
  return null;
}
