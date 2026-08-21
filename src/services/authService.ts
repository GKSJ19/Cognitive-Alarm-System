/**
 * authService.ts
 * ---------------------------------------------------------------------------
 * DEPRECATED — do not use.
 *
 * This was the original AsyncStorage-based fake auth layer, written before
 * the real backend (app/routers/users.py) existed. It is no longer
 * imported anywhere in the app — the three screens that need auth
 * (app/auth/forgot-password.tsx, app/settings/account.tsx,
 * store/authStore.ts) all import from `@/services/api/auth.api` instead,
 * which hits the real FastAPI backend and (via store/authStore.ts +
 * services/api/client.ts) handles real JWT access/refresh token rotation.
 *
 * This file is kept only so any stray old import fails loudly instead of
 * silently reintroducing fake, non-networked auth. Delete this file once
 * you've confirmed nothing references it in your own branches.
 * ---------------------------------------------------------------------------
 */

throw new Error(
  "authService.ts is deprecated and must not be used — import from '@/services/api/auth.api' instead."
);

export {};