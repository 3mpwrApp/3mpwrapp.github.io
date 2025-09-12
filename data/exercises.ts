export type Exercise = {
  id: string;
  title: string;
  audience: 'wheelchair' | 'limited-mobility' | 'sensory-friendly';
  minutes: number;
  url: string; // YouTube or web video
};

export const exercises: Exercise[] = [
  { id: 'ex1', title: 'Seated Upper Body Warmup', audience: 'wheelchair', minutes: 7, url: 'https://www.youtube.com/watch?v=s6sY2' },
  { id: 'ex2', title: 'Gentle Stretch: Low Mobility', audience: 'limited-mobility', minutes: 10, url: 'https://www.youtube.com/watch?v=z5t' },
  { id: 'ex3', title: 'Sensory-Friendly Breathing', audience: 'sensory-friendly', minutes: 5, url: 'https://www.youtube.com/watch?v=abcd' },
];

