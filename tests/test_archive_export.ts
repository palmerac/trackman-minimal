import { describe, expect, it } from "vitest";
import type { ActivitySummary } from "../src/shared/import_types";
import {
  completeArchiveExportJob,
  createArchiveExportJob,
  failArchiveExportItem,
  getArchiveExportCompletedCount,
  getArchiveExportFailureForItem,
  getArchiveExportProgressLabel,
  getNextArchiveExportItem,
  pauseArchiveExportJob,
  recoverInterruptedArchiveExportJob,
  resetFailedArchiveExportItems,
  skipUnsupportedArchiveExportItem,
  startArchiveExportJob,
  updateArchiveExportItem,
} from "../src/shared/archive_export";

const activities: ActivitySummary[] = [
  {
    id: "activity-supported-1",
    date: "2026-06-01",
    strokeCount: 18,
    type: "CoursePlayActivity",
    courseName: "Pebble Beach",
  },
  {
    id: "activity-supported-2",
    date: "2026-06-02",
    strokeCount: null,
    type: "MapMyBagSessionActivity",
  },
  {
    id: "activity-unsupported",
    date: "2026-06-03",
    strokeCount: 9,
    type: "VirtualGolfActivity",
    courseName: "Virtual Links",
  },
  {
    id: "activity-missing-type",
    date: "2026-06-04",
    strokeCount: 5,
    type: null,
  },
  {
    id: "activity-supported-1",
    date: "2026-06-01",
    strokeCount: 18,
    type: "CoursePlayActivity",
    courseName: "Duplicate ignored",
  },
];

