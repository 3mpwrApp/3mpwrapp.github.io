import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.get('/', (_req, res) => res.send('EmpowrApp server ok'));

// Derive a video thumbnail if possible (YouTube only); otherwise return 204
app.get('/video-thumb', async (req, res) => {
  try {
    const url = String(req.query.url || '');
    if (/youtu\.be\//i.test(url)) {
      const id = url.split('/').pop().split('?')[0];
      return res.json({ thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` });
    }
    if (/youtube\.com\/watch\?v=/i.test(url)) {
      const u = new URL(url);
      const id = u.searchParams.get('v');
      if (id) return res.json({ thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg` });
    }
    return res.status(204).end();
  } catch {
    return res.status(204).end();
  }
});

// Simple web crawler: fetch URL and extract title + meta description + links
app.get('/crawl', async (req, res) => {
  try {
    const url = String(req.query.url || '');
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ error: 'invalid url' });
    const html = await (await fetch(url)).text();
    const cheerio = (await import('cheerio')).default;
    const $ = cheerio.load(html);
    const title = $('title').first().text().trim();
    const desc = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '';
    const links = [];
    $('a[href]').slice(0, 50).each((_, a) => { const href = $(a).attr('href'); if (href) links.push(href); });
    res.json({ title, description: desc, links });
  } catch (e) {
    res.status(500).json({ error: 'crawl failed' });
  }
});

// Simple analyzer stub: returns generic ergonomic suggestions
app.post('/analyze-body', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    // In a real implementation, run on-device ML or forward to a secure ML service.
    const name = req.file.originalname || 'video';
    const base = [
      'Maintain neutral wrists and avoid prolonged flexion when typing.',
      'Hinge at the hips and keep the load close when lifting.',
      'Adopt pacing: activity blocks of 20–30 minutes followed by rest.',
    ];
    if (/lift|box|carry/i.test(name)) base.unshift('Use your legs and core; avoid twisting with a load.');
    return res.json({ suggestions: base });
  } catch (e) {
    return res.status(500).json({ error: 'analysis failed' });
  }
});

