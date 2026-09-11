"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // src/shared/prompt_types.ts
  var BUILTIN_PROMPTS;
  var init_prompt_types = __esm({
    "src/shared/prompt_types.ts"() {
      "use strict";
      BUILTIN_PROMPTS = [
        {
          id: "session-overview-beginner",
          name: "Session Overview",
          tier: "beginner",
          topic: "overview",
          template: `You are a friendly golf coach reviewing a player's Trackman session. Your job is to encourage them and help them improve.

Here is the tab-separated Trackman golf session data from their session today:

{{DATA}}

Please review this data and give the player a warm, encouraging summary. Include:
- 2 to 3 things they did well today (be specific, mention clubs or metrics if they stand out)
- 1 to 2 things to focus on for next time (keep it simple and actionable)
- A short encouraging closing message

Set aside any obvious mishits when judging the session. Use simple language. Avoid heavy technical jargon. Speak directly to the player like a supportive coach.`
        },
        {
          id: "club-breakdown-intermediate",
          name: "Club-by-Club Breakdown",
          tier: "intermediate",
          topic: "club-breakdown",
          template: `You are a golf performance analyst reviewing a player's Trackman session data.

Here is the tab-separated Trackman golf session data:

{{DATA}}

Before analyzing, note how many shots each club has. Treat any club with fewer than 5 shots as low-confidence, and exclude obvious mishits from averages (mention any shots you exclude). If a Tag column is present, break results down by tag within each club.

Please provide a club-by-club breakdown of this session. For each club represented in the data:
- Summarize average carry distance and ball speed
- Note the player's strengths with that club
- Identify weaknesses or areas for improvement

Then provide an overall summary:
- Which clubs are performing the strongest?
- Where are the biggest distance gaps between clubs? Are those gaps appropriate?
- What 1 to 2 adjustments would most improve overall performance?

If any suggested adjustment involves equipment (a different club, shaft, or loft), do not guess my current setup. Ask me short questions about the clubs and shafts I play now, and refine that recommendation after I answer.

Use moderate technical depth. Briefly explain what metrics mean when you reference them.`
        },
        {
          id: "consistency-analysis-advanced",
          name: "Consistency Analysis",
          tier: "advanced",
          topic: "consistency",
          template: `You are a technical golf data analyst. Analyze the following Trackman session data with a numbers-first approach.

Tab-separated Trackman golf session data:

{{DATA}}

If you have a code execution or data analysis tool available, use it for the statistics below; otherwise present them as estimates and say so.

Perform a consistency analysis across all shots and clubs:
- Calculate or estimate standard deviation ranges for key metrics (club speed, ball speed, launch angle, spin rate, carry)
- Identify which clubs show the tightest dispersion and which are most variable
- Analyze shot-to-shot repeatability patterns: is the player consistent in face angle, club path, and dynamic loft?
- Identify any outlier shots (significant deviations from the mean) and note which metrics are responsible
- Provide a consistency rating summary per club and overall

Ground rules:
- Report the shot count per club and treat clubs with fewer than 5 shots as low-confidence
- Exclude obvious mishits from averages and standard deviations, but list them as outliers
- The data header notes the hitting surface; mat strikes can mask fat contact, so factor that into strike-quality judgments
- If a metric referenced above is not present in the data, say so rather than estimating it

Reference specific metric values and numbers throughout. Prioritize data over general advice.`
        },
        {
          id: "launch-spin-intermediate",
          name: "Launch & Spin Optimization",
          tier: "intermediate",
          topic: "launch-spin",
          template: `You are a golf performance analyst specializing in launch conditions and spin optimization.

Here is the tab-separated Trackman golf session data:

{{DATA}}

Analyze the player's launch and spin data:
- Review launch angle and spin rate combinations per club
- Compare them to typical optimal windows for each club type (e.g., driver: ~12-15 deg launch, ~2200-2700 rpm spin). These windows shift with ball speed: faster ball speeds favor lower spin and launch, slower ball speeds need more of both
- Use spin axis to describe curve tendencies. For a right-handed player, a positive spin axis means the ball curves right (fade/slice) and a negative spin axis means it curves left (draw/hook); this is reversed for left-handers
- Identify which clubs are closest to optimal and which are farthest

For clubs that are outside optimal windows:
- Explain what the current numbers mean in terms of ball flight (too high, too low, too much spin, etc.)
- Suggest specific adjustments to move toward optimal conditions

Before recommending any loft or shaft change, interview me briefly: ask whether I am right- or left-handed, what loft and shaft (flex and weight) I currently play in the relevant clubs, and whether this session used range balls or premium balls. Give your preliminary read from the data first, then refine the recommendations after I answer.

If a metric referenced above is not in the data, say so rather than estimating it. Use moderate technical depth and explain what metrics mean for players who are learning.`
        },
        {
          id: "distance-gapping-beginner",
          name: "Distance Gapping Report",
          tier: "beginner",
          topic: "distance-gapping",
          template: `You are a friendly golf coach helping a player understand their distance gapping.

Here is the tab-separated Trackman golf session data:

{{DATA}}

Please review the carry and total distances for each club in this session. Then:
- List the average carry distance for each club in a simple, easy-to-read format
- Look at the gaps between consecutive clubs -- are there any big jumps or clubs that overlap?
- Let the player know if their gapping looks good or if there are clubs that might be missing or overlapping
- Give 1 to 2 friendly suggestions for the player's bag setup or club selection

Keep a few things in mind:
- Ignore obvious mishits when working out averages, and mention how many shots each club has
- If it looks like some clubs are missing from the data, ask me what else is in my bag before judging coverage
- One session is a starting point, not a final verdict -- say so if the data is thin

Keep it simple and encouraging. Focus on practical take-aways the player can use on the course.`
        },
        {
          id: "shot-shape-intermediate",
          name: "Shot Shape & Dispersion",
          tier: "intermediate",
          topic: "shot-shape",
          template: `You are a golf performance analyst reviewing a player's shot shape and dispersion patterns.

Here is the tab-separated Trackman golf session data:

{{DATA}}

First: if I have not said whether I am right- or left-handed, ask me, because every direction below flips for left-handers. You may give a preliminary read assuming right-handed, clearly labeled as such.

Analyze the player's shot shape and miss patterns:
- Review face angle, club path, face-to-path, and curve values to characterize their typical shot shape per club. For a right-handed player, positive club path = in-to-out (draw-biased) and positive face angle = open to the target (starts right)
- Identify if they play a consistent shot shape (draw, fade, straight) or if the pattern varies
- Review the Side and CarrySide data to understand lateral dispersion -- how far off-center do shots typically land? State the sign convention you assume for these columns
- Identify their most common miss direction and the likely technical cause (face angle, path, or both)

Provide:
- A shot shape profile for each club (e.g., "mild fade", "variable with occasional hook")
- An overall assessment of dispersion consistency
- 1 to 2 actionable suggestions to tighten their pattern

Exclude obvious mishits from the pattern read (note them separately), and if a metric referenced above is not in the data, say so rather than estimating it.

Use moderate technical depth. Briefly explain what each metric means.`
        },
        {
          id: "club-delivery-advanced",
          name: "Club Delivery Analysis",
          tier: "advanced",
          topic: "club-delivery",
          template: `You are a technical golf analyst conducting a detailed club delivery analysis.

Tab-separated Trackman golf session data:

{{DATA}}

Assume a right-handed player unless I have said otherwise; state that assumption and ask me to confirm. If you have a code execution or data analysis tool, use it for the statistics below; otherwise keep the analysis qualitative and label any numbers as estimates.

Analyze club delivery metrics across all clubs and shots. Focus on:
- Attack Angle: positive (ascending) vs negative (descending) and its effect on spin and launch
- Club Path (in/out vs out/in) and how it correlates to curve and spin axis
- Face Angle at impact and the face-to-path relationship as the primary driver of curvature
- Dynamic Loft per club compared to expected values. If your conclusions depend on my actual club lofts, ask me for them rather than assuming stock lofts
- Which delivery metrics most strongly relate to carry distance, spin rate, and side error for this player

For each major club category (driver, irons, wedges):
- Report average delivery numbers along with the shot count behind them
- Identify the most impactful delivery variable affecting performance
- Flag any delivery patterns that suggest mechanical inefficiency

The data header notes the hitting surface; mat strikes can mask fat contact, so factor that into strike-quality judgments. Exclude obvious mishits from averages and list them separately. If a metric referenced above is not present in the data, say so rather than estimating it.

Prioritize numbers and specific metric values. Provide a ranked list of delivery improvements by expected performance impact.`
        },
        {
          id: "quick-summary-beginner",
          name: "Quick Session Summary",
          tier: "beginner",
          topic: "quick-summary",
          template: `You are a friendly golf coach. Give the player a fast, upbeat summary of their Trackman session.

Here is the tab-separated Trackman golf session data from their session:

{{DATA}}

Provide a very short, friendly summary in 3 to 4 bullet points only. Cover:
- Their best performing club today
- Their longest carry shot (club and distance)
- Their most consistent club (tightest results)
- One quick positive takeaway to leave them feeling good

Skip obvious mishits when picking the highlights. Keep it brief and encouraging. No heavy analysis needed -- just the headlines.`
        }
      ];
    }
  });

  // src/shared/metric_catalog.ts
  var METRIC_COLUMN_ORDER, METRIC_DISPLAY_NAMES, DISTANCE_METRICS, SMALL_DISTANCE_METRICS, MILLIMETER_METRICS, ANGLE_METRICS, SPEED_METRICS, FIXED_UNIT_LABELS;
  var init_metric_catalog = __esm({
    "src/shared/metric_catalog.ts"() {
      "use strict";
      METRIC_COLUMN_ORDER = [
        // Speed & Efficiency
        "ClubSpeed",
        "BallSpeed",
        "SmashFactor",
        // Club Delivery
        "AttackAngle",
        "ClubPath",
        "FaceAngle",
        "FaceToPath",
        "SwingDirection",
        "DynamicLoft",
        // Launch & Spin
        "LaunchAngle",
        "LaunchDirection",
        "SpinRate",
        "SpinAxis",
        "SpinLoft",
        // Distance
        "Carry",
        "Total",
        // Dispersion
        "Side",
        "SideTotal",
        "CarrySide",
        "TotalSide",
        "Curve",
        // Ball Flight
        "Height",
        "MaxHeight",
        "LandingAngle",
        "HangTime",
        // Impact
        "LowPointDistance",
        "ImpactHeight",
        "ImpactOffset",
        // Other
        "Tempo"
      ];
      METRIC_DISPLAY_NAMES = {
        ClubSpeed: "Club Speed",
        BallSpeed: "Ball Speed",
        SmashFactor: "Smash Factor",
        AttackAngle: "Attack Angle",
        ClubPath: "Club Path",
        FaceAngle: "Face Angle",
        FaceToPath: "Face To Path",
        SwingDirection: "Swing Direction",
        DynamicLoft: "Dynamic Loft",
        SpinRate: "Spin Rate",
        SpinAxis: "Spin Axis",
        SpinLoft: "Spin Loft",
        LaunchAngle: "Launch Angle",
        LaunchDirection: "Launch Direction",
        Carry: "Carry",
        Total: "Total",
        Side: "Side",
        SideTotal: "Side Total",
        CarrySide: "Carry Side",
        TotalSide: "Total Side",
        Height: "Height",
        MaxHeight: "Max Height",
        Curve: "Curve",
        LandingAngle: "Landing Angle",
        HangTime: "Hang Time",
        LowPointDistance: "Low Point",
        ImpactHeight: "Impact Height",
        ImpactOffset: "Impact Offset",
        Tempo: "Tempo"
      };
      DISTANCE_METRICS = {
        Carry: true,
        Total: true,
        Side: true,
        SideTotal: true,
        CarrySide: true,
        TotalSide: true,
        Height: true,
        MaxHeight: true,
        Curve: true
      };
      SMALL_DISTANCE_METRICS = {
        LowPointDistance: true
      };
      MILLIMETER_METRICS = {
        ImpactHeight: true,
        ImpactOffset: true
      };
      ANGLE_METRICS = {
        AttackAngle: true,
        ClubPath: true,
        FaceAngle: true,
        FaceToPath: true,
        DynamicLoft: true,
        LaunchAngle: true,
        LaunchDirection: true,
        LandingAngle: true
      };
      SPEED_METRICS = {
        ClubSpeed: true,
        BallSpeed: true
      };
      FIXED_UNIT_LABELS = {
        SpinRate: "rpm",
        HangTime: "s",
        Tempo: "s",
        ImpactHeight: "mm",
        ImpactOffset: "mm"
      };
    }
  });

  // src/shared/constants.ts
  var CUSTOM_PROMPT_KEY_PREFIX, CUSTOM_PROMPT_IDS_KEY, STORAGE_KEYS;
  var init_constants = __esm({
    "src/shared/constants.ts"() {
      "use strict";
      init_metric_catalog();
      CUSTOM_PROMPT_KEY_PREFIX = "customPrompt_";
      CUSTOM_PROMPT_IDS_KEY = "customPromptIds";
      STORAGE_KEYS = {
        TRACKMAN_DATA: "trackmanData",
        SPEED_UNIT: "speedUnit",
        DISTANCE_UNIT: "distanceUnit",
        SELECTED_PROMPT_ID: "selectedPromptId",
        AI_SERVICE: "aiService",
        HITTING_SURFACE: "hittingSurface",
        INCLUDE_AVERAGES: "includeAverages",
        SESSION_HISTORY: "sessionHistory",
        IMPORT_STATUS: "importStatus",
        BULK_IMPORT_STATUS: "bulkImportStatus",
        PORTAL_ARCHIVE_EXPORT_STATUS: "portalArchiveExportStatus"
      };
    }
  });

  // src/shared/custom_prompts.ts
  function validateCustomPromptTemplate(template) {
    return template.includes(CUSTOM_PROMPT_DATA_PLACEHOLDER) ? null : CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR;
  }
  async function loadCustomPrompts() {
    const idsResult = await chrome.storage.sync.get([CUSTOM_PROMPT_IDS_KEY]);
    const ids = idsResult[CUSTOM_PROMPT_IDS_KEY] ?? [];
    if (ids.length === 0) return [];
    const keys = ids.map((id) => CUSTOM_PROMPT_KEY_PREFIX + id);
    const promptsResult = await chrome.storage.sync.get(keys);
    return ids.map((id) => promptsResult[CUSTOM_PROMPT_KEY_PREFIX + id]).filter((p) => p !== void 0);
  }
  async function saveCustomPrompt(prompt) {
    const validationError = validateCustomPromptTemplate(prompt.template);
    if (validationError) {
      throw new Error(validationError);
    }
    const key = CUSTOM_PROMPT_KEY_PREFIX + prompt.id;
    const result = await chrome.storage.sync.get([CUSTOM_PROMPT_IDS_KEY]);
    const ids = result[CUSTOM_PROMPT_IDS_KEY] ?? [];
    if (!ids.includes(prompt.id)) {
      ids.push(prompt.id);
    }
    await chrome.storage.sync.set({
      [key]: prompt,
      [CUSTOM_PROMPT_IDS_KEY]: ids
    });
  }
  async function deleteCustomPrompt(id) {
    const key = CUSTOM_PROMPT_KEY_PREFIX + id;
    const idsResult = await chrome.storage.sync.get([CUSTOM_PROMPT_IDS_KEY]);
    const ids = idsResult[CUSTOM_PROMPT_IDS_KEY] ?? [];
    const newIds = ids.filter((i) => i !== id);
    await chrome.storage.sync.remove(key);
    await chrome.storage.sync.set({ [CUSTOM_PROMPT_IDS_KEY]: newIds });
  }
  var CUSTOM_PROMPT_DATA_PLACEHOLDER, CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR;
  var init_custom_prompts = __esm({
    "src/shared/custom_prompts.ts"() {
      "use strict";
      init_constants();
      CUSTOM_PROMPT_DATA_PLACEHOLDER = "{{DATA}}";
      CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR = "Custom prompt templates must include {{DATA}}.";
    }
  });

  // src/shared/bulk_import_store.ts
  function clearAllBulkImportedSessions() {
    const { promise, resolve, reject } = Promise.withResolvers();
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not clear bulk import store"));
    request.onblocked = () => reject(new Error("Could not clear bulk import store while it is in use"));
    return promise;
  }
  var DB_NAME;
  var init_bulk_import_store = __esm({
    "src/shared/bulk_import_store.ts"() {
      "use strict";
      DB_NAME = "trackpull-bulk-import";
    }
  });

  // src/shared/import_types.ts
  function isSupportedPortalActivityType(type) {
    return type !== null && type in SUPPORTED_ACTIVITY_TYPES;
  }
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
  var FETCH_ACTIVITIES_PAGE_SIZE, FETCH_ACTIVITIES_MAX_PAGES, ACTIVITY_SUMMARY_FIELDS, ACTIVITY_COURSE_SUMMARY_FIELDS, ACTIVITY_MINIMAL_TIME_FIELDS, ACTIVITY_MINIMAL_DATE_FIELDS, FETCH_ACTIVITIES_QUERY, FETCH_ACTIVITIES_QUERY_CANDIDATES, SUPPORTED_ACTIVITY_TYPES, STROKE_MEASUREMENT_FIELDS, SCORECARD_SHOT_MEASUREMENT_FIELDS, STROKE_FIELDS, IMPORT_SESSION_QUERY, IMPORT_SESSION_FALLBACK_QUERIES, IMPORT_SESSION_QUERY_CANDIDATES;
  var init_import_types = __esm({
    "src/shared/import_types.ts"() {
      "use strict";
      FETCH_ACTIVITIES_PAGE_SIZE = 100;
      FETCH_ACTIVITIES_MAX_PAGES = 100;
      ACTIVITY_SUMMARY_FIELDS = `
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
      ACTIVITY_COURSE_SUMMARY_FIELDS = `
  id
  time
  __typename
  ... on CoursePlayActivity {
    course {
      displayName
    }
  }
`;
      ACTIVITY_MINIMAL_TIME_FIELDS = `
  id
  time
  __typename
`;
      ACTIVITY_MINIMAL_DATE_FIELDS = `
  id
  date
  __typename
`;
      FETCH_ACTIVITIES_QUERY = `
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
      FETCH_ACTIVITIES_QUERY_CANDIDATES = [
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
      SUPPORTED_ACTIVITY_TYPES = {
        SessionActivity: true,
        CoursePlayActivity: true,
        CourseSessionActivity: true,
        COURSE_PLAY: true,
        MapMyBagActivity: true,
        MapMyBagSessionActivity: true,
        BagMappingActivity: true,
        MAP_MY_BAG: true,
        VirtualGolfActivity: true,
        VirtualGolfSessionActivity: true,
        VIRTUAL_GOLF: true,
        VirtualRangeSessionActivity: true,
        VIRTUAL_RANGE: true,
        ShotAnalysisSessionActivity: true,
        SHOT_ANALYSIS: true,
        CombineTestActivity: true,
        COMBINE_TEST: true,
        RangeFindMyDistanceActivity: true,
        FIND_MY_DISTANCE: true
      };
      STROKE_MEASUREMENT_FIELDS = `
  clubSpeed ballSpeed smashFactor attackAngle clubPath faceAngle
  faceToPath swingDirection swingPlane dynamicLoft spinRate spinAxis spinLoft
  launchAngle launchDirection carry total carrySide totalSide
  maxHeight landingAngle hangTime
`;
      SCORECARD_SHOT_MEASUREMENT_FIELDS = `
  ballSpeed carrySideActual carryActual launchDirection maxHeight carry total
  carrySide launchAngle spinRate spinAxis backswingTime forwardswingTime tempo
  strokeLength dynamicLie impactOffset impactHeight skidDistance rollPercentage
  rollSpeed speedDrop rollDeceleration effectiveStimp flatStimp break bounces
  entrySpeedDistance elevation slopePercentageSide slopePercentageRise
  totalBreak attackAngle clubPath clubSpeed dynamicLoft faceAngle faceToPath
  smashFactor gyroSpinAngle spinLoft swingDirection swingPlane swingRadius
`;
      STROKE_FIELDS = `
  club
  time
  targetDistance
  measurement {
    ${STROKE_MEASUREMENT_FIELDS}
  }
`;
      IMPORT_SESSION_QUERY = `
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
      IMPORT_SESSION_FALLBACK_QUERIES = [
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
      IMPORT_SESSION_QUERY_CANDIDATES = [
        { label: "default", query: IMPORT_SESSION_QUERY },
        ...IMPORT_SESSION_FALLBACK_QUERIES
      ];
    }
  });

  // src/shared/unit_normalization.ts
  function extractUnitParams(metadataParams) {
    const result = {};
    for (const [key, value] of Object.entries(metadataParams)) {
      const match = key.match(/^nd_([a-z0-9]+)$/i);
      if (match) {
        const groupKey = match[1].toLowerCase();
        result[groupKey] = value;
      }
    }
    return result;
  }
  function getUnitSystemId(metadataParams) {
    const unitParams = extractUnitParams(metadataParams);
    return unitParams["001"] || "789012";
  }
  function getUnitSystem(metadataParams) {
    const id = getUnitSystemId(metadataParams);
    return UNIT_SYSTEMS[id] || DEFAULT_UNIT_SYSTEM;
  }
  function getApiSourceUnitSystem(metadataParams) {
    const reportSystem = getUnitSystem(metadataParams);
    return {
      id: "api",
      name: "API Source",
      distanceUnit: "meters",
      angleUnit: reportSystem.angleUnit,
      speedUnit: "m/s"
    };
  }
  function getMetricUnitLabel(metricName, unitChoice = DEFAULT_UNIT_CHOICE) {
    if (metricName in FIXED_UNIT_LABELS) return FIXED_UNIT_LABELS[metricName];
    if (metricName in SPEED_METRICS) return SPEED_LABELS[unitChoice.speed];
    if (metricName in SMALL_DISTANCE_METRICS) return SMALL_DISTANCE_LABELS[getSmallDistanceUnit(unitChoice)];
    if (metricName in DISTANCE_METRICS) return DISTANCE_LABELS[unitChoice.distance];
    if (metricName in ANGLE_METRICS) return "\xB0";
    return "";
  }
  function convertDistance(value, fromUnit, toUnit) {
    if (value === null || value === "") return value;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    if (fromUnit === toUnit) return numValue;
    const inMeters = fromUnit === "yards" ? numValue * 0.9144 : numValue;
    return toUnit === "yards" ? inMeters / 0.9144 : inMeters;
  }
  function convertAngle(value, fromUnit, toUnit) {
    if (value === null || value === "") return value;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    if (fromUnit === toUnit) return numValue;
    const inDegrees = fromUnit === "degrees" ? numValue : numValue * 180 / Math.PI;
    return toUnit === "degrees" ? inDegrees : inDegrees * Math.PI / 180;
  }
  function convertSpeed(value, fromUnit, toUnit) {
    if (value === null || value === "") return value;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    if (fromUnit === toUnit) return numValue;
    let inMph;
    if (fromUnit === "mph") inMph = numValue;
    else if (fromUnit === "km/h") inMph = numValue / 1.609344;
    else inMph = numValue * 2.23694;
    if (toUnit === "mph") return inMph;
    if (toUnit === "km/h") return inMph * 1.609344;
    return inMph / 2.23694;
  }
  function getSmallDistanceUnit(unitChoice = DEFAULT_UNIT_CHOICE) {
    return unitChoice.distance === "yards" ? "inches" : "cm";
  }
  function convertSmallDistance(value, toSmallUnit) {
    if (value === null || value === "") return value;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    return toSmallUnit === "inches" ? numValue * 39.3701 : numValue * 100;
  }
  function convertMillimeters(value) {
    if (value === null || value === "") return value;
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return value;
    return numValue * 1e3;
  }
  function normalizeMetricValue(value, metricName, reportUnitSystem, unitChoice = DEFAULT_UNIT_CHOICE) {
    const numValue = parseNumericValue(value);
    if (numValue === null) return value;
    let converted;
    if (metricName in MILLIMETER_METRICS) {
      converted = convertMillimeters(numValue);
    } else if (metricName in SMALL_DISTANCE_METRICS) {
      converted = convertSmallDistance(
        numValue,
        getSmallDistanceUnit(unitChoice)
      );
    } else if (metricName in DISTANCE_METRICS) {
      converted = convertDistance(
        numValue,
        reportUnitSystem.distanceUnit,
        unitChoice.distance
      );
    } else if (metricName in ANGLE_METRICS) {
      converted = convertAngle(
        numValue,
        reportUnitSystem.angleUnit,
        "degrees"
      );
    } else if (metricName in SPEED_METRICS) {
      converted = convertSpeed(
        numValue,
        reportUnitSystem.speedUnit,
        unitChoice.speed
      );
    } else {
      converted = numValue;
    }
    if (metricName === "SpinRate") return Math.round(converted);
    if (metricName in MILLIMETER_METRICS) return Math.round(converted);
    if (metricName === "SmashFactor" || metricName === "Tempo")
      return Math.round(converted * 100) / 100;
    return Math.round(converted * 10) / 10;
  }
  function parseNumericValue(value) {
    if (value === null || value === "") return null;
    if (typeof value === "number") return isNaN(value) ? null : value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  var DEFAULT_UNIT_CHOICE, UNIT_SYSTEMS, DEFAULT_UNIT_SYSTEM, SPEED_LABELS, DISTANCE_LABELS, SMALL_DISTANCE_LABELS;
  var init_unit_normalization = __esm({
    "src/shared/unit_normalization.ts"() {
      "use strict";
      init_metric_catalog();
      init_metric_catalog();
      DEFAULT_UNIT_CHOICE = { speed: "mph", distance: "yards" };
      UNIT_SYSTEMS = {
        // Imperial (yards, degrees) - most common
        "789012": {
          id: "789012",
          name: "Imperial",
          distanceUnit: "yards",
          angleUnit: "degrees",
          speedUnit: "mph"
        },
        // Metric (meters, radians)
        "789013": {
          id: "789013",
          name: "Metric (rad)",
          distanceUnit: "meters",
          angleUnit: "radians",
          speedUnit: "km/h"
        },
        // Metric (meters, degrees) - less common
        "789014": {
          id: "789014",
          name: "Metric (deg)",
          distanceUnit: "meters",
          angleUnit: "degrees",
          speedUnit: "km/h"
        }
      };
      DEFAULT_UNIT_SYSTEM = UNIT_SYSTEMS["789012"];
      SPEED_LABELS = {
        "mph": "mph",
        "m/s": "m/s"
      };
      DISTANCE_LABELS = {
        "yards": "yds",
        "meters": "m"
      };
      SMALL_DISTANCE_LABELS = {
        "inches": "in",
        "cm": "cm"
      };
    }
  });

  // src/shared/spreadsheet_safety.ts
  function neutralizeSpreadsheetFormula(value) {
    if (value.length === 0) return value;
    return SPREADSHEET_FORMULA_PREFIXES[value[0]] === true ? `'${value}` : value;
  }
  var SPREADSHEET_FORMULA_PREFIXES;
  var init_spreadsheet_safety = __esm({
    "src/shared/spreadsheet_safety.ts"() {
      "use strict";
      SPREADSHEET_FORMULA_PREFIXES = {
        "=": true,
        "+": true,
        "-": true,
        "@": true,
        "	": true,
        "\r": true
      };
    }
  });

  // src/shared/csv_writer.ts
  function getDisplayName(metric) {
    return METRIC_DISPLAY_NAMES[metric] ?? metric;
  }
  function getColumnName(metric, unitChoice) {
    const displayName = getDisplayName(metric);
    const unitLabel = getMetricUnitLabel(metric, unitChoice);
    return unitLabel ? `${displayName} (${unitLabel})` : displayName;
  }
  function orderMetricsByPriority(allMetrics, priorityOrder) {
    const result = [];
    const seen = /* @__PURE__ */ new Set();
    for (const metric of priorityOrder) {
      if (allMetrics.includes(metric) && !seen.has(metric)) {
        result.push(metric);
        seen.add(metric);
      }
    }
    for (const metric of allMetrics) {
      if (!seen.has(metric)) {
        result.push(metric);
      }
    }
    return result;
  }
  function hasTags(session) {
    return session.club_groups.some(
      (club) => club.shots.some((shot) => shot.tag !== void 0 && shot.tag !== "")
    );
  }
  function hasAnyTags(sessions) {
    return sessions.some(hasTags);
  }
  function escapeCsvValue(value) {
    if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }
  function createCsvLines(headerRow, rows, hittingSurface) {
    const lines = [];
    if (hittingSurface !== void 0) {
      lines.push(`Hitting Surface: ${hittingSurface}`);
    }
    lines.push(headerRow.map((col) => escapeCsvValue(neutralizeSpreadsheetFormula(col))).join(","));
    for (const row of rows) {
      lines.push(
        headerRow.map((col) => escapeCsvValue(row[col] ?? "")).join(",")
      );
    }
    return lines.join("\n");
  }
  function writeBulkCsv(sessions, includeAverages = true, metricOrder, unitChoice = DEFAULT_UNIT_CHOICE, hittingSurface) {
    const allMetricNames = Array.from(
      new Set(sessions.flatMap((session) => session.metric_names))
    );
    const orderedMetrics = orderMetricsByPriority(
      allMetricNames,
      metricOrder ?? METRIC_COLUMN_ORDER
    );
    const headerRow = ["Session Date", "Report ID", "Activity Type", "Club"];
    const includeTagColumn = hasAnyTags(sessions);
    if (includeTagColumn) {
      headerRow.push("Tag");
    }
    headerRow.push("Shot #", "Type");
    for (const metric of orderedMetrics) {
      headerRow.push(getColumnName(metric, unitChoice));
    }
    const rows = [];
    for (const session of sessions) {
      const unitSystem = getApiSourceUnitSystem(session.metadata_params);
      const activityType = session.metadata_params.activity_type ?? session.metadata_params.activity_kind ?? "";
      for (const club of session.club_groups) {
        for (const shot of club.shots) {
          const row = {
            "Session Date": neutralizeSpreadsheetFormula(session.date),
            "Report ID": neutralizeSpreadsheetFormula(session.report_id),
            "Activity Type": neutralizeSpreadsheetFormula(activityType),
            Club: neutralizeSpreadsheetFormula(club.club_name),
            "Shot #": String(shot.shot_number + 1),
            Type: "Shot"
          };
          if (includeTagColumn) {
            row.Tag = neutralizeSpreadsheetFormula(shot.tag ?? "");
          }
          for (const metric of orderedMetrics) {
            const colName = getColumnName(metric, unitChoice);
            const rawValue = shot.metrics[metric] ?? "";
            if (typeof rawValue === "string" || typeof rawValue === "number") {
              const normalizedValue = normalizeMetricValue(rawValue, metric, unitSystem, unitChoice);
              row[colName] = typeof normalizedValue === "number" ? String(normalizedValue) : neutralizeSpreadsheetFormula(String(normalizedValue));
            } else {
              row[colName] = "";
            }
          }
          rows.push(row);
        }
        if (includeAverages) {
          const tagGroups = /* @__PURE__ */ new Map();
          for (const shot of club.shots) {
            const tag = shot.tag ?? "";
            if (!tagGroups.has(tag)) tagGroups.set(tag, []);
            tagGroups.get(tag).push(shot);
          }
          for (const [tag, shots] of tagGroups) {
            if (shots.length < 2) continue;
            const avgRow = {
              "Session Date": neutralizeSpreadsheetFormula(session.date),
              "Report ID": neutralizeSpreadsheetFormula(session.report_id),
              "Activity Type": neutralizeSpreadsheetFormula(activityType),
              Club: neutralizeSpreadsheetFormula(club.club_name),
              "Shot #": "",
              Type: "Average"
            };
            if (includeTagColumn) {
              avgRow.Tag = neutralizeSpreadsheetFormula(tag);
            }
            for (const metric of orderedMetrics) {
              const colName = getColumnName(metric, unitChoice);
              const values = shots.map((s) => s.metrics[metric]).filter((v) => v !== void 0 && v !== "").map((v) => parseFloat(String(v)));
              const numericValues = values.filter((v) => !isNaN(v));
              if (numericValues.length > 0) {
                const avg = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
                const rounded = metric === "SmashFactor" || metric === "Tempo" ? Math.round(avg * 100) / 100 : Math.round(avg * 10) / 10;
                avgRow[colName] = String(normalizeMetricValue(rounded, metric, unitSystem, unitChoice));
              } else {
                avgRow[colName] = "";
              }
            }
            rows.push(avgRow);
          }
        }
      }
    }
    return createCsvLines(headerRow, rows, hittingSurface);
  }
  var init_csv_writer = __esm({
    "src/shared/csv_writer.ts"() {
      "use strict";
      init_unit_normalization();
      init_metric_catalog();
      init_spreadsheet_safety();
    }
  });

  // src/shared/archive_export.ts
  function getArchiveExportFailureForItem(item) {
    if (item.status !== "failed" && item.status !== "unsupported") return null;
    return {
      activityId: item.activityId,
      date: item.date,
      type: item.type,
      detail: item.detail,
      kind: item.failureKind ?? (item.status === "unsupported" ? "unsupported" : "unknown"),
      message: item.error ?? "Archive export item did not complete.",
      reportId: item.reportId,
      unsupportedReason: item.unsupportedReason,
      capturedAt: item.updatedAt
    };
  }
  var init_archive_export = __esm({
    "src/shared/archive_export.ts"() {
      "use strict";
      init_import_types();
    }
  });

  // src/shared/archive_builder.ts
  function countSessionShots(session) {
    let total = 0;
    for (const club of session.club_groups) {
      total += club.shots.length;
    }
    return total;
  }
  function createSessionManifest(session) {
    return {
      reportId: session.report_id,
      date: session.date,
      activityType: session.metadata_params.activity_type ?? session.metadata_params.activity_kind ?? "",
      clubGroupCount: session.club_groups.length,
      shotCount: countSessionShots(session),
      metricNames: [...session.metric_names]
    };
  }
  function deriveFailures(job, suppliedFailures) {
    const failures = suppliedFailures ? [...suppliedFailures] : [];
    const existingKeys = new Set(failures.map((failure) => `${failure.activityId}:${failure.kind}:${failure.message}`));
    for (const item of job.items) {
      const failure = getArchiveExportFailureForItem(item);
      if (!failure) continue;
      const key = `${failure.activityId}:${failure.kind}:${failure.message}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      failures.push(failure);
    }
    return failures.sort((a, b) => (a.capturedAt ?? 0) - (b.capturedAt ?? 0) || a.activityId.localeCompare(b.activityId));
  }
  function deriveUnsupported(job, suppliedUnsupported) {
    const unsupported = suppliedUnsupported ? [...suppliedUnsupported] : [];
    const existingIds = new Set(unsupported.map((item) => item.activityId));
    for (const item of job.items) {
      if (item.status !== "unsupported" || existingIds.has(item.activityId)) continue;
      existingIds.add(item.activityId);
      unsupported.push(item);
    }
    return unsupported.sort((a, b) => (a.updatedAt ?? 0) - (b.updatedAt ?? 0) || a.activityId.localeCompare(b.activityId));
  }
  function toJson(contents) {
    return `${JSON.stringify(contents, null, 2)}
`;
  }
  function buildUnsupportedText(items) {
    if (items.length === 0) return "No unsupported portal sessions were skipped.\n";
    const lines = [
      "Unsupported portal sessions skipped by TrackPull archive export",
      ""
    ];
    for (const item of items) {
      const typeLabel = item.type ?? "missing type";
      const detail = item.detail ? ` (${item.detail})` : "";
      lines.push(`- ${item.date} ${item.activityId}${detail}: ${typeLabel} \u2014 ${item.error ?? "Unsupported portal activity"}`);
    }
    return `${lines.join("\n")}
`;
  }
  function createOutputBlob(filename, mimeType, contents) {
    return { filename, mimeType, contents };
  }
  function buildArchiveExportOutputs(input) {
    const options = input.options ?? {};
    const baseFilename = options.baseFilename ?? `trackpull-archive-${input.job.id}`;
    const generatedAt = options.generatedAt ?? (/* @__PURE__ */ new Date()).toISOString();
    const failures = deriveFailures(input.job, input.failures);
    const unsupportedItems = deriveUnsupported(input.job, input.unsupported);
    const csv = createOutputBlob(
      `${baseFilename}-sessions.csv`,
      "text/csv;charset=utf-8",
      writeBulkCsv(
        input.sessions,
        options.includeAverages ?? true,
        options.metricOrder,
        options.unitChoice,
        options.hittingSurface
      )
    );
    const failuresBlob = createOutputBlob(
      `${baseFilename}-failures.json`,
      "application/json;charset=utf-8",
      toJson({ schemaVersion: 1, generatedAt, jobId: input.job.id, failures })
    );
    const manifestFilename = `${baseFilename}-manifest.json`;
    const fileManifest = [
      { filename: csv.filename, mimeType: csv.mimeType, role: "sessions-csv" },
      { filename: manifestFilename, mimeType: "application/json;charset=utf-8", role: "manifest" },
      { filename: failuresBlob.filename, mimeType: failuresBlob.mimeType, role: "failures" }
    ];
    let unsupportedBlob;
    if (unsupportedItems.length > 0) {
      unsupportedBlob = createOutputBlob(
        `${baseFilename}-unsupported.txt`,
        "text/plain;charset=utf-8",
        buildUnsupportedText(unsupportedItems)
      );
      fileManifest.push({ filename: unsupportedBlob.filename, mimeType: unsupportedBlob.mimeType, role: "unsupported" });
    }
    const manifest = {
      schemaVersion: 1,
      generatedAt,
      job: {
        id: input.job.id,
        state: input.job.state,
        createdAt: input.job.createdAt,
        updatedAt: input.job.updatedAt,
        total: input.job.total,
        exported: input.job.exported,
        failed: input.job.failed,
        unsupported: input.job.unsupported
      },
      counts: {
        sessions: input.sessions.length,
        failures: failures.length,
        unsupported: unsupportedItems.length,
        files: fileManifest.length
      },
      sessions: input.sessions.map(createSessionManifest),
      failures,
      files: fileManifest
    };
    const manifestBlob = createOutputBlob(
      manifestFilename,
      "application/json;charset=utf-8",
      toJson(manifest)
    );
    const files = unsupportedBlob ? [csv, manifestBlob, failuresBlob, unsupportedBlob] : [csv, manifestBlob, failuresBlob];
    return {
      files,
      manifest,
      csv,
      failures: failuresBlob,
      unsupported: unsupportedBlob
    };
  }
  var init_archive_builder = __esm({
    "src/shared/archive_builder.ts"() {
      "use strict";
      init_csv_writer();
      init_archive_export();
    }
  });

  // src/shared/archive_export_store.ts
  function openArchiveExportDb() {
    const { promise, resolve, reject } = Promise.withResolvers();
    const request = indexedDB.open(DB_NAME2, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(JOB_STORE)) {
        db.createObjectStore(JOB_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        const store = db.createObjectStore(ITEM_STORE, { keyPath: "key" });
        store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
        store.createIndex(STATUS_INDEX, STATUS_INDEX, { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const store = db.createObjectStore(SESSION_STORE, { keyPath: "key" });
        store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
      }
      if (!db.objectStoreNames.contains(FAILURE_STORE)) {
        const store = db.createObjectStore(FAILURE_STORE, { keyPath: "key" });
        store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open archive export store"));
    request.onblocked = () => reject(new Error("Archive export store is blocked by another tab"));
    return promise;
  }
  function requestToPromise(request, message) {
    const { promise, resolve, reject } = Promise.withResolvers();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error(message));
    return promise;
  }
  function transactionDone(tx, message) {
    const { promise, resolve, reject } = Promise.withResolvers();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error(message));
    tx.onabort = () => reject(tx.error ?? new Error(message));
    return promise;
  }
  function itemKey(jobId, activityId) {
    return `${jobId}:item:${activityId}`;
  }
  function sortStoredSessions(sessions) {
    return sessions.sort((a, b) => a.capturedAt - b.capturedAt || a.reportId.localeCompare(b.reportId));
  }
  function sortStoredFailures(failures) {
    return failures.sort((a, b) => a.capturedAt - b.capturedAt || a.activityId.localeCompare(b.activityId));
  }
  async function putArchiveExportJob(job) {
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction([JOB_STORE, ITEM_STORE], "readwrite");
      tx.objectStore(JOB_STORE).put(job);
      const itemStore = tx.objectStore(ITEM_STORE);
      const existingItemKeys = await requestToPromise(
        itemStore.index(JOB_INDEX).getAllKeys(job.id),
        "Could not load archive export item keys"
      );
      for (const key of existingItemKeys) {
        itemStore.delete(key);
      }
      job.items.forEach((item, sortIndex) => {
        const record = {
          ...item,
          key: itemKey(job.id, item.activityId),
          jobId: job.id,
          sortIndex
        };
        itemStore.put(record);
      });
      await transactionDone(tx, "Could not save archive export job");
    } finally {
      db.close();
    }
  }
  async function putArchiveExportItem(jobId, item, sortIndex = 0) {
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction(ITEM_STORE, "readwrite");
      const record = {
        ...item,
        key: itemKey(jobId, item.activityId),
        jobId,
        sortIndex
      };
      tx.objectStore(ITEM_STORE).put(record);
      await transactionDone(tx, "Could not save archive export item");
    } finally {
      db.close();
    }
  }
  async function getArchiveExportSessions(jobId) {
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction(SESSION_STORE, "readonly");
      const records = await requestToPromise(
        tx.objectStore(SESSION_STORE).index(JOB_INDEX).getAll(jobId),
        "Could not load archive export sessions"
      );
      return sortStoredSessions(records).map((record) => record.snapshot);
    } finally {
      db.close();
    }
  }
  async function getArchiveExportFailures(jobId) {
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction(FAILURE_STORE, "readonly");
      const records = await requestToPromise(
        tx.objectStore(FAILURE_STORE).index(JOB_INDEX).getAll(jobId),
        "Could not load archive export failures"
      );
      return sortStoredFailures(records);
    } finally {
      db.close();
    }
  }
  async function deleteByJobId(db, storeName, jobId) {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const keys = await requestToPromise(
      store.index(JOB_INDEX).getAllKeys(jobId),
      `Could not load archive export ${storeName} keys`
    );
    for (const key of keys) {
      store.delete(key);
    }
    await transactionDone(tx, `Could not clear archive export ${storeName}`);
  }
  async function clearArchiveExportJob(jobId) {
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction(JOB_STORE, "readwrite");
      tx.objectStore(JOB_STORE).delete(jobId);
      await transactionDone(tx, "Could not clear archive export job");
      await Promise.all([
        deleteByJobId(db, ITEM_STORE, jobId),
        deleteByJobId(db, SESSION_STORE, jobId),
        deleteByJobId(db, FAILURE_STORE, jobId)
      ]);
    } finally {
      db.close();
    }
  }
  function clearAllArchiveExports() {
    const { promise, resolve, reject } = Promise.withResolvers();
    const request = indexedDB.deleteDatabase(DB_NAME2);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("Could not clear archive export store"));
    request.onblocked = () => reject(new Error("Could not clear archive export store while it is in use"));
    return promise;
  }
  var DB_NAME2, DB_VERSION, JOB_STORE, ITEM_STORE, SESSION_STORE, FAILURE_STORE, JOB_INDEX, ACTIVITY_INDEX, STATUS_INDEX;
  var init_archive_export_store = __esm({
    "src/shared/archive_export_store.ts"() {
      "use strict";
      DB_NAME2 = "trackpull-archive-export";
      DB_VERSION = 1;
      JOB_STORE = "jobs";
      ITEM_STORE = "items";
      SESSION_STORE = "sessions";
      FAILURE_STORE = "failures";
      JOB_INDEX = "jobId";
      ACTIVITY_INDEX = "activityId";
      STATUS_INDEX = "status";
    }
  });

  // src/shared/runtime_messages.ts
  var RUNTIME_MESSAGE_TYPES;
  var init_runtime_messages = __esm({
    "src/shared/runtime_messages.ts"() {
      "use strict";
      RUNTIME_MESSAGE_TYPES = {
        SAVE_DATA: "SAVE_DATA",
        EXPORT_CSV_REQUEST: "EXPORT_CSV_REQUEST",
        SAVE_IMPORTED_SESSION: "SAVE_IMPORTED_SESSION",
        SAVE_BULK_IMPORTED_SESSION: "SAVE_BULK_IMPORTED_SESSION",
        SAVE_ARCHIVE_EXPORTED_SESSION: "SAVE_ARCHIVE_EXPORTED_SESSION",
        PORTAL_GRAPHQL_FETCH: "PORTAL_GRAPHQL_FETCH",
        HISTORY_ERROR: "HISTORY_ERROR",
        DATA_UPDATED: "DATA_UPDATED"
      };
    }
  });

  // src/shared/portalPermissions.ts
  async function hasPortalPermission() {
    return chrome.permissions.contains({ origins: [...PORTAL_ORIGINS] });
  }
  async function requestPortalPermission() {
    return chrome.permissions.request({ origins: [...PORTAL_ORIGINS] });
  }
  var PORTAL_ORIGINS;
  var init_portalPermissions = __esm({
    "src/shared/portalPermissions.ts"() {
      "use strict";
      PORTAL_ORIGINS = [
        "https://api.trackmangolf.com/*",
        "https://portal.trackmangolf.com/*"
      ];
    }
  });

  // src/options/options.ts
  var require_options = __commonJS({
    "src/options/options.ts"() {
      init_prompt_types();
      init_custom_prompts();
      init_bulk_import_store();
      init_constants();
      init_import_types();
      init_archive_builder();
      init_archive_export_store();
      init_runtime_messages();
      init_portalPermissions();
      init_unit_normalization();
      var editingPromptId = null;
      document.addEventListener("DOMContentLoaded", async () => {
        renderBuiltInPrompts();
        await renderCustomPrompts();
        setupNewPromptForm();
        setupPrivacyActions();
        await restoreAiPreference();
        await setupPortalArchiveExport();
      });
      function renderBuiltInPrompts() {
        const container = document.getElementById("builtin-prompts-list");
        if (!container) return;
        container.innerHTML = "";
        for (const prompt of BUILTIN_PROMPTS) {
          const item = document.createElement("div");
          item.className = "builtin-prompt-item";
          const nameSpan = document.createElement("span");
          nameSpan.className = "prompt-name";
          nameSpan.textContent = prompt.name;
          const tierBadge = document.createElement("span");
          tierBadge.className = `tier-badge ${prompt.tier}`;
          tierBadge.textContent = prompt.tier.charAt(0).toUpperCase() + prompt.tier.slice(1);
          item.appendChild(nameSpan);
          item.appendChild(tierBadge);
          container.appendChild(item);
        }
      }
      async function renderCustomPrompts() {
        const container = document.getElementById("custom-prompts-list");
        if (!container) return;
        container.innerHTML = "";
        const prompts = await loadCustomPrompts();
        if (prompts.length === 0) {
          const empty = document.createElement("p");
          empty.className = "no-custom-prompts";
          empty.textContent = "No custom prompts yet.";
          container.appendChild(empty);
          return;
        }
        for (const prompt of prompts) {
          const item = document.createElement("div");
          item.className = "custom-prompt-item";
          const nameSpan = document.createElement("span");
          nameSpan.className = "custom-prompt-name";
          nameSpan.textContent = prompt.name;
          const actions = document.createElement("div");
          actions.className = "custom-prompt-actions";
          const editBtn = document.createElement("button");
          editBtn.className = "btn-action";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => openEditForm(prompt));
          const deleteBtn = document.createElement("button");
          deleteBtn.className = "btn-action delete";
          deleteBtn.textContent = "Delete";
          deleteBtn.addEventListener("click", async () => {
            if (!window.confirm("Delete this prompt?")) return;
            try {
              await deleteCustomPrompt(prompt.id);
              await renderCustomPrompts();
              showToast("Prompt deleted.", "success");
            } catch {
              showToast("Failed to delete prompt.", "error");
            }
          });
          actions.appendChild(editBtn);
          actions.appendChild(deleteBtn);
          item.appendChild(nameSpan);
          item.appendChild(actions);
          container.appendChild(item);
        }
      }
      function openEditForm(prompt) {
        editingPromptId = prompt.id;
        const nameInput = document.getElementById("prompt-name-input");
        const templateInput = document.getElementById("prompt-template-input");
        const form = document.getElementById("prompt-form");
        const newPromptBtn = document.getElementById("new-prompt-btn");
        if (nameInput) nameInput.value = prompt.name;
        if (templateInput) templateInput.value = prompt.template;
        setTemplateError(null);
        if (form) form.style.display = "block";
        if (newPromptBtn) newPromptBtn.style.display = "none";
      }
      function setTemplateError(message) {
        const templateInput = document.getElementById("prompt-template-input");
        const errorElement = document.getElementById("prompt-template-error");
        if (!templateInput || !errorElement) return;
        templateInput.setCustomValidity(message ?? "");
        if (message === null) {
          templateInput.removeAttribute("aria-invalid");
        } else {
          templateInput.setAttribute("aria-invalid", "true");
        }
        errorElement.textContent = message ?? "";
      }
      function setupNewPromptForm() {
        const newPromptBtn = document.getElementById("new-prompt-btn");
        const form = document.getElementById("prompt-form");
        const saveBtn = document.getElementById("save-prompt-btn");
        const cancelBtn = document.getElementById("cancel-prompt-btn");
        const nameInput = document.getElementById("prompt-name-input");
        const templateInput = document.getElementById("prompt-template-input");
        if (!newPromptBtn || !form || !saveBtn || !cancelBtn || !nameInput || !templateInput) return;
        newPromptBtn.addEventListener("click", () => {
          editingPromptId = null;
          nameInput.value = "";
          templateInput.value = "";
          setTemplateError(null);
          form.style.display = "block";
          newPromptBtn.style.display = "none";
          nameInput.focus();
        });
        cancelBtn.addEventListener("click", () => {
          editingPromptId = null;
          nameInput.value = "";
          templateInput.value = "";
          setTemplateError(null);
          form.style.display = "none";
          newPromptBtn.style.display = "inline-flex";
        });
        templateInput.addEventListener("input", () => {
          if (templateInput.validationMessage === CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR) {
            setTemplateError(validateCustomPromptTemplate(templateInput.value.trim()));
          }
        });
        saveBtn.addEventListener("click", async () => {
          const nameValue = nameInput.value.trim();
          const templateValue = templateInput.value.trim();
          if (!nameValue) {
            showToast("Prompt name is required.", "error");
            nameInput.focus();
            return;
          }
          if (!templateValue) {
            showToast("Template is required.", "error");
            templateInput.focus();
            return;
          }
          const templateError = validateCustomPromptTemplate(templateValue);
          if (templateError) {
            setTemplateError(templateError);
            showToast(templateError, "error");
            templateInput.focus();
            return;
          }
          setTemplateError(null);
          const id = editingPromptId ?? crypto.randomUUID();
          const prompt = { id, name: nameValue, template: templateValue };
          try {
            await saveCustomPrompt(prompt);
            showToast(editingPromptId ? "Prompt updated." : "Prompt saved.", "success");
            editingPromptId = null;
            nameInput.value = "";
            templateInput.value = "";
            setTemplateError(null);
            form.style.display = "none";
            newPromptBtn.style.display = "inline-flex";
            await renderCustomPrompts();
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("QUOTA_BYTES")) {
              showToast("Storage full. Delete prompts to save new ones.", "error");
            } else if (message === CUSTOM_PROMPT_DATA_PLACEHOLDER_ERROR) {
              setTemplateError(message);
              showToast(message, "error");
              templateInput.focus();
            } else {
              showToast("Failed to save prompt. Please try again.", "error");
            }
          }
        });
      }
      function removeFromStorage(area, keys) {
        const { promise, resolve, reject } = Promise.withResolvers();
        area.remove(keys, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
        return promise;
      }
      async function clearAllTrackPullData() {
        const customPrompts = await loadCustomPrompts();
        const customPromptKeys = customPrompts.map((prompt) => CUSTOM_PROMPT_KEY_PREFIX + prompt.id);
        const localKeys = Object.values(STORAGE_KEYS);
        const syncKeys = [STORAGE_KEYS.AI_SERVICE, CUSTOM_PROMPT_IDS_KEY, ...customPromptKeys];
        await Promise.all([
          removeFromStorage(chrome.storage.local, localKeys),
          removeFromStorage(chrome.storage.sync, syncKeys),
          clearAllBulkImportedSessions(),
          clearAllArchiveExports()
        ]);
      }
      function resetPromptForm() {
        const form = document.getElementById("prompt-form");
        const newPromptBtn = document.getElementById("new-prompt-btn");
        const nameInput = document.getElementById("prompt-name-input");
        const templateInput = document.getElementById("prompt-template-input");
        editingPromptId = null;
        if (nameInput) nameInput.value = "";
        if (templateInput) templateInput.value = "";
        setTemplateError(null);
        if (form) form.style.display = "none";
        if (newPromptBtn) newPromptBtn.style.display = "inline-flex";
      }
      function setupPrivacyActions() {
        const clearAllBtn = document.getElementById("clear-all-data-btn");
        if (!clearAllBtn) return;
        clearAllBtn.addEventListener("click", async () => {
          const confirmed = window.confirm(
            "Clear all TrackPull data from this browser, including current session, history, bulk imports, portal archive exports, preferences, and custom prompts?"
          );
          if (!confirmed) return;
          clearAllBtn.disabled = true;
          try {
            await clearAllTrackPullData();
            resetPromptForm();
            await renderCustomPrompts();
            await restoreAiPreference();
            showToast("All TrackPull data cleared.", "success");
          } catch (err) {
            console.error("Failed to clear TrackPull data:", err);
            showToast("Failed to clear all TrackPull data.", "error");
          } finally {
            clearAllBtn.disabled = false;
          }
        });
      }
      async function restoreAiPreference() {
        const select = document.getElementById("options-ai-service");
        if (!select) return;
        const result = await chrome.storage.sync.get([STORAGE_KEYS.AI_SERVICE]);
        const savedService = result[STORAGE_KEYS.AI_SERVICE];
        select.value = savedService ?? "ChatGPT";
        select.onchange = () => {
          chrome.storage.sync.set({ [STORAGE_KEYS.AI_SERVICE]: select.value });
        };
      }
      var PORTAL_ARCHIVE_THROTTLE_MS = 500;
      var PORTAL_URL_PATTERN = "https://portal.trackmangolf.com/*";
      var PORTAL_HOME_URL = "https://portal.trackmangolf.com/player/activities";
      var activePortalArchiveJob = null;
      var portalArchiveRunning = false;
      var portalArchivePauseRequested = false;
      var portalArchiveCancelRequested = false;
      function isRecord(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
      }
      function wait(ms) {
        const { promise, resolve } = Promise.withResolvers();
        setTimeout(resolve, ms);
        return promise;
      }
      function isPortalAuthMessage(message) {
        const normalized = message.toLowerCase();
        return normalized.includes("unauthorized") || normalized.includes("not authorized") || normalized.includes("unauthenticated") || normalized.includes("not logged in");
      }
      function isPortalBridgeUnavailableMessage(message) {
        const normalized = message.toLowerCase();
        return normalized.includes("could not establish connection") || normalized.includes("receiving end does not exist");
      }
      function formatPortalArchiveError(message) {
        if (isPortalBridgeUnavailableMessage(message)) {
          return "Refresh the Trackman Portal tab, then return to settings.";
        }
        return isPortalAuthMessage(message) ? "Session expired \u2014 log into portal.trackmangolf.com, then resume." : message;
      }
      function getActivityType(record) {
        if (typeof record.__typename === "string") return record.__typename;
        if (typeof record.type === "string") return record.type;
        if (typeof record.kind === "string") return record.kind;
        return null;
      }
      function getCourseName(record) {
        const course = record.course;
        if (!isRecord(course)) return null;
        if (typeof course.displayName === "string" && course.displayName.trim()) {
          return course.displayName;
        }
        if (typeof course.name === "string" && course.name.trim()) {
          return course.name;
        }
        return null;
      }
      function normalizePortalArchiveRecord(value) {
        if (!isRecord(value) || typeof value.id !== "string") return null;
        const rawDate = value.time ?? value.date;
        const rawType = getActivityType(value);
        const rawKind = typeof value.kind === "string" ? value.kind : null;
        const supportedType = isSupportedPortalActivityType(rawType) ? rawType : isSupportedPortalActivityType(rawKind) ? rawKind : null;
        return {
          id: value.id,
          date: typeof rawDate === "string" ? rawDate : "",
          strokeCount: typeof value.strokeCount === "number" ? value.strokeCount : null,
          type: supportedType ?? rawType ?? rawKind,
          courseName: getCourseName(value),
          unsupportedReason: supportedType ? void 0 : "Unsupported portal activity type"
        };
      }
      function extractPortalActivityPage(data) {
        const emptyPage = {
          records: [],
          itemCount: 0,
          totalCount: null,
          hasNextPage: null
        };
        if (!isRecord(data)) return emptyPage;
        const me = isRecord(data.me) ? data.me : void 0;
        const roots = [me?.activities, data.activities];
        for (const root of roots) {
          let candidates = [];
          let totalCount = null;
          let hasNextPage = null;
          if (Array.isArray(root)) {
            candidates = root;
          } else if (isRecord(root)) {
            totalCount = typeof root.totalCount === "number" ? root.totalCount : null;
            if (isRecord(root.pageInfo) && typeof root.pageInfo.hasNextPage === "boolean") {
              hasNextPage = root.pageInfo.hasNextPage;
            }
            if (Array.isArray(root.items)) {
              candidates = root.items;
            } else if (Array.isArray(root.nodes)) {
              candidates = root.nodes;
            } else if (Array.isArray(root.edges)) {
              candidates = root.edges.map((edge) => isRecord(edge) ? edge.node : null);
            }
          }
          if (candidates.length > 0 || totalCount !== null || hasNextPage !== null) {
            return {
              records: candidates.map(normalizePortalArchiveRecord).filter((activity) => Boolean(activity)),
              itemCount: candidates.length,
              totalCount,
              hasNextPage
            };
          }
        }
        return emptyPage;
      }
      async function sendPortalGraphQL(tabId, candidate, variables) {
        return chrome.tabs.sendMessage(tabId, {
          type: RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH,
          query: candidate.query,
          variables
        });
      }
      function responseContainsMeasurement(value) {
        if (Array.isArray(value)) return value.some(responseContainsMeasurement);
        if (!isRecord(value)) return false;
        if (value.measurement || value.Measurement || value.NormalizedMeasurement) {
          return true;
        }
        return Object.entries(value).some(([key, nested]) => {
          if (key === "measurement" || key === "Measurement" || key === "NormalizedMeasurement") {
            return false;
          }
          return responseContainsMeasurement(nested);
        });
      }
      async function fetchPortalActivityPayloads(tabId, activityId) {
        const payloads = [];
        let firstError;
        for (const candidate of IMPORT_SESSION_QUERY_CANDIDATES) {
          const response = await chrome.tabs.sendMessage(tabId, {
            type: RUNTIME_MESSAGE_TYPES.PORTAL_GRAPHQL_FETCH,
            query: candidate.query,
            variables: { id: activityId }
          });
          if (!response?.success) {
            firstError = firstError ?? response?.error ?? "Failed to fetch activity";
            continue;
          }
          const graphQLErrors = response.data?.errors ?? [];
          if (graphQLErrors.length > 0) {
            firstError = firstError ?? graphQLErrors[0].message;
            continue;
          }
          if (response.data) {
            payloads.push(response.data);
            if (responseContainsMeasurement(response.data.data?.node)) {
              break;
            }
          }
        }
        if (payloads.length === 0) {
          throw new Error(formatPortalArchiveError(firstError ?? "Failed to fetch activity"));
        }
        return payloads;
      }
      function appendPortalActivities(supported, unsupported, records) {
        for (const record of records) {
          if (record.unsupportedReason) {
            if (!unsupported.has(record.id)) unsupported.set(record.id, record);
          } else if (!supported.has(record.id)) {
            supported.set(record.id, record);
          }
        }
      }
      async function fetchPortalArchiveActivitiesForCandidate(tabId, candidate) {
        const supported = /* @__PURE__ */ new Map();
        const unsupported = /* @__PURE__ */ new Map();
        if (!candidate.paginated) {
          const response = await sendPortalGraphQL(tabId, candidate);
          if (!response?.success) return { supported: [], unsupported: [], error: response?.error ?? "Failed to fetch activities" };
          const graphQLErrors = response.data?.errors ?? [];
          if (graphQLErrors.length > 0) return { supported: [], unsupported: [], error: graphQLErrors[0].message };
          appendPortalActivities(supported, unsupported, extractPortalActivityPage(response.data?.data).records);
          return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
        }
        let skip = 0;
        for (let page = 0; page < FETCH_ACTIVITIES_MAX_PAGES; page += 1) {
          const response = await sendPortalGraphQL(tabId, candidate, {
            skip,
            take: FETCH_ACTIVITIES_PAGE_SIZE
          });
          if (!response?.success) return { supported: [], unsupported: [], error: response?.error ?? "Failed to fetch activities" };
          const graphQLErrors = response.data?.errors ?? [];
          if (graphQLErrors.length > 0) return { supported: [], unsupported: [], error: graphQLErrors[0].message };
          const pageData = extractPortalActivityPage(response.data?.data);
          appendPortalActivities(supported, unsupported, pageData.records);
          const consumedCount = skip + pageData.itemCount;
          if (pageData.hasNextPage === false || pageData.itemCount === 0 || pageData.hasNextPage === null && pageData.itemCount < FETCH_ACTIVITIES_PAGE_SIZE || pageData.totalCount !== null && consumedCount >= pageData.totalCount) {
            return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
          }
          skip = consumedCount;
          await wait(PORTAL_ARCHIVE_THROTTLE_MS);
        }
        return { supported: [...supported.values()], unsupported: [...unsupported.values()] };
      }
      async function fetchPortalArchiveActivities(tabId) {
        const allPageCandidate = FETCH_ACTIVITIES_QUERY_CANDIDATES.find((candidate) => candidate.label.includes("all-page"));
        const orderedCandidates = [
          ...allPageCandidate ? [allPageCandidate] : [],
          ...FETCH_ACTIVITIES_QUERY_CANDIDATES.filter((candidate) => candidate !== allPageCandidate)
        ];
        let firstError;
        for (const candidate of orderedCandidates) {
          const result = await fetchPortalArchiveActivitiesForCandidate(tabId, candidate);
          if (result.error) {
            firstError = firstError ?? result.error;
            continue;
          }
          return { supported: result.supported, unsupported: result.unsupported };
        }
        throw new Error(formatPortalArchiveError(firstError ?? "No activities found"));
      }
      function getArchiveItemDetail(activity) {
        if (activity.courseName?.trim()) return activity.courseName.trim();
        return activity.strokeCount === null ? "" : `${activity.strokeCount} shots`;
      }
      function createPortalArchiveJob(supported, unsupportedItems, now = Date.now()) {
        const items = supported.map((activity) => ({
          id: activity.id,
          date: activity.date,
          strokeCount: activity.strokeCount,
          type: activity.type,
          courseName: activity.courseName,
          status: "pending",
          detail: getArchiveItemDetail(activity)
        }));
        return {
          id: `archive-${now.toString(36)}`,
          createdAt: now,
          updatedAt: now,
          state: "idle",
          total: items.length,
          exported: 0,
          failed: 0,
          unsupported: unsupportedItems.length,
          items,
          unsupportedItems
        };
      }
      function recalculatePortalArchiveJob(job, now = Date.now()) {
        return {
          ...job,
          updatedAt: now,
          total: job.items.length,
          exported: job.items.filter((item) => item.status === "exported").length,
          failed: job.items.filter((item) => item.status === "failed").length,
          unsupported: job.unsupportedItems.length
        };
      }
      function toArchiveExportItem(item) {
        return {
          activityId: item.id,
          date: item.date,
          type: item.type,
          detail: item.detail,
          status: item.status === "importing" ? "exporting" : item.status,
          reportId: item.reportId,
          shotCount: item.shotCount,
          error: item.error,
          failureKind: item.status === "failed" ? "unknown" : void 0,
          updatedAt: item.updatedAt
        };
      }
      function toUnsupportedArchiveExportItem(item) {
        return {
          activityId: item.id,
          date: item.date,
          type: item.type,
          detail: getArchiveItemDetail(item),
          status: "unsupported",
          error: item.unsupportedReason ?? "Unsupported portal activity type",
          failureKind: "unsupported",
          unsupportedReason: item.type === null ? "missing-activity-type" : "unsupported-activity-type"
        };
      }
      function toArchiveExportJob(job) {
        const items = [
          ...job.items.map(toArchiveExportItem),
          ...job.unsupportedItems.map(toUnsupportedArchiveExportItem)
        ];
        const state = job.state === "scanning" ? "running" : job.state;
        return {
          id: job.id,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          state,
          total: items.length,
          pending: items.filter((item) => item.status === "pending").length,
          exported: items.filter((item) => item.status === "exported").length,
          failed: items.filter((item) => item.status === "failed").length,
          unsupported: items.filter((item) => item.status === "unsupported").length,
          currentActivityId: job.currentActivityId,
          lastError: job.lastError,
          items
        };
      }
      function recoverPortalArchiveJob(job) {
        if (job.state !== "running" && job.state !== "scanning" && !job.items.some((item) => item.status === "importing")) {
          return job;
        }
        return recalculatePortalArchiveJob({
          ...job,
          state: "paused",
          currentActivityId: void 0,
          items: job.items.map((item) => item.status === "importing" ? { ...item, status: "pending", updatedAt: Date.now() } : item),
          lastError: "Paused after settings was reopened."
        });
      }
      async function loadPortalArchiveJob() {
        const result = await chrome.storage.local.get([STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]);
        return result[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS] ?? null;
      }
      async function savePortalArchiveJob(job) {
        activePortalArchiveJob = job;
        if (job) {
          await chrome.storage.local.set({ [STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]: job });
          const archiveJob = toArchiveExportJob(job);
          await putArchiveExportJob(archiveJob);
          await Promise.all(archiveJob.items.map((item, sortIndex) => putArchiveExportItem(archiveJob.id, item, sortIndex)));
        } else {
          await chrome.storage.local.remove(STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS);
        }
        renderPortalArchiveJob(job);
      }
      function getNextPortalArchiveItem(job) {
        return job.items.find((item) => item.status === "pending") ?? null;
      }
      function updatePortalArchiveItem(job, activityId, patch, now = Date.now()) {
        const nextJob = recalculatePortalArchiveJob({
          ...job,
          items: job.items.map((item) => item.id === activityId ? { ...item, ...patch, updatedAt: now } : item),
          currentActivityId: patch.status === "importing" ? activityId : job.currentActivityId
        }, now);
        if (patch.status && patch.status !== "importing" && nextJob.currentActivityId === activityId) {
          return { ...nextJob, currentActivityId: void 0 };
        }
        return nextJob;
      }
      async function findPortalTab() {
        const tabs = await chrome.tabs.query({ url: PORTAL_URL_PATTERN });
        return tabs.find((tab) => typeof tab.id === "number") ?? null;
      }
      async function requirePortalTab() {
        let granted = await hasPortalPermission();
        if (!granted) {
          granted = await requestPortalPermission();
        }
        if (!granted) {
          showToast("Portal access is required before exporting.", "error");
          return null;
        }
        const tab = await findPortalTab();
        if (!tab) {
          chrome.tabs.create({ url: PORTAL_HOME_URL });
          showToast("Log into Trackman Portal, then return to settings.", "error");
          return null;
        }
        return tab;
      }
      function renderPortalArchiveJob(job = activePortalArchiveJob) {
        activePortalArchiveJob = job;
        const startBtn = document.getElementById("portal-archive-start-btn");
        const pauseBtn = document.getElementById("portal-archive-pause-btn");
        const resumeBtn = document.getElementById("portal-archive-resume-btn");
        const cancelBtn = document.getElementById("portal-archive-cancel-btn");
        const retryBtn = document.getElementById("portal-archive-retry-btn");
        const downloadBtn = document.getElementById("portal-archive-download-btn");
        const progressBar = document.getElementById("portal-archive-progress-bar");
        const progressTrack = document.querySelector(".portal-archive-progress-track");
        const progressText = document.getElementById("portal-archive-progress-text");
        const detail = document.getElementById("portal-archive-detail");
        const running = portalArchiveRunning || job?.state === "scanning" || job?.state === "running";
        if (startBtn) startBtn.disabled = running;
        if (pauseBtn) pauseBtn.disabled = !portalArchiveRunning || job?.state !== "running";
        if (resumeBtn) resumeBtn.disabled = portalArchiveRunning || job?.state !== "paused";
        if (cancelBtn) cancelBtn.disabled = !job || job.state === "complete" || job.state === "cancelled";
        if (retryBtn) retryBtn.disabled = portalArchiveRunning || !job || job.failed === 0;
        const artifactItemCount = job ? job.exported + job.failed + job.unsupported : 0;
        if (downloadBtn) downloadBtn.disabled = portalArchiveRunning || artifactItemCount === 0;
        const completed = job ? job.exported + job.failed : 0;
        const percent = job && job.total > 0 ? Math.round(completed / job.total * 100) : 0;
        if (progressBar) progressBar.style.width = `${percent}%`;
        if (progressTrack) progressTrack.setAttribute("aria-valuenow", String(percent));
        if (!job) {
          if (progressText) progressText.textContent = "No archive export has started.";
          if (detail) detail.textContent = "Open Trackman Portal in another tab before starting.";
          return;
        }
        const parts = [`${completed} / ${job.total} processed`, `${job.exported} exported`];
        if (job.failed > 0) parts.push(`${job.failed} failed`);
        if (job.unsupported > 0) parts.push(`${job.unsupported} unsupported skipped`);
        if (progressText) progressText.textContent = `${job.state}: ${parts.join(" | ")}`;
        if (detail) {
          const current = job.currentActivityId ? ` Current activity: ${job.currentActivityId}.` : "";
          detail.textContent = `${job.lastError ?? "CSV, manifest, and failure report artifacts are generated locally from saved snapshots."}${current}`;
        }
      }
      function saveBulkImportedArchiveSession(jobId, activityId, graphqlPayloads) {
        const { promise, resolve } = Promise.withResolvers();
        chrome.runtime.sendMessage({
          type: RUNTIME_MESSAGE_TYPES.SAVE_ARCHIVE_EXPORTED_SESSION,
          jobId,
          activityId,
          graphqlPayloads
        }, (response) => {
          if (chrome.runtime.lastError) {
            resolve({ success: false, error: chrome.runtime.lastError.message });
            return;
          }
          resolve(response ?? { success: false, error: "No response from service worker" });
        });
        return promise;
      }
      async function runPortalArchiveJob(tabId, startingJob) {
        if (portalArchiveRunning) return;
        portalArchiveRunning = true;
        portalArchivePauseRequested = false;
        portalArchiveCancelRequested = false;
        let job = recalculatePortalArchiveJob({
          ...startingJob,
          state: "running",
          lastError: void 0,
          completedAt: void 0
        });
        await savePortalArchiveJob(job);
        try {
          while (true) {
            if (portalArchiveCancelRequested) {
              job = recalculatePortalArchiveJob({ ...job, state: "cancelled", currentActivityId: void 0 });
              await savePortalArchiveJob(job);
              showToast("Portal archive export cancelled.", "success");
              break;
            }
            if (portalArchivePauseRequested) {
              job = recalculatePortalArchiveJob({
                ...job,
                state: "paused",
                currentActivityId: void 0,
                items: job.items.map((item) => item.status === "importing" ? { ...item, status: "pending", updatedAt: Date.now() } : item)
              });
              await savePortalArchiveJob(job);
              showToast("Portal archive export paused.", "success");
              break;
            }
            const nextItem = getNextPortalArchiveItem(job);
            if (!nextItem) {
              job = recalculatePortalArchiveJob({
                ...job,
                state: "complete",
                completedAt: Date.now(),
                currentActivityId: void 0
              });
              await savePortalArchiveJob(job);
              showToast(`Portal archive complete: ${job.exported} exported, ${job.failed} failed.`, job.failed ? "error" : "success");
              break;
            }
            job = updatePortalArchiveItem(job, nextItem.id, {
              status: "importing",
              error: void 0
            });
            await savePortalArchiveJob(job);
            try {
              const payloads = await fetchPortalActivityPayloads(tabId, nextItem.id);
              const result = await saveBulkImportedArchiveSession(job.id, nextItem.id, payloads);
              if (result.success && result.reportId) {
                job = updatePortalArchiveItem(job, nextItem.id, {
                  status: "exported",
                  reportId: result.reportId,
                  shotCount: result.shotCount,
                  error: void 0
                });
              } else {
                const message = formatPortalArchiveError(result.error ?? "Import failed");
                job = updatePortalArchiveItem(job, nextItem.id, {
                  status: "failed",
                  error: message
                });
                job = { ...job, lastError: message };
                if (isPortalAuthMessage(message)) {
                  job = recalculatePortalArchiveJob({ ...job, state: "paused", currentActivityId: void 0 });
                  await savePortalArchiveJob(job);
                  showToast(message, "error");
                  break;
                }
              }
            } catch (err) {
              const message = formatPortalArchiveError(err instanceof Error && err.message ? err.message : "Unable to fetch activity");
              job = updatePortalArchiveItem(job, nextItem.id, {
                status: "failed",
                error: message
              });
              job = { ...job, lastError: message };
              if (isPortalAuthMessage(message)) {
                job = recalculatePortalArchiveJob({ ...job, state: "paused", currentActivityId: void 0 });
                await savePortalArchiveJob(job);
                showToast(message, "error");
                break;
              }
            }
            await savePortalArchiveJob(job);
            await wait(PORTAL_ARCHIVE_THROTTLE_MS);
          }
        } finally {
          portalArchiveRunning = false;
          renderPortalArchiveJob(job);
        }
      }
      async function startPortalArchiveExport() {
        if (portalArchiveRunning) return;
        const tab = await requirePortalTab();
        if (!tab?.id) return;
        const previousJob = activePortalArchiveJob;
        let job = createPortalArchiveJob([], []);
        try {
          job = { ...job, state: "scanning", lastError: "Scanning visible portal activities..." };
          await savePortalArchiveJob(job);
          const scan = await fetchPortalArchiveActivities(tab.id);
          if (previousJob) {
            await clearArchiveExportJob(previousJob.id).catch((err) => {
              console.warn("Could not clear previous portal archive snapshots:", err);
            });
          }
          await clearArchiveExportJob(job.id).catch(() => void 0);
          job = createPortalArchiveJob(scan.supported, scan.unsupported);
          await clearArchiveExportJob(job.id).catch(() => void 0);
          await savePortalArchiveJob(job);
          if (job.total === 0) {
            job = recalculatePortalArchiveJob({
              ...job,
              state: "complete",
              completedAt: Date.now(),
              lastError: "No supported Course Play or Map My Bag sessions were found."
            });
            await savePortalArchiveJob(job);
            showToast("No supported portal sessions found.", "error");
            return;
          }
          await runPortalArchiveJob(tab.id, job);
        } catch (err) {
          const message = formatPortalArchiveError(err instanceof Error && err.message ? err.message : "Portal archive export failed");
          job = recalculatePortalArchiveJob({ ...job, state: "paused", lastError: message });
          await savePortalArchiveJob(job);
          showToast(message, "error");
        }
      }
      async function resumePortalArchiveExport() {
        if (!activePortalArchiveJob || portalArchiveRunning) return;
        const tab = await requirePortalTab();
        if (!tab?.id) return;
        await runPortalArchiveJob(tab.id, activePortalArchiveJob);
      }
      async function retryFailedPortalArchiveExport() {
        if (!activePortalArchiveJob || portalArchiveRunning) return;
        const retryJob = recalculatePortalArchiveJob({
          ...activePortalArchiveJob,
          state: "paused",
          lastError: void 0,
          items: activePortalArchiveJob.items.map((item) => item.status === "failed" ? { ...item, status: "pending", error: void 0, updatedAt: Date.now() } : item)
        });
        await savePortalArchiveJob(retryJob);
        await resumePortalArchiveExport();
      }
      async function cancelPortalArchiveExport() {
        if (!activePortalArchiveJob) return;
        if (portalArchiveRunning) {
          portalArchiveCancelRequested = true;
          return;
        }
        await savePortalArchiveJob(recalculatePortalArchiveJob({
          ...activePortalArchiveJob,
          state: "cancelled",
          currentActivityId: void 0
        }));
        showToast("Portal archive export cancelled.", "success");
      }
      async function readPortalArchiveExportPreferences() {
        const result = await chrome.storage.local.get([
          STORAGE_KEYS.SPEED_UNIT,
          STORAGE_KEYS.DISTANCE_UNIT,
          STORAGE_KEYS.HITTING_SURFACE,
          STORAGE_KEYS.INCLUDE_AVERAGES
        ]);
        const speed = result[STORAGE_KEYS.SPEED_UNIT] === "m/s" ? "m/s" : DEFAULT_UNIT_CHOICE.speed;
        const distance = result[STORAGE_KEYS.DISTANCE_UNIT] === "meters" ? "meters" : DEFAULT_UNIT_CHOICE.distance;
        const surface = result[STORAGE_KEYS.HITTING_SURFACE] === "Grass" ? "Grass" : "Mat";
        return {
          includeAverages: result[STORAGE_KEYS.INCLUDE_AVERAGES] === void 0 ? true : Boolean(result[STORAGE_KEYS.INCLUDE_AVERAGES]),
          unitChoice: { speed, distance },
          surface
        };
      }
      function downloadTextArtifact(filename, mimeType, content) {
        const { promise, resolve, reject } = Promise.withResolvers();
        chrome.downloads.download({
          url: `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`,
          filename,
          saveAs: false
        }, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
        return promise;
      }
      async function downloadPortalArchiveArtifacts() {
        const job = activePortalArchiveJob;
        if (!job || job.exported + job.failed + job.unsupported === 0) {
          showToast("No portal archive artifacts to download.", "error");
          return;
        }
        const button = document.getElementById("portal-archive-download-btn");
        if (button) button.disabled = true;
        try {
          const [sessions, failures, preferences] = await Promise.all([
            getArchiveExportSessions(job.id),
            getArchiveExportFailures(job.id),
            readPortalArchiveExportPreferences()
          ]);
          if (sessions.length === 0 && job.failed === 0 && job.unsupported === 0) {
            showToast("No saved portal archive snapshots found.", "error");
            return;
          }
          const stamp = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
          const outputs = buildArchiveExportOutputs({
            job: toArchiveExportJob(job),
            sessions,
            failures,
            options: {
              includeAverages: preferences.includeAverages,
              unitChoice: preferences.unitChoice,
              hittingSurface: preferences.surface,
              baseFilename: `TrackPull_PortalArchive_${stamp}`
            }
          });
          for (const file of outputs.files) {
            await downloadTextArtifact(file.filename, file.mimeType, file.contents);
          }
          showToast("Portal archive artifacts downloaded.", "success");
        } catch (err) {
          console.error("Portal archive artifact download failed:", err);
          showToast("Portal archive artifact download failed.", "error");
        } finally {
          if (button) button.disabled = false;
          renderPortalArchiveJob(activePortalArchiveJob);
        }
      }
      async function setupPortalArchiveExport() {
        const startBtn = document.getElementById("portal-archive-start-btn");
        const pauseBtn = document.getElementById("portal-archive-pause-btn");
        const resumeBtn = document.getElementById("portal-archive-resume-btn");
        const cancelBtn = document.getElementById("portal-archive-cancel-btn");
        const retryBtn = document.getElementById("portal-archive-retry-btn");
        const downloadBtn = document.getElementById("portal-archive-download-btn");
        const openPortalLink = document.getElementById("portal-archive-open-link");
        startBtn?.addEventListener("click", () => {
          void startPortalArchiveExport();
        });
        pauseBtn?.addEventListener("click", () => {
          portalArchivePauseRequested = true;
        });
        resumeBtn?.addEventListener("click", () => {
          void resumePortalArchiveExport();
        });
        cancelBtn?.addEventListener("click", () => {
          void cancelPortalArchiveExport();
        });
        retryBtn?.addEventListener("click", () => {
          void retryFailedPortalArchiveExport();
        });
        downloadBtn?.addEventListener("click", () => {
          void downloadPortalArchiveArtifacts();
        });
        openPortalLink?.addEventListener("click", (event) => {
          event.preventDefault();
          chrome.tabs.create({ url: PORTAL_HOME_URL });
        });
        chrome.storage.onChanged.addListener((changes, namespace) => {
          if (namespace !== "local" || !changes[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS]) return;
          renderPortalArchiveJob(changes[STORAGE_KEYS.PORTAL_ARCHIVE_EXPORT_STATUS].newValue ?? null);
        });
        const storedJob = await loadPortalArchiveJob();
        if (!storedJob) {
          renderPortalArchiveJob(null);
          return;
        }
        const recoveredJob = recoverPortalArchiveJob(storedJob);
        await savePortalArchiveJob(recoveredJob);
      }
      function showToast(message, type) {
        const container = document.getElementById("toast-container");
        if (!container) return;
        const existingToast = container.querySelector(".toast");
        if (existingToast) {
          existingToast.remove();
        }
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.setAttribute("role", type === "error" ? "alert" : "status");
        container.appendChild(toast);
        const duration = type === "error" ? 5e3 : 3e3;
        setTimeout(() => {
          if (toast.parentNode) {
            toast.classList.add("hiding");
            setTimeout(() => toast.remove(), 300);
          }
        }, duration);
      }
    }
  });
  require_options();
})();
