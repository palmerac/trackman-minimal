import { describe, expect, it } from "vitest";
import type { SessionData } from "../src/models/types";
import {
  REPORT_PAGE_ORIGIN,
  RUNTIME_MESSAGE_TYPES,
  WINDOW_MESSAGE_SOURCES,
  WINDOW_MESSAGE_TYPES,
  isAllowedReportOrigin,
  isMinimalSessionData,
  isTrackmanShotDataWindowMessage,
} from "../src/shared/runtime_messages";

const validSession = {
  date: "2026-01-15",
  report_id: "report-1",
  url_type: "report",
  club_groups: [
    {
      club_name: "Driver",
      shots: [{ shot_number: 0, metrics: { ClubSpeed: "105" } }],
      averages: {},
      consistency: {},
    },
  ],
  metric_names: ["ClubSpeed"],
  metadata_params: { Units: "Imperial" },
} satisfies SessionData;

describe("runtime message contracts", () => {
  it("exports unique runtime message type constants for extension protocols", () => {
    const values = Object.values(RUNTIME_MESSAGE_TYPES);

    expect(new Set(values).size).toBe(values.length);
    expect(RUNTIME_MESSAGE_TYPES.SAVE_DATA).toBe("SAVE_DATA");
    expect(RUNTIME_MESSAGE_TYPES.EXPORT_CSV_REQUEST).toBe("EXPORT_CSV_REQUEST");
    expect(RUNTIME_MESSAGE_TYPES.SAVE_BULK_IMPORTED_SESSION).toBe("SAVE_BULK_IMPORTED_SESSION");
  });

  it("accepts a minimal well-formed session without depending on class identity", () => {
    const parsedFromJson = JSON.parse(JSON.stringify(validSession)) as unknown;

    expect(isMinimalSessionData(parsedFromJson)).toBe(true);
  });

  it("rejects malformed session-like payloads at runtime boundaries", () => {
    const invalidSessions: unknown[] = [
      null,
      [],
      { ...validSession, url_type: "portal" },
      { ...validSession, metric_names: ["ClubSpeed", 42] },
      { ...validSession, metadata_params: { Units: 7 } },
      { ...validSession, club_groups: [{ club_name: "Driver", shots: [] }] },
    ];

    for (const candidate of invalidSessions) {
      expect(isMinimalSessionData(candidate)).toBe(false);
    }
  });

  it("validates report window messages by source, type, and session payload", () => {
    expect(isTrackmanShotDataWindowMessage({
      source: WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR,
      type: WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA,
      data: validSession,
    })).toBe(true);

    expect(isTrackmanShotDataWindowMessage({
      source: WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR,
      type: "TRACKMAN_SHOT_DATA",
      data: { ...validSession, url_type: "portal" },
    })).toBe(false);
    expect(isTrackmanShotDataWindowMessage({
      source: "other-extension",
      type: WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA,
      data: validSession,
    })).toBe(false);
  });

  it("allows only the report origin, independent of URL path or query", () => {
    expect(isAllowedReportOrigin(`${REPORT_PAGE_ORIGIN}/reports/123?x=1`)).toBe(true);
    expect(isAllowedReportOrigin(REPORT_PAGE_ORIGIN)).toBe(true);
    expect(isAllowedReportOrigin("https://portal.trackmangolf.com/reports/123")).toBe(false);
    expect(isAllowedReportOrigin("not a url")).toBe(false);
    expect(isAllowedReportOrigin(undefined)).toBe(false);
  });
});
