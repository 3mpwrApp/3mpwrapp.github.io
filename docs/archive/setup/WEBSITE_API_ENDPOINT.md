/**
 * Real-time Events API Endpoint
 * 
 * Deploy this to your Next.js website to provide real-time event data.
 * 
 * Endpoints:
 * - GET /api/events.json - JSON list of all events
 * - GET /api/events.ics - iCalendar format (for calendar subscriptions)
 * - GET /api/events/[id] - Single event details
 * 
 * Example deploy with Cloudflare Workers:
 * Save to /public/api/events.json and set up a Cron trigger
 */

// pages/api/events.json.ts (for Next.js)
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

interface EventData {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
  category?: string;
  tags?: string[];
}

interface ApiResponse {
  events: EventData[];
  lastUpdated: string;
  count: number;
  source: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    res.status(405).json({
      events: [],
      lastUpdated: new Date().toISOString(),
      count: 0,
      source: 'error',
    });
    return;
  }

  try {
    // Set cache headers for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('Content-Type', 'application/json');

    // Query Firestore for all events, ordered by date
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, orderBy('date', 'asc'));
    const snapshot = await getDocs(q);

    const events: EventData[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: data.date || '',
        location: data.location,
        isVirtual: data.isVirtual,
        asl: data.asl,
        captions: data.captions,
        stepFree: data.stepFree,
        sensorySpace: data.sensorySpace,
        category: data.category,
        tags: data.tags,
      });
    });

    res.status(200).json({
      events,
      lastUpdated: new Date().toISOString(),
      count: events.length,
      source: 'firestore-realtime',
    });
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({
      events: [],
      lastUpdated: new Date().toISOString(),
      count: 0,
      source: 'error',
    });
  }
}
