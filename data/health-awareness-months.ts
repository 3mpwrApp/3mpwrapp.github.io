import type { Event } from "./events";

/**
 * Comprehensive Health & Disease Awareness Months
 * Major observances recognized in North America (US/Canada)
 * 
 * Sources: American Public Health Association, CDC, Health Canada, WHO
 */

export interface HealthAwarenessMonth {
  /** Month number (1-12) */
  month: number;
  /** Display name of the awareness month */
  name: string;
  /** Brief description */
  description: string;
  /** Related conditions/themes */
  topics: string[];
  /** Color associated with awareness ribbon (if applicable) */
  color?: string;
}

export const healthAwarenessMonths: HealthAwarenessMonth[] = [
  // JANUARY
  {
    month: 1,
    name: "National Birth Defects Prevention Month",
    description: "Awareness of birth defects prevention and healthy pregnancy",
    topics: ["pregnancy", "birth defects", "prenatal health"],
    color: "blue",
  },
  {
    month: 1,
    name: "National Glaucoma Awareness Month",
    description: "Early detection and treatment of glaucoma",
    topics: ["eye health", "glaucoma", "vision"],
  },
  {
    month: 1,
    name: "Thyroid Awareness Month",
    description: "Thyroid disease awareness and screening",
    topics: ["thyroid", "endocrine", "autoimmune"],
    color: "light blue",
  },
  {
    month: 1,
    name: "Cervical Cancer Awareness Month",
    description: "Prevention and early detection of cervical cancer",
    topics: ["cancer", "women's health", "HPV"],
    color: "teal and white",
  },

  // FEBRUARY
  {
    month: 2,
    name: "American Heart Month",
    description: "Heart disease awareness and cardiovascular health",
    topics: ["heart disease", "cardiovascular", "stroke prevention"],
    color: "red",
  },
  {
    month: 2,
    name: "National Cancer Prevention Month",
    description: "Cancer prevention strategies and healthy living",
    topics: ["cancer", "prevention", "screening"],
    color: "lavender",
  },
  {
    month: 2,
    name: "Eating Disorders Awareness Month",
    description: "Awareness of eating disorders and treatment",
    topics: ["eating disorders", "mental health", "anorexia", "bulimia"],
    color: "periwinkle",
  },
  {
    month: 2,
    name: "Low Vision Awareness Month",
    description: "Support for people with low vision",
    topics: ["vision", "accessibility", "blindness"],
  },

  // MARCH
  {
    month: 3,
    name: "National Kidney Month",
    description: "Kidney disease awareness and prevention",
    topics: ["kidney disease", "dialysis", "chronic kidney disease"],
    color: "green",
  },
  {
    month: 3,
    name: "Colorectal Cancer Awareness Month",
    description: "Colon and rectal cancer screening and prevention",
    topics: ["cancer", "colorectal", "screening"],
    color: "dark blue",
  },
  {
    month: 3,
    name: "Endometriosis Awareness Month",
    description: "Awareness of endometriosis and women's health",
    topics: ["endometriosis", "women's health", "chronic pain"],
    color: "yellow",
  },
  {
    month: 3,
    name: "Brain Injury Awareness Month",
    description: "Traumatic brain injury awareness and prevention",
    topics: ["brain injury", "TBI", "concussion"],
    color: "blue and green",
  },
  {
    month: 3,
    name: "Multiple Sclerosis Awareness Month",
    description: "MS awareness and support",
    topics: ["MS", "autoimmune", "neurological"],
    color: "orange",
  },

  // APRIL
  {
    month: 4,
    name: "Autism Acceptance Month",
    description: "Autism awareness and acceptance",
    topics: ["autism", "neurodiversity", "developmental"],
    color: "blue and gold",
  },
  {
    month: 4,
    name: "Parkinson's Awareness Month",
    description: "Parkinson's disease awareness",
    topics: ["Parkinson's", "neurological", "movement disorders"],
    color: "red tulip",
  },
  {
    month: 4,
    name: "National Donate Life Month",
    description: "Organ and tissue donation awareness",
    topics: ["organ donation", "transplant", "life saving"],
    color: "blue and green",
  },
  {
    month: 4,
    name: "Testicular Cancer Awareness Month",
    description: "Early detection of testicular cancer",
    topics: ["cancer", "men's health", "testicular"],
    color: "orchid purple",
  },
  {
    month: 4,
    name: "IBS Awareness Month",
    description: "Irritable bowel syndrome awareness",
    topics: ["IBS", "digestive", "chronic illness"],
    color: "purple",
  },

  // MAY
  {
    month: 5,
    name: "Mental Health Awareness Month",
    description: "Mental health awareness and stigma reduction",
    topics: ["mental health", "depression", "anxiety", "wellness"],
    color: "green",
  },
  {
    month: 5,
    name: "Arthritis Awareness Month",
    description: "Arthritis awareness and treatment",
    topics: ["arthritis", "chronic pain", "joint health"],
    color: "blue",
  },
  {
    month: 5,
    name: "Lupus Awareness Month",
    description: "Systemic lupus awareness",
    topics: ["lupus", "autoimmune", "chronic illness"],
    color: "purple",
  },
  {
    month: 5,
    name: "Skin Cancer Awareness Month",
    description: "Skin cancer prevention and detection",
    topics: ["skin cancer", "melanoma", "sun safety"],
    color: "orange",
  },
  {
    month: 5,
    name: "Ehlers-Danlos Syndrome Awareness Month",
    description: "EDS and hypermobility disorders awareness",
    topics: ["EDS", "connective tissue", "rare disease"],
    color: "zebra stripes",
  },
  {
    month: 5,
    name: "Celiac Disease Awareness Month",
    description: "Celiac disease and gluten sensitivity",
    topics: ["celiac", "autoimmune", "digestive"],
    color: "green",
  },

  // JUNE
  {
    month: 6,
    name: "PTSD Awareness Month",
    description: "Post-traumatic stress disorder awareness",
    topics: ["PTSD", "trauma", "mental health"],
    color: "teal",
  },
  {
    month: 6,
    name: "Alzheimer's & Brain Awareness Month",
    description: "Alzheimer's disease and dementia awareness",
    topics: ["Alzheimer's", "dementia", "brain health"],
    color: "purple",
  },
  {
    month: 6,
    name: "Scleroderma Awareness Month",
    description: "Scleroderma and autoimmune disease awareness",
    topics: ["scleroderma", "autoimmune", "rare disease"],
    color: "teal",
  },
  {
    month: 6,
    name: "Myasthenia Gravis Awareness Month",
    description: "MG awareness and support",
    topics: ["myasthenia gravis", "autoimmune", "neurological"],
    color: "red and white",
  },

  // JULY
  {
    month: 7,
    name: "Disability Pride Month",
    description: "Celebrating disability identity and rights",
    topics: ["disability", "accessibility", "rights", "pride"],
    color: "rainbow",
  },
  {
    month: 7,
    name: "Juvenile Arthritis Awareness Month",
    description: "Arthritis in children and youth",
    topics: ["juvenile arthritis", "pediatric", "autoimmune"],
    color: "blue",
  },

  // AUGUST
  {
    month: 8,
    name: "National Immunization Awareness Month",
    description: "Vaccination and disease prevention",
    topics: ["vaccines", "immunization", "prevention"],
  },
  {
    month: 8,
    name: "Psoriasis Awareness Month",
    description: "Psoriasis and psoriatic arthritis awareness",
    topics: ["psoriasis", "autoimmune", "skin health"],
    color: "purple",
  },

  // SEPTEMBER
  {
    month: 9,
    name: "Pain Awareness Month",
    description: "Chronic pain awareness and management",
    topics: ["chronic pain", "pain management", "quality of life"],
    color: "orange",
  },
  {
    month: 9,
    name: "Blood Cancer Awareness Month",
    description: "Leukemia, lymphoma, and myeloma awareness",
    topics: ["blood cancer", "leukemia", "lymphoma"],
    color: "orange",
  },
  {
    month: 9,
    name: "Childhood Cancer Awareness Month",
    description: "Pediatric cancer awareness and research",
    topics: ["pediatric cancer", "childhood cancer", "gold ribbon"],
    color: "gold",
  },
  {
    month: 9,
    name: "Ovarian Cancer Awareness Month",
    description: "Ovarian cancer detection and treatment",
    topics: ["ovarian cancer", "women's health", "gynecologic cancer"],
    color: "teal",
  },
  {
    month: 9,
    name: "Polycystic Ovary Syndrome Awareness Month",
    description: "PCOS awareness and women's health",
    topics: ["PCOS", "women's health", "endocrine"],
    color: "teal",
  },
  {
    month: 9,
    name: "Suicide Prevention Month",
    description: "Suicide prevention and mental health support",
    topics: ["suicide prevention", "mental health", "crisis support"],
    color: "yellow",
  },

  // OCTOBER
  {
    month: 10,
    name: "Breast Cancer Awareness Month",
    description: "Breast cancer awareness and early detection",
    topics: ["breast cancer", "women's health", "screening"],
    color: "pink",
  },
  {
    month: 10,
    name: "National Depression Screening Month",
    description: "Depression awareness and screening",
    topics: ["depression", "mental health", "screening"],
    color: "green",
  },
  {
    month: 10,
    name: "Down Syndrome Awareness Month",
    description: "Down syndrome awareness and inclusion",
    topics: ["Down syndrome", "intellectual disability", "inclusion"],
    color: "blue and yellow",
  },
  {
    month: 10,
    name: "ADHD Awareness Month",
    description: "Attention deficit hyperactivity disorder awareness",
    topics: ["ADHD", "neurodevelopmental", "executive function"],
    color: "orange",
  },
  {
    month: 10,
    name: "Domestic Violence Awareness Month",
    description: "Domestic violence awareness and prevention",
    topics: ["domestic violence", "abuse", "safety"],
    color: "purple",
  },
  {
    month: 10,
    name: "Sudden Infant Death Syndrome Awareness Month",
    description: "SIDS prevention and safe sleep",
    topics: ["SIDS", "infant health", "safe sleep"],
    color: "pink and blue",
  },

  // NOVEMBER
  {
    month: 11,
    name: "American Diabetes Month",
    description: "Diabetes awareness and prevention",
    topics: ["diabetes", "type 1", "type 2", "blood sugar"],
    color: "blue",
  },
  {
    month: 11,
    name: "Lung Cancer Awareness Month",
    description: "Lung cancer awareness and screening",
    topics: ["lung cancer", "respiratory", "screening"],
    color: "white",
  },
  {
    month: 11,
    name: "National Pancreatic Cancer Awareness Month",
    description: "Pancreatic cancer awareness and research",
    topics: ["pancreatic cancer", "cancer research", "early detection"],
    color: "purple",
  },
  {
    month: 11,
    name: "Chronic Obstructive Pulmonary Disease Month",
    description: "COPD awareness and lung health",
    topics: ["COPD", "respiratory", "lung disease"],
    color: "orange",
  },
  {
    month: 11,
    name: "Epilepsy Awareness Month",
    description: "Epilepsy awareness and seizure disorders",
    topics: ["epilepsy", "seizures", "neurological"],
    color: "purple",
  },

  // DECEMBER
  {
    month: 12,
    name: "World AIDS Day (December 1)",
    description: "HIV/AIDS awareness and prevention",
    topics: ["HIV", "AIDS", "prevention", "treatment"],
    color: "red",
  },
  {
    month: 12,
    name: "Safe Toys and Gifts Month",
    description: "Child safety and injury prevention",
    topics: ["child safety", "injury prevention", "toys"],
  },
];

