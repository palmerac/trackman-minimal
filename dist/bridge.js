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

  // src/shared/runtime_messages.ts
  function isRecord(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }
  function isStringRecord(value) {
    return isRecord(value) && Object.values(value).every((entry) => typeof entry === "string");
  }
  function isMinimalClubGroup(value) {
    if (!isRecord(value)) return false;
    return typeof value.club_name === "string" && Array.isArray(value.shots) && isRecord(value.averages) && isRecord(value.consistency);
  }
  function isMinimalSessionData(value) {
    if (!isRecord(value)) return false;
    return typeof value.date === "string" && typeof value.report_id === "string" && (value.url_type === "report" || value.url_type === "activity") && Array.isArray(value.club_groups) && value.club_groups.every(isMinimalClubGroup) && Array.isArray(value.metric_names) && value.metric_names.every((metric) => typeof metric === "string") && isStringRecord(value.metadata_params);
  }
  function isTrackmanShotDataWindowMessage(value) {
    if (!isRecord(value)) return false;
    return value.source === WINDOW_MESSAGE_SOURCES.REPORT_INTERCEPTOR && value.type === WINDOW_MESSAGE_TYPES.TRACKMAN_SHOT_DATA && isMinimalSessionData(value.data);
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
  var REPORT_PAGE_ORIGIN, RUNTIME_MESSAGE_TYPES, WINDOW_MESSAGE_SOURCES, WINDOW_MESSAGE_TYPES;
  var init_runtime_messages = __esm({
    "src/shared/runtime_messages.ts"() {
      "use strict";
      REPORT_PAGE_ORIGIN = "https://web-dynamic-reports.trackmangolf.com";
      RUNTIME_MESSAGE_TYPES = {
        SAVE_DATA: "SAVE_DATA",
        EXPORT_CSV_REQUEST: "EXPORT_CSV_REQUEST",
        SAVE_IMPORTED_SESSION: "SAVE_IMPORTED_SESSION",
        SAVE_BULK_IMPORTED_SESSION: "SAVE_BULK_IMPORTED_SESSION",
        PORTAL_GRAPHQL_FETCH: "PORTAL_GRAPHQL_FETCH",
        HISTORY_ERROR: "HISTORY_ERROR",
        DATA_UPDATED: "DATA_UPDATED"
      };
      WINDOW_MESSAGE_SOURCES = {
        REPORT_INTERCEPTOR: "trackpull-interceptor"
      };
      WINDOW_MESSAGE_TYPES = {
        TRACKMAN_SHOT_DATA: "TRACKMAN_SHOT_DATA"
      };
    }
  });

  // src/content/bridge.ts
  var require_bridge = __commonJS({
    "src/content/bridge.ts"() {
      init_runtime_messages();
      window.addEventListener("message", (event) => {
        if (event.source !== window) return;
        if (!isAllowedReportOrigin(event.origin)) return;
        if (!isTrackmanShotDataWindowMessage(event.data)) return;
        console.log("TrackPull bridge: forwarding shot data to service worker");
        chrome.runtime.sendMessage(
          { type: RUNTIME_MESSAGE_TYPES.SAVE_DATA, data: event.data.data },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("TrackPull bridge: sendMessage failed:", chrome.runtime.lastError.message);
            } else {
              console.log("TrackPull bridge: data saved", response);
            }
          }
        );
      });
      console.log("TrackPull: bridge content script loaded");
    }
  });
  require_bridge();
})();
