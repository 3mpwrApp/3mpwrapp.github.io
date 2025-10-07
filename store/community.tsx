import React from "react";

import { fsAddComment, fsAddThread, getDB } from "../services/firestore";
import { scheduleLocal } from "../services/notifications";
import type {
    CommunityChannel,
    CommunityComment,
    CommunityThread,
    ID,
} from "../types/models";

import { useNetwork } from "./network";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type State = {
  channels: CommunityChannel[];
  threads: CommunityThread[];
  comments: CommunityComment[];
};

const DEFAULT_STATE: State = { channels: [], threads: [], comments: [] };

const KEY = "empowr.community.v1";
const QUEUE_KEY = "empowr.community.queue.v1";
type QueueItem =
  | {
      kind: "thread";
      data: {
        id: ID;
        channelId: ID;
        title: string;
        author: string | null;
        createdAt: number;
      };
    }
  | {
      kind: "comment";
      data: {
        id: ID;
        threadId: ID;
        author: string | null;
        content: string;
        createdAt: number;
      };
    };

type CommunityCtx = {
  state: State;
  seed: (s: Partial<State>) => void;
  createThread: (
    channelId: ID,
    title: string,
    author: string | null,
  ) => boolean;
  addComment: (threadId: ID, content: string, author: string | null) => boolean;
  reportComment: (commentId: ID) => void;
  deleteComment: (commentId: ID) => void;
};

const Ctx = React.createContext<CommunityCtx | undefined>(undefined);

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(DEFAULT_STATE);
  const { setOffline, setSyncing } = useNetwork();
  const flushingRef = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
      // try flush any queued writes on startup
      flushQueue();
    })();
  }, []);

  // Realtime sync via Firestore on all platforms
  React.useEffect(() => {
    let unsubThreads: any = null;
    let unsubComments: any = null;
    (async () => {
      try {
        const m = await import("firebase/firestore");
        const db = await getDB();
        if (!db) return;
        unsubThreads = m.onSnapshot(
          m.query(m.collection(db, "threads")),
          (snap) => {
            const list: CommunityThread[] = [] as any;
            snap.forEach((d) => list.push(d.data() as any));
            setState((prev) => ({
              ...prev,
              threads: mergeById(prev.threads, list),
            }));
            setOffline(false);
          },
          () => {
            setOffline(true);
          },
        );
        unsubComments = m.onSnapshot(
          m.query(m.collection(db, "comments")),
          (snap) => {
            const list: CommunityComment[] = [] as any;
            snap.forEach((d) => list.push(d.data() as any));
            setState((prev) => ({
              ...prev,
              comments: mergeById(prev.comments, list),
            }));
            setOffline(false);
          },
          () => {
            setOffline(true);
          },
        );
      } catch {}
    })();
    return () => {
      unsubThreads?.();
      unsubComments?.();
    };
  }, []);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    })();
  }, [state]);

  async function enqueue(item: QueueItem) {
    if (!AsyncStorage) return;
    try {
      const cur = await AsyncStorage.getItem(QUEUE_KEY);
      const arr: QueueItem[] = cur ? JSON.parse(cur) : [];
      arr.push(item);
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(arr));
    } catch {}
  }

  async function flushQueue() {
    if (flushingRef.current) return;
    flushingRef.current = true;
    try {
      if (!AsyncStorage) return;
      setSyncing(true);
      const cur = await AsyncStorage.getItem(QUEUE_KEY);
      const arr: QueueItem[] = cur ? JSON.parse(cur) : [];
      if (!arr.length) return;
      const m = await import("firebase/firestore");
      const db = await getDB();
      if (!db) return;
      for (const item of arr) {
        try {
          if (item.kind === "thread") {
            await m.setDoc(
              m.doc(db, "threads", item.data.id),
              item.data as any,
            );
          } else {
            await m.setDoc(
              m.doc(db, "comments", item.data.id),
              item.data as any,
            );
          }
        } catch {}
      }
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify([]));
    } finally {
      flushingRef.current = false;
      setSyncing(false);
    }
  }

  // When connection is restored, try to flush the queue
  React.useEffect(() => {
    const id = setInterval(() => {
      flushQueue();
    }, 5000);
    // In Node/Jest, avoid keeping the event loop alive
    try { (id as any)?.unref?.(); } catch {}
    return () => clearInterval(id);
  }, []);

  const seed = (s: Partial<State>) =>
    setState((prev) => ({
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
  const hasBanned = (text: string) =>
    banned.some((w) => text.toLowerCase().includes(w));

  const createThread = (
    channelId: ID,
    title: string,
    author: string | null,
  ) => {
    if (!canAct(author ?? "guest")) return false;
    if (hasBanned(title)) return false;
    const id = `t_${Date.now()}`;
    setState((prev) => ({
      ...prev,
      threads: [
        ...prev.threads,
        { id, channelId, title, author, createdAt: Date.now() },
      ],
    }));
    fsAddThread({ id, channelId, title, author, createdAt: Date.now() });
    // queue for retry if offline
    enqueue({
      kind: "thread",
      data: { id, channelId, title, author, createdAt: Date.now() },
    });
    return true;
  };

  const addComment = (threadId: ID, content: string, author: string | null) => {
    if (!canAct(author ?? "guest")) return false;
    if (hasBanned(content)) return false;
    const id = `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    setState((prev) => ({
      ...prev,
      comments: [
        ...prev.comments,
        { id, threadId, author, content, createdAt: Date.now() },
      ],
    }));
    fsAddComment({ id, threadId, author, content, createdAt: Date.now() });
    enqueue({
      kind: "comment",
      data: { id, threadId, author, content, createdAt: Date.now() },
    });
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
      comments: prev.comments.map((c) =>
        c.id === commentId ? { ...c, reported: true } : c,
      ),
    }));
  };

  const deleteComment = (commentId: ID) => {
    setState((prev) => ({
      ...prev,
      comments: prev.comments.filter((c) => c.id !== commentId),
    }));
  };

  const value: CommunityCtx = {
    state,
    seed,
    createThread,
    addComment,
    reportComment,
    deleteComment,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCommunity() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    {throw new Error("useCommunity must be used within CommunityProvider");}
  return ctx;
}

function mergeById<T extends { id: string }>(prev: T[], next: T[]) {
  const map = new Map<string, T>();
  [...prev, ...next].forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}
