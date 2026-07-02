import {
  FETCH_ACTIVITIES_PAGE_SIZE,
  FETCH_ACTIVITIES_QUERY_CANDIDATES,
  IMPORT_SESSION_QUERY_CANDIDATES,
} from "./import_types";

export interface PortalGraphQLValidationResult {
  ok: boolean;
  error?: string;
}

type AllowedPortalQuery =
  | { kind: "activity-list"; label: string; paginated: boolean }
  | { kind: "session-import"; label: string };

function normalizeGraphQLQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
}

const ALLOWED_PORTAL_QUERIES: Record<string, AllowedPortalQuery> = {};

for (const candidate of FETCH_ACTIVITIES_QUERY_CANDIDATES) {
  ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(candidate.query)] = {
    kind: "activity-list",
    label: candidate.label,
    paginated: Boolean(candidate.paginated),
  };
}

for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
  ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(candidate.query)] = {
    kind: "session-import",
    label: candidate.label,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every((key) => keys.includes(key));
}

function validateActivityId(value: unknown): boolean {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= 1024 &&
    !/[\u0000-\u001f\u007f]/.test(value);
}

function validateVariablesForQuery(
  query: AllowedPortalQuery,
  variables: unknown
): PortalGraphQLValidationResult {
  if (query.kind === "session-import") {
    if (!isRecord(variables) || !hasOnlyKeys(variables, ["id"])) {
      return { ok: false, error: "Invalid GraphQL variables" };
    }
    return validateActivityId(variables.id)
      ? { ok: true }
      : { ok: false, error: "Invalid GraphQL variables" };
  }

  if (!query.paginated) {
    if (variables === undefined || (isRecord(variables) && Object.keys(variables).length === 0)) {
      return { ok: true };
    }
    return { ok: false, error: "Invalid GraphQL variables" };
  }

  if (!isRecord(variables) || !hasOnlyKeys(variables, ["skip", "take"])) {
    return { ok: false, error: "Invalid GraphQL variables" };
  }

  const { skip, take } = variables;
  const validSkip = Number.isInteger(skip) && (skip as number) >= 0;
  const validTake = Number.isInteger(take) && (take as number) >= 1 && (take as number) <= FETCH_ACTIVITIES_PAGE_SIZE;
  return validSkip && validTake
    ? { ok: true }
    : { ok: false, error: "Invalid GraphQL variables" };
}

export function validatePortalGraphQLRequest(
  query: unknown,
  variables: unknown
): PortalGraphQLValidationResult {
  if (typeof query !== "string") {
    return { ok: false, error: "Invalid GraphQL query" };
  }

  const allowedQuery = ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(query)];
  if (!allowedQuery) {
    return { ok: false, error: "GraphQL query is not allowed" };
  }

  return validateVariablesForQuery(allowedQuery, variables);
}

export function getAllowedPortalGraphQLQueryCountForTests(): number {
  return Object.keys(ALLOWED_PORTAL_QUERIES).length;
}