describe("archive export job state", () => {
  it("creates a deduplicated resumable job that records unsupported sessions without making them fetchable", () => {
    const job = createArchiveExportJob(activities, 1_000, { idPrefix: "test-archive" });

    expect(job.id).toBe("test-archive-rs");
    expect(job.state).toBe("idle");
    expect(job.total).toBe(4);
    expect(job.pending).toBe(2);
    expect(job.unsupported).toBe(2);
    expect(job.failed).toBe(0);
    expect(job.exported).toBe(0);
    expect(job.items.map((item) => item.activityId)).toEqual([
      "activity-supported-1",
      "activity-supported-2",
      "activity-unsupported",
      "activity-missing-type",
    ]);

    expect(job.items.find((item) => item.activityId === "activity-supported-1")).toMatchObject({
      status: "pending",
      detail: "Pebble Beach",
      type: "CoursePlayActivity",
    });
    expect(job.items.find((item) => item.activityId === "activity-supported-2")).toMatchObject({
      status: "pending",
      detail: "",
      type: "MapMyBagSessionActivity",
    });
    expect(job.items.find((item) => item.activityId === "activity-unsupported")).toMatchObject({
      status: "unsupported",
      failureKind: "unsupported",
      unsupportedReason: "unsupported-activity-type",
      updatedAt: 1_000,
    });
    expect(job.items.find((item) => item.activityId === "activity-missing-type")).toMatchObject({
      status: "unsupported",
      failureKind: "unsupported",
      unsupportedReason: "missing-activity-type",
      updatedAt: 1_000,
    });
    expect(getNextArchiveExportItem(job)?.activityId).toBe("activity-supported-1");
  });

  it("can exclude unsupported summaries entirely when only supported export work should be queued", () => {
    const job = createArchiveExportJob(activities, 2_000, { includeUnsupportedItems: false });

    expect(job.items.map((item) => item.activityId)).toEqual([
      "activity-supported-1",
      "activity-supported-2",
    ]);
    expect(job.total).toBe(2);
    expect(job.pending).toBe(2);
    expect(job.unsupported).toBe(0);
  });

  it("tracks exporting, exported, failed, unsupported, and complete transitions without losing retry state", () => {
    let job = startArchiveExportJob(createArchiveExportJob(activities.slice(0, 3), 3_000), 3_100);

    job = updateArchiveExportItem(job, "activity-supported-1", { status: "exporting" }, 3_200);
    expect(job.currentActivityId).toBe("activity-supported-1");
    expect(job.pending).toBe(1);

    job = updateArchiveExportItem(job, "activity-supported-1", {
      status: "exported",
      reportId: "report-1",
      shotCount: 18,
    }, 3_300);
    expect(job.currentActivityId).toBeUndefined();
    expect(job.exported).toBe(1);

    job = failArchiveExportItem(job, "activity-supported-2", "GraphQL fetch failed", "fetch", 3_400);
    expect(job.failed).toBe(1);
    expect(job.lastError).toBe("GraphQL fetch failed");
    expect(getArchiveExportCompletedCount(job)).toBe(3);
    expect(getArchiveExportProgressLabel(job)).toBe("3 / 3 | 1 exported | 1 failed | 1 unsupported");

    const failure = getArchiveExportFailureForItem(job.items.find((item) => item.activityId === "activity-supported-2")!);
    expect(failure).toEqual({
      activityId: "activity-supported-2",
      date: "2026-06-02",
      type: "MapMyBagSessionActivity",
      detail: "",
      kind: "fetch",
      message: "GraphQL fetch failed",
      reportId: undefined,
      unsupportedReason: undefined,
      capturedAt: 3_400,
    });

    job = resetFailedArchiveExportItems(job, 3_500);
    expect(job.state).toBe("idle");
    expect(job.failed).toBe(0);
    expect(job.pending).toBe(1);
    expect(job.unsupported).toBe(1);
    expect(job.lastError).toBeUndefined();
    expect(job.items.find((item) => item.activityId === "activity-supported-2")).toMatchObject({
      status: "pending",
      error: undefined,
      failureKind: undefined,
      unsupportedReason: undefined,
    });

    job = skipUnsupportedArchiveExportItem(job, "activity-supported-2", "Parser does not support this result", "unsupported-activity-type", 3_600);
    expect(job.pending).toBe(0);
    expect(job.unsupported).toBe(2);

    job = completeArchiveExportJob(job, 3_700);
    expect(job.state).toBe("complete");
    expect(job.updatedAt).toBe(3_700);
  });

  it("recovers interrupted running jobs by pausing and requeueing the in-flight item", () => {
    let job = startArchiveExportJob(createArchiveExportJob(activities.slice(0, 2), 4_000), 4_100);
    job = updateArchiveExportItem(job, "activity-supported-1", { status: "exporting" }, 4_200);

    const recovered = recoverInterruptedArchiveExportJob(job, 4_300);

    expect(recovered.state).toBe("paused");
    expect(recovered.currentActivityId).toBeUndefined();
    expect(recovered.pending).toBe(2);
    expect(recovered.items.find((item) => item.activityId === "activity-supported-1")).toMatchObject({
      status: "pending",
      updatedAt: 4_300,
    });
  });

  it("pauses active work without changing completed, failed, or unsupported items", () => {
    let job = startArchiveExportJob(createArchiveExportJob(activities.slice(0, 4), 5_000), 5_100);
    job = updateArchiveExportItem(job, "activity-supported-1", { status: "exporting" }, 5_200);
    job = updateArchiveExportItem(job, "activity-supported-2", { status: "exported", reportId: "report-2" }, 5_250);
    job = failArchiveExportItem(job, "activity-supported-1", "parse failed", "parse", 5_300);
    job = updateArchiveExportItem(job, "activity-supported-2", { status: "exporting" }, 5_350);

    const paused = pauseArchiveExportJob(job, 5_400);

    expect(paused.state).toBe("paused");
    expect(paused.pending).toBe(1);
    expect(paused.failed).toBe(1);
    expect(paused.unsupported).toBe(2);
    expect(paused.items.find((item) => item.activityId === "activity-supported-2")).toMatchObject({
      status: "pending",
      reportId: "report-2",
    });
  });
});
