declare module 'pdf-parse' {
  interface PDFResult { text: string; [k: string]: any }
  function pdf(data: Buffer | Uint8Array | ArrayBuffer, options?: any): Promise<PDFResult>;
  export = pdf;
}
