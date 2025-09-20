import React from "react";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type ProfileLocal = {
  name?: string;
  contact?: string; // email/phone
  province?: string; // e.g., ON, QC
};

const KEY = "empowr.profile.local.v1";

type ProfileCtx = {
  profile: ProfileLocal;
  setProfile: (p: ProfileLocal) => Promise<void>;
};

const Ctx = React.createContext<ProfileCtx | undefined>(undefined);

export function ProfileLocalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfileState] = React.useState<ProfileLocal>({});

  React.useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage?.getItem?.(KEY);
        if (raw) setProfileState(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const setProfile = async (p: ProfileLocal) => {
    setProfileState(p);
    try {
      await AsyncStorage?.setItem?.(KEY, JSON.stringify(p));
    } catch {}
  };

  return (
    <Ctx.Provider value={{ profile, setProfile }}>{children}</Ctx.Provider>
  );
}

export function useProfileLocal() {
  const ctx = React.useContext(Ctx);
  if (!ctx)
    {throw new Error("useProfileLocal must be used within ProfileLocalProvider");}
  return ctx;
}
