export type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // ISO or friendly
  location?: string;
  isVirtual?: boolean;
  asl?: boolean;
  captions?: boolean;
  stepFree?: boolean;
  sensorySpace?: boolean;
};

export const events: Event[] = [
  // Intentionally empty: sample events removed.
  // System holidays and disability observances are generated at runtime
  // by `data/holidays-ca.ts` and shown as system items in the Events screen.
  // If you want to add a sample/example event for reference, uncomment and
  // adapt the block below.
  /*
  {
    id: "evt-example",
    title: "Community Accessibility Workshop",
    description: "Join us for a workshop on accessibility rights and resources. ASL interpretation and closed captions provided.",
    date: "2025-11-15 18:00",
    location: "Community Centre - 123 Main St",
    isVirtual: false,
    asl: true,
    captions: true,
    stepFree: true,
  },
  */
];
