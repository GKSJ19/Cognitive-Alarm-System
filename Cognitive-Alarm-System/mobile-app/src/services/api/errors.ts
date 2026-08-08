/**
 * errors.ts
 * ---------------------------------------------------------------------------
 * Normalized error type thrown by every function in src/services/api/*.
 * Screens can keep doing `error instanceof ApiError ? error.message : ...`
 * exactly like they used to do with the old `AuthError`.
 * ---------------------------------------------------------------------------
 */
import { AxiosError } from "axios";

export class ApiError extends Error {
  /** HTTP status code, if the request reached the server (undefined for network/timeout errors) */
  status?: number;
  /** Raw `detail` payload FastAPI returned (string, or list of validation errors) */
  detail?: unknown;
  isNetworkError: boolean;
  isTimeout: boolean;

  constructor(message: string, opts: { status?: number; detail?: unknown; isNetworkError?: boolean; isTimeout?: boolean } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.detail = opts.detail;
    this.isNetworkError = opts.isNetworkError ?? false;
    this.isTimeout = opts.isTimeout ?? false;
  }
}

/** FastAPI's default error shape is `{ detail: string | {msg, loc, type}[] }` */
function extractDetailMessage(detail: unknown): string | null {
  if (!detail) return null;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object" && "msg" in first) {
      return String((first as { msg: unknown }).msg);
    }
  }
  return null;
}

/** Converts any error thrown by axios into a normalized ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<{ detail?: unknown }>;

  if (axiosError?.isAxiosError) {
    if (axiosError.code === "ECONNABORTED") {
      return new ApiError("The request timed out. Please check your connection and try again.", {
        isTimeout: true,
      });
    }
    if (!axiosError.response) {
      return new ApiError("Can't reach the server. Check your network connection or that the backend is running.", {
        isNetworkError: true,
      });
    }

    const status = axiosError.response.status;
    const detail = axiosError.response.data?.detail;
    const detailMessage = extractDetailMessage(detail);

    if (status === 401) {
      return new ApiError(detailMessage ?? "Your session has expired. Please log in again.", { status, detail });
    }
    if (status === 429) {
      return new ApiError("Too many requests. Please wait a moment and try again.", { status, detail });
    }
    if (status && status >= 500) {
      return new ApiError("Something went wrong on the server. Please try again shortly.", { status, detail });
    }

    return new ApiError(detailMessage ?? "Something went wrong. Please try again.", { status, detail });
  }

  return new ApiError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
}
