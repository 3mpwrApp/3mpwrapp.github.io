import React from "react";
import type { CommunityChannel, CommunityThread, CommunityComment, ID } from "../types/models";

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
  createThread: (channelId: ID, title: string, author: string | null) => void;
  addComment: (threadId: ID, content: string, author: string | null) => void;
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

  const createThread = (channelId: ID, title: string, author: string | null) => {
    const id = `t_${Date.now()}`;
    setState((prev) => ({
      ...prev,
      threads: [...prev.threads, { id, channelId, title, author, createdAt: Date.now() }],
    }));
  };

  const addComment = (threadId: ID, content: string, author: string | null) => {
    const id = `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setState((prev) => ({
      ...prev,
      comments: [...prev.comments, { id, threadId, author, content, createdAt: Date.now() }],
    }));
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

