import { describe, it, expect } from "vitest";
import type { SessionData } from "../src/models/types";
import { writeBulkCsv, writeCsv } from "../src/shared/csv_writer";

function makeSession(
  reportId: string,
  date: string,
  clubName: string,
  metrics: Record<string, string>,
  activityType = "CoursePlayActivity"
): SessionData {
  return {
    date,
    report_id: reportId,
    url_type: "activity",
    metric_names: Object.keys(metrics),
    metadata_params: {
      activity_id: `activity-${reportId}`,
      activity_type: activityType,
    },
    club_groups: [
      {
        club_name: clubName,
        shots: [
          { shot_number: 0, metrics },
          { shot_number: 1, metrics },
        ],
        averages: {},
        consistency: {},
      },
    ],
  };
}

describe("writeBulkCsv", () => {
  it("writes one combined header with report and activity context", () => {
    const csv = writeBulkCsv([
      makeSession("report-1", "2026-01-01", "Driver", { ClubSpeed: "45" }),
      makeSession("report-2", "2026-01-02", "7 Iron", { Carry: "150" }, "MapMyBagSessionActivity"),
    ], false);

    const header = csv.split("\n")[0];
    expect(header).toContain("Session Date,Report ID,Activity Type,Club,Shot #,Type");
    expect(header).toContain("Club Speed (mph)");
    expect(header).toContain("Carry (yds)");
    expect(csv).toContain("report-1");
    expect(csv).toContain("CoursePlayActivity");
    expect(csv).toContain("MapMyBagSessionActivity");
  });

  it("adds average rows per session when requested", () => {
    const csv = writeBulkCsv([
      makeSession("report-1", "2026-01-01", "Driver", { ClubSpeed: "45" }),
      makeSession("report-2", "2026-01-02", "7 Iron", { ClubSpeed: "35" }),
    ], true);

    const averageRows = csv.split("\n").filter((line) => line.includes(",Average,"));
    expect(averageRows).toHaveLength(2);
  });

  it("omits average rows when disabled", () => {
    const csv = writeBulkCsv([
      makeSession("report-1", "2026-01-01", "Driver", { ClubSpeed: "45" }),
    ], false);

    expect(csv).not.toContain(",Average,");
  });

  it("escapes comma-containing values and includes hitting surface", () => {
    const csv = writeBulkCsv([
      makeSession("report-1", "2026-01-01", "Driver, Fitted", { Carry: "150" }),
    ], false, undefined, undefined, "Grass");

    expect(csv.split("\n")[0]).toBe("Hitting Surface: Grass");
    expect(csv).toContain('"Driver, Fitted"');
  });
});

describe("CSV spreadsheet formula neutralization", () => {
  it("neutralizes formula-like text cells and dynamic metric headers", () => {
    const session: SessionData = {
      date: "=2026-01-01",
      report_id: "report-1",
      url_type: "report",
      metric_names: ["-InjectedMetric", "ClubSpeed", "ImpactOffset"],
      metadata_params: { nd_001: "789012" },
      club_groups: [
        {
          club_name: "+Driver",
          shots: [
            {
              shot_number: 0,
              tag: "@Stock",
              metrics: {
                "-InjectedMetric": "-cmd",
                ClubSpeed: "44.704",
                ImpactOffset: "-0.0012",
              },
            },
          ],
          averages: {},
          consistency: {},
        },
      ],
    };

    const csv = writeCsv(session, false);
    const [header, row] = csv.split("\n");

    expect(header).toContain("'-InjectedMetric");
    expect(row).toContain("'=2026-01-01");
    expect(row).toContain("'+Driver");
    expect(row).toContain("'@Stock");
    expect(row).toContain("'-cmd");
    expect(row).toContain(",100,");
    expect(row).toContain(",-1,");
  });

  it("neutralizes bulk CSV context cells before CSV escaping", () => {
    const csv = writeBulkCsv([
      {
        date: "\r2026-01-01",
        report_id: "\treport-1",
        url_type: "activity",
        metric_names: ["Carry"],
        metadata_params: {
          activity_type: "@CoursePlayActivity",
          nd_001: "789012",
        },
        club_groups: [
          {
            club_name: "=Driver",
            shots: [{ shot_number: 0, tag: "-Attack", metrics: { Carry: "182.88" } }],
            averages: {},
            consistency: {},
          },
        ],
      },
    ], false);

    expect(csv).toContain("\"'\r2026-01-01\"");
    expect(csv).toContain("'\treport-1");
    expect(csv).toContain("'@CoursePlayActivity");
    expect(csv).toContain("'=Driver");
    expect(csv).toContain("'-Attack");
    expect(csv).toContain(",200");
  });
});
