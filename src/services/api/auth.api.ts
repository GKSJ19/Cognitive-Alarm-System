/**
 * auth.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/users.py in the ICAP backend.
 *
 * Backend notes:
 * - POST /users/register and POST /users/login both return
 *   { access_token, refresh_token, token_type } — register issues a real
 *   token pair immediately, no separate "log in right after" step needed.
 * - Access tokens expire after 60 minutes (ACCESS_TOKEN_EXPIRE_MINUTES in
 *   core/security.py). The refresh_token must be stored and used via
 *   POST /users/refresh — client.ts's interceptor does this automatically
 *   on any 401.
 * - GET /users/me returns a flat { id, name, email, role } — no nested
 *   profile object, no `full_name` (it's just `name`), role is a plain
 *   string, not an object.
 * - PUT /users/me accepts (all optional): name, preferred_wake_time
 *   ("HH:MM:SS"), sleep_duration_mins, timezone, goal_type,
 *   difficulty_pref — and returns all of those plus id/name/email/role in
 *   one response.
 * - Forgot/reset password and Google login are real, implemented
 *   endpoints here.
 * - POST /users/refresh, /users/logout, /users/change-password are all
 *   real and implemented (refresh-token rotation with reuse detection).
 * ---------------------------------------------------------------------------
 */

import { apiClient } from "./client";

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface BackendUserProfile extends BackendUser {
  preferred_wake_time?: string | null;
  sleep_duration_mins?: number | null;
  timezone?: string | null;
  goal_type?: string | null;
  difficulty_pref?: string | null;
}

/**
 * Register
 * POST /users/register
 */
export function register(params: { name: string; email: string; password: string }) {
  return apiClient
    .post<TokenResponse>("/users/register", {
      name: params.name,
      email: params.email,
      password: params.password,
    })
    .then((r) => r.data);
}

/**
 * Login
 * POST /users/login
 * Backend expects a plain JSON body (NOT form-urlencoded).
 */
export function login(params: { email: string; password: string }) {
  return apiClient
    .post<TokenResponse>("/users/login", {
      email: params.email,
      password: params.password,
    })
    .then((r) => r.data);
}

/**
 * Current User
 * GET /users/me
 */
export function getMe() {
  return apiClient.get<BackendUser>("/users/me").then((r) => r.data);
}

export interface UpdateProfilePayload {
  name?: string;
  preferred_wake_time?: string | null;
  sleep_duration_mins?: number | null;
  timezone?: string | null;
  goal_type?: string | null;
  difficulty_pref?: string | null;
}

/**
 * Update profile
 * PUT /users/me
 */
export function updateProfile(payload: UpdateProfilePayload) {
  return apiClient.put<BackendUserProfile>("/users/me", payload).then((r) => r.data);
}

/**
 * Forgot password
 * POST /users/forgot-password
 * Always returns a generic success message, even for unknown emails
 * (prevents email enumeration) — the backend also returns the raw
 * `reset_token` in the response body for now since there's no email
 * sending wired up yet.
 */
export function forgotPassword(email: string) {
  return apiClient
    .post<{ message: string; reset_token?: string }>("/users/forgot-password", { email })
    .then((r) => r.data);
}

/**
 * Reset password
 * POST /users/reset-password
 */
export function resetPassword(token: string, newPassword: string) {
  return apiClient
    .post<{ message: string }>("/users/reset-password", { token, new_password: newPassword })
    .then((r) => r.data);
}

/**
 * Google login
 * POST /users/google-login
 * Requires GOOGLE_CLIENT_ID configured on the backend — returns 503 if not.
 */
export function googleLogin(idToken: string) {
  return apiClient
    .post<TokenResponse>("/users/google-login", { id_token: idToken })
    .then((r) => r.data);
}

/**
 * Refresh
 * POST /users/refresh
 * Rotating refresh tokens: the backend revokes the old refresh token and
 * issues a brand new access+refresh pair every time this is called. If the
 * SAME refresh token is ever sent twice (reuse of an already-rotated
 * token — a signal of theft), the backend revokes every session for that
 * user and this call 401s.
 */
export function refreshTokens(refreshToken: string) {
  return apiClient.post<TokenResponse>("/users/refresh", { refresh_token: refreshToken }).then((r) => r.data);
}

/**
 * Logout
 * POST /users/logout
 * Revokes this specific refresh token server-side. Unlike a purely
 * client-side token clear, this actually invalidates the session — a
 * captured refresh token can no longer be used after this call.
 */
export function logout(refreshToken: string) {
  return apiClient.post<{ message: string }>("/users/logout", { refresh_token: refreshToken }).then((r) => r.data);
}

/**
 * Change password
 * POST /users/change-password
 * Requires current_password to match. On success, the backend revokes
 * every other active refresh token for this user — all other sessions are
 * logged out.
 */
export function changePassword(currentPassword: string, newPassword: string) {
  return apiClient
    .post<{ message: string }>("/users/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    })
    .then((r) => r.data);
}