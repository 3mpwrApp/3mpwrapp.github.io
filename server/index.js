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

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server listening on ${port}`));

