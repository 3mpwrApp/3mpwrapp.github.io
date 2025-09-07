export type ID = string;

export interface Campaign {
  id: ID;
  title: string;
  summary: string;
  // Optional campaign builder enhancements
  target?: string; // who the campaign addresses (e.g., Ministry of Labour)
  goalCount?: number; // desired number of supporters
  membersCount?: number; // current number of supporters
  contactEmail?: string; // organizer contact
  createdAt?: number;
}

export interface Resource {
  id: ID;
  title: string;
  description: string;
  // Optional URL to the external site
  url?: string;
  // Scope helps organize resources by Canada vs province
  scope?: "canada" | "province";
  // Province code when scope === "province"
  province?: ProvinceCode;
  // High-level category for filtering/grouping in UI
  category?: ResourceCategory;
}

export interface Advocate {
  id: ID;
  name: string;
  bio: string;
}

export interface CommunityPost {
  id: ID;
  author: string;
  content: string;
}

export type ProvinceCode =
  | "AB"
  | "BC"
  | "MB"
  | "NB"
  | "NL"
  | "NS"
  | "NT"
  | "NU"
  | "ON"
  | "PE"
  | "QC"
  | "SK"
  | "YT";

export type ResourceCategory =
  | "work_financial" // Work & Financial Support
  | "tools_downloads" // Tools & Downloads
  | "emergency_crisis"; // Emergency & Crisis Support

export type ChannelType = "province" | "topic";

export interface CommunityChannel {
  id: ID;
  type: ChannelType;
  slug: string; // e.g., on, qc, topic-workplace
  title: string;
  description?: string;
}

export interface CommunityThread {
  id: ID;
  channelId: ID;
  title: string;
  author: string | null; // null for anonymous
  createdAt: number;
  pinned?: boolean;
  categories?: string[];
}

export interface CommunityComment {
  id: ID;
  threadId: ID;
  author: string | null;
  content: string;
  createdAt: number;
  reported?: boolean;
}
