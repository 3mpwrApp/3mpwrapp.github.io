import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

app.get('/', (_req, res) => res.send('EmpowrApp server ok'));

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
