import { describe, expect, it } from "vitest";
import type { SessionSnapshot } from "../src/models/types";
import type { ArchiveExportFailure, ArchiveExportItem } from "../src/shared/archive_export";
import { createArchiveExportJob, failArchiveExportItem, skipUnsupportedArchiveExportItem, updateArchiveExportItem } from "../src/shared/archive_export";
import { buildArchiveExportOutputs } from "../src/shared/archive_builder";

function makeSession(reportId: string, date: string, activityType: string, metricValue: string): SessionSnapshot {
  return {
    date,
    report_id: reportId,
    url_type: "activity",
    metric_names: ["ClubSpeed", "Carry"],
    metadata_params: {
      activity_id: `activity-${reportId}`,
      activity_type: activityType,
      api_source_unit_system: "imperial",
    },
    club_groups: [
      {
        club_name: "Driver",
        shots: [
          { shot_number: 1, tag: "Fairway", metrics: { ClubSpeed: metricValue, Carry: "250" } },
          { shot_number: 2, metrics: { ClubSpeed: "103", Carry: "261" } },
        ],
        averages: { ClubSpeed: "102", Carry: "255.5" },
        consistency: { ClubSpeed: "1" },
      },
    ],
  };
}

const suppliedFailure: ArchiveExportFailure = {
  activityId: "activity-supplied-failure",
  date: "2026-06-05",
  type: "CoursePlayActivity",
  detail: "18 shots",
  kind: "storage",
  message: "Could not persist local archive data",
  reportId: "report-storage-fail",
  capturedAt: 9_000,
};

const suppliedUnsupported: ArchiveExportItem = {
  activityId: "activity-supplied-unsupported",
  date: "2026-06-06",
  type: null,
  detail: "",
  status: "unsupported",
  error: "Activity type is missing",
  failureKind: "unsupported",
  unsupportedReason: "missing-activity-type",
  updatedAt: 9_100,
};

