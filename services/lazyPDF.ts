// Lazy wrapper for pdf-parse to defer heavy dependency cost
let _pdfParse: any;
export async function ensurePdfParse() {
  if (_pdfParse) return _pdfParse;
  try {
    _pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
    return _pdfParse;
  } catch {
    return null;
  }
}
export async function extractText(buffer: ArrayBuffer) {
  const mod = await ensurePdfParse();
  if (!mod) return { ok:false as const, reason:'unavailable' };
  try {
    // pdf-parse expects a Buffer; convert ArrayBuffer
    const buf = Buffer.from(buffer as any);
    const res = await mod(buf);
    return { ok:true as const, text: res?.text || '' };
  } catch {
    return { ok:false as const, reason:'error' };
  }
}
