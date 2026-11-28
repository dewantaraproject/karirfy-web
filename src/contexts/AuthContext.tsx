import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { CareerGoal, ProfileRecord } from "../types";
import {
  clearAllLocalUserSessionData,
  KIPRAH_STORAGE_KEYS,
  performSessionTeardown,
} from "../lib/sessionCleanup";
import {
  getSafeSession,
  readOfflineAuthUser,
  signOutSupabase,
  supabase,
  withTimeout,
} from "../lib/supabase";
import { setOfflineAttemptOwner } from "../lib/offlineSyncService";
import { setStudyVaultOwner } from "../lib/studyVaultSyncService";

export const DEFAULT_GUEST_PROFILE: ProfileRecord = {
  id: "guest",
  name: "Mode Tamu",
  email: "",
  careerGoal: "CPNS",
  target_accuracy: 80,
  tier: "Starter",
  is_premium: false,
  premium_expiry_date: null,
  education: "Sarjana (S1)",
  institution: "",
  major: "",
  bio: "",
};

const STUDY_OWNER_KEY = "karirfy_study_owner";

interface AuthContextValue {
  authReady: boolean;
  session: Session | null;
  user: User | null;
  userId: string | null;
  isGuest: boolean;
  profile: ProfileRecord;
  setProfile: React.Dispatch<React.SetStateAction<ProfileRecord>>;
  refreshProfile: () => Promise<void>;
  updateProfilePatch: (patch: Partial<ProfileRecord>) => Promise<void>;
  applyQrSessionTokens: (tokens: { access_token: string; refresh_token: string }) => Promise<User | null>;
  enterGuestMode: (careerGoal?: CareerGoal) => void;
  exitGuestMode: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KIPRAH_STORAGE_KEYS.guestMode) === "true";
    } catch {
      return false;
    }
  });

  const [profile, setProfile] = useState<ProfileRecord>(() => {
    try {
      const raw = localStorage.getItem(KIPRAH_STORAGE_KEYS.guestProfile);
      if (raw) {
        return { ...DEFAULT_GUEST_PROFILE, ...JSON.parse(raw) };
      }
    } catch {
      // ignore parse errors
    }
    return DEFAULT_GUEST_PROFILE;
  });

  const syncUserProfile = useCallback(async (activeUser: User | null) => {
    if (!activeUser) {
      setSession(null);
      setUser(null);
      await Promise.all([setOfflineAttemptOwner(null), Promise.resolve(setStudyVaultOwner(null))]);
      return;
    }

    setUser(activeUser);
    try {
      localStorage.setItem(STUDY_OWNER_KEY, activeUser.id);
      localStorage.removeItem(KIPRAH_STORAGE_KEYS.guestMode);
    } catch {
      // ignore storage error
    }
    setIsGuest(false);

    await Promise.all([
      setOfflineAttemptOwner(activeUser.id),
      Promise.resolve(setStudyVaultOwner(activeUser.id)),
    ]);

    const email = activeUser.email || "";
    const metaName =
      typeof activeUser.user_metadata?.name === "string"
        ? activeUser.user_metadata.name
        : email.split("@")[0] || "Pembelajar";
    const metaAvatar =
      typeof activeUser.user_metadata?.avatar_url === "string"
        ? activeUser.user_metadata.avatar_url
        : undefined;

    try {
      const { data } = await withTimeout(
        supabase
          .from("profiles")
          .select(
            "id, name, username, avatar, careerGoal, target_accuracy, tier, is_premium, premium_expiry_date, phone, education, institution, major, bio",
          )
          .eq("id", activeUser.id)
          .maybeSingle(),
        5000,
      );

      if (data) {
        setProfile({
          id: activeUser.id,
          name: data.name || metaName,
          username: data.username || undefined,
          email,
          phone: data.phone || undefined,
          avatar: data.avatar || metaAvatar,
          careerGoal: data.careerGoal || "CPNS",
          target_accuracy: Number(data.target_accuracy) || 80,
          tier: data.tier || "Starter",
          is_premium: Boolean(data.is_premium),
          premium_expiry_date: data.premium_expiry_date || null,
          education: data.education || "Sarjana (S1)",
          institution: data.institution || "",
          major: data.major || "",
          bio: data.bio || "",
        });
      } else {
        setProfile({
          ...DEFAULT_GUEST_PROFILE,
          id: activeUser.id,
          name: metaName,
          email,
          avatar: metaAvatar,
        });
      }
    } catch {
      setProfile((prev) =>
        prev.id === activeUser.id
          ? prev
          : {
              ...DEFAULT_GUEST_PROFILE,
              id: activeUser.id,
              name: metaName,
              email,
              avatar: metaAvatar,
            },
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const safety = window.setTimeout(() => {
      if (mounted) setAuthReady(true);
    }, 3000);

    void getSafeSession().then(({ session: initialSession, user: initialUser }) => {
      if (!mounted) return;
      setSession(initialSession);
      const fallbackOffline = !initialUser
        ? readOfflineAuthUser(localStorage.getItem(STUDY_OWNER_KEY) ?? undefined)
        : null;
      void syncUserProfile(initialUser ?? fallbackOffline).finally(() => {
        window.clearTimeout(safety);
        if (mounted) setAuthReady(true);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      void syncUserProfile(nextSession?.user ?? null).finally(() => {
        if (mounted) setAuthReady(true);
      });
    });

    return () => {
      mounted = false;
      window.clearTimeout(safety);
      listener.subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await syncUserProfile(user);
    }
  }, [user, syncUserProfile]);

  const updateProfilePatch = useCallback(
    async (patch: Partial<ProfileRecord>) => {
      setProfile((prev) => {
        const next = { ...prev, ...patch };
        if (!user) {
          try {
            localStorage.setItem(KIPRAH_STORAGE_KEYS.guestProfile, JSON.stringify(next));
          } catch {
            // ignore
          }
        }
        return next;
      });

      if (user) {
        const dbPatch: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (patch.name !== undefined) dbPatch.name = patch.name;
        if (patch.username !== undefined) dbPatch.username = patch.username;
        if (patch.phone !== undefined) dbPatch.phone = patch.phone;
        if (patch.careerGoal !== undefined) dbPatch.careerGoal = patch.careerGoal;
        if (patch.target_accuracy !== undefined) dbPatch.target_accuracy = patch.target_accuracy;
        if (patch.education !== undefined) dbPatch.education = patch.education;
        if (patch.institution !== undefined) dbPatch.institution = patch.institution;
        if (patch.major !== undefined) dbPatch.major = patch.major;
        if (patch.bio !== undefined) dbPatch.bio = patch.bio;

        await withTimeout(
          supabase.from("profiles").update(dbPatch).eq("id", user.id),
          6000,
        ).catch(() => undefined);
      }
    },
    [user],
  );

  const applyQrSessionTokens = useCallback(
    async (tokens: { access_token: string; refresh_token: string }) => {
      const { data, error } = await withTimeout(
        supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        }),
        12000,
      );
      if (error) throw error;
      let resolvedUser = data.user ?? data.session?.user ?? null;
      if (!resolvedUser) {
        const userRes = await withTimeout(supabase.auth.getUser(), 8000);
        resolvedUser = userRes.data.user ?? null;
      }
      setSession(data.session ?? null);
      await syncUserProfile(resolvedUser);
      return resolvedUser;
    },
    [syncUserProfile],
  );

  const enterGuestMode = useCallback((careerGoal: CareerGoal = "CPNS") => {
    clearAllLocalUserSessionData({ preserveTheme: true });
    const nextProfile: ProfileRecord = {
      ...DEFAULT_GUEST_PROFILE,
      careerGoal,
    };
    try {
      localStorage.setItem(KIPRAH_STORAGE_KEYS.guestMode, "true");
      localStorage.setItem(KIPRAH_STORAGE_KEYS.guestProfile, JSON.stringify(nextProfile));
    } catch {
      // ignore
    }
    setProfile(nextProfile);
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(() => {
    try {
      localStorage.removeItem(KIPRAH_STORAGE_KEYS.guestMode);
    } catch {
      // ignore
    }
    setIsGuest(false);
    setProfile(DEFAULT_GUEST_PROFILE);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutSupabase();
    } catch {
      // ignore network error on local signout
    }
    await performSessionTeardown({ preserveTheme: true });
    setSession(null);
    setUser(null);
    setIsGuest(false);
    setProfile(DEFAULT_GUEST_PROFILE);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authReady,
        session,
        user,
        userId: user?.id ?? null,
        isGuest,
        profile,
        setProfile,
        refreshProfile,
        updateProfilePatch,
        applyQrSessionTokens,
        enterGuestMode,
        exitGuestMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
