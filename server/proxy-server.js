/**
 * Local Express server to proxy Firestore queries for Cloudflare Worker
 * Runs on localhost:3000
 */

import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Firebase
const serviceAccountPath = path.join(__dirname, '.firebase-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// GET /api/events - Query events from Firestore
app.get('/api/events', async (req, res) => {
  try {
    const environment = req.query.env || 'production';
    const collectionName = environment === 'preview' ? 'events_preview' : 'events_production';
    const category = req.query.category;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;

    let query = db.collection(collectionName).where('status', '==', 'published');

    if (category) {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('date', 'asc').limit(limit * 10);

    const snapshot = await query.get();
    const events = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      events.push({
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        date: data.date?.toDate?.() || data.date,
        endDate: data.endDate?.toDate?.() || null,
        location: data.location || '',
        category: data.category || 'community',
        isVirtual: data.isVirtual || false,
        url: data.url || '',
        organizer: data.organizer || '3mpwrApp',
        imageUrl: data.imageUrl || '',
        attendeeCount: data.attendeeCount || 0,
        tags: data.tags || [],
      });
    });

    // Apply pagination
    const start = (page - 1) * limit;
    const paginated = events.slice(start, start + limit);

    res.json({
      events: paginated,
      pagination: {
        page,
        limit,
        total: events.length,
        pages: Math.ceil(events.length / limit),
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'Local Firestore Proxy',
      },
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /health - Health check
app.get('/health', async (req, res) => {
  res.json({
    ok: true,
    service: '3mpwrApp Firestore Proxy',
    timestamp: new Date().toISOString(),
    firebaseConnected: true,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Firestore proxy server listening on http://localhost:${PORT}`);
  console.log(`   GET /api/events - Fetch events`);
  console.log(`   GET /health - Health check`);
});
