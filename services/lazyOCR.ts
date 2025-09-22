// Lazy wrapper around tesseract.js to avoid bundling cost until needed
let _tesseract: any;
export async function ensureTesseract() {
  if (_tesseract) return _tesseract;
  try {
    _tesseract = await import('tesseract.js');
    return _tesseract;
  } catch {
    return null;
  }
}
export async function recognize(imageUri: string, lang = 'eng') {
  const lib = await ensureTesseract();
  if (!lib) return { ok:false as const, reason:'unavailable' };
  try {
    const { createWorker } = lib;
    const worker = await createWorker();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);
    const result = await worker.recognize(imageUri);
    await worker.terminate();
    return { ok:true as const, text: result?.data?.text || '' };
  } catch {
    return { ok:false as const, reason:'error' };
  }
}
