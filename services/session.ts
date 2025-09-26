// Simple in-memory session seed for per-launch variability
let seed = 0;

export function setSessionSeed(s?: number) {
  // If s provided, set directly; else generate from time and random
  seed = typeof s === 'number' ? s : Math.floor((Date.now() ^ Math.random()*1e9) % 2147483647);
}

export function getSessionSeed() {
  if (!seed) setSessionSeed();
  return seed;
}

// Deterministic pseudo-random in [0,1) based on input and session seed
export function pseudoRandom01(key: string) {
  let h = 2166136261 ^ getSessionSeed();
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Map to [0,1)
  return ((h >>> 0) % 1000000) / 1000000;
}
