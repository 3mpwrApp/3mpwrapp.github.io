import React from "react";

import { logError } from "../utils/errorLogger";

let AsyncStorage: any;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch {}

export type BadgeType = 'betaTester' | 'earlyAdopter' | 'contributor' | 'verified';

export interface BadgeData {
  awarded: string; // ISO date
  phase?: 'closed' | 'open' | 'rc';
  metadata?: Record<string, any>;
}

export type ProfileLocal = {
  name?: string;
  contact?: string; // email/phone
  province?: string; // e.g., ON, QC
  badges?: Partial<Record<BadgeType, BadgeData>>;
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

/**
 * Award a badge to the user profile
 * @param badgeType Type of badge to award
 * @param data Badge metadata (phase, etc.)
 * @returns Promise that resolves when badge is saved
 */
export async function awardBadge(
  badgeType: BadgeType,
  data: Partial<BadgeData> = {}
): Promise<void> {
  try {
    const raw = await AsyncStorage?.getItem?.(KEY);
    const profile: ProfileLocal = raw ? JSON.parse(raw) : {};
    
    // Don't overwrite existing badge
    if (profile.badges?.[badgeType]) {
      return;
    }

    const badges = profile.badges || {};
    badges[badgeType] = {
      awarded: new Date().toISOString(),
      ...data,
    };

    profile.badges = badges;
    await AsyncStorage?.setItem?.(KEY, JSON.stringify(profile));
  } catch (error) {
    logError('ProfileLocal', 'award badge', error);
  }
}

/**
 * Check if user has a specific badge
 * @param badgeType Type of badge to check
 * @returns Promise that resolves to true if badge exists
 */
export async function hasBadge(badgeType: BadgeType): Promise<boolean> {
  try {
    const raw = await AsyncStorage?.getItem?.(KEY);
    if (!raw) return false;
    
    const profile: ProfileLocal = JSON.parse(raw);
    return !!profile.badges?.[badgeType];
  } catch {
    return false;
  }
}
