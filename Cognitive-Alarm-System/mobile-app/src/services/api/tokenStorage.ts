/**
 * tokenStorage.ts
 * ---------------------------------------------------------------------------
 * Persists the JWT issued by the ICAP backend (`POST /users/login`,
 * `/register`, `/google-login` all return `{ access_token }`).
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

const TOKEN_KEY = "@wakewise/access_token";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
