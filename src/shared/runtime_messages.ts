import type { SessionData } from "../models/types";
import type { GraphQLActivity } from "./portal_parser";

export const REPORT_PAGE_ORIGIN = "https://web-dynamic-reports.trackmangolf.com";

export const RUNTIME_MESSAGE_TYPES = {
  SAVE_DATA: "SAVE_DATA",
  EXPORT_CSV_REQUEST: "EXPORT_CSV_REQUEST",
  SAVE_IMPORTED_SESSION: "SAVE_IMPORTED_SESSION",
  SAVE_BULK_IMPORTED_SESSION: "SAVE_BULK_IMPORTED_SESSION",
  SAVE_ARCHIVE_EXPORTED_SESSION: "SAVE_ARCHIVE_EXPORTED_SESSION",
  PORTAL_GRAPHQL_FETCH: "PORTAL_GRAPHQL_FETCH",
  HISTORY_ERROR: "HISTORY_ERROR",
  DATA_UPDATED: "DATA_UPDATED",
} as const;

export const WINDOW_MESSAGE_SOURCES = {
  REPORT_INTERCEPTOR: "trackpull-interceptor",
} as const;

export const WINDOW_MESSAGE_TYPES = {
  TRACKMAN_SHOT_DATA: "TRACKMAN_SHOT_DATA",
} as const;

export interface ImportedSessionGraphQLData {
  data?: { node?: GraphQLActivity };
  errors?: Array<{ message: string; extensions?: { code?: string } }>;
}

export interface SaveDataRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.SAVE_DATA;
  data: SessionData;
}

export interface ExportCsvRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.EXPORT_CSV_REQUEST;
}

export interface SaveImportedSessionRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.SAVE_IMPORTED_SESSION;
  graphqlData?: ImportedSessionGraphQLData;
  graphqlPayloads?: ImportedSessionGraphQLData[];
  activityId: string;
}

export interface SaveBulkImportedSessionRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.SAVE_BULK_IMPORTED_SESSION;
  jobId: string;
  graphqlPayloads: ImportedSessionGraphQLData[];
  activityId: string;
}

export interface SaveArchiveExportedSessionRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.SAVE_ARCHIVE_EXPORTED_SESSION;
  jobId: string;
  graphqlPayloads: ImportedSessionGraphQLData[];
  activityId: string;
}

export interface PortalGraphQLFetchRequest {
  type: typeof RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH;
  query: string;
  variables?: Record<string, unknown>;
}

export type RuntimeRequestMessage =
  | SaveDataRequest
  | ExportCsvRequest
  | SaveImportedSessionRequest
  | SaveBulkImportedSessionRequest
  | SaveArchiveExportedSessionRequest
  | PortalGraphQLFetchRequest;

export interface TrackmanShotDataWindowMessage {
  source: typeof WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR;
  type: typeof WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA;
  data: SessionData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
}

function isMinimalClubGroup(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return typeof value.club_name === "string" &&
    Array.isArray(value.shots) &&
    isRecord(value.averages) &&
    isRecord(value.consistency);
}

export function isMinimalSessionData(value: unknown): value is SessionData {
  if (!isRecord(value)) return false;

  return typeof value.date === "string" &&
    typeof value.report_id === "string" &&
    (value.url_type === "report" || value.url_type === "activity") &&
    Array.isArray(value.club_groups) &&
    value.club_groups.every(isMinimalClubGroup) &&
    Array.isArray(value.metric_names) &&
    value.metric_names.every((metric) => typeof metric === "string") &&
    isStringRecord(value.metadata_params);
}

export function isTrackmanShotDataWindowMessage(value: unknown): value is TrackmanShotDataWindowMessage {
  if (!isRecord(value)) return false;
  return value.source === WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR &&
    value.type === WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA &&
    isMinimalSessionData(value.data);
}

function originFromUrl(urlValue: string | undefined): string | null {
  if (!urlValue) return null;
  try {
    return new URL(urlValue).origin;
  } catch {
    return null;
  }
}

export function isAllowedReportOrigin(origin: string | undefined): boolean {
  return originFromUrl(origin) === REPORT_PAGE_ORIGIN;
}

export function isAllowedReportRuntimeSender(sender: chrome.runtime.MessageSender): boolean {
  const senderWithOrigin = sender as chrome.runtime.MessageSender & { origin?: string };
  return isAllowedReportOrigin(senderWithOrigin.origin) ||
    isAllowedReportOrigin(sender.url) ||
    isAllowedReportOrigin(sender.tab?.url);
}
