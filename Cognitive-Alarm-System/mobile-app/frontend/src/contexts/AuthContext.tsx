import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { apiClient } from "../services/apiClient";
import { STORAGE_KEYS } from "../constants";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem(STORAGE_KEYS.TOKEN)
  );

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/users/me");
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      logout();
    }
  }, [logout]);

  const login = useCallback(
    async (newToken: string) => {
      localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);
      setToken(newToken);

      try {
        const response = await apiClient.get("/users/me", {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        setUser(response.data);
      } catch (error) {
        logout();
        throw error;
      }
    },
    [logout]
  );

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);

      if (storedToken) {
        try {
          const response = await apiClient.get("/users/me", {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          setUser(response.data);
        } catch (error) {
          console.error("Session expired", error);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}