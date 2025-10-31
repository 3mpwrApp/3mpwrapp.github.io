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
  // Example event - replace with your real events
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
  // Note: Canadian holidays and disability observances are automatically generated
  // See data/holidays-ca.ts for the holiday generation system
];
