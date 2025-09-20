import type { Resource } from "../types/models";

export type RegionFilter = "all" | "canada" | string; // province code when not canada/all
export type CategoryFilter =
  | "all"
  | "work_financial"
  | "tools_downloads"
  | "emergency_crisis";

export function filterResources(
  items: Resource[],
  opts: { region: RegionFilter; category: CategoryFilter; query?: string },
) {
  const q = (opts.query ?? "").trim().toLowerCase();
  let base = items;
  if (opts.category !== "all")
    {base = base.filter((r) => r.category === opts.category);}
  if (opts.region === "canada") base = base.filter((r) => r.scope === "canada");
  else if (opts.region !== "all")
    {base = base.filter(
      (r) => r.scope === "province" && r.province === opts.region,
    );}
  if (!q) return base;
  return base.filter(
    (r) =>
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q),
  );
}

export function groupByRegion(filtered: Resource[]) {
  const canada = filtered.filter((r) => r.scope === "canada");
  const byProv = new Map<string, Resource[]>();
  for (const r of filtered) {
    if (r.scope === "province" && r.province) {
      if (!byProv.has(r.province)) byProv.set(r.province, []);
      byProv.get(r.province)!.push(r);
    }
  }
  return { canada, byProv };
}

export function presentProvinceCodes(items: Resource[]): string[] {
  const set = new Set<string>();
  for (const r of items)
    {if (r.scope === "province" && r.province) set.add(r.province);}
  return Array.from(set);
}
