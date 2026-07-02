import { describe, expect, it } from "vitest";
import { classifyReportUrlType } from "../src/shared/report_url";

const REPORT_ORIGIN = "https://web-dynamic-reports.trackmangolf.com";

describe("report URL classification", () => {
  it("classifies report URLs with report identifiers as report sessions", () => {
    expect(classifyReportUrlType(`${REPORT_ORIGIN}/?r=report-123`)).toBe("report");
    expect(classifyReportUrlType(`${REPORT_ORIGIN}/?ReportId=report-123`)).toBe("report");
  });

  it("classifies URLs with activity identifiers as activity sessions", () => {
    expect(classifyReportUrlType(`${REPORT_ORIGIN}/?a=activity-123`)).toBe("activity");
  });
});
