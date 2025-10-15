import { Alert, Platform } from 'react-native';

import { logger } from '../utils/logger';

let FileSystem: any;
try { FileSystem = require('expo-file-system'); } catch { FileSystem = null; }

// Attempts to call a backend STT endpoint with base64 audio payload.
// Expects env EXPO_PUBLIC_API_BASE and a POST /stt { filename, contentType, dataBase64 }
export async function transcribeAudio(uri: string): Promise<string | null> {
  try {
    const base = process.env.EXPO_PUBLIC_API_BASE;
    if (!base) throw new Error('No API base configured');
  if (!FileSystem) throw new Error('FileSystem module not available');
  const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) throw new Error('Audio file not found');
    const dataBase64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const filename = uri.split('/').pop() || 'audio.m4a';
    const contentType = Platform.OS === 'ios' ? 'audio/m4a' : 'audio/3gpp';
    const res = await fetch(`${base.replace(/\/$/,'')}/stt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType, dataBase64 })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json.text as string) || null;
  } catch (e) {
    logger.warn('STT failed', e);
    Alert.alert('Transcription unavailable', 'Configure EXPO_PUBLIC_API_BASE and backend /stt to enable transcription.');
    return null;
  }
}

