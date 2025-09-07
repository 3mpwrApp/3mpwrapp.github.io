import React from "react";
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
};

const Ctx = React.createContext<CampaignsCtx | undefined>(undefined);

export function CampaignsLocalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<State>(DEFAULT);

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

  const value: CampaignsCtx = { state, createCampaign, join, leave, isJoined };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCampaignsLocal() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    throw new Error(
      "useCampaignsLocal must be used within CampaignsLocalProvider",
    );
  return ctx;
}
