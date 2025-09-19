// Central spacing scale for consistent layout rhythm.
// Keep minimal and opinionated; extend cautiously.

export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export function s(token: SpacingToken): number {
  return spacing[token];
}

// Utility to build vertical & horizontal padding / margin quickly
export function inset(v: SpacingToken, h: SpacingToken = v) {
  return { paddingVertical: s(v), paddingHorizontal: s(h) };
}

export function marginY(v: SpacingToken) { return { marginTop: s(v), marginBottom: s(v) }; }
export function marginX(v: SpacingToken) { return { marginLeft: s(v), marginRight: s(v) }; }

// Gap alias if using custom layout components later
export const gap = s;
