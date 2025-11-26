/**
 * Accommodation Negotiation Coach Service
 * 
 * Real-time guidance during accommodation meetings.
 * Three phases: Pre-meeting prep, live coach mode, post-meeting debrief.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioModule, AudioRecorder } from 'expo-audio';

export interface NegotiationSession {
  id: string;
  type: 'accommodation-request' | 'appeal-hearing' | 'disability-disclosure' | 'performance-review';
  employer: string;
  participantRoles: string[]; // ['HR', 'Manager', 'Union Rep']
  accommodationsRequested: string[];
  phase: 'prep' | 'live' | 'debrief' | 'completed';
  startTime: number;
  endTime?: number;
  recordingUri?: string;
  transcript?: string;
  notes: SessionNote[];
  outcomes: SessionOutcome[];
  coachSuggestions: CoachSuggestion[];
}

export interface SessionNote {
  id: string;
  timestamp: number;
  type: 'red-flag' | 'positive' | 'neutral' | 'action-item';
  text: string;
  tags: string[];
}

export interface SessionOutcome {
  accommodation: string;
  status: 'approved' | 'denied' | 'deferred' | 'modified';
  details?: string;
  timeline?: string;
}

export interface CoachSuggestion {
  id: string;
  phase: 'prep' | 'live' | 'debrief';
  category: 'script' | 'reframe' | 'red-flag' | 'follow-up' | 'evidence';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  dismissed: boolean;
}

const SESSIONS_KEY = 'coach:sessions:v1';

/**
 * Start a new negotiation session
 */
export async function startSession(
  type: NegotiationSession['type'],
  employer: string,
  accommodationsRequested: string[]
): Promise<NegotiationSession> {
  const session: NegotiationSession = {
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    employer,
    participantRoles: [],
    accommodationsRequested,
    phase: 'prep',
    startTime: Date.now(),
    notes: [],
    outcomes: [],
    coachSuggestions: [],
  };
  
  // Generate prep suggestions
  session.coachSuggestions = generatePrepSuggestions(type, accommodationsRequested);
  
  await saveSession(session);
  return session;
}

/**
 * Generate pre-meeting prep suggestions
 */
function generatePrepSuggestions(
  _type: NegotiationSession['type'],
  _accommodations: string[]
): CoachSuggestion[] {
  const suggestions: CoachSuggestion[] = [];
  
  // Opening script
  suggestions.push({
    id: `prep_script_${Date.now()}`,
    phase: 'prep',
    category: 'script',
    title: 'Opening Statement',
    content: `"Thank you for meeting with me today. I'd like to discuss some accommodations that would help me perform at my best. I've documented how these would address specific barriers I'm experiencing."`,
    priority: 'high',
    timestamp: Date.now(),
    dismissed: false,
  });
  
  // Frame accommodations as business benefit
  suggestions.push({
    id: `prep_reframe_${Date.now()}`,
    phase: 'prep',
    category: 'reframe',
    title: 'Frame as Win-Win',
    content: 'Emphasize: "These accommodations will enable me to contribute more effectively and reduce absenteeism." Focus on business outcomes, not just your needs.',
    priority: 'high',
    timestamp: Date.now(),
    dismissed: false,
  });
  
  // Red flags to watch for
  suggestions.push({
    id: `prep_redflags_${Date.now()}`,
    phase: 'prep',
    category: 'red-flag',
    title: 'Red Flags to Watch For',
    content: 'Be alert if they say: "This would be too disruptive", "Others might want the same thing", "We need to treat everyone equally". These may indicate bias or misunderstanding of legal obligations.',
    priority: 'medium',
    timestamp: Date.now(),
    dismissed: false,
  });
  
  // Bring evidence
  suggestions.push({
    id: `prep_evidence_${Date.now()}`,
    phase: 'prep',
    category: 'evidence',
    title: 'Bring Documentation',
    content: 'Have ready: Medical documentation, specific examples of barriers, research on accommodations, relevant company policies, ADA/state law summaries.',
    priority: 'high',
    timestamp: Date.now(),
    dismissed: false,
  });
  
  return suggestions;
}

/**
 * Enter live coaching mode
 */
export async function enterLiveMode(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;
  
  session.phase = 'live';
  
  // Generate live coaching suggestions
  session.coachSuggestions.push(
    {
      id: `live_record_${Date.now()}`,
      phase: 'live',
      category: 'evidence',
      title: 'Start Recording',
      content: 'If legally permitted in your state, consider recording the meeting for your records. Announce: "I\'m recording this for accuracy."',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    },
    {
      id: `live_notes_${Date.now()}`,
      phase: 'live',
      category: 'evidence',
      title: 'Take Notes',
      content: 'Document: Who said what, promises made, concerns raised, timeline commitments, next steps.',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    }
  );
  
  await saveSession(session);
}

/**
 * Add a live note during meeting
 */
export async function addLiveNote(
  sessionId: string,
  type: SessionNote['type'],
  text: string,
  tags: string[] = []
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;
  
  const note: SessionNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    type,
    text,
    tags,
  };
  
  session.notes.push(note);
  
  // Generate contextual coaching based on note
  if (type === 'red-flag') {
    session.coachSuggestions.push({
      id: `live_redflag_response_${Date.now()}`,
      phase: 'live',
      category: 'reframe',
      title: 'Respond to Red Flag',
      content: 'Try: "I understand your concern. Let\'s discuss how we can address that while still meeting the legal requirement for reasonable accommodation. What specific issue are you worried about?"',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    });
  }
  
  await saveSession(session);
}

