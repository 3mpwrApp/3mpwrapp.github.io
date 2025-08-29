export type ID = string;

export interface Campaign {
  id: ID;
  title: string;
  summary: string;
}

export interface Resource {
  id: ID;
  title: string;
  description: string;
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