/**
 * Generate calendar events for all health awareness months in a given year
 */
export function generateHealthAwarenessEvents(year: number): Event[] {
  const events: Event[] = [];

  healthAwarenessMonths.forEach((awareness) => {
    const monthStr = String(awareness.month).padStart(2, "0");
    events.push({
      id: `health-${year}-${monthStr}-${awareness.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      title: awareness.name,
      description: awareness.description,
      date: `${year}-${monthStr}-01 00:00`,
      location: "North America",
      category: "health-awareness",
      tags: awareness.topics,
    });
  });

  // Add specific day events
  events.push({
    id: `health-${year}-12-01-world-aids-day`,
    title: "World AIDS Day",
    description: "HIV/AIDS awareness, prevention, and support",
    date: `${year}-12-01 00:00`,
    location: "Global",
    category: "health-awareness",
    tags: ["HIV", "AIDS", "prevention"],
  });

  return events;
}

/**
 * Get awareness months for a specific month
 */
export function getAwarenessForMonth(month: number): HealthAwarenessMonth[] {
  return healthAwarenessMonths.filter((a) => a.month === month);
}

/**
 * Search awareness months by topic
 */
export function searchAwarenessByTopic(topic: string): HealthAwarenessMonth[] {
  const searchTerm = topic.toLowerCase();
  return healthAwarenessMonths.filter(
    (a) =>
      a.topics.some((t) => t.toLowerCase().includes(searchTerm)) ||
      a.name.toLowerCase().includes(searchTerm) ||
      a.description.toLowerCase().includes(searchTerm)
  );
}

export default {
  healthAwarenessMonths,
  generateHealthAwarenessEvents,
  getAwarenessForMonth,
  searchAwarenessByTopic,
};
