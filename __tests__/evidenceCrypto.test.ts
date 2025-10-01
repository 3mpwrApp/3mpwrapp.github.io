/**
 * Minimal tests for evidenceCrypto helpers to guard encryption/export roundtrips.
 */
import {
    decryptString,
    encryptString,
    exportNotesEncrypted,
    importNotesEncrypted,
    type EvidenceLocalNote,
} from "../services/evidenceCrypto";

// Mock expo-file-system with an in-memory store
jest.mock("expo-file-system", () => {
  const store: Record<string, string> = {};
  return {
    cacheDirectory: "/cache/",
    EncodingType: { UTF8: "utf8" },
    writeAsStringAsync: async (path: string, data: string) => {
      store[path] = data;
    },
    readAsStringAsync: async (path: string) => {
      if (!(path in store)) throw new Error("File not found");
      return store[path];
    },
  };
});

describe("evidenceCrypto", () => {
  test("encrypt/decrypt roundtrip with passphrase", async () => {
    const secret = "p@ssw0rd!";
    const input = "hello world";
    const c = await encryptString(input, secret);
    expect(typeof c).toBe("string");
    expect(c).not.toEqual("");
    const p = await decryptString(c, secret);
    expect(p).toEqual(input);
  });

  test("export/import roundtrip", async () => {
    const pass = "s3cret!";
    const notes: EvidenceLocalNote[] = [
      { id: "1", text: "Test note", date: new Date(0).toISOString(), tags: ["tag"], files: [] },
    ];
    const path = await exportNotesEncrypted(notes, pass);
    expect(typeof path).toBe("string");
    expect(path).toContain("evidence_export_");
    const imported = await importNotesEncrypted(path, pass);
    expect(imported).toHaveLength(1);
    expect(imported[0].text).toEqual("Test note");
    expect(imported[0].id).toEqual("1");
  });
});
