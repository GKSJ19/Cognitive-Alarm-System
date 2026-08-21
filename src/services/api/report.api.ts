/**
 * report.api.ts
 * ---------------------------------------------------------------------------
 * Maps 1:1 to app/routers/report.py in the ICAP backend.
 *
 * Backend notes:
 * - POST /reports/generate body: { report_type, format, days }.
 *   report_type: "habit" | "wakeup" | "challenge" | "productivity" | "sleep"
 *   format: "pdf" | "excel"
 *   days: 1-365 (backend validates this range).
 * - GET /reports/{id}/download streams the actual file (PDF or .xlsx) and
 *   requires the same Bearer auth header as every other endpoint — it is
 *   NOT a public URL, so it can't be opened directly with Linking.openURL.
 *   Downloading it requires attaching the Authorization header, which is
 *   handled in downloadReportFile() below via expo-file-system.
 * - A report can 410 on download if its file was cleaned up server-side —
 *   the caller should prompt the user to regenerate in that case.
 * ---------------------------------------------------------------------------
 */
import * as FileSystem from "expo-file-system";
import { apiClient } from "./client";
import { getToken } from "./tokenStorage";

export type BackendReportType = "habit" | "wakeup" | "challenge" | "productivity" | "sleep";
export type BackendReportFormat = "pdf" | "excel";

export interface GenerateReportPayload {
  report_type: BackendReportType;
  format: BackendReportFormat;
  days: number; // 1-365
}

export interface BackendReport {
  id: string;
  report_type: BackendReportType;
  format: BackendReportFormat;
  generated_at: string;
  download_url: string; // relative path, e.g. "/reports/{id}/download"
}

export interface ReportListResponse {
  total: number;
  reports: BackendReport[];
}

export function generateReport(payload: GenerateReportPayload) {
  return apiClient.post<BackendReport>("/reports/generate", payload).then((r) => r.data);
}

export function listReports(params?: { limit?: number; offset?: number }) {
  return apiClient.get<ReportListResponse>("/reports", { params }).then((r) => r.data);
}

/**
 * Downloads a report to local storage (with the auth header attached) and
 * returns the local file URI, ready to hand to expo-sharing.
 */
export async function downloadReportFile(report: BackendReport): Promise<string> {
  const token = await getToken();
  const baseURL = apiClient.defaults.baseURL ?? "";
  const url = `${baseURL}${report.download_url}`;
  const ext = report.format === "pdf" ? "pdf" : "xlsx";
  const localUri = `${FileSystem.documentDirectory}${report.report_type}_report_${report.id}.${ext}`;

  const result = await FileSystem.downloadAsync(url, localUri, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (result.status === 410) {
    throw new Error("This report file no longer exists — please regenerate it.");
  }
  if (result.status !== 200) {
    throw new Error(`Download failed (status ${result.status}).`);
  }

  return result.uri;
}