/**
 * Start recording (if permitted)
 */
export async function startRecording(sessionId: string): Promise<void> {
  try {
    // Request permissions using expo-audio
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      throw new Error('Recording permission not granted');
    }
    
    // Create audio recorder with high quality preset
    const _recorder = new AudioRecorder({
      android: {
        extension: '.m4a',
        outputFormat: 2, // MPEG_4
        audioEncoder: 3, // AAC
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: 'mpeg4AAC',
        audioQuality: 'max',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    });
    
    const session = await getSession(sessionId);
    if (!session) return;
    
    // Store recording reference
    // In production, would handle the recording object properly
    session.notes.push({
      id: `note_recording_started_${Date.now()}`,
      timestamp: Date.now(),
      type: 'neutral',
      text: 'Recording started',
      tags: ['recording'],
    });
    
    await saveSession(session);
  } catch (error) {
    console.error('Failed to start recording:', error);
  }
}

/**
 * End session and enter debrief
 */
export async function endSession(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;
  
  session.phase = 'debrief';
  session.endTime = Date.now();
  
  // Generate debrief suggestions
  session.coachSuggestions.push(
    {
      id: `debrief_followup_${Date.now()}`,
      phase: 'debrief',
      category: 'follow-up',
      title: 'Send Follow-Up Email',
      content: 'Within 24 hours, send an email summarizing: What was agreed, timeline for each item, any concerns raised, next steps. This creates a paper trail.',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    },
    {
      id: `debrief_evidence_${Date.now()}`,
      phase: 'debrief',
      category: 'evidence',
      title: 'Save to Evidence Locker',
      content: 'Upload your notes, recording (if any), and follow-up email to your Evidence Locker for future reference.',
      priority: 'medium',
      timestamp: Date.now(),
      dismissed: false,
    },
    {
      id: `debrief_review_${Date.now()}`,
      phase: 'debrief',
      category: 'follow-up',
      title: 'Review Outcomes',
      content: 'Mark each requested accommodation as: Approved, Denied, Deferred, or Modified. Track follow-up deadlines.',
      priority: 'high',
      timestamp: Date.now(),
      dismissed: false,
    }
  );
  
  await saveSession(session);
}

/**
 * Add session outcome
 */
export async function addOutcome(
  sessionId: string,
  outcome: Omit<SessionOutcome, 'id'>
): Promise<void> {
  const session = await getSession(sessionId);
  if (!session) return;
  
  session.outcomes.push(outcome);
  await saveSession(session);
}

/**
 * Get session by ID
 */
export async function getSession(id: string): Promise<NegotiationSession | null> {
  const sessions = await getAllSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * Get all sessions
 */
export async function getAllSessions(): Promise<NegotiationSession[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save session
 */
async function saveSession(session: NegotiationSession): Promise<void> {
  const sessions = await getAllSessions();
  const index = sessions.findIndex(s => s.id === session.id);
  
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }
  
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Generate post-meeting email template
 */
export function generateFollowUpEmail(session: NegotiationSession): string {
  const date = new Date(session.startTime).toLocaleDateString();
  
  let email = `Subject: Follow-up: Accommodation Discussion - ${date}\n\n`;
  email += `Dear [Name],\n\n`;
  email += `Thank you for meeting with me on ${date} to discuss workplace accommodations. `;
  email += `I wanted to recap our discussion to ensure we're aligned:\n\n`;
  
  if (session.outcomes.length > 0) {
    email += `ACCOMMODATIONS DISCUSSED:\n`;
    for (const outcome of session.outcomes) {
      email += `\n• ${outcome.accommodation}\n`;
      email += `  Status: ${outcome.status}\n`;
      if (outcome.timeline) {
        email += `  Timeline: ${outcome.timeline}\n`;
      }
      if (outcome.details) {
        email += `  Details: ${outcome.details}\n`;
      }
    }
  }
  
  email += `\n\nNEXT STEPS:\n`;
  email += `[List agreed-upon action items and deadlines]\n\n`;
  
  email += `Please let me know if I've missed anything or if you remember the discussion differently. `;
  email += `I appreciate your support in helping me perform at my best.\n\n`;
  email += `Best regards,\n[Your name]`;
  
  return email;
}

/**
 * Get script templates
 */
export function getScriptTemplates(): Record<string, string> {
  return {
    'request-flexibility': 'I\'m requesting [flexible schedule/remote work] as an accommodation for my disability. This would allow me to [manage symptoms/attend appointments/maintain productivity]. Based on my role\'s requirements, this is feasible because [specific reasons].',
    
    'respond-to-pushback': 'I understand your concern about [their objection]. However, under the ADA, the focus should be on whether the accommodation is reasonable and effective, not whether it\'s unusual or different from standard practice. Can we explore how to address your concern while still meeting my needs?',
    
    'escalate-denial': 'I appreciate you considering my request. However, I believe [accommodation] is reasonable under the ADA. If we can\'t reach agreement today, I\'d like to understand the formal process for requesting review of this decision.',
    
    'request-interim': 'While we work on the formal accommodation process, would it be possible to implement an interim solution? For example, [specific temporary measure]. This would help me continue contributing while we finalize the permanent arrangement.',
  };
}
