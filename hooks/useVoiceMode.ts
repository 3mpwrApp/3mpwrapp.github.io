import * as React from 'react';
import { router } from 'expo-router';
import { useSettings } from '../store/settings';

// Minimal voice command handler. Integrate with STT to feed text into handleVoiceCommand.
export function useVoiceCommands() {
  const { voiceMode } = useSettings();

  type Result = { handled: boolean; label?: string };

  const handleVoiceCommand = React.useCallback((raw: string): Result => {
    if (!voiceMode) return { handled: false };
    const text = (raw || '').toLowerCase().trim();
    const open = (path: string, label: string): Result => {
      try { router.push(path as any); return { handled: true, label }; } catch { return { handled: false }; }
    };
    // Navigation intents
    if (/(open|go to).*(resources|tools)/.test(text)) return open('/(tabs)/resources', 'Resources');
    if (/(open|go to).*(ratings|reviews)/.test(text)) return open('/(tabs)/advocacy/ratings', 'Ratings');
    if (/(open|go to).*(advocacy|campaigns?)/.test(text)) return open('/(tabs)/advocacy', 'Advocacy');
    if (/(open|go to).*(community|mutual)/.test(text)) return open('/(tabs)/community', 'Community');
    if (/open.*admin.*pending/.test(text)) return open('/(tabs)/admin?tab=pending', 'Admin • Pending');
    if (/open.*admin.*approved/.test(text)) return open('/(tabs)/admin?tab=approved', 'Admin • Approved');
    if (/open.*admin.*trash|deleted/.test(text)) return open('/(tabs)/admin?tab=trash', 'Admin • Trash');
    if (/(open|go to).*(settings)/.test(text)) return open('/(tabs)/settings', 'Settings');
    if (/(open|go to).*(rights|explainer)/.test(text)) return open('/(tabs)/resources/rights-explainer', 'Rights Explainer');
    if (/(open|go to).*(doctor|visit|prep)/.test(text)) return open('/(tabs)/resources/doctor-visit-prep', 'Doctor Visit Prep');
    if (/\b(back|go back|previous)\b/.test(text)) { try { router.back(); return { handled: true, label: 'Back' }; } catch { return { handled: false }; }
    }
    return { handled: false };
  }, [voiceMode]);

  return { voiceMode, handleVoiceCommand };
}
