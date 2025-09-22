#!/usr/bin/env node
/**
 * seed-faqs.js
 * Imports static FAQs from data/faqs.ts into Firestore 'faqs' collection
 * if they are missing. Will not overwrite existing docs.
 */
const path = require('path');
const fs = require('fs');

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc } = require('firebase/firestore');

// Basic env expectation: FIREBASE_API_KEY etc already configured via process.env or .env + config.ts not reused here.
// For simplicity we read firebase/config.ts to extract config object via regex (lightweight, avoids TS transpile).
const configPath = path.join(__dirname,'..','firebase','config.ts');
const rawCfg = fs.readFileSync(configPath,'utf8');
const match = rawCfg.match(/initializeApp\((\{[\s\S]*?\})/);
if(!match){
  console.error('Could not parse firebase config from config.ts');
  process.exit(1);
}
let firebaseConfig; try { firebaseConfig = eval('('+match[1]+')'); } catch(e){ console.error('Failed to eval firebase config',e); process.exit(1); }
initializeApp(firebaseConfig);
const db = getFirestore();

// Dynamic import of TS source: do quick strip to transform export syntax to CommonJS for eval.
const faqsTs = fs.readFileSync(path.join(__dirname,'..','data','faqs.ts'),'utf8');
// Extract array literal
const arrMatch = faqsTs.match(/export const faqs: Faq[] = (\[[\s\S]*?\]);/);
if(!arrMatch){ console.error('Failed to locate static faqs array'); process.exit(1); }
let faqs; try { faqs = eval(arrMatch[1]); } catch(e){ console.error('Eval failed parsing FAQs', e); process.exit(1); }

(async () => {
  let created = 0, skipped = 0;
  for (const f of faqs) {
    const ref = doc(db,'faqs', f.id);
    const snap = await getDoc(ref);
    if (snap.exists()) { skipped++; continue; }
    const now = Date.now();
    await setDoc(ref, { ...f, tags: [], locale: null, createdAt: now, updatedAt: now, source: 'static' });
    created++;
  }
  console.log(`FAQ seed complete. Created: ${created}, skipped (already existed): ${skipped}`);
})();
