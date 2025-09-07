import { withFallback, retry } from "./api";
import { advocates as local } from "../data/advocates";
import type { Advocate } from "../types/models";

const BASE = process.env.EXPO_PUBLIC_API_BASE ?? "";

export const fetchAdvocates = withFallback<Advocate[]>(
  async () => {
    if (!BASE) throw new Error("No API base");
    return await retry(async () => (await fetch(`${BASE}/advocates`)).json());
  },
  () => local,
);
