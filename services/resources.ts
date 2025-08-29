import { withFallback } from "./api";
import { resources as local } from "../data/resources";
import type { Resource } from "../types/models";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchResources = withFallback<Resource[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await (await fetch(`${BASE}/resources`)).json();
  },
  () => local
);

