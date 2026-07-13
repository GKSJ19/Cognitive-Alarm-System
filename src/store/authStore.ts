import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import * as authService from "@/services/authService";
import type { AuthUser } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      login: async (email, password) => {
        const user = await authService.login({ email, password });
        set({ user, isAuthenticated: true });
      },

      register: async (fullName, email, password) => {
        const user = await authService.register({
          fullName,
          email,
          password,
        });
        set({ user, isAuthenticated: true });
      },

      logout: () => set({ user: null, isAuthenticated: false }),
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
