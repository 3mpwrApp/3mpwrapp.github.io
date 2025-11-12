/**
 * Voice-First Mode Service
 * 
 * Hands-free accessibility mode for voice navigation and data entry
 */

import { router } from 'expo-router';
import * as Speech from 'expo-speech';

export interface VoiceCommand {
  phrases: string[];
  action: () => void;
  description: string;
}

/**
 * Voice navigation commands
 */
export const VOICE_COMMANDS: VoiceCommand[] = [
  {
    phrases: ['open mood tracker', 'mood tracker', 'track mood'],
    action: () => router.push('/(tabs)/wellness/mood-tracker'),
    description: 'Open mood tracking',
  },
  {
    phrases: ['open pacing partner', 'pacing partner', 'track energy'],
    action: () => router.push('/(tabs)/wellness/pacing-partner'),
    description: 'Open pacing partner',
  },
  {
    phrases: ['open evidence locker', 'evidence locker', 'my documents'],
    action: () => router.push('/(tabs)/resources/evidence-locker'),
    description: 'Open evidence locker',
  },
  {
    phrases: ['open letter wizard', 'letter wizard', 'write letter'],
    action: () => router.push('/(tabs)/resources/letter-wizard'),
    description: 'Open letter generator',
  },
  {
    phrases: ['go home', 'home screen', 'main screen'],
    action: () => router.push('/(tabs)/'),
    description: 'Navigate to home',
  },
  {
    phrases: ['open settings', 'settings', 'preferences'],
    action: () => router.push('/(tabs)/settings'),
    description: 'Open settings',
  },
  {
    phrases: ['open community', 'community', 'chat'],
    action: () => router.push('/(tabs)/community'),
    description: 'Open community',
  },
];

/**
 * Process voice command and execute action
 */
export function processVoiceCommand(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  for (const command of VOICE_COMMANDS) {
    for (const phrase of command.phrases) {
      if (lowerTranscript.includes(phrase)) {
        command.action();
        speak(`Opening ${command.description}`);
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Speak text aloud
 */
export function speak(text: string, options?: { rate?: number; pitch?: number }) {
  Speech.speak(text, {
    language: 'en-US',
    rate: options?.rate || 1.0,
    pitch: options?.pitch || 1.0,
  });
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
  Speech.stop();
}

/**
 * Parse voice mood entry
 * Example: "Log mood score minus 2 feeling anxious slept 4 hours"
 */
export function parseMoodEntry(transcript: string): {
  score: number | null;
  mood: string | null;
  sleep: number | null;
  notes: string | null;
} | null {
  const lowerText = transcript.toLowerCase();
  
  // Extract score
  let score: number | null = null;
  const scoreMatch = lowerText.match(/score\s+(minus\s+)?(\d+)/);
  if (scoreMatch) {
    score = scoreMatch[1] ? -parseInt(scoreMatch[2]) : parseInt(scoreMatch[2]);
  }
  
  // Extract mood feeling
  const moods = ['anxious', 'happy', 'sad', 'angry', 'tired', 'energetic', 'calm', 'stressed'];
  let mood: string | null = null;
  for (const m of moods) {
    if (lowerText.includes(m)) {
      mood = m;
      break;
    }
  }
  
  // Extract sleep hours
  let sleep: number | null = null;
  const sleepMatch = lowerText.match(/slept?\s+(\d+)\s+hours?/);
  if (sleepMatch) {
    sleep = parseInt(sleepMatch[1]);
  }
  
  return { score, mood, sleep, notes: transcript };
}

/**
 * Parse voice pacing entry
 * Example: "Log activity walking 30 minutes fatigue 7 pain 3"
 */
export function parsePacingEntry(transcript: string): {
  activity: string | null;
  duration: number | null;
  fatigue: number | null;
  pain: number | null;
} | null {
  const lowerText = transcript.toLowerCase();
  
  // Extract activity type
  const activities = ['walking', 'sitting', 'standing', 'exercise', 'work', 'rest', 'housework'];
  let activity: string | null = null;
  for (const a of activities) {
    if (lowerText.includes(a)) {
      activity = a;
      break;
    }
  }
  
  // Extract duration
  let duration: number | null = null;
  const durationMatch = lowerText.match(/(\d+)\s+minutes?/);
  if (durationMatch) {
    duration = parseInt(durationMatch[1]);
  }
  
  // Extract fatigue level
  let fatigue: number | null = null;
  const fatigueMatch = lowerText.match(/fatigue\s+(\d+)/);
  if (fatigueMatch) {
    fatigue = parseInt(fatigueMatch[1]);
  }
  
  // Extract pain level
  let pain: number | null = null;
  const painMatch = lowerText.match(/pain\s+(\d+)/);
  if (painMatch) {
    pain = parseInt(painMatch[1]);
  }
  
  return { activity, duration, fatigue, pain };
}

/**
 * Get available voice commands as spoken list
 */
export function getVoiceCommandsHelp(): string {
  return VOICE_COMMANDS.map((cmd, i) => 
    `${i + 1}. Say "${cmd.phrases[0]}" to ${cmd.description}`
  ).join('. ');
}
