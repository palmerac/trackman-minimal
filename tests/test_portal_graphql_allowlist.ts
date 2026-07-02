import { describe, expect, it } from "vitest";
import {
  FETCH_ACTIVITIES_PAGE_SIZE,
  FETCH_ACTIVITIES_QUERY_CANDIDATES,
  IMPORT_SESSION_QUERY_CANDIDATES,
} from "../src/shared/import_types";
import {
  getAllowedPortalGraphQLQueryCountForTests,
  validatePortalGraphQLRequest,
} from "../src/shared/portal_graphql_allowlist";

function addWhitespaceNoise(query: string): string {
  return `\n  ${query.replace(/\s+/g, "\n\t  ")}\n`;
}

describe("portal GraphQL allowlist", () => {
  it("allows every exported activity-list query with its expected variable contract", () => {
    expect(getAllowedPortalGraphQLQueryCountForTests()).toBeGreaterThanOrEqual(
      FETCH_ACTIVITIES_QUERY_CANDIDATES.length
    );

    for (const candidate of FETCH_ACTIVITIES_QUERY_CANDIDATES) {
      const variables = candidate.paginated
        ? { skip: 0, take: Math.min(10, FETCH_ACTIVITIES_PAGE_SIZE) }
        : undefined;

      expect(validatePortalGraphQLRequest(addWhitespaceNoise(candidate.query), variables)).toEqual({ ok: true });
    }
  });

  it("allows every exported session-import query with only an activity id variable", () => {
    for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
      expect(validatePortalGraphQLRequest(candidate.query, { id: "activity-123" })).toEqual({ ok: true });
    }
  });

  it("rejects queries that are not in the allowlist", () => {
    const result = validatePortalGraphQLRequest(
      "mutation DeleteActivity($id: ID!) { deleteActivity(id: $id) { id } }",
      { id: "activity-123" }
    );

    expect(result.ok).toBe(false);
  });

  it("rejects variable smuggling and out-of-range pagination", () => {
    const importQuery = IMPORT_SESSION_QUERY_CANDIDATES[0].query;
    const paginatedQuery = FETCH_ACTIVITIES_QUERY_CANDIDATES.find((candidate) => candidate.paginated);
    expect(paginatedQuery).toBeDefined();

    expect(validatePortalGraphQLRequest(importQuery, {
      id: "activity-123",
      includePrivateFields: true,
    }).ok).toBe(false);
    expect(validatePortalGraphQLRequest(importQuery, { id: "" }).ok).toBe(false);
    expect(validatePortalGraphQLRequest(paginatedQuery!.query, {
      skip: 0,
      take: FETCH_ACTIVITIES_PAGE_SIZE + 1,
    }).ok).toBe(false);
  });
});
