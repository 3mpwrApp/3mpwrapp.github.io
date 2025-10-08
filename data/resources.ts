import type { Resource } from "../types/models";

// Load from JSON asset to reduce TS source size; preserve types via cast
import raw from "./resources.json";

export const resources = raw as unknown as Resource[];
