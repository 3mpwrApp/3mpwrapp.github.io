/**
 * Backend API for AI Agent Sync
 * 
 * Simple Express.js server that syncs AI agent data between app and website
 * Can be deployed to Vercel, Netlify Functions, or any Node.js host
 */

const express = require('express');
const cors = require('cors');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin (if using Firebase)
// initializeApp({
//   credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
// });
// const db = getFirestore();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Simple in-memory store (replace with database in production)
const syncStore = new Map();

// ============================================
// SYNC ENDPOINTS
// ============================================

app.post('/sync/upload', async (req, res) => {
  try {
    const { userId, conversations, context, timestamp, source } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Store in memory (replace with database)
    const userData = syncStore.get(userId) || { conversations: [], context: {} };
    
    // Merge conversations (keep newest)
    for (const conv of conversations) {
      const existingIndex = userData.conversations.findIndex(c => c.id === conv.id);
      if (existingIndex >= 0) {
        if (conv.updatedAt > userData.conversations[existingIndex].updatedAt) {
          userData.conversations[existingIndex] = conv;
        }
      } else {
        userData.conversations.push(conv);
      }
    }

    // Update context
    userData.context = { ...userData.context, ...context };
    userData.lastSync = timestamp;
    userData.lastSyncSource = source;

    syncStore.set(userId, userData);

    /* Firebase version:
    await db.collection('aiAgentSync').doc(userId).set({
      conversations: userData.conversations,
      context: userData.context,
      lastSync: timestamp,
      lastSyncSource: source
    }, { merge: true });
    */

    res.json({
      success: true,
      synced: conversations.length,
      timestamp
    });
  } catch (error) {
    console.error('Upload sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.post('/sync/download', async (req, res) => {
  try {
    const { userId, timestamp } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Get from memory (replace with database)
    const userData = syncStore.get(userId) || { conversations: [], context: {} };

    /* Firebase version:
    const doc = await db.collection('aiAgentSync').doc(userId).get();
    const userData = doc.exists ? doc.data() : { conversations: [], context: {} };
    */

    // Filter conversations updated since timestamp
    const updatedConversations = timestamp
      ? userData.conversations.filter(c => c.updatedAt > timestamp)
      : userData.conversations;

    res.json({
      success: true,
      conversations: updatedConversations,
      context: userData.context,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Download sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

app.post('/sync/delete', async (req, res) => {
  try {
    const { userId, conversationId } = req.body;

    if (!userId || !conversationId) {
      return res.status(400).json({ error: 'userId and conversationId required' });
    }

    const userData = syncStore.get(userId);
    if (userData) {
      userData.conversations = userData.conversations.filter(c => c.id !== conversationId);
      syncStore.set(userId, userData);
    }

    /* Firebase version:
    const doc = await db.collection('aiAgentSync').doc(userId).get();
    if (doc.exists) {
      const userData = doc.data();
      userData.conversations = userData.conversations.filter(c => c.id !== conversationId);
      await db.collection('aiAgentSync').doc(userId).set(userData);
    }
    */

    res.json({ success: true });
  } catch (error) {
    console.error('Delete sync error:', error);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-agent-sync' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AI Agent Sync API running on port ${PORT}`);
});

module.exports = app;
