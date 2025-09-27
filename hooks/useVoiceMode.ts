import { router } from 'expo-router';
import * as React from 'react';

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
    // Emergency wallet card in Settings
    if (/(open|go to).*(wallet|emergency.*card)/.test(text)) return open('/(tabs)/settings?open=emergencyCard', 'Wallet Card');
    // Wellness: Mood tracker
    if (/\b(log|open|go to).*mood\b/.test(text)) return open('/(tabs)/wellness.mood', 'Mood');
    if (/(open|go to).*(ratings|reviews)/.test(text)) return open('/(tabs)/advocacy/ratings', 'Ratings');
    if (/(open|go to).*(advocacy|campaigns?)/.test(text)) return open('/(tabs)/advocacy', 'Advocacy');
    if (/(open|go to).*(community|mutual)/.test(text)) return open('/(tabs)/community', 'Community');
    if (/(open|go to).*(media|studio)/.test(text)) return open('/(tabs)/community/media-studio', 'Media Studio');
    if (/(open|go to).*(mutual aid)/.test(text)) return open('/(tabs)/community/mutual-aid', 'Mutual Aid');
    if (/(open|go to).*(world map|map)/.test(text)) return open('/(tabs)/advocacy/world-map', 'World Map');
    if (/open.*admin.*pending/.test(text)) return open('/(tabs)/admin?tab=pending', 'Admin • Pending');
    if (/open.*admin.*approved/.test(text)) return open('/(tabs)/admin?tab=approved', 'Admin • Approved');
    if (/open.*admin.*trash|deleted/.test(text)) return open('/(tabs)/admin?tab=trash', 'Admin • Trash');
    if (/(open|go to).*(settings)/.test(text)) return open('/(tabs)/settings', 'Settings');
    if (/(open|go to).*(rights|explainer)/.test(text)) return open('/(tabs)/resources/rights-explainer', 'Rights Explainer');
    if (/(open|go to).*(doctor|visit|prep)/.test(text)) return open('/(tabs)/resources/doctor-visit-prep', 'Doctor Visit Prep');
    if (/(open|go to).*(accessibility log|work log)/.test(text)) return open('/(tabs)/resources/accessibility-log', 'Accessibility Log');
    if (/(open|go to).*(rehab|progress)/.test(text)) return open('/(tabs)/resources/rehab-tracker', 'Rehab Tracker');
    if (/\b(back|go back|previous)\b/.test(text)) { try { router.back(); return { handled: true, label: 'Back' }; } catch { return { handled: false }; }
    }
    return { handled: false };
  }, [voiceMode]);

  return { voiceMode, handleVoiceCommand };
}