describe("archive export output builder", () => {
  it("builds CSV, manifest, failure JSON, and unsupported report files from archive results", () => {
    let job = createArchiveExportJob([
      { id: "activity-report-1", date: "2026-06-01", strokeCount: 2, type: "CoursePlayActivity" },
      { id: "activity-report-2", date: "2026-06-02", strokeCount: 2, type: "MapMyBagActivity" },
      { id: "activity-fetch-failed", date: "2026-06-03", strokeCount: 12, type: "CoursePlayActivity" },
      { id: "activity-derived-unsupported", date: "2026-06-04", strokeCount: 4, type: "VirtualGolfActivity" },
    ], 7_000);
    job = updateArchiveExportItem(job, "activity-report-1", { status: "exported", reportId: "report-1", shotCount: 2 }, 7_100);
    job = updateArchiveExportItem(job, "activity-report-2", { status: "exported", reportId: "report-2", shotCount: 2 }, 7_200);
    job = failArchiveExportItem(job, "activity-fetch-failed", "Portal request failed", "fetch", 7_300);
    job = skipUnsupportedArchiveExportItem(job, "activity-derived-unsupported", "Unsupported activity type", "unsupported-activity-type", 7_400);

    const result = buildArchiveExportOutputs({
      job,
      sessions: [
        makeSession("report-1", "2026-06-01", "CoursePlayActivity", "101"),
        makeSession("report-2", "2026-06-02", "MapMyBagActivity", "99"),
      ],
      failures: [suppliedFailure],
      unsupported: [suppliedUnsupported],
      options: {
        baseFilename: "trackpull-all-sessions",
        generatedAt: "2026-07-02T12:00:00.000Z",
        includeAverages: false,
        metricOrder: ["Carry", "ClubSpeed"],
      },
    });

    expect(result.files.map((file) => [file.filename, file.mimeType])).toEqual([
      ["trackpull-all-sessions-sessions.csv", "text/csv;charset=utf-8"],
      ["trackpull-all-sessions-manifest.json", "application/json;charset=utf-8"],
      ["trackpull-all-sessions-failures.json", "application/json;charset=utf-8"],
      ["trackpull-all-sessions-unsupported.txt", "text/plain;charset=utf-8"],
    ]);
    expect(result.manifest).toMatchObject({
      schemaVersion: 1,
      generatedAt: "2026-07-02T12:00:00.000Z",
      job: {
        id: job.id,
        total: 4,
        exported: 2,
        failed: 1,
        unsupported: 1,
      },
      counts: {
        sessions: 2,
        failures: 3,
        unsupported: 2,
        files: 4,
      },
    });
    expect(result.manifest.sessions).toEqual([
      {
        reportId: "report-1",
        date: "2026-06-01",
        activityType: "CoursePlayActivity",
        clubGroupCount: 1,
        shotCount: 2,
        metricNames: ["ClubSpeed", "Carry"],
      },
      {
        reportId: "report-2",
        date: "2026-06-02",
        activityType: "MapMyBagActivity",
        clubGroupCount: 1,
        shotCount: 2,
        metricNames: ["ClubSpeed", "Carry"],
      },
    ]);
    expect(result.manifest.failures.map((failure) => [failure.activityId, failure.kind])).toEqual([
      ["activity-fetch-failed", "fetch"],
      ["activity-derived-unsupported", "unsupported"],
      ["activity-supplied-failure", "storage"],
    ]);
    expect(result.manifest.files.map((file) => file.role)).toEqual([
      "sessions-csv",
      "manifest",
      "failures",
      "unsupported",
    ]);

    const manifestFromFile = JSON.parse(result.files[1].contents);
    const failuresFromFile = JSON.parse(result.failures.contents);
    expect(manifestFromFile).toEqual(result.manifest);
    expect(failuresFromFile).toMatchObject({
      schemaVersion: 1,
      generatedAt: "2026-07-02T12:00:00.000Z",
      jobId: job.id,
    });
    expect(failuresFromFile.failures.map((failure: ArchiveExportFailure) => failure.activityId)).toEqual([
      "activity-fetch-failed",
      "activity-derived-unsupported",
      "activity-supplied-failure",
    ]);

    expect(result.csv.contents.split("\n")[0]).toContain("Session Date,Report ID,Activity Type,Club,Tag,Shot #,Type,Carry (yds),Club Speed (mph)");
    expect(result.csv.contents).toContain("report-1");
    expect(result.csv.contents).toContain("report-2");
    expect(result.csv.contents).not.toContain("Average");
    expect(result.unsupported?.contents).toContain("activity-derived-unsupported");
    expect(result.unsupported?.contents).toContain("activity-supplied-unsupported");
  });

  it("always produces an auditable failure file and omits unsupported text when nothing was skipped", () => {
    let job = createArchiveExportJob([
      { id: "activity-report-1", date: "2026-06-01", strokeCount: 2, type: "CoursePlayActivity" },
    ], 8_000);
    job = updateArchiveExportItem(job, "activity-report-1", { status: "exported", reportId: "report-1", shotCount: 2 }, 8_100);

    const result = buildArchiveExportOutputs({
      job,
      sessions: [makeSession("report-1", "2026-06-01", "CoursePlayActivity", "101")],
      options: { baseFilename: "clean-archive", generatedAt: "2026-07-02T12:00:00.000Z" },
    });

    expect(result.unsupported).toBeUndefined();
    expect(result.files.map((file) => file.filename)).toEqual([
      "clean-archive-sessions.csv",
      "clean-archive-manifest.json",
      "clean-archive-failures.json",
    ]);
    expect(result.manifest.counts).toEqual({ sessions: 1, failures: 0, unsupported: 0, files: 3 });
    expect(JSON.parse(result.failures.contents)).toEqual({
      schemaVersion: 1,
      generatedAt: "2026-07-02T12:00:00.000Z",
      jobId: job.id,
      failures: [],
    });
  });
});
