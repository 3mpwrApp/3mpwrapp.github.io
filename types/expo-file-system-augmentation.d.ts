// Type augmentation for expo-file-system dynamic import patterns used in the app.
// We frequently do: const FS = await import('expo-file-system'); then access
// FS.cacheDirectory, FS.EncodingType, FS.writeAsStringAsync, etc.  The emitted
// module types sometimes surface only the namespace shape requiring default import.
// This declaration merges to ensure those properties exist for both namespace and default forms.

import 'expo-file-system';

declare module 'expo-file-system' {
  // Ensure top-level (namespace) export has these fields (already present at runtime)
  export const cacheDirectory: string | undefined;
  export namespace EncodingType {
    const UTF8: string;
    const Base64: string;
  }
  // Provide interface for default export when imported as a value (FS.default)
  // so that FS.default.cacheDirectory and FS.default.EncodingType are recognized.
  const _default: {
    cacheDirectory?: string;
    EncodingType?: { UTF8: string; Base64: string };
    writeAsStringAsync?: (fileUri: string, contents: string, options?: { encoding?: string }) => Promise<void>;
    readAsStringAsync?: (fileUri: string, options?: { encoding?: string }) => Promise<string>;
  } & Record<string, any>;
  export default _default;
}
