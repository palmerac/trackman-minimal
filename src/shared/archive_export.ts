import type { ActivitySummary } from "./import_types";
import { isSupportedPortalActivityType } from "./import_types";

export type ArchiveExportItemStatus =
  | "pending"
  | "exporting"
  | "exported"
  | "unsupported"
  | "failed";

export type ArchiveExportJobState =
  | "idle"
  | "running"
  | "paused"
  | "complete"
  | "cancelled";

export type ArchiveExportFailureKind =
  | "unsupported"
  | "fetch"
  | "parse"
  | "storage"
  | "unknown";

export type ArchiveExportUnsupportedReason =
  | "unsupported-activity-type"
  | "missing-activity-type";

export interface ArchiveExportOptions {
  idPrefix?: string;
  includeUnsupportedItems?: boolean;
}

export interface ArchiveExportFailure {
  activityId: string;
  date: string;
  type: string | null;
  detail: string;
  kind: ArchiveExportFailureKind;
  message: string;
  reportId?: string;
  unsupportedReason?: ArchiveExportUnsupportedReason;
  capturedAt?: number;
}

export interface ArchiveExportItem {
  activityId: string;
  date: string;
  type: string | null;
  detail: string;
  status: ArchiveExportItemStatus;
  reportId?: string;
  shotCount?: number;
  error?: string;
  failureKind?: ArchiveExportFailureKind;
  unsupportedReason?: ArchiveExportUnsupportedReason;
  updatedAt?: number;
}

export interface ArchiveExportJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  state: ArchiveExportJobState;
  total: number;
  pending: number;
  exported: number;
  failed: number;
  unsupported: number;
  currentActivityId?: string;
  lastError?: string;
  items: ArchiveExportItem[];
}

function createJobId(now: number, prefix: string): string {
  return `${prefix}-${now.toString(36)}`;
}

function getActivityDetail(activity: ActivitySummary): string {
  if (activity.courseName?.trim()) return activity.courseName.trim();
  return activity.strokeCount === null ? "" : `${activity.strokeCount} shots`;
}

function getUnsupportedReason(type: string | null): ArchiveExportUnsupportedReason | null {
  if (type === null) return "missing-activity-type";
  if (!isSupportedPortalActivityType(type)) return "unsupported-activity-type";
  return null;
}

function countStatus(items: ArchiveExportItem[], status: ArchiveExportItemStatus): number {
  return items.filter((item) => item.status === status).length;
}

function recalculateJob(job: ArchiveExportJob, now: number): ArchiveExportJob {
  return {
    ...job,
    updatedAt: now,
    total: job.items.length,
    pending: countStatus(job.items, "pending"),
    exported: countStatus(job.items, "exported"),
    failed: countStatus(job.items, "failed"),
    unsupported: countStatus(job.items, "unsupported"),
  };
}

function createUnsupportedMessage(type: string | null): string {
  if (type === null) return "Activity type is missing, so TrackPull cannot export this portal session.";
  return `Activity type '${type}' is not supported by TrackPull archive export.`;
}

export function createArchiveExportJob(
  activities: ActivitySummary[],
  now = Date.now(),
  options: ArchiveExportOptions = {}
): ArchiveExportJob {
  const seenIds = new Set<string>();
  const items: ArchiveExportItem[] = [];
  const includeUnsupportedItems = options.includeUnsupportedItems ?? true;

  for (const activity of activities) {
    if (seenIds.has(activity.id)) continue;
    seenIds.add(activity.id);

    const unsupportedReason = getUnsupportedReason(activity.type);
    if (unsupportedReason && !includeUnsupportedItems) continue;

    items.push({
      activityId: activity.id,
      date: activity.date,
      type: activity.type,
      detail: getActivityDetail(activity),
      status: unsupportedReason ? "unsupported" : "pending",
      error: unsupportedReason ? createUnsupportedMessage(activity.type) : undefined,
      failureKind: unsupportedReason ? "unsupported" : undefined,
      unsupportedReason: unsupportedReason ?? undefined,
      updatedAt: unsupportedReason ? now : undefined,
    });
  }

  return recalculateJob({
    id: createJobId(now, options.idPrefix ?? "archive"),
    createdAt: now,
    updatedAt: now,
    state: "idle",
    total: items.length,
    pending: 0,
    exported: 0,
    failed: 0,
    unsupported: 0,
    items,
  }, now);
}

export function startArchiveExportJob(job: ArchiveExportJob, now = Date.now()): ArchiveExportJob {
  return recalculateJob({
    ...job,
    state: "running",
    lastError: undefined,
  }, now);
}

