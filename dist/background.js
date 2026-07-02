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

  // src/shared/metric_catalog.ts
  var METRIC_COLUMN_ORDER, METRIC_DISPLAY_NAMES, GRAPHQL_METRIC_ALIAS, DISTANCE_METRICS, SMALL_DISTANCE_METRICS, MILLIMETER_METRICS, ANGLE_METRICS, SPEED_METRICS, FIXED_UNIT_LABELS;
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
      GRAPHQL_METRIC_ALIAS = {
        clubSpeed: "ClubSpeed",
        ballSpeed: "BallSpeed",
        smashFactor: "SmashFactor",
        attackAngle: "AttackAngle",
        clubPath: "ClubPath",
        faceAngle: "FaceAngle",
        faceToPath: "FaceToPath",
        swingDirection: "SwingDirection",
        swingPlane: "SwingPlane",
        dynamicLoft: "DynamicLoft",
        spinRate: "SpinRate",
        ballSpin: "SpinRate",
        spinAxis: "SpinAxis",
        spinLoft: "SpinLoft",
        launchAngle: "LaunchAngle",
        launchDirection: "LaunchDirection",
        carry: "Carry",
        total: "Total",
        side: "Side",
        sideTotal: "SideTotal",
        carrySide: "CarrySide",
        totalSide: "TotalSide",
        height: "Height",
        maxHeight: "MaxHeight",
        curve: "Curve",
        landingAngle: "LandingAngle",
        hangTime: "HangTime",
        lowPointDistance: "LowPointDistance",
        impactHeight: "ImpactHeight",
        impactOffset: "ImpactOffset",
        tempo: "Tempo"
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
  var STORAGE_KEYS;
  var init_constants = __esm({
    "src/shared/constants.ts"() {
      "use strict";
      init_metric_catalog();
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

  // src/shared/unit_normalization.ts
  function migrateLegacyPref(stored) {
    switch (stored) {
      case "metric":
        return { speed: "m/s", distance: "meters" };
      case "hybrid":
        return { speed: "mph", distance: "meters" };
      case "imperial":
      default:
        return { speed: "mph", distance: "yards" };
    }
  }
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
  function writeCsv(session, includeAverages = true, metricOrder, unitChoice = DEFAULT_UNIT_CHOICE, hittingSurface) {
    const orderedMetrics = orderMetricsByPriority(
      session.metric_names,
      metricOrder ?? METRIC_COLUMN_ORDER
    );
    const headerRow = ["Date", "Club"];
    if (hasTags(session)) {
      headerRow.push("Tag");
    }
    headerRow.push("Shot #", "Type");
    for (const metric of orderedMetrics) {
      headerRow.push(getColumnName(metric, unitChoice));
    }
    const rows = [];
    const unitSystem = getApiSourceUnitSystem(session.metadata_params);
    for (const club of session.club_groups) {
      for (const shot of club.shots) {
        const row = {
          Date: neutralizeSpreadsheetFormula(session.date),
          Club: neutralizeSpreadsheetFormula(club.club_name),
          "Shot #": String(shot.shot_number + 1),
          Type: "Shot"
        };
        if (hasTags(session)) {
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
            Date: neutralizeSpreadsheetFormula(session.date),
            Club: neutralizeSpreadsheetFormula(club.club_name),
            "Shot #": "",
            Type: "Average"
          };
          if (hasTags(session)) {
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

  // src/shared/history.ts
  function createSnapshot(session) {
    const { raw_api_data: _, ...snapshot } = session;
    return snapshot;
  }
  function saveSessionToHistory(session) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(
        [STORAGE_KEYS.SESSION_HISTORY],
        (result) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          const existing = result[STORAGE_KEYS.SESSION_HISTORY] ?? [];
          const filtered = existing.filter(
            (entry) => entry.snapshot.report_id !== session.report_id
          );
          const newEntry = {
            captured_at: Date.now(),
            snapshot: createSnapshot(session)
          };
          filtered.push(newEntry);
          filtered.sort((a, b) => b.captured_at - a.captured_at);
          const capped = filtered.slice(0, MAX_SESSIONS);
          chrome.storage.local.set(
            { [STORAGE_KEYS.SESSION_HISTORY]: capped },
            () => {
              if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError.message));
              }
              resolve();
            }
          );
        }
      );
    });
  }
  function getHistoryErrorMessage(error) {
    if (/QUOTA_BYTES|quota/i.test(error)) {
      return "Storage full -- oldest sessions will be cleared";
    }
    return "Could not save to session history";
  }
  var MAX_SESSIONS;
  var init_history = __esm({
    "src/shared/history.ts"() {
      "use strict";
      init_constants();
      MAX_SESSIONS = 20;
    }
  });

  // src/shared/portal_parser.ts
  function toPascalCase(key) {
    return key.charAt(0).toUpperCase() + key.slice(1);
  }
  function normalizeMetricKey(graphqlKey) {
    return GRAPHQL_METRIC_ALIAS[graphqlKey] ?? toPascalCase(graphqlKey);
  }
  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function pickClubName(value) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (!isRecord(value)) return null;
    const candidate = value.name ?? value.Name ?? value.displayName ?? value.shortName ?? value.id;
    return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null;
  }
  function getContainerClubName(container) {
    return pickClubName(container.club) ?? pickClubName(container.Club) ?? pickClubName(container.clubName) ?? pickClubName(container.name);
  }
  function getStrokeMeasurement(stroke) {
    const normalized = isRecord(stroke.NormalizedMeasurement) ? stroke.NormalizedMeasurement : null;
    const measurement = isRecord(stroke.measurement) ? stroke.measurement : isRecord(stroke.Measurement) ? stroke.Measurement : null;
    if (measurement && normalized) {
      return { ...measurement, ...normalized };
    }
    return normalized ?? measurement;
  }
  function appendStroke(stroke, fallbackClub, clubMap, allMetricNames) {
    if (stroke.isDeleted === true || stroke.isSimulated === true) return;
    const measurement = getStrokeMeasurement(stroke);
    if (!measurement) return;
    const clubName = getContainerClubName(stroke) ?? fallbackClub ?? "Unknown";
    const shotMetrics = {};
    for (const [key, value] of Object.entries(measurement)) {
      if (value === null || value === void 0) continue;
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (isNaN(numValue)) continue;
      const normalizedKey = normalizeMetricKey(key);
      shotMetrics[normalizedKey] = `${numValue}`;
      allMetricNames.add(normalizedKey);
    }
    if (Object.keys(shotMetrics).length === 0) return;
    const shots = clubMap.get(clubName) ?? [];
    shots.push({
      shot_number: shots.length,
      metrics: shotMetrics
    });
    clubMap.set(clubName, shots);
  }
  function collectStrokes(value, fallbackClub, clubMap, allMetricNames) {
    if (Array.isArray(value)) {
      for (const item of value) {
        collectStrokes(item, fallbackClub, clubMap, allMetricNames);
      }
      return;
    }
    if (!isRecord(value)) return;
    const containerClub = getContainerClubName(value) ?? fallbackClub;
    if (getStrokeMeasurement(value)) {
      appendStroke(value, containerClub, clubMap, allMetricNames);
      return;
    }
    for (const [key, nested] of Object.entries(value)) {
      if (key === "measurement" || key === "Measurement" || key === "NormalizedMeasurement") {
        continue;
      }
      if (Array.isArray(nested) || isRecord(nested)) {
        collectStrokes(nested, containerClub, clubMap, allMetricNames);
      }
    }
  }
  function extractActivityUuid(base64Id) {
    try {
      const decoded = atob(base64Id);
      const parts = decoded.split("\n");
      const uuid = parts[1]?.trim();
      if (!uuid) return base64Id;
      return uuid;
    } catch {
      return base64Id;
    }
  }
  function parsePortalActivity(activity) {
    try {
      if (!activity?.id) return null;
      const reportId = extractActivityUuid(activity.id);
      const date = activity.time ?? activity.date ?? "Unknown";
      const allMetricNames = /* @__PURE__ */ new Set();
      const clubMap = /* @__PURE__ */ new Map();
      collectStrokes(activity, null, clubMap, allMetricNames);
      if (clubMap.size === 0) return null;
      const club_groups = [];
      for (const [clubName, shots] of clubMap) {
        club_groups.push({
          club_name: clubName,
          shots,
          averages: {},
          consistency: {}
        });
      }
      const session = {
        date,
        report_id: reportId,
        url_type: "activity",
        club_groups,
        metric_names: Array.from(allMetricNames).sort(),
        metadata_params: {
          activity_id: activity.id,
          ...activity.__typename ? { activity_type: activity.__typename } : {},
          ...activity.kind ? { activity_kind: activity.kind } : {}
        }
      };
      return session;
    } catch (err) {
      console.error("[portal_parser] Failed to parse activity:", err);
      return null;
    }
  }
  var init_portal_parser = __esm({
    "src/shared/portal_parser.ts"() {
      "use strict";
      init_metric_catalog();
    }
  });

  // src/shared/bulk_import_store.ts
  function createSnapshot2(session) {
    const { raw_api_data: _, ...snapshot } = session;
    return snapshot;
  }
  function getSessionKey(jobId, reportId) {
    return `${jobId}:${reportId}`;
  }
  function openBulkImportDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(SESSION_STORE)) {
          const store = db.createObjectStore(SESSION_STORE, { keyPath: "key" });
          store.createIndex(JOB_INDEX, JOB_INDEX, { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Could not open bulk import store"));
      request.onblocked = () => reject(new Error("Bulk import store is blocked by another tab"));
    });
  }
  async function putBulkImportedSession(jobId, activityId, session, now = Date.now()) {
    const db = await openBulkImportDb();
    try {
      const tx = db.transaction(SESSION_STORE, "readwrite");
      const store = tx.objectStore(SESSION_STORE);
      const record = {
        key: getSessionKey(jobId, session.report_id),
        jobId,
        activityId,
        reportId: session.report_id,
        capturedAt: now,
        snapshot: createSnapshot2(session)
      };
      store.put(record);
      await new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Could not save imported session"));
        tx.onabort = () => reject(tx.error ?? new Error("Could not save imported session"));
      });
    } finally {
      db.close();
    }
  }
  var DB_NAME, DB_VERSION, SESSION_STORE, JOB_INDEX;
  var init_bulk_import_store = __esm({
    "src/shared/bulk_import_store.ts"() {
      "use strict";
      DB_NAME = "trackpull-bulk-import";
      DB_VERSION = 1;
      SESSION_STORE = "sessions";
      JOB_INDEX = "jobId";
    }
  });

  // src/shared/archive_export_store.ts
  function createSnapshot3(session) {
    const { raw_api_data: _rawApiData, ...snapshot } = session;
    return snapshot;
  }
  function openArchiveExportDb() {
    const { promise, resolve, reject } = Promise.withResolvers();
    const request = indexedDB.open(DB_NAME2, DB_VERSION2);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(JOB_STORE)) {
        db.createObjectStore(JOB_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        const store = db.createObjectStore(ITEM_STORE, { keyPath: "key" });
        store.createIndex(JOB_INDEX2, JOB_INDEX2, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
        store.createIndex(STATUS_INDEX, STATUS_INDEX, { unique: false });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE2)) {
        const store = db.createObjectStore(SESSION_STORE2, { keyPath: "key" });
        store.createIndex(JOB_INDEX2, JOB_INDEX2, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
      }
      if (!db.objectStoreNames.contains(FAILURE_STORE)) {
        const store = db.createObjectStore(FAILURE_STORE, { keyPath: "key" });
        store.createIndex(JOB_INDEX2, JOB_INDEX2, { unique: false });
        store.createIndex(ACTIVITY_INDEX, ACTIVITY_INDEX, { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open archive export store"));
    request.onblocked = () => reject(new Error("Archive export store is blocked by another tab"));
    return promise;
  }
  function transactionDone(tx, message) {
    const { promise, resolve, reject } = Promise.withResolvers();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error(message));
    tx.onabort = () => reject(tx.error ?? new Error(message));
    return promise;
  }
  function sessionKey(jobId, reportId) {
    return `${jobId}:session:${reportId}`;
  }
  async function putArchiveExportSession(jobId, activityId, session, now = Date.now()) {
    const snapshot = createSnapshot3(session);
    const db = await openArchiveExportDb();
    try {
      const tx = db.transaction(SESSION_STORE2, "readwrite");
      const record = {
        key: sessionKey(jobId, snapshot.report_id),
        jobId,
        activityId,
        reportId: snapshot.report_id,
        capturedAt: now,
        snapshot
      };
      tx.objectStore(SESSION_STORE2).put(record);
      await transactionDone(tx, "Could not save archive export session");
    } finally {
      db.close();
    }
  }
  var DB_NAME2, DB_VERSION2, JOB_STORE, ITEM_STORE, SESSION_STORE2, FAILURE_STORE, JOB_INDEX2, ACTIVITY_INDEX, STATUS_INDEX;
  var init_archive_export_store = __esm({
    "src/shared/archive_export_store.ts"() {
      "use strict";
      DB_NAME2 = "trackpull-archive-export";
      DB_VERSION2 = 1;
      JOB_STORE = "jobs";
      ITEM_STORE = "items";
      SESSION_STORE2 = "sessions";
      FAILURE_STORE = "failures";
      JOB_INDEX2 = "jobId";
      ACTIVITY_INDEX = "activityId";
      STATUS_INDEX = "status";
    }
  });

  // src/shared/runtime_messages.ts
  function isRecord2(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function isStringRecord(value) {
    return isRecord2(value) && Object.values(value).every((entry) => typeof entry === "string");
  }
  function isMinimalClubGroup(value) {
    if (!isRecord2(value)) return false;
    return typeof value.club_name === "string" && Array.isArray(value.shots) && isRecord2(value.averages) && isRecord2(value.consistency);
  }
  function isMinimalSessionData(value) {
    if (!isRecord2(value)) return false;
    return typeof value.date === "string" && typeof value.report_id === "string" && (value.url_type === "report" || value.url_type === "activity") && Array.isArray(value.club_groups) && value.club_groups.every(isMinimalClubGroup) && Array.isArray(value.metric_names) && value.metric_names.every((metric) => typeof metric === "string") && isStringRecord(value.metadata_params);
  }
  function originFromUrl(urlValue) {
    if (!urlValue) return null;
    try {
      return new URL(urlValue).origin;
    } catch {
      return null;
    }
  }
  function isAllowedReportOrigin(origin) {
    return originFromUrl(origin) === REPORT_PAGE_ORIGIN;
  }
  function isAllowedReportRuntimeSender(sender) {
    const senderWithOrigin = sender;
    return isAllowedReportOrigin(senderWithOrigin.origin) || isAllowedReportOrigin(sender.url) || isAllowedReportOrigin(sender.tab?.url);
  }
  var REPORT_PAGE_ORIGIN, RUNTIME_MESSAGE_TYPES;
  var init_runtime_messages = __esm({
    "src/shared/runtime_messages.ts"() {
      "use strict";
      REPORT_PAGE_ORIGIN = "https://web-dynamic-reports.trackmangolf.com";
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

  // src/background/serviceWorker.ts
  var require_serviceWorker = __commonJS({
    "src/background/serviceWorker.ts"() {
      init_constants();
      init_csv_writer();
      init_unit_normalization();
      init_history();
      init_portal_parser();
      init_bulk_import_store();
      init_archive_export_store();
      init_runtime_messages();
      chrome.runtime.onInstalled.addListener(() => {
        console.log("TrackPull extension installed");
      });
      function getDownloadErrorMessage(originalError) {
        if (originalError.includes("invalid")) {
          return "Invalid download format";
        }
        if (originalError.includes("quota") || originalError.includes("space")) {
          return "Insufficient storage space";
        }
        if (originalError.includes("blocked") || originalError.includes("policy")) {
          return "Download blocked by browser settings";
        }
        return originalError;
      }
      function parseImportedSession(payloads) {
        for (const payload of payloads) {
          if (payload.errors && payload.errors.length > 0) continue;
          const activity = payload.data?.node;
          const session = activity ? parsePortalActivity(activity) : null;
          if (session) return session;
        }
        return null;
      }
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === RUNTIME_MESSAGE_TYPES.SAVE_DATA) {
          const sessionData = message.data;
          if (!isAllowedReportRuntimeSender(sender)) {
            sendResponse({ success: false, error: "Untrusted report page sender" });
            return false;
          }
          if (!isMinimalSessionData(sessionData)) {
            sendResponse({ success: false, error: "Invalid session data" });
            return false;
          }
          chrome.storage.local.set({ [STORAGE_KEYS.TRACKMAN_DATA]: sessionData }, () => {
            if (chrome.runtime.lastError) {
              console.error("TrackPull: Failed to save data:", chrome.runtime.lastError);
              sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
              console.log("TrackPull: Session data saved to storage");
              sendResponse({ success: true });
              saveSessionToHistory(sessionData).catch((err) => {
                console.error("TrackPull: History save failed:", err);
                const msg = getHistoryErrorMessage(err.message);
                chrome.runtime.sendMessage({ type: RUNTIME_MESSAGE_TYPES.HISTORY_ERROR, error: msg }).catch(() => {
                });
              });
            }
          });
          return true;
        }
        if (message.type === RUNTIME_MESSAGE_TYPES.EXPORT_CSV_REQUEST) {
          chrome.storage.local.get([STORAGE_KEYS.TRACKMAN_DATA, STORAGE_KEYS.SPEED_UNIT, STORAGE_KEYS.DISTANCE_UNIT, STORAGE_KEYS.HITTING_SURFACE, STORAGE_KEYS.INCLUDE_AVERAGES, "unitPreference"], (result) => {
            const data = result[STORAGE_KEYS.TRACKMAN_DATA];
            if (!data || !data.club_groups || data.club_groups.length === 0) {
              sendResponse({ success: false, error: "No data to export" });
              return;
            }
            try {
              let unitChoice;
              if (result[STORAGE_KEYS.SPEED_UNIT] && result[STORAGE_KEYS.DISTANCE_UNIT]) {
                unitChoice = {
                  speed: result[STORAGE_KEYS.SPEED_UNIT],
                  distance: result[STORAGE_KEYS.DISTANCE_UNIT]
                };
              } else {
                unitChoice = migrateLegacyPref(result["unitPreference"]);
              }
              const surface = result[STORAGE_KEYS.HITTING_SURFACE] ?? "Mat";
              const includeAverages = result[STORAGE_KEYS.INCLUDE_AVERAGES] === void 0 ? true : Boolean(result[STORAGE_KEYS.INCLUDE_AVERAGES]);
              const csvContent = writeCsv(data, includeAverages, void 0, unitChoice, surface);
              const rawDate = data.date || "unknown";
              const safeDate = rawDate.replace(/[:.]/g, "-").replace(/[/\\?%*|"<>]/g, "");
              const filename = `ShotData_${safeDate}.csv`;
              chrome.downloads.download(
                {
                  url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
                  filename,
                  saveAs: false
                },
                (downloadId) => {
                  if (chrome.runtime.lastError) {
                    console.error("TrackPull: Download failed:", chrome.runtime.lastError);
                    const errorMessage = getDownloadErrorMessage(chrome.runtime.lastError.message ?? "Download failed");
                    sendResponse({ success: false, error: errorMessage });
                  } else {
                    console.log(`TrackPull: CSV exported with download ID ${downloadId}`);
                    sendResponse({ success: true, downloadId, filename });
                  }
                }
              );
            } catch (error) {
              console.error("TrackPull: CSV generation failed:", error);
              sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
            }
          });
          return true;
        }
        if (message.type === RUNTIME_MESSAGE_TYPES.SAVE_IMPORTED_SESSION) {
          const { graphqlData, graphqlPayloads } = message;
          sendResponse({ success: true });
          (async () => {
            await chrome.storage.local.set({ [STORAGE_KEYS.IMPORT_STATUS]: { state: "importing" } });
            try {
              const payloads = graphqlPayloads ?? (graphqlData ? [graphqlData] : []);
              const firstError = payloads.find((payload) => payload.errors && payload.errors.length > 0)?.errors?.[0];
              const hasPayloadWithoutErrors = payloads.some((payload) => !payload.errors || payload.errors.length === 0);
              if (firstError && !hasPayloadWithoutErrors) {
                await chrome.storage.local.set({ [STORAGE_KEYS.IMPORT_STATUS]: { state: "error", message: firstError.message } });
                return;
              }
              const session = parseImportedSession(payloads);
              if (!session) {
                await chrome.storage.local.set({ [STORAGE_KEYS.IMPORT_STATUS]: { state: "error", message: "No shot data found for this activity" } });
                return;
              }
              await chrome.storage.local.set({ [STORAGE_KEYS.TRACKMAN_DATA]: session });
              await saveSessionToHistory(session);
              await chrome.storage.local.set({ [STORAGE_KEYS.IMPORT_STATUS]: { state: "success" } });
              console.log("TrackPull: Session imported successfully:", session.report_id);
            } catch (err) {
              console.error("TrackPull: Import failed:", err);
              await chrome.storage.local.set({ [STORAGE_KEYS.IMPORT_STATUS]: { state: "error", message: "Import failed \u2014 try again" } });
            }
          })();
          return false;
        }
        if (message.type === RUNTIME_MESSAGE_TYPES.SAVE_BULK_IMPORTED_SESSION) {
          const { jobId, activityId, graphqlPayloads } = message;
          (async () => {
            try {
              const firstError = graphqlPayloads.find((payload) => payload.errors && payload.errors.length > 0)?.errors?.[0];
              const hasPayloadWithoutErrors = graphqlPayloads.some((payload) => !payload.errors || payload.errors.length === 0);
              if (firstError && !hasPayloadWithoutErrors) {
                sendResponse({ success: false, error: firstError.message });
                return;
              }
              const session = parseImportedSession(graphqlPayloads);
              if (!session) {
                sendResponse({ success: false, error: "No shot data found for this activity" });
                return;
              }
              await saveSessionToHistory(session);
              await putBulkImportedSession(jobId, activityId, session);
              const shotCount = session.club_groups.reduce(
                (total, club) => total + club.shots.length,
                0
              );
              sendResponse({
                success: true,
                reportId: session.report_id,
                shotCount
              });
            } catch (err) {
              console.error("TrackPull: Bulk import item failed:", err);
              sendResponse({ success: false, error: "Import failed \u2014 try again" });
            }
          })();
          return true;
        }
        if (message.type === RUNTIME_MESSAGE_TYPES.SAVE_ARCHIVE_EXPORTED_SESSION) {
          const { jobId, activityId, graphqlPayloads } = message;
          (async () => {
            try {
              const firstError = graphqlPayloads.find((payload) => payload.errors && payload.errors.length > 0)?.errors?.[0];
              const hasPayloadWithoutErrors = graphqlPayloads.some((payload) => !payload.errors || payload.errors.length === 0);
              if (firstError && !hasPayloadWithoutErrors) {
                sendResponse({ success: false, error: firstError.message });
                return;
              }
              const session = parseImportedSession(graphqlPayloads);
              if (!session) {
                sendResponse({ success: false, error: "No shot data found for this activity" });
                return;
              }
              await putArchiveExportSession(jobId, activityId, session);
              const shotCount = session.club_groups.reduce(
                (total, club) => total + club.shots.length,
                0
              );
              sendResponse({
                success: true,
                reportId: session.report_id,
                shotCount
              });
            } catch (err) {
              console.error("TrackPull: Archive export item failed:", err);
              sendResponse({ success: false, error: "Archive export failed \u2014 try again" });
            }
          })();
          return true;
        }
      });
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local" && changes[STORAGE_KEYS.TRACKMAN_DATA]) {
          const newValue = changes[STORAGE_KEYS.TRACKMAN_DATA].newValue;
          chrome.runtime.sendMessage({ type: RUNTIME_MESSAGE_TYPES.DATA_UPDATED, data: newValue }).catch(() => {
          });
        }
      });
    }
  });
  require_serviceWorker();
})();
