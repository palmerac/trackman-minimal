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

  // src/content/portal_page_fetch.ts
  var WRAPPED_FETCH_MARKER = "__trackpullPortalFetchWrapped";
  var FORBIDDEN_FORWARD_HEADERS = /* @__PURE__ */ new Set([
    "connection",
    "content-length",
    "cookie",
    "host",
    "origin",
    "proxy-authorization",
    "referer",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "user-agent"
  ]);
  var capturedGraphQLHeaders = {};
  var capturedGraphQLRequestCount = 0;
  var pageFetch = null;
  function isTrackmanGraphQLEndpoint(urlValue) {
    try {
      const base = typeof window !== "undefined" ? window.location.href : "https://portal.trackmangolf.com/";
      const url = new URL(urlValue, base);
      return url.origin === "https://api.trackmangolf.com" && url.pathname === "/graphql";
    } catch {
      return false;
    }
  }
  function getRequestUrl(input) {
    if (typeof input === "string") return input;
    if (typeof URL !== "undefined" && input instanceof URL) return input.href;
    if (typeof Request !== "undefined" && input instanceof Request) return input.url;
    return null;
  }
  function canonicalHeaderName(name) {
    const lower = name.toLowerCase();
    if (lower === "authorization") return "Authorization";
    if (lower === "accept") return "Accept";
    if (lower === "content-type") return "Content-Type";
    return name;
  }
  function isForwardableHeader(name) {
    const lower = name.toLowerCase();
    if (!lower || FORBIDDEN_FORWARD_HEADERS.has(lower)) return false;
    if (lower.startsWith("sec-") || lower.startsWith("proxy-")) return false;
    return lower === "authorization" || lower === "accept" || lower === "content-type" || lower === "baggage" || lower === "sentry-trace" || lower === "traceparent" || lower === "tracestate" || lower.startsWith("x-") || lower.startsWith("tm-") || lower.startsWith("apollographql-") || lower.includes("trackman");
  }
  function readHeaderMap(headers) {
    const result = {};
    if (!headers) return result;
    if (typeof Headers !== "undefined" && headers instanceof Headers) {
      headers.forEach((value, name) => {
        result[name] = value;
      });
      return result;
    }
    if (Array.isArray(headers)) {
      for (const entry of headers) {
        if (!Array.isArray(entry) || entry.length < 2) continue;
        const [name, value] = entry;
        if (typeof name === "string" && value !== void 0) {
          result[name] = String(value);
        }
      }
      return result;
    }
    if (typeof headers === "object") {
      for (const [name, value] of Object.entries(headers)) {
        if (value !== void 0) result[name] = String(value);
      }
    }
    return result;
  }
  function mergeForwardableHeaders(headers) {
    let merged = false;
    for (const [name, value] of Object.entries(headers)) {
      if (!isForwardableHeader(name)) continue;
      capturedGraphQLHeaders[canonicalHeaderName(name)] = value;
      merged = true;
    }
    if (merged) {
      capturedGraphQLRequestCount += 1;
      console.log("TrackPull portal bridge: captured GraphQL auth context", {
        requests: capturedGraphQLRequestCount,
        hasAuthorization: Object.keys(capturedGraphQLHeaders).some((name) => name.toLowerCase() === "authorization"),
        headerCount: Object.keys(capturedGraphQLHeaders).length
      });
    }
  }
  function rememberPortalGraphQLHeaders(headers) {
    mergeForwardableHeaders(headers);
  }
  function resetCapturedPortalGraphQLHeadersForTests() {
    capturedGraphQLHeaders = {};
    capturedGraphQLRequestCount = 0;
  }
  function getCapturedPortalGraphQLHeadersForTests() {
    return { ...capturedGraphQLHeaders };
  }
  function captureGraphQLFetchHeaders(input, init) {
    const url = getRequestUrl(input);
    if (!url || !isTrackmanGraphQLEndpoint(url)) return;
    const headers = {};
    if (typeof Request !== "undefined" && input instanceof Request) {
      Object.assign(headers, readHeaderMap(input.headers));
    }
    Object.assign(headers, readHeaderMap(init?.headers));
    mergeForwardableHeaders(headers);
  }
  function hasHeader(headers, headerName) {
    const lower = headerName.toLowerCase();
    return Object.keys(headers).some((name) => name.toLowerCase() === lower);
  }
  function setHeaderIfAbsent(headers, name, value) {
    if (!hasHeader(headers, name)) headers[name] = value;
  }
  function buildPageContextGraphQLHeaders(...stores) {
    const headers = { ...capturedGraphQLHeaders };
    setHeaderIfAbsent(headers, "Accept", "application/json");
    setHeaderIfAbsent(headers, "Content-Type", "application/json");
    const token = findTrackmanAuthTokenFromStorage(...stores);
    if (token && !hasHeader(headers, "Authorization")) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }
  function getPageFetch() {
    return pageFetch ?? window.fetch.bind(window);
  }
  function installFetchCapture() {
    const currentFetch = window.fetch;
    const markerRecord = currentFetch;
    if (markerRecord[WRAPPED_FETCH_MARKER]) return;
    pageFetch = currentFetch.bind(window);
    const fetchToCall = pageFetch;
    const wrappedFetch = ((input, init) => {
      captureGraphQLFetchHeaders(input, init);
      return fetchToCall(input, init);
    });
    Object.defineProperty(wrappedFetch, WRAPPED_FETCH_MARKER, {
      value: true,
      configurable: false
    });
    window.fetch = wrappedFetch;
  }
  function startFetchCaptureWatchdog() {
    installFetchCapture();
    let attempts = 0;
    const intervalId = window.setInterval(() => {
      attempts += 1;
      installFetchCapture();
      if (attempts >= 40) {
        window.clearInterval(intervalId);
      }
    }, 500);
  }
  function installXhrCapture() {
    const proto = XMLHttpRequest.prototype;
    if (proto.__trackpullPortalXhrWrapped) return;
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function openWithTrackPullCapture(method, url, async, username, password) {
      const xhr = this;
      xhr.__trackpullPortalUrl = String(url);
      xhr.__trackpullPortalHeaders = {};
      return originalOpen.call(this, method, url, async ?? true, username ?? null, password ?? null);
    };
    XMLHttpRequest.prototype.setRequestHeader = function setRequestHeaderWithTrackPullCapture(name, value) {
      const xhr = this;
      if (xhr.__trackpullPortalHeaders) {
        xhr.__trackpullPortalHeaders[name] = value;
      }
      return originalSetRequestHeader.call(this, name, value);
    };
    XMLHttpRequest.prototype.send = function sendWithTrackPullCapture(body) {
      const xhr = this;
      if (xhr.__trackpullPortalUrl && isTrackmanGraphQLEndpoint(xhr.__trackpullPortalUrl)) {
        mergeForwardableHeaders(xhr.__trackpullPortalHeaders ?? {});
      }
      return originalSend.call(this, body ?? null);
    };
    proto.__trackpullPortalXhrWrapped = true;
  }
  async function fetchGraphQLInPageContext(query, variables) {
    const validation = validatePortalGraphQLRequest(query, variables);
    if (!validation.ok) {
      return {
        source: PORTAL_GRAPHQL_RESPONSE_SOURCE,
        type: PORTAL_GRAPHQL_RESPONSE_TYPE,
        requestId: "",
        success: false,
        error: validation.error
      };
    }
    try {
      installFetchCapture();
      const response = await getPageFetch()(PORTAL_GRAPHQL_ENDPOINT, {
        method: "POST",
        credentials: "include",
        headers: buildPageContextGraphQLHeaders(window.localStorage, window.sessionStorage),
        body: JSON.stringify({ query, variables })
      });
      const text = await response.text();
      if (!response.ok) {
        return {
          source: PORTAL_GRAPHQL_RESPONSE_SOURCE,
          type: PORTAL_GRAPHQL_RESPONSE_TYPE,
          requestId: "",
          success: false,
          error: `HTTP ${response.status}: ${text.slice(0, 200)}`
        };
      }
      const data = text ? JSON.parse(text) : null;
      return {
        source: PORTAL_GRAPHQL_RESPONSE_SOURCE,
        type: PORTAL_GRAPHQL_RESPONSE_TYPE,
        requestId: "",
        success: true,
        data
      };
    } catch (err) {
      return {
        source: PORTAL_GRAPHQL_RESPONSE_SOURCE,
        type: PORTAL_GRAPHQL_RESPONSE_TYPE,
        requestId: "",
        success: false,
        error: err instanceof Error ? err.message : String(err)
      };
    }
  }
  function isPortalGraphQLRequestMessage(value) {
    if (!value || typeof value !== "object") return false;
    const record = value;
    return record.source === PORTAL_GRAPHQL_REQUEST_SOURCE && record.type === PORTAL_GRAPHQL_REQUEST_TYPE && typeof record.requestId === "string" && typeof record.query === "string";
  }
  function registerPageBridge() {
    window.addEventListener("message", (event) => {
      if (event.source !== window || event.origin !== window.location.origin) return;
      if (!isPortalGraphQLRequestMessage(event.data)) return;
      const request = event.data;
      const validation = validatePortalGraphQLRequest(request.query, request.variables);
      if (!validation.ok) {
        window.postMessage({
          source: PORTAL_GRAPHQL_RESPONSE_SOURCE,
          type: PORTAL_GRAPHQL_RESPONSE_TYPE,
          requestId: request.requestId,
          success: false,
          error: validation.error
        }, window.location.origin);
        return;
      }
      fetchGraphQLInPageContext(request.query, request.variables).then((response) => {
        window.postMessage({ ...response, requestId: request.requestId }, window.location.origin);
      });
    });
  }
  if (typeof window !== "undefined" && window.location.hostname === "portal.trackmangolf.com") {
    startFetchCaptureWatchdog();
    installXhrCapture();
    registerPageBridge();
    console.log("TrackPull portal bridge: MAIN-world GraphQL bridge loaded");
  }
})();
