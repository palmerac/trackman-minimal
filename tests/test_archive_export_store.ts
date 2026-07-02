import { beforeEach, describe, expect, it, vi } from "vitest";
import { indexedDB } from "fake-indexeddb";
import type { SessionData } from "../src/models/types";
import type { ArchiveExportFailure, ArchiveExportItem } from "../src/shared/archive_export";
import { createArchiveExportJob, failArchiveExportItem } from "../src/shared/archive_export";
import {
  clearAllArchiveExports,
  clearArchiveExportJob,
  getArchiveExportFailures,
  getArchiveExportItems,
  getArchiveExportJob,
  getArchiveExportSessions,
  getArchiveExportSnapshot,
  putArchiveExportFailure,
  putArchiveExportItem,
  putArchiveExportJob,
  putArchiveExportSession,
} from "../src/shared/archive_export_store";

vi.stubGlobal("indexedDB", indexedDB);

function makeSession(reportId: string, date: string, raw = true): SessionData {
  return {
    date,
    report_id: reportId,
    url_type: "activity",
    metric_names: ["ClubSpeed"],
    metadata_params: {
      activity_id: `activity-${reportId}`,
      activity_type: "CoursePlayActivity",
    },
    club_groups: [
      {
        club_name: "Driver",
        shots: [{ shot_number: 1, metrics: { ClubSpeed: "101" } }],
        averages: { ClubSpeed: "101" },
        consistency: {},
      },
    ],
    raw_api_data: raw ? { very: "large", nested: { payload: true } } : undefined,
  };
}

const unsupportedItem: ArchiveExportItem = {
  activityId: "activity-unsupported",
  date: "2026-06-04",
  type: "VirtualGolfActivity",
  detail: "Virtual Links",
  status: "unsupported",
  error: "Unsupported activity type",
  failureKind: "unsupported",
  unsupportedReason: "unsupported-activity-type",
  updatedAt: 1_300,
};

describe("archive export IndexedDB store", () => {
  beforeEach(async () => {
    await clearAllArchiveExports().catch(() => undefined);
  });

  it("persists a resumable job, sorted items, raw-data-stripped sessions, and transparent failures", async () => {
    let job = createArchiveExportJob([
      { id: "activity-1", date: "2026-06-01", strokeCount: 12, type: "CoursePlayActivity" },
      { id: "activity-2", date: "2026-06-02", strokeCount: 8, type: "MapMyBagActivity" },
    ], 1_000);
    job = failArchiveExportItem(job, "activity-2", "Portal request failed", "fetch", 1_200);

    await putArchiveExportJob(job);
    await putArchiveExportItem(job.id, job.items[0], 0);
    await putArchiveExportItem(job.id, job.items[1], 1);
    await putArchiveExportItem(job.id, unsupportedItem, 2);
    await putArchiveExportSession(job.id, "activity-1", makeSession("report-1", "2026-06-01"), 1_500);
    await putArchiveExportSession(job.id, "activity-1b", { ...makeSession("report-1", "2026-07-01"), metadata_params: { activity_id: "activity-1b" } }, 1_600);

    const fetchFailure: ArchiveExportFailure = {
      activityId: "activity-2",
      date: "2026-06-02",
      type: "MapMyBagActivity",
      detail: "8 shots",
      kind: "fetch",
      message: "Portal request failed",
      reportId: "report-2",
    };
    const unsupportedFailure: ArchiveExportFailure = {
      activityId: unsupportedItem.activityId,
      date: unsupportedItem.date,
      type: unsupportedItem.type,
      detail: unsupportedItem.detail,
      kind: "unsupported",
      message: unsupportedItem.error!,
      unsupportedReason: unsupportedItem.unsupportedReason,
      capturedAt: unsupportedItem.updatedAt,
    };
    await putArchiveExportFailure(job.id, fetchFailure, 1_700);
    await putArchiveExportFailure(job.id, unsupportedFailure, 1_300);

    const [storedJob, storedItems, storedSessions, storedFailures, snapshot] = await Promise.all([
      getArchiveExportJob(job.id),
      getArchiveExportItems(job.id),
      getArchiveExportSessions(job.id),
      getArchiveExportFailures(job.id),
      getArchiveExportSnapshot(job.id),
    ]);

    expect(storedJob).toMatchObject({ id: job.id, failed: 1, lastError: "Portal request failed" });
    expect(storedItems.map((item) => item.activityId)).toEqual(["activity-1", "activity-2", "activity-unsupported"]);
    expect(storedItems.map((item) => item.sortIndex)).toEqual([0, 1, 2]);
    expect(storedSessions).toHaveLength(1);
    expect(storedSessions[0]).toMatchObject({ report_id: "report-1", date: "2026-07-01" });
    expect(storedSessions[0]).not.toHaveProperty("raw_api_data");
    expect(storedFailures.map((failure) => [failure.activityId, failure.kind, failure.capturedAt])).toEqual([
      ["activity-unsupported", "unsupported", 1_300],
      ["activity-2", "fetch", 1_700],
    ]);
    expect(storedFailures[0]).toMatchObject({ unsupportedReason: "unsupported-activity-type" });
    expect(snapshot).toMatchObject({ job: storedJob });
    expect(snapshot.items.map((item) => item.activityId)).toEqual(["activity-1", "activity-2", "activity-unsupported"]);
    expect(snapshot.sessions).toEqual(storedSessions);
    expect(snapshot.failures).toEqual(storedFailures);
  });

  it("clears only the requested archive job across all stores", async () => {
    const jobOne = createArchiveExportJob([
      { id: "activity-1", date: "2026-06-01", strokeCount: 12, type: "CoursePlayActivity" },
    ], 2_000, { idPrefix: "job-one" });
    const jobTwo = createArchiveExportJob([
      { id: "activity-2", date: "2026-06-02", strokeCount: 8, type: "MapMyBagActivity" },
    ], 2_100, { idPrefix: "job-two" });

    await putArchiveExportJob(jobOne);
    await putArchiveExportItem(jobOne.id, jobOne.items[0], 0);
    await putArchiveExportSession(jobOne.id, "activity-1", makeSession("report-1", "2026-06-01"), 2_200);
    await putArchiveExportFailure(jobOne.id, {
      activityId: "activity-1",
      date: "2026-06-01",
      type: "CoursePlayActivity",
      detail: "12 shots",
      kind: "parse",
      message: "Could not parse session",
    }, 2_300);

    await putArchiveExportJob(jobTwo);
    await putArchiveExportItem(jobTwo.id, jobTwo.items[0], 0);
    await putArchiveExportSession(jobTwo.id, "activity-2", makeSession("report-2", "2026-06-02"), 2_400);

    await clearArchiveExportJob(jobOne.id);

    expect(await getArchiveExportSnapshot(jobOne.id)).toEqual({ job: null, items: [], sessions: [], failures: [] });
    expect(await getArchiveExportJob(jobTwo.id)).toMatchObject({ id: jobTwo.id });
    expect((await getArchiveExportItems(jobTwo.id)).map((item) => item.activityId)).toEqual(["activity-2"]);
    expect((await getArchiveExportSessions(jobTwo.id)).map((session) => session.report_id)).toEqual(["report-2"]);
  });
});
