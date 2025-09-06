import type { CommunityChannel, CommunityThread, CommunityComment } from "../types/models";

export const channels: CommunityChannel[] = [
  // Provinces/Territories
  { id: "ch_on", type: "province", slug: "on", title: "Ontario" },
  { id: "ch_qc", type: "province", slug: "qc", title: "Québec" },
  { id: "ch_bc", type: "province", slug: "bc", title: "British Columbia" },
  { id: "ch_ab", type: "province", slug: "ab", title: "Alberta" },
  { id: "ch_mb", type: "province", slug: "mb", title: "Manitoba" },
  { id: "ch_sk", type: "province", slug: "sk", title: "Saskatchewan" },
  { id: "ch_ns", type: "province", slug: "ns", title: "Nova Scotia" },
  { id: "ch_nb", type: "province", slug: "nb", title: "New Brunswick" },
  { id: "ch_nl", type: "province", slug: "nl", title: "Newfoundland and Labrador" },
  { id: "ch_pe", type: "province", slug: "pe", title: "Prince Edward Island" },
  { id: "ch_nt", type: "province", slug: "nt", title: "Northwest Territories" },
  { id: "ch_yt", type: "province", slug: "yt", title: "Yukon" },
  { id: "ch_nu", type: "province", slug: "nu", title: "Nunavut" },

  // Topics
  { id: "ch_topic_benefits", type: "topic", slug: "topic-benefits", title: "Benefits" },
  { id: "ch_topic_workplace", type: "topic", slug: "topic-workplace", title: "Workplace" },
  { id: "ch_topic_education", type: "topic", slug: "topic-education", title: "Education" },
  { id: "ch_topic_health", type: "topic", slug: "topic-health", title: "Health" },
  { id: "ch_topic_legal", type: "topic", slug: "topic-legal", title: "Legal" },
  { id: "ch_topic_housing", type: "topic", slug: "topic-housing", title: "Housing" },
  { id: "ch_topic_transport", type: "topic", slug: "topic-transport", title: "Transportation" },
  { id: "ch_topic_family", type: "topic", slug: "topic-family", title: "Family" },
  { id: "ch_topic_mental", type: "topic", slug: "topic-mental", title: "Mental Health" },
  { id: "ch_topic_ask", type: "topic", slug: "topic-ask-advocate", title: "Ask an Advocate" },
];

export const seedThreads: CommunityThread[] = [
  { id: "t1", channelId: "ch_on", title: "WSIB help in Toronto?", author: "Alex", createdAt: Date.now() - 86400000 },
  { id: "t2", channelId: "ch_topic_workplace", title: "Accommodation tips", author: "Sam", createdAt: Date.now() - 7200000 },
];

export const seedComments: CommunityComment[] = [
  { id: "c1", threadId: "t1", author: "Priya", content: "Community clinic on Dundas can assist.", createdAt: Date.now() - 86000000 },
  { id: "c2", threadId: "t2", author: null, content: "Talk to HR early; document everything.", createdAt: Date.now() - 7100000 },
];
