/**
 * authService.ts
 * ---------------------------------------------------------------------------
 * This project ships without a live backend (the `api-mock` folder in the
 * repo is empty), so this service simulates one locally using AsyncStorage
 * as a tiny "users table" on-device. It exposes the same shape a real API
 * client would (async functions that resolve/reject), so swapping it out
 * later for real HTTP calls (e.g. via `axios`) only requires rewriting the
 * inside of these functions — nothing in the screens or the auth store has
 * to change.
 *
 * NOTE: password "hashing" here is a simple, non-cryptographic obfuscation
 * for demo purposes only. A real backend must hash passwords server-side
 * with something like bcrypt/argon2 and never store them client-side.
 * ---------------------------------------------------------------------------
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "@wakewise/users";
const RESET_CODES_KEY = "@wakewise/reset_codes";
const RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const NETWORK_DELAY_MS = 500;

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
}

interface StoredUser extends AuthUser {
  passwordHash: string;
}

interface ResetCodeEntry {
  code: string;
  expiresAt: number;
}

export class AuthError extends Error {}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simple deterministic string hash (NOT cryptographically secure).
function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `h${hash}`;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function getResetCodes(): Promise<Record<string, ResetCodeEntry>> {
  const raw = await AsyncStorage.getItem(RESET_CODES_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveResetCodes(
  codes: Record<string, ResetCodeEntry>
): Promise<void> {
  await AsyncStorage.setItem(RESET_CODES_KEY, JSON.stringify(codes));
}

function toPublicUser(user: StoredUser): AuthUser {
  return { id: user.id, fullName: user.fullName, email: user.email };
}

export async function register(params: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  await delay(NETWORK_DELAY_MS);

  const email = normalizeEmail(params.email);
  const users = await getUsers();

  if (users.some((u) => u.email === email)) {
    throw new AuthError("An account with this email already exists.");
  }

  const newUser: StoredUser = {
    id: Date.now().toString(),
    fullName: params.fullName.trim(),
    email,
    passwordHash: hashPassword(params.password),
  };

  users.push(newUser);
  await saveUsers(users);

  return toPublicUser(newUser);
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  await delay(NETWORK_DELAY_MS);

  const email = normalizeEmail(params.email);
  const users = await getUsers();
  const user = users.find((u) => u.email === email);

  if (!user || user.passwordHash !== hashPassword(params.password)) {
    throw new AuthError("Incorrect email or password.");
  }

  return toPublicUser(user);
}

/**
 * Simulates sending a password-reset code by email. Since there is no
 * email/SMS provider wired up, the generated code is returned to the
 * caller so the UI can surface it directly to the user for demo purposes.
 */
export async function requestPasswordReset(params: {
  email: string;
}): Promise<{ code: string }> {
  await delay(NETWORK_DELAY_MS);

  const email = normalizeEmail(params.email);
  const users = await getUsers();

  if (!users.some((u) => u.email === email)) {
    throw new AuthError("No account found with that email address.");
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const codes = await getResetCodes();
  codes[email] = { code, expiresAt: Date.now() + RESET_CODE_TTL_MS };
  await saveResetCodes(codes);

  return { code };
}

export async function resetPassword(params: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  await delay(NETWORK_DELAY_MS);

  const email = normalizeEmail(params.email);
  const codes = await getResetCodes();
  const entry = codes[email];

  if (!entry || entry.code !== params.code.trim()) {
    throw new AuthError("Invalid or incorrect reset code.");
  }

  if (Date.now() > entry.expiresAt) {
    throw new AuthError("This reset code has expired. Request a new one.");
  }

  const users = await getUsers();
  const index = users.findIndex((u) => u.email === email);

  if (index === -1) {
    throw new AuthError("No account found with that email address.");
  }

  users[index].passwordHash = hashPassword(params.newPassword);
  await saveUsers(users);

  delete codes[email];
  await saveResetCodes(codes);
}
