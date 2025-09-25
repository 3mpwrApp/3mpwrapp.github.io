// Auto-derived analytics event parameter type utilities.
// Provides compile-time mapping from event name to required/optional param shapes
// based on ANALYTICS_EVENT_SCHEMAS. This keeps runtime schema (validation + redaction)
// and static typing in sync without manual duplication.
import type { ParamSpec, ParamType } from '../services/analyticsEventSchemas';
import type { ANALYTICS_EVENT_SCHEMAS } from '../services/analyticsEventSchemas';
import type { AnalyticsEventName } from '../services/analyticsEvents';

type SchemaMap = typeof ANALYTICS_EVENT_SCHEMAS;

type PrimitiveFromParamType<T extends ParamType> =
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean : never;

type SpecToField<Spec extends ParamSpec> = PrimitiveFromParamType<Spec['type']>;

// Split required vs optional keys for nicer call-site ergonomics
type SchemaToParams<S extends Record<string, ParamSpec>> = (
  { [K in keyof S as S[K] extends { required: true } ? K : never]: SpecToField<S[K]> }
) & (
  { [K in keyof S as S[K] extends { required: true } ? never : K]?: SpecToField<S[K]> }
);

export type AnalyticsEventParamsMap = {
  [K in keyof SchemaMap]: SchemaToParams<SchemaMap[K]> extends infer P
    ? (keyof P extends never ? {} : P)
    : never;
};

// Helper to look up param type by event name (string value union)
export type AnalyticsEventParams<E extends AnalyticsEventName> =
  AnalyticsEventParamsMap[E];

// Runtime noop export to hint tree-shaking if desired (optional)
export const __ANALYTICS_TYPES_VERSION__ = 1 as const;
