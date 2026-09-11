"use strict";
(() => {
  // src/content/portal_auth.ts
  function looksLikeJwt(value) {
    return /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value);
  }
  function keyPathLooksLikeAccessToken(keyPath) {
    const lower = keyPath.toLowerCase();
    return !lower.includes("refresh") && (lower.includes("accesstoken") || lower.includes("access_token") || lower.includes(".access.token") || lower.includes("access") && lower.includes("token"));
  }
  function looksLikeOpaqueAccessToken(value) {
    return value.length >= 24 && value.length <= 4096 && /^[A-Za-z0-9._~+/=-]+$/.test(value);
  }
  function cleanToken(value, keyPath) {
    const trimmed = value.trim();
    const bearerMatch = trimmed.match(/^Bearer\s+(.+)$/i);
    const token = bearerMatch ? bearerMatch[1].trim() : trimmed;
    if (looksLikeJwt(token)) return token;
    if (keyPathLooksLikeAccessToken(keyPath) && looksLikeOpaqueAccessToken(token)) {
      return token;
    }
    return null;
  }
  function scoreTokenKey(keyPath) {
    const lower = keyPath.toLowerCase();
    let score = 0;
    if (lower.includes("access")) score += 40;
    if (lower.includes("token")) score += 20;
    if (lower.includes("auth")) score += 10;
    if (lower.includes("idtoken") || lower.includes("id_token")) score += 5;
    if (lower.includes("refresh")) score -= 100;
    return score;
  }
  function collectTokenCandidates(value, keyPath, candidates) {
    if (typeof value === "string") {
      const direct = cleanToken(value, keyPath);
      if (direct) {
        candidates.push({ token: direct, score: scoreTokenKey(keyPath) });
        return;
      }
      const trimmed = value.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}") || trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          collectTokenCandidates(JSON.parse(trimmed), keyPath, candidates);
        } catch {
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => collectTokenCandidates(item, `${keyPath}.${index}`, candidates));
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        collectTokenCandidates(nested, `${keyPath}.${key}`, candidates);
      }
    }
  }
  function findTrackmanAuthTokenFromStorage(...stores) {
    const candidates = [];
    for (const store of stores) {
      for (let i = 0; i < store.length; i += 1) {
        const key = store.key(i);
        if (!key) continue;
        const value = store.getItem(key);
        if (value === null) continue;
        collectTokenCandidates(value, key, candidates);
      }
    }
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0]?.token ?? null;
  }

  // src/content/portal_bridge_protocol.ts
  var PORTAL_GRAPHQL_ENDPOINT = "https://api.trackmangolf.com/graphql";
  var PORTAL_GRAPHQL_REQUEST_SOURCE = "trackpull-portal-isolated";
  var PORTAL_GRAPHQL_RESPONSE_SOURCE = "trackpull-portal-main";
  var PORTAL_GRAPHQL_REQUEST_TYPE = "TRACKPULL_PORTAL_GRAPHQL_REQUEST";
  var PORTAL_GRAPHQL_RESPONSE_TYPE = "TRACKPULL_PORTAL_GRAPHQL_RESPONSE";

  // src/shared/runtime_messages.ts
  var RUNTIME_MESSAGE_TYPES = {
    SAVE_DATA: "SAVE_DATA",
    EXPORT_CSV_REQUEST: "EXPORT_CSV_REQUEST",
    SAVE_IMPORTED_SESSION: "SAVE_IMPORTED_SESSION",
    SAVE_BULK_IMPORTED_SESSION: "SAVE_BULK_IMPORTED_SESSION",
    SAVE_ARCHIVE_EXPORTED_SESSION: "SAVE_ARCHIVE_EXPORTED_SESSION",
    PORTAL_GRAPHQL_FETCH: "PORTAL_GRAPHQL_FETCH",
    HISTORY_ERROR: "HISTORY_ERROR",
    DATA_UPDATED: "DATA_UPDATED"
  };

  // src/shared/import_types.ts
  var FETCH_ACTIVITIES_PAGE_SIZE = 100;
  var ACTIVITY_SUMMARY_FIELDS = `
  id
  time
  kind
  __typename
  ... on CoursePlayActivity {
    course {
      displayName
    }
  }
  ... on MapMyBagSessionActivity {
    strokeCount
  }
`;
  var ACTIVITY_COURSE_SUMMARY_FIELDS = `
  id
  time
  __typename
  ... on CoursePlayActivity {
    course {
      displayName
    }
  }
`;
  var ACTIVITY_MINIMAL_TIME_FIELDS = `
  id
  time
  __typename
`;
  var ACTIVITY_MINIMAL_DATE_FIELDS = `
  id
  date
  __typename
`;
  var FETCH_ACTIVITIES_QUERY = `
  query GetPlayerActivities($skip: Int!, $take: Int!) {
    me {
      activities(kinds: [COURSE_PLAY, MAP_MY_BAG, VIRTUAL_RANGE, SHOT_ANALYSIS, COMBINE_TEST], skip: $skip, take: $take) {
        totalCount
        pageInfo {
          hasNextPage
        }
        items {
          ${ACTIVITY_SUMMARY_FIELDS}
        }
      }
    }
  }
`;
  var FETCH_ACTIVITIES_QUERY_CANDIDATES = [
    { label: "me.activities.items:kinds-page", query: FETCH_ACTIVITIES_QUERY, paginated: true },
    {
      label: "me.activities.items:all-page",
      paginated: true,
      query: `
      query GetPlayerActivities($skip: Int!, $take: Int!) {
        me {
          activities(skip: $skip, take: $take) {
            totalCount
            pageInfo {
              hasNextPage
            }
            items {
              ${ACTIVITY_SUMMARY_FIELDS}
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.items:course-time",
      query: `
      query GetPlayerActivities {
        me {
          activities {
            items {
              ${ACTIVITY_COURSE_SUMMARY_FIELDS}
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.items:date",
      query: `
      query GetPlayerActivities {
        me {
          activities {
            items {
              ${ACTIVITY_MINIMAL_DATE_FIELDS}
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.nodes:time",
      query: `
      query GetPlayerActivities {
        me {
          activities {
            nodes {
              ${ACTIVITY_MINIMAL_TIME_FIELDS}
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.nodes:date",
      query: `
      query GetPlayerActivities {
        me {
          activities {
            nodes {
              ${ACTIVITY_MINIMAL_DATE_FIELDS}
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.connection:time",
      query: `
      query GetPlayerActivities {
        me {
          activities(first: 20) {
            edges {
              node {
                id
                time
                __typename
              }
            }
          }
        }
      }
    `
    },
    {
      label: "me.activities.connection:date",
      query: `
      query GetPlayerActivities {
        me {
          activities(first: 20) {
            edges {
              node {
                id
                date
                __typename
              }
            }
          }
        }
      }
    `
    }
  ];
  var STROKE_MEASUREMENT_FIELDS = `
  clubSpeed ballSpeed smashFactor attackAngle clubPath faceAngle
  faceToPath swingDirection swingPlane dynamicLoft spinRate spinAxis spinLoft
  launchAngle launchDirection carry total carrySide totalSide
  maxHeight landingAngle hangTime
`;
  var SCORECARD_SHOT_MEASUREMENT_FIELDS = `
  ballSpeed carrySideActual carryActual launchDirection maxHeight carry total
  carrySide launchAngle spinRate spinAxis backswingTime forwardswingTime tempo
  strokeLength dynamicLie impactOffset impactHeight skidDistance rollPercentage
  rollSpeed speedDrop rollDeceleration effectiveStimp flatStimp break bounces
  entrySpeedDistance elevation slopePercentageSide slopePercentageRise
  totalBreak attackAngle clubPath clubSpeed dynamicLoft faceAngle faceToPath
  smashFactor gyroSpinAngle spinLoft swingDirection swingPlane swingRadius
`;
  var STROKE_FIELDS = `
  club
  time
  targetDistance
  measurement {
    ${STROKE_MEASUREMENT_FIELDS}
  }
`;
  var IMPORT_SESSION_QUERY = `
  query FetchActivityById($id: ID!) {
    node(id: $id) {
      ... on SessionActivity {
        id time strokeCount strokes { ${STROKE_FIELDS} }
      }
      ... on VirtualRangeSessionActivity {
        id time strokes { ${STROKE_FIELDS} }
      }
      ... on ShotAnalysisSessionActivity {
        id time strokes { ${STROKE_FIELDS} }
      }
      ... on CombineTestActivity {
        id time strokes { ${STROKE_FIELDS} }
      }
      ... on RangeFindMyDistanceActivity {
        id time strokes {
          club
          isDeleted
          isSimulated
          measurement(measurementType: PRO_BALL_MEASUREMENT) {
            ballSpeed ballSpin spinAxis
            carry carrySide total totalSide
            landingAngle launchAngle launchDirection maxHeight
          }
        }
      }
    }
  }
`;
  function flatStrokeActivityQuery(typeName) {
    return {
      label: `${typeName}:strokes`,
      query: `
      query FetchActivityById($id: ID!) {
        node(id: $id) {
          __typename
          ... on ${typeName} {
            id time
            strokes { ${STROKE_FIELDS} }
          }
        }
      }
    `
    };
  }
  function groupedStrokeActivityQuery(typeName) {
    return {
      label: `${typeName}:strokeGroups`,
      query: `
      query FetchActivityById($id: ID!) {
        node(id: $id) {
          __typename
          ... on ${typeName} {
            id time
            strokeGroups {
              club
              name
              strokes { ${STROKE_FIELDS} }
            }
          }
        }
      }
    `
    };
  }
  function proBallActivityQuery(typeName) {
    return {
      label: `${typeName}:PRO_BALL_MEASUREMENT`,
      query: `
      query FetchActivityById($id: ID!) {
        node(id: $id) {
          __typename
          ... on ${typeName} {
            id time
            strokes {
              club
              time
              targetDistance
              measurement(measurementType: PRO_BALL_MEASUREMENT) {
                ballSpeed ballSpin spinAxis
                carry carrySide total totalSide
                landingAngle launchAngle launchDirection maxHeight
              }
            }
          }
        }
      }
    `
    };
  }
  function groupedProBallActivityQuery(typeName) {
    return {
      label: `${typeName}:strokeGroups:PRO_BALL_MEASUREMENT`,
      query: `
      query FetchActivityById($id: ID!) {
        node(id: $id) {
          __typename
          ... on ${typeName} {
            id time
            strokeGroups {
              club
              name
              strokes {
                club
                time
                targetDistance
                measurement(measurementType: PRO_BALL_MEASUREMENT) {
                  ballSpeed ballSpin spinAxis
                  carry carrySide total totalSide
                  landingAngle launchAngle launchDirection maxHeight
                }
              }
            }
          }
        }
      }
    `
    };
  }
  function scorecardShotActivityQuery(typeName, measurementKind) {
    return {
      label: `${typeName}:scorecard.shots:${measurementKind}`,
      query: `
      query FetchActivityById($id: ID!) {
        node(id: $id) {
          __typename
          ... on ${typeName} {
            id time kind
            scorecard {
              holes {
                holeNumber
                shots {
                  id
                  shotNumber
                  club
                  launchTime
                  total
                  measurement(shotMeasurementKind: ${measurementKind}) {
                    ${SCORECARD_SHOT_MEASUREMENT_FIELDS}
                  }
                }
              }
            }
          }
        }
      }
    `
    };
  }
  var IMPORT_SESSION_FALLBACK_QUERIES = [
    flatStrokeActivityQuery("SessionActivity"),
    groupedStrokeActivityQuery("SessionActivity"),
    flatStrokeActivityQuery("ShotAnalysisSessionActivity"),
    groupedStrokeActivityQuery("ShotAnalysisSessionActivity"),
    flatStrokeActivityQuery("VirtualRangeSessionActivity"),
    groupedStrokeActivityQuery("VirtualRangeSessionActivity"),
    flatStrokeActivityQuery("CombineTestActivity"),
    groupedStrokeActivityQuery("CombineTestActivity"),
    flatStrokeActivityQuery("RangeFindMyDistanceActivity"),
    groupedStrokeActivityQuery("RangeFindMyDistanceActivity"),
    proBallActivityQuery("RangeFindMyDistanceActivity"),
    groupedProBallActivityQuery("RangeFindMyDistanceActivity"),
    scorecardShotActivityQuery("CoursePlayActivity", "NORMALIZED_MEASUREMENT"),
    scorecardShotActivityQuery("CoursePlayActivity", "MEASUREMENT"),
    scorecardShotActivityQuery("CoursePlayActivity", "PRO_BALL_MEASUREMENT"),
    flatStrokeActivityQuery("CoursePlayActivity"),
    groupedStrokeActivityQuery("CoursePlayActivity"),
    scorecardShotActivityQuery("CourseSessionActivity", "NORMALIZED_MEASUREMENT"),
    scorecardShotActivityQuery("CourseSessionActivity", "MEASUREMENT"),
    scorecardShotActivityQuery("CourseSessionActivity", "PRO_BALL_MEASUREMENT"),
    flatStrokeActivityQuery("CourseSessionActivity"),
    groupedStrokeActivityQuery("CourseSessionActivity"),
    flatStrokeActivityQuery("VirtualGolfActivity"),
    groupedStrokeActivityQuery("VirtualGolfActivity"),
    flatStrokeActivityQuery("VirtualGolfSessionActivity"),
    groupedStrokeActivityQuery("VirtualGolfSessionActivity"),
    flatStrokeActivityQuery("MapMyBagActivity"),
    groupedStrokeActivityQuery("MapMyBagActivity"),
    flatStrokeActivityQuery("MapMyBagSessionActivity"),
    groupedStrokeActivityQuery("MapMyBagSessionActivity"),
    flatStrokeActivityQuery("BagMappingActivity"),
    groupedStrokeActivityQuery("BagMappingActivity"),
    proBallActivityQuery("MapMyBagActivity"),
    groupedProBallActivityQuery("MapMyBagActivity"),
    proBallActivityQuery("MapMyBagSessionActivity"),
    groupedProBallActivityQuery("MapMyBagSessionActivity")
  ];
  var IMPORT_SESSION_QUERY_CANDIDATES = [
    { label: "default", query: IMPORT_SESSION_QUERY },
    ...IMPORT_SESSION_FALLBACK_QUERIES
  ];

  // src/shared/portal_graphql_allowlist.ts
  function normalizeGraphQLQuery(query) {
    return query.replace(/\s+/g, " ").trim();
  }
  var ALLOWED_PORTAL_QUERIES = {};
  for (const candidate of FETCH_ACTIVITIES_QUERY_CANDIDATES) {
    ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(candidate.query)] = {
      kind: "activity-list",
      label: candidate.label,
      paginated: Boolean(candidate.paginated)
    };
  }
  for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
    ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(candidate.query)] = {
      kind: "session-import",
      label: candidate.label
    };
  }
  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function hasOnlyKeys(value, keys) {
    return Object.keys(value).every((key) => keys.includes(key));
  }
  function validateActivityId(value) {
    return typeof value === "string" && value.length > 0 && value.length <= 1024 && !/[\u0000-\u001f\u007f]/.test(value);
  }
  function validateVariablesForQuery(query, variables) {
    if (query.kind === "session-import") {
      if (!isRecord(variables) || !hasOnlyKeys(variables, ["id"])) {
        return { ok: false, error: "Invalid GraphQL variables" };
      }
      return validateActivityId(variables.id) ? { ok: true } : { ok: false, error: "Invalid GraphQL variables" };
    }
    if (!query.paginated) {
      if (variables === void 0 || isRecord(variables) && Object.keys(variables).length === 0) {
        return { ok: true };
      }
      return { ok: false, error: "Invalid GraphQL variables" };
    }
    if (!isRecord(variables) || !hasOnlyKeys(variables, ["skip", "take"])) {
      return { ok: false, error: "Invalid GraphQL variables" };
    }
    const { skip, take } = variables;
    const validSkip = Number.isInteger(skip) && skip >= 0;
    const validTake = Number.isInteger(take) && take >= 1 && take <= FETCH_ACTIVITIES_PAGE_SIZE;
    return validSkip && validTake ? { ok: true } : { ok: false, error: "Invalid GraphQL variables" };
  }
  function validatePortalGraphQLRequest(query, variables) {
    if (typeof query !== "string") {
      return { ok: false, error: "Invalid GraphQL query" };
    }
    const allowedQuery = ALLOWED_PORTAL_QUERIES[normalizeGraphQLQuery(query)];
    if (!allowedQuery) {
      return { ok: false, error: "GraphQL query is not allowed" };
    }
    return validateVariablesForQuery(allowedQuery, variables);
  }

  // src/content/portal_fetch.ts
  var MAIN_WORLD_TIMEOUT_MS = 15e3;
  var nextRequestId = 0;
  function buildGraphQLHeaders() {
    const headers = { "Content-Type": "application/json" };
    const token = findTrackmanAuthTokenFromStorage(window.localStorage, window.sessionStorage);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }
  async function fetchGraphQLFromIsolatedWorld(query, variables) {
    const response = await fetch(PORTAL_GRAPHQL_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: buildGraphQLHeaders(),
      body: JSON.stringify({ query, variables })
    });
    return { success: true, data: await response.json() };
  }
  function fetchGraphQLFromMainWorld(query, variables) {
    const requestId = `trackpull-portal-${Date.now()}-${nextRequestId += 1}`;
    const request = {
      source: PORTAL_GRAPHQL_REQUEST_SOURCE,
      type: PORTAL_GRAPHQL_REQUEST_TYPE,
      requestId,
      query,
      variables
    };
    return new Promise((resolve) => {
      let settled = false;
      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        clearTimeout(timeoutId);
      };
      const settle = (response) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(response);
      };
      const onMessage = (event) => {
        if (event.source !== window) return;
        const data = event.data;
        if (!data || data.source !== PORTAL_GRAPHQL_RESPONSE_SOURCE) return;
        if (data.type !== PORTAL_GRAPHQL_RESPONSE_TYPE || data.requestId !== requestId) return;
        settle({
          success: Boolean(data.success),
          data: data.data,
          error: typeof data.error === "string" ? data.error : void 0
        });
      };
      const timeoutId = window.setTimeout(() => {
        settle({ success: false, error: "Portal page bridge timed out" });
      }, MAIN_WORLD_TIMEOUT_MS);
      window.addEventListener("message", onMessage);
      window.postMessage(request, window.location.origin);
    });
  }
  async function fetchGraphQL(query, variables) {
    const validation = validatePortalGraphQLRequest(query, variables);
    if (!validation.ok) {
      return { success: false, error: validation.error };
    }
    const mainWorldResponse = await fetchGraphQLFromMainWorld(query, variables);
    if (mainWorldResponse.success || mainWorldResponse.error !== "Portal page bridge timed out") {
      return mainWorldResponse;
    }
    return fetchGraphQLFromIsolatedWorld(query, variables);
  }
  function registerPortalFetchListener() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH) {
        const { query, variables } = message;
        const validation = validatePortalGraphQLRequest(query, variables);
        if (!validation.ok || typeof query !== "string") {
          sendResponse({ success: false, error: validation.error ?? "Invalid GraphQL query" });
          return false;
        }
        fetchGraphQL(query, variables).then((response) => sendResponse(response)).catch((err) => sendResponse({ success: false, error: err.message }));
        return true;
      }
    });
  }
  if (typeof chrome !== "undefined" && chrome.runtime?.onMessage) {
    registerPortalFetchListener();
  }
})();
