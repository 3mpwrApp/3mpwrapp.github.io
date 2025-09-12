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
  {
    id: "evt1",
    title: "Rally for Accessibility",
    description: "Community rally at City Hall.",
    date: "2025-09-15 12:00",
    location: "City Hall",
    isVirtual: false,
  },
  {
    id: "evt2",
    title: "WSIB Info Session",
    description: "Know your rights workshop.",
    date: "2025-09-22 18:00",
    location: "Library Room A",
    isVirtual: false,
  },
  {
    id: "evt3",
    title: "Virtual Peer Meetup",
    description: "Support circle on Zoom.",
    date: "2025-09-28 19:00",
    isVirtual: true,
  },
  {
    id: "evt4",
    title: "Inclusive Hiring Fair",
    description: "Employers committed to accessibility.",
    date: "2025-10-05 10:00",
    location: "Convention Centre",
    stepFree: true,
    captions: true,
  },
  {
    id: "evt5",
    title: "ASL‑Interpreted Town Hall",
    description: "Community Q&A with ASL and captions.",
    date: "2025-10-12 18:30",
    location: "Civic Hall",
    asl: true,
    captions: true,
  },
  {
    id: "evt6",
    title: "Low‑Sensory Museum Night",
    description: "Reduced lighting/sound; sensory space available.",
    date: "2025-10-20 19:00",
    location: "City Museum",
    sensorySpace: true,
    stepFree: true,
  },
];
