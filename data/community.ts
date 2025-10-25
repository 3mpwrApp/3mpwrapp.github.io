import type {
    CommunityChannel,
    CommunityComment,
    CommunityThread,
} from "../types/models";

export const channels: CommunityChannel[] = [
  // Top 5 Provinces (by population)
  { id: "ch_on", type: "province", slug: "on", title: "Ontario" },
  { id: "ch_qc", type: "province", slug: "qc", title: "Québec" },
  { id: "ch_bc", type: "province", slug: "bc", title: "British Columbia" },
  { id: "ch_ab", type: "province", slug: "ab", title: "Alberta" },
  { id: "ch_mb", type: "province", slug: "mb", title: "Manitoba" },

  // Top 5 Topics (most requested)
  {
    id: "ch_topic_benefits",
    type: "topic",
    slug: "topic-benefits",
    title: "Benefits",
  },
  {
    id: "ch_topic_workplace",
    type: "topic",
    slug: "topic-workplace",
    title: "Workplace",
  },
  {
    id: "ch_topic_health",
    type: "topic",
    slug: "topic-health",
    title: "Health",
  },
  { id: "ch_topic_legal", type: "topic", slug: "topic-legal", title: "Legal" },
  {
    id: "ch_topic_mental",
    type: "topic",
    slug: "topic-mental",
    title: "Mental Health",
  },
];

// Additional channels for lazy loading (optional expansion)
export const additionalChannels: CommunityChannel[] = [
  // Additional provinces/territories
  { id: "ch_sk", type: "province", slug: "sk", title: "Saskatchewan" },
  { id: "ch_ns", type: "province", slug: "ns", title: "Nova Scotia" },
  { id: "ch_nb", type: "province", slug: "nb", title: "New Brunswick" },
  { id: "ch_nl", type: "province", slug: "nl", title: "Newfoundland and Labrador" },
  { id: "ch_pe", type: "province", slug: "pe", title: "Prince Edward Island" },
  { id: "ch_nt", type: "province", slug: "nt", title: "Northwest Territories" },
  { id: "ch_yt", type: "province", slug: "yt", title: "Yukon" },
  { id: "ch_nu", type: "province", slug: "nu", title: "Nunavut" },
  
  // Additional topics
  { id: "ch_topic_education", type: "topic", slug: "topic-education", title: "Education" },
  { id: "ch_topic_housing", type: "topic", slug: "topic-housing", title: "Housing" },
  { id: "ch_topic_transport", type: "topic", slug: "topic-transport", title: "Transportation" },
  { id: "ch_topic_family", type: "topic", slug: "topic-family", title: "Family" },
  { id: "ch_topic_ask", type: "topic", slug: "topic-ask-advocate", title: "Ask an Advocate" },
];

// Threads and comments are loaded from Firestore only
// No seed data needed for initial load performance
export const seedThreads: CommunityThread[] = [];

export const seedComments: CommunityComment[] = [];