export function pauseArchiveExportJob(job: ArchiveExportJob, now = Date.now()): ArchiveExportJob {
  return recalculateJob({
    ...job,
    state: "paused",
    currentActivityId: undefined,
    items: job.items.map((item) => item.status === "exporting"
      ? { ...item, status: "pending", updatedAt: now }
      : item
    ),
  }, now);
}

export function cancelArchiveExportJob(job: ArchiveExportJob, now = Date.now()): ArchiveExportJob {
  return recalculateJob({
    ...job,
    state: "cancelled",
    currentActivityId: undefined,
    items: job.items.map((item) => item.status === "exporting"
      ? { ...item, status: "pending", updatedAt: now }
      : item
    ),
  }, now);
}

export function completeArchiveExportJob(job: ArchiveExportJob, now = Date.now()): ArchiveExportJob {
  return recalculateJob({
    ...job,
    state: "complete",
    currentActivityId: undefined,
  }, now);
}

export function recoverInterruptedArchiveExportJob(
  job: ArchiveExportJob,
  now = Date.now()
): ArchiveExportJob {
  if (job.state !== "running" && !job.items.some((item) => item.status === "exporting")) {
    return job;
  }

  return pauseArchiveExportJob(job, now);
}

export function resetFailedArchiveExportItems(
  job: ArchiveExportJob,
  now = Date.now()
): ArchiveExportJob {
  return recalculateJob({
    ...job,
    state: "idle",
    lastError: undefined,
    items: job.items.map((item) => item.status === "failed"
      ? {
          ...item,
          status: "pending",
          error: undefined,
          failureKind: undefined,
          unsupportedReason: undefined,
          updatedAt: now,
        }
      : item
    ),
  }, now);
}

export function getNextArchiveExportItem(job: ArchiveExportJob): ArchiveExportItem | null {
  return job.items.find((item) => item.status === "pending") ?? null;
}

export function updateArchiveExportItem(
  job: ArchiveExportJob,
  activityId: string,
  patch: Partial<ArchiveExportItem>,
  now = Date.now()
): ArchiveExportJob {
  const items = job.items.map((item) => item.activityId === activityId
    ? { ...item, ...patch, updatedAt: now }
    : item
  );

  const nextJob = recalculateJob({
    ...job,
    items,
    currentActivityId: patch.status === "exporting" ? activityId : job.currentActivityId,
  }, now);

  if (patch.status && patch.status !== "exporting" && nextJob.currentActivityId === activityId) {
    return { ...nextJob, currentActivityId: undefined };
  }

  return nextJob;
}

export function failArchiveExportItem(
  job: ArchiveExportJob,
  activityId: string,
  message: string,
  kind: Exclude<ArchiveExportFailureKind, "unsupported"> = "unknown",
  now = Date.now()
): ArchiveExportJob {
  return {
    ...updateArchiveExportItem(job, activityId, {
      status: "failed",
      error: message,
      failureKind: kind,
    }, now),
    lastError: message,
  };
}

export function skipUnsupportedArchiveExportItem(
  job: ArchiveExportJob,
  activityId: string,
  message: string,
  unsupportedReason: ArchiveExportUnsupportedReason = "unsupported-activity-type",
  now = Date.now()
): ArchiveExportJob {
  return updateArchiveExportItem(job, activityId, {
    status: "unsupported",
    error: message,
    failureKind: "unsupported",
    unsupportedReason,
  }, now);
}

export function getArchiveExportCompletedCount(job: ArchiveExportJob): number {
  return job.exported + job.failed + job.unsupported;
}

export function getArchiveExportProgressLabel(job: ArchiveExportJob): string {
  const completed = getArchiveExportCompletedCount(job);
  if (job.total === 0) return "No supported portal sessions found";

  const parts = [`${completed} / ${job.total}`];
  if (job.exported > 0) parts.push(`${job.exported} exported`);
  if (job.failed > 0) parts.push(`${job.failed} failed`);
  if (job.unsupported > 0) parts.push(`${job.unsupported} unsupported`);
  return parts.join(" | ");
}

export function getArchiveExportFailureForItem(item: ArchiveExportItem): ArchiveExportFailure | null {
  if (item.status !== "failed" && item.status !== "unsupported") return null;

  return {
    activityId: item.activityId,
    date: item.date,
    type: item.type,
    detail: item.detail,
    kind: item.failureKind ?? (item.status === "unsupported" ? "unsupported" : "unknown"),
    message: item.error ?? "Archive export item did not complete.",
    reportId: item.reportId,
    unsupportedReason: item.unsupportedReason,
    capturedAt: item.updatedAt,
  };
}
