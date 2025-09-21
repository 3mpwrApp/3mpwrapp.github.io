import React from "react";

import { useAuth } from "../context/AuthContext";
import { fsFetchJoinedCampaigns } from "../services/firestore";
import type { Campaign, ID } from "../types/models";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

type State = {
  myCampaigns: Campaign[];
  joined: Record<ID, boolean>;
};

const KEY = "empowr.campaigns.local.v1";
const DEFAULT: State = { myCampaigns: [], joined: {} };

type CampaignsCtx = {
  state: State;
  createCampaign: (title: string, summary: string) => Campaign;
  join: (id: ID) => void;
  leave: (id: ID) => void;
  isJoined: (id: ID) => boolean;
  syncRemote: () => Promise<void>;
};

const Ctx = React.createContext<CampaignsCtx | undefined>(undefined);

export function CampaignsLocalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<State>(DEFAULT);
  const { user } = useAuth();
  const syncingRef = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw));
    })();
  }, []);

  // Fetch remote memberships when user changes
  const syncRemote = React.useCallback(async () => {
    if (!user?.uid || syncingRef.current) return;
    syncingRef.current = true;
    try {
      const remote = await fsFetchJoinedCampaigns(user.uid);
      if (remote.length) {
        setState(s => ({ ...s, joined: { ...s.joined, ...Object.fromEntries(remote.map(r => [r, true])) } }));
      }
    } catch {} finally { syncingRef.current = false; }
  }, [user?.uid]);

  React.useEffect(() => { syncRemote(); }, [syncRemote]);

  React.useEffect(() => {
    (async () => {
      if (!AsyncStorage) return;
      await AsyncStorage.setItem(KEY, JSON.stringify(state));
    })();
  }, [state]);

  const createCampaign = (title: string, summary: string) => {
    const id = `uc_${Date.now()}`;
    const campaign: Campaign = { id, title, summary };
    setState((s) => ({
      ...s,
      myCampaigns: [campaign, ...s.myCampaigns],
      joined: { ...s.joined, [id]: true },
    }));
    return campaign;
  };

  const join = (id: ID) =>
    setState((s) => ({ ...s, joined: { ...s.joined, [id]: true } }));
  const leave = (id: ID) =>
    setState((s) => {
      const { [id]: _, ...rest } = s.joined;
      return { ...s, joined: rest };
    });
  const isJoined = (id: ID) => !!state.joined[id];

  const value: CampaignsCtx = { state, createCampaign, join, leave, isJoined, syncRemote };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCampaignsLocal() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    {throw new Error(
      "useCampaignsLocal must be used within CampaignsLocalProvider",
    );}
  return ctx;
}
