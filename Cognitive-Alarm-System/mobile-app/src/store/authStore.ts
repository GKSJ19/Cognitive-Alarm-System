import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as authApi from "@/services/api/auth.api";
import { setToken, clearToken } from "@/services/api/tokenStorage";
import { setUnauthorizedHandler } from "@/services/api/client";

// Re-exported so existing screens (`error instanceof AuthError`) keep working.
export { ApiError as AuthError } from "@/services/api/errors";

/**
 * Public shape the UI has always used. The backend's `/users/me` response
 * is `{ id, name, email, role }` (flat, plain-string role) — mapped once
 * here to `fullName` so existing screens that read `user.fullName` keep
 * working unmodified.
 */
export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

function toAuthUser(backendUser: { id: string; name?: string | null; email: string; role?: string | null }): AuthUser {
  return {
    id: backendUser.id,
    fullName: backendUser.name ?? "",
    email: backendUser.email,
    role: backendUser.role ?? "user",
  };
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetches the current user from the backend (e.g. after profile edits). */
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password) => {
        const { access_token } = await authApi.login({ email, password });
        await setToken(access_token);
        const me = await authApi.getMe();
        set({ user: toAuthUser(me), isAuthenticated: true });
      },

      register: async (fullName, email, password) => {
        // Unlike the old backend, /users/register issues a real token
        // directly — no need to log in again right after.
        const { access_token } = await authApi.register({ name: fullName, email, password });
        await setToken(access_token);
        const me = await authApi.getMe();
        set({ user: toAuthUser(me), isAuthenticated: true });
      },

      // The backend issues stateless JWTs with no server-side revocation /
      // logout endpoint — logging out is purely a client-side token clear.
      logout: async () => {
        await clearToken();
        set({ user: null, isAuthenticated: false });
      },

      refreshUser: async () => {
        const me = await authApi.getMe();
        set({ user: toAuthUser(me) });
      },
    }),
    {
      name: "wakewise-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Wire the API client's 401 handler to this store once, at module load —
// any request anywhere in the app that comes back 401 (expired/invalid
// token) forces a clean logout instead of leaving the UI in a broken state.
setUnauthorizedHandler(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
