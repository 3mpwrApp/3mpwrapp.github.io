import React from "react";
import type { CommunityChannel, CommunityThread, CommunityComment, ID } from "../types/models";
import { scheduleLocal } from "../services/notifications";
import { fsAddThread, fsAddComment } from "../services/firestore";

let AsyncStorage: any;
try { AsyncStorage = require("@react-native-async-storage/async-storage").default; } catch {}

type State = {
  channels: CommunityChannel[];
  threads: CommunityThread[];
  comments: CommunityComment[];
};

const DEFAULT_STATE: State = { channels: [], threads: [], comments: [] };

const KEY = "empowr.community.v1";

type Ctx = {
  state: State;
  seed: (s: Partial<State>) => void;
  createThread: (channelId: ID, title: string, author: string | null) => boolean;
  addComment: (threadId: ID, content: string, author: string | null) => boolean;
  reportComment: (commentId: ID) => void;
  deleteComment: (commentId: ID) => void;
  };

const Ctx = React.createContext<Ctx | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(DEFAULT_STATE);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    })();
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    })();
  }, [state]);

  const seed = (s: Partial<State>) => setState((prev) => ({
    channels: s.channels ?? prev.channels,
    threads: s.threads ?? prev.threads,
    comments: s.comments ?? prev.comments,
  }));

  // basic rate limit: at most 1 action per 5s per author
  const lastActionRef = React.useRef<Record<string, number>>({});
  const canAct = (authorKey: string) => {
    const now = Date.now();
    const last = lastActionRef.current[authorKey] ?? 0;
    if (now - last < 5000) return false;
    lastActionRef.current[authorKey] = now;
    return true;
  };

  const banned = ["spam", "scam", "fraud", "hate"];
  const hasBanned = (text: string) => banned.some((w) => text.toLowerCase().includes(w));

  const createThread = (channelId: ID, title: string, author: string | null) => {
    if (!canAct(author ?? "guest")) return false;
    if (hasBanned(title)) return false;
    const id = `t_${Date.now()}`;
    setState((prev) => ({
      ...prev,
      threads: [...prev.threads, { id, channelId, title, author, createdAt: Date.now() }],
    }));
    fsAddThread({ id, channelId, title, author, createdAt: Date.now() });
    return true;
  };

  const addComment = (threadId: ID, content: string, author: string | null) => {
    if (!canAct(author ?? "guest")) return false;
    if (hasBanned(content)) return false;
    const id = `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, { id, threadId, author, content, createdAt: Date.now() }],
    }));
    fsAddComment({ id, threadId, author, content, createdAt: Date.now() });
    // Notify thread author locally if different from commenter
    const thread = state.threads.find((t) => t.id === threadId);
    if (thread && thread.author && thread.author !== author) {
      scheduleLocal?.("New reply", thread.title);
    }
    return true;
  };

  const reportComment = (commentId: ID) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.map((c) => (c.id === commentId ? { ...c, reported: true } : c)),
    }));
  };

  const deleteComment = (commentId: ID) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
  };

  const value: Ctx = { state, seed, createThread, addComment, reportComment, deleteComment };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommunity() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
