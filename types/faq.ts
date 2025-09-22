export type Faq = {
  id: string;
  q: string; // question (keep short id for existing code compatibility)
  a: string; // answer
  tags?: string[]; // optional topic tags
  locale?: string; // optional locale code if we later localize individual entries
  createdAt?: number; // epoch ms
  updatedAt?: number; // epoch ms
  source?: "static" | "user" | "admin"; // origin of the FAQ
};

export type NewFaqInput = Omit<Faq, "id" | "createdAt" | "updatedAt"> & { id?: string };
