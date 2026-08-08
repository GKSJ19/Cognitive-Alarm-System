/**
 * client.ts
 * ---------------------------------------------------------------------------
 * Shared Axios client
 * Backend Base URL:
 * http://localhost:8000  (routers are mounted at root — /users, /alarms,
 * /challenges, /difficulty, /verify — there is NO /api/v1 prefix on this
 * backend)
 * ---------------------------------------------------------------------------
 */

import axios from "axios";
import { getToken, clearToken } from "./tokenStorage";
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
 * Endpoints where 401 is expected
 */
const AUTH_ENDPOINTS = [
  "/users/login",
  "/users/register",
];

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";

    const isAuthEndpoint = AUTH_ENDPOINTS.some((path) =>
      url.includes(path)
    );

    if (status === 401 && !isAuthEndpoint) {
      await clearToken();
      unauthorizedHandler?.();
    }

    return Promise.reject(toApiError(error));
  }
);