/**
 * Integration tests for popup action logic.
 *
 * Tests verify the Phase 5 modules integrate correctly when called
 * the way popup.ts calls them. DOM interaction and Chrome API calls
 * are not testable in vitest -- these tests cover the data transformation
 * pipeline that the popup handlers rely on.
 */

import { describe, it, expect } from "vitest";
import { writeTsv } from "../src/shared/tsv_writer";
import type { UnitChoice } from "../src/shared/unit_normalization";

// Minimal SessionData used across tests
const minimalSession = {
  date: "2025-01-15",
  report_id: "test",
  url_type: "report" as const,
  club_groups: [
    {
      club_name: "7 Iron",
      shots: [
        { shot_number: 0, metrics: {} },
      ],
    },
  ],
  metric_names: [],
  metadata_params: {},
};

describe("Copy TSV integration", () => {
  it("writeTsv output starts with header row containing Date, Club, Shot #", () => {
    const tsv = writeTsv(minimalSession);
    const firstLine = tsv.split("\n")[0];
    expect(firstLine).toContain("Date");
    expect(firstLine).toContain("Club");
    expect(firstLine).toContain("Shot #");
  });

  it("writeTsv output uses tabs as delimiters", () => {
    const session = {
      ...minimalSession,
      metric_names: ["ClubSpeed"],
      club_groups: [
        {
          club_name: "Driver",
          shots: [
            { shot_number: 0, metrics: { ClubSpeed: 44.7 } },
          ],
        },
      ],
    };
    const tsv = writeTsv(session);
    const dataRow = tsv.split("\n")[1];
    expect(dataRow).toContain("\t");
  });

  it("writeTsv respects unit choice", () => {
    const session = {
      ...minimalSession,
      metric_names: ["ClubSpeed", "Carry"],
    };
    const metricUnitChoice: UnitChoice = { speed: "m/s", distance: "meters" };
    const tsv = writeTsv(session, metricUnitChoice);
    const firstLine = tsv.split("\n")[0];
    // Header should contain unit labels for m/s speed metrics
    expect(firstLine).toContain("(m/s)");
  });
});
