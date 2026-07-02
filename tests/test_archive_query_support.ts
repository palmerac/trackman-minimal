import { describe, expect, it } from "vitest";
import {
  FETCH_ACTIVITIES_PAGE_SIZE,
  FETCH_ACTIVITIES_QUERY_CANDIDATES,
  IMPORT_SESSION_QUERY_CANDIDATES,
  isSupportedPortalActivityType,
  normalizeActivitySummaries,
} from "../src/shared/import_types";
import { validatePortalGraphQLRequest } from "../src/shared/portal_graphql_allowlist";

describe("archive portal query and unsupported-activity contracts", () => {
  it("recognizes exactly the activity families the archive exporter is allowed to fetch", () => {
    expect([
      "CoursePlayActivity",
      "CourseSessionActivity",
      "COURSE_PLAY",
      "MapMyBagActivity",
      "MapMyBagSessionActivity",
      "BagMappingActivity",
      "MAP_MY_BAG",
    ].every(isSupportedPortalActivityType)).toBe(true);

    expect([
      null,
      "VirtualGolfActivity",
      "VirtualGolfSessionActivity",
      "RangeFindMyDistanceActivity",
      "PracticeActivity",
      "",
    ].some(isSupportedPortalActivityType)).toBe(false);
  });

  it("filters unsupported portal activity summaries before archive jobs can select work", () => {
    const activities = normalizeActivitySummaries({
      me: {
        activities: {
          items: [
            {
              id: "supported-by-type",
              type: "CoursePlayActivity",
              kind: "VirtualGolfActivity",
              date: "2026-06-01",
              strokeCount: 12,
            },
            {
              id: "supported-by-kind",
              type: "LegacyPortalName",
              kind: "MapMyBagActivity",
              time: "2026-06-02",
              strokeCount: 8,
              course: { displayName: "Range Bay" },
            },
            {
              id: "unsupported-virtual",
              type: "VirtualGolfActivity",
              kind: "VirtualGolfActivity",
              date: "2026-06-03",
              strokeCount: 9,
            },
            {
              id: "missing-type",
              date: "2026-06-04",
              strokeCount: 7,
            },
          ],
        },
      },
    });

    expect(activities).toEqual([
      {
        id: "supported-by-type",
        type: "CoursePlayActivity",
        date: "2026-06-01",
        strokeCount: 12,
        courseName: null,
      },
      {
        id: "supported-by-kind",
        type: "MapMyBagActivity",
        date: "2026-06-02",
        strokeCount: 8,
        courseName: "Range Bay",
      },
    ]);
  });

  it("keeps archive GraphQL execution on the allowlisted list and import variable contracts", () => {
    for (const candidate of FETCH_ACTIVITIES_QUERY_CANDIDATES) {
      const variables = candidate.paginated ? { skip: 0, take: FETCH_ACTIVITIES_PAGE_SIZE } : undefined;
      expect(validatePortalGraphQLRequest(candidate.query, variables)).toEqual({ ok: true });
      expect(validatePortalGraphQLRequest(candidate.query, { skip: 0, take: FETCH_ACTIVITIES_PAGE_SIZE, includeHidden: true }).ok).toBe(false);
    }

    for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
      expect(validatePortalGraphQLRequest(candidate.query, { id: "activity-123" })).toEqual({ ok: true });
      expect(validatePortalGraphQLRequest(candidate.query, { id: "activity-123", activityType: "VirtualGolfActivity" }).ok).toBe(false);
      expect(validatePortalGraphQLRequest(candidate.query, { id: "" }).ok).toBe(false);
    }
  });
});
