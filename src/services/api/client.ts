/**
 * client.ts
 * ---------------------------------------------------------------------------
 * Shared Axios client
 * Backend Base URL:
 * http://localhost:8000  (routers are mounted at root — /users, /alarms,
 * /challenges, /difficulty, /verify — there is NO /api/v1 prefix on this
 * backend)
 *
 * Token refresh: access tokens expire after 60 minutes. On a 401 from any
 * endpoint other than login/register/refresh itself, this interceptor
 * transparently calls POST /users/refresh with the stored refresh token,
 * stores the new pair, and retries the original request once. If the
 * refresh call itself fails (expired/revoked/reused refresh token), the
 * user is logged out via unauthorizedHandler. Concurrent requests that
 * 401 at the same time share a single in-flight refresh call instead of
 * each triggering their own (which would trip the backend's reuse-
 * detection and revoke every session).
 * ---------------------------------------------------------------------------
 */

import axios from "axios";
import { getToken, getRefreshToken, setTokens, clearToken } from "./tokenStorage";
import { toApiError } from "./errors";

// Base URL
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

/**
 * Endpoints where 401 is expected and should NOT trigger a refresh attempt
 * or a forced logout.
 */
const AUTH_ENDPOINTS = ["/users/login", "/users/register", "/users/refresh"];

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Refresh queueing ---
let isRefreshing = false;
let pendingQueue: { resolve: (token: string | null) => void }[] = [];

function flushQueue(newToken: string | null) {
  pendingQueue.forEach((p) => p.resolve(newToken));
  pendingQueue = [];
}

async function performRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/users/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    await setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    const originalConfig = error?.config;

    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) => url.includes(path));

    if (status === 401 && !isAuthEndpoint && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;

      if (isRefreshing) {
        // Another request already triggered a refresh — wait for it.
        const newToken = await new Promise<string | null>((resolve) => {
          pendingQueue.push({ resolve });
        });
        if (!newToken) {
          await clearToken();
          unauthorizedHandler?.();
          return Promise.reject(toApiError(error));
        }
        originalConfig.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalConfig);
      }

      isRefreshing = true;
      const newToken = await performRefresh();
      isRefreshing = false;
      flushQueue(newToken);

      if (!newToken) {
        await clearToken();
        unauthorizedHandler?.();
        return Promise.reject(toApiError(error));
      }

      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalConfig);
    }

    if (status === 401 && !isAuthEndpoint) {
      // Already retried once and still 401 — give up.
      await clearToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(toApiError(error));
  }
);