// Decode denial letters; accepts optional province for jurisdictional template
app.post('/decode-denial', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const province = req.body.province || 'GEN';
    const text = await extractTextFromBuffer(req.file.buffer, req.file.mimetype || 'application/octet-stream');
    const summary = text
      ? `Summary (OCR): ${text.slice(0, 280)}...`
      : 'This letter outlines a denied claim. Common reasons include insufficient medical evidence, missed deadlines, or non‑work‑related determination.';
    const next = [
      'Request your full claim file',
      'Gather medical notes addressing the listed reasons',
      `File a reconsideration/appeal within the deadline (${province})`,
    ];
    const templates = {
      ON: 'Dear WSIB, I request reconsideration of my claim decision (Claim #[ID]). I attach updated medical evidence addressing the stated reasons. Please review and provide reasons. Sincerely, [Name] ',
      BC: 'Dear WorkSafeBC, I request a review of my claim decision. I attach medical documentation addressing the denial. Please confirm timelines and next steps. Sincerely, [Name]',
      GEN: 'Dear Claims Officer, I request reconsideration of my claim decision. Key points: [facts/evidence]. Sincerely, [Name]',
    };
    return res.json({ summary, next, template: templates[province] || templates.GEN });
  } catch (e) {
    return res.status(500).json({ error: 'decode failed' });
  }
});
async function extractTextFromBuffer(buf, mime) {
  // Try PDF first
  if (/pdf/i.test(mime)) {
    try { const pdf = await import('pdf-parse'); const data = await pdf.default(buf); return String(data.text || ''); } catch {}
  }
  // Try OCR with tesseract for images
  if (/image\//i.test(mime)) {
    try { const T = await import('tesseract.js'); const { createWorker } = T; const worker = await createWorker(); await worker.loadLanguage('eng'); await worker.initialize('eng'); const { data } = await worker.recognize(buf); await worker.terminate(); return String(data?.text || ''); } catch {}
  }
  return '';
}

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on ${port}`));

// Optional: FCM webhook for server-based notifications
try {
  // Initialize admin only if service account available
  let admin;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    admin = await import('firebase-admin');
    if (!admin.apps?.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }
  app.post('/notify-chat', express.json(), async (req, res) => {
    try {
      if (!admin) return res.status(200).json({ status: 'noop' });
      const { token, title, body, data } = req.body || {};
      if (!token) return res.status(400).json({ error: 'token required' });
      const id = await admin.messaging().send({ token, notification: { title, body }, data: data || {} });
      res.json({ id });
    } catch (e) {
      res.status(500).json({ error: 'notify failed' });
    }
  });

  // Expo push helper
  let expo = null;
  try { expo = (await import('expo-server-sdk')).Expo; } catch {}
  app.post('/notify-expo', express.json(), async (req, res) => {
    try {
      if (!expo) return res.status(200).json({ status: 'noop' });
      const { tokens = [], title, body, data } = req.body || {};
      const ex = new expo();
      const messages = tokens.map((token) => ({ to: token, sound: 'default', title, body, data }));
      const chunks = ex.chunkPushNotifications(messages);
      const tickets = [];
      for (const chunk of chunks) { tickets.push(await ex.sendPushNotificationsAsync(chunk)); }
      res.json({ tickets });
    } catch (e) { res.status(500).json({ error: 'expo notify failed' }); }
  });

  // Notify all participants of a mutual-aid chat (except author)
  app.post('/notify-chat-post', express.json(), async (req, res) => {
    try {
      const { postId, fromUid, message } = req.body || {};
      if (!postId) return res.status(400).json({ error: 'postId required' });
      // Read presence to find participants
      const firestore = (await admin?.firestore?.()) || null;
      if (!firestore) return res.status(200).json({ status: 'noop' });
      const docRef = firestore.collection('mutual_aid_posts').doc(String(postId));
      const [presSnap, partSnap] = await Promise.all([
        docRef.collection('presence').get(),
        docRef.collection('participants').get(),
      ]);
      const uidSet = new Set();
      presSnap.docs.forEach((d)=> uidSet.add(d.id));
      partSnap.docs.forEach((d)=> uidSet.add(d.id));
      const uids = Array.from(uidSet).filter((uid) => uid && uid !== fromUid);
      // Load tokens
      const tokensSnap = await firestore.getAll(...uids.map((uid) => firestore.collection('user_tokens').doc(uid)));
      const expoTokens = [], fcmTokens = [];
      tokensSnap.forEach((doc) => { const v = doc.data() || {}; if (v.expo) expoTokens.push(v.expo); if (v.fcm) fcmTokens.push(v.fcm); });
      // Send expo
      if (expo && expoTokens.length) {
        const Ex = (await import('expo-server-sdk')).Expo; const ex = new Ex();
        const messages = expoTokens.map((t) => ({ to: t, sound: 'default', title: 'New message', body: String(message||'New chat message'), data: { postId } }));
        const chunks = ex.chunkPushNotifications(messages);
        for (const chunk of chunks) { await ex.sendPushNotificationsAsync(chunk); }
      }
      // Send FCM
      if (admin && fcmTokens.length) {
        await admin.messaging().sendEachForMulticast({ tokens: fcmTokens, notification: { title: 'New message', body: String(message||'New chat message') }, data: { postId: String(postId) } });
      }
      res.json({ ok: true, expo: expoTokens.length, fcm: fcmTokens.length });
    } catch (e) {
      res.status(500).json({ error: 'notify-chat-post failed' });
    }
  });

  // Backdate wellness reflection for a user (admin SDK)
  app.post('/wellness/add-reflection', express.json(), async (req, res) => {
    try {
      if (!admin) return res.status(200).json({ status: 'noop' });
      const { uid, mood, note = '', createdAtISO } = req.body || {};
      if (!uid || !mood) return res.status(400).json({ error: 'uid and mood required' });
      const firestore = (await admin?.firestore?.()) || null;
      if (!firestore) return res.status(200).json({ status: 'noop' });
      const ts = createdAtISO ? admin.firestore.Timestamp.fromDate(new Date(createdAtISO)) : admin.firestore.FieldValue.serverTimestamp();
      const ref = await firestore.collection('users').doc(String(uid)).collection('wellness_reflections').add({ mood, note: String(note||''), createdAt: ts });
      return res.json({ ok: true, id: ref.id });
    } catch (e) {
      return res.status(500).json({ error: 'add-reflection failed' });
    }
  });
} catch {}
/* eslint-disable import/no-unresolved */
