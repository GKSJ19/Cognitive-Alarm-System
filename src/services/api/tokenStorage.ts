/**
 * tokenStorage.ts
 * ---------------------------------------------------------------------------
 * Persists both tokens the ICAP backend issues on login/register/refresh:
 * `{ access_token, refresh_token }`. The backend does real refresh-token
 * rotation (POST /users/refresh) — access tokens expire after 60 minutes
 * (ACCESS_TOKEN_EXPIRE_MINUTES in core/security.py), so the refresh token
 * MUST be kept and used, or the user gets logged out every hour.
 *
 * NOTE ON SECURITY: React Native has no browser-style CORS/XSS sandbox, so
 * AsyncStorage (used here, since it's the only storage dependency already
 * present in this project) is a reasonable, common choice for RN apps —
 * but it is NOT hardware-encrypted. For a production build handling
 * sensitive data, swap this module's implementation for `expo-secure-store`
 * (iOS Keychain / Android Keystore) without touching any calling code,
 * since everything else in the app only imports the functions below.
 * ---------------------------------------------------------------------------
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "@wakewise/access_token";
const REFRESH_TOKEN_KEY = "@wakewise/refresh_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN_KEY, accessToken],
    [REFRESH_TOKEN_KEY, refreshToken],
  ]);
}

/** Kept for any old call sites — sets only the access token. Prefer setTokens(). */
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
}