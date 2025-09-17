export type Recipe = {
  id: string;
  title: string;
  tags: string[]; // fatigue, low-prep, one-pan, sensory
  url?: string;
  notes?: string;
};

export const recipes: Recipe[] = [
  { id: 'r1', title: 'One-Pan Protein + Veg', tags: ['low-prep','one-pan','fatigue'], notes: 'Frozen pre-cut veggies + pre-cooked protein; 15 min.' },
  { id: 'r2', title: 'Soft Sensory Oats', tags: ['sensory','budget'], notes: 'Oats + banana + yogurt; optional seeds.' },
  { id: 'r3', title: 'Meal-Prep Bowls', tags: ['batch','fatigue'], notes: 'Cook once; 4 servings with flexible toppings.' },
  { id: 'r4', title: 'No‑Chop Wraps', tags: ['low-prep','fatigue'], notes: 'Use pre-washed greens, deli protein, hummus, and wraps.' },
  { id: 'r5', title: 'Sheet Pan Tofu + Veg', tags: ['one-pan','batch'], notes: 'Bake once; use leftovers in bowls or wraps.' },
  { id: 'r6', title: 'Cold Pasta Salad', tags: ['sensory','low-prep'], notes: 'Mild flavors; olive oil + salt; add soft veg.' },
];
