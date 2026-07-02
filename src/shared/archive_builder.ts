import type { SessionSnapshot } from "../models/types";
import type { UnitChoice } from "./unit_normalization";
import { writeBulkCsv } from "./csv_writer";
import type { ArchiveExportFailure, ArchiveExportItem, ArchiveExportJob } from "./archive_export";
import { getArchiveExportFailureForItem } from "./archive_export";

export interface ArchiveOutputBlob {
  filename: string;
  mimeType: string;
  contents: string;
}

export interface ArchiveBuildOptions {
  includeAverages?: boolean;
  metricOrder?: string[];
  unitChoice?: UnitChoice;
  hittingSurface?: "Grass" | "Mat";
  generatedAt?: string;
  baseFilename?: string;
}

export interface ArchiveBuildInput {
  job: ArchiveExportJob;
  sessions: SessionSnapshot[];
  failures?: ArchiveExportFailure[];
  unsupported?: ArchiveExportItem[];
  options?: ArchiveBuildOptions;
}

export interface ArchiveManifestSession {
  reportId: string;
  date: string;
  activityType: string;
  clubGroupCount: number;
  shotCount: number;
  metricNames: string[];
}

export interface ArchiveManifestFile {
  filename: string;
  mimeType: string;
  role: "sessions-csv" | "manifest" | "failures" | "unsupported";
}

export interface ArchiveManifest {
  schemaVersion: 1;
  generatedAt: string;
  job: {
    id: string;
    state: ArchiveExportJob["state"];
    createdAt: number;
    updatedAt: number;
    total: number;
    exported: number;
    failed: number;
    unsupported: number;
  };
  counts: {
    sessions: number;
    failures: number;
    unsupported: number;
    files: number;
  };
  sessions: ArchiveManifestSession[];
  failures: ArchiveExportFailure[];
  files: ArchiveManifestFile[];
}

export interface ArchiveBuildResult {
  files: ArchiveOutputBlob[];
  manifest: ArchiveManifest;
  csv: ArchiveOutputBlob;
  failures: ArchiveOutputBlob;
  unsupported?: ArchiveOutputBlob;
}

function countSessionShots(session: SessionSnapshot): number {
  let total = 0;
  for (const club of session.club_groups) {
    total += club.shots.length;
  }
  return total;
}

function createSessionManifest(session: SessionSnapshot): ArchiveManifestSession {
  return {
    reportId: session.report_id,
    date: session.date,
    activityType: session.metadata_params.activity_type ?? session.metadata_params.activity_kind ?? "",
    clubGroupCount: session.club_groups.length,
    shotCount: countSessionShots(session),
    metricNames: [...session.metric_names],
  };
}

function deriveFailures(job: ArchiveExportJob, suppliedFailures: ArchiveExportFailure[] | undefined): ArchiveExportFailure[] {
  const failures = suppliedFailures ? [...suppliedFailures] : [];
  const existingKeys = new Set(failures.map((failure) => `${failure.activityId}:${failure.kind}:${failure.message}`));

  for (const item of job.items) {
    const failure = getArchiveExportFailureForItem(item);
    if (!failure) continue;

    const key = `${failure.activityId}:${failure.kind}:${failure.message}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    failures.push(failure);
  }

  return failures.sort((a, b) => (a.capturedAt ?? 0) - (b.capturedAt ?? 0) || a.activityId.localeCompare(b.activityId));
}

function deriveUnsupported(job: ArchiveExportJob, suppliedUnsupported: ArchiveExportItem[] | undefined): ArchiveExportItem[] {
  const unsupported = suppliedUnsupported ? [...suppliedUnsupported] : [];
  const existingIds = new Set(unsupported.map((item) => item.activityId));

  for (const item of job.items) {
    if (item.status !== "unsupported" || existingIds.has(item.activityId)) continue;
    existingIds.add(item.activityId);
    unsupported.push(item);
  }

  return unsupported.sort((a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0) || a.activityId.localeCompare(b.activityId));
}

function toJson(contents: unknown): string {
  return `${JSON.stringify(contents, null, 2)}\n`;
}

function buildUnsupportedText(items: ArchiveExportItem[]): string {
  if (items.length === 0) return "No unsupported portal sessions were skipped.\n";

  const lines = [
    "Unsupported portal sessions skipped by TrackPull archive export",
    "",
  ];

  for (const item of items) {
    const typeLabel = item.type ?? "missing type";
    const detail = item.detail ? ` (${item.detail})` : "";
    lines.push(`- ${item.date} ${item.activityId}${detail}: ${typeLabel} — ${item.error ?? "Unsupported portal activity"}`);
  }

  return `${lines.join("\n")}\n`;
}

function createOutputBlob(filename: string, mimeType: string, contents: string): ArchiveOutputBlob {
  return { filename, mimeType, contents };
}

export function buildArchiveExportOutputs(input: ArchiveBuildInput): ArchiveBuildResult {
  const options = input.options ?? {};
  const baseFilename = options.baseFilename ?? `trackpull-archive-${input.job.id}`;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const failures = deriveFailures(input.job, input.failures);
  const unsupportedItems = deriveUnsupported(input.job, input.unsupported);

  const csv = createOutputBlob(
    `${baseFilename}-sessions.csv`,
    "text/csv;charset=utf-8",
    writeBulkCsv(
      input.sessions,
      options.includeAverages ?? true,
      options.metricOrder,
      options.unitChoice,
      options.hittingSurface
    )
  );

  const failuresBlob = createOutputBlob(
    `${baseFilename}-failures.json`,
    "application/json;charset=utf-8",
    toJson({ schemaVersion: 1, generatedAt, jobId: input.job.id, failures })
  );

  const manifestFilename = `${baseFilename}-manifest.json`;
  const fileManifest: ArchiveManifestFile[] = [
    { filename: csv.filename, mimeType: csv.mimeType, role: "sessions-csv" },
    { filename: manifestFilename, mimeType: "application/json;charset=utf-8", role: "manifest" },
    { filename: failuresBlob.filename, mimeType: failuresBlob.mimeType, role: "failures" },
  ];

  let unsupportedBlob: ArchiveOutputBlob | undefined;
  if (unsupportedItems.length > 0) {
    unsupportedBlob = createOutputBlob(
      `${baseFilename}-unsupported.txt`,
      "text/plain;charset=utf-8",
      buildUnsupportedText(unsupportedItems)
    );
    fileManifest.push({ filename: unsupportedBlob.filename, mimeType: unsupportedBlob.mimeType, role: "unsupported" });
  }

  const manifest: ArchiveManifest = {
    schemaVersion: 1,
    generatedAt,
    job: {
      id: input.job.id,
      state: input.job.state,
      createdAt: input.job.createdAt,
      updatedAt: input.job.updatedAt,
      total: input.job.total,
      exported: input.job.exported,
      failed: input.job.failed,
      unsupported: input.job.unsupported,
    },
    counts: {
      sessions: input.sessions.length,
      failures: failures.length,
      unsupported: unsupportedItems.length,
      files: fileManifest.length,
    },
    sessions: input.sessions.map(createSessionManifest),
    failures,
    files: fileManifest,
  };

  const manifestBlob = createOutputBlob(
    manifestFilename,
    "application/json;charset=utf-8",
    toJson(manifest)
  );
  const files = unsupportedBlob
    ? [csv, manifestBlob, failuresBlob, unsupportedBlob]
    : [csv, manifestBlob, failuresBlob];

  return {
    files,
    manifest,
    csv,
    failures: failuresBlob,
    unsupported: unsupportedBlob,
  };
}
