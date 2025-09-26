// Type augmentation for expo-file-system dynamic import patterns used in the app.
// We frequently do: const FS = await import('expo-file-system'); then access
// FS.cacheDirectory, FS.EncodingType, FS.writeAsStringAsync, etc.  The emitted
// module types sometimes surface only the namespace shape requiring default import.
// This declaration merges to ensure those properties exist for both namespace and default forms.

import 'expo-file-system';

// We augment so dynamic namespace imports (const FS = await import('expo-file-system')) work with
// FS.cacheDirectory, FS.EncodingType.UTF8, etc. without sprinkling `as any` everywhere.
// Use literal union for encoding so TS accepts passing FS.EncodingType.UTF8 to options.
declare module 'expo-file-system' {
  export type EncodingLiteral = 'utf8' | 'base64';
  // top-level constant already exists at runtime; we just refine literal types
  export namespace EncodingType {
    const UTF8: 'utf8';
    const Base64: 'base64';
  }
  export const cacheDirectory: string | null | undefined;
  export const documentDirectory: string | null | undefined;

  interface WriteOptions { encoding?: 'utf8' | 'base64' | EncodingLiteral; }
  interface ReadOptions { encoding?: 'utf8' | 'base64' | EncodingLiteral; }

  // Ensure default export shape (FS.default) exposes same surface (non-optional for convenience)
  const _default: {
    cacheDirectory?: string | null;
    documentDirectory?: string | null;
    EncodingType: { UTF8: 'utf8'; Base64: 'base64' };
    writeAsStringAsync: (fileUri: string, contents: string, options?: WriteOptions) => Promise<void>;
    readAsStringAsync: (fileUri: string, options?: ReadOptions) => Promise<string>;
  } & Record<string, any>;
  export default _default;
}
