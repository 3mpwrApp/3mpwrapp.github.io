import React from "react";

import { useAuth } from "../context/AuthContext";
import { getDB } from "../services/firestore";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type BlockList = string[]; // array of blocked user UIDs

const KEY = "empowr.blocks.v1";

type BlocksCtx = {
  blocked: BlockList;
  isBlocked: (uid?: string | null) => boolean;
  blockUser: (uid: string) => Promise<void>;
  unblockUser: (uid: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = React.createContext<BlocksCtx | undefined>(undefined);

export function BlocksProvider({ children }: { children: React.ReactNode }) {
  const [blocked, setBlocked] = React.useState<BlockList>([]);
  const { user } = useAuth();

  const persist = async (list: BlockList) => {
    try { await AsyncStorage?.setItem?.(KEY, JSON.stringify(list)); } catch {}
  };

  const loadLocal = async () => {
    try { const raw = await AsyncStorage?.getItem?.(KEY); if (raw) setBlocked(JSON.parse(raw)); } catch {}
  };

  const refresh = async () => {
    await loadLocal();
    try {
      const db = await getDB();
      if (!db || !user?.uid) return;
      const m = await import("firebase/firestore");
      const snap = await m.getDocs(m.collection(db, "user_blocks", user.uid, "blocked"));
      const list: string[] = [];
      snap.forEach((d) => list.push(d.id));
      if (list.length) { setBlocked(list); persist(list); }
    } catch {}
  };

  React.useEffect(() => { refresh(); }, [user?.uid]);

  const isBlocked = (uid?: string | null) => !!uid && blocked.includes(uid);

  const blockUser = async (uid: string) => {
    if (!uid) return;
    setBlocked((cur) => {
      const next = Array.from(new Set([...cur, uid]));
      persist(next);
      return next;
    });
    try {
      const db = await getDB();
      if (db && user?.uid) {
        const m = await import("firebase/firestore");
        await m.setDoc(m.doc(db, "user_blocks", user.uid, "blocked", uid), { at: Date.now() } as any, { merge: true });
      }
    } catch {}
  };

  const unblockUser = async (uid: string) => {
    if (!uid) return;
    setBlocked((cur) => {
      const next = cur.filter((x) => x !== uid);
      persist(next);
      return next;
    });
    try {
      const db = await getDB();
      if (db && user?.uid) {
        const m = await import("firebase/firestore");
        await m.deleteDoc(m.doc(db, "user_blocks", user.uid, "blocked", uid));
      }
    } catch {}
  };

  return (
    <Ctx.Provider value={{ blocked, isBlocked, blockUser, unblockUser, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useBlocks() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useBlocks must be used within BlocksProvider");
  return ctx;
}
